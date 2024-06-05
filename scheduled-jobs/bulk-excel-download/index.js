const express = require('express');
const app = express();
const xsenv = require('@sap/xsenv');
const fs = require('fs-extra');
const path = require('path');
const { connectToDatabase, getDatabaseCredentials } = require('./helpers/db.connector.helper');
const { generateCSV } = require('./helpers/csv.generator.helper');
const cron = require('node-cron');
const { zipPdfFiles } = require('./helpers/utils.helper');
const { jsonToCsvAndZip, calculateDeletionTime, isBulkDownloadAllowed, downloadFilesFromObjectStore, zipFilesFromFolder } = require('./helpers/download.helper');
const { generateASPReport } = require('./helpers/asp.report.generator.helper');
const { generateJVMReport } = require('./helpers/jvm.report.helper');
xsenv.loadEnv("./default-env.json"); // load default-env.json file
let isJobRunning = false;
let isJobViaAPIRunning = false;

const PORT = process.env.PORT || 4005
const HOST = process.env.DOWNLOAD_HOST || `http://localhost:${PORT}`
const INTERVAL_IN_MINS = process.env.INTERVAL_IN_MINS || 15
// const HOST = 'https://port4005-workspaces-ws-f26jw.ap21.applicationstudio.cloud.sap/'

app.use("/download-file", express.static('download-temp'));

async function processBulkDownloads(db) {
    try {


        // const updateQuery = `UPDATE REPORTGENERATOR SET FILTER = ? WHERE ID =?`
        // await db.exec(updateQuery, [`{"gstr_month":"022024"}`, '79ea2f1e-96d0-4ed5-9dbd-5b892b5925be']);

        const query = `SELECT * FROM REPORTGENERATOR WHERE STATUS = ?`
        // const query = `SELECT * FROM REPORTGENERATOR WHERE JOBNAME = 'ASP EMD Report-April24-01-30'`
        // const query = `SELECT * FROM REPORTGENERATOR WHERE ID ='1310de95-c64b-49f4-86a0-04f37411031d'`;
        // const query = `SELECT * FROM REPORTGENERATOR WHERE ID ='0336e30c-9dbf-46c4-9d1c-b4d87fcaba5f'`;
        // const query = `SELECT * FROM REPORTGENERATOR WHERE ID ='98970eb7-5721-4eb3-a83d-b81e466a00da'`;
        // const query = `SELECT * FROM REPORTGENERATOR WHERE ID ='fe0df9d5-ea2a-4b69-b910-992d637baaed'`;
        // const pendingJobs = await db.exec(query);
        const pendingJobs = await db.exec(query, ['Pending']);
        // console.log("Pending Jobs ::",pendingJobs);

        for await (const job of pendingJobs) {
            const {FILENAME} = job;
            if(FILENAME == "ASP Report"){
               const isProcessOver = await generateASPReport(db,job);
            }else if(FILENAME == "GST JVM Report"){
                const isProcessOver = await generateJVMReport(db,job);
            }else{
                await generateCSV(db, job)
            }
        }


    } catch (error) {

        console.log("Error ::", error);

    }

    return false;

}

async function processJob(db, ID) {
    try {




        const query = `SELECT * FROM REPORTGENERATOR WHERE ID =?`;
        const pendingJobs = await db.exec(query, [ID]);

        for await (const job of pendingJobs) {
            const {FILENAME} = job;
            if(FILENAME == "ASP Report"){
               const isProcessOver = await generateASPReport(db,job);
            }else{
                await generateCSV(db, job)
            }
        }


    } catch (error) {

        console.log("Error ::", error);

    }

    return false;

}

