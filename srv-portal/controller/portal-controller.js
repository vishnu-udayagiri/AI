const isEmail = require('validator/lib/isEmail');
const { generateResponse } = require('../libs/response.js');
const { generateJWT } = require('../libs/jwt');
const { generateOTP, sendEMail } = require('../libs/otp.js');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const _ = require('lodash');
const { jsonToExcelBase64 } = require('../helpers/json2excel.helper.js');
const { getInvoicesFromPassengerGSTIN, getAllInvoicesFromGSTIN, getDefaultPeriod, getFilterData } = require('../db/invoices.db.js');
const { CompanyUserRole } = require('../utils/common-query.js');
const { getDefaultGSTIN, getGSTINs, getGSTINsForAdmin, getGSTINsForUsers } = require('../db/gst.db.js');
const { getFiscalYearBounds, getFinancialYearDates, isValidValue, isValidValueExcludingArray, checkElementsInArray } = require('../helpers/common.helper.js');
const { getAgents, getAgentDetails, getAgentsForUsers } = require('../db/agent.db.js');
const { getPlaceOfSupplyDetails } = require('../db/masters.db');
const { validategetInvoiceRequest } = require('../validations/get.invoice.req.validation.js');

const getInvoiceData = async (req, res) => {
  try {
    const db = req.db;
    const user = req.user.email;
    const invoices = await db.exec(`SELECT * FROM INVOICE`);
    const defaultGSTIN = await db.exec(`SELECT GSTNO FROM CUSTOMERMASTERGST WHERE GST_ID in (
            SELECT ID from CUSTOMERMASTER WHERE LOWER(LOGINEMAIL) = LOWER('${user}')) AND DEFAULT = true`)[0];
    const distinctSupplierGstin = [];
    const distinctInvoiceNumber = [];
    const distinctPnr = [];
    const distinctTicketNumber = [];
    const distinctAgentIataNumber = [];

    invoices.forEach((invoice) => {
      distinctSupplierGstin.push({
        SUPPLIERGSTIN: invoice.SUPPLIERGSTIN,
      });
      distinctInvoiceNumber.push({
        INVOICENUMBER: invoice.INVOICENUMBER,
      });
      distinctPnr.push({
        TICKETNUMBER: invoice.TICKETNUMBER,
      });
      distinctAgentIataNumber.push({
        IATANUMBER: invoice.IATANUMBER,
      });
    });

    const output = {
      distinctSupplierGstin,
      distinctInvoiceNumber,
      distinctPnr,
      distinctTicketNumber,
      distinctAgentIataNumber,
      invoices,
      defaultGSTIN,
    };

    return res.status(200).send(generateResponse('Success', 'Succesfully fetched', 'T', 'S', 'null', false, output));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

const getInvoicesForUser = async (req, res) => {
  try {
    const db = req.db;
    const companyId = req.user.Cid;
    const userId = req.user.Uid;
    // console.log(req.user);
    const { ISB2A } = req.user;

    const resFilters = {};

    const pageNumber = req?.body?.pageNumber ?? null;
    const pageSize = req?.body?.pageSize ?? null;
    const from = req?.body?.from ?? '';
    const to = req?.body?.to ?? '';
    const issuanceFrom = req?.body?.issuanceFrom ?? '';
    const issuanceTo = req?.body?.issuanceTo ?? '';
    const financialYear = req?.body?.financialYear ?? '';
    const apiType = req?.body?.apiType ?? '';

    const defaultPeriod = (await getDefaultPeriod(db, userId)).data ?? 'CY'
    let invoiceFilter = req?.body?.invoiceFilter ?? defaultPeriod;
    const isInitial = req?.body?.isInitial ?? false;

    if (apiType == 'documentHistory') {
      invoiceFilter = ''
    }

    let defaultDocumentTypes = ['INVOICE', 'DEBIT', 'CREDIT', 'BOS', 'BOSCN', 'BOSDN']
    let documentType = req?.body?.documentType ?? defaultDocumentTypes;
    documentType = Array.isArray(documentType) ? documentType.map(item => item?.trim()?.toUpperCase() ?? 'INVOICE') : [documentType?.trim()?.toUpperCase() ?? 'INVOICE']; //req?.body?.documentType?.trim()?.toUpperCase() ?? 'INVOICE';

    // if (!defaultDocumentTypes.includes(documentType)) {
    //   const response = generateResponse('FAILED', 'Invalid document type', 'T', 'E', '', '', '');
    //   return res.json(response);
    // }

    let agentName = [];

    const filters = {
      invoiceFilter: invoiceFilter,
      invoiceNumber: req?.body?.invoiceNumber ?? [],
      iataNumber: req?.body?.iataNumber ?? [],
      supplierGSTIN: req?.body?.supplierGSTIN ?? [],
      passengerGSTIN: req?.body?.passengerGSTIN ?? [],
      ticketNumber: req?.body?.ticketNumber ?? [],
      from: from,
      to: to,
      issuanceFrom: issuanceFrom,
      issuanceTo: issuanceTo,
      financialYear: financialYear,
      documentType: documentType,
      pnr: req?.body?.pnr ?? [],
      billToName: req?.body?.billToName ?? [],
      passengerName: req?.body?.passengerName ?? [],
    };



    if ((from && !to) || (!from && to)) {
      const response = generateResponse('FAILED', 'The date range cannot be partial..', 'T', 'E', '', '', '');
      return res.json(response);
    }

    if ((issuanceFrom && !issuanceTo) || (!issuanceFrom && issuanceTo)) {
      const response = generateResponse('FAILED', 'The date range cannot be partial..', 'T', 'E', '', '', '');
      return res.json(response);
    }

    // console.log("Financial Year ::",financialYear,"From ::", from ,"To ::", to);
    // console.log((financialYear && from && to));

    if (financialYear && from && to) {
      const _from = moment(from, 'YYYY-MM-DD').toDate();
      const _to = moment(to, 'YYYY-MM-DD').toDate();

      if (_from >= _to) {
        const response = generateResponse('FAILED', 'The Issuance From value should be greater than Issuance to.', 'T', 'E', '', '', '');
        return res.json(response);
      }

      const financialYearDateRange = getFinancialYearDates(financialYear);
      // console.log(financialYearDateRange);

      if (_from <= financialYearDateRange.start || _to >= financialYearDateRange.stop) {
        const response = generateResponse('FAILED', 'The date range should be in between financial years.s.', 'T', 'E', '', '', '');
        return res.json(response);
      }
    }

    if (financialYear && issuanceFrom && issuanceTo) {
      const _from = moment(issuanceFrom, 'YYYY-MM-DD').toDate();
      const _to = moment(issuanceTo, 'YYYY-MM-DD').toDate();

      if (_from >= _to) {
        const response = generateResponse('FAILED', 'The Issuance From value should be greater than Issuance to.', 'T', 'E', '', '', '');
        return res.json(response);
      }

      const financialYearDateRange = getFinancialYearDates(financialYear);
      // console.log(financialYearDateRange);

      if (_from <= financialYearDateRange.start || _to >= financialYearDateRange.stop) {
        const response = generateResponse('FAILED', 'Issuance The date range should be in between financial years.s.', 'T', 'E', '', '', '');
        return res.json(response);
      }
    }

    const generateExcel = req?.body?.generateExcel ?? false;

    // const defaultGSTIN = "33AAACT8102H1ZR"

    const cleanedFilters = _.pickBy(filters, isValidValue);

    if (Object.keys(cleanedFilters).length == 0) {
      cleanedFilters.invoiceFilter = 'CY';
      resFilters.invoiceFilter = 'CY';
    } else {
      resFilters.invoiceFilter = invoiceFilter;
    }

    // const companyUserData = await db.exec(CompanyUserRole(null, null, email, null, null))[0];
    // let companyId = '';
    // if (companyUserData) {
    //   companyId = companyUserData['COMPANYID'];
    // }

    let defaultGSTIN = '';
    let allGSTINs = [];
    if (userId) {
      defaultGSTIN = (await getDefaultGSTIN(db, userId)).data;
      allGSTINs = (await getGSTINs(db, userId)).data;
    }

    if (!defaultGSTIN) {
      const data = {
        totalInvoices: 0,
        invoices: [],
      };

      const response = generateResponse('Success', 'Invoice(s) fetched successfully.', 'T', 'E', '', '', data);
      return res.json(response);
    }

    resFilters.defaultGSTIN = defaultGSTIN;
    resFilters.allGSTINs = allGSTINs;
    resFilters.financialYear = financialYear;
    resFilters.from = from;
    resFilters.to = to;
    resFilters.issuanceFrom = issuanceFrom;
    resFilters.issuanceTo = issuanceTo;

    // need to add validation on GST and iataNumber

    if (ISB2A) {
      agentName = (await getAgents(db, companyId)).data
      agentName = _.without(_.uniq(agentName), null, undefined, '', 'null');

      const bookingType = req?.body?.isMyBookings ?? 'my bookings'

      if (bookingType != 'my bookings' && bookingType != 'booked through') {
        const response = generateResponse('FAILED', 'Invalid booking type.', 'T', 'E', '', '', '');
        return res.json(response);
      }

      if (bookingType != 'my bookings') {
        if (!cleanedFilters.hasOwnProperty('iataNumber')) {
          if (agentName.length > 0) {
            cleanedFilters.iataNumber = agentName
          } else {
            const response = generateResponse('FAILED', 'Agent code not found.', 'T', 'E', '', '', '');
            return res.json(response);
          }
        }
      } else {
        if (!cleanedFilters.hasOwnProperty('passengerGSTIN')) {
          cleanedFilters.passengerGSTIN = [defaultGSTIN]
        }
      }

    } else {

      if (!cleanedFilters.hasOwnProperty('passengerGSTIN')) {
        cleanedFilters.passengerGSTIN = [defaultGSTIN]
      }

    }


    console.log(cleanedFilters);


    const invoices = (await getInvoicesFromPassengerGSTIN(db, pageNumber, pageSize, cleanedFilters)).data;
    const _invoices = (await getAllInvoicesFromGSTIN(db, allGSTINs)).data;

    let iataNumber = [];
    let invoiceNumbers = [];
    let supplierGSTIN = [];
    let passengerGSTIN = [];
    let ticketNumber = [];
    let billToName = []
    let pnr = [];
    let passengerNames = [];


    // if (!ISB2A) {
    //   iataNumber.push(...(await getAgents(db, companyId)).data)
    // }

    for (const invoice of invoices) {
      iataNumber.push(invoice.IATANUMBER);
      invoiceNumbers.push(invoice.INVOICENUMBER);
      supplierGSTIN.push(invoice.SUPPLIERGSTIN);
      passengerGSTIN.push(invoice.PASSENGERGSTIN);
      ticketNumber.push(invoice.TICKETNUMBER);
      billToName.push(invoice.BILLTONAME)
      pnr.push(invoice.PNR)
      passengerNames.push(invoice.PASSANGERNAME)
    }

    iataNumber = _.without(_.uniq(iataNumber), null, undefined, '', 'null');
    invoiceNumbers = _.without(_.uniq(invoiceNumbers), null, undefined, '', 'null');
    supplierGSTIN = _.without(_.uniq(supplierGSTIN), null, undefined, '', 'null');
    passengerGSTIN = _.without(_.uniq(passengerGSTIN), null, undefined, '');
    ticketNumber = _.without(_.uniq(ticketNumber), null, undefined, '', 'null');
    billToName = _.without(_.uniq(billToName), null, undefined, "", 'null')
    pnr = _.without(_.uniq(pnr), null, undefined, "", 'null')
    passengerNames = _.without(_.uniq(passengerNames), null, undefined, '');

    resFilters.iataNumber = (await getAgentDetails(db, iataNumber)).data
    resFilters.invoiceNumbers = invoiceNumbers;
    resFilters.supplierGSTIN = supplierGSTIN;
    resFilters.passengerGSTIN = passengerGSTIN;
    resFilters.ticketNumber = ticketNumber;
    resFilters.agentName = (await getAgentDetails(db, agentName)).data;
    resFilters.billToName = billToName;
    resFilters.pnr = pnr;
    resFilters.passengerName = passengerNames;

    if (!generateExcel) {
      const data = {
        totalInvoices: _invoices.length,
        invoices,
      };

      if (isInitial) {
        data.filters = resFilters
      }

      const response = generateResponse('Success', 'Invoice(s) fetched successfully.', 'T', 'E', '', '', data);
      return res.json(response);
    }

    try {
      const columns = {
        "DOCUMENTTYPE": "Invoice Type",
        "INVOICENUMBER": "Document No.",
        "INVOICEDATE": "Document Date",
        "TICKETNUMBER": "Ticket No.",
        "TICKETISSUEDATE": "Ticket Issue Date",
        "PNR": "PNR",
        "BILLTONAME": "Passenger Name",
        "PASSENGERGSTIN": "Passenger GSTIN",
        "SUPPLIERGSTIN": "Supplier GSTIN",
        "NETTAXABLEVALUE": "Net Taxable Value",
        "TOTALTAX": "Total Tax Amount",
        "TOTALINVOICEAMOUNT": "Total Invoice Amount",
        "CGSTRATE": "CGST Rate (%)",
        "COLLECTEDCGST": "CGST Amount",
        "SGSTRATE": "SGST Rate (%)",
        "COLLECTEDSGST": "SGST Amount",
        "IGSTRATE": "IGST Rate (%)",
        "COLLECTEDIGST": "IGST Amount",
        "CGSTAMOUNT": "CGST Amount",
        "SGSTAMOUNT": "SGST Amount",
        "IGSTAMOUNT": "IGST Amount",
        "TRANSACTIONCODE": "Transaction Type",
        "ISSUEINDICATOR": "Issue Indicator",
        "INVOICESTATUS": "Invoice Status"
      }
      const excel = await jsonToExcelBase64(invoices, columns);
      const data = {
        excel,
      };

      if (isInitial) {
        data.filters = resFilters
      }

      const response = generateResponse('Success', 'Excel generated successfully.', 'T', 'E', '', '', data);
      res.json(response);
    } catch (error) {
      console.log('Error occurred ::', error);
      const response = generateResponse('Failed', 'Failed to generate the Excel.', 'T', 'E', '', '', error);
      res.json(response);
    }
  } catch (error) {
    console.log('Error occurred ::', error);
    const response = generateResponse('Failed', 'Failed to fetch invoice(s).', 'T', 'E', '', '', error);
    res.json(response);
  }
};

const getDashboardDetails = async (req, res) => {
  const db = req.db;
  const { ISB2A, UserRole, Cid, Uid, category } = req.user;
  let defaultGSTIN = [{}];
  let defaultPeriod = [{}];
  let intialGST = [{}];
  let avatharName;
  let iataNumber = [{}];
  if (req.query.passengerGSTIN) {
    const selectedGst = req.query.passengerGSTIN.replace(/['"]+/g, '');
    const gstinArray = selectedGst.split(',');
    intialGST = gstinArray.map(gstin => ({ gstin }));
    defaultPeriod[0].DEFAULTPERIOD = req.query.period;
  } else {
    intialGST = await db.exec(`SELECT GSTIN as "gstin" FROM USERDEFAULTGSTIN WHERE USERID='${Uid}' AND ISDEFAULT=true`);
    defaultPeriod = await db.exec(`SELECT DEFAULTPERIOD FROM USERDEFAULT WHERE USERID='${Uid}'`);
  }
  defaultGSTIN = intialGST.map(gstin => `'${gstin.gstin}'`).join(',');
  let conditions = [];
  let today = new Date();
  let dateBounds;
  let period;

  if (req.query.period) {
    // If req.query.period is truthy, set period to its value
    period = req.query.period;
  } else if (defaultPeriod.length > 0) {
    // If req.query.period is falsy and defaultPeriod has elements, set period to the first element's DEFAULTPERIOD
    period = defaultPeriod[0].DEFAULTPERIOD;
  } else {
    // If req.query.period is falsy and defaultPeriod is empty, set period to 'CY'
    period = 'CY';
  }
  switch (period) {
    case 'CM':
      conditions.push(`MONTH(INVOICEDATE) = ${today.getMonth() + 1}`);
      break;
    case 'PM':
      let lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      conditions.push(`MONTH(INVOICEDATE) = ${lastMonth.getMonth() + 1}`);
      break;
    case 'CY':
      dateBounds = getFiscalYearBounds(today);
      conditions.push(`INVOICEDATE BETWEEN CAST('${dateBounds.start.toISOString().split('T')[0]}' AS DATE) AND CAST('${dateBounds.end.toISOString().split('T')[0]}' AS DATE)`);
      break;
    case 'PY':
      if (req.query.from && req.query.to) {
        conditions.push(`INVOICEDATE BETWEEN CAST('${req.query.from}' AS DATE) AND CAST('${req.query.to}' AS DATE)`);
      }
      else {
        var lastYear;
        if (req.query.financialYear) {
          const year = parseInt(req.query.financialYear, 10);
          lastYear = new Date(year, 3, 1);
        }
        else {
          lastYear = new Date(today.getFullYear() - 1, today.getMonth(), 1);
        }
        dateBounds = getFiscalYearBounds(lastYear);
        conditions.push(`INVOICEDATE BETWEEN CAST('${dateBounds.start.toISOString().split('T')[0]}' AS DATE) AND CAST('${dateBounds.end.toISOString().split('T')[0]}' AS DATE)`);
      }
      break;
  }
  let finalConditions = conditions.filter(Boolean).join(' AND ');
  try {
    const userDetails = await db.exec(`SELECT FIRSTNAME, LASTNAME FROM COMPANYUSERS WHERE ID='${Uid}'`);
    if (userDetails.length > 0) {
      const firstName = userDetails[0].FIRSTNAME;
      const lastName = userDetails[0].LASTNAME;
      // Ensure both first name and last name are not empty
      if (firstName && lastName) {
        avatharName = `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
      }
      else {
        avatharName = `${firstName.charAt(0).toUpperCase()}${firstName.charAt(1).toUpperCase()}`;
      }
    }
    const compantName = await db.exec(`SELECT COMPANYNAME FROM COMPANYMASTER WHERE ID='${Cid}'`);
    const Roles = await db.exec(`SELECT ISADMIN, CANAMENDMENTREQUEST, CANAMENDMENTAPPROVE FROM COMPANYUSERROLES WHERE COMPANYID='${Cid}' AND  USERID='${Uid}'`);
    var gstlist = 0, totalAmendment = 0, totalInvoice = 0, totoalTaxAmount = 0,
      totoalCreditTaxAmount = 0, totalAmendmentPending = 0, myBooking = 0, bookedThrough = 0,
      iataTotalTax = 0, iataCreditTax = 0;

    if (defaultGSTIN.length > 0) {
      gstlist = await db.exec(`SELECT GSTIN FROM USERDEFAULTGSTIN WHERE USERID='${Uid}'`);
      totalAmendment = await db.exec(`SELECT COUNT(*) as totalAmendment FROM INVOICE WHERE PASSENGERGSTIN IN (${defaultGSTIN}) AND ISAMENDED=true AND AMENDEMENTSTATUS= 'A' AND ${finalConditions}`);
      myBooking = await db.exec(`SELECT COUNT(*) as totalInvoice FROM INVOICE LEFT JOIN            
      INVOICEITEMS ON INVOICE.ID = INVOICEITEMS.INVOICE_ID WHERE PASSENGERGSTIN IN (${defaultGSTIN}) AND ${finalConditions}`);
      totoalTaxAmount = await db.exec(`SELECT 
      CAST(COALESCE(SUM(CASE WHEN PASSENGERGSTIN IN (${defaultGSTIN}) THEN collectedCgst ELSE 0 END), 0) AS DECIMAL(14, 2)) as cgstAmount,
      CAST(COALESCE(SUM(CASE WHEN PASSENGERGSTIN IN (${defaultGSTIN}) THEN collectedSgst ELSE 0 END), 0) AS DECIMAL(14, 2)) as sgstAmount,
      CAST(COALESCE(SUM(CASE WHEN PASSENGERGSTIN IN (${defaultGSTIN}) THEN collectedutgst ELSE 0 END), 0) AS DECIMAL(14, 2)) as utgstAmount,
      CAST(COALESCE(SUM(CASE WHEN PASSENGERGSTIN IN (${defaultGSTIN}) THEN collectedIgst ELSE 0 END), 0) AS DECIMAL(14, 2)) as igstAmount,
      CAST(COALESCE(SUM(CASE WHEN PASSENGERGSTIN IN (${defaultGSTIN}) THEN collectedCgst ELSE 0 END) + 
              SUM(CASE WHEN PASSENGERGSTIN IN (${defaultGSTIN}) THEN collectedSgst ELSE 0 END) + SUM(CASE WHEN PASSENGERGSTIN IN (${defaultGSTIN}) THEN collectedutgst ELSE 0 END) +
              SUM(CASE WHEN PASSENGERGSTIN IN (${defaultGSTIN}) THEN collectedIgst ELSE 0 END), 0) AS DECIMAL(18, 2)) as taxValue
  FROM INVOICE  INNER JOIN INVOICEITEMS ON ID = INVOICE_ID
  WHERE PASSENGERGSTIN IN (${defaultGSTIN}) AND ${finalConditions} AND INVOICESTATUS <> 'Cancelled' AND DOCUMENTTYPE NOT IN ('CREDIT');
                                      `);
      totoalCreditTaxAmount = await db.exec(`SELECT 
                                      CAST(COALESCE(SUM(CASE WHEN PASSENGERGSTIN IN (${defaultGSTIN}) THEN collectedCgst ELSE 0 END), 0) AS DECIMAL(14, 2)) as cgstAmount,
                                      CAST(COALESCE(SUM(CASE WHEN PASSENGERGSTIN IN (${defaultGSTIN}) THEN collectedSgst ELSE 0 END), 0) AS DECIMAL(14, 2)) as sgstAmount,
                                      CAST(COALESCE(SUM(CASE WHEN PASSENGERGSTIN IN (${defaultGSTIN}) THEN collectedutgst ELSE 0 END), 0) AS DECIMAL(14, 2)) as utgstAmount,
                                      CAST(COALESCE(SUM(CASE WHEN PASSENGERGSTIN IN (${defaultGSTIN}) THEN collectedIgst ELSE 0 END), 0) AS DECIMAL(14, 2)) as igstAmount,
                                
                                      CAST(COALESCE(
                                    SUM(CASE WHEN PASSENGERGSTIN IN (${defaultGSTIN}) THEN collectedCgst ELSE 0 END) + 
                                                SUM(CASE WHEN PASSENGERGSTIN IN (${defaultGSTIN}) THEN collectedSgst ELSE 0 END) + 
                                    SUM(CASE WHEN PASSENGERGSTIN IN (${defaultGSTIN}) THEN collectedutgst ELSE 0 END) +
                                                SUM(CASE WHEN PASSENGERGSTIN IN (${defaultGSTIN}) THEN collectedIgst ELSE 0 END), 0) AS DECIMAL(18, 2)) as taxValue
                                  FROM INVOICE  INNER JOIN INVOICEITEMS ON ID = INVOICE_ID
                                  WHERE PASSENGERGSTIN IN (${defaultGSTIN}) AND ${finalConditions} AND  DOCUMENTTYPE IN ('CREDIT');`);
    }
    let allIATAs = await db.exec(`SELECT IATACODE FROM COMPANYIATA WHERE COMPANYID = '${Cid}'`);

    const userName = userDetails[0].FIRSTNAME.concat(' ', userDetails[0].LASTNAME)
    let userPending = 0;
    let amendementPending = 0;
    if (Roles[0].ISADMIN) {
      userPending = await db.exec(`SELECT COUNT(*) AS row_count FROM COMPANYUSERS WHERE COMPANYID = '${Cid}' AND STATUS = 'P';`);
    }
    if (Roles[0].ISADMIN || Roles[0].CANAMENDMENTREQUEST) {
      amendementPending = await db.exec(`SELECT COUNT(*) AS row_count FROM COMPANYUSERS WHERE COMPANYID = '${Cid}' AND STATUS = 'P';`);
    }
    const customerGSTINs = await db.exec(`SELECT GSTIN FROM COMPANYGSTIN WHERE COMPANYID='${Cid}'`);
    const filtGSTINs = customerGSTINs.map(code => `'${code.GSTIN}'`).join(',');

    if (ISB2A) {
      let iataNumber = await db.exec(`SELECT IATACODE as "iataNumber"  FROM USERIATA WHERE USERID='${Uid}'`);
      let iataCode = iataNumber.map(iataNumber => `'${iataNumber.iataNumber}'`).join(',');

      if (iataCode.length > 0) {
        iataTotalTax = await db.exec(`SELECT 
    CAST(COALESCE(SUM(CASE WHEN IATANUMBER IN (${iataCode}) THEN collectedCgst ELSE 0 END), 0) AS DECIMAL(14, 2)) as cgstAmount,
    CAST(COALESCE(SUM(CASE WHEN IATANUMBER IN (${iataCode}) THEN collectedSgst ELSE 0 END), 0) AS DECIMAL(14, 2)) as sgstAmount,
    CAST(COALESCE(SUM(CASE WHEN IATANUMBER IN (${iataCode}) THEN collectedutgst ELSE 0 END), 0) AS DECIMAL(14, 2)) as utgstAmount,
    CAST(COALESCE(SUM(CASE WHEN IATANUMBER IN (${iataCode}) THEN collectedIgst ELSE 0 END), 0) AS DECIMAL(14, 2)) as igstAmount,
    CAST(COALESCE(SUM(CASE WHEN IATANUMBER IN (${iataCode}) THEN collectedCgst ELSE 0 END) + 
            SUM(CASE WHEN IATANUMBER IN (${iataCode}) THEN collectedSgst ELSE 0 END) + SUM(CASE WHEN IATANUMBER IN (${iataCode}) THEN collectedutgst ELSE 0 END) +
            SUM(CASE WHEN IATANUMBER IN (${iataCode}) THEN collectedIgst ELSE 0 END), 0) AS DECIMAL(18, 2)) as taxValue
FROM INVOICE
INNER JOIN INVOICEITEMS ON ID = INVOICE_ID
WHERE IATANUMBER IN (${iataCode}) AND ${finalConditions}  AND INVOICESTATUS <> 'Cancelled' AND DOCUMENTTYPE NOT IN ('CREDIT')
                                    `);

        iataCreditTax = await db.exec(`SELECT 
                                    CAST(COALESCE(SUM(CASE WHEN IATANUMBER IN (${iataCode}) THEN collectedCgst ELSE 0 END), 0) AS DECIMAL(14, 2)) as cgstAmount,
                                    CAST(COALESCE(SUM(CASE WHEN IATANUMBER IN (${iataCode}) THEN collectedSgst ELSE 0 END), 0) AS DECIMAL(14, 2)) as sgstAmount,
                                    CAST(COALESCE(SUM(CASE WHEN IATANUMBER IN (${iataCode}) THEN collectedutgst ELSE 0 END), 0) AS DECIMAL(14, 2)) as utgstAmount,
                                    CAST(COALESCE(SUM(CASE WHEN IATANUMBER IN (${iataCode}) THEN collectedIgst ELSE 0 END), 0) AS DECIMAL(14, 2)) as igstAmount,
                                    CAST(COALESCE(SUM(CASE WHEN IATANUMBER IN (${iataCode}) THEN collectedCgst ELSE 0 END) + 
                                            SUM(CASE WHEN IATANUMBER IN (${iataCode}) THEN collectedSgst ELSE 0 END) + SUM(CASE WHEN IATANUMBER IN (${iataCode}) THEN collectedutgst ELSE 0 END) +
                                            SUM(CASE WHEN IATANUMBER IN (${iataCode}) THEN collectedIgst ELSE 0 END), 0) AS DECIMAL(18, 2)) as taxValue
                                FROM INVOICE
                                INNER JOIN INVOICEITEMS ON ID = INVOICE_ID
                                WHERE IATANUMBER IN (${iataCode}) AND ${finalConditions}  AND  DOCUMENTTYPE IN ('CREDIT')
                                                                    `);

        bookedThrough = await db.exec(`SELECT COUNT(*) as bookedThrough FROM INVOICE LEFT JOIN            
        INVOICEITEMS ON INVOICE.ID = INVOICEITEMS.INVOICE_ID WHERE IATANUMBER IN (${iataCode}) AND ${finalConditions}`);
      }
      if (category == '01' && UserRole === 'Admin' && Roles[0].CANAMENDMENTAPPROVE) {
        try {
          totalAmendmentPending = await db.exec(`SELECT COUNT(*) as totalAmendmentPending 
        FROM INVOICE 
        WHERE ISAMENDED = true 
          AND (INVOICESTATUS <> 'Cancelled' OR INVOICESTATUS IS NULL)
          AND AMENDEMENTSTATUS = 'P' AND
          (IATANUMBER IN (${iataCode}) OR PASSENGERGSTIN IN (${filtGSTINs})) AND ${finalConditions}`);
        }
        catch { }
      }
    } else {
      if (category == '07' && UserRole === 'Admin' && Roles[0].CANAMENDMENTAPPROVE) {
        try {
          totalAmendmentPending = await db.exec(`SELECT COUNT(*) as totalAmendmentPending 
                                                FROM INVOICE WHERE ISAMENDED = true 
                                                AND (INVOICESTATUS <> 'Cancelled' OR INVOICESTATUS IS NULL)
                                                AND 
                                                AMENDEMENTSTATUS = 'P'
                                                AND
                                                (IATANUMBER IN (${iataCode})) AND ${finalConditions}`);
        }
        catch { }
      }
      else {
        try {
          totalAmendmentPending = await db.exec(`SELECT COUNT(*) as totalAmendmentPending 
                                                  FROM INVOICE WHERE ISAMENDED = true 
                                                  AND 
                                                  AMENDEMENTSTATUS = 'P'
                                                  AND (INVOICESTATUS <> 'Cancelled' OR INVOICESTATUS IS NULL)
                                                  AND
                                                  (PASSENGERGSTIN IN (${filtGSTINs})) AND ${finalConditions}`);
        }
        catch { }
      }
    }
    totalInvoice = (myBooking[0] ? parseFloat(myBooking[0].TOTALINVOICE) || 0 : 0) + (bookedThrough[0] ? parseFloat(bookedThrough[0].BOOKEDTHROUGH) || 0 : 0)
    const output = {
      ISB2A,
      ISADMIN: Roles[0].ISADMIN,
      CANAMENDMENTREQUEST: Roles[0].CANAMENDMENTREQUEST,
      CANAMENDMENTAPPROVE: Roles[0].CANAMENDMENTAPPROVE,
      defaultGSTIN: defaultGSTIN.replace(/['"]+/g, '') ?? '',
      totalAmendment: totalAmendment[0]?.TOTALAMENDMENT ?? 0,
      totalInvoice: totalInvoice,
      myBooking: myBooking[0] ? parseFloat(myBooking[0].TOTALINVOICE) || 0 : 0,
      bookedThrough: bookedThrough[0] ? parseFloat(bookedThrough[0].BOOKEDTHROUGH) || 0 : 0,
      cgstAmount: ((totoalTaxAmount[0] ? parseFloat(totoalTaxAmount[0].CGSTAMOUNT) || 0 : 0) - (totoalCreditTaxAmount[0] ? parseFloat(totoalCreditTaxAmount[0].CGSTAMOUNT) || 0 : 0)).toFixed(2),
      sgstAmount: (((totoalTaxAmount[0] ? parseFloat(totoalTaxAmount[0].SGSTAMOUNT) || 0 : 0) + (totoalTaxAmount[0] ? parseFloat(totoalTaxAmount[0].UTGSTAMOUNT) || 0 : 0)) - ((totoalCreditTaxAmount[0] ? parseFloat(totoalCreditTaxAmount[0].SGSTAMOUNT) || 0 : 0) + (totoalCreditTaxAmount[0] ? parseFloat(totoalCreditTaxAmount[0].UTGSTAMOUNT) || 0 : 0))).toFixed(2),
      igstAmount: ((totoalTaxAmount[0] ? parseFloat(totoalTaxAmount[0].IGSTAMOUNT) || 0 : 0) - (totoalCreditTaxAmount[0] ? parseFloat(totoalCreditTaxAmount[0].IGSTAMOUNT) || 0 : 0)).toFixed(2),
      totalAmendmentPending: totalAmendmentPending[0]?.TOTALAMENDMENTPENDING ?? '',
      totalTax: ((totoalTaxAmount[0] ? parseFloat(totoalTaxAmount[0].TAXVALUE) || 0 : 0) - (totoalCreditTaxAmount[0] ? parseFloat(totoalCreditTaxAmount[0].TAXVALUE) || 0 : 0)).toFixed(2),
      userName: userName,
      gstlist: gstlist,
      compantName: compantName[0].COMPANYNAME,
      defaultPeriod: defaultPeriod[0].DEFAULTPERIOD,
      userPending: userPending[0]?.ROW_COUNT ?? 0,
      amendementPending: amendementPending[0]?.ROW_COUNT ?? 0,
      allIATAs: allIATAs ?? [],
      avatharName: avatharName ?? '',
      iatacgstAmount: ((iataTotalTax[0] ? parseFloat(iataTotalTax[0].CGSTAMOUNT) || 0 : 0) - (iataCreditTax[0] ? parseFloat(iataCreditTax[0].CGSTAMOUNT) || 0 : 0)).toFixed(2),
      iatasgstAmount: (
        ((iataTotalTax[0] ? parseFloat(iataTotalTax[0].SGSTAMOUNT) || 0 : 0) +
          (iataTotalTax[0] ? parseFloat(iataTotalTax[0].UTGSTAMOUNT) || 0 : 0)) -
        ((iataCreditTax[0] ? parseFloat(iataCreditTax[0].SGSTAMOUNT) || 0 : 0) +
          (iataCreditTax[0] ? parseFloat(iataCreditTax[0].UTGSTAMOUNT) || 0 : 0))
      ).toFixed(2),
      iataigstAmount: ((iataTotalTax[0] ? parseFloat(iataTotalTax[0].IGSTAMOUNT) || 0 : 0) - (iataCreditTax[0] ? parseFloat(iataCreditTax[0].IGSTAMOUNT) || 0 : 0)).toFixed(2),
      iatatotalTax: ((iataTotalTax[0] ? parseFloat(iataTotalTax[0].TAXVALUE) || 0 : 0) - (iataCreditTax[0] ? parseFloat(iataCreditTax[0].TAXVALUE) || 0 : 0)).toFixed(2),
    };
    return res.status(200).send(generateResponse('Success', 'Data Fetched', 'T', 'S', 'null', false, { ...output }));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

const getInvoicesForUserV2 = async (req, res) => {

  try {

    const db = req.db;

    const { Cid, Uid, Email, PAN, ISB2A, UserRole, category } = req.user

    const { error } = await validategetInvoiceRequest(req.body)

    if (error) {
      const response = generateResponse('Failed', error, 'T', 'E', '', '', null);
      return res.json(response);
    }

    if (req?.body?.hasOwnProperty('passengerName')) {
      req.body['passangerName'] = req.body['passengerName'];
      delete req?.body?.passengerName
    }

    let initialSearchParameters = Object.assign({}, req.body)
    let searchParameters = Object.assign({}, req.body)
    const filters = {}

    const defaultGSTIN = ((await getDefaultGSTIN(db, Uid)).data) ?? "";

    filters.isB2A = ISB2A
    filters.defaultGSTIN = defaultGSTIN

    delete initialSearchParameters.bookingType
    delete initialSearchParameters.isInitial
    delete initialSearchParameters.apiType

    delete searchParameters.bookingType
    delete searchParameters.isInitial
    delete searchParameters.apiType

    const {
      apiType,
      isInitial,
      invoiceFilter,
      pageNumber,
      pageSize,
      bookingType,
      generateExcel,
      columns
    } = req.body;


    const adminIATAcodes = (await getAgents(db, Cid)).data
    const adminGSTINs = (await getGSTINsForAdmin(db, Cid)).data
    const userIATAcodes = (await getAgentsForUsers(db, Uid, Cid)).data
    const userGSTINs = (await getGSTINsForUsers(db, Uid, Cid)).data

    // if (UserRole == "Admin") {

    //   if (req?.body?.passengerGSTIN && req?.body?.passengerGSTIN?.length > 0) {
    //     initialSearchParameters.passengerGSTIN = checkElementsInArray(req?.body?.passengerGSTIN, adminGSTINs)
    //     searchParameters.passengerGSTIN = checkElementsInArray(req?.body?.passengerGSTIN, adminGSTINs)
    //   }

    //   if (req?.body?.iataNumber && req?.body?.iataNumber?.length > 0) {
    //     initialSearchParameters.iataNumber = checkElementsInArray(req?.body?.iataNumber, adminIATAcodes)
    //     searchParameters.iataNumber = checkElementsInArray(req?.body?.iataNumber, adminIATAcodes)
    //   }

    // }

    // if (UserRole == "User") {

    //   if (req?.body?.passengerGSTIN && req?.body?.passengerGSTIN?.length > 0) {
    //     initialSearchParameters.passengerGSTIN = checkElementsInArray(req?.body?.passengerGSTIN, userGSTINs)
    //     searchParameters.passengerGSTIN = checkElementsInArray(req?.body?.passengerGSTIN, userGSTINs)
    //   }

    //   if (req?.body?.iataNumber && req?.body?.iataNumber?.length > 0) {

    //     initialSearchParameters.iataNumber = checkElementsInArray(req?.body?.iataNumber, userIATAcodes)
    //     searchParameters.iataNumber = checkElementsInArray(req?.body?.iataNumber, userIATAcodes)
    //   }

    // }

    if (ISB2A && category == "01" && UserRole == "Admin") {

      if (bookingType == 'my bookings') {

        if (adminGSTINs.length == 0) return res.status(500).send(generateResponse('Failed', "Please assign GSTINs to this user.", 'B', 'E', null, true, null));

        if (!initialSearchParameters?.passengerGSTIN || initialSearchParameters?.passengerGSTIN?.length == 0) {
          initialSearchParameters.passengerGSTIN = adminGSTINs;
          searchParameters.passengerGSTIN = adminGSTINs;
        }


      } else {

        if (adminIATAcodes.length == 0) return res.status(500).send(generateResponse('Failed', "Please assign an IATA number to this user.", 'B', 'E', null, true, null));
        // if (adminGSTINs.length == 0) return res.status(500).send(generateResponse('Failed', "Please assign GSTINs to this user.", 'B', 'E', null, true, null));

        // if (!initialSearchParameters?.passengerGSTIN || initialSearchParameters?.passengerGSTIN?.length > 0) {
        //   initialSearchParameters.passengerGSTIN = adminGSTINs;
        //   searchParameters.passengerGSTIN = adminGSTINs;
        // }

        if (!initialSearchParameters?.iataNumber || initialSearchParameters?.iataNumber?.length == 0) {
          initialSearchParameters.iataNumber = adminIATAcodes;
          searchParameters.iataNumber = adminIATAcodes;
        }

      }

    } else if (ISB2A && category == "01" && UserRole == "User") {

      if (bookingType == 'my bookings') {

        if (userGSTINs.length == 0) return res.status(500).send(generateResponse('Failed', "Please assign GSTINs to this user.", 'B', 'E', null, true, null));


        if (!initialSearchParameters?.passengerGSTIN || initialSearchParameters?.passengerGSTIN?.length == 0) {
          initialSearchParameters.passengerGSTIN = userGSTINs;
          searchParameters.passengerGSTIN = userGSTINs;
        }
        // initialSearchParameters.passengerGSTIN = userGSTINs;
      } else {

        if (userIATAcodes.length == 0) return res.status(500).send(generateResponse('Failed', "Please assign an IATA number to this user.", 'B', 'E', null, true, null));
        // if (userGSTINs.length == 0) return res.status(500).send(generateResponse('Failed', "Please assign GSTINs to this user.", 'B', 'E', null, true, null));

        // if (!initialSearchParameters?.passengerGSTIN || initialSearchParameters?.passengerGSTIN?.length > 0) {
        //   initialSearchParameters.passengerGSTIN = userGSTINs;
        //   searchParameters.passengerGSTIN = userGSTINs;
        // }

        if (!initialSearchParameters?.iataNumber || initialSearchParameters?.iataNumber?.length == 0) {
          initialSearchParameters.iataNumber = userIATAcodes;
          searchParameters.iataNumber = userIATAcodes;
        }

        // initialSearchParameters.passengerGSTIN = userGSTINs;
        // initialSearchParameters.iataNumber = userIATAcodes;
      }

    } else if (ISB2A && category == "07" && UserRole == "Admin") {

      if (adminIATAcodes.length == 0) return res.status(500).send(generateResponse('Failed', "Please assign an IATA number to this user.", 'B', 'E', null, true, null));

      // initialSearchParameters.iataNumber = adminIATAcodes;
      if (!initialSearchParameters?.iataNumber || initialSearchParameters?.iataNumber?.length == 0) {
        initialSearchParameters.iataNumber = adminIATAcodes;
        searchParameters.iataNumber = adminIATAcodes;
      }

    } else if (ISB2A && category == "07" && UserRole == "User") {

      if (userIATAcodes.length == 0) return res.status(500).send(generateResponse('Failed', "Please assign an IATA number to this user.", 'B', 'E', null, true, null));

      if (!initialSearchParameters?.iataNumber || initialSearchParameters?.iataNumber?.length == 0) {
        initialSearchParameters.iataNumber = userIATAcodes;
        searchParameters.iataNumber = userIATAcodes;
      }

      // initialSearchParameters.iataNumber = userIATAcodes;

    } else if (!ISB2A && UserRole == "Admin") {

      if (adminGSTINs.length == 0) return res.status(500).send(generateResponse('Failed', "Please assign GSTINs to this user.", 'B', 'E', null, true, null));

      if (!initialSearchParameters?.passengerGSTIN || initialSearchParameters?.passengerGSTIN?.length == 0) {
        initialSearchParameters.passengerGSTIN = adminGSTINs;
        searchParameters.passengerGSTIN = adminGSTINs;
      }

      // initialSearchParameters.passengerGSTIN = adminGSTINs;

    } else if (!ISB2A && UserRole == "User") {

      if (userGSTINs.length == 0) return res.status(500).send(generateResponse('Failed', "Please assign GSTINs to this user.", 'B', 'E', null, true, null));

      if (!initialSearchParameters?.passengerGSTIN || initialSearchParameters?.passengerGSTIN?.length == 0) {
        initialSearchParameters.passengerGSTIN = userGSTINs;
        searchParameters.passengerGSTIN = userGSTINs;
      }

      // initialSearchParameters.passengerGSTIN = userGSTINs;

    } else {
      const data = {
        totalInvoices: 0,
        filters: {},
        invoices: []
      }
      const response = generateResponse('Failed', 'Unknown', 'T', 'E', '', '', data);
      return res.json(response);
    }


    const apiTypesThatRequirePeriod = [
      "Documents",
      "AmendmentRequest",
      'AmendmentsApproved',
      'AmendmentsRejected',
      'PendingAmendments'
    ]

    const apiTypesThatRequireBookingType = [
      "Documents",
      "DocumentHistory",
      "AmendmentRequest",
      'AmendmentsApproved',
    ]

    const apiTypesThatRequireDefaultGSTIN = [
      "Documents",
      "DocumentHistory",
      "AmendmentRequest",
    ]

    if (apiTypesThatRequirePeriod.includes(apiType)) {
      const defaultPeriod = (await getDefaultPeriod(db, Uid)).data ?? ''
      const timePeriod = invoiceFilter ?? defaultPeriod;

      initialSearchParameters.invoiceFilter = timePeriod;
      searchParameters.invoiceFilter = timePeriod;
      filters.invoiceFilter = timePeriod;
    }

    switch (apiType) {
      case 'Documents':
        break;
      case 'DocumentHistory':
        break;
      case 'AmendmentRequest':

        initialSearchParameters.invoiceStatus = "non-cancelled";
        searchParameters.invoiceStatus = "non-cancelled";

        initialSearchParameters.isAmended = "false";
        searchParameters.isAmended = "false";

        break;
      case 'AmendmentsApproved':

        initialSearchParameters.invoiceStatus = "non-cancelled";
        searchParameters.invoiceStatus = "non-cancelled";

        initialSearchParameters.isAmended = "true";
        searchParameters.isAmended = "true";

        initialSearchParameters.status = "approved";
        searchParameters.status = "approved";

        break;
      case 'AmendmentsRejected':

        initialSearchParameters.invoiceStatus = "non-cancelled";
        searchParameters.invoiceStatus = "non-cancelled";

        initialSearchParameters.status = "rejected";
        searchParameters.status = "rejected";

        break;
      case 'PendingAmendments':

        initialSearchParameters.invoiceStatus = "non-cancelled";
        searchParameters.invoiceStatus = "non-cancelled";

        initialSearchParameters.isAmended = "true";
        searchParameters.isAmended = "true";

        initialSearchParameters.status = "pending";
        searchParameters.status = "pending";

        break;
    }

    if (initialSearchParameters?.invoiceNumber && initialSearchParameters?.invoiceNumber?.length > 0 && generateExcel) {
      let invoiceNumbers = initialSearchParameters.invoiceNumber
      initialSearchParameters = {}
      searchParameters = {}
      initialSearchParameters.invoiceNumber = invoiceNumbers
      searchParameters.invoiceNumber = invoiceNumbers
    }


    if (isInitial && apiTypesThatRequireBookingType.includes(apiType)) {

      const cleanedFilters = _.pickBy(initialSearchParameters, isValidValueExcludingArray)
      const searchFilters = {} // Object.assign({}, cleanedFilters)

      if (cleanedFilters?.hasOwnProperty('iataNumber')) {
        searchFilters['iataNumber'] = cleanedFilters['iataNumber']
      }

      if (cleanedFilters?.hasOwnProperty('passengerGSTIN')) {
        searchFilters['passengerGSTIN'] = cleanedFilters['passengerGSTIN']
      }

      if (cleanedFilters?.hasOwnProperty('invoiceStatus')) {
        searchFilters['invoiceStatus'] = cleanedFilters['invoiceStatus']
      }

      if (cleanedFilters?.hasOwnProperty('isAmended')) {
        searchFilters['ISAMENDEDFILTER'] = cleanedFilters['isAmended']
      }


      if (category != '07' && apiTypesThatRequireDefaultGSTIN.includes(apiType)) {
        if (!defaultGSTIN) {
          const response = generateResponse('Failed', 'Please assign the default GSTIN to the user.', 'T', 'E', '', '', null);
          return res.json(response);
        }
        if (bookingType == 'my bookings') {
          cleanedFilters.passengerGSTIN = [defaultGSTIN];
          cleanedFilters.documentType = ["INVOICE"]
        } else if (bookingType == 'booked through') {
          cleanedFilters.documentType = ["INVOICE"]
        }
      }

      const allInvoicesLength = ((await getInvoicesFromPassengerGSTIN(db, null, null, cleanedFilters, true))?.data);
      const initData = (await getInvoicesFromPassengerGSTIN(db, pageNumber ?? null, pageSize ?? null, cleanedFilters)).data;
      // const invoices = (await getInvoicesFromPassengerGSTIN(db, null, null, searchFilters)).data;
      const [totalInvoices] = Object.values((allInvoicesLength)[0]) ?? 0
console.log(apiType,"apiType");

      let pnr = (await getFilterData(db, "INVOICE", 'PNR', searchFilters))?.data ?? []
      let ticketNumber = (await getFilterData(db, "INVOICE", 'TICKETNUMBER', apiType==="AmendmentsApproved"?cleanedFilters: searchFilters))?.data ?? []
      let supplierGSTIN = (await getFilterData(db, "INVOICE", 'SUPPLIERGSTIN', searchFilters))?.data ?? []
      let passengerGSTIN = (await getFilterData(db, "INVOICE", 'PASSENGERGSTIN', searchFilters))?.data ?? []
      let invoiceNumber = (await getFilterData(db, "INVOICE", 'INVOICENUMBER',apiType==="AmendmentsApproved"?cleanedFilters: searchFilters))?.data ?? []
      let documentType = (await getFilterData(db, "INVOICE", 'DOCUMENTTYPE', searchFilters))?.data ?? []
      let sectionType = (await getFilterData(db, "INVOICE", 'SECTIONTYPE', searchFilters))?.data ?? []
      let iataNumber = (await getFilterData(db, "INVOICE", 'IATANUMBER', searchFilters))?.data ?? []
      let placeOfSupply = (await getFilterData(db, "INVOICE", 'PLACEOFSUPPLY', searchFilters))?.data ?? []
      let billToName = (await getFilterData(db, "INVOICE", 'BILLTONAME', searchFilters))?.data ?? []
      let passengerNames = (await getFilterData(db, "INVOICE", 'PASSANGERNAME', searchFilters))?.data ?? []
      let amendmentRequestNos = (await getFilterData(db, "INVOICE", 'AMENDMENTREQUESTNO', searchFilters))?.data ?? []


      // for (const invoice of invoices) {
      //   pnr.push(invoice.PNR)
      //   ticketNumber.push(invoice.TICKETNUMBER)
      //   supplierGSTIN.push(invoice.SUPPLIERGSTIN)
      //   passengerGSTIN.push(invoice.PASSENGERGSTIN)
      //   invoiceNumber.push(invoice.INVOICENUMBER)
      //   documentType.push(invoice.DOCUMENTTYPE)
      //   sectionType.push(invoice.SECTIONTYPE)
      //   iataNumber.push(invoice.IATANUMBER)
      //   placeOfSupply.push(invoice.PLACEOFSUPPLY)
      //   billToName.push(invoice.BILLTONAME?.trim())
      //   passengerNames.push(invoice.PASSANGERNAME?.trim())
      //   amendmentRequestNos.push(invoice.AMENDMENTREQUESTNO)
      // }

      if (UserRole == "Admin") {
        iataNumber.push(...adminIATAcodes)
        passengerGSTIN.push(...adminGSTINs)
      } else {
        iataNumber.push(...userIATAcodes)
        passengerGSTIN.push(...userGSTINs)
      }

      pnr = _.without(_.uniq(pnr), null, undefined, '', 'null');
      ticketNumber = _.without(_.uniq(ticketNumber), null, undefined, '', 'null');
      supplierGSTIN = _.without(_.uniq(supplierGSTIN), null, undefined, '', 'null');
      passengerGSTIN = _.without(_.uniq(passengerGSTIN), null, undefined, '', 'null');
      invoiceNumber = _.without(_.uniq(invoiceNumber), null, undefined, '', 'null');
      documentType = _.without(_.uniq(documentType), null, undefined, '', 'null');
      sectionType = _.without(_.uniq(sectionType), null, undefined, '', 'null');
      iataNumber = _.without(_.uniq(iataNumber), null, undefined, '', 'null');
      placeOfSupply = _.without(_.uniq(placeOfSupply), null, undefined, '', 'null');
      billToName = _.without(_.uniq(billToName), null, undefined, '', 'null');
      passengerNames = _.without(_.uniq(passengerNames), null, undefined, '', 'null');
      amendmentRequestNos = _.without(_.uniq(amendmentRequestNos), null, undefined, '', 'null');

      filters.pnr = pnr
      filters.ticketNumber = ticketNumber
      filters.supplierGSTIN = supplierGSTIN
      filters.passengerGSTIN = passengerGSTIN
      filters.invoiceNumber = invoiceNumber
      filters.documentType = documentType
      filters.sectionType = sectionType
      filters.iataNumber = (await getAgentDetails(db, iataNumber)).data
      filters.placeOfSupply = (await getPlaceOfSupplyDetails(db, placeOfSupply)).data
      filters.billToName = billToName
      filters.passengerName = passengerNames
      filters.amendmentRequestNos = amendmentRequestNos

      let data = {}
      if (generateExcel) {
        const excel = await jsonToExcelBase64(initData, columns);
        data = {
          filters,
          excel,
        };
      } else {
        data = {
          filters,
          totalInvoices,
          invoices: initData,
        }
      }

      const response = generateResponse('Success', 'Invoice(s) fetched successfully.', 'T', 'E', '', '', data);
      return res.json(response);
    }

    if (!isInitial && apiTypesThatRequireBookingType.includes(apiType)) {
      const cleanedFilters = _.pickBy(searchParameters, isValidValue)
      const allInvoicesLength = ((await getInvoicesFromPassengerGSTIN(db, null, null, cleanedFilters, true))?.data);
      const [totalInvoices] = Object.values((allInvoicesLength)[0]) ?? 0
      const invoices = (await getInvoicesFromPassengerGSTIN(db, pageNumber, pageSize, cleanedFilters)).data;

      let data = {}
      if (generateExcel) {
        const excel = await jsonToExcelBase64(invoices, columns);
        data = {
          excel
        };
      } else {
        data = {
          invoiceLength: invoices.length,
          invoices,
          totalInvoices
        }
      }

      const response = generateResponse('Success', 'Invoice(s) fetched successfully.', 'T', 'E', '', '', data);
      return res.json(response);
    }


    if (isInitial && !apiTypesThatRequireBookingType.includes(apiType)) {

      let searchIata;
      let searchGSTIN;

      if (UserRole == "Admin") {
        searchIata = adminIATAcodes
        searchGSTIN = adminGSTINs
      } else {
        searchIata = userIATAcodes
        searchGSTIN = userGSTINs
      }


      const searchOptions = Object.assign({}, initialSearchParameters)

      if (searchIata.length > 0) {
        if (req?.body?.iataNumber && req?.body?.iataNumber?.length > 0) {
          // searchOptions.iataNumber = checkElementsInArray(req?.body?.iataNumber, searchIata)
        } else {
          searchOptions.iataNumber = searchIata
        }

        // if(!req?.body?.passengerGSTIN){
        // }
      }

      if (searchOptions?.passengerGSTIN) {
        searchOptions.passengerGSTIN = []
      }


      let invoiceNumbers = []

      if (searchOptions?.iataNumber?.length > 0) {

        invoiceNumbers = (await getFilterData(db, "INVOICE", 'INVOICENUMBER', searchOptions))?.data ?? []
        // const iataInvoices = (await getInvoicesFromPassengerGSTIN(db, pageNumber ?? null, pageSize ?? null, searchOptions, false, true)).data;

        // for (const invoice of iataInvoices) {
        //   invoiceNumbers.push(invoice.INVOICENUMBER)
        // }
      }



      if (searchGSTIN?.length > 0) {
        if (req?.body?.passengerGSTIN && req?.body?.passengerGSTIN?.length > 0) {
          // searchOptions.passengerGSTIN = checkElementsInArray(req?.body?.passengerGSTIN, searchGSTIN)
        } else {
          searchOptions.passengerGSTIN = searchGSTIN
        }

        // if(!req?.body?.iataNumber){
        // }
      }

      if (searchOptions?.iataNumber) {
        searchOptions.iataNumber = []
      }

      if (searchOptions?.passengerGSTIN?.length > 0) {

        let _invoiceNumbers = (await getFilterData(db, "INVOICE", 'INVOICENUMBER', searchOptions))?.data ?? []

        invoiceNumbers.push(..._invoiceNumbers)

        // const gstINInvoices = (await getInvoicesFromPassengerGSTIN(db, pageNumber ?? null, pageSize ?? null, searchOptions, false, true)).data;
        // for (const invoice of gstINInvoices) {
        //   invoiceNumbers.push(invoice.INVOICENUMBER)
        // }
      }

      invoiceNumbers = _.without(_.uniq(invoiceNumbers), null, undefined, '', 'null');

      if (invoiceNumbers.length == 0) {


        filters.pnr = []
        filters.ticketNumber = []
        filters.supplierGSTIN = []
        filters.passengerGSTIN = []
        filters.invoiceNumber = []
        filters.documentType = []
        filters.sectionType = []
        filters.iataNumber = []
        filters.placeOfSupply = []
        filters.billToName = []
        filters.passengerName = []
        filters.amendmentRequestNos = []

        const data = {
          filters,
          totalInvoices: 0,
          invoices: []
        }

        const response = generateResponse('Success', 'Invoice(s) fetched successfully.', 'T', 'E', '', '', data);
        return res.json(response);

      }

      const finalSearchOptions = {
        invoiceNumber: invoiceNumbers
      }

      const allInvoicesLength = ((await getInvoicesFromPassengerGSTIN(db, null, null, finalSearchOptions, true))?.data);
      const invoices = (await getInvoicesFromPassengerGSTIN(db, pageNumber ?? null, pageSize ?? null, finalSearchOptions)).data;
      const [totalInvoices] = (Object.values((allInvoicesLength)[0])) ?? 0

      // let pnr = []
      // let ticketNumber = []
      // let supplierGSTIN = []
      // let passengerGSTIN = []
      // let invoiceNumber = []
      // let documentType = []
      // let sectionType = []
      // let iataNumber = []
      // let placeOfSupply = []
      // let billToName = []
      // let passengerNames = []
      // let amendmentRequestNos = []

      let pnr = (await getFilterData(db, "INVOICE", 'PNR', finalSearchOptions))?.data ?? []
      let ticketNumber = (await getFilterData(db, "INVOICE", 'TICKETNUMBER', finalSearchOptions))?.data ?? []
      let supplierGSTIN = (await getFilterData(db, "INVOICE", 'SUPPLIERGSTIN', finalSearchOptions))?.data ?? []
      let passengerGSTIN = (await getFilterData(db, "INVOICE", 'PASSENGERGSTIN', finalSearchOptions))?.data ?? []
      let invoiceNumber = (await getFilterData(db, "INVOICE", 'INVOICENUMBER', finalSearchOptions))?.data ?? []
      let documentType = (await getFilterData(db, "INVOICE", 'DOCUMENTTYPE', finalSearchOptions))?.data ?? []
      let sectionType = (await getFilterData(db, "INVOICE", 'SECTIONTYPE', finalSearchOptions))?.data ?? []
      let iataNumber = (await getFilterData(db, "INVOICE", 'IATANUMBER', finalSearchOptions))?.data ?? []
      let placeOfSupply = (await getFilterData(db, "INVOICE", 'PLACEOFSUPPLY', finalSearchOptions))?.data ?? []
      let billToName = (await getFilterData(db, "INVOICE", 'BILLTONAME', finalSearchOptions))?.data ?? []
      let passengerNames = (await getFilterData(db, "INVOICE", 'PASSANGERNAME', finalSearchOptions))?.data ?? []
      let amendmentRequestNos = (await getFilterData(db, "INVOICE", 'AMENDMENTREQUESTNO', finalSearchOptions))?.data ?? []


      // for (const invoice of invoices) {
      //   pnr.push(invoice.PNR)
      //   ticketNumber.push(invoice.TICKETNUMBER)
      //   supplierGSTIN.push(invoice.SUPPLIERGSTIN)
      //   passengerGSTIN.push(invoice.PASSENGERGSTIN)
      //   invoiceNumber.push(invoice.INVOICENUMBER)
      //   documentType.push(invoice.DOCUMENTTYPE)
      //   sectionType.push(invoice.SECTIONTYPE)
      //   iataNumber.push(invoice.IATANUMBER)
      //   placeOfSupply.push(invoice.PLACEOFSUPPLY)
      //   billToName.push(invoice.BILLTONAME?.trim())
      //   passengerNames.push(invoice.PASSANGERNAME?.trim())
      //   amendmentRequestNos.push(invoice.AMENDMENTREQUESTNO)
      // }

      if (UserRole == "Admin") {
        iataNumber.push(...adminIATAcodes)
        passengerGSTIN.push(...adminGSTINs)
      } else {
        iataNumber.push(...userIATAcodes)
        passengerGSTIN.push(...userGSTINs)
      }

      pnr = _.without(_.uniq(pnr), null, undefined, '', 'null');
      ticketNumber = _.without(_.uniq(ticketNumber), null, undefined, '', 'null');
      supplierGSTIN = _.without(_.uniq(supplierGSTIN), null, undefined, '', 'null');
      passengerGSTIN = _.without(_.uniq(passengerGSTIN), null, undefined, '', 'null');
      invoiceNumber = _.without(_.uniq(invoiceNumber), null, undefined, '', 'null');
      documentType = _.without(_.uniq(documentType), null, undefined, '', 'null');
      sectionType = _.without(_.uniq(sectionType), null, undefined, '', 'null');
      iataNumber = _.without(_.uniq(iataNumber), null, undefined, '', 'null');
      placeOfSupply = _.without(_.uniq(placeOfSupply), null, undefined, '', 'null');
      billToName = _.without(_.uniq(billToName), null, undefined, '', 'null');
      passengerNames = _.without(_.uniq(passengerNames), null, undefined, '', 'null');
      amendmentRequestNos = _.without(_.uniq(amendmentRequestNos), null, undefined, '', 'null');

      filters.pnr = pnr
      filters.ticketNumber = ticketNumber
      filters.supplierGSTIN = supplierGSTIN
      filters.passengerGSTIN = passengerGSTIN
      filters.invoiceNumber = invoiceNumber
      filters.documentType = documentType
      filters.sectionType = sectionType
      filters.iataNumber = (await getAgentDetails(db, iataNumber)).data
      filters.placeOfSupply = (await getPlaceOfSupplyDetails(db, placeOfSupply)).data
      filters.billToName = billToName
      filters.passengerName = passengerNames
      filters.amendmentRequestNos = amendmentRequestNos

      let data = {}
      if (generateExcel) {
        const excel = await jsonToExcelBase64(invoices, columns);
        data = {
          filters,
          excel,
        };
      } else {
        data = {
          filters,
          totalInvoices,
          invoices
        }
      }

      const response = generateResponse('Success', 'Invoice(s) fetched successfully.', 'T', 'E', '', '', data);
      return res.json(response);
    } else if (!isInitial && !apiTypesThatRequireBookingType.includes(apiType)) {

      let searchIata;
      let searchGSTIN;

      if (UserRole == "Admin") {
        searchIata = adminIATAcodes
        searchGSTIN = adminGSTINs
      } else {
        searchIata = userIATAcodes
        searchGSTIN = userGSTINs
      }

      const searchOptions = Object.assign({}, initialSearchParameters)

      if (searchIata?.length > 0) {
        if (req?.body?.iataNumber && req?.body?.iataNumber?.length > 0) {
          // searchOptions.iataNumber = checkElementsInArray(req?.body?.iataNumber, searchIata)
        } else {
          searchOptions.iataNumber = searchIata
        }

        // if(!req?.body?.passengerGSTIN){
        // }
      }

      if (searchOptions?.passengerGSTIN) {
        searchOptions.passengerGSTIN = []
      }


      let invoiceNumbers = []

      if (searchOptions?.iataNumber?.length > 0) {

        invoiceNumbers = (await getFilterData(db, "INVOICE", 'INVOICENUMBER', searchOptions))?.data ?? []

        // const iataInvoices = (await getInvoicesFromPassengerGSTIN(db, pageNumber ?? null, pageSize ?? null, searchOptions, false, true)).data;

        // for (const invoice of iataInvoices) {
        //   invoiceNumbers.push(invoice.INVOICENUMBER)
        // }
      }



      if (searchGSTIN?.length > 0) {
        if (req?.body?.passengerGSTIN && req?.body?.passengerGSTIN?.length > 0) {
          // searchOptions.passengerGSTIN = checkElementsInArray(req?.body?.passengerGSTIN, searchGSTIN)
        } else {
          searchOptions.passengerGSTIN = searchGSTIN
        }

        // if(!req?.body?.iataNumber){
        // }
      }

      if (searchOptions?.iataNumber) {
        searchOptions.iataNumber = []
      }

      if (searchOptions?.passengerGSTIN?.length > 0) {

        let _invoiceNumbers = (await getFilterData(db, "INVOICE", 'INVOICENUMBER', searchOptions))?.data ?? []

        invoiceNumbers.push(..._invoiceNumbers)

        // const gstINInvoices = (await getInvoicesFromPassengerGSTIN(db, pageNumber ?? null, pageSize ?? null, searchOptions, false, true)).data;
        // for (const invoice of gstINInvoices) {
        //   invoiceNumbers.push(invoice.INVOICENUMBER)
        // }
      }

      invoiceNumbers = _.without(_.uniq(invoiceNumbers), null, undefined, '', 'null');

      if (invoiceNumbers.length == 0) {


        filters.pnr = []
        filters.ticketNumber = []
        filters.supplierGSTIN = []
        filters.passengerGSTIN = []
        filters.invoiceNumber = []
        filters.documentType = []
        filters.sectionType = []
        filters.iataNumber = []
        filters.placeOfSupply = []
        filters.billToName = []
        filters.passengerName = []
        filters.amendmentRequestNos = []

        const data = {
          filters,
          totalInvoices: 0,
          invoices: []
        }

        const response = generateResponse('Success', 'Invoice(s) fetched successfully.', 'T', 'E', '', '', data);
        return res.json(response);

      }

      const finalSearchOptions = {
        invoiceNumber: invoiceNumbers
      }

      const allInvoicesLength = ((await getInvoicesFromPassengerGSTIN(db, null, null, finalSearchOptions, true))?.data);
      const [totalInvoices] = (Object.values((allInvoicesLength)[0])) ?? 0
      const invoices = (await getInvoicesFromPassengerGSTIN(db, pageNumber, pageSize, finalSearchOptions)).data;

      let data = {}
      if (generateExcel) {
        const excel = await jsonToExcelBase64(invoices, columns);
        data = {
          excel
        };
      } else {
        data = {
          invoices,
          totalInvoices
        }
      }

      const response = generateResponse('Success', 'Invoice(s) fetched successfully.', 'T', 'E', '', '', data);
      return res.json(response);

    } else {
      const data = {
        totalInvoices: 0,
        filters: {},
        invoices: []
      }
      const response = generateResponse('Failed', 'Unknown', 'T', 'E', '', '', data);
      return res.json(response);
    }


  } catch (error) {
    console.log(error);
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }

}

const logout = async (req, res) => {
  try {
    const db = req.db;
    const { Uid, Cid } = req.user;
    await db.exec(`UPDATE COMPANYUSERS SET JWT = NULL , JWTEXPIRESON = NULL WHERE ID = '${Uid}' AND COMPANYID = '${Cid}'`);
    return res.status(200).send(generateResponse('Success', 'The user logged out successfully.', 'T', 'S', null, false, null));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

const resetActiveSession = async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1];
    const db = req.db;

    const { iat, exp, Uid, Cid } = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('ascii'));
    const expUTC = moment.utc(exp * 1000);
    const iatUTCNew = moment.utc(iat * 1000);

    const activeSessions = await db.exec(`SELECT JWT FROM COMPANYUSERS WHERE ID = '${Uid}' AND COMPANYID = '${Cid}' AND JWT != '${token}'`);
    if (activeSessions.length > 0 && activeSessions[0].JWT) {
      const existingJWT = activeSessions[0].JWT;
      const { iat: iatE } = JSON.parse(Buffer.from(existingJWT.split('.')[1], 'base64').toString('ascii'));
      const iatUTCExisting = moment.utc(iatE * 1000);
      if (iatUTCNew.isAfter(iatUTCExisting)) {
        await db.exec(`UPDATE COMPANYUSERS SET JWT = '${token}', JWTEXPIRESON = '${expUTC.format('YYYY-MM-DD HH:mm:ss.SSSSSSSSS')}' WHERE ID = '${Uid}' AND COMPANYID = '${Cid}'`);
      }
    }

    return res.status(200).send(generateResponse('Success', 'Active session reset successfully.', 'B', 'S', null, false, null));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

module.exports = {
  getInvoiceData,
  getInvoicesForUser,
  getInvoicesForUserV2,
  getDashboardDetails,
  resetActiveSession,
  logout
};
