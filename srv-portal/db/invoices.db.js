const { v4: uuid } = require('uuid');
const {
  buildQuery, buildFilterQuery,
  buildSearchFilterQuery
} = require("../helpers/filter.query.builder.helper");
const { generateInvoiceNumber, generateRequestNumber } = require("../libs/invoice");
const { getAdminsFromCompanyId } = require('./agent.db');
const { sendAmendmentRequestSuccessMailToUser, sendAmendmentRequestMailToAdmin, sendAmendmentApproveorRejectMailToUser, sendAmendmentRequestMailToAIAdmins } = require('../helpers/mail.helper');
const { buildReportQuery } = require('../helpers/report.query.builder.helper');
const { ruleEngine } = require('../helpers/rule.engine.helper');
const { addCancelledWatermarkToPdf } = require('../helpers/pdf.helper');
const { getGSTINDetails } = require('../validations/gstin.validation');
const { getUserData } = require('./user.db');
const { validateAmendmentDate } = require('../helpers/common.helper');

/**
 *
 * @param {Object} db - Database connection
 * @param {String} gstin - Passenger GSTIN Number
 * @param {Objec} filters - Optional - Invoice Filter, Invoice Number, IATA Number, Supplier GSTN, Ticket Number. Default values will be set if none of the filters are provided.
 * @returns {Objec} - JSON Object with fields status, message and data.
 */


exports.getInvoicesFromPassengerGSTIN = async (db, pageNumber, pageSize, filters = {}, countOnly = false, invoiceNumberOnly = false) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    const baseQuery = 'SELECT * FROM INVOICE'
    const filterQuery = buildQuery(baseQuery, filters, pageNumber, pageSize, countOnly, invoiceNumberOnly);
    // console.log('Filters ::', filters);
    // console.log('Final query ::', filterQuery);

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

exports.getFilterData = async (db, tableName, filterName, filters = {}, orderby = '') => {
  try {
    if (!db) throw new Error('DB Connection is required');
    if (!filterName) throw new Error('Filter name is required');

    filterName = filterName?.trim()?.toUpperCase();

    const filterQuery = buildFilterQuery(tableName,filters,filterName,orderby);
    // console.log('Filters ::', filters);
    // console.log('Final query ::', filterQuery);

    const result = await db.exec(filterQuery);

    const filterData = result[0]?.DATA?.split(",") ?? []

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: filterData,
    };

  } catch (error) {
    // console.log(error);
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: [],
    };
  }
}

exports.getSearchFilterData = async (db, tableName, filterName, filters = {}, orderby = '') => {
  try {
    if (!db) throw new Error('DB Connection is required');
    if (!filterName) throw new Error('Filter name is required');

    filterName = filterName?.trim()?.toUpperCase();

    const filterQuery = buildSearchFilterQuery(tableName,filters,filterName,orderby);
    // console.log('Filters ::', filters);
    // console.log('Final query ::', filterQuery);

    const result = await db.exec(filterQuery);

    const filterData = result[0]?.DATA?.split(",") ?? []

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: filterData,
    };

  } catch (error) {
    // console.log(error);
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: [],
    };
  }
}

