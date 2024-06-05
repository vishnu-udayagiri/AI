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
      const fieldsToMap = getExcelName(selectedFields.fieldsToMap);
      const reqFilter = {
        GSTR_MONTH : selectedFields.gstr1period
      };
      let data = {
        ID: uuid(),
        type: 'Excel',
        reqEmail: req.user.id,
        reqDateTime: new Date(),
        status: 'Pending',
        statusMessage: '',
        fileType: '',
        fileName: 'TCS Summary Report',
        appType: 'B2E',
        filter: JSON.stringify(reqFilter),
        tableName: 'TCSSUMMARYMAINSERVICE_TCSSUMMARYMAIN',
        excelColumnName: JSON.stringify(fieldsToMap),
        isMultiple: false,
        fileRange: selectedFields.range ?? '50000',
        jobName: selectedFields.JobName,
        orderBy: 'GSTR_MONTH',
        dateFilterBy: 'GSTR_MONTH',
      };

      await INSERT.into(ReportGenerator).entries(data);

      // Assuming you have a function to start the export process
      // const exportResult = await startExportProcess();

      // Assuming you have a function to send an email
      return 'Export process started in background. Please check processing tile for status.';
    } catch (error) {
      // error
    }
  });

  this.on('getCSRFToken', (req) => {
    return 'Token';
  });
};

function getExcelName(selectedFields) {
  const originalArray = {
    "OTA_GSTIN"  : "OTG GSTIN",
    "AIRLINE_GSTN": "Airline GSTIN",
    "IATANUMBER": "IATA Number",
    "STATE_OF_DEPOSIT"  : "State of Deposit",
    "GSTR_MONTH"  : "GSTR Month",
    "TOTAL_TICKET_VALUE": "Total Ticket Value",
    "TAXABLE"           : "Taxable ",
    "TCS_PERC_GST_VALUE": "TCS PERC GST Value",  
    "TCS_CGST"          : "TCS CGST" ,
    "TCS_SGST_UTGST"    : "TCS SGST UTGST",
    "TCS_IGST"          :" TCS IGST"   ,
    // "YEAR" : "Year",
    // "MONTH" : "Month",
    // "TRANSACTIONTYPE" : "Transaction Type",
    // "DOCUMENTTYPE"   :" Document Type",
    // "ORGINALINVOICEDATE": "Orginal Invoice Date",
    // "PS_STATENAME"      : "PS Statename",
    // "NONTAXABLE"        : "Non Taxable",

 
  };

  const newArray = selectedFields.map((field) => ({ [field]: originalArray[field] }));
  return newArray ?? [];
}
