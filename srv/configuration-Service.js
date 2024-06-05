const cds = require('@sap/cds');
const moment = require('moment');
const { getDescription } = require('./files/description');
const { v4: uuid } = require('uuid');
module.exports = function () {
  const { AuditTrail, DocumentCategory, InvoiceSignatory, AppConfig, Company, companyAdmin } = this.entities;

  this.on('getCSRFToken', (req) => {
    return 'Token';
  });
  this.before('CREATE', 'companyAdmin', async (req) => {
    const reqData = req.data;
    const email = reqData.email;
    if (email) {
      const pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
      const validateEmail = email.match(pattern);
      if (!validateEmail) {
        return req.error(400, 'Enter Valid Email');
      }
    }
  });

  /**Document Category */
  this.before('CREATE', 'DocumentCategory', async (req) => {
    const { documentTypeCode } = req.data;
    try {
      const auditData = {
        companyCode: 'AI',
        userId: req.user.id ?? 'Air India',
        companyId: '',
        eventId: 'Create',
        eventName: `Create Attachment`,
        module: 'Attachment Configuration',
        createdBy: req.user.id ?? 'Air India',
        createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
        finalStatus: 'Success',
        finalStatusMessageText: `Document Type ${documentTypeCode} Created`,
        oldValue: '',
        newValue: `${documentTypeCode}`,
      };
      await INSERT.into(AuditTrail).entries(auditData);
    } catch (error) {
    }
  });

  this.before('UPDATE', 'DocumentCategory', async (req) => {
    try {
      const editedData = req.data;
      const originalData = await SELECT.one.from(DocumentCategory).where({ documentTypeCode: editedData.documentTypeCode });
      if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
        const diff = findDifference(originalData, editedData);
        if (Object.keys(diff).length > 0) {
          /** Audit Log*/
          const auditData = {
            companyCode: 'AI',
            userId: req?.user?.id ?? 'Air India',
            companyId: '',
            eventId: 'Update',
            eventName: '',
            module: 'Attachment Configuration',
            createdBy: req?.user?.id ?? 'Air India',
            createdAt: '',
            finalStatus: 'Success',
            finalStatusMessageText: ``,
            oldValue: '',
            newValue: '',
          };

          const currentDateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
          for (const key in diff) {
            if (key == 'isMandatory') {
              originalData[key] = originalData[key] == 0 ? 'false' : 'true';
              diff[key] = diff[key] == 0 ? 'false' : 'true';
            }
            auditData.oldValue = originalData[key] ?? '';
            auditData.newValue = diff[key] ?? '';
            auditData.ID = uuid();
            auditData.createdAt = currentDateTime;
            auditData.eventName = auditData.eventId + ' ' + 'Attachment - ' + getDescription(key) ?? '';
            auditData.finalStatusMessageText = 'Attachment - ' + getDescription(key) + ' ' + `Updated` ?? '';

            await INSERT.into(AuditTrail).entries(auditData);
          }
        }
      }
    } catch (error) {
    }
  });

  this.before('DELETE', 'DocumentCategory', async (req) => {
    try {
      const { documentTypeCode } = req.data;

      const auditData = {
        companyCode: 'AI',
        userId: req.user.id ?? 'Air India',
        companyId: '',
        eventId: 'Delete',
        eventName: `Delete Attachment - ${documentTypeCode}`,
        module: 'Attachment Configuration',
        createdBy: req.user.id ?? 'Air India',
        createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
        finalStatus: 'Success',
        finalStatusMessageText: `${documentTypeCode} Deleted`,
        oldValue: `${documentTypeCode ?? ''}`,
        newValue: '',
      };
      await INSERT.into(AuditTrail).entries(auditData);
    } catch (error) {
    }
  });

  /**Application Configuration */
  this.on('getConfigurationDetails', async (req) => {
    const tx = cds.transaction(req);
    try {
      let appConfig = await tx.run(
        SELECT.one`company, isAdminApproval, isGstinApiValidation, maxInvoicesPerBulk, sendPdfToRegisteredEmail, sendPdfToPassengerEmail, sendPdfToUserGstinEmail`.from(AppConfig)
      );

      if (!appConfig) {
        appConfig = { company: 'AI' };
      }

      const companyDetails = await tx.run(SELECT.from(Company));

      const invoiceSignatory = await tx.run(SELECT.from(InvoiceSignatory));

      return {
        status: 200,
        data: {
          appConfig: appConfig,
          invoiceSignatory: invoiceSignatory,
          companyDetails: companyDetails,
        },
      };
    } catch (error) {
     
    }
  });

  this.on('saveConfigurationDetails', async (req) => {
    const tx = cds.transaction(req);
    const { configData, invoiceSignatory } = JSON.parse(req.data.Data);
    try {
      const existingAppConfig = (await tx.run(SELECT.one.from(AppConfig))) ?? {};
      const existingSignatory = await tx.run(SELECT.from(InvoiceSignatory).where({ company: 'AI' }));

      const { added, deleted } = compareArrays(existingSignatory, invoiceSignatory);

      if (Object.keys(configData).length > 0) {
        if (Object.keys(existingAppConfig).length > 0) {
          const diff = findDifference(existingAppConfig, configData);
          await tx.run(UPDATE(AppConfig).set(diff).where({ company: configData.company }));
          /**Audit Log */
          let newMsg;
          for (const key in diff) {
            if (
              key == 'isAdminApproval' ||
              key == 'isGstinApiValidation' ||
              key == 'sendPdfToRegisteredEmail' ||
              key == 'sendPdfToPassengerEmail' ||
              key == 'sendPdfToUserGstinEmail'
            ) {
              newMsg = `${getDescription(key)} ${diff[key] ? 'Enabled' : 'Disabled'}`;
            } else {
              newMsg = `Max Amendments for bulk Updated`;
            }
            const auditData = {
              companyCode: 'AI',
              userId: req.user.id ?? 'Air India',
              companyId: '',
              eventId: 'Update',
              eventName: newMsg,
              module: 'Application Configuration',
              createdBy: req.user.id ?? 'Air India',
              createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
              finalStatus: 'Success',
              finalStatusMessageText: newMsg,
              oldValue: typeof existingAppConfig[key] === 'boolean' ? (existingAppConfig[key] ? 'Enabled' : 'Disabled') : existingAppConfig[key],
              newValue: typeof diff[key] === 'boolean' ? (diff[key] ? 'Enabled' : 'Disabled') : parseInt(diff[key]),
            };
            await INSERT.into(AuditTrail).entries(auditData);
          }
        } else {
          configData.company = 'AI';
          await tx.run(INSERT.into(AppConfig).entries(configData));
          /**Audit Log */

          const auditData = {
            companyCode: 'AI',
            userId: req.user.id ?? 'Air India',
            companyId: '',
            eventId: 'Create',
            eventName: 'Application Configuration Created',
            module: 'Application Configuration',
            createdBy: req.user.id ?? 'Air India',
            createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
            finalStatus: 'Success',
            finalStatusMessageText: 'Application Configuration Created',
            oldValue: '',
            newValue: '',
          };
          await INSERT.into(AuditTrail).entries(auditData);
        }
      }

      function compareArrays(originalArray, editedArray) {
        const deleted = originalArray.filter((origObj) => !editedArray.some((editedObj) => editedObj.company === origObj.company && editedObj.ValidFrom === origObj.ValidFrom));

        const added = editedArray.filter((editedObj) => !originalArray.some((origObj) => origObj.company === editedObj.company && origObj.ValidFrom === editedObj.ValidFrom));

        return { added, deleted };
      }

      if (deleted.length > 0) {
        for (let i = 0; i < deleted.length; i++) {
          const element = deleted[i];
          await tx.run(
            DELETE.from(InvoiceSignatory).where({
              company: element.company,
              ValidFrom: element.ValidFrom,
            })
          );
          /**Audit Log */
          const auditData = {
            companyCode: 'AI',
            userId: req.user.id ?? 'Air India',
            companyId: '',
            eventId: 'Delete',
            eventName: `Delete Invoice Signatory`,
            module: 'Application Configuration',
            createdBy: req.user.id ?? 'Air India',
            createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
            finalStatus: 'Success',
            finalStatusMessageText: `Invoice Signatory Deleted`,
            oldValue: `${element.SignatoryName}`,
            newValue: ``,
          };
          await INSERT.into(AuditTrail).entries(auditData);
        }
      }

      if (added.length > 0) {
        for (let i = 0; i < added.length; i++) {
          const element = added[i];
          element.company = element.company ?? 'AI';
          await tx.run(INSERT.into(InvoiceSignatory).entries(element));
          /**Audit Log */
          const auditData = {
            companyCode: 'AI',
            userId: req.user.id ?? 'Air India',
            companyId: '',
            eventId: 'Create',
            eventName: `Create Invoice Signatory`,
            module: 'Application Configuration',
            createdBy: req.user.id ?? 'Air India',
            createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
            finalStatus: 'Success',
            finalStatusMessageText: `Invoice Signatory Created`,
            oldValue: ``,
            newValue: `${element.SignatoryName}`,
          };
          await INSERT.into(AuditTrail).entries(auditData);
        }
      }

      return {
        status: 200,
      };

      function findDifference(original, edit) {
        return Object.keys(edit).reduce((diff, key) => {
          if (original[key] === edit[key]) return diff;
          return {
            ...diff,
            [key]: edit[key],
          };
        }, {});
      }
    } catch (error) {
     
    }
  });

  /**Company Admin */
  this.before('CREATE', 'companyAdmin', async (req) => {
    const { email } = req.data;
    try {
      const auditData = {
        companyCode: 'AI',
        userId: req.user.id ?? 'Air India',
        companyId: '',
        eventId: 'Create',
        eventName: `Create Company Admin`,
        module: 'Admin Configuration',
        createdBy: req.user.id ?? 'Air India',
        createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
        finalStatus: 'Success',
        finalStatusMessageText: `Company Admin ${email} Created`,
        oldValue: '',
        newValue: `${email}`,
      };
      await INSERT.into(AuditTrail).entries(auditData);
    } catch (error) {
      
    }
  });

  this.before('UPDATE', 'companyAdmin', async (req) => {
    try {
      const editedData = req.data;
      const originalData = await SELECT.one.from(companyAdmin).where({ email: editedData.email });
      if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
        const diff = findDifference(originalData, editedData);
        if (Object.keys(diff).length > 0) {
          /** Audit Log*/
          const auditData = {
            companyCode: 'AI',
            userId: req?.user?.id ?? 'Air India',
            companyId: '',
            eventId: 'Update',
            eventName: '',
            module: 'Admin Configuration',
            createdBy: req?.user?.id ?? 'Air India',
            createdAt: '',
            finalStatus: 'Success',
            finalStatusMessageText: ``,
            oldValue: '',
            newValue: '',
          };

          const currentDateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
          for (const key in diff) {
            auditData.oldValue = originalData[key] ?? '';
            auditData.newValue = diff[key] ?? '';
            auditData.ID = uuid();
            auditData.createdAt = currentDateTime;
            auditData.eventName = auditData.eventId + ' ' + 'Company Admin - ' + getDescription(key) ?? '';
            auditData.finalStatusMessageText = 'Company Admin - ' + getDescription(key) + ' ' + `Updated` ?? '';

            await INSERT.into(AuditTrail).entries(auditData);
          }
        }
      }
    } catch (error) {
      
    }
  });

  this.before('DELETE', 'companyAdmin', async (req) => {
    try {
      const { email } = req.data;

      const auditData = {
        companyCode: 'AI',
        userId: req.user.id ?? 'Air India',
        companyId: '',
        eventId: 'Delete',
        eventName: `Delete Company Admin - ${email}`,
        module: 'Admin Configuration',
        createdBy: req.user.id ?? 'Air India',
        createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
        finalStatus: 'Success',
        finalStatusMessageText: `Company Admin ${email} Deleted`,
        oldValue: `Company Admin ${email ?? ''}`,
        newValue: '',
      };
      await INSERT.into(AuditTrail).entries(auditData);
    } catch (error) {
    }
  });
};

function findDifference(original, edit) {
  return Object.keys(edit).reduce((diff, key) => {
    if (original[key] === edit[key]) return diff;
    return {
      ...diff,
      [key]: edit[key],
    };
  }, {});
}
