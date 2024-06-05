const cds = require('@sap/cds');
const moment = require('moment');
const axios = require('axios');
const archiver = require('archiver');
const { v4: uuid } = require('uuid');

const { ReportGenerator } = cds.entities;

module.exports = function () {
  this.on('Coupon', async (req) => {
    try {
       const tx = cds.transaction(req);
       
       const primaryDocumentNbr = req.data.fields; // Extract the field value

       // Run the parameterized query
       const coupons = await tx.run(
         `SELECT COUPON.COMPANY, COUPON.PRIMARYDOCUMENTNBR, COUPON.NUMBER, COUPON.ORIGINAIRPORT, COUPON.DESTINATIONAIRPORT, COUPON.DIRECTIONINDICATOR 
          FROM COUPON 
          WHERE PRIMARYDOCUMENTNBR = ? 
          ORDER BY PRIMARYDOCUMENTNBR ASC, NUMBER ASC`,
         [primaryDocumentNbr]
       );

    
    return {
        "status": 200,
        "data": coupons ?? []
    }

     

    } catch (error) {
      // eslint-disable-next-line no-debugger
      console.log(error);
    }
  });
  this.on('getCSRFToken', (req) => {
    return 'Token';
  });
  this.on('InwardIndicator', async (req) => {
    try {
      const { AuditTrail } = this.entities;
       const tx = cds.transaction(req);
       console.log(req.data);
       const NUMBER = req.data.Number; 
       const PRIMARYDOCUMENTNBR = req.data.PrimaryDocumentNbr; 
       var user = req.user.id;
       const currentDateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
    
       await tx.run(
        `UPDATE COUPON
         SET DIRECTIONINDICATOR = 'I'
         WHERE PRIMARYDOCUMENTNBR = ? AND NUMBER >= ?`,
        [PRIMARYDOCUMENTNBR, NUMBER]
      );
      await tx.run(
        `UPDATE DOCUMENT
         SET STATUS = 'NEW'
         WHERE PRIMARYDOCUMENTNBR = ?`,
        [PRIMARYDOCUMENTNBR]
      );

      const auditLogData = {
        ID: uuid(),
        companyCode: 'AI',
        userId: user,
        companyId: '',
        eventId: 'Activate',
        eventName: 'Sector Fare coupon changed',
        module: 'Sector Fare',
        createdBy: user,
        createdAt: currentDateTime,
        finalStatus: 'Success',
        finalStatusMessageText: `turn around  changed for ${PRIMARYDOCUMENTNBR}`,
        oldValue: '',
        newValue: ''
    }
    await tx.run(
      `INSERT INTO AUDITTRAIL (ID, COMPANYCODE, USERID, COMPANYID, EVENTID, EVENTNAME, MODULE, CREATEDBY, CREATEDAT, FINALSTATUS, FINALSTATUSMESSAGETEXT, OLDVALUE, NEWVALUE)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
          auditLogData.ID,
          auditLogData.companyCode,
          auditLogData.userId,
          auditLogData.companyId,
          auditLogData.eventId,
          auditLogData.eventName,
          auditLogData.module,
          auditLogData.createdBy,
          auditLogData.createdAt,
          auditLogData.finalStatus,
          auditLogData.finalStatusMessageText,
          auditLogData.oldValue,
          auditLogData.newValue
      ]
  );
        
    return {
        "status": 200,
        "message":"Your inward journeys are updated successfully"
    }
    } catch (error) {
      // eslint-disable-next-line no-debugger
      console.log(error);
    }
  });
};


