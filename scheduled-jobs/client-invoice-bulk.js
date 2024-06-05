const fse = require('fs-extra');
const path = require('path');
// const chokidar = require('chokidar');
const hdbext = require('@sap/hdbext');

const config = require('./config.json'); // Config file with the folder path and database credentials
const connectToDatabase = async () => {
    return new Promise((resolve, reject) => {
        hdbext.createConnection(config.hana[0].credentials, (err, client) => {
            if (err) {
                reject(err);
            } else {
                resolve(client);
            }
        });
    });
};


function zipPdfFiles(inputFiles) {
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

const convertPDFToBase64 = async (filePath) => {
    const fileContent = await fse.readFile(filePath);
    return fileContent.toString('base64');
};




function fetchData() {
    let query = `SELECT "FILTER" FROM REPORTGENERATOR WHERE
    TYPE='PDF' AND STATUS IN( 'pending', 'Pending');`
    return new Promise((res, rej) => {
        connectToDatabase().then(client => {
            let queryOut = client.exec(query);
            for (let filter of queryOut) {
                filter.FILTER = filter.FILTER.replace(/iataCode/g, 'iataNumber');
                filter = JSON.parse(filter.FILTER);
                let whereConditions = [];
                ['supplierGSTIN', 'iataNumber'].forEach(field => {
                    if (field in filter)
                        whereConditions.push(`${field.toUpperCase()}='${filter[field]}'`);
                })
                query = `SELECT FILE,INVOICE.INVOICENUMBER FROM INVOICEDOCUMENTS
                            INNER JOIN INVOICE ON INVOICEDOCUMENTS.INVOICE_ID=INVOICE.ID
                            WHERE ${whereConditions.join(' AND ')} 
                            AND INVOICEDATE>='${filter.from}' AND INVOICEDATE<='${filter.to}'`;
                let invoiceFiles = client.exec(query);

                const promises=[];
                const chunkSize = 1000; // Number of records per chunk
                // Split the array into chunks
                for (let i = 0; i < invoiceFiles.length; i += chunkSize) {
                    const chunk = invoiceFiles.slice(i, i + chunkSize);
                    zipPdfFiles(chunk)
                        .then(result => {
                            // Handle the result if needed
                            promises.push(result);
                            console.log(result);
                        })
                        .catch(error => {
                            // Handle the error if needed
                            console.error(error);
                        });
                }

                console.log(fileRecords);
            }
            res(queryOut)
        })
            .catch(err => rej(err))
    });
}

fetchData().then(log => console.log('Data fetched')).catch(ex => console.log(ex));

const insertData = async (client, invoiceNumber, base64Data) => {
    let updateSql = 'UPDATE ArchivedDocuments SET File = ? WHERE InvoiceNumber = ?';
    let result = await client.exec(updateSql, [base64Data, invoiceNumber]);

    if (result === 0) {
        let insertSql = 'INSERT INTO ArchivedDocuments (InvoiceNumber, File) VALUES (?, ?)';
        await client.exec(insertSql, [invoiceNumber, base64Data], (err) => {
            if (err) {
                console.error('Error executing insert:', err);
                return;
            }
            console.log(`Inserted ${invoiceNumber} into the database.`);
            console.log("File processing completed at ", new Date().toLocaleTimeString());

        });
    } else {
        console.log(`Updated ${invoiceNumber} in the database.`);
        console.log("File processing completed at ", new Date().toLocaleTimeString());

    }
};


const processFile = async (client, filePath) => {
    try {

        const invoiceNumber = path.basename(filePath, '.pdf');
        const base64Data = await convertPDFToBase64(filePath);
        await insertData(client, invoiceNumber, base64Data);
    } catch (err) {
        console.error('Error processing file:', err);
    }
};


const watchFolder = async (folderPath) => {

    fse.ensureDirSync(folderPath);
    const client = await connectToDatabase();

    const watcher = chokidar.watch(folderPath, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true
    });

    console.log("Starting watcher at", new Date().toLocaleTimeString());

    watcher.on('add', filePath => {
        if (path.extname(filePath) === '.pdf') {
            console.log(`New file detected: ${filePath}`);
            processFile(client, filePath);
        }
    });
};


// Start watching the folder
// watchFolder(config.folderPath);