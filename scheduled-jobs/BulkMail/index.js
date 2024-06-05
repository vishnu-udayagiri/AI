const express = require('express');
const app = express();

const { createHanaClient } = require("./model/db");

const queries = require('./model/queries');

const { getUniqueIDs } = require('./controller/id.sorter.controller');
const { establishConenction, sendEmailWithPDF } = require('./controller/email.controller');
const cron = require('node-cron');

const PORT = process.env.PORT || 4005
const HOST = process.env.DOWNLOAD_HOST || ""

const xsenv = require('@sap/xsenv');
xsenv.loadEnv("./default-env.json");

//Define the number of Invoices to be fetched in one go
const countInvoices = process.env.countInvoices;


async function main(client) {
  try {
    console.time(`${countInvoices} records processed`);
    // let client = await createHanaClient();
    let records = await client.exec(queries.getInvoiceDetails(countInvoices));
    let pdfsSent = 0, emailsSent = 0;
    let uniqueIDs = getUniqueIDs(records);

    //get All Necessary Emails
    let adminEmails = await client.exec(queries.getAdminEmails(uniqueIDs.filter(x => x.adminEmails).map(x => x.ID)));
    let sbrEmails = await client.exec(queries.getSbrEmails(uniqueIDs.filter(x => x.sbrEmails).map(x => x.ID)));
    let companyEmails = await client.exec(queries.getCompanyEmails(uniqueIDs.filter(x => x.companyEmails).map(x => x.ID)));

    let transporter;
    try {
      transporter = establishConenction(process.env);
    }
    catch (Ex) {
      console.log(Ex)
    }

    // Update Database with base64 PDF
    for (let i = 0; i < uniqueIDs.length; i++) {

      //Get list of Email Ids
      uniqueIDs[i].EMAILS = [...companyEmails.filter(x => x.ID == uniqueIDs[i].ID).map(x => x.EMAIL),
      ...sbrEmails.filter(x => x.ID == uniqueIDs[i].ID).map(x => x.EMAIL),
      ...adminEmails.filter(x => x.COMPANYCODE == uniqueIDs[i].COMPANYNAME).map(x => x.EMAIL.split(','))]

      uniqueIDs[i].FILE = records[i].FILE;
      try {
        if (uniqueIDs[i].EMAILS.length != 0) {
          await sendEmailWithPDF(uniqueIDs[i].FILE, uniqueIDs[i].customerName, uniqueIDs[i].EMAILS, `Invoice-${uniqueIDs[i].INVOICENUMBER}`, transporter)
          await client.exec(queries.updateEmailStatusOfInvoice(uniqueIDs[i].ID));
          pdfsSent++;
          emailsSent += uniqueIDs[i].EMAILS.length;
        }
        else if (uniqueIDs[i].companyEmails == true && uniqueIDs[i].sbrEmails == true && uniqueIDs[i].adminEmails == true && uniqueIDs[i].EMAILS.length == 0)
          await client.exec(queries.updateEmailStatusOfInvoice(uniqueIDs[i].ID));

        //update document status in INVOICE DOUMENT TABLE
        await client.exec(queries.updateDocumentEmailStatus(uniqueIDs[i].ID));

        //update emails
        if (sbrEmails.filter(x => x.ID == uniqueIDs[i].ID).map(x => x.EMAIL).length > 0)
          await client.exec(queries.updateEmails(uniqueIDs[i].ID, 'SBREMAILS', sbrEmails.filter(x => x.ID == uniqueIDs[i].ID).map(x => x.EMAIL).join(',')));
        if (adminEmails.filter(x => x.ID == uniqueIDs[i].ID).map(x => x.EMAIL).length > 0)
          await client.exec(queries.updateEmails(uniqueIDs[i].ID, 'ADMINEMAILS', adminEmails.filter(x => x.ID == uniqueIDs[i].ID).map(x => x.EMAIL).join(',')));
        if (companyEmails.filter(x => x.ID == uniqueIDs[i].ID).map(x => x.EMAIL).length > 0)
          await client.exec(queries.updateEmails(uniqueIDs[i].ID, 'COMPANYEMAILS', companyEmails.filter(x => x.ID == uniqueIDs[i].ID).map(x => x.EMAIL).join(',')));

      }
      catch (err) {
        console.error(`Invoice ${uniqueIDs[i].ID} not mailed because: ${err.message}. Invoice Details: ${JSON.stringify(uniqueIDs[i])}`)
        await client.exec(queries.updateDocumentEmailStatus(uniqueIDs[i].ID));
        await client.exec(queries.updateErrors(uniqueIDs[i].ID, err.message));
      }
    }

    // Update Status of INVOICE RECORD in DB
    console.log(`${pdfsSent} PDFs sent to ${emailsSent} mail accounts`);

    console.timeEnd(`${countInvoices} records processed`);

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
    cron.schedule('*/15 * * * *', async () => {
      await main(client);
    });
  }
}

mainWrapper()

app.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
})
