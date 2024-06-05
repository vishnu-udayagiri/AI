const {v4:uuid} = require('uuid');
const {
  buildQuery
} = require("../helpers/filter.query.builder.helper");
const { generateInvoiceNumber, generateRequestNumber } = require("../libs/invoice");
const { getAdminsFromCompanyId } = require('./agent.db');
const { sendAmendmentRequestSuccessMailToUser, sendAmendmentRequestMailToAdmin } = require('../helpers/mail.helper');
const { buildReportQuery } = require('../helpers/report.query.builder.helper');

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

    const invoices = await db.exec(baseQuery,params);
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

    const invoices = await db.exec(baseQuery,params);
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
exports.makeGSTINAmendment = async (db,invoiceNumber,gstin, isAmended, status, amendmentRequestedBy, amendmentRequestedOn,companyId,originalInvoice,name,amendmentReason) => {
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
            AMENDMENTREASON = ?
        WHERE INVOICENUMBER = ?
    `;

    console.log(copyQuery);
    await db.exec(copyQuery, [isAmendedSQL, status, gstin, amendmentRequestedBy, amendmentRequestedOn, amendmentRequestNo,amendmentReason, invoiceNumber]);

    // const admins = await getAdminsFromCompanyId(db,companyId)

    const originalGSTIN = originalInvoice.PASSENGERGSTIN

    try {
      await sendAmendmentRequestSuccessMailToUser(name,amendmentRequestedBy,gstin,originalGSTIN,"GSTIN")
    } catch (error) {
      console.log(error);
    }

    try {
      await sendAmendmentRequestMailToAdmin(db,companyId,gstin,originalGSTIN,"GSTIN")
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
exports.makeAddressAmendment = async (db, address, invoiceNumber, isAmended, status, amendmentRequestedBy, amendmentRequestedOn,companyId,originalInvoice,name,amendmentReason) => {
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
            AMENDMENTREASON = ?
        WHERE INVOICENUMBER = ?
    `;

    console.log(copyQuery);
    await db.exec(copyQuery, [isAmendedSQL, status, address,address, amendmentRequestedBy, amendmentRequestedOn, amendmentRequestNo, amendmentReason, invoiceNumber]);

    const originalAddress = originalInvoice.BILLTOFULLADDRESS

    try {
      await sendAmendmentRequestSuccessMailToUser(name,amendmentRequestedBy,address,originalAddress,"GSTIN Address")
    } catch (error) {
      console.log(error);
    }

    try {
      await sendAmendmentRequestMailToAdmin(db,companyId,address,originalAddress,"Address")
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
exports.makeChangeAddressAmendment = async (db, address, invoiceNumber, isAmended, status, amendmentRequestedBy, amendmentRequestedOn,companyId,originalInvoice,name,amendmentReason) => {
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
            AMENDMENTREASON = ?
        WHERE INVOICENUMBER = ?
    `;

    console.log(copyQuery);
    await db.exec(copyQuery, [isAmendedSQL, status, address,address, amendmentRequestedBy, amendmentRequestedOn, amendmentRequestNo, amendmentReason, invoiceNumber]);

    const originalAddress = originalInvoice.BILLTOFULLADDRESS

    try {
      await sendAmendmentRequestSuccessMailToUser(name,amendmentRequestedBy,address,originalAddress,"GSTIN Address")
    } catch (error) {
      console.log(error);
    }

    try {
      await sendAmendmentRequestMailToAdmin(db,companyId,address,originalAddress,"Address")
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
exports.approveOrRejectGSTINAmendment = async(db,originalInvoice,id,status,email,isB2A) =>{

  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

  try{

    let message;

    if(status == "A"){

      const newInvoceNumber = generateInvoiceNumber()

      let invoiceStatus = 'N';

      // if(originalInvoice?.GSTR1FILINGSTATUS == 'F'){
      //   invoiceStatus = 'R'
      // }

      // let approvalStatus = 'A';

      const originalInvoiceId = originalInvoice.ID;
      const sectionType = originalInvoice?.SECTIONTYPE ?? ""

      if(isB2A && sectionType == 'B2C'){
        const originalGSTIN = originalInvoice.AMENDEMENTOLDVALUE
        const originalPAN = originalGSTIN.substring(2, 12);
        const newGSTIN = originalInvoice.AMENDEMENTNEWVALUE
        const newPAN = newGSTIN.substring(2, 12);
  
        if(newPAN != originalPAN){
          // approvalStatus = 'Y'
          const query = `
                UPDATE INVOICE 
                SET
                  AMENDEMENTSTATUS = ?
                WHERE ID = ?
          `;
          await db.exec(query, ['Y',originalInvoiceId]);
          return {
            status: 'SUCCESS',
            message: 'Amendment request submitted for AI Approval'
          };
        }
      }

      const [year,month,date] = originalInvoice.INVOICEDATE.split('-')
      const invoiceDate = new Date(year,month-1,date)
      
      const currentDate = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(currentDate.getMonth() - 1);

      if (invoiceDate > oneMonthAgo && invoiceDate <= currentDate) {
        invoiceStatus = 'N'
      } else {
        invoiceStatus = 'R'
      }


      const newInvoiceID = uuid()

      originalInvoice.ID = newInvoiceID
      originalInvoice.ORIGINALINVOICENUMBER = originalInvoice.INVOICENUMBER;
      originalInvoice.ORGINALINVOICEDATE = originalInvoice.INVOICEDATE;
      originalInvoice.PASSENGERGSTIN = originalInvoice.AMENDEMENTNEWVALUE
      originalInvoice.ORIGINALGSTIN = originalInvoice.AMENDEMENTOLDVALUE;
      originalInvoice.ORIGINALSECTIONTYPE = originalInvoice.SECTIONTYPE;
      originalInvoice.INVOICENUMBER = newInvoceNumber;
      originalInvoice.AMENDEMENTSTATUS = status
      originalInvoice.AMENDMENTAPPROVEDBY = email
      originalInvoice.AMENDMENTAPPROVEDON = timestamp
    
  
      const columns = Object.keys(originalInvoice);
      const values = Object.values(originalInvoice);
      const placeholders = values.map(() => '?').join(',');
      const insertQuery = `INSERT INTO INVOICE (${columns.join(',')}) VALUES (${placeholders})`;
      await db.exec(insertQuery, values);

      const query = `
            UPDATE INVOICE 
            SET
              INVOICESTATUS = ?,
              DOCUMENTTYPE = 'CREDIT',
              AMENDEMENTSTATUS = ?,
              AMENDMENTAPPROVEDBY = ?,
              AMENDMENTAPPROVEDON = ?
            WHERE ID = ?
        `;

        await db.exec(query, [invoiceStatus,'A',email,timestamp,id]);
        message = "Amendment Request Approved Successfully"

        const itemQuery = 'SELECT * FROM INVOICEITEMS WHERE INVOICE_ID = ?'
        const invoiceItems = await db.exec(itemQuery,[originalInvoiceId])

        console.log(invoiceItems);
  
        for (const item of invoiceItems) {
  
          item.INVOICE_ID = newInvoiceID;
          // try {

            const itemColumns = Object.keys(item);
            const itemValues = Object.values(item);
            const placeholders = itemValues.map(() => '?').join(',');
            const insertQuery = `INSERT INTO INVOICEITEMS (${itemColumns.join(',')}) VALUES (${placeholders})`;
            console.log(`Executing query: ${insertQuery} with values: ${JSON.stringify(itemValues)}`);
            const result = await db.exec(insertQuery, itemValues);
            console.log('Insert result:', result);
            
          // } catch (error) {
          //   console.log(error);
          // }
  
        }
    }

    if(status == "R"){
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
              AMENDEMENTNEWVALUE = NULL
            WHERE ID = ?
      `;
      
      await db.exec(query, [id]);
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
exports.approveOrRejectAddressAmendment = async(db,originalInvoice,id,status,email,isB2A) =>{

  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];


  try{

    let message;

    if(status == "A"){

      const newInvoceNumber = generateInvoiceNumber()

      let invoiceStatus = 'N';

      // if(originalInvoice?.GSTR1FILINGSTATUS == 'F'){
      //   invoiceStatus = 'R'
      // }

      const [year,month,date] = originalInvoice.INVOICEDATE.split('-')
      const invoiceDate = new Date(year,month-1,date)
      
      const currentDate = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(currentDate.getMonth() - 1);

      if (invoiceDate > oneMonthAgo && invoiceDate <= currentDate) {
        invoiceStatus = 'N' // Cancel
      } else {
        invoiceStatus = 'R' // Credit note issued
      }

      const originalInvoiceId = originalInvoice.ID;
      const newInvoiceID = uuid()

      originalInvoice.ID = newInvoiceID
      originalInvoice.ORIGINALINVOICENUMBER = originalInvoice.INVOICENUMBER;
      originalInvoice.ORGINALINVOICEDATE = originalInvoice.INVOICEDATE;
      originalInvoice.AMENDEMENTOLDVALUE = originalInvoice.BILLTOFULLADDRESS
      originalInvoice.BILLTOFULLADDRESS = originalInvoice.AMENDEMENTNEWVALUE
      originalInvoice.ORIGINALGSTIN = originalInvoice.PASSENGERGSTIN;
      originalInvoice.PASSENGERGSTIN = ""
      originalInvoice.ORIGINALSECTIONTYPE = originalInvoice.SECTIONTYPE;
      originalInvoice.SECTIONTYPE = 'B2C';
      originalInvoice.INVOICENUMBER = newInvoceNumber;
      originalInvoice.AMENDEMENTSTATUS = status
      originalInvoice.AMENDMENTAPPROVEDBY = email
      originalInvoice.AMENDMENTAPPROVEDON = timestamp
    
  
      const columns = Object.keys(originalInvoice);
      const values = Object.values(originalInvoice);
      const placeholders = values.map(() => '?').join(',');
      const insertQuery = `INSERT INTO INVOICE (${columns.join(',')}) VALUES (${placeholders})`;
      await db.exec(insertQuery, values);

      const query = `
            UPDATE INVOICE 
            SET
              INVOICESTATUS = ?,
              DOCUMENTTYPE = 'CREDIT',
              AMENDEMENTSTATUS = ?,
              AMENDMENTAPPROVEDBY = ?,
              AMENDMENTAPPROVEDON = ?
            WHERE ID = ?
        `;

        await db.exec(query, [invoiceStatus,'A',email,timestamp,id]);
        message = "Amendment Request Approved Successfully"

      const itemQuery = 'SELECT * FROM INVOICEITEMS WHERE INVOICE_ID = ?'
      const invoiceItems = await db.exec(itemQuery,[originalInvoiceId])

      for (const item of invoiceItems) {

        item.INVOICE_ID = newInvoiceID;

        const itemColumns = Object.keys(item);
        const itemValues = Object.values(item);
        const placeholders = itemValues.map(() => '?').join(',');
        const insertQuery = `INSERT INTO INVOICEITEMS (${itemColumns.join(',')}) VALUES (${placeholders})`;
        const result = await db.exec(insertQuery, itemValues);

      }

    }

    if(status == "R"){
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
              AMENDEMENTNEWVALUE = NULL
            WHERE ID = ?
      `;
      
      await db.exec(query, [id]);
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
exports.approveOrRejectChangeAddressAmendment = async(db,originalInvoice,id,status,email,isB2A) =>{

  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];


  try{

    let message;

    if(status == "A"){

      const newInvoceNumber = generateInvoiceNumber()

      let invoiceStatus = 'N';

      // if(originalInvoice?.GSTR1FILINGSTATUS == 'F'){
      //   invoiceStatus = 'R'
      // }

      const [year,month,date] = originalInvoice.INVOICEDATE.split('-')
      const invoiceDate = new Date(year,month-1,date)
      
      const currentDate = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(currentDate.getMonth() - 1);

      if (invoiceDate > oneMonthAgo && invoiceDate <= currentDate) {
        invoiceStatus = 'N' // Cancel
      } else {
        invoiceStatus = 'R' // Credit note issued
      }

      const originalInvoiceId = originalInvoice.ID;
      const newInvoiceID = uuid()

      originalInvoice.ID = newInvoiceID
      originalInvoice.ORIGINALINVOICENUMBER = originalInvoice.INVOICENUMBER;
      originalInvoice.ORGINALINVOICEDATE = originalInvoice.INVOICEDATE;
      originalInvoice.AMENDEMENTOLDVALUE = originalInvoice.BILLTOFULLADDRESS
      originalInvoice.BILLTOFULLADDRESS = originalInvoice.AMENDEMENTNEWVALUE
      originalInvoice.ORIGINALGSTIN = originalInvoice.PASSENGERGSTIN;
      originalInvoice.ORIGINALSECTIONTYPE = originalInvoice.SECTIONTYPE;
      originalInvoice.SECTIONTYPE = 'B2C';
      originalInvoice.INVOICENUMBER = newInvoceNumber;
      originalInvoice.AMENDEMENTSTATUS = status
      originalInvoice.AMENDMENTAPPROVEDBY = email
      originalInvoice.AMENDMENTAPPROVEDON = timestamp
    
  
      const columns = Object.keys(originalInvoice);
      const values = Object.values(originalInvoice);
      const placeholders = values.map(() => '?').join(',');
      const insertQuery = `INSERT INTO INVOICE (${columns.join(',')}) VALUES (${placeholders})`;
      await db.exec(insertQuery, values);

      const query = `
            UPDATE INVOICE 
            SET
              INVOICESTATUS = ?,
              DOCUMENTTYPE = 'CREDIT',
              AMENDEMENTSTATUS = ?,
              AMENDMENTAPPROVEDBY = ?,
              AMENDMENTAPPROVEDON = ?
            WHERE ID = ?
        `;

        await db.exec(query, [invoiceStatus,'A',email,timestamp,id]);
        message = "Amendment Request Approved Successfully"

      const itemQuery = 'SELECT * FROM INVOICEITEMS WHERE INVOICE_ID = ?'
      const invoiceItems = await db.exec(itemQuery,[originalInvoiceId])

      for (const item of invoiceItems) {

        item.INVOICE_ID = newInvoiceID;

        const itemColumns = Object.keys(item);
        const itemValues = Object.values(item);
        const placeholders = itemValues.map(() => '?').join(',');
        const insertQuery = `INSERT INTO INVOICEITEMS (${itemColumns.join(',')}) VALUES (${placeholders})`;
        const result = await db.exec(insertQuery, itemValues);

      }

    }

    if(status == "R"){
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
              AMENDEMENTNEWVALUE = NULL
            WHERE ID = ?
      `;
      
      await db.exec(query, [id]);
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
exports.getDefaultPeriod = async(db,userId) =>{

  try {

    const query = `SELECT DEFAULTPERIOD FROM USERDEFAULT WHERE USERID = '${userId}'`
    const data = ((await db.exec(query))[0]).DEFAULTPERIOD??"";

    return {
      status: 'SUCCESS',
      message: "Query executed successfully",
      data:data
    };
    
  } catch (error) {

    console.log(error);

    return {
      status: 'FAILED',
      message: 'Failed to execute query '+ error.message,
      data:""
    };
    
  }


}