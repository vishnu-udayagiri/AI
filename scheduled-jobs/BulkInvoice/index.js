const express = require('express');
const app = express();
const fs = require('fs');
const { createHanaClient } = require("./model/db");
const invoicePreProcessor = require('./controller/invoice.preprocessor.controller');
const invoiceGrouper = require('./controller/invoice.grouper');
const invoiceStructureMaker = require('./controller/invoice.structuremaker.controller');
const queries = require('./model/queries');
const invoiceMaker = require('./controller/invoice.maker.controller');
const pdfMaker = require('./controller/invoice.pdf.maker.controller');
const { getUniqueIDs } = require('./controller/id.sorter.controller');
const { establishConenction, sendEmailWithPDF } = require('./controller/email.controller');

const cron = require('node-cron');

const PORT = process.env.PORT || 4005
const HOST = process.env.DOWNLOAD_HOST || ""

const xsenv = require('@sap/xsenv');
xsenv.loadEnv("./default-env.json");

//Define the number of Invoices to be fetched in one go
const countInvoices = process.env.countInvoices;
//Define the number of Lambdas to be fired concurrently (Upper limit is 1000)
const concurrentLambdas = process.env.concurrentLambdas;

const { uploadFileToStorage } = require('./controller/object.storage.helper');
async function main(client) {
  try {
    let bulkGeneratorFlag = await client.exec(queries.getJobEnabledStatus(process.env.client));
    if (bulkGeneratorFlag[0].ISBULKINVOICEENABLED) {
      console.time(`${countInvoices} records generated and stored in `);
      // let client = await createHanaClient();
      let records = await client.exec(queries.getInvoiceDetails(countInvoices));
      records.forEach((record, idx) => {
        records[idx].SIGNATORY = `data:${record.MIMETYPE};base64,${record.SIGNATUREFILE}`;
      })
      let uniqueIDs = getUniqueIDs(records);
      let lastID = records[records.length - 1].ID;
      let nextRecord = await client.exec(queries.nextRecord(lastID));
      let lastIdCount = records.filter(x => x.ID == lastID).length;

      //get All Necessary Emails
      let adminEmails = await client.exec(queries.getAdminEmails(uniqueIDs.filter(x => x.adminEmails).map(x => x.ID)));
      let sbrEmails = await client.exec(queries.getSbrEmails(uniqueIDs.filter(x => x.sbrEmails).map(x => x.ID)));
      let companyEmails = await client.exec(queries.getCompanyEmails(uniqueIDs.filter(x => x.companyEmails).map(x => x.ID)));

      // Add extra row(s) in case there are more line items to the last row ID
      if (lastIdCount != nextRecord[0].COUNT)
        records = records.concat(await client.exec(queries.getLastNRows(lastIdCount - nextRecord[0].COUNT, countInvoices)));

      // Group and make Invoice HTMLs
      records = invoiceGrouper(records);
      records.forEach((record, index) => {
        records[index] = invoicePreProcessor(record);
      });
      records = invoiceStructureMaker(records);
      // Get Invoice format in variable Note:(Use synchronous. Otherwise Asynchronous calls may render error)
      let Invoice = fs.readFileSync('./files/Invoice.html', 'utf8');
      records.forEach((record, index) => {
        records[index] = invoiceMaker(record, Invoice);
      });

      // Get PDF Output
      records = await pdfMaker(records, 'https://t0gzgvghh8.execute-api.ap-south-1.amazonaws.com/html_pdf', concurrentLambdas);

      // Update Database with base64 PDF
      for (let i = 0; i < uniqueIDs.length; i++) {

        //Get list of Email Ids
        uniqueIDs[i].EMAILS = [...companyEmails.filter(x => x.ID == uniqueIDs[i].ID).map(x => x.EMAIL),
        ...sbrEmails.filter(x => x.ID == uniqueIDs[i].ID).map(x => x.EMAIL),
        ...adminEmails.filter(x => x.COMPANYCODE == uniqueIDs[i].COMPANYNAME).map(x => x.EMAIL.split(','))]


        if (records[i].statusCode == '200') {
          try {
            //update file in ObjectStore
            if (await uploadFileToStorage(records[i].body, uniqueIDs[i].INVOICENUMBER)) {
              await client.exec(queries.upsertInvoicePdf(uniqueIDs[i]));
              await client.exec(queries.updateStatusOfInvoice(uniqueIDs[i].ID));
            }
          }
          catch (err) {
            delete uniqueIDs[i].FILE;
            console.error(`Invoice ${uniqueIDs[i].ID} not uploded because: ${err.message}. Invoice Details: ${JSON.stringify(uniqueIDs[i])}`)
          }
        }
      }

      let transporter;
      try {
        transporter = establishConenction(process.env);
      }
      catch (Ex) {
        console.log(Ex)
      }
      for (let i = 0; i < uniqueIDs.length; i++)
        try {
          if (uniqueIDs[i].EMAILS.length != 0) {
            await sendEmailWithPDF(uniqueIDs[i].FILE, uniqueIDs[i].customerName, uniqueIDs[i].EMAILS, `Invoice-${uniqueIDs[i].INVOICENUMBER}`, transporter)
            await client.exec(queries.updateEmailStatusOfInvoice(uniqueIDs[i].ID));
          }
        }
        catch (err) {
          console.error(`Invoice ${uniqueIDs[i].ID} not uploded because: ${err.message}. Invoice Details: ${JSON.stringify(uniqueIDs[i])}`)
        }

      // Update Status of INVOICE RECORD in DB

      console.timeEnd(`${countInvoices} records generated and stored in `);
    }
    else
      console.log(`Bulk Invoice Generation disabled. Flag ISBULKINVOICEENABLED is disabled in APPCONFIG ${bulkGeneratorFlag}`);
  } catch (err) {
    console.log("Issue reported by Programmer:", err.message, err.stack);
    if (client) {
      client.close(); // Close the client connection in case of failure
    }
    throw err; // Re-throw the error to be caught by the wrapper function
  }
}

async function mainWrapper() {
  try {
    const services = xsenv.getServices({
      hana: { tag: 'hana' }
    });
    let client = await createHanaClient(services.hana);
    await main(client);
    cron.schedule('*/15 * * * *', async () => {
      await main(client);
    });
  } catch (err) {
    console.log("Issue reported by Programmer:", err.message, err.stack);
    // Restart main after a delay (e.g., 5 seconds)
    cron.schedule('0 * * * *', async () => {
      await main(client);
    });
  }
}

mainWrapper()

app.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
})
