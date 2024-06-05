const fs = require('fs-extra')
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getData } = require("./query.helper");
const {  convertStringToJSON, getMaximumRowsPerFileForASP, jsonToCSVCustomPath, uploadFilesToObjectStore } = require("./utils.helper");
const { jsonToCsvAndZip, jsonToXlsxAndZip } = require('./download.helper');
const { generateASPReportFile, getCustomHeadingsForASP } = require('./asp.report.helper');
const { mergeCsvFiles } = require('./csv.generator.helper');
// const csvtojsonV2=require("csvtojson");

exports.generateASPReport = async (db, job) => {

    if (!db) {
        console.log('DB connection is required')
        return true;
    }

    const { ID, FILTER, FILENAME, FILERANGE, ORDERBY, DATEFILTERBY } = job

    const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ? WHERE ID =?`
    await db.exec(updateQuery, ['In-Progress', ID]);

    const maximumRowsPerFile = 5000//getMaximumRowsPerFileForASP(FILERANGE);
    const filters = convertStringToJSON(FILTER);

    const types = ['INV','CRDR','B2C','B2CNEG']

    const uniqueId = ID;
    const tempParentDirPath = path.join(process.cwd(), 'temp-asp',uniqueId);

    try {
        const isTempDirExists = fs.existsSync(tempParentDirPath);
        if (isTempDirExists) {
            await fs.remove(tempParentDirPath);
        }
    } catch (error) {
        const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ? , STATUSMESSAGE =? WHERE ID =?`
        await db.exec(updateQuery, ['Error', `Error deleting tempfolder :: ${tempParentDirPath} due to ${error?.message??"Unknown reason"}`, ID]); 
        return;
    }

    const customHeadings = getCustomHeadingsForASP()

    let isError = false;

    for (const type of types) {

        if(isError) continue;

        const dateStr = ((d) => `${('0' + d.getDate()).slice(-2)}${('0' + (d.getMonth() + 1)).slice(-2)}${d.getFullYear()}`)(new Date());

        const tempDirPath = path.join(tempParentDirPath,type);
        const tempOutputPath = path.join(tempParentDirPath,`${type}_${dateStr}.csv`)

        const isB2C = ['B2C','B2CNEG'].includes(type)?true:false;

        const filter = Object.assign({},filters);
        filter["TYPE"] = type;
        const tableName = isB2C? "ASPREPORTSERVICE_ASPREPORTB2C":"ASPREPORTSERVICE_ASPREPORT"

        const [totalData] = (await getData(db, tableName, filter, null, null, ORDERBY, DATEFILTERBY, true)).data;
        const dataLength = Object.values(totalData??[])[0] ?? 0

        const avgiterations = (parseInt(dataLength / maximumRowsPerFile)) ?? 1;
        const iterations = avgiterations == 0 ? 1 : avgiterations + 1;

        for (i = 0; i < iterations; i++) {

            const tempFileName = `${type}-${i+1}.csv`
            const tempFilePath = path.join(tempDirPath, tempFileName);
            
            const data = (await getData(db, tableName, filter, i + 1, maximumRowsPerFile, ORDERBY, DATEFILTERBY)).data;    

            try {
                const excelColumns = customHeadings[type];
                const isConversionFinished = await jsonToCSVCustomPath(data, excelColumns, tempFilePath)

                if(!isConversionFinished){
                    const isTempFileExists = fs.existsSync(tempFilePath);
                    if(isTempFileExists){
                        fs.removeSync(tempFilePath);
                    }
                    isError = true;

                    try {
                        const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ?, STATUSMESSAGE =? WHERE ID =?`
                        await db.exec(updateQuery, ['Error', 'JSON TO CSV Conversion error :: ' + "Error generating file", ID]);
                    } catch (error) {
                        console.log("Error updating in database: " + error.message);
                    }

                }

            } catch (error) {
                isError = true;
                const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ?, STATUSMESSAGE =? WHERE ID =?`
                await db.exec(updateQuery, ['Error', 'JSON TO CSV Conversion error :: ' + error.message, ID]);
            }

        }

        if(!isError){
            if(dataLength == 0){
                const templatePath = path.join(process.cwd(), 'templates','ASP',`${type}_template.csv`)
                const filePath = path.join(process.cwd(), 'temp-asp',uniqueId,`${type}_${uniqueId}.csv`);
                fs.ensureFile(filePath);
                fs.copySync(templatePath,filePath)
            }else{
                const isMergeSuccessful = await mergeCsvFiles(tempDirPath,tempOutputPath,true,"|")
                if(!isMergeSuccessful) isError = true;
            }
        }

        // await uploadFilesToObjectStore(tempParentDirPath,'ASP',uniqueId)

    }

    if(isError){
        fs.removeSync(tempParentDirPath)
        return;
    }

    try {
        await uploadFilesToObjectStore(tempParentDirPath,'ASP',uniqueId)
        
        const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ?, STATUSMESSAGE =?, COMPLETEDDATETIME =CURRENT_TIMESTAMP WHERE ID =?`
        await db.exec(updateQuery, ['Completed','Process completed', ID]);

    } catch (error) {
        const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ? , STATUSMESSAGE =? WHERE ID =?`
        await db.exec(updateQuery, ['Error', `Error uploading files to Object store. Reason :: ${error?.message??"Unknown reason"}`, ID]); 
        return;
    }

    fs.removeSync(tempParentDirPath)
    return true;
}