const cds = require('@sap/cds');
const moment = require('moment');
const axios = require('axios');
const invoiceStructureMaker = require('./controllers/invoice.structuremaker.controller');
const invoicePreProcessor = require('./controllers/invoice.preprocessor.controller');
const invoiceMaker = require('./controllers/invoice.maker.controller');
const invoice2Pdf = require('./controllers/pdf.maker.controller');
const archiver = require('archiver');
const { v4: uuid } = require('uuid');
const { Invoice, InvoiceItems, InvoiceDocuments, ReportGenerator } = cds.entities
const { downloadFileAsBase64, uploadFileToStorage } = require('./helpers/object.storage.helper')

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



function convertKeysToUppercase(obj) {
    if (typeof obj !== 'object' || obj === null) {
        // Base case: if the input is not an object, return it as is
        return obj;
    }

    if (Array.isArray(obj)) {
        // If the input is an array, recursively process its elements
        return obj.map(item => convertKeysToUppercase(item));
    }

    // Create a new object to store the converted keys
    const newObj = {};

    // Loop through the keys of the input object
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            // Convert the key to uppercase
            const newKey = key.toUpperCase();

            // Recursively process the value associated with the key
            const value = convertKeysToUppercase(obj[key]);

            // Add the new key and value to the new object
            newObj[newKey] = value;
        }
    }

    return newObj;
}



