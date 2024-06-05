const axios = require('axios');
const archiver = require('archiver');
const invoiceStructureMaker = require('../controller/invoice.structuremaker.controller');
const invoiceMaker = require('../controller/invoice.maker.controller');
const invoicePreProcessor = require('../controller/invoice.preprocessor.controller');
const { generateResponse } = require('../libs/response');
const { addCancelledWatermark } = require('../helpers/pdf.helper');
const { encryptAesNode, decryptAesNode } = require('../controller/cryptography.controller')
const invoiceGrouper = require('../controller/invoice.grouper.controller');
const path = require('path');
const fs = require('fs-extra');
const { downloadFileAsBase64, uploadFileToStorage } = require('../helpers/object.storage.helper')
const { Storage } = require('@google-cloud/storage');



async function mailInvoice(outValue, email) {
  outValue.forEach((invoice, idx) => { });
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
        const fileName = `Invoice -${inputFile.INVOICENUMBER}`;

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

// const invoiceHtml = require('../files/Invoice.html')

exports.generateInvoiceNumber = () => {
  const truncatedTimestamp = (Date.now() % 10000000000).toString();
  const randomNumber = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  return `${truncatedTimestamp}${randomNumber}`;
};

exports.generateRequestNumber = () => {
  const truncatedTimestamp = (Date.now() % 10000000000).toString();
  const randomNumber = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  return `${randomNumber}${truncatedTimestamp}`;
};
exports.archivedInvoiceDownload = async (req, res) => {
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
    let base64EncodedFile
    let outValue
    function extractYearAndMonth(fileName) {
      const year = fileName.substr(2, 2);
      const month = fileName.substr(8, 2);
      return [20 + year, month];
    }
    let invoiceNumber
    const Ids = req.body.invoices.map((x) => x.ID);
    const query = await req.db.exec(`SELECT FILE,ARCHIVEDDOCUMENTS.INVOICENUMBER FROM ARCHIVEDDOCUMENTS
  INNER JOIN DOCUMENTHISTORY ON ARCHIVEDDOCUMENTS.INVOICENUMBER= DOCUMENTHISTORY.INVOICENUMBER
  WHERE ID IN ('${Ids.join("', '")}')`);

    if (query.length != Ids.length && Ids.length === 1) {
      try {
        req.body.invoices.map(async (x) => {
          try {
            invoiceNumber = req.db.exec(`SELECT DOCUMENTHISTORY.INVOICENUMBER FROM DOCUMENTHISTORY WHERE ID=?`, [x.ID]);
            console.log(invoiceNumber, "invoiceNumber");
            let fileName = `${invoiceNumber[0].INVOICENUMBER}.pdf`;
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

            outValue = {
              invoiceNumber: invoiceNumber[0].INVOICENUMBER,
              documentHistory: base64EncodedFile,
              invoice: base64EncodedFile
            };
            setTimeout(() => {
              fs.unlink(tempFilePath, (err) => {
                if (err) {
                  console.error(`Error deleting file ${fileName}: ${err}`);
                  return;
                }
                console.log(`File ${fileName} deleted successfully.`);
              });
            }, 10000);

            return res.status(200).send(generateResponse('Success', 'PDF generated', 'T', 'S', 'null', false, outValue));
          }
          catch (e) {
            return res.status(404).send(generateResponse('Failed', 'File(s) were not found in the database', 'B', 'E', null, true, null));
          }
        })

      }

      catch (e) {
        return res.status(404).send(generateResponse('Failed', 'File(s) were not found in the database', 'B', 'E', null, true, null));
      }


    }
    else {
      if (query.length == 1)
        outValue = {
          invoiceNumber: query[0].INVOICENUMBER,
          documentHistory: query[0].FILE,
          invoice: query[0].FILE
        };
      else {
        if (Ids.length > 1) {
          await Promise.all(req.body.invoices.map(async (x) => {
            try {
              const invoiceNumberResult = await req.db.exec(`SELECT DOCUMENTHISTORY.INVOICENUMBER FROM DOCUMENTHISTORY WHERE ID=?`, [x.ID]);
              console.log(invoiceNumberResult, "invoiceNumber");
              let fileName = `${invoiceNumberResult[0].INVOICENUMBER}.pdf`;
              const [year, month] = extractYearAndMonth(fileName);
              const yearFolder = `${year}`;
              const monthFolder = `${month}`.padStart(2, '0');

              const file = bucket.file(`${yearFolder}/${monthFolder}/${fileName}`);
              const tempFilePath = path.join(__dirname, fileName);
              const options = { destination: tempFilePath };

              await file.download(options);
              console.log(`File ${fileName} downloaded to ${tempFilePath}`);

              const fileContent = fs.readFileSync(tempFilePath);
              let base64EncodedFiles = fileContent.toString('base64');

              setTimeout(() => {
                fs.unlink(tempFilePath, (err) => {
                  if (err) {
                    console.error(`Error deleting file ${fileName}: ${err}`);
                    return;
                  }
                  console.log(`File ${fileName} deleted successfully.`);
                });
              }, 10000);

              query.push({
                INVOICENUMBER: invoiceNumberResult[0].INVOICENUMBER,
                FILE: base64EncodedFiles
              });
            } catch (e) {
              console.log(e);

            }
          }));


        }

        outValue = {
          invoiceNumber: {
            generated: query.map((x) => x.INVOICENUMBER),
            notGenerated: [],
          },
          invoice: await zipPdfFiles(query),
        };
      }

      if (!base64EncodedFile) {
        return res.status(200).send(generateResponse('Success', 'PDF generated', 'T', 'S', 'null', false, outValue))
      }
    }
  }
  catch (error) {
    return res.status(500).send(generateResponse('Failed', error.message, 'T', 'E', 'null', true, null));
  }
};
exports.downloadInvoice = async (req, res) => {
  if (!req.body.hasOwnProperty('isManualCancel')) req.body.isManualCancel = false;
  try {
    const invoiceIds = req.body.invoices;
    let airportCodes,
      companyDescription,
      generatedInvoices = [],
      invoicePDFs = [],
      invoiceSignatory;
    if (!req.body.isManualCancel) {
      let queryInvoice = `( '${invoiceIds.map((obj) => obj.ID).join("', '")}' )`;
      invoicePDFs = await req.db.exec(
        `SELECT DOCS.FILE, INV.INVOICESTATUS, INV.INVOICENUMBER, INV.ID 
            FROM INVOICE AS INV 
            LEFT JOIN INVOICEDOCUMENTS AS DOCS ON INV.ID=DOCS.INVOICE_ID 
            WHERE INV.ID IN ${queryInvoice}  OR  INV.INVOICENUMBER IN ${queryInvoice}`
      );
      generatedInvoices = invoicePDFs.filter((x) => x.FILE).map((x) => x.INVOICENUMBER);
    }
    if (generatedInvoices.length <= 1) {
      invoicePDFs = [];
      for (let invoiceId of invoiceIds) {
        var invoice = {},
          invoiceItems = [],
          invoiceDocuments = [],
          stateDetails = {},
          conjuctiveDocumentNumber = {};
        if (req.body.hasOwnProperty('isCancelled')) {
          invoice = await req.db.exec(`SELECT * FROM INVOICE WHERE INVOICENUMBER = '${invoiceId.ID}' OR ID= '${invoiceId.ID}'`);
          if (invoice.length > 0) {
            invoice = invoice[0];
            invoiceItems = await req.db.exec(`SELECT * FROM INVOICEITEMS WHERE INVOICE_ID = '${invoice.ID}'`);
            invoiceDocuments = await req.db.exec(`SELECT * FROM INVOICEDOCUMENTS WHERE INVOICE_ID = '${invoice.ID}'`);
            airportCodes = await req.db.exec(`SELECT
                CASE
                    WHEN t1.USEDFORINVOICE IS NOT NULL THEN t1.USEDFORINVOICE
                    ELSE t1.ADDRESS
                END AS AIRPORTCODES_ADDRESS
                FROM
                    AIRPORTCODES t1
                WHERE 
              COMPANY = '${invoice.COMPANY}' 
              AND AIRPORTCODE = '${invoice.AIRPORTCODE}';`);
            companyDescription = await req.db.exec(`SELECT * FROM COMPANY WHERE CODE = '${invoice.COMPANY}'`);
            CompanyGSTINAdresses = await req.db.exec(`SELECT * FROM COMPANYGSTINADRESSES WHERE GSTIN = '${invoice.PASSENGERGSTIN}'`);
            invoice.TICKETNUMBER = await req.db.exec(`select 
                        case when c2.conjunctivedocumentnbr is null then i.ticketnumber
                             else i.ticketnumber || ' / ' || c2.conjunctivedocumentnbr 
                             end as ticket 
                        from invoice as i
                        left outer join
                           ( select distinct id, primarydocumentnbr, conjunctivedocumentnbr from coupon
                                    where conjunctivedocumentnbr != primarydocumentnbr ) as c2
                        on c2.id = i.documentid
                        where i.ticketnumber in (${invoice.TICKETNUMBER})
                        order by i.id;`)[0].TICKET;

            invoiceSignatory = await req.db.exec(`SELECT top 1 SIGNATUREFILE, MIMETYPE from  INVOICESIGNATORY AS "IS"

                    WHERE "IS".Company = '${invoice.COMPANY}'
                    AND "IS".ValidFrom <= '${invoice.INVOICEDATE}'
                    AND "IS".ValidTill >= '${invoice.INVOICEDATE}'
                     AND "IS".ValidFrom IN
                     (Select MAX(ValidFrom) from  InvoiceSignatory AS IM
                    WHERE IM.Company ='${invoice.COMPANY}'
                    AND IM.ValidFrom <= '${invoice.INVOICEDATE}'
                    AND IM.ValidTill >='${invoice.INVOICEDATE}' ) `);

            // if (invoice.hasOwnProperty('PASSENGERGSTIN') && invoice.PASSENGERGSTIN.length >= 15)
            //     stateDetails = await req.db.exec(`SELECT * FROM STATECODE WHERE STATECODE = '${invoice.PASSENGERGSTIN.substring(0, 2)}'`)[0];
          }
        } else {
          invoice = await req.db.exec(`SELECT * FROM INVOICE WHERE INVOICENUMBER = '${invoiceId.ID}' OR ID= '${invoiceId.ID}'`)?.[0];
          invoiceItems = await req.db.exec(`SELECT * FROM INVOICEITEMS WHERE INVOICE_ID = '${invoice.ID}'`);
          invoiceDocuments = await req.db.exec(`SELECT * FROM INVOICEDOCUMENTS WHERE INVOICE_ID = '${invoice.ID}'`);
          airportCodes = await req.db.exec(`SELECT
          CASE
              WHEN t1.USEDFORINVOICE IS NOT NULL THEN t1.USEDFORINVOICE
              ELSE t1.ADDRESS
          END AS AIRPORTCODES_ADDRESS
          FROM
              AIRPORTCODES t1
          WHERE 
        COMPANY = '${invoice.COMPANY}' 
        AND AIRPORTCODE = '${invoice.AIRPORTCODE}';`);
          companyDescription = await req.db.exec(`SELECT * FROM COMPANY WHERE CODE = '${invoice.COMPANY}'`);
          CompanyGSTINAdresses = await req.db.exec(`SELECT * FROM COMPANYGSTINADRESSES WHERE GSTIN = '${invoice.PASSENGERGSTIN}' AND USEFORINVOICEPRINTING=true`);
          invoiceSignatory = await req.db.exec(`SELECT top 1 SIGNATUREFILE, MIMETYPE from  INVOICESIGNATORY AS "IS"

                    WHERE "IS".Company = '${invoice.COMPANY}'
                    AND "IS".ValidFrom <= '${invoice.INVOICEDATE}'
                    AND "IS".ValidTill >= '${invoice.INVOICEDATE}'
                     AND "IS".ValidFrom IN
                     (Select MAX(ValidFrom) from  InvoiceSignatory AS IM
                    WHERE IM.Company ='${invoice.COMPANY}'
                    AND IM.ValidFrom <= '${invoice.INVOICEDATE}'
                    AND IM.ValidTill >='${invoice.INVOICEDATE}' ) `);

          invoice.TICKETNUMBER = await req.db.exec(`select 
                        case when c2.conjunctivedocumentnbr is null then i.ticketnumber
                             else i.ticketnumber || ' / ' || c2.conjunctivedocumentnbr 
                             end as ticket 
                        from invoice as i
                        left outer join
                           ( select distinct id, primarydocumentnbr, conjunctivedocumentnbr from coupon
                                    where conjunctivedocumentnbr != primarydocumentnbr ) as c2
                        on c2.id = i.documentid
                        where i.ticketnumber in (${invoice.TICKETNUMBER})
                        order by i.id;`)[0].TICKET;
          // if (invoice.hasOwnProperty('PASSENGERGSTIN') && invoice.PASSENGERGSTIN.length >= 15)
          //         stateDetails = await req.db.exec(`SELECT * FROM STATECODE WHERE STATECODE = '${invoice.PASSENGERGSTIN.substring(0, 2)}'`)[0];
        }

        if (invoiceDocuments.length > 0 && !req.body.isManualCancel) {
          for (let i = 0; i < invoiceDocuments.length; i++) {
            if (invoiceDocuments[i].FILE == null)
              invoiceDocuments[i].FILE=downloadFileAsBase64(invoice.INVOICENUMBER);
          }
          if (invoice.INVOICESTATUS == 'Cancelled') {
            invoiceDocuments[0].FILE = (await addCancelledWatermark(invoiceDocuments[0].FILE)).data;
          }
          invoicePDFs.push({ INVOICENUMBER: invoice.INVOICENUMBER, FILE: invoiceDocuments[0].FILE });
        } else {
          if (req.body.hasOwnProperty('isCancelled') && req.body.isCancelled) {
            invoice.ISCANCELLED = 'true';
          } else {
            invoice.ISCANCELLED = 'false';
          }
          invoiceItems.forEach((lineItem, index) => {
            invoiceItems[index].GSTRATE = parseFloat(lineItem.SGSTRATE) + parseFloat(lineItem.CGSTRATE) + parseFloat(lineItem.UTGSTRATE) + parseFloat(lineItem.IGSTRATE);
          });
          invoice.ItemList = invoiceItems;
          invoice.AIRPORTCODES_ADDRESS = airportCodes[0].AIRPORTCODES_ADDRESS;
          invoice.COMPANY = companyDescription[0];
          invoice.COMPANYGSTINADRESSES = CompanyGSTINAdresses[0];
          if (invoiceSignatory.length > 0 && invoiceSignatory[0].hasOwnProperty('SIGNATUREFILE'))
            invoice.SIGNATORY = `data:` + invoiceSignatory[0].MIMETYPE + `;base64,` + invoiceSignatory[0].SIGNATUREFILE;
          // delete invoiceItems;
          // console.log(invoice.signatory);
          let preProcessedinvoice = invoicePreProcessor(invoice);
          let invoiceStructure = invoiceStructureMaker([preProcessedinvoice]);
          let invoiceInHtml = invoiceMaker(invoiceStructure[0], './files/Invoice.html');
          let encodedData = Buffer.from(invoiceInHtml).toString('base64');
          // encodedData = await encryptAesNode(encodedData);
          const url = 'https://t0gzgvghh8.execute-api.ap-south-1.amazonaws.com/html_pdf',
            data = {
              HtmlString: encodedData,
            };
          await axios.post(url, data).then(
            (response) => {
              if (response.data.statusCode === '200') {
                invoicePDFs.push({ INVOICENUMBER: invoice.INVOICENUMBER, FILE: response.data.body });
                uploadFileToStorage(response.data.body, invoice.INVOICENUMBER)
                req.db.exec(`INSERT INTO InvoiceDocuments (INVOICE_COMPANY, INVOICE_ID, DOCUMENTSLNO, FILENAME)
                                    VALUES('${invoice.COMPANY_CODE}','${invoice.ID}', 1, 'Invoice-${invoice.INVOICENUMBER}')`);
              }
              // console.log(response);
            },
            (error) => {
              console.log(error);
            }
          );
        }
      }
      if (req.body.isManualCancel) return { status: 'Success', message: 'Invoice cancelled successfully' };
      let outValue;
      if (invoicePDFs.length == 1)
        outValue = {
          invoiceNumber: invoicePDFs[0].INVOICENUMBER,
          invoice: invoicePDFs[0].FILE,
        };
      else
        outValue = {
          invoiceNumber: {
            generated: invoicePDFs.map((x) => x.INVOICENUMBER),
            notGenerated: [],
          },
          invoice: await zipPdfFiles(invoicePDFs),
        };
      //await mailInvoice(outvalue)
      return res.status(200).send(generateResponse('Success', 'PDF generated', 'T', 'S', 'null', false, outValue));
    } else {
      let missingInvoices = invoicePDFs.filter((x) => !x.FILE).map((x) => x.INVOICENUMBER);
      invoicePDFs = invoicePDFs.filter((x) => x.FILE);

      for (let [index, invoice] of invoicePDFs.entries()) {
        if (invoice.INVOICESTATUS == 'Cancelled') {
          invoicePDFs[index].FILE = (await addCancelledWatermark(invoice.FILE)).data;
        }
      }
      zipPdfFiles(invoicePDFs)
        .then((response) => {
          let zipPdfs = {
            invoiceNumber: {
              generated: generatedInvoices,
              notGenerated: missingInvoices,
            },
            invoice: response,
          };

          return res.status(200).send(generateResponse('Success', 'PDF generated', 'T', 'S', 'null', false, zipPdfs));
        })
        .catch((error) => {
          return res.status(500).send(generateResponse('Failed', error.message, 'T', 'E', 'null', true, null));
        });
    }
  } catch (error) {
    if (req.body.isManualCancel) return { status: 'Failed', message: 'Invoice cancellation failed' };
    return res.status(500).send(generateResponse('Failed', error.message, 'T', 'E', 'null', true, null));
  }
};

