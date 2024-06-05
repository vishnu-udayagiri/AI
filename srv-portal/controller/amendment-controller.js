const _ = require('lodash');
const path = require('path');
const fs = require('fs');

const { generateResponse } = require('../libs/response');
const {
  getInvoicesFromPassengerGSTIN,
  makeGSTINAmendment,
  makeAddressAmendment,
  getAllInvoicesFromGSTIN,
  approveOrRejectGSTINAmendment,
  approveOrRejectAddressAmendment,
  getDefaultPeriod,
  makeChangeAddressAmendment,
  approveOrRejectChangeAddressAmendment,
} = require('../db/invoices.db');
const { CompanyUserRole } = require('../utils/common-query');
const { getDefaultGSTIN, getGSTINs } = require('../db/gst.db');
const { jsonToExcelBase64 } = require('../helpers/json2excel.helper');
const { isValidValue } = require('../helpers/common.helper');
const { auditlog } = require('../libs/auditlog');
const { getAgents, getAgentDetails } = require('../db/agent.db');
const { processAmendmentRequestsExcel, isExcelDataProcessingCountExceeded } = require('../helpers/amendment.excel.upload.helper');
const { validateGSTIN } = require('../validations/gstin.validation');
const console = require('console');

exports.getInvoicesFromAmendment = async (req, res) => {
  try {
    const db = req.db;
    const email = req.user.email;
    const companyId = req.user.Cid;
    const userId = req.user.Uid;
    const userRole = req.user.UserRole;
    const { ISB2A } = req.user;
    const resFilters = {};
    let invoiceNumber = req?.body?.invoiceNumber ?? [];
    let amendmentRequestNo = req?.body?.amendmentRequestNo ?? [];
    const generateExcel = req?.body?.generateExcel ?? false;
    const pageNumber = req?.body?.pageNumber ?? null;
    const pageSize = req?.body?.pageSize ?? null;
    const from = req?.body?.from ?? '';
    const to = req?.body?.to ?? '';
    const financialYear = req?.body?.financialYear ?? '';
    const amendmentRequestedOnFrom = req?.body?.amendmentRequestedOnFrom ?? '';
    const amendmentRequestedOnTo = req?.body?.amendmentRequestedOnTo ?? '';
    const amendmentApprovedOnFrom = req?.body?.amendmentApprovedOnFrom ?? '';
    const amendmentApprovedOnTo = req?.body?.amendmentApprovedOnTo ?? '';
    const invoiceStatus = req?.body?.invoiceStatus ?? 'non-cancelled';
    const ticketIssueDateFrom = req?.body?.ticketIssueDateFrom ?? '';
    const ticketIssueDateTo = req?.body?.ticketIssueDateTo ?? '';
    const defaultDocumentTypes = ['INVOICE', 'DEBIT', 'CREDIT', 'BOS', 'BOSCN', 'BOSDN'];
    let documentType = req?.body?.documentType ?? defaultDocumentTypes;
    documentType = Array.isArray(documentType) ? documentType.map((item) => item?.trim()?.toUpperCase()) : [documentType?.trim()?.toUpperCase()]; //req?.body?.documentType?.trim()?.toUpperCase() ?? '';
    const apiType = req?.body?.apiType ?? '';
    const defaultPeriod = (await getDefaultPeriod(db, userId)).data ?? 'CY';
    const invoiceFilter = req?.body?.invoiceFilter ?? defaultPeriod;
    const isInitial = req?.body?.isInitial ?? false;

    if ((from && !to) || (!from && to)) {
      const response = generateResponse('FAILED', 'The date range cannot be partial..', 'T', 'E', '', '', '');
      return res.json(response);
    }

    if ((ticketIssueDateFrom && !ticketIssueDateTo) || (!ticketIssueDateFrom && ticketIssueDateTo)) {
      const response = generateResponse('FAILED', 'Tickect issue The date range cannot be partial..', 'T', 'E', '', '', '');
      return res.json(response);
    }

    const filters = {
      from: from,
      to: to,
      invoiceNumber: invoiceNumber,
      amendmentRequestNo: amendmentRequestNo,
      amendmentRequestedOnFrom: amendmentRequestedOnFrom,
      amendmentRequestedOnTo: amendmentRequestedOnTo,
      amendmentApprovedOnFrom: amendmentApprovedOnFrom,
      amendmentApprovedOnTo: amendmentApprovedOnTo,
      iataNumber: req?.body?.iataNumber ?? [],
      isAmended: req?.body?.isAmended ?? '',
      passengerGSTIN: req?.body?.passengerGSTIN ?? [],
      pnr: req?.body?.pnr ?? [],
      status: req?.body?.status ?? '',
      invoiceStatus: invoiceStatus,
      ticketNumber: req?.body?.ticketNumber ?? [],
      financialYear: financialYear,
      supplierGSTIN: req?.body?.supplierGSTIN ?? [],
      ticketIssueDateFrom: ticketIssueDateFrom,
      ticketIssueDateTo: ticketIssueDateTo,
      invoiceFilter: invoiceFilter,
      documentType: documentType,
      //iataNumber: req?.body?.iataNumber ?? [],
      billToName: req?.body?.billToName ?? [],
      passengerName: req?.body?.passengerName ?? [],
    };

    if ((amendmentRequestedOnFrom && !amendmentRequestedOnTo) || (!amendmentRequestedOnFrom && amendmentRequestedOnTo)) {
      const response = generateResponse('FAILED', 'Amendment request The date range cannot be partial..', 'T', 'E', '', '', '');
      return res.json(response);
    } else {
      resFilters.amendmentRequestedOnFrom = amendmentRequestedOnFrom;
      resFilters.amendmentRequestedOnTo = amendmentRequestedOnTo;
    }

    if ((amendmentApprovedOnFrom && !amendmentApprovedOnTo) || (!amendmentApprovedOnFrom && amendmentApprovedOnTo)) {
      const response = generateResponse('FAILED', 'Amendment approved The date range cannot be partial..', 'T', 'E', '', '', '');
      return res.json(response);
    } else {
      resFilters.amendmentApprovedOnFrom = amendmentApprovedOnFrom;
      resFilters.amendmentApprovedOnTo = amendmentApprovedOnTo;
    }

    const cleanedFilters = _.pickBy(filters, isValidValue);
    // const companyUserData = await db.exec(CompanyUserRole(null, null, email, null, null))[0];
    // let companyId = '';
    // if (companyUserData) {
    //   companyId = companyUserData['COMPANYID'];
    // }
    // console.log(companyId);

    let defaultGSTIN = '';
    let allGSTINs = [];
    if (userId) {
      defaultGSTIN = (await getDefaultGSTIN(db, userId)).data;
      allGSTINs = (await getGSTINs(db, userId)).data;
    }

    // console.log(cleanedFilters);
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
    // if (!cleanedFilters.hasOwnProperty('passengerGSTIN')) {
    //   cleanedFilters.passengerGSTIN = [defaultGSTIN]
    // }

    // cleanedFilters.AMENDMENTOLDVALUE = defaultGSTIN

    let agentName = [];
    let iataNumber = [];
    if (ISB2A) {
      agentName = (await getAgents(db, companyId)).data;
      agentName = _.without(_.uniq(agentName), null, undefined, '', 'null');
      //iataNumber = agentName

      if (userRole == 'Admin' && apiType == 'getAmendmentsForApproval') {
        if (!cleanedFilters.hasOwnProperty('iataNumber')) {
          if (agentName.length > 0) {
            cleanedFilters.iataNumber = agentName;
          } else {
            const response = generateResponse('FAILED', 'Agent code not found.', 'T', 'E', '', '', '');
            return res.json(response);
          }
        }
        cleanedFilters.passengerGSTINOR = [defaultGSTIN];
      } else {
        const bookingType = req?.body?.isMyBookings ?? 'my bookings';
        if (bookingType != 'my bookings' && bookingType != 'booked through') {
          const response = generateResponse('FAILED', 'Invalid booking type.', 'T', 'E', '', '', '');
          return res.json(response);
        }
        if (bookingType != 'my bookings') {
          if (!cleanedFilters.hasOwnProperty('iataNumber')) {
            if (agentName.length > 0) {
              cleanedFilters.iataNumber = agentName;
            } else {
              const response = generateResponse('FAILED', 'Agent code not found.', 'T', 'E', '', '', '');
              return res.json(response);
            }
          }
        } else {
          if (!cleanedFilters.hasOwnProperty('passengerGSTIN')) {
            cleanedFilters.passengerGSTIN = [defaultGSTIN];
          }
        }
      }
    } else {
      if (!cleanedFilters.hasOwnProperty('passengerGSTIN')) {
        cleanedFilters.passengerGSTIN = [defaultGSTIN];
      }
    }

    // console.log(cleanedFilters);
    const invoices = (await getInvoicesFromPassengerGSTIN(db, pageNumber, pageSize, cleanedFilters)).data;
    const _invoices = (await getAllInvoicesFromGSTIN(db, allGSTINs)).data;
    let invoiceNumbers = [];
    let supplierGSTIN = [];
    let passengerGSTIN = [];
    let ticketNumber = [];
    let amendmentRequestNos = [];
    let billToName = [];
    let pnr = [];
    let passengerNames = [];

    if (!ISB2A) {
      iataNumber.push(...(await getAgents(db, companyId)).data);
    }

    for (const invoice of invoices) {
      iataNumber.push(invoice.IATANUMBER);
      invoiceNumbers.push(invoice.INVOICENUMBER);
      supplierGSTIN.push(invoice.SUPPLIERGSTIN);
      passengerGSTIN.push(invoice.PASSENGERGSTIN);
      ticketNumber.push(invoice.TICKETNUMBER);
      amendmentRequestNos.push(invoice.AMENDMENTREQUESTNO);
      pnr.push(invoice.PNR);
      billToName.push(invoice.BILLTONAME);
      passengerNames.push(invoice.PASSANGERNAME);
    }

    iataNumber = _.without(_.uniq(iataNumber), null, undefined, '', 'null');
    invoiceNumbers = _.without(_.uniq(invoiceNumbers), null, undefined, '', 'null');
    supplierGSTIN = _.without(_.uniq(supplierGSTIN), null, undefined, '', 'null');
    passengerGSTIN = _.without(_.uniq(passengerGSTIN), null, undefined, '', 'null');
    ticketNumber = _.without(_.uniq(ticketNumber), null, undefined, '', 'null');
    amendmentRequestNos = _.without(_.uniq(amendmentRequestNos), null, undefined, '', 'null');
    pnr = _.without(_.uniq(pnr), null, undefined, '', 'null');
    billToName = _.without(_.uniq(billToName), null, undefined, '', 'null');
    passengerNames = _.without(_.uniq(passengerNames), null, undefined, '');

    resFilters.iataNumber = (await getAgentDetails(db, iataNumber)).data;
    resFilters.invoiceNumbers = invoiceNumbers;
    resFilters.supplierGSTIN = supplierGSTIN;
    resFilters.passengerGSTIN = passengerGSTIN;
    resFilters.ticketNumber = ticketNumber;
    resFilters.amendmentRequestNos = amendmentRequestNos;
    resFilters.pnr = pnr;
    resFilters.invoiceFilter = invoiceFilter;
    resFilters.billToName = billToName;
    resFilters.agentName = (await getAgentDetails(db, agentName)).data;
    resFilters.passengerName = passengerNames;

    if (!generateExcel) {
      const data = {
        length: invoices.length,
        totalInvoices: _invoices.length,
        invoices,
      };

      if (isInitial) {
        data.filters = resFilters;
      }

      const response = generateResponse('Success', 'Invoice(s) fetched successfully.', 'T', 'E', '', '', data);
      return res.json(response);
    }

    try {
      const columns = {
        INVOICENUMBER: 'Invoice No.',
        INVOICEDATE: 'Invoice Date',
        DOCUMENTTYPE: 'Invoice Type',
        TICKETNUMBER: 'Ticket No.',
        TICKETISSUEDATE: 'Ticket Issue Date',
        PNR: 'PNR',
        PASSENGERGSTIN: 'Buyer GSTIN',
        SUPPLIERGSTIN: 'Supplier GSTIN',
        CGSTAMOUNT: 'CGST Amount',
        SGSTAMOUNT: 'SGST Amount',
        IGSTAMOUNT: 'IGST Amount',
        NETTAXABLEVALUE: 'Net Taxable Value',
        TOTALTAX: 'Total Tax Amount',
        TOTALINVOICEAMOUNT: 'Total Invoice Amount',
      };
      const excel = await jsonToExcelBase64(invoices, columns);
      const data = {
        excel,
      };

      if (isInitial) {
        data.filters = resFilters;
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

exports.makeGSTINAmendmentInInvoice = async (req, res) => {
  try {
    const db = req.db;

    const { Cid, Uid, Email, FirstName } = req.user;

    const amendmentRequests = req?.body?.amendmentRequests ?? [];

    const responses = [];
    for (const amendmentRequest of amendmentRequests) {
      const slno = amendmentRequest?.slno ?? '';
      const gstin = amendmentRequest?.gstin ?? '';

      const invoiceNumber = amendmentRequest?.invoiceNumber ?? '';

      const amendmentReason = amendmentRequest?.amendmentReason ?? '';
      const response = {
        ...amendmentRequest,
      };

      response.status = 'FAILED';

      if (!gstin) {
        response.message = 'GSTIN is not available';
        responses.push(response);
        continue;
      }
      if (!invoiceNumber) {
        response.message = 'Invoice number is not available';
        responses.push(response);
        continue;
      }
      const originalInvoiceQuery = `SELECT * FROM INVOICE WHERE INVOICENUMBER = ?`;
      const [originalInvoice] = await db.exec(originalInvoiceQuery, [invoiceNumber]);

      if (!originalInvoice) {
        response.message = 'Invoice not found';
        responses.push(response);
        continue;
      }
      if (originalInvoice?.ISAMENDED && originalInvoice?.AMENDEMENTSTATUS == 'A') {
        response.message = 'Cannot amend an already amended invoice';
        responses.push(response);
        continue;
      }

      const gstinStatus = await validateGSTIN(db, gstin);

      if (gstinStatus?.status == 'Failed') {
        response.message = gstinStatus?.message;
        responses.push(response);
        continue;
      }

      const isAmended = true;
      const status = 'P';
      const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

      const result = await makeGSTINAmendment(db, invoiceNumber, gstin, isAmended, status, Email, timestamp, Cid, originalInvoice, FirstName, amendmentReason);

      response.status = result.status;
      response.message = result.message;
      responses.push(response);

      const data = {
        companyCode: 'AI',
        companyId: Cid,
        userId: Uid,
        module: 'GSTIN Amendment',
        eventId: 'Change/Add GSTIN',
        finalStatus: 'S',
        finalStatusMessage: `Request submitted for invoice number ${invoiceNumber}`,
        oldValue: originalInvoice?.PASSENGERGSTIN,
        newValue: gstin,
      };

      auditlog(db, data);
    }
    const response = generateResponse('Success', 'Amendment request(s) submitted', 'T', 'S', '', '', responses);
    
    res.json(response);
    return;
  } catch (error) {
    console.log('Error occurred ::', error);
    const response = generateResponse('Failed', 'Failed to submit amendment request(s)', 'T', 'E', '', '', error);
    res.json(response);
  }
};

exports.makeAddressAmendmentInInvoice = async (req, res) => {
  try {
    const db = req.db;
    const user = req.user.Email;
    const { Cid, FirstName, Uid } = req.user;
    const amendmentRequests = req?.body?.amendmentRequests ?? [];
    const responses = [];
    for (const amendmentRequest of amendmentRequests) {
      const address = amendmentRequest?.address ?? '';
      const invoiceNumber = amendmentRequest?.invoiceNumber ?? '';
      const amendmentReason = amendmentRequest?.amendmentReason ?? '';

      const response = {
        ...amendmentRequest,
      };

      response.status = 'FAILED';

      // if (!address) {
      //   response.message = 'Address cannot be empty'
      //   responses.push(response)
      //   continue;
      // }

      if (!invoiceNumber) {
        response.message = 'Invoice number cannot be empty';
        responses.push(response);
        continue;
      }

      const originalInvoiceQuery = `SELECT * FROM INVOICE WHERE INVOICENUMBER = ?`;
      const [originalInvoice] = await db.exec(originalInvoiceQuery, [invoiceNumber]);

      if (!originalInvoice) {
        response.message = 'Invoice not found';
        responses.push(response);
        continue;
      }

      if (originalInvoice?.ISAMENDED && originalInvoice?.AMENDEMENTSTATUS == 'A') {
        response.message = 'Cannot amend an already amended invoice';
        responses.push(response);
        continue;
      }

      const isAmended = true;
      const status = 'P';
      const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

      const result = await makeAddressAmendment(db, address, invoiceNumber, isAmended, status, user, timestamp, Cid, originalInvoice, FirstName, amendmentReason);
      response.status = result.status;
      response.message = result.message;
      responses.push(response);
      const data = {
        companyCode: 'AI',
        companyId: Cid,
        userId: Uid,
        module: 'Address Amendment',
        eventId: 'Remove GSTIN',
        finalStatus: 'S',
        finalStatusMessage: `Request submitted for invoice number ${invoiceNumber}`,
        oldValue: originalInvoice?.PASSENGERGSTIN,
        newValue: address,
      };

      auditlog(db, data);
    }

    const response = generateResponse('Success', 'Amendment request(s) submitted', 'T', 'S', '', '', responses);
    res.json(response);
    return;
  } catch (error) {
    console.log('Error occurred ::', error);
    const response = generateResponse('Failed', 'Failed to make amendment', 'T', 'E', '', '', error);
    res.json(response);
  }
};

exports.makeChangeAddressAmendmentInInvoice = async (req, res) => {
  try {
    const db = req.db;
    const user = req.user.Email;
    const { Cid, FirstName, Uid } = req.user;
    const amendmentRequests = req?.body?.amendmentRequests ?? [];
    const responses = [];
    for (const amendmentRequest of amendmentRequests) {
      const address = amendmentRequest?.address ?? '';
      const invoiceNumber = amendmentRequest?.invoiceNumber ?? '';
      const amendmentReason = amendmentRequest?.amendmentReason ?? '';

      const response = {
        ...amendmentRequest,
      };

      response.status = 'FAILED';

      if (!address) {
        response.message = 'Address cannot be empty';
        responses.push(response);
        continue;
      }

      if (!invoiceNumber) {
        response.message = 'Invoice number cannot be empty';
        responses.push(response);
        continue;
      }

      const originalInvoiceQuery = `SELECT * FROM INVOICE WHERE INVOICENUMBER = ?`;
      const [originalInvoice] = await db.exec(originalInvoiceQuery, [invoiceNumber]);

      if (!originalInvoice) {
        response.message = 'Invoice not found';
        responses.push(response);
        continue;
      }

      if (originalInvoice?.ISAMENDED && originalInvoice?.AMENDEMENTSTATUS == 'A') {
        response.message = 'Cannot amend an already amended invoice';
        responses.push(response);
        continue;
      }

      const isAmended = true;
      const status = 'P';
      const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

      const result = await makeChangeAddressAmendment(db, address, invoiceNumber, isAmended, status, user, timestamp, Cid, originalInvoice, FirstName, amendmentReason);
      response.status = result.status;
      response.message = result.message;
      responses.push(response);
      const data = {
        companyCode: 'AI',
        companyId: Cid,
        userId: Uid,
        module: 'Address Amendment',
        eventId: 'Change Address',
        finalStatus: 'S',
        finalStatusMessage: `Request submitted for invoice number ${invoiceNumber}`,
        oldValue: originalInvoice?.BILLTOFULLADDRESS,
        newValue: address,
      };

      auditlog(db, data);
    }

    const response = generateResponse('Success', 'Amendment request(s) submitted', 'T', 'S', '', '', responses);

    res.json(response);
    return;
  } catch (error) {
    console.log('Error occurred ::', error);
    const response = generateResponse('Failed', 'Failed to make amendment', 'T', 'E', '', '', error);
    res.json(response);
  }
};

exports.approveGSTINAmendmentInInvoice = async (req, res) => {
  const { Cid, Uid, Email, ISB2A } = req.user;

  try {
    const db = req.db;

    const approveRequests = req?.body?.approveRequest ?? [];

    const responses = [];

    for (const approveRequest of approveRequests) {
      const slno = approveRequest?.slno ?? '';
      const invoiceID = approveRequest?.ID ?? '';

      const response = {
        ...approveRequest,
      };

      response.status = 'FAILED';

      if (!invoiceID) {
        response.message = 'Invoice ID is not available';
        responses.push(response);
        continue;
      }

      const originalInvoiceQuery = `SELECT * FROM INVOICE WHERE ID = ?`;
      const [originalInvoice] = await db.exec(originalInvoiceQuery, [invoiceID]);

      if (!originalInvoice) {
        response.message = 'Invoice not found';
        responses.push(response);
        continue;
      }

      if (originalInvoice?.ISAMENDED && originalInvoice?.AMENDEMENTSTATUS == 'A') {
        response.message = 'Cannot amend an already amended invoice';
        responses.push(response);
        continue;
      }

      const result = await approveOrRejectGSTINAmendment(db, originalInvoice, invoiceID, 'A', Email, ISB2A);
    
      response.status = result.status;
      response.message = result.message;
      responses.push(response);

      let finalStatusMessage = 'GSTIN amendment approved';
      if (ISB2A) {
        finalStatusMessage = 'Amendment Request submitted for AI approval';
      } else {
        finalStatusMessage = 'GSTIN amendment approved';
      }

      const data = {
        companyCode: 'AI',
        companyId: Cid,
        userId: Uid,
        module: 'GSTIN Amendment',
        eventId: 'Approve GSTIN Amendment',
        finalStatus: 'S',
        finalStatusMessage: finalStatusMessage,
        oldValue: originalInvoice?.AMENDEMENTOLDVALUE,
        newValue: originalInvoice?.AMENDEMENTNEWVALUE,
      };

      auditlog(db, data);
    }

    const response = generateResponse('Success', 'Amemdment approve request(s) submitted successfully', 'T', 'S', '', '', responses);

    try {
      const query = `CALL AMENDENDINVOICENOPROCESSING();`;
      const result = await db.exec(query);
      console.log(result);
    } catch (error) {
      console.log('SP Error ::', error);
    }
    res.json(response);
  } catch (error) {
    console.log('Error occurred ::', error);
    const data = {
      companyCode: 'AI',
      companyId: Cid,
      userId: Uid,
      module: 'GSTIN Amendment',
      eventId: 'Approve GSTIN Amendment',
      finalStatus: 'F',
      finalStatusMessage: 'GSTIN Amendment Failed ',
      oldValue: originalInvoice?.AMENDEMENTOLDVALUE,
      newValue: originalInvoice?.AMENDEMENTNEWVALUE,
    };

    auditlog(db, data);
    const response = generateResponse('Failed', 'Failed to submit amendment request(s)', 'T', 'E', '', '', error);
    res.json(response);
  }
};

exports.rejectGSTINAmendmentInInvoice = async (req, res) => {
  const { Cid, Uid, Email, ISB2A } = req.user;
  try {
    const db = req.db;

    const rejectRequests = req?.body?.rejectRequests ?? [];

    const responses = [];

    for (const rejectRequest of rejectRequests) {
      const slno = rejectRequest?.slno ?? '';
      const invoiceID = rejectRequest?.ID ?? '';
      const rejectedReason = rejectRequest?.rejectedReason ?? '';

      const response = {
        ...rejectRequest,
      };

      response.status = 'FAILED';

      if (!invoiceID) {
        response.message = 'Invoice ID is not available';
        responses.push(response);
        continue;
      }

      const originalInvoiceQuery = `SELECT * FROM INVOICE WHERE ID = ?`;
      const [originalInvoice] = await db.exec(originalInvoiceQuery, [invoiceID]);

      if (!originalInvoice) {
        response.message = 'Invoice not found';
        responses.push(response);
        continue;
      }

      if (originalInvoice?.AMENDEMENTSTATUS == 'A') {
        response.message = 'Cannot reject an approved invoice.';
        responses.push(response);
        continue;
      }

      const result = await approveOrRejectGSTINAmendment(db, originalInvoice, invoiceID, 'R', Email, ISB2A, rejectedReason);
      response.status = result.status;
      response.message = result.message;
      responses.push(response);

      const data = {
        companyCode: 'AI',
        companyId: Cid,
        userId: Uid,
        module: 'GSTIN Amendment',
        eventId: 'Reject GSTIN Amendment',
        finalStatus: 'S',
        finalStatusMessage: `GSTIN  Amendment Rejected for invoice number:${originalInvoice?.INVOICENUMBER}`,
        oldValue: originalInvoice?.AMENDEMENTOLDVALUE,
        newValue: originalInvoice?.AMENDEMENTNEWVALUE,
      };

      auditlog(db, data);
    }

    const response = generateResponse('Success', 'Amemdment reject request(s) submitted successfully', 'T', 'S', '', '', responses);
    res.json(response);
  } catch (error) {
    console.log('Error occurred ::', error);

    const data = {
      companyCode: 'AI',
      companyId: Cid,
      userId: Uid,
      module: 'GSTIN Amendment',
      eventId: 'Reject GSTIN Amendment',
      finalStatus: 'F',
      finalStatusMessage: `GSTIN  Amendment Failed for invoice number:${originalInvoice?.INVOICENUMBER}`,
      oldValue: originalInvoice?.AMENDEMENTOLDVALUE,
      newValue: originalInvoice?.AMENDEMENTNEWVALUE,
    };
    auditlog(db, data);

    const response = generateResponse('Failed', 'Failed to make amendment', 'T', 'E', '', '', error);
    res.json(response);
  }
};

exports.approveAddressAmendmentInInvoice = async (req, res) => {
  const { Cid, Uid, Email, ISB2A } = req.user;
  try {
    const db = req.db;

    const approveRequests = req?.body?.approveRequest ?? [];

    const responses = [];

    for (const approveRequest of approveRequests) {
      const invoiceID = approveRequest?.ID ?? '';

      const response = {
        ...approveRequest,
      };

      response.status = 'FAILED';

      if (!invoiceID) {
        response.message = 'Invoice ID is not available';
        responses.push(response);
        continue;
      }

      const originalInvoiceQuery = `SELECT * FROM INVOICE WHERE ID = ?`;
      const [originalInvoice] = await db.exec(originalInvoiceQuery, [invoiceID]);

      if (!originalInvoice) {
        response.message = 'Invoice not found';
        responses.push(response);
        continue;
      }

      if (originalInvoice?.ISAMENDED && originalInvoice?.AMENDEMENTSTATUS == 'A') {
        response.message = 'Cannot amend an already amended invoice';
        responses.push(response);
        continue;
      }

      const result = await approveOrRejectAddressAmendment(db, originalInvoice, invoiceID, 'A', Email, ISB2A);

      response.status = result.status;
      response.message = result.message;
      responses.push(response);

      const oldAddress = originalInvoice?.BILLTOFULLADDRESS;
      const newAddress = originalInvoice?.AMENDEMENTNEWVALUE;

      const data = {
        companyCode: 'AI',
        companyId: Cid,
        userId: Uid,
        module: 'GSTIN Amendment',
        eventId: 'Approve GSTIN Amendment',
        finalStatus: 'S',
        finalStatusMessage: 'GSTIN amendement approved ',
        oldValue: oldAddress,
        newValue: newAddress,
      };

      auditlog(db, data);
    }
    const response = generateResponse('Success', 'Amemdment approve request(s) submitted successfully', 'T', 'S', '', '', responses);
    try {
      const query = `CALL AMENDENDINVOICENOPROCESSING();`;
      const result = await db.exec(query);
    } catch (error) {
      console.log('SP Error ::', error);
    }
    res.json(response);
  } catch (error) {
    console.log('Error occurred ::', error);

    const oldAddress = originalInvoice.BILLTOFULLADDRESS;
    const newAddress = originalInvoice.AMENDEMENTNEWVALUE;

    const data = {
      companyCode: 'AI',
      companyId: Cid,
      userId: Uid,
      module: 'GSTIN Amendment',
      eventId: 'Approve GSTIN Amendment',
      finalStatus: 'F',
      finalStatusMessage: 'GSTIN amendement failed ',
      oldValue: oldAddress,
      newValue: newAddress,
    };

    auditlog(db, data);

    const response = generateResponse('Failed', 'Failed to make amendment', 'T', 'E', '', '', error);
    res.json(response);
  }
};

exports.rejectAddressAmendmentInInvoice = async (req, res) => {
  const { Cid, Uid, Email, ISB2A } = req.user;
  let originalInvoice = null;
  try {
    const db = req.db;

    const rejectRequests = req?.body?.rejectRequests ?? [];
    const responses = [];

    for (const rejectRequest of rejectRequests) {
      const invoiceID = rejectRequest?.ID ?? '';
      const rejectedReason = rejectRequest?.rejectedReason ?? '';

      const response = {
        ...rejectRequest,
      };

      response.status = 'FAILED';

      if (!invoiceID) {
        response.message = 'Invoice ID is not available';
        responses.push(response);
        continue;
      }

      const originalInvoiceQuery = `SELECT * FROM INVOICE WHERE ID = ?`;
      const [originalInvoice] = await db.exec(originalInvoiceQuery, [invoiceID]);

      if (!originalInvoice) {
        response.message = 'Invoice not found';
        responses.push(response);
        continue;
      }

      if (originalInvoice?.AMENDEMENTSTATUS == 'A') {
        response.message = 'Cannot reject an approved invoice.';
        responses.push(response);
        continue;
      }

      const result = await approveOrRejectAddressAmendment(db, originalInvoice, invoiceID, 'R', Email, ISB2A, rejectedReason);
      response.status = result.status;
      response.message = result.message;
      responses.push(response);
      const oldAddress = originalInvoice?.BILLTOFULLADDRESS;
      const newAddress = originalInvoice?.AMENDEMENTNEWVALUE;

      const data = {
        companyCode: 'AI',
        companyId: Cid,
        userId: Uid,
        module: 'Address Amendment',
        eventId: 'Reject Address Amendment',
        finalStatus: 'S',
        finalStatusMessage: `Address amendement rejected for invoice number:${originalInvoice?.INVOICENUMBER}`,
        oldValue: oldAddress,
        newValue: newAddress,
      };

      auditlog(db, data);
    }

    const response = generateResponse('Success', 'Amemdment reject request(s) submitted successfully', 'T', 'S', '', '', responses);
    res.json(response);
  } catch (error) {
    console.log('Error occurred ::', error);
    const oldAddress = originalInvoice?.BILLTOFULLADDRESS;
    const newAddress = originalInvoice?.AMENDEMENTNEWVALUE;

    const data = {
      companyCode: 'AI',
      companyId: Cid,
      userId: Uid,
      module: 'Address Amendment',
      eventId: 'Reject Address Amendment',
      finalStatus: 'F',
      finalStatusMessage: `Address amendement rejected for invoice number:${originalInvoice?.INVOICENUMBER}`,
      oldValue: oldAddress,
      newValue: newAddress,
    };
    auditlog(db, data);

    const response = generateResponse('Failed', 'Failed to make amendment', 'T', 'E', '', '', error);
    res.json(response);
  }
};

exports.approveChangeAddressAmendmentInInvoice = async (req, res) => {
  const { Cid, Uid, Email, ISB2A } = req.user;
  try {
    const db = req.db;

    const approveRequests = req?.body?.approveRequest ?? [];

    const responses = [];

    for (const approveRequest of approveRequests) {
      const invoiceID = approveRequest?.ID ?? '';

      const response = {
        ...approveRequest,
      };

      response.status = 'FAILED';

      if (!invoiceID) {
        response.message = 'Invoice ID is not available';
        responses.push(response);
        continue;
      }

      const originalInvoiceQuery = `SELECT * FROM INVOICE WHERE ID = ?`;
      const [originalInvoice] = await db.exec(originalInvoiceQuery, [invoiceID]);

      if (!originalInvoice) {
        response.message = 'Invoice not found';
        responses.push(response);
        continue;
      }

      if (originalInvoice?.ISAMENDED && originalInvoice?.AMENDEMENTSTATUS == 'A') {
        response.message = 'Cannot amend an already amended invoice';
        responses.push(response);
        continue;
      }

      const result = await approveOrRejectChangeAddressAmendment(db, originalInvoice, invoiceID, 'A', Email, ISB2A);
      response.status = result.status;
      response.message = result.message;
      responses.push(response);
      const data = {
        companyCode: 'AI',
        companyId: Cid,
        userId: Uid,
        module: 'Address Amendment',
        eventId: 'Approve Address Amendment',
        finalStatus: 'S',

        finalStatusMessage: 'Address amendement approved',
        oldValue: originalInvoice?.AMENDEMENTOLDVALUE,
        newValue: originalInvoice?.AMENDEMENTNEWVALUE,
      };

      auditlog(db, data);
    }
    const response = generateResponse('Success', 'Amemdment approve request(s) submitted successfully', 'T', 'S', '', '', responses);
    try {
      const query = `CALL AMENDENDINVOICENOPROCESSING();`;
      const result = await db.exec(query);
      console.log(result);
    } catch (error) {
      console.log('SP Error ::', error);
    }
    res.json(response);
  } catch (error) {
    console.log('Error occurred ::', error);

    const data = {
      companyCode: 'AI',
      companyId: Cid,
      userId: Uid,
      module: 'Address Amendment',
      eventId: 'Approve Address Amendment',
      finalStatus: 'F',

      finalStatusMessage: 'Address amendement failed ',
      oldValue: originalInvoice?.AMENDEMENTOLDVALUE,
      newValue: originalInvoice?.AMENDEMENTNEWVALUE,
    };

    auditlog(db, data);

    const response = generateResponse('Failed', 'Failed to make amendment', 'T', 'E', '', '', error);
    res.json(response);
  }
};

exports.rejectChangeAddressAmendmentInInvoice = async (req, res) => {
  const { Cid, Uid, Email, ISB2A } = req.user;
  try {
    const db = req.db;

    const rejectRequests = req?.body?.rejectRequests ?? [];
    const responses = [];

    for (const rejectRequest of rejectRequests) {
      const invoiceID = rejectRequest?.ID ?? '';
      const rejectedReason = rejectRequest?.rejectedReason ?? '';

      const response = {
        ...rejectRequest,
      };

      response.status = 'FAILED';

      if (!invoiceID) {
        response.message = 'Invoice ID is not available';
        responses.push(response);
        continue;
      }

      const originalInvoiceQuery = `SELECT * FROM INVOICE WHERE ID = ?`;
      const [originalInvoice] = await db.exec(originalInvoiceQuery, [invoiceID]);

      if (!originalInvoice) {
        response.message = 'Invoice not found';
        responses.push(response);
        continue;
      }

      if (originalInvoice?.AMENDEMENTSTATUS == 'A') {
        response.message = 'Cannot reject an approved invoice.';
        responses.push(response);
        continue;
      }

      const result = await approveOrRejectChangeAddressAmendment(db, originalInvoice, invoiceID, 'R', Email, ISB2A, rejectedReason);
      response.status = result.status;
      response.message = result.message;
      responses.push(response);
      const data = {
        companyCode: 'AI',
        companyId: Cid,
        userId: Uid,
        module: 'Address Amendment',
        eventId: 'Reject Address Amendment',
        finalStatus: 'S',
        finalStatusMessage: `Address amendement rejected for invoice number:${originalInvoice?.INVOICENUMBER}`,
        oldValue: originalInvoice?.AMENDEMENTOLDVALUE,
        newValue: originalInvoice?.AMENDEMENTNEWVALUE,
      };
      console.log('Audit Log:', data);
      auditlog(db, data);
    }

    const response = generateResponse('Success', 'Amemdment reject request(s) submitted successfully', 'T', 'S', '', '', responses);
    res.json(response);
  } catch (error) {
    console.log('Error occurred ::', error);

    const data = {
      companyCode: 'AI',
      companyId: Cid,
      userId: Uid,
      module: 'Address Amendment',
      eventId: 'Reject Address Amendment',
      finalStatus: 'F',
      finalStatusMessage: `Address amendement failed for invoice number:${originalInvoice?.INVOICENUMBER}`,
      oldValue: originalInvoice?.AMENDEMENTOLDVALUE,
      newValue: originalInvoice?.AMENDEMENTNEWVALUE,
    };
    console.log('Audit Log:', data);
    auditlog(db, data);

    const response = generateResponse('Failed', 'Failed to make amendment', 'T', 'E', '', '', error);
    res.json(response);
  }
};

exports.getExcelTemplate = async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'excel-templates', 'amendmentdata.xlsx');
    const excelBase64 = fs.readFileSync(filePath, 'base64');

    const response = generateResponse('Success', 'Excel template fetched successfully', 'T', 'S', '', '', { excelBase64 });
    res.json(response);
  } catch (error) {
    const response = generateResponse('Failed', 'Failed to fetch excel template', 'T', 'E', '', '', error);
    res.json(response);
  }
};

exports.amendmentRequestBulkUpload = async (req, res) => {
  try {
    const db = req.db;
    const { Cid, FirstName, Email } = req.user;

    const { excel } = req.body;

    if (!excel) {
      const response = generateResponse('Failed', 'Excel is required', 'T', 'E', '', '', error);
      return res.json(response);
    }

    const MAX_AMENTMENT_REQUESTS = 150;

    const amendmentRequestsExceeded = await isExcelDataProcessingCountExceeded(excel, MAX_AMENTMENT_REQUESTS);

    if (amendmentRequestsExceeded) {
      const response = generateResponse('Failed', MAX_AMENTMENT_REQUESTS + ' amendment requests can be done at a time.', 'T', 'E', '', '', '');
      return res.json(response);
    }

    const processedExcelFile = await processAmendmentRequestsExcel(db, excel, FirstName, Cid, Email);

    const response = generateResponse('Success', 'Excel file processed', 'T', 'S', '', '', { processedExcelFile });
    try {
      db.exec('CALL AmendendInvoiceNoProcessing()');
    } catch (error) {
      console.log(error);
    }
    res.json(response);

    return;
  } catch (error) {
    console.log('Error occurred ::', error);
    const response = generateResponse('Failed', 'Failed to process excel file', 'T', 'E', '', '', error);
    res.json(response);
  }
};
