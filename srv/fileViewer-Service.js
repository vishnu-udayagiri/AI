const cds = require('@sap/cds');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const { generateNextSerialNumber } = require('./utils/generator');
const axios = require('axios');


const JSZip = require('jszip');
const { encode, decode } = require('base64-arraybuffer');
const archiver = require('archiver');
const { PassThrough } = require('stream');



const HOST = process.env.DOWNLOAD_HOST || "";
const HOST_PDF = process.env.HOST_PDF || "";
// const HOST = "http://localhost:4005/"


module.exports = function () {


    this.on("getReportDetails", async (req) => {
        try {
            const tx = cds.transaction(req);
            const userEmail = req.user.id;
            // const userEmail = 'nakhil.a@ivldsp.com';
            const reportDetails = await tx.run(`SELECT *, 
                                                        CASE WHEN status = 'Completed' THEN true ELSE false END as isCompleted 
                                                FROM REPORTGENERATOR 
                                                WHERE reqEmail = '${userEmail}' AND APPTYPE = 'B2E'`);

            // Extract distinct values for each filter
            const distinctStatus = [...new Set(reportDetails.map(item => item.STATUS))];
            const distinctFilename = [...new Set(reportDetails.map(item => item.FILENAME))];
            const distinctJobname = [...new Set(reportDetails.map(item => item.JOBNAME))];

            // Create the JavaScript response
            const filters = {
                STATUS: distinctStatus,
                FILENAME: distinctFilename,
                JOBNAME: distinctJobname,
            };

            return {
                data: {
                    reportDetails: reportDetails,
                    filters: filters
                },
                msg: "Report Downloaded Successfully"
            }
        } catch (error) {
            req.error(500, error.message);
        }
    });


    this.on("ReportDownloader", async (req) => {
        try {
            const tx = cds.transaction(req);
            const ID = req.data.ID;
            const reportGenerator = await tx.run(`SELECT * FROM REPORTGENERATOR WHERE ID = '${ID}'`);
            // const reportBatchFiles = await tx.run(`SELECT * FROM REPORTBATCHFILES WHERE ID = '${ID}'`);
            let data;
            if (reportGenerator[0].TYPE == 'PDF') {
                /**
                 * TODO : 
                 * Download generated File 
                 * response =  {
                                    isZip: true,
                                    type: "data:application/zip;base64,",
                                    file: zipToBase64,
                                    fileName: reportGenerator[0].FILENAME
                                }
                 */
                const response = await axios.get(`${HOST_PDF}initiate-download/${ID}`);
                data = { ...response.data.data }
            } else {
                const response = await axios.get(`${HOST}initiate-download/${ID}`);
                data = { ...response.data.data }
            }
            return {
                data: data,
                msg: "Report Downloaded Successfully"
            }
        } catch (error) {
            req.error(500, error.message);
        }
    });
}
