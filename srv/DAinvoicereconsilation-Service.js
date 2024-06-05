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
      const originalArray = [{
        "GSTR1PERIOD_1"    :  "GSTR1 Period",
        "USECASE_CAL"      :  "Usecase cal" ,
        "DOCUMENTTYPE_CAL" :  "Documenttype cal",
        "K3_DA"            :  "K3 DA"   ,
        "CP_TAX"           :  "CP TAX" ,
        "OB_TAX"           :  "OB TAX" ,
        "VOIDCHARGES_TAX"  :  "VOIDCHARGESTAX",
        "K3_INV"           :  "K3 INV"  
    }];
      const fieldsToMap = originalArray;
      const reqFilter = {
        "GSTR1PERIOD_1": selectedFields
      }
      const paramFilter = {
        "GSTR1PERIOD": selectedFields
      }
     let data = {
      ID: uuid(),
      type: 'Excel',
      reqEmail: req.user.id,
      reqDateTime: new Date(),
      status: 'Pending',
      statusMessage: '',
      fileType: '',
      fileName: 'DA INVOICE RECONCILIATION REPORT',
      appType: 'B2E',
      filter: JSON.stringify(reqFilter),
      tableName: 'DA_INV_RECON_SUM',
      excelColumnName: JSON.stringify(fieldsToMap),
      isMultiple: false,
      fileRange: selectedFields.range ?? '50000',
      jobName: selectedFields + '-DATA',
      orderBy: 'GSTR1PERIOD_1',
      dateFilterBy: 'GSTR1PERIOD_1',
      isparameterized: true,
      paramfilter :JSON.stringify(paramFilter)
      };
      await INSERT.into(ReportGenerator).entries(data);
      return 'Export process started in background. Please check processing tile for status.';

    } catch (error) {
      // eslint-disable-next-line no-debugger
    }
  });
  this.on('getCSRFToken', (req) => {
    return 'Token';
  });
};

