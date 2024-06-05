const { v4: uuid } = require('uuid');
const {
  buildQuery
} = require("../helpers/filter.query.builder.helper");
const { generateInvoiceNumber, generateRequestNumber } = require("../libs/invoice");
const { getAdminsFromCompanyId } = require('./agent.db');
const { sendAmendmentRequestSuccessMailToUser, sendAmendmentRequestMailToAdmin } = require('../helpers/mail.helper');
const { buildReportQuery } = require('../helpers/report.query.builder.helper');
const { ruleEngine } = require('../helpers/rule.engine.helper');

/**
 *
 * @param {Object} db - Database connection
 * @param {String} gstin - Passenger GSTIN Number
 * @param {Objec} filters - Optional - Invoice Filter, Invoice Number, IATA Number, Supplier GSTN, Ticket Number. Default values will be set if none of the filters are provided.
 * @returns {Objec} - JSON Object with fields status, message and data.
 */


exports.getInvoicesFromPassengerGSTIN = async (db, pageNumber, pageSize, filters = {}) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    const baseQuery = 'SELECT * FROM INVOICE'
    const filterQuery = buildQuery(baseQuery, filters, pageNumber, pageSize);
    // console.log('Filters ::', filters);
    console.log('Final query ::', filterQuery);

    const invoices = await db.exec(filterQuery);

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: invoices,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: [],
    };
  }
}

exports.getAllInvoicesFromGSTIN = async (db, gstin) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    console.log(gstin);

    let baseQuery, params;

    if (Array.isArray(gstin) && gstin.length > 0) {
      const placeholders = gstin.map(() => '?').join(',');
      baseQuery = `SELECT INVOICE.INVOICENUMBER,INVOICE.IATANUMBER,INVOICE.SUPPLIERGSTIN,INVOICE.PASSENGERGSTIN,INVOICE.TICKETNUMBER,INVOICE.AMENDMENTREQUESTNO,INVOICE.PNR,INVOICE.BILLTONAME FROM INVOICE WHERE PASSENGERGSTIN IN (${placeholders})`;
      params = gstin;
    } else {
      baseQuery = 'SELECT INVOICE.INVOICENUMBER,INVOICE.IATANUMBER,INVOICE.SUPPLIERGSTIN,INVOICE.PASSENGERGSTIN,INVOICE.TICKETNUMBER,INVOICE.AMENDMENTREQUESTNO,INVOICE.PNR,INVOICE.BILLTONAME FROM INVOICE WHERE PASSENGERGSTIN = ?';
      params = [gstin];
    }

    // console.log(baseQuery);

    const invoices = await db.exec(baseQuery, params);
    // console.log(invoices);


    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: invoices,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: [],
    };
  }
}

exports.getInvoicesFromReportTable = async (db, pageNumber, pageSize, filters = {}) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    const baseQuery = 'SELECT * FROM AREASUMMARY'
    const filterQuery = buildReportQuery(baseQuery, filters, pageNumber, pageSize);
    // console.log('Filters ::', filters);
    console.log('Final query ::', filterQuery);

    const invoices = await db.exec(filterQuery);

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: invoices,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: [],
    };
  }
}

exports.getAllInvoicesFromReportTable = async (db, gstin) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    console.log(gstin);

    let baseQuery, params;

    if (Array.isArray(gstin) && gstin.length > 0) {
      const placeholders = gstin.map(() => '?').join(',');
      baseQuery = `SELECT AREASUMMARY.INVOICENUMBER,AREASUMMARY.IATANUMBER,AREASUMMARY.SUPPLIERGSTIN,AREASUMMARY.PASSENGERGSTIN,AREASUMMARY.TICKETNUMBER,AREASUMMARY.AMENDMENTREQUESTNO,AREASUMMARY.PNR,AREASUMMARY.BILLTONAME FROM AREASUMMARY WHERE PASSENGERGSTIN IN (${placeholders})`;
      params = gstin;
    } else {
      baseQuery = 'SELECT AREASUMMARY.INVOICENUMBER,AREASUMMARY.IATANUMBER,AREASUMMARY.SUPPLIERGSTIN,AREASUMMARY.PASSENGERGSTIN,AREASUMMARY.TICKETNUMBER,AREASUMMARY.AMENDMENTREQUESTNO,AREASUMMARY.PNR,AREASUMMARY.BILLTONAME FROM AREASUMMARY WHERE PASSENGERGSTIN = ?';
      params = [gstin];
    }

    // console.log(baseQuery);

    const invoices = await db.exec(baseQuery, params);
    // console.log(invoices);


    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: invoices,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: [],
    };
  }
}

