const fs = require('fs-extra');
const path = require('path');
const fastcsv = require('fast-csv');
const archiver = require('archiver');
const { Storage } = require('@google-cloud/storage');

const MAX_ROWS_PERFILE = 1_00_000;
const MAX_ROWS_PERFILE_FOR_ASP = 40_000;
const MAX_ROWS = 8_00_000;
const MAX_ROWS_PERFILE_FOR_JVM = 50_000;

exports.getMaximumRowsPerFile = (rows) => {
    rows = rows ?? MAX_ROWS_PERFILE;
    const rowNumber = parseInt(rows)
    return isNaN(rowNumber) || rowNumber == 0 ? MAX_ROWS_PERFILE : rowNumber
}

exports.getMaximumRowsPerFileForASP = (rows) => {
    rows = rows ?? MAX_ROWS_PERFILE_FOR_ASP;
    const rowNumber = parseInt(rows)
    return isNaN(rowNumber) || rowNumber == 0 ? MAX_ROWS_PERFILE_FOR_ASP : rowNumber
}

exports.getMaximumRowsToDownload = () =>{
    return MAX_ROWS;
}

exports.convertStringToJSON = (filterString) => {

    if (!filterString) {
        return {};
    }
    try {
        return JSON.parse(filterString);
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return {};
    }
}

exports.getFiscalYearBounds = (date) => {
    let fiscalYearStart, fiscalYearEnd;
    if (date.getMonth() < 3) {
        fiscalYearStart = new Date(date.getFullYear() - 1, 3, 1);
        fiscalYearEnd = new Date(date.getFullYear(), 2, 31);
    } else {
        fiscalYearStart = new Date(date.getFullYear(), 3, 1);
        fiscalYearEnd = new Date(date.getFullYear() + 1, 2, 31);
    }
    return {
        start: fiscalYearStart,
        end: fiscalYearEnd,
    };
};

exports.getFinancialYearDates = (year) => {

    try {
        year = Number(year);
    } catch (error) {
        const currentYear = new Date().getFullYear();
        return {
            start: new Date(currentYear, 3, 1),
            stop: new Date(currentYear + 1, 2, 31)
        };
    }

    if (typeof year !== 'number' || year < 1900 || year > 9999) {
        return {
            start: new Date(0),
            stop: new Date(0)
        };
    }

    let startYear, endYear;

    if (year === 0) {
        startYear = year - 1;
        endYear = year;
    } else {
        startYear = year;
        endYear = year + 1;
    }

    return {
        start: new Date(startYear, 3, 1),
        stop: new Date(endYear, 2, 31)
    };
}

exports.jsonToCSV = async (jsonArray, columns, tempFileName,ID) => {
    console.log('Writing to csv with ' + jsonArray.length + ' entries');


    const tempDirPath = path.join(process.cwd(),'temp',ID);
    const tempFilePath = path.join(tempDirPath,tempFileName);
    await fs.ensureDir(tempDirPath);
    await fs.ensureFile(tempFilePath);
    const writeStream = fs.createWriteStream(tempFilePath);
    const csvStream = fastcsv.format({ headers: true, quoteColumns: true, rowDelimiter:'\r\n'  });

    await new Promise((resolve, reject) => {
        csvStream.pipe(writeStream)
            .on('finish', () => {
                console.log('CSV file has been written.');
                resolve();
            })
            .on('error', (err) => {
                console.error('An error occurred:', err);
                reject(err);
            });

        jsonArray.forEach(row => {
            const newRow = {};
            Object.keys(columns).forEach(key => {
                newRow[columns[key]] = row[key] || ''; // Use empty string if key doesn't exist
            });
            csvStream.write(newRow);
        });

        csvStream.end();
    });
};

