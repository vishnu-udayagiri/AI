const express = require('express');
const xsenv = require('@sap/xsenv');
const cron = require('node-cron');
let isJobRunning = false;
let isQ1JobRunning = false;
let isQ2JobRunning = false;
let isQ3JobRunning = false;

xsenv.loadEnv('./default-env.json'); // load default-env.json file

// require('./API-Verification.js');
const { validateGSTIN } = require('./API-Validation/API-Validation.js');
const { RunGSTINValidationTask, RunErrorGSTINValidationTask, RunGSTINValidationTaskForGSTIN } = require('./API-Verification.js');
const app = express();

app.get('/', (req, res) => {
  res.send('Automated task server up and running');
});

app.get('/task/start', (req, res) => {
  RunGSTINValidationTask()
  res.send('Automated task server up and running');
});

app.get('/validate', async (req, res) => {
  try {
    const { gstin } = req.query;
    const gstinData = await validateGSTIN(gstin);
    return res.status(200).json(gstinData);
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/validate-gstin", async(req, res) => {

  try {
    const { gstin } = req.query;
    const status = await RunGSTINValidationTaskForGSTIN(gstin);
    return res.status(200).json({success:status});
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
})

const PORT = process.env.PORT || 4008;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const interval = process.env.EXEC_INTERVAL || 30;
const Q1Time = process.env.Q1_EXEC_INTERVAL || 11;
const Q2Time = process.env.Q2_EXEC_INTERVAL || 13;
const Q3Time = process.env.Q3_EXEC_INTERVAL || 16;

console.log(`>> Normal Cron job will run in every ${interval} minutes`);
console.log(`>> Q1 Error Handler Cron job will run at ${Q1Time}:00`);
console.log(`>> Q2 Error Handler Cron job will run at ${Q2Time}:00`);
console.log(`>> Q3 Error Handler Cron job will run at ${Q3Time}:00`);

cron.schedule(`*/${interval} * * * *`, async () => {
  console.log('Cron running')
  console.log(`Is Job Running? : ${isJobRunning}`);
  if(!isJobRunning){
    isJobRunning = true;
    isJobRunning = await RunGSTINValidationTask()
  }else{
    return;
  }
});


cron.schedule(`0  0 ${Q1Time} * * *`, async () => {
  console.log('Cron running')
  console.log(`Is Q1 Job Running? : ${isQ1JobRunning}`);
  if(!isQ1JobRunning){
    isQ1JobRunning = true;
    isQ1JobRunning = await RunErrorGSTINValidationTask('Q1','Q2');
  }else{
    return;
  }
});


cron.schedule(`0  0 ${Q2Time} * * *`, async () => {
  console.log('Cron running')
  console.log(`Is Q2 Job Running? : ${isQ2JobRunning}`);
  if(!isQ2JobRunning){
    isQ2JobRunning = true;
    isQ2JobRunning = await RunErrorGSTINValidationTask('Q2','Q3');
  }else{
    return;
  }
});


cron.schedule(`0  0 ${Q3Time} * * *`, async () => {
  console.log('Cron running')
  console.log(`Is Q3 Job Running? : ${isQ3JobRunning}`);
  if(!isQ3JobRunning){
    isQ3JobRunning = true;
    isQ3JobRunning = await RunErrorGSTINValidationTask('Q3','E');
  }else{
    return;
  }
});

app.get('/task/startQ1', (req, res) => {
  RunErrorGSTINValidationTask('Q1','Q2');
  res.send('Q1 started running...');
});

app.get('/task/startQ2', (req, res) => {
  RunErrorGSTINValidationTask('Q2','Q3');
  res.send('Automated task server up and running');
});

app.get('/task/startQ2', (req, res) => {
  RunErrorGSTINValidationTask('Q3','E');
  res.send('Automated task server up and running');
});

