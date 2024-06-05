const express = require('express');
const app = express();
const xsenv = require('@sap/xsenv');
// xsenv.loadEnv("./default-env.json"); // load default-env.json file
const fs = require('fs-extra');
const path = require('path');
const { invoicePdf } = require('./fetchInvoicePdfs');
const { connectToDatabase } = require('./db');
const cron = require('node-cron');
const { zipPdfFiles } = require('./zipFiles');
xsenv.loadEnv('./config.json');

const PORT = process.env.PORT || 4005;



app.get("/initiate-download/:id", async (req, res, next) => {

  try {

    const services = xsenv.getServices({
      hana: { tag: 'hana' }
    });

    const db = await connectToDatabase(services.hana);

    const id = req.params.id;

    const searchJob = 'SELECT ID,TYPE, FILENAME, STATUS FROM REPORTGENERATOR WHERE ID = ?'
    const job = await db.exec(searchJob, [id]);

    if (job.length == 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
        data: null,
      })
    }

    const jobDetails = job[0];

    if (jobDetails.STATUS !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Job not completed. Please try again later.',
        data: null,
      })
    }

    console.log("Query start time ::", new Date().toLocaleTimeString());

    const { ID } = jobDetails;
    const query = 'SELECT * FROM REPORTBATCHFILES WHERE ID = ? AND TYPE = ?'
    const files = await db.exec(query, [ID, 'CSV-ZIP']);

    console.log("Query end time ::", new Date().toLocaleTimeString());


    if (files.length == 0) {
      return res.status(400).json({
        success: false,
        message: 'Zip file not generated. Please contact your administrator.',
        data: null,
      })
    };


    const file = files[0].FILE

    const downloadTempDirPath = path.join(process.cwd(), 'download-temp');
    const downloadFileName = `${ID}.zip`
    const downloadFilePath = path.join(downloadTempDirPath, downloadFileName);

    await fs.ensureDir(downloadTempDirPath)
    await fs.ensureFile(downloadFilePath)


    try {
      const fileBuffer = Buffer.from(file, 'base64');
      fs.writeFile(downloadFilePath, fileBuffer)
    } catch (error) {
      console.log(error);
    }

    const result = fs.existsSync(downloadFilePath)

    if (result) {

      const deletionTime = await calculateDeletionTime(downloadFilePath);

      setTimeout(() => {
        if (fs.existsSync(downloadFilePath)) {
          fs.unlinkSync(downloadFilePath);
        }

      }, deletionTime.time);

      return res.status(200).json({
        success: true,
        message: 'Zip file generated successfully.',
        data: {
          id: ID,
          endpoint: `${HOST}download-file/${downloadFileName}`,
          expiry: deletionTime.text
        }
      })
    }

    return res.status(400).json({
      success: false,
      message: 'Zip file generation failed.',
      data: null,
    })


  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Internal Server Error. ' + error.message,
      data: null,
    })

  }



})



async function main() {
  const services = xsenv.getServices({
    hana: { tag: 'hana' },
  });

  const client = await connectToDatabase(services.hana);

  const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ? WHERE STATUS =?`;
  await client.exec(updateQuery, ['Pending', 'In-Progress']);

  cron.schedule('*/5 * * * *', async () => {
    let invoices = await invoicePdf(client);
    if (invoices.length > 0)
      zipPdfFiles(invoices).then((response) => {
        query = `INSERT INTO ReportBatchFiles (ID,SlNo,TYPE,FILE)
        VALUES ('${record.id}','1','application/zip','${response}')`;
        client.exec(query);
        query = `UPDATE REPORTGENERATOR
        SET STATUS = 'Completed'
        WHERE ID = ${record.id}`;
        client.exec(query);
      });
    else console.log('Records Not Found');
  });
}
main()
  .then((res) => console.log(res))
  .catch((error) => console.log(error.stack));
// try {
//   main();
// } catch (Ex) {
//   console.log(Ex);
//   console.log(Ex.stack);
// }
app.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
});