/**
 * @param {Object} db The name of the table.
 * @param {string} invoiceNumber The invoice number in which gstin to be updated.
 * @param {string} gstin The GSTIN to update.
 * @param {boolean} isAmended The new ISAMENDED value.
 * @param {string} status The new STATUS value.
 * @param {string} amendmentRequestedBy Email Id of the user.
 * @param {string} amendmentRequestedOn Timestamp.
 * @param {string} companyId Company Id.
 * @param {string} Original_Invoice Original Invoice data.
 * @param {string} name Name of the user
 * @returns {Promise<Object>} A promise resolving to the result object.
 */
exports.makeGSTINAmendment = async (db, invoiceNumber, gstin, isAmended, status, amendmentRequestedBy, amendmentRequestedOn, companyId, originalInvoice, name, amendmentReason) => {
  try {


    // console.log(gstin, invoiceNumber, isAmended, status, amendmentRequestedBy, amendmentRequestedOn);

    const isAmendedSQL = isAmended ? 1 : 0;
    const amendmentRequestNo = generateRequestNumber()


    const copyQuery = `
        UPDATE INVOICE
        SET
            ISAMENDED = ?,
            AMENDEMENTSTATUS = ?,
            AMENDEMENTOLDVALUE = PASSENGERGSTIN,
            AMENDEMENTNEWVALUE = ?,
            AMENDMENTREQUESTEDBY = ?,
            AMENDMENTREQUESTEDON = ?,
            AMENDMENTREQUESTNO = ?,
            AMENDMENTREASON = ?,
            AMENDMENTTYPE = ?
        WHERE INVOICENUMBER = ?
    `;

    console.log(copyQuery);
    await db.exec(copyQuery, [isAmendedSQL, status, gstin, amendmentRequestedBy, amendmentRequestedOn, amendmentRequestNo, amendmentReason,"CHANGE GSTIN", invoiceNumber]);

    // const admins = await getAdminsFromCompanyId(db,companyId)

    const originalGSTIN = originalInvoice.PASSENGERGSTIN

    try {
      await sendAmendmentRequestSuccessMailToUser(name, amendmentRequestedBy, gstin, originalGSTIN, "GSTIN")
    } catch (error) {
      console.log(error);
    }

    try {
      await sendAmendmentRequestMailToAdmin(db, companyId, gstin, originalGSTIN, "GSTIN")
    } catch (error) {
      console.log(error);
    }

    return {
      status: 'SUCCESS',
      message: 'Amendment requested for approval.'
    };

  } catch (error) {
    console.log(error);
    return {
      status: 'FAILED',
      message: 'Amendment request failed..',
    };
  }
}

/**
 * @param {Object} db The name of the table.
 * @param {string} address The Address to update.
 * @param {string} invoiceNumber The invoice number in which gstin to be updated.
 * @param {boolean} isAmended The new ISAMENDED value.
 * @param {string} status The new STATUS value.
 * @param {string} amendmentRequestedBy Email Id of the user.
 * @param {string} amendmentRequestedOn Timestamp.
 * @param {string} companyId Company Id.
 * @param {string} Original_Invoice Original Invoice data.
 * @param {string} name Name of the user
 * @returns {Promise<Object>} A promise resolving to the result object.
 */
