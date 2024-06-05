const cds = require('@sap/cds');
const moment = require('moment');
const axios = require('axios');
const archiver = require('archiver');
const { v4: uuid } = require('uuid');

const { ReportGenerator } = cds.entities;

module.exports = function () {
  this.on('exportAll', async (req) => {
    try {
      const selectedFields = JSON.parse(req.data.fields);
      const reqFilter = {
        "ReturnPeriod": selectedFields.gstr1period
    }
    let data = {
      ID: uuid(),
      type: 'Excel',
      reqEmail: req.user.id,
      reqDateTime: new Date(),
      status: 'Pending',
      statusMessage: '',
      fileType: '',
      fileName: 'ASP Report',
      appType: 'B2E',
      filter: JSON.stringify(reqFilter),
      tableName: 'ASPREPORTSERVICE_ASPREPORT',
      excelColumnName: JSON.stringify(),
      isMultiple: false,
      fileRange: selectedFields.range ?? '50000',
      jobName: selectedFields.JobName,
      orderBy: 'DocumentDate',
      dateFilterBy: 'ReturnPeriod',
    };
    await INSERT.into(ReportGenerator).entries(data);
    return 'Export process started in background. Please check processing tile for status.';

      // let aspfilingdata = await tx.run(`SELECT * FROM ASPFILINGDATES 
      //           WHERE MONTH = '${currentMonth}' AND YEAR = '${currentYear}'`);
      //     if(aspfilingdata.length != 0){
      //       const reqFilter = {
      //           ARA_PERIOD_CLOSING_DATE: aspfilingdata[0].ARA_PERIOD_CLOSING_DATE ,
      //           GST_APP_PERIOD_CLOSING_DATE: aspfilingdata[0].GST_APP_PERIOD_CLOSING_DATE,
      //         };
      //         let data = {
      //           ID: uuid(),
      //           type: 'Excel',
      //           reqEmail: req.user.id,
      //           reqDateTime: new Date(),
      //           status: 'Pending',
      //           statusMessage: '',
      //           fileType: '',
      //           fileName: 'ASP Report',
      //           appType: 'B2E',
      //           filter: JSON.stringify(reqFilter),
      //           tableName: 'ASPREPORTSERVICE_ASPREPORT',
      //           excelColumnName: JSON.stringify(),
      //           isMultiple: selectedFields.isMultiple,
      //           fileRange: selectedFields.range ?? '0',
      //           jobName: selectedFields.JobName,
      //           orderBy: 'DocumentDate',
      //           dateFilterBy: 'DocumentDate',
      //         };
        
      //         await INSERT.into(ReportGenerator).entries(data);
      //         return 'Export process started in background. Please check processing tile for status.';

      //     } else{
      //       return 'GST period closure Master Data is not maintained for Current month.';
      //     } 

    } catch (error) {
      // eslint-disable-next-line no-debugger
    }
  });
  this.on('getCSRFToken', (req) => {
    return 'Token';
  });
};

// function getExcelName(selectedFields) {

//     // const newArray = selectedFields.map(field => ({ [field]: originalArray[field] }));
//     // return newArray ?? [];
// }