module.exports = function () {
    this.on("downloadInvoice", async (req) => {
        try {
            let invoiceIds = req.data.invoices;
            const tx = cds.transaction(req);
            invoiceIds = invoiceIds.map(x => x.ID);
            var invoicePDFs = [];

            /**GET Invoice Data */

            let _allInvoices = await tx.run(
                SELECT.from(Invoice)
                    .columns((a) => {
                        a('*');
                        a.InvoiceItems((b) => {
                            b('*');
                        });
                        a.InvoiceDocuments((c) => {
                            c('*');
                        });
                        a.AirportCodes((d) => {
                            d('*');
                        })
                        a.Company((e) => {
                            e('*')
                        });
                        a.CompanyGSTINAdresses((f) => {
                            f('*')
                        });
                    })
                    .where({
                        ID: invoiceIds
                    })
            )

            invoicePDFs = _allInvoices.filter(x => x.InvoiceDocuments.length > 0).map(x => ({ INVOICENUMBER: x.invoiceNumber, FILE: x.InvoiceDocuments[0].file }));

            //Get PDF From Object Store where value of 'file' is null
            for (let obj of invoicePDFs) {
                if (obj.FILE == null)
                    obj.FILE = await downloadFileAsBase64(obj.INVOICENUMBER);
            };


            for (let invoice of _allInvoices.filter(x => x.InvoiceDocuments.length == 0)) {
                let invoiceSignatory = await tx.run(`SELECT top 1 SIGNATUREFILE, MIMETYPE from  INVOICESIGNATORY AS "IS"

                WHERE "IS".Company = '${invoice.company}'
                AND "IS".ValidFrom <= '${invoice.invoiceDate}'
                AND "IS".ValidTill >= '${invoice.invoiceDate}'
                 AND "IS".ValidFrom IN
                 (Select MAX(ValidFrom) from  InvoiceSignatory AS IM
                WHERE IM.Company ='${invoice.company}'
                AND IM.ValidFrom <= '${invoice.invoiceDate}'
                AND IM.ValidTill >='${invoice.invoiceDate}' ) `);
                invoice.ticketNumber = await tx.run(`select 
                case when c2.conjunctivedocumentnbr is null then i.ticketnumber
                     else i.ticketnumber || ' / ' || c2.conjunctivedocumentnbr 
                     end as ticket 
                from invoice as i
                left outer join
                   ( select distinct id, primarydocumentnbr, conjunctivedocumentnbr from coupon
                            where conjunctivedocumentnbr != primarydocumentnbr ) as c2
                on c2.id = i.documentid
                where i.ticketnumber in (${invoice.ticketNumber})
                order by i.id;`);
                invoice.ticketNumber = invoice.ticketNumber[0].TICKET;
                if (invoiceSignatory.length > 0 && invoiceSignatory[0].hasOwnProperty('SIGNATUREFILE'))
                    invoice.SIGNATORY = `data:` + invoiceSignatory[0].MIMETYPE + `;base64,` + invoiceSignatory[0].SIGNATUREFILE;
                let i = 1;
                if (req.data.hasOwnProperty('isCancelled') && req.body.isCancelled) {
                    invoice.isCancelled = "true";
                } else {
                    invoice.isCancelled = "false";
                }
                invoice.InvoiceItems.forEach((lineItem, index) => {
                    invoice.InvoiceItems[index].gstRate = parseFloat(lineItem.sgstRate) +
                        parseFloat(lineItem.cgstRate) +
                        parseFloat(lineItem.utgstRate) +
                        parseFloat(lineItem.igstRate);
                })
                invoice = convertKeysToUppercase(invoice)
                if (invoice.INVOICEITEMS.length == 0)
                    throw new Error("PDF of Invoice not generated as line item data missing in the Table");
                invoice.ItemList = invoice.INVOICEITEMS;
                delete invoice.INVOICEITEMS;

                let preProcessedInvoice = invoicePreProcessor(invoice)
                let invoiceStructure = invoiceStructureMaker([preProcessedInvoice]);
                let invoiceInHtml = invoiceMaker(invoiceStructure[0], 'srv/files/Invoice.html');

                const encodedData = btoa(invoiceInHtml);
                const url = 'https://t0gzgvghh8.execute-api.ap-south-1.amazonaws.com/html_pdf',
                    data = {
                        HtmlString: encodedData
                    }
                await axios.post(url, data)
                    .then((response) => {
                        if (response.data.statusCode === '200') {
                            invoicePDFs.push({ INVOICENUMBER: invoice.INVOICENUMBER, FILE: response.data.body });
                            uploadFileToStorage(response.data.body, invoice.INVOICENUMBER);
                            tx.run(`INSERT INTO InvoiceDocuments (INVOICE_COMPANY, INVOICE_ID, DOCUMENTSLNO, FILENAME)
                                    VALUES('${invoice.COMPANY_CODE}','${invoice.ID}', ${i + 1}, 'Invoice-${invoice.INVOICENUMBER}')`);
                        }
                        console.log(response);
                    }, (error) => {
                        console.log(error);
                    });
            }

            return invoicePDFs.length == 1 ?
                JSON.stringify([
                    Object.fromEntries(
                        Object.entries(invoicePDFs[0]).map(([key, value]) => [
                            key === 'INVOICENUMBER' ? 'invoiceNumber' : (key === 'FILE' ? 'invoice' : key),
                            value
                        ])
                    )
                ])
                :
                JSON.stringify({
                    invoiceNumber: {
                        generated: invoicePDFs.map(x => x.INVOICENUMBER),
                        notGenerated: []
                    },
                    invoice: await zipPdfFiles(invoicePDFs)
                });
        } catch (error) {
            req.error(500, error.message);
        }
    });

    this.on("getCSRFToken", (req) => {
        return "Token";
    });
    this.on("invoiceBulkDownload", async (req) => {
        try {
            const selectedFields = JSON.parse(req.data.reqData);
            //    const fieldsToMap = getExcelName(selectedFields.fieldsToMap);

            const reqFilter = {
                "from": moment(selectedFields.from).format("YYYY-MM-DD"),
                "to": moment(selectedFields.to).format("YYYY-MM-DD"),
                "supplierGSTIN": selectedFields.supplierGSTIN,
                "iataNumber": selectedFields.iataNumber
            }
            let data = {
                ID: uuid(),
                type: 'PDF',
                reqEmail: req.user.id,
                reqDateTime: new Date(),
                status: 'Pending',
                statusMessage: '',
                fileType: '',
                fileName: 'Document',
                appType: 'B2E',
                filter: JSON.stringify(reqFilter),
                tableName: 'INVOICE',
                excelColumnName: JSON.stringify(),
                isMultiple: selectedFields.isMultiple,
                fileRange: selectedFields.range ?? "0",
                jobName: selectedFields.JobName,
                orderBy: 'DocumentDate',
                dateFilterBy: 'DocumentDate'
            }

            await INSERT.into(ReportGenerator).entries(data);

            // Assuming you have a function to start the export process
            // const exportResult = await startExportProcess();

            // Assuming you have a function to send an email
            return ('Export process started in background. Please check processing tile for status.');

        } catch (error) {
            // eslint-disable-next-line no-debugger
        }


    });
}