exports.makeAddressAmendment = async (db, address, invoiceNumber, isAmended, status, amendmentRequestedBy, amendmentRequestedOn, companyId, originalInvoice, name, amendmentReason) => {
  try {


    console.log(address, invoiceNumber, isAmended, status, amendmentRequestedBy, amendmentRequestedOn);

    const isAmendedSQL = isAmended ? 1 : 0;
    const amendmentRequestNo = generateRequestNumber()


    const copyQuery = `
        UPDATE INVOICE
        SET
            ISAMENDED = ?,
            AMENDEMENTSTATUS = ?,
            AMENDEMENTOLDVALUE = BILLTOFULLADDRESS,
            AMENDENTEDADDRESS = ?,
            AMENDEMENTNEWVALUE = ?,
            AMENDMENTREQUESTEDBY = ?,
            AMENDMENTREQUESTEDON = ?,
            AMENDMENTREQUESTNO = ?,
            AMENDMENTREASON = ?,
            AMENDMENTTYPE = ?
        WHERE INVOICENUMBER = ?
    `;

    console.log(copyQuery);
    await db.exec(copyQuery, [isAmendedSQL, status, address, address, amendmentRequestedBy, amendmentRequestedOn, amendmentRequestNo, amendmentReason, "REMOVE GSTIN", invoiceNumber]);

    const originalAddress = originalInvoice.BILLTOFULLADDRESS

    try {
      await sendAmendmentRequestSuccessMailToUser(name, amendmentRequestedBy, address, originalAddress, "GSTIN Address")
    } catch (error) {
      console.log(error);
    }

    try {
      await sendAmendmentRequestMailToAdmin(db, companyId, address, originalAddress, "Address")
    } catch (error) {
      console.log(error);
    }

    return {
      status: 'SUCCESS',
      message: 'Amendment requested for approval.'
    };

  } catch (error) {
    console.log(error);
    return {
      status: 'FAILED',
      message: 'Amendment request failed..'
    };
  }
}

/**
 * @param {Object} db The name of the table.
 * @param {string} address The Address to update.
 * @param {string} invoiceNumber The invoice number in which gstin to be updated.
 * @param {boolean} isAmended The new ISAMENDED value.
 * @param {string} status The new STATUS value.
 * @param {string} amendmentRequestedBy Email Id of the user.
 * @param {string} amendmentRequestedOn Timestamp.
 * @param {string} companyId Company Id.
 * @param {string} Original_Invoice Original Invoice data.
 * @param {string} name Name of the user
 * @returns {Promise<Object>} A promise resolving to the result object.
 */
exports.makeChangeAddressAmendment = async (db, address, invoiceNumber, isAmended, status, amendmentRequestedBy, amendmentRequestedOn, companyId, originalInvoice, name, amendmentReason) => {
  try {


    console.log(address, invoiceNumber, isAmended, status, amendmentRequestedBy, amendmentRequestedOn);

    const isAmendedSQL = isAmended ? 1 : 0;
    const amendmentRequestNo = generateRequestNumber()


    const copyQuery = `
        UPDATE INVOICE
        SET
            ISAMENDED = ?,
            AMENDEMENTSTATUS = ?,
            AMENDEMENTOLDVALUE = BILLTOFULLADDRESS,
            AMENDENTEDADDRESS = ?,
            AMENDEMENTNEWVALUE = ?,
            AMENDMENTREQUESTEDBY = ?,
            AMENDMENTREQUESTEDON = ?,
            AMENDMENTREQUESTNO = ?,
            AMENDMENTREASON = ?,
            AMENDMENTTYPE = ?
        WHERE INVOICENUMBER = ?
    `;

    console.log(copyQuery);
    await db.exec(copyQuery, [isAmendedSQL, status, address, address, amendmentRequestedBy, amendmentRequestedOn, amendmentRequestNo, amendmentReason,"CHANGE ADDRESS", invoiceNumber]);

    const originalAddress = originalInvoice?.BILLTOFULLADDRESS

    try {
      await sendAmendmentRequestSuccessMailToUser(name, amendmentRequestedBy, address, originalAddress, "GSTIN Address")
    } catch (error) {
      console.log(error);
    }

    try {
      await sendAmendmentRequestMailToAdmin(db, companyId, address, originalAddress, "Address")
    } catch (error) {
      console.log(error);
    }

    return {
      status: 'SUCCESS',
      message: 'Amendment requested for approval.'
    };

  } catch (error) {
    console.log(error);
    return {
      status: 'FAILED',
      message: 'Amendment request failed..'
    };
  }
}