exports.getInvoicesFromReportTable = async (db, tableName, pageNumber, pageSize, filters = {}, countOnly = false, invoiceNumberOnly = false) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    const baseQuery = `SELECT * FROM ${tableName}`
    const filterQuery = buildReportQuery(baseQuery,tableName, filters, pageNumber, pageSize, countOnly, invoiceNumberOnly);
    // console.log('Filters ::', filters);
    // console.log('Final query ::', filterQuery);

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

    const isEligibleForAmendment = validateAmendmentDate(originalInvoice?.INVOICEDATE)

    if(!isEligibleForAmendment){
      return {
        status: 'FAILED',
        message: 'Invoice is not eligible for amendment',
      }; 
    }

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

    // console.log(copyQuery);
    await db.exec(copyQuery, [isAmendedSQL, status, gstin, amendmentRequestedBy, amendmentRequestedOn, amendmentRequestNo, amendmentReason, "CHANGE GSTIN", invoiceNumber]);

    // const admins = await getAdminsFromCompanyId(db,companyId)
    console.log(gstin,">>>>>>>>>>>>>GsTIN")
    const originalGSTIN = originalInvoice.PASSENGERGSTIN
    console.log(originalGSTIN,">>>>>>>>>>>>>originalGSTIN")
    try {
      sendAmendmentRequestSuccessMailToUser(name, amendmentRequestedBy, gstin, originalGSTIN, "GSTIN")
    } catch (error) {
      console.log("GSTIN Amendment Mail", error);
    }

    try {
      await sendAmendmentRequestMailToAdmin(db, companyId, gstin, originalGSTIN, "GSTIN")
    } catch (error) {
      console.log("GSTIN Amendment Admin Mail", error);
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


    // console.log(address, invoiceNumber, isAmended, status, amendmentRequestedBy, amendmentRequestedOn);

    const isEligibleForAmendment = validateAmendmentDate(originalInvoice?.INVOICEDATE)

    if(!isEligibleForAmendment){
      return {
        status: 'FAILED',
        message: 'Invoice is not eligible for amendment',
      }; 
    }


    const isAmendedSQL = isAmended ? 1 : 0;
    const amendmentRequestNo = generateRequestNumber()


    const copyQuery = `
        UPDATE INVOICE
        SET
            ISAMENDED = ?,
            AMENDEMENTSTATUS = ?,
            AMENDEMENTOLDVALUE = PASSENGERGSTIN,
            AMENDENTEDADDRESS = ?,
            AMENDEMENTNEWVALUE = ?,
            AMENDMENTREQUESTEDBY = ?,
            AMENDMENTREQUESTEDON = ?,
            AMENDMENTREQUESTNO = ?,
            AMENDMENTREASON = ?,
            AMENDMENTTYPE = ?
        WHERE INVOICENUMBER = ?
    `;

    // console.log(copyQuery);
    await db.exec(copyQuery, [isAmendedSQL, status, address, address, amendmentRequestedBy, amendmentRequestedOn, amendmentRequestNo, amendmentReason, "REMOVE GSTIN", invoiceNumber]);

    const originalAddress = originalInvoice.BILLTOFULLADDRESS

    try {
      sendAmendmentRequestSuccessMailToUser(name, amendmentRequestedBy, originalInvoice.PASSENGERGSTIN, address, "Remove GSTIN")
    } catch (error) {
      console.log("RemoveGSTIN Amendment Mail", error);
    }

    try {
      await sendAmendmentRequestMailToAdmin(db, companyId, originalInvoice.PASSENGERGSTIN, address, "Remove GSTIN")
    } catch (error) {
      console.log("Remove GSTIN Amendment Mail", error);
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

    const isEligibleForAmendment = validateAmendmentDate(originalInvoice?.INVOICEDATE)

    if(!isEligibleForAmendment){
      return {
        status: 'FAILED',
        message: 'Invoice is not eligible for amendment',
      }; 
    }


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

    // console.log(copyQuery);
    await db.exec(copyQuery, [isAmendedSQL, status, address, address, amendmentRequestedBy, amendmentRequestedOn, amendmentRequestNo, amendmentReason, "CHANGE ADDRESS", invoiceNumber]);

    const originalAddress = originalInvoice.BILLTOFULLADDRESS

    try {
      sendAmendmentRequestSuccessMailToUser(name, amendmentRequestedBy, address, originalAddress, "GSTIN Address")
    } catch (error) {
      console.log("Address Amendment Mail", error);
    }

    try {
      await sendAmendmentRequestMailToAdmin(db, companyId, address, originalAddress, "Address")
    } catch (error) {
      console.log("Address Amendment Mail", error);
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
* @param {string} invoiceNumber The invoice number in which gstin to be updated.
 * @param {boolean} isB2A - To check if the user is a B2A or B2B

 * @returns {any}
 */
exports.approveOrRejectGSTINAmendment = async (db, originalInvoice, id, status, email, isB2A, rejectReason) => {
console.log(originalInvoice,"originalInvoice")
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

  try {

    let message;

    if (status == "A") {

      const isEligibleForAmendment = validateAmendmentDate(originalInvoice?.INVOICEDATE)

      if(!isEligibleForAmendment){
        return {
          status: 'FAILED',
          message: 'Invoice is not eligible for approval',
        }; 
      }
  

      const newInvoceNumber = null
      const creditInvoceNumber = null

      let invoiceStatus = 'Active';

      // if(originalInvoice?.GSTR1FILINGSTATUS == 'F'){
      //   invoiceStatus = 'Rejected'
      // }

      // let approvalStatus = 'A';

      const originalInvoiceId = originalInvoice.ID;
      const sectionType = originalInvoice?.SECTIONTYPE ?? ""

      if (isB2A && sectionType == 'B2C') {
        const originalGSTIN = originalInvoice?.AMENDEMENTOLDVALUE
        const originalPAN = originalGSTIN?.substring(2, 12) ?? "";
        const newGSTIN = originalInvoice?.AMENDEMENTNEWVALUE
        const newPAN = newGSTIN?.substring(2, 12) ?? "";

        if (newPAN != originalPAN) {
          // approvalStatus = 'Y'
          const query = `
                UPDATE INVOICE 
                SET
                  AMENDEMENTSTATUS = ?
                WHERE ID = ?
          `;
          await db.exec(query, ['Y', originalInvoiceId]);
          await sendAmendmentRequestMailToAIAdmins(db, originalInvoice.AMENDEMENTNEWVALUE, originalInvoice.AMENDEMENTOLDVALUE, "GSTIN")
          return {
            status: 'SUCCESS',
            message: 'Amendment request submitted for AI approval'
          };
        }
      }

      const [year, month, date] = originalInvoice.INVOICEDATE.split('-')
      const invoiceDate = new Date(year, month - 1, date)

      const today = new Date()
      const isSamePeriod = compareMonthAndYear(invoiceDate, today)
      const newInvoiceDate = today.toISOString().split('T')[0]
      const currentDate = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(currentDate.getMonth() - 1);

      if (invoiceDate > oneMonthAgo && invoiceDate <= currentDate) {
        invoiceStatus = 'Active'
      } else {
        invoiceStatus = 'Cancelled'
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

      const newInvoiceStatus = isSamePeriod ? 'Cancelled' : 'Active'

      await db.exec(query, [newInvoiceStatus, 'A', email, timestamp, id]);

      const itemQuery = 'SELECT * FROM INVOICEITEMS WHERE INVOICE_ID = ?'
      const invoiceItems = (await db.exec(itemQuery, [originalInvoiceId]))

      if (isSamePeriod) await addCancelledWatermarkToPdf(db, originalInvoiceId, email)

      message = "Amendment request approved successfully"


      const newInvoiceID = uuid()
      const creditInvoiceID = uuid()
      const newGSTIN = originalInvoice.AMENDEMENTNEWVALUE


      console.log(originalInvoice.INVOICENUMBER,"originalInvoice.INVOICENUMBER Test Approved ")


      originalInvoice.ID = creditInvoiceID
      originalInvoice.ORIGINALINVOICENUMBER = originalInvoice.INVOICENUMBER;
      originalInvoice.ORGINALINVOICEDATE = originalInvoice.INVOICEDATE;
      originalInvoice.ORIGINALGSTIN = originalInvoice.PASSENGERGSTIN;
      originalInvoice.ORIGINALSECTIONTYPE = originalInvoice.SECTIONTYPE;
      originalInvoice.INVOICENUMBER = creditInvoceNumber;
      originalInvoice.AMENDEMENTSTATUS = status
      originalInvoice.AMENDMENTAPPROVEDBY = email
      originalInvoice.AMENDMENTAPPROVEDON = timestamp
      originalInvoice.DOCUMENTTYPE = 'CREDIT'
      originalInvoice.INVOICEDATE = newInvoiceDate
      originalInvoice.GSTR1PERIOD = (today.getMonth()) + 1
      originalInvoice.CREATEDBY = email
      originalInvoice.CREATEDAT = timestamp;
      originalInvoice.INVOICESTATUS = 'INV_TO_BE_PROCESSED'

      if (!isSamePeriod) {
        const columns = Object.keys(originalInvoice);
        const values = Object.values(originalInvoice);
        const placeholders = values.map(() => '?').join(',');
        const insertQuery = `INSERT INTO INVOICE (${columns.join(',')}) VALUES (${placeholders})`;
        await db.exec(insertQuery, values);
      }

      originalInvoice.PASSENGERGSTIN = originalInvoice.AMENDEMENTNEWVALUE

      for (const invoiceItem of invoiceItems) {

        if (invoiceItem) {

          invoiceItem.INVOICE_ID = creditInvoiceID;

          const { status, data } = await ruleEngine(db, originalInvoice.AMENDEMENTNEWVALUE, originalInvoice.SUPPLIERGSTIN, invoiceItem)

          const {
            taxCode,
            placeofsupply
          } = data

          // const query = `
          //   UPDATE INVOICE 
          //   SET
          //     PLACEOFSUPPLY = ?
          //   WHERE ID = ?
          // `;

          // await db.exec(query, [placeofsupply, creditInvoiceID]);

          originalInvoice.PLACEOFSUPPLY = placeofsupply;

          // const itemQuery = 'SELECT * FROM INVOICEITEMS WHERE INVOICE_ID = ?'
          // const invoiceItems = (await db.exec(itemQuery, [originalInvoiceId]))


          originalInvoice.TAXCODE = taxCode
          // invoiceItem.COLLECTEDCGSTRATE = cgstRate
          // invoiceItem.COLLECTEDSGSTRATE = sgstRate
          // invoiceItem.COLLECTEDIGSTRATE = igstRate
          // invoiceItem.COLLECTEDUTGSTRATE = ugstRate
          // invoiceItem.COLLECTEDCGST = cgst
          // invoiceItem.COLLECTEDSGST = sgst
          // invoiceItem.COLLECTEDIGST = igst
          // invoiceItem.COLLECTEDUTGST = ugst

          if (!isSamePeriod) {
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

      const newGSTINDetails = await getGSTINDetails(db, newGSTIN)

      originalInvoice.ID = newInvoiceID
      originalInvoice.INVOICENUMBER = newInvoceNumber;
      originalInvoice.DOCUMENTTYPE = 'INVOICE';
      originalInvoice.INVOICESTATUS = 'INV_TO_BE_PROCESSED'
      originalInvoice.BILLTONAME = newGSTINDetails.legalName
      originalInvoice.BILLTOFULLADDRESS = newGSTINDetails.address
      originalInvoice.BILLTOPOSTALCODE = newGSTINDetails.postalCode
      originalInvoice.BILLTOSTATECODE = newGSTINDetails.stateCode


      const invoiceColumns = Object.keys(originalInvoice);
      const invoiceValues = Object.values(originalInvoice);
      const invoicePlaceholders = invoiceValues.map(() => '?').join(',');
      const invoiceInsertQuery = `INSERT INTO INVOICE (${invoiceColumns.join(',')}) VALUES (${invoicePlaceholders})`;
      await db.exec(invoiceInsertQuery, invoiceValues);

      for (const invoiceItem of invoiceItems) {

        if (invoiceItem) {

          const { status, data } = await ruleEngine(db, originalInvoice.AMENDEMENTNEWVALUE, originalInvoice.SUPPLIERGSTIN, invoiceItem)

          const {
            taxCode, cgst,
            cgstRate, sgst,
            sgstRate, ugst,
            ugstRate, igst,
            igstRate,
            collectedcgst,
            collectedcgstRate,
            collectedsgst,
            collectedsgstRate,
            collectedugst,
            collectedugstRate,
            collectedigst,
            collectedigstRate,
            placeofsupply
          } = data

          invoiceItem.CGSTRATE = cgstRate
          invoiceItem.CGSTAMOUNT = cgst
          invoiceItem.SGSTRATE = sgstRate
          invoiceItem.SGSTAMOUNT = sgst
          invoiceItem.UTGSTRATE = ugstRate
          invoiceItem.UTGSTAMOUNT = ugst
          invoiceItem.IGSTRATE = igstRate
          invoiceItem.IGSTAMOUNT = igst
          invoiceItem.COLLECTEDCGSTRATE = collectedcgstRate
          invoiceItem.COLLECTEDSGSTRATE = collectedsgstRate
          invoiceItem.COLLECTEDIGSTRATE = collectedigstRate
          invoiceItem.COLLECTEDUTGSTRATE = collectedugstRate
          invoiceItem.COLLECTEDCGST = collectedcgst
          invoiceItem.COLLECTEDSGST = collectedsgst
          invoiceItem.COLLECTEDIGST = collectedigst
          invoiceItem.COLLECTEDUTGST = collectedugst


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

      try {
        const emailAddress = originalInvoice.AMENDMENTREQUESTEDBY
        const name = ((await getUserData(db, emailAddress))?.data?.FIRSTNAME) ?? "User"
        sendAmendmentApproveorRejectMailToUser(name, emailAddress, originalInvoice.PASSENGERGSTIN, originalInvoice.AMENDEMENTOLDVALUE, "GSTIN", "approved")
      } catch (error) {
        console.log("Error sending mail to user");
      }



      // console.log(invoiceItems);


    }

    if (status == "R") {
      const query = `
            UPDATE INVOICE 
            SET
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

      try {

        const emailAddress = originalInvoice.AMENDMENTREQUESTEDBY
        const name = ((await getUserData(db, emailAddress))?.data?.FIRSTNAME) ?? "User"
        sendAmendmentApproveorRejectMailToUser(name, emailAddress, originalInvoice.AMENDEMENTNEWVALUE, originalInvoice.AMENDEMENTOLDVALUE, "GSTIN", "rejected")
      } catch (error) {
        console.log("Error sending mail to user");
      }

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
console.log(originalInvoice,"originalInvoice")
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];


  try {

    let message;

    if (status == "A") {

      const isEligibleForAmendment = validateAmendmentDate(originalInvoice?.INVOICEDATE)

      if(!isEligibleForAmendment){
        return {
          status: 'FAILED',
          message: 'Invoice is not eligible for approval',
        }; 
      }
  

      const newInvoceNumber = null
      const creditInvoceNumber = null

      let invoiceStatus = 'Active';

      // if(originalInvoice?.GSTR1FILINGSTATUS == 'F'){
      //   invoiceStatus = 'Rejected'
      // }

      const originalInvoiceId = originalInvoice.ID;

      const [year, month, date] = originalInvoice.INVOICEDATE.split('-')
      const invoiceDate = new Date(year, month - 1, date)

      const today = new Date()
      const isSamePeriod = compareMonthAndYear(invoiceDate, today)
      const newInvoiceDate = today.toISOString().split('T')[0]
      const currentDate = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(currentDate.getMonth() - 1);

      if (invoiceDate > oneMonthAgo && invoiceDate <= currentDate) {
        invoiceStatus = 'Active'
      } else {
        invoiceStatus = 'Rejected'
      }

      const newInvoiceStatus = isSamePeriod ? 'Cancelled' : 'Active'

      const query = `
        UPDATE INVOICE 
        SET
          INVOICESTATUS = ?,
          AMENDEMENTSTATUS = ?,
          AMENDMENTAPPROVEDBY = ?,
          AMENDMENTAPPROVEDON = ?
        WHERE ID = ?
      `;
      await db.exec(query, [newInvoiceStatus, 'A', email, timestamp, id]);

      const itemQuery = 'SELECT * FROM INVOICEITEMS WHERE INVOICE_ID = ?'
      const invoiceItems = await db.exec(itemQuery, [originalInvoiceId])

      if (isSamePeriod) await addCancelledWatermarkToPdf(db, originalInvoiceId, email)


      message = "Amendment request approved successfully"


      const newInvoiceID = uuid()
      const creditInvoiceID = uuid()

     console.log(' originalInvoice.ORIGINALINVOICENUMBER :>> ', originalInvoice.ORIGINALINVOICENUMBER );
      originalInvoice.ID = creditInvoiceID
      originalInvoice.ORIGINALINVOICENUMBER = originalInvoice.INVOICENUMBER;
      originalInvoice.ORGINALINVOICEDATE = originalInvoice.INVOICEDATE;
      originalInvoice.AMENDEMENTOLDVALUE = originalInvoice.BILLTOFULLADDRESS
      originalInvoice.ORIGINALGSTIN = originalInvoice.PASSENGERGSTIN;
      originalInvoice.ORIGINALSECTIONTYPE = originalInvoice.SECTIONTYPE;
      originalInvoice.INVOICENUMBER = creditInvoceNumber;
      originalInvoice.AMENDEMENTSTATUS = status
      originalInvoice.AMENDMENTAPPROVEDBY = email
      originalInvoice.AMENDMENTAPPROVEDON = timestamp
      originalInvoice.DOCUMENTTYPE = 'CREDIT'
      originalInvoice.INVOICEDATE = newInvoiceDate
      originalInvoice.GSTR1PERIOD = (today.getMonth()) + 1
      originalInvoice.CREATEDBY = email
      originalInvoice.CREATEDAT = timestamp;
      originalInvoice.INVOICESTATUS = 'INV_TO_BE_PROCESSED'
      originalInvoice.BILLTONAME = ''

      if (!isSamePeriod) {
        const columns = Object.keys(originalInvoice);
        const values = Object.values(originalInvoice);
        const placeholders = values.map(() => '?').join(',');
        const insertQuery = `INSERT INTO INVOICE (${columns.join(',')}) VALUES (${placeholders})`;
        await db.exec(insertQuery, values);
      }

      originalInvoice.PASSENGERGSTIN = ""
      originalInvoice.BILLTOFULLADDRESS = originalInvoice.AMENDEMENTNEWVALUE
      originalInvoice.SECTIONTYPE = 'B2C';


      for (const invoiceItem of invoiceItems) {

        if (invoiceItem) {

          invoiceItem.INVOICE_ID = creditInvoiceID;

          if (invoiceItem.COLLECTEDIGST && invoiceItem.COLLECTEDIGST != '0') {

            const { status, data } = await ruleEngine(db, "UNKNOWN", originalInvoice.SUPPLIERGSTIN, invoiceItem)

            const {
              taxCode, cgst,
              cgstRate, sgst,
              sgstRate, ugst,
              ugstRate, igst,
              igstRate,
              placeofsupply
            } = data

            originalInvoice.PLACEOFSUPPLY = placeofsupply;

            originalInvoice.TAXCODE = taxCode
            // invoiceItem.COLLECTEDCGSTRATE = cgstRate
            // invoiceItem.COLLECTEDSGSTRATE = sgstRate
            // invoiceItem.COLLECTEDIGSTRATE = igstRate
            // invoiceItem.COLLECTEDUTGSTRATE = ugstRate
            // invoiceItem.COLLECTEDCGST = cgst
            // invoiceItem.COLLECTEDSGST = sgst
            // invoiceItem.COLLECTEDIGST = igst
            // invoiceItem.COLLECTEDUTGST = ugst

          }

          if (!isSamePeriod) {
            const itemColumns = Object.keys(invoiceItem);
            const itemValues = Object.values(invoiceItem);
            const placeholders = itemValues.map(() => '?').join(',');
            const insertQuery = `INSERT INTO INVOICEITEMS (${itemColumns.join(',')}) VALUES (${placeholders})`;
            const result = await db.exec(insertQuery, itemValues);
          }
        }

      }

      originalInvoice.ID = newInvoiceID
      originalInvoice.INVOICENUMBER = newInvoceNumber;
      originalInvoice.DOCUMENTTYPE = 'INVOICE';
      originalInvoice.INVOICESTATUS = 'INV_TO_BE_PROCESSED'

      const invoiceColumns = Object.keys(originalInvoice);
      const invoiceValues = Object.values(originalInvoice);
      const invoicePlaceholders = invoiceValues.map(() => '?').join(',');
      const invoiceInsertQuery = `INSERT INTO INVOICE (${invoiceColumns.join(',')}) VALUES (${invoicePlaceholders})`;
      await db.exec(invoiceInsertQuery, invoiceValues);

      for (const invoiceItem of invoiceItems) {

        if (invoiceItem) {

          const collectedIGST = Number(invoiceItem?.COLLECTEDIGST)
          if (collectedIGST > 0) {

            const { status, data } = await ruleEngine(db, "UNKNOWN", originalInvoice.SUPPLIERGSTIN, invoiceItem)

            const {
              taxCode, cgst,
              cgstRate, sgst,
              sgstRate, ugst,
              ugstRate, igst,
              igstRate,
              collectedcgst,
              collectedcgstRate,
              collectedsgst,
              collectedsgstRate,
              collectedugst,
              collectedugstRate,
              collectedigst,
              collectedigstRate,
              placeofsupply
            } = data

            invoiceItem.CGSTRATE = cgstRate
            invoiceItem.CGSTAMOUNT = cgst
            invoiceItem.SGSTRATE = sgstRate
            invoiceItem.SGSTAMOUNT = sgst
            invoiceItem.UTGSTRATE = ugstRate
            invoiceItem.UTGSTAMOUNT = ugst
            invoiceItem.IGSTRATE = igstRate
            invoiceItem.IGSTAMOUNT = igst
            invoiceItem.COLLECTEDCGSTRATE = collectedcgstRate
            invoiceItem.COLLECTEDSGSTRATE = collectedsgstRate
            invoiceItem.COLLECTEDIGSTRATE = collectedigstRate
            invoiceItem.COLLECTEDUTGSTRATE = collectedugstRate
            invoiceItem.COLLECTEDCGST = collectedcgst
            invoiceItem.COLLECTEDSGST = collectedsgst
            invoiceItem.COLLECTEDIGST = collectedigst
            invoiceItem.COLLECTEDUTGST = collectedugst

          }



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


      try {

        const emailAddress = originalInvoice.AMENDMENTREQUESTEDBY
        const name = ((await getUserData(db, emailAddress))?.data?.FIRSTNAME) ?? "User"
        sendAmendmentApproveorRejectMailToUser(name, emailAddress, originalInvoice.BILLTOFULLADDRESS, originalInvoice.AMENDEMENTOLDVALUE, "Remove GSTIN", "approved")
      } catch (error) {
        console.log("Error sending mail to user");
      }

    }

    if (status == "R") {
      const query = `
            UPDATE INVOICE 
            SET
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

      try {

        const emailAddress = originalInvoice.AMENDMENTREQUESTEDBY
        const name = ((await getUserData(db, emailAddress))?.data?.FIRSTNAME) ?? "User"
        sendAmendmentApproveorRejectMailToUser(name, emailAddress, originalInvoice.AMENDEMENTNEWVALUE, originalInvoice.AMENDEMENTOLDVALUE, "Remove GSTIN", "rejected")
      } catch (error) {
        console.log("Error sending mail to user");
      }

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

      const isEligibleForAmendment = validateAmendmentDate(originalInvoice?.INVOICEDATE)

      if(!isEligibleForAmendment){
        return {
          status: 'FAILED',
          message: 'Invoice is not eligible for approval',
        }; 
      }

      const invoiceType = originalInvoice?.DOCUMENTTYPE ?? "";
      const originalInvoiceId = originalInvoice?.ID;


      const newInvoceNumber = null
      const creditInvoceNumber = null

      const [year, month, date] = originalInvoice?.INVOICEDATE?.split('-')
      const invoiceDate = new Date(year, month - 1, date)

      const today = new Date()
      const isSamePeriod = compareMonthAndYear(invoiceDate, today)
      const newInvoiceDate = today.toISOString().split('T')[0]
      const currentDate = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(currentDate.getMonth() - 1);

      if (invoiceDate > oneMonthAgo && invoiceDate <= currentDate) {
        invoiceStatus = 'Active'
      } else {
        invoiceStatus = 'Cancelled'
      }

      const newInvoiceStatus = isSamePeriod ? 'Cancelled' : 'Active'

      const query = `
        UPDATE INVOICE 
        SET
          INVOICESTATUS = ?,
          AMENDEMENTSTATUS = ?,
          AMENDMENTAPPROVEDBY = ?,
          AMENDMENTAPPROVEDON = ?
        WHERE ID = ?
      `;

      await db.exec(query, [newInvoiceStatus, 'A', email, timestamp, id]);

      if (isSamePeriod) await addCancelledWatermarkToPdf(db, originalInvoiceId, email)

      let newDocumentType;
      let finalDocumentType;

      switch (invoiceType) {
        case "INVOICE":
          newDocumentType = "CREDIT";
          finalDocumentType = "INVOICE";
          break;
        case "BOS":
          newDocumentType = "BOSCN";
          finalDocumentType = "BOS";
          break;
        case "BOSCN":
          newDocumentType = "BOSDN";
          finalDocumentType = "BOSCN";
          break;
        case "BOSDN":
          newDocumentType = "BOSCN";
          finalDocumentType = "BOSDN";
          break;
        case "CREDIT":
          newDocumentType = "DEBIT";
          finalDocumentType = "CREDIT";
          break;
        case "DEBIT":
          newDocumentType = "CREDIT";
          finalDocumentType = "DEBIT";
          break;
        default:
          newDocumentType = "CREDIT";
          finalDocumentType = "INVOICE";
      }

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
      originalInvoice.DOCUMENTTYPE = newDocumentType
      originalInvoice.INVOICEDATE = newInvoiceDate
      originalInvoice.GSTR1PERIOD = (today.getMonth()) + 1
      originalInvoice.CREATEDBY = email
      originalInvoice.CREATEDAT = timestamp;
      originalInvoice.INVOICESTATUS = 'INV_TO_BE_PROCESSED'

      if (!isSamePeriod) {
        const columns = Object.keys(originalInvoice);
        const values = Object.values(originalInvoice);
        const placeholders = values.map(() => '?').join(',');
        const insertQuery = `INSERT INTO INVOICE (${columns.join(',')}) VALUES (${placeholders})`;
        await db.exec(insertQuery, values);
      }

      const itemQuery = 'SELECT * FROM INVOICEITEMS WHERE INVOICE_ID = ?'
      const invoiceItems = await db.exec(itemQuery, [originalInvoiceId])

      if (!isSamePeriod) {
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
      }


      originalInvoice.ID = newInvoiceID
      originalInvoice.INVOICENUMBER = newInvoceNumber;
      originalInvoice.DOCUMENTTYPE = finalDocumentType;
      originalInvoice.INVOICESTATUS = 'INV_TO_BE_PROCESSED'

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

      message = "Amendment request approved. Invoice will be generated soon."

      try {
        const emailAddress = originalInvoice.AMENDMENTREQUESTEDBY
        const name = ((await getUserData(db, emailAddress))?.data?.FIRSTNAME) ?? "User"
        sendAmendmentApproveorRejectMailToUser(name, emailAddress, originalInvoice.BILLTOFULLADDRESS, originalInvoice.AMENDEMENTOLDVALUE, "Address", "approved")
      } catch (error) {
        console.log("Error sending mail to user");
      }

    }

    if (status == "R") {
      const query = `
            UPDATE INVOICE 
            SET
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

      try {

        const emailAddress = originalInvoice.AMENDMENTREQUESTEDBY
        const name = ((await getUserData(db, emailAddress))?.data?.FIRSTNAME) ?? "User"
        sendAmendmentApproveorRejectMailToUser(name, emailAddress, originalInvoice.AMENDEMENTNEWVALUE, originalInvoice.AMENDEMENTOLDVALUE, "Address", "rejected")
      } catch (error) {
        console.log("Error sending mail to user");
      }

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


function compareMonthAndYear(date1, date2) {
  const sameMonth = date1.getMonth() === date2.getMonth();
  const sameYear = date1.getFullYear() === date2.getFullYear();

  return sameMonth && sameYear;
}