const cds = require('@sap/cds');
const moment = require('moment');
const axios = require('axios');
const archiver = require('archiver');
const { v4: uuid } = require('uuid');

const { ASPFILINGDATES } = cds.entities;

module.exports = function () {
  this.on('Create', async (req) => {
    try {
      const selectedFields = JSON.parse(req.data.fields);
      let data = {
        MONTH: selectedFields.month,
        YEAR: selectedFields.year,
        ARA_PERIOD_CLOSING_DATE: selectedFields.prdcldate,
        GST_APP_PERIOD_CLOSING_DATE: selectedFields.gstprdclddt,
        GST_APP_PROCESSING_PERIOD: selectedFields.gstptocprd,
        // ISCLOSED : is_clsd,
        // CLOSED_BY : req.user.id,
        // CLOSED_on :  new Date()
      };
      await INSERT.into(ASPFILINGDATES).entries(data);
      return 'created.';

      // Assuming you have a function to start the export process
      // const exportResult = await startExportProcess();

      // Assuming you have a function to send an email
    } catch (error) {
      return 'Duplicates found.';
    }
  });

  this.on('Edit', async (req) => {
    try {
      const selectedFields = JSON.parse(req.data.fields);
      //   let data = {
      //     MONTH: selectedFields.month,
      //     YEAR: selectedFields.year,
      //     ARA_PERIOD_CLOSING_DATE: selectedFields.prdcldate,
      //     GST_APP_PERIOD_CLOSING_DATE: selectedFields.gstprdclddt,
      //     GST_APP_PROCESSING_PERIOD: selectedFields.gstptocprd,
      //     ISCLOSED: 1,
      //     CLOSED_BY: req.user.id,
      //     CLOSED_on: new Date(),
      //   };
      if (selectedFields.iscld == false) {
        await UPDATE('ASPFILINGDATES')
          .set({
            ARA_PERIOD_CLOSING_DATE: selectedFields.prdcldate,
            GST_APP_PERIOD_CLOSING_DATE: selectedFields.gstprdclddt,
            GST_APP_PROCESSING_PERIOD: selectedFields.gstptocprd,
          })
          .where({
            MONTH: selectedFields.month,
            YEAR: selectedFields.year,
          });
        return 'Updated.';
      } else {
        const time = new Date();
       await UPDATE('ASPFILINGDATES')
          .set({
            ARA_PERIOD_CLOSING_DATE: selectedFields.prdcldate,
            GST_APP_PERIOD_CLOSING_DATE: selectedFields.gstprdclddt,
            GST_APP_PROCESSING_PERIOD: selectedFields.gstptocprd,
            ISCLOSED: 1,
            CLOSED_BY : req.user.id,
            CLOSED_ON : time,
          })
          .where({
            MONTH: selectedFields.month,
            YEAR: selectedFields.year,
          });
        return 'Updated.';
      }

      // Assuming you have a function to start the export process
      // const exportResult = await startExportProcess();

      // Assuming you have a function to send an email
    } catch (error) {
      return 'Duplicates found.';
    }
  });

  this.on('getCSRFToken', (req) => {
    return 'Token';
  });
};