/**
 * Approve or reject GSTIN Amendment
 * @param {Object} db
 * @param {string} originalInvoice - original invoice data
 * @param {string} id - id of the invoice
 * @param {'A'|'R'} status - "A" (Approve) or "R" (Reject)
 * @param {string} email - email id of the user
 * @param {boolean} isB2A - To check if the user is a B2A or B2B
 * @returns {any}
 */
exports.approveOrRejectGSTINAmendment = async (db, originalInvoice, id, status, email, isB2A, rejectReason) => {

  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

  try {

    let message;

    if (status == "A") {

      const newInvoceNumber = generateInvoiceNumber()
      const creditInvoceNumber = generateInvoiceNumber()

      let invoiceStatus = 'N';

      // if(originalInvoice?.GSTR1FILINGSTATUS == 'F'){
      //   invoiceStatus = 'R'
      // }

      // let approvalStatus = 'A';

      const originalInvoiceId = originalInvoice.ID;
      const sectionType = originalInvoice?.SECTIONTYPE ?? ""

      if (isB2A && sectionType == 'B2C') {
        const originalGSTIN = originalInvoice.AMENDEMENTOLDVALUE
        const originalPAN = originalGSTIN?.substring(2, 12) ?? "";
        const newGSTIN = originalInvoice.AMENDEMENTNEWVALUE
        const newPAN = newGSTIN?.substring(2, 12)??"";

        if (newPAN != originalPAN) {
          // approvalStatus = 'Y'
          const query = `
                UPDATE INVOICE 
                SET
                  AMENDEMENTSTATUS = ?
                WHERE ID = ?
          `;
          await db.exec(query, ['Y', originalInvoiceId]);
          return {
            status: 'SUCCESS',
            message: 'Amendment request submitted for AI approval'
          };
        }
      }

      const [year, month, date] = originalInvoice.INVOICEDATE.split('-')
      const invoiceDate = new Date(year, month - 1, date)

      const currentDate = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(currentDate.getMonth() - 1);

      if (invoiceDate > oneMonthAgo && invoiceDate <= currentDate) {
        invoiceStatus = 'N'
      } else {
        invoiceStatus = 'R'
      }

      const query = `
        UPDATE INVOICE 
        SET
          INVOICESTATUS = ?,
          AMENDEMENTSTATUS = ?,
          AMENDMENTAPPROVEDBY = ?,
          AMENDMENTAPPROVEDON = ?
        WHERE ID = ?
      `;

      await db.exec(query, ['C', 'A', email, timestamp, id]);

      const itemQuery = 'SELECT * FROM INVOICEITEMS WHERE INVOICE_ID = ?'
      const invoiceItems = (await db.exec(itemQuery, [originalInvoiceId]))



      message = "Amendment request approved Successfully"


      const newInvoiceID = uuid()
      const creditInvoiceID = uuid()

      originalInvoice.ID = creditInvoiceID
      originalInvoice.ORIGINALINVOICENUMBER = originalInvoice.INVOICENUMBER;
      originalInvoice.ORGINALINVOICEDATE = originalInvoice.INVOICEDATE;
      originalInvoice.ORIGINALGSTIN = originalInvoice.PASSENGERGSTIN;
      originalInvoice.PASSENGERGSTIN = originalInvoice.AMENDEMENTNEWVALUE
      originalInvoice.ORIGINALSECTIONTYPE = originalInvoice.SECTIONTYPE;
      originalInvoice.INVOICENUMBER = creditInvoceNumber;
      originalInvoice.AMENDEMENTSTATUS = status
      originalInvoice.AMENDMENTAPPROVEDBY = email
      originalInvoice.AMENDMENTAPPROVEDON = timestamp
      originalInvoice.DOCUMENTTYPE = 'CREDIT'
      originalInvoice.INVOICESTATUS = 'R'

      const columns = Object.keys(originalInvoice);
      const values = Object.values(originalInvoice);
      const placeholders = values.map(() => '?').join(',');
      const insertQuery = `INSERT INTO INVOICE (${columns.join(',')}) VALUES (${placeholders})`;
      await db.exec(insertQuery, values);

      for (const invoiceItem of invoiceItems) {

        if (invoiceItem) {

          invoiceItem.INVOICE_ID = creditInvoiceID;
          
          const {status, data} = await ruleEngine(db,originalInvoice.AMENDEMENTNEWVALUE,originalInvoice.AMENDEMENTOLDVALUE, invoiceItem)
  
          const { 
            taxCode,cgst, 
            cgstRate,sgst,
            sgstRate,ugst,
            ugstRate,igst,
            igstRate
          } = data
  
  
          originalInvoice.TAXCODE = taxCode
          invoiceItem.COLLECTEDCGSTRATE = cgstRate
          invoiceItem.COLLECTEDSGSTRATE = sgstRate
          invoiceItem.COLLECTEDIGSTRATE = igstRate
          invoiceItem.COLLECTEDUTGSTRATE = ugstRate
          invoiceItem.COLLECTEDCGST = cgst
          invoiceItem.COLLECTEDSGST = sgst
          invoiceItem.COLLECTEDIGST = igst
          invoiceItem.COLLECTEDUTGST = ugst
  
          const itemColumns = Object.keys(invoiceItem);
          const itemValues = Object.values(invoiceItem);
          const placeholders = itemValues.map(() => '?').join(',');
          const insertQuery = `INSERT INTO INVOICEITEMS (${itemColumns.join(',')}) VALUES (${placeholders})`;
          console.log(`Executing query: ${insertQuery} with values: ${JSON.stringify(itemValues)}`);
          const result = await db.exec(insertQuery, itemValues);
          console.log('Insert result:', result);
  
        }
        
      }



      originalInvoice.ID = newInvoiceID
      originalInvoice.INVOICENUMBER = newInvoceNumber;
      originalInvoice.DOCUMENTTYPE = 'INVOICE';
      originalInvoice.INVOICESTATUS = 'N'

      const invoiceColumns = Object.keys(originalInvoice);
      const invoiceValues = Object.values(originalInvoice);
      const invoicePlaceholders = invoiceValues.map(() => '?').join(',');
      const invoiceInsertQuery = `INSERT INTO INVOICE (${invoiceColumns.join(',')}) VALUES (${invoicePlaceholders})`;
      await db.exec(invoiceInsertQuery, invoiceValues);

      for (const invoiceItem of invoiceItems) {

        if (invoiceItem) {

          invoiceItem.INVOICE_ID = newInvoiceID;
          const itemColumns = Object.keys(invoiceItem);
          const itemValues = Object.values(invoiceItem);
          const placeholders = itemValues.map(() => '?').join(',');
          // const insertQuery = `INSERT INTO INVOICEITEMS (${itemColumns.join(',')}) VALUES (${placeholders})`;
          // console.log(`Executing query: ${insertQuery} with values: ${JSON.stringify(itemValues)}`);
          // const result = await db.exec(insertQuery, itemValues);
          // console.log('Insert result:', result);
        }
        
      }



      // console.log(invoiceItems);


    }

    if (status == "R") {
      const query = `
            UPDATE INVOICE 
            SET
              INVOICESTATUS = 'R',
              ISAMENDED = FALSE,
              AMENDEMENTSTATUS = 'R',
              AMENDMENTREQUESTNO = NULL,
              AMENDMENTREQUESTEDBY = NULL,
              AMENDMENTREQUESTEDON = NULL,
              AMENDEMENTOLDVALUE = NULL,
              AMENDEMENTNEWVALUE = NULL,
              AMENDMENTREJECTEDBY = ?,
              AMENDMENTREJECTIONREASON = ?,
              AMENDMENTTYPE = NULL
            WHERE ID = ?
      `;

      await db.exec(query, [email, rejectReason, id]);
      message = "Amendment request rejected."
    }

    return {
      status: 'SUCCESS',
      message: message
    };

  } catch (error) {
    console.log(error);
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
    };
  }

}


