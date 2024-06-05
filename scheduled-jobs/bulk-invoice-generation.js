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