exports.downloadSingleB2CInvoice = async (req, res) => {
  try {
    const invoiceIdentifiers = Object.keys(req.body).filter(x => req.body[x] != null).map(x => `${x}= '${req.body[x]}'`).join(' AND ');
    let query = `SELECT
    INV.ID,
    INV.PNR,
    CASE 
        WHEN c2.conjunctivedocumentnbr IS NULL THEN INV.TICKETNUMBER
        ELSE INV.TICKETNUMBER || ' / ' || c2.conjunctivedocumentnbr 
    END AS TICKETNUMBER,
    INV.SUPPLIERGSTIN,
    INV.PASSENGERGSTIN,
    INV.INVOICEDATE,
    INV.INVOICENUMBER,
    INV.DOCUMENTTYPE,
    INV.SECTIONTYPE,
    INV.B2B,
    INV.IATANUMBER,
    INV.ORIGINALINVOICENUMBER,
    INV.ORGINALINVOICEDATE,
    INV.ISSUEINDICATOR,
    INV.FULLROUTING,
    INV.DIRECTIONINDICATOR,
    INV.PLACEOFSUPPLY,
    INV.TAXABLECALCULATION,
    INV.NONTAXABLECALCULATION,
    INV.NETTAXABLEVALUE AS INVOICENETTAXABLE,
    INV.TOTALTAX,
    INV.PASSANGERNAME,
    INV.BILLTONAME,
    INV.BILLTOFULLADDRESS,
    INV.TRANSACTIONCODE,
    INV.TRANSACTIONTYPE,
    INV.BILLTOSTATECODE,
    ITEM.INVOICESLNO,
    ITEM.HSNCODE,
    ITEM.VALUEOFSERVICE,
    ITEM.TAXABLE,
    ITEM.NONTAXABLE,
    ITEM.TOTALTAXABLEVALUE,
    ITEM.DISCOUNT,
    ITEM.NETTAXABLEVALUE,
    ITEM.CGSTRATE,
    ITEM.SGSTRATE,
    ITEM.UTGSTRATE,
    ITEM.IGSTRATE,
    ITEM.COLLECTEDCGST,
    ITEM.COLLECTEDSGST,
    ITEM.COLLECTEDIGST,
    ITEM.COLLECTEDUTGST,
    DOCS.FILE,
    CASE
        WHEN ACD.USEDFORINVOICE IS NOT NULL THEN ACD.USEDFORINVOICE
        ELSE ACD.ADDRESS
    END AS AIRPORTCODES_ADDRESS,
    CMP.DESCRIPTION AS COMPANY_DESCRIPTION,
    CGA.ADDRESS AS COMPANYGSTIN_ADDRESS,
    COALESCE(InSig.signaturefile, NULL) AS signaturefile,
    InSig.MIMETYPE,
    INV.invoicedate,
    InSig.ValidFrom,
    InSig.ValidTill,
    INV.COMPANY,
    InSig.Company
  FROM
    INVOICE AS INV
  INNER JOIN INVOICEITEMS AS ITEM ON ITEM.INVOICE_ID = INV.ID
  INNER JOIN AIRPORTCODES AS ACD ON ACD.COMPANY = INV.COMPANY AND ACD.AIRPORTCODE = INV.AIRPORTCODE
  INNER JOIN COMPANY AS CMP ON CMP.CODE = INV.COMPANY
  LEFT OUTER JOIN COMPANYGSTINADRESSES AS CGA ON CGA.GSTIN = INV.PASSENGERGSTIN 
  INNER JOIN InvoiceSignatory AS InSig ON INV.COMPANY = InSig.COMPANY
    AND COALESCE(InSig.ValidTill, '9999-12-31') >= INV.invoicedate
    AND InSig.ValidFrom IN (
        SELECT MAX(ValidFrom) 
        FROM InvoiceSignatory AS IM
        WHERE IM.Company = INV.Company
        AND IM.ValidFrom <= INV.invoicedate
        AND COALESCE(InSig.ValidTill, '9999-12-31') >= INV.invoicedate
    )
  LEFT OUTER JOIN (
    SELECT DISTINCT id, primarydocumentnbr, conjunctivedocumentnbr 
    FROM coupon
    WHERE conjunctivedocumentnbr != primarydocumentnbr
  ) AS c2 ON c2.id = INV.documentid
  LEFT OUTER JOIN INVOICEDOCUMENTS AS DOCS ON INV.ID=DOCS.INVOICE_ID
  WHERE  ${invoiceIdentifiers}
  ORDER BY INV.ID;`;
    let records = await req.db.exec(query);
    if (records.length > 0) {
      let invoice = {
        COMPANY_CODE: records[0].COMPANY,
        ID: records[0].ID,
        INVOICENUMBER: records[0].INVOICENUMBER
      };

      if (records[0].B2B == '1')
        return res.status(500).send(
          generateResponse('Failed',
            'This invoice belongs to a registered customer. Please login and download.',
            'B', 'E', null, true, null
          ));

      else if (records.length > 1)
        return res.status(500).send(
          generateResponse('Failed',
            'Multiple invoices found for the given combination. Aborting printing',
            'B', 'E', null, true, null
          ));

      //Give the file back if it exists
      else if (records[0].hasOwnProperty('FILE') && records[0].FILE != null)
        return res.status(200).send(
          generateResponse('Success',
            'PDF Generated',
            'T', 'S', 'null', false,
            { invoiceNumber: invoice.INVOICENUMBER, invoice: records[0].FILE }
          ));

      //Create the file if it does not exist
      records = invoiceGrouper(records);

      records.forEach((record, index) => {
        records[index].SIGNATORY = `data:${record.MIMETYPE};base64,${record.SIGNATUREFILE}`
        records[index] = invoicePreProcessor(record);
      });
      records = invoiceStructureMaker(records);
      //Get Invoice format in variable Note:(Use synchronous. Otherwise Asynchrounous calls may render error)
      records.forEach((record, index) => {
        records[index] = invoiceMaker(record, './files/Invoice.html');
      });
      //There will only be one invoice
      let invoiceInHtml = records[0];
      let invoicePdf;
      let encodedData = Buffer.from(invoiceInHtml).toString('base64');
      // encodedData = await encryptAesNode(encodedData);
      const url = 'https://t0gzgvghh8.execute-api.ap-south-1.amazonaws.com/html_pdf',
        data = {
          HtmlString: encodedData,
        };
      await axios.post(url, data).then(
        (response) => {
          if (response.data.statusCode === '200') {
            invoicePdf = { invoiceNumber: invoice.INVOICENUMBER, invoice: response.data.body };

            req.db.exec(`INSERT INTO InvoiceDocuments (INVOICE_COMPANY, INVOICE_ID, DOCUMENTSLNO, FILENAME, FILE)
                                    VALUES('${invoice.COMPANY_CODE}','${invoice.ID}', 1, 'Invoice-${invoice.INVOICENUMBER}', '${response.data.body}')`);
          }
          // console.log(response);
        },
        (error) => {
          console.log(error);
          return res.status(500).send(
            generateResponse('Failed',
              'Error generating invoice. Please try after some time',
              'B', 'E', null, true, null
            ));
        }
      );
      return res.status(200).send(
        generateResponse('Success', 'PDF Generated', 'T', 'S', 'null', false, invoicePdf));

    }
    return res.status(500).send(
      generateResponse(
        'Failed',
        'No invoices were found for the given combination',
        'B', 'E', null, true, null
      ));

  }
  catch (err) {
    return res.status(500).send(generateResponse('Failed', err.message, 'B', 'E', null, true, null));
  }
}