/**
 * Approve or reject GSTIN Amendment
 * @param {Object} db
 * @param {string} originalInvoice - original invoice data
 * @param {string} id - id of the invoice
 * @param {'A'|'R'} status - "A" (Approve) or "R" (Reject)
 * @param {string} email - email id of the user
 * @param {boolean} isB2A - To check if the user is a B2A or B2B
 * @returns {any}
 */
exports.approveOrRejectAddressAmendment = async (db, originalInvoice, id, status, email, isB2A, rejectReason) => {

  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];


  try {

    let message;

    if (status == "A") {

      const newInvoceNumber = generateInvoiceNumber()
      const creditInvoceNumber = generateInvoiceNumber()

      let invoiceStatus = 'N';

      // if(originalInvoice?.GSTR1FILINGSTATUS == 'F'){
      //   invoiceStatus = 'R'
      // }

      const originalInvoiceId = originalInvoice.ID;

      const [year, month, date] = originalInvoice.INVOICEDATE.split('-')
      const invoiceDate = new Date(year, month - 1, date)

      const currentDate = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(currentDate.getMonth() - 1);

      if (invoiceDate > oneMonthAgo && invoiceDate <= currentDate) {
        invoiceStatus = 'N' // Cancel
      } else {
        invoiceStatus = 'R' // Credit note issued
      }

      const query = `
        UPDATE INVOICE 
        SET
          INVOICESTATUS = ?,
          AMENDEMENTSTATUS = ?,
          AMENDMENTAPPROVEDBY = ?,
          AMENDMENTAPPROVEDON = ?
        WHERE ID = ?
      `;
      await db.exec(query, ['C', 'A', email, timestamp, id]);

      const itemQuery = 'SELECT * FROM INVOICEITEMS WHERE INVOICE_ID = ?'
      const invoiceItems = await db.exec(itemQuery, [originalInvoiceId])

      message = "Amendment request approved successfully"


      const newInvoiceID = uuid()
      const creditInvoiceID = uuid()


      originalInvoice.ID = creditInvoiceID
      originalInvoice.ORIGINALINVOICENUMBER = originalInvoice.INVOICENUMBER;
      originalInvoice.ORGINALINVOICEDATE = originalInvoice.INVOICEDATE;
      originalInvoice.AMENDEMENTOLDVALUE = originalInvoice.BILLTOFULLADDRESS
      originalInvoice.BILLTOFULLADDRESS = originalInvoice.AMENDEMENTNEWVALUE
      originalInvoice.ORIGINALGSTIN = originalInvoice.PASSENGERGSTIN;
      originalInvoice.PASSENGERGSTIN = ""
      originalInvoice.ORIGINALSECTIONTYPE = originalInvoice.SECTIONTYPE;
      originalInvoice.SECTIONTYPE = 'B2C';
      originalInvoice.INVOICENUMBER = creditInvoceNumber;
      originalInvoice.AMENDEMENTSTATUS = status
      originalInvoice.AMENDMENTAPPROVEDBY = email
      originalInvoice.AMENDMENTAPPROVEDON = timestamp
      originalInvoice.DOCUMENTTYPE = 'CREDIT'
      originalInvoice.INVOICESTATUS = 'R'

      const columns = Object.keys(originalInvoice);
      const values = Object.values(originalInvoice);
      const placeholders = values.map(() => '?').join(',');
      const insertQuery = `INSERT INTO INVOICE (${columns.join(',')}) VALUES (${placeholders})`;
      await db.exec(insertQuery, values);


      for (const invoiceItem of invoiceItems) {

        if (invoiceItem) {

          invoiceItem.INVOICE_ID = creditInvoiceID;
  
          const itemColumns = Object.keys(invoiceItem);
          const itemValues = Object.values(invoiceItem);
          const placeholders = itemValues.map(() => '?').join(',');
          const insertQuery = `INSERT INTO INVOICEITEMS (${itemColumns.join(',')}) VALUES (${placeholders})`;
          const result = await db.exec(insertQuery, itemValues);
        }
        
      }

      originalInvoice.ID = newInvoiceID
      originalInvoice.INVOICENUMBER = newInvoceNumber;
      originalInvoice.DOCUMENTTYPE = 'INVOICE';
      originalInvoice.INVOICESTATUS = 'N'

      const invoiceColumns = Object.keys(originalInvoice);
      const invoiceValues = Object.values(originalInvoice);
      const invoicePlaceholders = invoiceValues.map(() => '?').join(',');
      const invoiceInsertQuery = `INSERT INTO INVOICE (${invoiceColumns.join(',')}) VALUES (${invoicePlaceholders})`;
      await db.exec(invoiceInsertQuery, invoiceValues);

      for (const invoiceItem of invoiceItems) {

        if (invoiceItem) {

          invoiceItem.INVOICE_ID = newInvoiceID;
          const itemColumns = Object.keys(invoiceItem);
          const itemValues = Object.values(invoiceItem);
          const placeholders = itemValues.map(() => '?').join(',');
          const insertQuery = `INSERT INTO INVOICEITEMS (${itemColumns.join(',')}) VALUES (${placeholders})`;
          console.log(`Executing query: ${insertQuery} with values: ${JSON.stringify(itemValues)}`);
          const result = await db.exec(insertQuery, itemValues);
          console.log('Insert result:', result);
        }
        
      }




    }

    if (status == "R") {
      const query = `
            UPDATE INVOICE 
            SET
              INVOICESTATUS = 'R',
              ISAMENDED = FALSE,
              AMENDENTEDADDRESS = NULL,
              AMENDEMENTSTATUS = 'R',
              AMENDMENTREQUESTNO = NULL,
              AMENDMENTREQUESTEDBY = NULL,
              AMENDMENTREQUESTEDON = NULL,
              AMENDEMENTOLDVALUE = NULL,
              AMENDEMENTNEWVALUE = NULL,
              AMENDMENTREJECTEDBY = ?,
              AMENDMENTREJECTIONREASON = ?,
              AMENDMENTTYPE = NULL
            WHERE ID = ?
      `;

      await db.exec(query, [email, rejectReason, id]);
      message = "Amendment request rejected."
    }

    return {
      status: 'SUCCESS',
      message: message
    };

  } catch (error) {
    console.log(error);
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
    };
  }

}


