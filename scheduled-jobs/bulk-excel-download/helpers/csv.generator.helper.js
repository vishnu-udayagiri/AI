const fs = require('fs-extra')
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fastcsv = require('fast-csv');

const { getData } = require("./query.helper");
const { getMaximumRowsPerFile, convertStringToJSON, jsonToCSV, mergeJsonObjects, uploadFilesToObjectStore } = require("./utils.helper");
const { jsonToCsvAndZip, zipFilesFromFolderAndCustomDir } = require('./download.helper');


exports.generateCSV = async (db, job) => {

    if (!db) throw new Error('DB connection is required')

    const { ID, FILTER, FILENAME, TABLENAME, EXCELCOLUMNNAME, ISMULTIPLE, FILERANGE, ORDERBY, DATEFILTERBY, ISPARAMETERIZED, PARAMFILTER } = job

    const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ? WHERE ID =?`
    await db.exec(updateQuery, ['In-Progress', ID]);

    const maximumRowsPerFile = getMaximumRowsPerFile(FILERANGE);
    const excelColumns = mergeJsonObjects(convertStringToJSON(EXCELCOLUMNNAME));
    const filters = convertStringToJSON(FILTER);

    let paramFilter = {};
    if(ISPARAMETERIZED) paramFilter = JSON.parse(PARAMFILTER )

    const [totalData] = (await getData(db, TABLENAME, filters, null, null, ORDERBY, DATEFILTERBY, true,ISPARAMETERIZED,paramFilter)).data;
    const dataLength = Object.values(totalData??[])[0] ?? 0


    if (dataLength == 0) return;

    const avgiterations = (parseInt(dataLength / maximumRowsPerFile)) ?? 1;
    const iterations = avgiterations == 0 ? 1 : avgiterations + 1;

    const uniqueId = ID;
    const tempDirPath = path.join(process.cwd(), 'temp', ID);

    for (i = 0; i < iterations; i++) {

        const { data } = await getData(db, TABLENAME, filters, i + 1, maximumRowsPerFile, ORDERBY, DATEFILTERBY,false,ISPARAMETERIZED,paramFilter)
        const tempFileName = `${FILENAME}_${uniqueId}_${i+1}.csv`

        try {
            await jsonToCSV(data, excelColumns, tempFileName,ID)
        } catch (error) {
            const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ?, STATUSMESSAGE =? WHERE ID =?`
            await db.exec(updateQuery, ['Error', 'JSON TO CSV Conversion error :: ' + error.message, ID]);
            const isTempFolderExists = fs.existsSync(tempDirPath);
            if(isTempFolderExists){
                fs.removeSync(tempDirPath);
                return;
            }
        }
    }

    try {
        
        const isTempFolderExists = await fs.exists(tempDirPath);
        
        if (isTempFolderExists) {

            const fileCount = (await fs.readdir(tempDirPath)).length;
            const outputFolderPath = path.join(process.cwd(), 'temp',`${FILENAME}-${ID}`);
            const outputFilePath = path.join(outputFolderPath,`${FILENAME}.csv`);

            if(fileCount > 0){
                const isFilesMerged = await this.mergeCsvFiles(tempDirPath,outputFilePath)

                if(!isFilesMerged){
                    const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ?, STATUSMESSAGE =? WHERE ID =?`
                    await db.exec(updateQuery, ['Error', 'Failed to merge csv files :: ' + error.message, ID]);
                    const isTempFolderExists = fs.existsSync(tempDirPath);
                    if(isTempFolderExists){
                        fs.removeSync(tempDirPath);
                    }  
                    const isOutputFolderExists = fs.existsSync(outputFolderPath);
                    if(isOutputFolderExists){
                        fs.removeSync(outputFolderPath);
                    }  
                    return;
                }

                await uploadFilesToObjectStore(outputFolderPath,'Report',ID)

                const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ?, STATUSMESSAGE =?, COMPLETEDDATETIME =CURRENT_TIMESTAMP WHERE ID =?`
                await db.exec(updateQuery, ['Completed','Process completed', ID]);

                const isTempFolderExists = fs.existsSync(tempDirPath);
                if(isTempFolderExists){
                    fs.removeSync(tempDirPath);
                }  

                const isOutputFolderExists = fs.existsSync(outputFolderPath);
                if(isOutputFolderExists){
                    fs.removeSync(outputFolderPath);
                }  

                return;


            }else{
                const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ? , STATUSMESSAGE =? WHERE ID =?`
                await db.exec(updateQuery, ['NO DATA', 'No files generated', ID]);

                const isTempFolderExists = fs.existsSync(tempDirPath);
                if(isTempFolderExists){
                    fs.removeSync(tempDirPath);
                }  
                const isOutputFolderExists = fs.existsSync(outputFolderPath);
                if(isOutputFolderExists){
                    fs.removeSync(outputFolderPath);
                }  


                return;  
            }

        }else{
            const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ? , STATUSMESSAGE =? WHERE ID =?`
            await db.exec(updateQuery, ['Error', 'Error generating file', ID]);
        }

        } catch (error) {
            console.log(error);
            const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ? , STATUSMESSAGE =? WHERE ID =?`
            await db.exec(updateQuery, ['Error', 'CSV TO BASE64 Conversion error :: ' + error.message, ID]);
            const isTempFolderExists = fs.existsSync(tempDirPath);
            if(isTempFolderExists){
                fs.removeSync(tempDirPath);
                return;
            }  
    }



}

exports.mergeCsvFiles = async (folderPath, outputFile,isSingle=false,delimiter=',') => {

    
    // if(fs.existsSync(path.dirname(outputFile))){
    //     await fs.remove(path.dirname(outputFile));
    // }
    
    await fs.ensureDir(path.dirname(outputFile));
    
    if(fs.existsSync(outputFile)){
        await fs.remove(outputFile);
    }

    if(!fs.existsSync(folderPath)){
        return false;
    }

    try {
        
        const files = await fs.readdir(folderPath);
        let mode = files.length > 5 ? 'zip':'file'

        if(isSingle) mode = 'file';

        let requireHeaders = true;
        if(mode === 'file'){
            for (const file of files) {
                if (path.extname(file) === '.csv') {
                    const filePath = path.join(folderPath, file);
                    await this.appendFileToOutput(filePath, outputFile,requireHeaders,delimiter);
                    await fs.remove(filePath)
                    requireHeaders = false;
                }
            }
        }else{
            const dir = path.dirname(outputFile)
            const fileName = path.basename(outputFile,path.extname(outputFile));
            const zipFilePath = path.join(dir, `${fileName}.zip`)
            const {success,message} = await zipFilesFromFolderAndCustomDir(folderPath,zipFilePath)
        }

        if(fs.existsSync(folderPath)){
            try {
                fs.removeSync(folderPath);
            } catch (error) {
                console.log('Failed to delete source directory:', error);
            }
        }
        return true;
    } catch (error) {

        console.error('Failed to merge CSV files:', error);

        if(fs.existsSync(folderPath)){
            try {
                fs.removeSync(folderPath);
            } catch (error) {
                console.log('Failed to delete source directory:', error);
            }
        }

        return false;
    }
}



exports.appendFileToOutput=async(filePath, outputFile,requireHeaders,delimiter=',') => {
    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(outputFile, { flags: 'a' });  // 'a' flag for appending
        const readStream = fs.createReadStream(filePath);

        const csvStream = fastcsv
            .parse({ headers: requireHeaders,skipRows:requireHeaders?0:1 })
            .transform((row, callback) => {
                callback(null, row);
            });

        const formatStream = fastcsv.format({ 
            headers: requireHeaders, 
            writeHeaders:requireHeaders,
            quoteColumns: true, 
            rowDelimiter:'\r\n',
            delimiter:delimiter,
            includeEndRowDelimiter:true
        });

        readStream
            .pipe(csvStream)
            .pipe(formatStream)
            .pipe(writeStream)
            .on('finish', resolve)
            .on('error', reject);
    });
}


