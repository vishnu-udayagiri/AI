const cds = require('@sap/cds');
const moment = require('moment');
const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

const { Storage } = require('@google-cloud/storage');
const invoiceStructureMaker = require('./controllers/invoice.structuremaker.controller');
const invoicePreProcessor = require('./controllers/invoice.preprocessor.controller');
const invoiceMaker = require('./controllers/invoice.maker.controller');
const invoice2Pdf = require('./controllers/pdf.maker.controller');
const archiver = require('archiver');

const { documentHistory } = cds.entities
function replaceOrPush(array, n, newElement) {
    if (n === -1) {
        // If n is -1, push the new element to the array
        array.push(newElement);
    } else if (n >= 0 && n < array.length) {
        // If n is a valid index, replace the element at that index
        array[n] = newElement;
    } else {
        // Handle the case where n is out of bounds
        console.error('Invalid index:', n);
    }

    return array;
}

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
            var invoicePDFs = [];
            const tx = cds.transaction(req);
            let invoiceIds = req.data.invoices.map(x => x.ID);

            let query = `SELECT DOCUMENTHISTORY.INVOICENUMBER AS INVOICENUMBER,SECTIONTYPE,FILE FROM DOCUMENTHISTORY 
            LEFT JOIN ARCHIVEDDOCUMENTS ON ARCHIVEDDOCUMENTS.INVOICENUMBER=DOCUMENTHISTORY.INVOICENUMBER
            WHERE ID IN ('${invoiceIds.join("', '")}')`
       

            //Execute the above query and Store it in a variable
            let _allInvoices = await tx.run(query);
            invoicePDFs = _allInvoices.filter(x => x.FILE != null).map(x => ({ INVOICENUMBER: x.INVOICENUMBER, FILE: x.FILE }));

            b2cInvoices = _allInvoices.filter(x => x.FILE == null && x.SECTIONTYPE == 'B2C');
            b2bInvoices = _allInvoices.filter(x => x.FILE == null && x.SECTIONTYPE == 'B2B');
            if (b2cInvoices.length == 1) {
                query = `SELECT 
                INV.ID,
                INV.TICKETNUMBER,
                INV.PASSENGERGSTIN,
                INV.INVOICEDATE,
                INV.INVOICENUMBER,
                INV.PRIMARYDOCUMENTNBR AS TRANSACTIONCODE,
                INV.SECTIONTYPE,
                INV.IATANUMBER,
                INV.FULLROUTING,
                INV.PLACEOFSUPPLY,
                INV.NETTAXABLEVALUE AS INVOICENETTAXABLE,
                INV.PASSANGERNAME,
                INV.GSTVALUE AS TAXTOTAL,
                INV.PASSANGERNAME,
                INV.ADDRESSOFTHECORPORATE AS BILLTOFULLADDRESS,
                INV.STATECODE AS BILLTOSTATECODE,
                INV.AIGSTINNO AS SUPPLIERGSTIN,
                INV.TAXINVOICETYPE,
                INV.SECTIONTYPE,
                INV.DOCUMENTTYPECODE AS TRANSACTIONTYPE,
                    COALESCE(INV.TAXAMOUNT1, 0) * CASE WHEN INV.TAX1 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT2, 0) * CASE WHEN INV.TAX2 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT3, 0) * CASE WHEN INV.TAX3 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT4, 0) * CASE WHEN INV.TAX4 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT5, 0) * CASE WHEN INV.TAX5 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT6, 0) * CASE WHEN INV.TAX6 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT7, 0) * CASE WHEN INV.TAX7 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT8, 0) * CASE WHEN INV.TAX8 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT9, 0) * CASE WHEN INV.TAX9 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT10, 0) * CASE WHEN INV.TAX10 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT11, 0) * CASE WHEN INV.TAX11 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT12, 0) * CASE WHEN INV.TAX12 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT13, 0) * CASE WHEN INV.TAX13 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT14, 0) * CASE WHEN INV.TAX14 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT15, 0) * CASE WHEN INV.TAX15 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT16, 0) * CASE WHEN INV.TAX16 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT17, 0) * CASE WHEN INV.TAX17 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT18, 0) * CASE WHEN INV.TAX18 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT19, 0) * CASE WHEN INV.TAX19 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT20, 0) * CASE WHEN INV.TAX20 IN ('YQ', 'YR') THEN 1 ELSE 0 END AS TAXABLECALCULATION,

                    COALESCE(INV.TAXAMOUNT1, 0) * CASE WHEN INV.TAX1 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT2, 0) * CASE WHEN INV.TAX2 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT3, 0) * CASE WHEN INV.TAX3 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT4, 0) * CASE WHEN INV.TAX4 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT5, 0) * CASE WHEN INV.TAX5 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT6, 0) * CASE WHEN INV.TAX6 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT7, 0) * CASE WHEN INV.TAX7 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT8, 0) * CASE WHEN INV.TAX8 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT9, 0) * CASE WHEN INV.TAX9 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT10, 0) * CASE WHEN INV.TAX10 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT11, 0) * CASE WHEN INV.TAX11 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT12, 0) * CASE WHEN INV.TAX12 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT13, 0) * CASE WHEN INV.TAX13 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT14, 0) * CASE WHEN INV.TAX14 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT15, 0) * CASE WHEN INV.TAX15 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT16, 0) * CASE WHEN INV.TAX16 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT17, 0) * CASE WHEN INV.TAX17 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT18, 0) * CASE WHEN INV.TAX18 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT19, 0) * CASE WHEN INV.TAX19 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT20, 0) * CASE WHEN INV.TAX20 NOT IN ('YQ', 'YR') THEN 1 ELSE 0 END AS  NONTAXABLE,

                NETTAXABLEVALUE-(COALESCE(INV.TAXAMOUNT1, 0) * CASE WHEN INV.TAX1 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT2, 0) * CASE WHEN INV.TAX2 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT3, 0) * CASE WHEN INV.TAX3 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT4, 0) * CASE WHEN INV.TAX4 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT5, 0) * CASE WHEN INV.TAX5 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT6, 0) * CASE WHEN INV.TAX6 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT7, 0) * CASE WHEN INV.TAX7 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT8, 0) * CASE WHEN INV.TAX8 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT9, 0) * CASE WHEN INV.TAX9 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT10, 0) * CASE WHEN INV.TAX10 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT11, 0) * CASE WHEN INV.TAX11 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT12, 0) * CASE WHEN INV.TAX12 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT13, 0) * CASE WHEN INV.TAX13 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT14, 0) * CASE WHEN INV.TAX14 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT15, 0) * CASE WHEN INV.TAX15 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT16, 0) * CASE WHEN INV.TAX16 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT17, 0) * CASE WHEN INV.TAX17 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT18, 0) * CASE WHEN INV.TAX18 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT19, 0) * CASE WHEN INV.TAX19 IN ('YQ', 'YR') THEN 1 ELSE 0 END +
                    COALESCE(INV.TAXAMOUNT20, 0) * CASE WHEN INV.TAX20 IN ('YQ', 'YR') THEN 1 ELSE 0 END ) -DISCOUNT AS VALUEOFSERVICE,
                INV.HSNCODE,
                INV.DISCOUNT,
                INV.NETTAXABLEVALUE,
                INV.CGSTRATE,
                INV.SGSTRATE,
                INV.UTGSTRATE,
                INV.UTGSTRATE AS UGSTRATE,
                INV.IGSTRATE,
                INV.SGSTAMOUNT AS COLLECTEDSGST,
                INV.CGSTAMOUNT AS COLLECTEDCGST,
                INV.UTGSTAMOUNT AS COLLECTEDUTGST,
                INV.IGSTAMOUNT AS COLLECTEDIGST,
                CASE 
                    WHEN INV.ACQUISITIONTYPE ='S' THEN 'FIRST_ISSUE'
                    WHEN INV.ACQUISITIONTYPE ='E' THEN 'REISSUE'
                    ELSE 'REFUND'
                    END AS ISSUEINDICATOR,
                INV.PLACEOOFEMBARKATION,
                ACD.ADDRESS AS AIRPORTCODES_ADDRESS,
                CMP.DESCRIPTION AS COMPANY_DESCRIPTION,
                CGA.ADDRESS AS COMPANYGSTIN_ADDRESS,
                COALESCE(InSig.signaturefile, null) AS SIGNATORY,
                COALESCE(InSig.MIMETYPE, null) AS MIMETYPE,
                INV.invoicedate,
                InSig.ValidFrom,
                InSig.ValidTill,
                INV.COMPANY,
                InSig.Company
                FROM
                DOCUMENTHISTORY AS INV
                INNER JOIN AIRPORTCODES AS ACD ON ACD.COMPANY=INV.COMPANY AND ACD.AIRPORTCODE=INV.PLACEOOFEMBARKATION
                INNER JOIN COMPANY AS CMP ON CMP.CODE=INV.COMPANY
                LEFT OUTER JOIN COMPANYGSTINADRESSES AS CGA ON CGA.GSTIN=INV.PASSENGERGSTIN 
                LEFT JOIN InvoiceSignatory AS InSig
                    ON INV.COMPANY = InSig.COMPANY
                        AND COALESCE(InSig.ValidTill, '9999-12-31') >= INV.invoicedate
                        AND InSig.ValidFrom IN
                        (Select MAX(ValidFrom) from  InvoiceSignatory as IM
                        WHERE IM.Company = INV.Company
                        AND IM.ValidFrom <= INV.invoicedate
                        AND COALESCE(InSig.ValidTill, '9999-12-31') >= INV.invoicedate )
                WHERE INV.INVOICENUMBER='${b2cInvoices[0].INVOICENUMBER}'`;

                b2cInvoices = await tx.run(query);


                console.time(`Invoice Grouping of ${b2cInvoices.length} records completed in`);

                const mapper = require('./files/mapper.json');

                let lineItemFieldNames = Object.keys(mapper.ItemList[0]).reduce((result, key) => {
                    const values = mapper.ItemList[0][key].value;
                    return result.concat(values);
                }, []);

                // _allInvoices.filter(x => x.FILE == null).forEach(invoiceSet => {
                //     //New Invoice
                // let invoiceIndex = outputExcelValue.indexOf(invoiceSet['ID']);
                // delete invoiceSet['ID'];

                let outputExcelValue = { ItemList: [] }, lineItemElement = {};
                b2cInvoices.forEach((invoiceSet, idx) => {
                    b2cInvoices[idx].SIGNATORY = `data:${invoiceSet.MIMETYPE};base64,${invoiceSet.SIGNATORY}`;
                    Object.keys(invoiceSet).forEach(invoiceField => {
                        //Check if line item, else update invoice
                        if (lineItemFieldNames.indexOf(invoiceField) != -1)
                            lineItemElement[invoiceField] = invoiceSet[invoiceField];
                        else if (idx == 0)
                            outputExcelValue[invoiceField] = invoiceSet[invoiceField]
                    })
                    outputExcelValue.ItemList.push(lineItemElement);
                });
                console.timeEnd(`Invoice Grouping of ${b2cInvoices.length} records completed in`);

                let preProcessedInvoice = invoicePreProcessor(outputExcelValue)
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
                            invoicePDFs.push({ INVOICENUMBER: b2cInvoices[0].INVOICENUMBER, FILE: response.data.body });
                            tx.run(`INSERT INTO ARCHIVEDDOCUMENTS (INVOICENUMBER, FILE)
                                    VALUES('${b2cInvoices[0].INVOICENUMBER}','${response.data.body}')`);

                        }
                    }, (error) => {
                        console.log(error);
                    })

            }

            else if (b2cInvoices.length > 1)
                return req.error(500, "Multiple B2C Invoices not pre-generated. Generate them individually");

            // invoicePDFs.concat(_allInvoices.filter(x => x.B2BFILE != null).map(x => ({ INVOICENUMBER: x.INVOICENUMBER, FILE: x.B2BFILE })));
            // console.time(`Invoice Grouping of ${_allInvoices.length} records completed in`);
            // const mapper = require('./files/mapper.json');
            // let lineItemFieldNames = Object.keys(mapper.ItemList[0]).reduce((result, key) => {
            //     const values = mapper.ItemList[0][key].value;
            //     return result.concat(values);
            // }, []);
            // let outputExcelValue = [];
            // _allInvoices.filter(x => x.FILE == null).forEach(invoiceSet => {
            //     //New Invoice
            //     let invoiceIndex = outputExcelValue.indexOf(invoiceSet['ID']);
            //     // delete invoiceSet['ID'];

            //     let invoiceElement = invoiceIndex == -1 ? { ItemList: [] } : outputExcelValue[invoiceIndex],
            //         lineItemElement = {};

            //     Object.keys(invoiceSet).forEach(invoiceField => {
            //         //Check if line item, else update invoice
            //         if (lineItemFieldNames.indexOf(invoiceField) == -1) {
            //             if (invoiceIndex == -1)
            //                 invoiceElement[invoiceField] = invoiceSet[invoiceField];
            //         }
            //         else {
            //             lineItemElement[invoiceField] = invoiceSet[invoiceField];
            //         }

            //     })

            //     invoiceElement.ItemList.push(lineItemElement);
            //     replaceOrPush(outputExcelValue, invoiceIndex, invoiceElement);

            // });
            // console.timeEnd(`Invoice Grouping of ${_allInvoices.length} records completed in`);

            // for (let invoice of outputExcelValue) {
            //     if (invoice.SECTIONTYPE == 'B2C') {
            //         if (invoice.hasOwnProperty('SIGNATORY') && invoice.SIGNATORY.length > 0)
            //             invoice.SIGNATORY = `data:` + invoice.MIMETYPE + `;base64,` + invoice.SIGNATORY;
            //         let i = 1;
            //         if (req.data.hasOwnProperty('isCancelled') && req.body.isCancelled) {
            //             invoice.isCancelled = "true";
            //         } else {
            //             invoice.isCancelled = "false";
            //         }

            //         invoice = convertKeysToUppercase(invoice)
            //         if (invoice.ITEMLIST.length == 0)
            //             throw new Error("PDF of Invoice not generated as line item data missing in the Table");
            //         invoice.ItemList = invoice.ITEMLIST;


            //         let preProcessedInvoice = invoicePreProcessor(invoice)
            //         let invoiceStructure = invoiceStructureMaker([preProcessedInvoice]);
            //         let invoiceInHtml = invoiceMaker(invoiceStructure[0], 'srv/files/Invoice.html');

            //         const encodedData = btoa(invoiceInHtml);
            //         const url = 'https://t0gzgvghh8.execute-api.ap-south-1.amazonaws.com/html_pdf',
            //             data = {
            //                 HtmlString: encodedData
            //             }
            //         await axios.post(url, data)
            //             .then((response) => {
            //                 if (response.data.statusCode === '200') {
            //                     invoicePDFs.push({ INVOICENUMBER: invoice.INVOICENUMBER, FILE: response.data.body });

            //                     tx.run(`INSERT INTO InvoiceDocuments (INVOICE_COMPANY, INVOICE_ID, DOCUMENTSLNO, FILENAME, FILE)
            //                         VALUES('${invoice.COMPANY}','${invoice.ID}', ${i + 1}, 'Invoice-${invoice.INVOICENUMBER}', '${response.data.body}')`);
            //                 }
            //                 console.log(response);
            //             }, (error) => {
            //                 console.log(error);
            //             });
            //     }
            // }
            if (invoicePDFs.length == 0 && req.data.invoices.length < 2){
                console.log(_allInvoices[0].INVOICENUMBER,"_allInvoices[0].INVOICENUMBER");
               

                const privateKeyDataString = Buffer.from( process.env.base64EncodedPrivateKeyData, 'base64').toString('utf-8');
                const privateKeyData = JSON.parse(privateKeyDataString);
                const storage = new Storage({
                  projectId: process.env.projectId,
                  credentials: {
                      client_email:privateKeyData.client_email,
                      private_key: privateKeyData.private_key
                  }
                });
                
                const bucket = storage.bucket(process.env.bucket);
                    let base64EncodedFile 
                    let outValue
                    function extractYearAndMonth(fileName) {
                      const year = fileName.substr(2, 2); 
                      const month = fileName.substr(8, 2); 
                      return [20 + year, month];
                    }
                  
                   
                    
                      try {
                     
                          try{
                         
                          let fileName = `${_allInvoices[0].INVOICENUMBER}.pdf`;
                          const [year, month] = extractYearAndMonth(fileName); 
                    const yearFolder = `${year}`;
                    const monthFolder = `${month}`.padStart(2, '0');
                
                    const file = bucket.file(`${yearFolder}/${monthFolder}/${fileName}`);
                
                
                    const tempFilePath = path.join(__dirname, fileName);
                    const options = { destination: tempFilePath };
                     await file.download(options);
                    console.log(`File ${fileName} downloaded to ${tempFilePath}`);
                
                    
                    const fileContent = fs.readFileSync(tempFilePath);
                     base64EncodedFile = fileContent.toString('base64');
                 
                        
                          setTimeout(() => {
                            fs.unlink(tempFilePath, (err) => {
                              if (err) {
                                console.error(`Error deleting file ${fileName}: ${err}`);
                                return;
                              }
                              console.log(`File ${fileName} deleted successfully.`);
                            });
                          }, 20000);
                          invoicePDFs.push({ INVOICENUMBER: _allInvoices[0].INVOICENUMBER, FILE: base64EncodedFile });
                          return   JSON.stringify([
                            Object.fromEntries(
                                Object.entries(invoicePDFs[0]).map(([key, value]) => [
                                    key === 'INVOICENUMBER' ? 'invoiceNumber' : (key === 'FILE' ? 'invoice' : key),
                                    value
                                ])
                            )
                        ])
                    
                    }
                          catch(e){
                           console.log(e);
                          }
                    
                    
                      }
                
                      catch (e) {
                      console.log(e);
                      }
                
                
                    
                   
                    //await mailInvoice(outvalue)
                  
                
                return req.error(500, "No Invoices found for the record(s)");
            
            
            }
            if ( b2bInvoices.length >= 2) {
                try {
                    const privateKeyDataString = Buffer.from(process.env.base64EncodedPrivateKeyData, 'base64').toString('utf-8');
                    const privateKeyData = JSON.parse(privateKeyDataString);
                    const storage = new Storage({
                        projectId: process.env.projectId,
                        credentials: {
                            client_email: privateKeyData.client_email,
                            private_key: privateKeyData.private_key
                        }
                    });
            
                    const bucket = storage.bucket(process.env.bucket);
                     // Define array to store results
            
                    function extractYearAndMonth(fileName) {
                        const year = fileName.substr(2, 2);
                        const month = fileName.substr(8, 2);
                        return [20 + year, month];
                    }
            
                    // Use Promise.all to wait for all asynchronous tasks to complete
                    await Promise.all(b2bInvoices.map(async (invoice) => {
                        try {
                            const fileName = `${invoice.INVOICENUMBER}.pdf`;
                            const [year, month] = extractYearAndMonth(fileName);
                            const yearFolder = `${year}`;
                            const monthFolder = `${month}`.padStart(2, '0');
            
                            const file = bucket.file(`${yearFolder}/${monthFolder}/${fileName}`);
            
                            const tempFilePath = path.join(__dirname, fileName);
                            const options = { destination: tempFilePath };
                            await file.download(options);
                            console.log(`File ${fileName} downloaded to ${tempFilePath}`);
            
                            const fileContent = fs.readFileSync(tempFilePath);
                            const base64EncodedFile = fileContent.toString('base64');
            
                            setTimeout(() => {
                                fs.unlink(tempFilePath, (err) => {
                                    if (err) {
                                        console.error(`Error deleting file ${fileName}: ${err}`);
                                        return;
                                    }
                                    console.log(`File ${fileName} deleted successfully.`);
                                });
                            }, 20000);
            
                            invoicePDFs.push({ INVOICENUMBER: invoice.INVOICENUMBER, FILE: base64EncodedFile });
                        } catch (error) {
                            console.error(`Error processing invoice ${invoice.INVOICENUMBER}: ${error}`);
                        }
                    }));
            
                    return JSON.stringify({
                        invoiceNumber: {
                            generated: invoicePDFs.map(x => x.INVOICENUMBER),
                            notGenerated: b2bInvoices.filter(invoice => !invoicePDFs.some(pdf => pdf.INVOICENUMBER === invoice.INVOICENUMBER))
                                .map(invoice => invoice.INVOICENUMBER)
                        },
                        invoice: await zipPdfFiles(invoicePDFs)
                    });
                } catch (error) {
                    console.error("An error occurred:", error);
                    // Handle any other errors
                    return JSON.stringify({ error: "An error occurred" });
                }
            }
            

            return req.data.invoices.length == 1 ?
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
            // const tx = cds.transaction(req);
            // invoiceIds = invoiceIds.map(x => x.ID);
            // var invoicePDFs = [];

            // /**GET Invoice Data */

            // let _allInvoices = await tx.run(
            //     SELECT.from(documentHistory)
            //         .columns((a) => {
            //             a('*');
            //         })
            //         .where({
            //             ID: invoiceIds
            //         })
            // )
            // console.log(_allInvoices);
        } catch (error) {
            req.error(500, error.message);
        }
    });

    this.on("getCSRFToken", (req) => {
        return "Token";
    });
}
