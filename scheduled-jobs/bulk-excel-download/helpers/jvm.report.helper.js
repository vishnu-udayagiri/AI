const fs = require('fs-extra');
const path = require('path');
const { getMaximumRowsPerFileForJVM, convertStringToJSON, uploadFilesToObjectStore } = require('./utils.helper');
const { generateMJVExcelFile } = require('./jvm.report.generator.helper');
const { getData } = require('./query.helper');

exports.generateJVMReport = async(db,job) =>{

    if (!db) {
        console.log('DB connection is required')
        return true;
    }

    const { ID, FILTER, FILENAME, FILERANGE, ORDERBY, DATEFILTERBY } = job

    const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ? WHERE ID =?`
    await db.exec(updateQuery, ['In-Progress', ID]);

    const maximumRowsPerFile = getMaximumRowsPerFileForJVM(FILERANGE);
    const filters = convertStringToJSON(FILTER);

    const uniqueId = ID;
    const tempParentDirPath = path.join(process.cwd(), 'temp-jvm',uniqueId);

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

    const tempDirPath = path.join(tempParentDirPath);
    // const tempOutputPath = path.join(tempParentDirPath,`${FILENAME}_${uniqueId}.csv`)

  
    const tableName = 'MJVI_1'

    const [totalData] = (await getData(db, tableName, filters, null, null, ORDERBY, DATEFILTERBY, true)).data;
    const dataLength = Object.values(totalData??[])[0] ?? 0

    const avgiterations = (parseInt(dataLength / maximumRowsPerFile)) ?? 1;
    const iterations = avgiterations == 0 ? 1 : avgiterations + 1;

    let isError = false;

    for (i = 0; i < iterations; i++) {

        if(isError) continue;

        const tempFileName = `${FILENAME}-${i+1}.xlsx`
        const tempFilePath = path.join(tempDirPath, tempFileName);

        fs.ensureFileSync(tempFilePath);
        
        const jvmReportData = (await getData(db, tableName, filters, i + 1, maximumRowsPerFile, ORDERBY, DATEFILTERBY)).data;    

        try {

            const {success,message,data} = await generateMJVExcelFile(jvmReportData)

            try {
                fs.writeFileSync(tempFilePath,data)
            } catch (error) {
                isError = true;
                const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ?, STATUSMESSAGE =? WHERE ID =?`
                await db.exec(updateQuery, ['Error', 'Error generating MJV File :: ' + "Error generating file", ID]);
            }

            if(!success){
                isError = true;
                const isTempFileExists = fs.existsSync(tempFilePath);
                if(isTempFileExists){
                    fs.removeSync(tempFilePath);
                }

                try {
                    const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ?, STATUSMESSAGE =? WHERE ID =?`
                    await db.exec(updateQuery, ['Error', 'Error generating MJV File :: ' + "Error generating file", ID]);
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

    if(isError){
        fs.removeSync(tempParentDirPath)
        return;
    }

    try {
        await uploadFilesToObjectStore(tempParentDirPath,'MJV',uniqueId)
        
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