exports.jsonToCSVCustomPath = async (jsonArray, columns, tempFilePath,delimiter = ',') => {

    return new Promise(async (resolve, reject) => {

        console.log('Writing to csv with ' + jsonArray.length + ' entries');

        await fs.ensureFile(tempFilePath);
        const writeStream = fs.createWriteStream(tempFilePath);
        const csvStream = fastcsv.format({ headers: true,quoteColumns: true, rowDelimiter:'\r\n' , delimiter:delimiter});
    

        csvStream.pipe(writeStream)
            .on('finish', () => {
                console.log('CSV file has been written.');
                resolve(true);
            })
            .on('error', (err) => {
                console.error('An error occurred:', err);
                reject(false);
            });

        jsonArray.forEach(row => {
            const newRow = {};
            Object.keys(columns).forEach(key => {
                newRow[columns[key]] = row[key] || ''; // Use empty string if key doesn't exist
            });
            csvStream.write(newRow);
        });

        csvStream.end();
    });
};

exports.mergeJsonObjects = (inputJson) => {

    if (inputJson === null || inputJson === undefined) {
        return {};
    }

    if (!Array.isArray(inputJson)) {
        return inputJson;
    }

    return inputJson.reduce((accumulator, currentObject) => {
        return {...accumulator, ...currentObject};
    }, {});
}

exports.zipPdfFiles = (inputFiles) => {
    return new Promise((resolve, reject) => {
        try {
            const archive = archiver('zip', { zlib: { level: 9 } });
            const chunks = [];

            // Listen for all archive data to be written
            archive.on('data', (chunk) => {
                chunks.push(chunk);
            });

            // Once the archive is finalized, resolve with the Base64-encoded string
            archive.on('end', () => {
                const result = Buffer.concat(chunks).toString('base64');
                resolve(result);
            });

            // Handle errors
            archive.on('error', (err) => {
                reject(err);
            });

            // Iterate through input PDF files
            for (const inputFile of inputFiles) {
                const pdfBuffer = Buffer.from(inputFile.FILE, 'base64');

                // Get the base name of the file without the extension
                const fileName = `Invoice -${inputFile.INVOICENUMBER}`

                // Append the PDF file to the archive with a specific name
                archive.append(pdfBuffer, { name: `${fileName}.pdf` });
            }

            // Finalize the archive
            archive.finalize();
        } catch (error) {
            reject(error);
        }
    });
}

exports.uploadFilesToObjectStore = async (folderPath, reportType, uniqueId) => {

    const privateKeyDataString = Buffer.from(process.env.FILE_STORE_PRIVATE_KEY, 'base64').toString('utf-8');
    const privateKeyData = JSON.parse(privateKeyDataString);
    const storage = new Storage({
        projectId: process.env.FILE_STORE_PROJECT_ID,
        credentials: {
            client_email: privateKeyData.client_email,
            private_key: privateKeyData.private_key
        }
    });

    const bucket = storage.bucket(process.env.FILE_STORE_BUCKET);

    await fs.ensureDir(folderPath);
    const files = await fs.readdir(folderPath);

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const destination = path.join('Reports',reportType, uniqueId,file)
        const result = await bucket.upload(filePath, {
            destination: destination,
            gzip: true,
            metadata: {
                cacheControl: 'public, max-age=31536000'
            }
        });

        console.log("File uploaded successfully ::",result);
    }

    


}

exports.convertToPlaceholderFormat=(obj) => {

    if (Object.keys(obj).length === 0) {
        return ''; 
    }

    const key = Object.keys(obj)[0];
    let value = obj[key];

    value = value != null ? value.toString() : '';

    return `(placeholder."$$${key}$$" => '${value}')`;
}

exports.normalizeKey=(key) =>{
    return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

exports.getMaximumRowsPerFileForJVM = (rows) => {
    rows = rows ?? MAX_ROWS_PERFILE_FOR_JVM;
    const rowNumber = parseInt(rows)
    return isNaN(rowNumber) || rowNumber == 0 ? MAX_ROWS_PERFILE_FOR_JVM : rowNumber
}