/**
 * Approve or reject GSTIN Amendment
 * @param {Object} db
 * @param {string} originalInvoice - original invoice data
 * @param {string} id - id of the invoice
 * @param {'A'|'R'} status - "A" (Approve) or "R" (Reject)
 * @param {string} email - email id of the user
 * @param {boolean} isB2A - To check if the user is a B2A or B2B
 * @returns {any}
 */
exports.approveOrRejectChangeAddressAmendment = async (db, originalInvoice, id, status, email, isB2A, rejectReason) => {

  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];


  try {

    let message;

    if (status == "A") {

      const newInvoceNumber = generateInvoiceNumber()
      const creditInvoceNumber = generateInvoiceNumber()


      let invoiceStatus = 'N';

      // if(originalInvoice?.GSTR1FILINGSTATUS == 'F'){
      //   invoiceStatus = 'R'
      // }

      const originalInvoiceId = originalInvoice.ID;

      const [year, month, date] = originalInvoice.INVOICEDATE.split('-')
      const invoiceDate = new Date(year, month - 1, date)

      const currentDate = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(currentDate.getMonth() - 1);

      if (invoiceDate > oneMonthAgo && invoiceDate <= currentDate) {
        invoiceStatus = 'N' // Cancel
      } else {
        invoiceStatus = 'R' // Credit note issued
      }

      const query = `
        UPDATE INVOICE 
        SET
          INVOICESTATUS = ?,
          AMENDEMENTSTATUS = ?,
          AMENDMENTAPPROVEDBY = ?,
          AMENDMENTAPPROVEDON = ?
        WHERE ID = ?
      `;

      await db.exec(query, ['C', 'A', email, timestamp, id]);
      message = "Amendment request approved successfully"

      const newInvoiceID = uuid()
      const creditInvoiceID = uuid()

      originalInvoice.ID = creditInvoiceID
      originalInvoice.ORIGINALINVOICENUMBER = originalInvoice.INVOICENUMBER;
      originalInvoice.ORGINALINVOICEDATE = originalInvoice.INVOICEDATE;
      originalInvoice.AMENDEMENTOLDVALUE = originalInvoice.BILLTOFULLADDRESS
      originalInvoice.BILLTOFULLADDRESS = originalInvoice.AMENDEMENTNEWVALUE
      originalInvoice.ORIGINALGSTIN = originalInvoice.PASSENGERGSTIN;
      originalInvoice.ORIGINALSECTIONTYPE = originalInvoice.SECTIONTYPE;
      originalInvoice.INVOICENUMBER = creditInvoceNumber;
      originalInvoice.AMENDEMENTSTATUS = status
      originalInvoice.AMENDMENTAPPROVEDBY = email
      originalInvoice.AMENDMENTAPPROVEDON = timestamp
      originalInvoice.DOCUMENTTYPE = 'CREDIT'
      originalInvoice.INVOICESTATUS = 'R'


      const columns = Object.keys(originalInvoice);
      const values = Object.values(originalInvoice);
      const placeholders = values.map(() => '?').join(',');
      const insertQuery = `INSERT INTO INVOICE (${columns.join(',')}) VALUES (${placeholders})`;
      await db.exec(insertQuery, values);



      const itemQuery = 'SELECT * FROM INVOICEITEMS WHERE INVOICE_ID = ?'
      const invoiceItems = await db.exec(itemQuery, [originalInvoiceId])

      for (const item of invoiceItems) {

        if (item) {

          item.INVOICE_ID = creditInvoiceID;
  
          const itemColumns = Object.keys(item);
          const itemValues = Object.values(item);
          const placeholders = itemValues.map(() => '?').join(',');
          const insertQuery = `INSERT INTO INVOICEITEMS (${itemColumns.join(',')}) VALUES (${placeholders})`;
          const result = await db.exec(insertQuery, itemValues);
  
        }
      }



      originalInvoice.ID = newInvoiceID
      originalInvoice.INVOICENUMBER = newInvoceNumber;
      originalInvoice.DOCUMENTTYPE = 'INVOICE';
      originalInvoice.INVOICESTATUS = 'N'

      const invoiceColumns = Object.keys(originalInvoice);
      const invoiceValues = Object.values(originalInvoice);
      const invoicePlaceholders = invoiceValues.map(() => '?').join(',');
      const invoiceInsertQuery = `INSERT INTO INVOICE (${invoiceColumns.join(',')}) VALUES (${invoicePlaceholders})`;
      await db.exec(invoiceInsertQuery, invoiceValues);

      for (const invoiceItem of invoiceItems) {

        if (invoiceItem) {

          invoiceItem.INVOICE_ID = newInvoiceID;
          const itemColumns = Object.keys(invoiceItem);
          const itemValues = Object.values(invoiceItem);
          const placeholders = itemValues.map(() => '?').join(',');
          const insertQuery = `INSERT INTO INVOICEITEMS (${itemColumns.join(',')}) VALUES (${placeholders})`;
          console.log(`Executing query: ${insertQuery} with values: ${JSON.stringify(itemValues)}`);
          const result = await db.exec(insertQuery, itemValues);
          console.log('Insert result:', result);
        }
        
      }

    }

    if (status == "R") {
      const query = `
            UPDATE INVOICE 
            SET
              INVOICESTATUS = 'R',
              ISAMENDED = FALSE,
              AMENDENTEDADDRESS = NULL,
              AMENDEMENTSTATUS = 'R',
              AMENDMENTREQUESTNO = NULL,
              AMENDMENTREQUESTEDBY = NULL,
              AMENDMENTREQUESTEDON = NULL,
              AMENDEMENTOLDVALUE = NULL,
              AMENDEMENTNEWVALUE = NULL,
              AMENDMENTREJECTEDBY = ?,
              AMENDMENTREJECTIONREASON = ?,
              AMENDMENTTYPE = NULL
            WHERE ID = ?
      `;

      await db.exec(query, [email, rejectReason, id]);
      message = "Amendment request rejected."
    }

    return {
      status: 'SUCCESS',
      message: message
    };

  } catch (error) {
    console.log(error);
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
    };
  }

}

/**
 * Description
 * @param {Object} db
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Object - Status, Message and Data 
 */
exports.getDefaultPeriod = async (db, userId) => {

  try {

    const query = `SELECT DEFAULTPERIOD FROM USERDEFAULT WHERE USERID = '${userId}'`
    const data = ((await db.exec(query))[0]).DEFAULTPERIOD ?? "";

    return {
      status: 'SUCCESS',
      message: "Query executed successfully",
      data: data
    };

  } catch (error) {

    console.log(error);

    return {
      status: 'FAILED',
      message: 'Failed to execute query ' + error.message,
      data: ""
    };

  }


}