async function main() {

    const tempDirPath = path.join(process.cwd(), 'temp');
    const downloadTempDirPath = path.join(process.cwd(), 'download-temp');
    const zipTempDirPath = path.join(process.cwd(), 'zip-temp');
    await fs.rm(tempDirPath, { recursive: true, force: true });
    await fs.rm(downloadTempDirPath, { recursive: true, force: true });
    await fs.rm(zipTempDirPath, { recursive: true, force: true });

    const services = xsenv.getServices({
        hana: { tag: 'hana' }
    });

    const db = await connectToDatabase(services.hana);

    const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ? WHERE STATUS =?`
    await db.exec(updateQuery, ['Pending', 'In-Progress']);

    try {
        fs.removeSync(path.join(process.cwd(), 'temp-asp'));
    } catch (error) {
        console.log('Failed to remove temp folder : "temp-asp"')
    }

    try {
        fs.removeSync(path.join(process.cwd(), 'temp'));
    } catch (error) {
        console.log('Failed to remove temp folder : "temp"')
    }


    try {
        fs.removeSync(path.join(process.cwd(), 'zip-temp'));
    } catch (error) {
        console.log('Failed to remove temp folder : "zip-temp"')
    }
    
    try {
        fs.removeSync(path.join(process.cwd(), 'temp-jvm'));
    } catch (error) {
        console.log('Failed to remove temp folder : "temp-jvm"')
    }
    
    isJobRunning = await processBulkDownloads(db);

    cron.schedule(`*/${INTERVAL_IN_MINS} * * * *`, async () => {
        if(!isJobRunning){
            isJobRunning = true;
            isJobRunning = await processBulkDownloads(db);
        }else{
            return;
        }
        
    });


}

main()

app.get("/initiate-download/:id", async (req, res, next) => {

    try {

        const services = xsenv.getServices({
            hana: { tag: 'hana' }
        });

        const db = await connectToDatabase(services.hana);

        const id = req.params.id;

        const searchJob = 'SELECT ID,TYPE, FILENAME, STATUS FROM REPORTGENERATOR WHERE ID = ?'
        const job = await db.exec(searchJob, [id]);

        // const squery = 'SELECT ID,TYPE, FILENAME, STATUS FROM REPORTGENERATOR WHERE STATUS = ?'
        // const sjob = await db.exec(squery,['Completed']);

        // console.table(sjob)


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

        // console.log("Query start time ::",new Date().toLocaleTimeString());

        const { ID,FILENAME } = jobDetails;
       
        const downloadFileName = `${ID}.zip`
        const downloadTempDirPath = path.join(process.cwd(), 'download-temp');
        const downloadFilePath = path.join(downloadTempDirPath, downloadFileName);

        await fs.ensureDir(downloadTempDirPath)
        await fs.ensureFile(downloadFilePath)

        const reportMap = new Map([
            ["ASP Report",'ASP'],
            ["GST JVM Report",'MJV'],
            ["GST JVM Convenience Fee Report" , 'JVM'],
            ["GST JVM Cancellation Penalty Report", 'JVM'],
            ["GST JVM Void Charges Report","JVM"]
        ])

        const type = reportMap.get(FILENAME) ?? 'Report'

        const downloadZipTempDirPath = path.join(process.cwd(), 'zip-temp','Reports',type,ID);
        await fs.ensureDir(downloadZipTempDirPath)

        const{success,message} = await downloadFilesFromObjectStore(type,ID, downloadZipTempDirPath)

        if(!success){
            return res.status(400).json({success,message,data:null})
        }

        const isFilesZipped = (await zipFilesFromFolder(downloadZipTempDirPath,ID)).success

        if (isFilesZipped) {

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
                    endpoint: `${HOST?.endsWith('/')?HOST:`${HOST}/`}download-file/${downloadFileName}`,
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

app.get("/task/start",async (req,res,next)=>{
    try {

        const {ID} = req?.query

        if(!ID){
            return res.status(200).json({
                success:false,
                message:'Job id is required.'
            })
        }

        if(isJobViaAPIRunning) {
            return res.status(200).json({
                success:false,
                isJobRunning:isJobViaAPIRunning,
                message:'Job is already running. Please try again later.'
            })
        }

        const services = xsenv.getServices({
            hana: { tag: 'hana' }
        });
    
        const db = await connectToDatabase(services.hana);

        const query = `SELECT * FROM REPORTGENERATOR WHERE ID =?`;
        const pendingJobs = await db.exec(query, [ID]);

        if(pendingJobs?.length == 0){
            return res.status(404).json({
                success:false,
                message:'Job not found.'
            })
        }

        const job = pendingJobs[0];

        const {STATUS} = job;

        if(STATUS == 'Completed'){
            return res.status(200).json({
                success:false,
                message:'Job is already completed.'
            })
        }

        if(STATUS == 'In-Progress'){
            return res.status(200).json({
                success:false,
                message:'Job is already in-progress.'
            })
        }


        processJob(ID).then(result => isJobViaAPIRunning = result )

        isJobViaAPIRunning = true;

        
    } catch (error) {

        isJobViaAPIRunning = false;

        return res.status(500).json({
            success:false,
            isJobRunning:isJobViaAPIRunning,
            message:'Internal server error.'
        })  

    }
})

// app.get("/check-is-download-allowed/:id", async (req, res, next) => {

//     try {

//         const services = xsenv.getServices({
//             hana: { tag: 'hana' }
//         });

//         const db = await connectToDatabase(services.hana);

//         const id = req.params.id;

//         const searchJob = 'SELECT ID,TYPE, FILENAME, STATUS FROM REPORTGENERATOR WHERE ID = ?'
//         const job = await db.exec(searchJob, [id]);

//         if (job.length == 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'File not found',
//                 data: null,
//             })
//         }

//         const jobDetails = job[0];

//         if (jobDetails.STATUS == 'Completed') {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Job already completed. Please proceed to downloading.',
//                 data: null,
//             })
//         }

//         const { ID } = jobDetails;

//         const checkDownloadStatus = await isBulkDownloadAllowed(db, job)

//         const status = checkDownloadStatus.success?'Pending':'Error'
//         const statusCode = checkDownloadStatus.success?200:400;
//         const statusMessage = checkDownloadStatus.message

//         const updateQuery = `UPDATE REPORTGENERATOR SET STATUS = ?,STATUSMESSAGE =? WHERE ID =?`
//         await db.exec(updateQuery, [status,statusMessage, ID]);

//         res.status(statusCode).json(checkDownloadStatus)

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: 'Internal Server Error. ' + error.message,
//             data: null,
//         })
//     }

// })


app.listen(PORT, () => {
    console.log('Server listening on port ' + PORT);
})





