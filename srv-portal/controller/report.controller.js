const moment = require('moment');
const _ = require('lodash');

const { getGSTINs, getDefaultGSTIN, getGSTINsForAdmin, getGSTINsForUsers } = require('../db/gst.db');
const { getDefaultPeriod, getInvoicesFromReportTable, getAllInvoicesFromReportTable, getFilterData, getSearchFilterData } = require('../db/invoices.db');
const { getFinancialYearDates, isValidValue, checkElementsInArray, isValidValueExcludingArray, prioritizeAndSort } = require('../helpers/common.helper');
const { jsonToExcelBase64, jsonArrayToExcel } = require('../helpers/json2excel.helper');
const { generateResponse } = require('../libs/response');
const { getAgents, getAgentDetails, getAgentsForUsersTCS, getAgentsTCS, getAgentsForUsers } = require('../db/agent.db');
const { getPlaceOfSupplyDetails } = require('../db/masters.db');
const { validategetReportsRequest, validateFilterRequest } = require('../validations/get.invoice.req.validation');

function getCommonElements(array1, array2) {
  return array1.filter((element) => array2.includes(element));
}

function permissionQueryBuilder(req) {
  let permission = ` COMPANYID='${req.user.Cid}' `;
  if (req.user.UserRole != 'Admin' && !req.user.ISB2A) return `${permission} `;
  return permission;
}

async function getfilterValues(filterVariables, tableOrViewName, req) {
  let db = req.db;
  let filters = {};
  for (let filterCondition of Object.keys(filterVariables)) {
    let fieldName = filterVariables[filterCondition].field;

    if ('additionalFields' in filterVariables[filterCondition])
      fieldName = filterVariables[filterCondition].field + ', ' + filterVariables[filterCondition].additionalFields.join(', ');

    let query = `SELECT DISTINCT ${fieldName} FROM ${tableOrViewName} 
    WHERE ${permissionQueryBuilder(req)} AND ${filterVariables[filterCondition].field} IS NOT NULL`;

    filters[filterCondition] = await db.exec(query);

    if (!('additionalFields' in filterVariables[filterCondition])) filters[filterCondition] = filters[filterCondition].map((x) => x[filterVariables[filterCondition].field]);
  }
  return filters;
}

function whereQueryBuilder(filterConditions, filterVariables) {
  let permissionClause = permissionQueryBuilder(filterConditions);
  filterConditions = filterConditions.body;
  // let cIdCaluse = '';

  let outQuery = [];
  let filterKeys = getCommonElements(Object.keys(filterConditions), Object.keys(filterVariables));

  filterKeys.forEach((filterKey) => {
    let fieldName = filterVariables[filterKey].field;
    outQuery.push('(' + filterConditions[filterKey].map((x) => `${fieldName} = '${x}'`).join(' OR ') + ')');
  });

  if (outQuery.length != 0) return ` WHERE ${permissionClause} AND ${outQuery.join(' AND ')}`;

  return `WHERE ${permissionClause}`;
}
async function getTotalRecords(tableOrViewName, req, filterVariables) {
  let filterQuery = whereQueryBuilder(req, filterVariables);
  //permissionQueryBuilder(req)
  let query = `SELECT COUNT(*) AS TOTALINVOICES
  FROM ${tableOrViewName}
  ${filterQuery};`;
  return await req.db.exec(query)[0].TOTALINVOICES;
}
async function generateDataView(tableOrViewName, columns, req, filterVariables) {
  let filterConditions = req.body;
  let db = req.db;
  filterConditions.pageSize = filterConditions.pageSize || 5000;
  filterConditions.pageNumber = filterConditions.pageNumber || 1;
  // filterVariables.permission = permissionQueryBuilder(req);
  //get Values which are common to both the input values and the conditions for filter
  let filterKeys = whereQueryBuilder(req, filterVariables),
    limitingQuery = `LIMIT ${filterConditions.pageSize} OFFSET ${(filterConditions.pageNumber - 1) * filterConditions.pageSize} `;
  columns = columns.length == 0 ? '*' : columns.join(',');
  let query = `SELECT ${columns} FROM ${tableOrViewName}  
  ${filterKeys}
  ${limitingQuery} `;
  return await db.exec(query);
}

module.exports = {
  getReports: async (req, res) => {
    try {
      
    
      const db = req.db;

      const { Cid, Uid, Email, PAN, ISB2A, UserRole, category } = req.user;

      const { error } =!req.body.exportAll&& await validategetReportsRequest(req.body,req.body?.apiType??"");

      if (error) {
        const response = generateResponse('Failed', error, 'T', 'E', '', '', null);
        return res.json(response);
      }

      if (req?.body?.hasOwnProperty('passengerName')) {
        req.body['passangerName'] = req.body['passengerName'];
        delete req?.body?.passengerName;
      }

      let initialSearchParameters = Object.assign({}, req.body);
      let searchParameters = Object.assign({}, req.body);
      const filters = {};

      const defaultGSTIN = (await getDefaultGSTIN(db, Uid)).data ?? '';

      filters.isB2A = ISB2A;
      filters.defaultGSTIN = defaultGSTIN;

      delete initialSearchParameters.bookingType;
      delete initialSearchParameters.isInitial;
      delete initialSearchParameters.apiType;

      delete searchParameters.bookingType;
      delete searchParameters.isInitial;
      delete searchParameters.apiType;

      const { apiType, isInitial, invoiceFilter, pageNumber, pageSize, bookingType, generateExcel, columns,exportAll } = req.body;

      const adminIATAcodes = (apiType === "TCSReport" || apiType == "TCSDetailsReport") ? (await getAgentsTCS(db, Cid)).data : (await getAgents(db, Cid)).data;

      const adminGSTINs = (await getGSTINsForAdmin(db, Cid)).data;
      const userIATAcodes = (apiType === "TCSReport" || apiType == "TCSDetailsReport") ? (await getAgentsForUsersTCS(db, Uid, Cid)).data : (await getAgentsForUsers(db, Uid, Cid)).data;
      const userGSTINs = (await getGSTINsForUsers(db, Uid, Cid)).data;

      const apiTypesThatRequirePeriod = ['AreaSummary', 'Reports'];

      const apiTypesThatRequireBookingType = ['Documents', 'DocumentHistory', 'AmendmentRequest', 'AmendmentsApproved'];

      const apiTypesThatRequireDefaultGSTIN = ['Documents', 'DocumentHistory', 'AmendmentRequest'];

      const apiTypesThatDoNotRequireGSTIN = ['TCSReport','TCSDetailsReport']

      if (apiTypesThatRequirePeriod.includes(apiType)) {
        const defaultPeriod = (await getDefaultPeriod(db, Uid)).data ?? '';
        const timePeriod = invoiceFilter ?? defaultPeriod;

        initialSearchParameters.invoiceFilter = timePeriod;
        searchParameters.invoiceFilter = timePeriod;
        filters.invoiceFilter = timePeriod;
      }

      let tableName = 'AREASUMMARY';
      let orderby ;

      switch (apiType) {
        case 'AreaSummary':
          orderby = 'INVOICEDATE DESC'
          break;
        case 'TCSReport':
          tableName = 'TCSSUMMARYMAIN';
          orderby = 'YEAR DESC, MONTH DESC' ;
          break;
        case 'TCSDetailsReport':
          tableName = 'TCSI_RT';
          orderby = 'INVOICEDATE DESC'
          break;
        case 'Reports':
          orderby = 'INVOICEDATE DESC'
          break;
        default:
          break;
      }

      if (initialSearchParameters?.invoiceNumber && initialSearchParameters?.invoiceNumber?.length > 0 && generateExcel) {
        let invoiceNumbers = initialSearchParameters.invoiceNumber;
        initialSearchParameters = {};
        searchParameters = {};
        initialSearchParameters.invoiceNumber = invoiceNumbers;
        searchParameters.invoiceNumber = invoiceNumbers;
      }

      let searchIata;
      let searchGSTIN;

      if (UserRole == 'Admin') {
        searchIata = adminIATAcodes;
        searchGSTIN = adminGSTINs;
      } else {
        searchIata = userIATAcodes;
        searchGSTIN = userGSTINs;
      }

      if(apiType == 'TCSReport' || apiType == 'TCSDetailsReport'){
        if(searchIata?.length == 0 ){
          const response = generateResponse('Failed', 'IATA Number not found', 'T', 'E', '', '', {invoices:[]});
          return res.json(response);
        }
      }

      const searchOptions = Object.assign({}, initialSearchParameters);
      
     

      if (searchIata?.length > 0 && !req?.body?.hasOwnProperty('passengerGSTIN')&& !req?.body?.hasOwnProperty('invoiceNumber')
      &&!req?.body?.hasOwnProperty('supplierGSTIN')&&!req?.body?.hasOwnProperty('ticketNumber')&&!req?.body?.hasOwnProperty('passangerName')&&!req?.body?.hasOwnProperty('pnr')) {
        if (req?.body?.iataNumber && req?.body?.iataNumber?.length > 0) {
        } else {
          searchOptions.iataNumber = searchIata;
        }
      }


      if (searchGSTIN?.length > 0 && !req?.body?.hasOwnProperty('iataNumber')&&!req?.body?.hasOwnProperty('invoiceNumber')&&!req?.body?.hasOwnProperty('supplierGSTIN')
      &&!req?.body?.hasOwnProperty('ticketNumber')&&!req?.body?.hasOwnProperty('passangerName')&&!req?.body?.hasOwnProperty('pnr')) {
        if (req?.body?.passengerGSTIN && req?.body?.passengerGSTIN?.length > 0 && !isInitial) {
          // searchOptions.passengerGSTIN = checkElementsInArray(req?.body?.passengerGSTIN, searchGSTIN)
        } else {
          searchOptions.passengerGSTIN = searchGSTIN;
        }
      }

      if(searchOptions?.iataNumber && searchOptions?.iataNumber?.length >0){
        searchOptions["iataNumber_OR"] = searchOptions?.iataNumber??[]
        searchOptions.iataNumber = [];
        delete searchOptions.iataNumber;
      }

      if(searchOptions?.passengerGSTIN && searchOptions?.passengerGSTIN?.length >0){
        searchOptions["passengerGSTIN_OR"] = searchOptions?.passengerGSTIN??[]
        searchOptions.passengerGSTIN = [];
        delete searchOptions.passengerGSTIN;
      }

      
      const searchKeys = Object.keys(searchOptions);
      const filteredSearchKeys = _.pullAll(searchKeys,['passengerGSTIN_OR','iataNumber_OR','pageNumber','pageSize','invoiceFilter']);

      if (filteredSearchKeys.length > 0) {

        if(searchOptions?.iataNumber_OR && searchOptions?.iataNumber_OR?.length >0&&!searchOptions.documentType){
          searchOptions["iataNumber"] = searchOptions?.iataNumber_OR??[]
          delete searchOptions.iataNumber_OR;
        }
  
        if(searchOptions?.passengerGSTIN_OR && searchOptions?.passengerGSTIN_OR?.length >0&&!searchOptions.documentType){
          searchOptions["passengerGSTIN"] = searchOptions?.passengerGSTIN_OR??[]
          delete searchOptions.passengerGSTIN_OR;
        }
      }

      if(apiType == 'TCSReport' || apiType == 'TCSDetailsReport'){
        if(searchOptions?.passengerGSTIN_OR && searchOptions?.passengerGSTIN_OR?.length >0){
          delete searchOptions.passengerGSTIN_OR;
        }
        if(searchOptions?.passengerGSTIN && searchOptions?.passengerGSTIN?.length >0){
          delete searchOptions.passengerGSTIN;
        }
      }





      let invoices
      let finalSearchOptions = Object.assign({},searchOptions);

      const allInvoicesLength = (await getInvoicesFromReportTable(db,tableName, null, null, searchOptions, true))?.data;
      const [totalInvoices] = Object.values(allInvoicesLength[0]) ?? 0;
  
    
      if(exportAll){
        
        
      let   dataarray = (await getInvoicesFromReportTable(db,tableName, 1, null,searchOptions)).data;
          invoices = _.uniqBy(dataarray, 'ID');
       
      }
      else{
        console.log(searchOptions);
        invoices = (await getInvoicesFromReportTable(db,tableName, pageNumber, pageSize,searchOptions)).data;
       
      }

      if (isInitial) {


        if (searchGSTIN?.length > 0 || searchIata?.length > 0) {
          finalSearchOptions = {};
        }

        if (searchGSTIN?.length > 0 && !apiTypesThatDoNotRequireGSTIN.includes(apiType)) {
          finalSearchOptions['passengerGSTIN_OR'] = searchGSTIN;
        }

        
        if (searchIata?.length > 0) {
          finalSearchOptions['iataNumber_OR'] = searchIata;
        }

        if(apiType == 'TCSReport' || apiType == 'TCSDetailsReport'){

          let iataNumber = (await getFilterData(db, tableName, 'IATANUMBER', finalSearchOptions,orderby))?.data ?? [];
          let ota_gstin = apiType == 'TCSReport'?(await getFilterData(db, tableName, 'OTA_GSTIN', finalSearchOptions,orderby))?.data ?? [] : (await getFilterData(db, tableName, 'GSTIN_OTA', finalSearchOptions,orderby))?.data ?? [];
          let documentType = (await getFilterData(db, tableName, 'DOCUMENTTYPE', finalSearchOptions,orderby))?.data ?? [];


          if (UserRole == 'Admin') {
            iataNumber.push(...adminIATAcodes);
          } else {
            iataNumber.push(...userIATAcodes);
          }
  
          iataNumber = _.without(_.uniq(iataNumber), null, undefined, '', 'null');
          ota_gstin = _.without(_.uniq(ota_gstin), null, undefined, '', 'null');
          documentType = _.without(_.uniq(documentType), null, undefined, '', 'null');


          const filterValues = (await getAgentsTCS(db, Cid)).data
          filters.iataNumber = (await getAgentDetails(db, iataNumber))?.data.filter(item => filterValues.includes(item.IATANUMBER)) ??[]
          filters.ota_gstin = ota_gstin;
          filters.documentType = documentType;
    

          if(apiType == 'TCSDetailsReport'){
            let ticketNumber = (await getFilterData(db, tableName, 'TICKETNUMBER', finalSearchOptions,orderby))?.data ?? [];
            ticketNumber = _.without(_.uniq(ticketNumber), null, undefined, '', 'null');
            filters.ticketNumber = ticketNumber;
          }



        }else{

          let pnr = (await getFilterData(db, tableName, 'PNR', searchOptions,orderby))?.data ?? [];
          let ticketNumber = (await getFilterData(db, tableName, 'TICKETNUMBER', searchOptions,orderby))?.data ?? [];
          let supplierGSTIN = (await getFilterData(db, tableName, 'SUPPLIERGSTIN', searchOptions,orderby))?.data ?? [];
          let passengerGSTIN = (await getFilterData(db, tableName, 'PASSENGERGSTIN', searchOptions,orderby))?.data ?? [];
          let invoiceNumber = (await getFilterData(db, tableName, 'INVOICENUMBER', searchOptions,orderby))?.data ?? [];
          let documentType = (await getFilterData(db, tableName, 'DOCUMENTTYPE', searchOptions,orderby))?.data ?? [];
          let sectionType = (await getFilterData(db, tableName, 'SECTIONTYPE', searchOptions,orderby))?.data ?? [];
          let iataNumber = (await getFilterData(db, tableName, 'IATANUMBER', searchOptions,orderby))?.data ?? [];
          let placeOfSupply = (await getFilterData(db, tableName, 'PLACEOFSUPPLY', searchOptions,orderby))?.data ?? [];
          let billToName = (await getFilterData(db, tableName, 'BILLTONAME', searchOptions,orderby))?.data ?? [];
          let passengerNames = (await getFilterData(db, tableName, 'PASSANGERNAME', searchOptions,orderby))?.data ?? [];
          let amendmentRequestNos = (await getFilterData(db, tableName, 'AMENDMENTREQUESTNO', searchOptions,orderby))?.data ?? [];

          if (UserRole == 'Admin') {
            iataNumber.push(...adminIATAcodes);
            passengerGSTIN.push(...adminGSTINs);
          } else {
            iataNumber.push(...userIATAcodes);
            passengerGSTIN.push(...userGSTINs);
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
  
          // const filterValues = (await getAgentsTCS(db, Cid)).data
          filters.pnr = pnr;
          filters.ticketNumber = ticketNumber;
          filters.supplierGSTIN = supplierGSTIN;
          filters.passengerGSTIN = passengerGSTIN;
          filters.invoiceNumber = invoiceNumber;
          filters.documentType = documentType;
          filters.sectionType = sectionType;
          filters.iataNumber = (await getAgentDetails(db, iataNumber)).data;
          filters.placeOfSupply = (await getPlaceOfSupplyDetails(db, placeOfSupply)).data;
          filters.billToName = billToName;
          filters.passengerName = passengerNames;
          filters.amendmentRequestNos = amendmentRequestNos;

        }

      }

      function removeEmptyValues(obj) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (key === 'iataNumber') {
                    continue; 
                }
                if (Array.isArray(obj[key])) {
                    obj[key] = obj[key].filter(value => typeof value === 'string' && value.trim() !== "");
                    if (obj[key].length === 0) {
                        delete obj[key];
                    }
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    removeEmptyValues(obj[key]);
                    if (Object.keys(obj[key]).length === 0) {
                        delete obj[key];
                    }
                } else {
                    if (typeof obj[key] === 'string' && obj[key].trim() === "") {
                        delete obj[key];
                    }
                }
            }
        }
        return obj;
    }
    

      let data = {};
      if (generateExcel) {
        const excel = await jsonToExcelBase64(invoices, columns);
        data = {
          excel,
        };
      } else {
        data = {
          invoices,
          totalInvoices,
        };
      }

      if (isInitial) {
       
        data.filters = removeEmptyValues(filters);
       
      }

      const response = generateResponse('Success', 'Invoice(s) fetched successfully.', 'T', 'E', '', '', data);
      return res.json(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(generateResponse(error.message, 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
    }
  },
  getTicketStatusReport: async (req, res) => {
    const viewName = 'TICKETSTATUSREPORT';
    const filterVariables = {
      supplierGSTIN: {
        field: 'SUPPLIERGSTIN',
      },
      passengerGSTIN: {
        field: 'PASSENGERGSTIN',
      },
      billToName: {
        field: 'BILLTONAME',
      },
      iataNumber: {
        field: 'IATANUMBER',
        additionalFields: ['TRADENAME', 'LEGALNAME'],
      },
      ticketNumber: {
        field: 'TICKETNUMBER',
      },
      invoiceNumber: {
        field: 'INVOICENUMBER',
      },
    };

    let data = {
      ticketStatusReport: await generateDataView(viewName, [], req, filterVariables),
      filters: await getfilterValues(filterVariables, viewName, req),
      totalInvoices: await getTotalRecords(viewName, req, filterVariables),
    };
    if (data.ticketStatusReport.length == 0) res.json(generateResponse('Failed', 'No data was found for the mentioned combination.', 'T', 'E', '', '', data));
    else {
      if (req.body.generateExcel) data.ticketStatusReport = await jsonArrayToExcel(data.ticketStatusReport);
      const response = generateResponse('Success', 'Ticket Status Report fetched succesfully', 'T', 'E', '', '', data);
      res.json(response);
    }
  },
  getGstinReports: async (req, res) => {
    try {
      let tableName = 'COMPANYGSTIN';
      const filterVariables = {
        GSTIN: {
          field: 'GSTIN',
        },
        Type: {
          field: 'GSTTYPE',
        },
        Status: {
          field: 'STATUS',
        },
      };

      let data = {
        GSTINDATA: await generateDataView(tableName, ['GSTIN', 'ADDRESS', 'STATUS', 'DATEOFISSUEGST', 'GSTTYPE'], req, filterVariables),
        filters: await getfilterValues(filterVariables, tableName, req),
        totalInvoices: await getTotalRecords(tableName, req, filterVariables),
      };
      if (data.GSTINDATA.length == 0) res.json(generateResponse('Failed', 'No data was found for the mentioned combination.', 'T', 'E', '', '', data));
      if (req.body.generateExcel) data.GSTINDATA = await jsonArrayToExcel(data.GSTINDATA);
      const response = generateResponse('Success', 'GSTIN Details Fetched  Successfully', 'T', 'E', '', '', data);
      res.json(response);
    } catch (error) {
      res.json(generateResponse('Failed', 'Error', 'T', 'E', '', '', error.message));
    }
  },

  getExhaustiveReport: async (req, res) => {
    try {
      const db = req.db;
      const { Cid } = req.user;
      let documentHistory;
      const pageNumber = parseInt(req.body.pageNumber) || 1;
      const pageSize = parseInt(req.body.pageSize) || 10;
      const offset = (pageNumber - 1) * pageSize;
      const generateExcel = req?.body?.generateExcel ?? false;
      const invoiceNumber = req.body.invoiceNumber || [];
      const ticketNumber = req.body.PRIMARYDOCUMENTNBR || [];
      let gstin = req.body.gstin || '';
      let iata = req.body.iata || '';
      const issuanceFrom = req.body.issuanceFrom || '';
      const issuanceTo = req.body.issuanceTo || '';
      const fromDate = req.body.from || '';
      const toDate = req.body.to || '';
      const { columns } = req.body;
      var conditions = [];
      var invoicenum = [];
      const gsts = await db.exec('SELECT GSTIN FROM COMPANYGSTIN WHERE COMPANYID = ?', [Cid]);
      //let gstins = gsts.map(COMPANYGSTIN => `'${COMPANYGSTIN.GSTIN}'`).join(',');
      let gstins = gsts.map((item) => item.GSTIN).filter(Boolean);
      let IATAs = await db.exec(`SELECT IATACODE FROM COMPANYIATA WHERE COMPANYID = '${Cid}'`);
      //let iatacodes = IATAs.map(COMPANYIATA => `'${COMPANYIATA.IATACODE}'`).join(',');
      let iatacodes = IATAs.map((item) => item.IATACODE).filter(Boolean);

      /**Invoice Number Filter */
      if (invoiceNumber && invoiceNumber.length > 0) {
        conditions.push(`INVOICENUMBER IN (${invoiceNumber.map((obj) => `'${obj}'`)})`);
      }

      /**Ticket Number Filter */
      if (ticketNumber && ticketNumber.length > 0) {
        conditions.push(`PRIMARYDOCUMENTNBR IN (${ticketNumber.map((obj) => `'${obj}'`)})`);
      }

      /**Invoice Date Range Filter */
      if (fromDate && toDate) {
        conditions.push(`INVOICEDATE BETWEEN '${moment(fromDate).format('YYYY-MM-DD')}' AND '${moment(toDate).format('YYYY-MM-DD')}'`);
      }

      if (issuanceFrom && issuanceTo) {
        conditions.push(`DATEOFISSUANCE BETWEEN '${moment(issuanceFrom).format('YYYY-MM-DD')}' AND '${moment(issuanceTo).format('YYYY-MM-DD')}'`);
      }

      /**GSTIN Filter */
      if (gstin && gstin.length > 0) {
        conditions.push(`PASSENGERGSTIN IN (${gstin.map((obj) => `'${obj}'`)})`);
      }
      else {
        const gst = gsts;
        conditions.push(`PASSENGERGSTIN IN (${gst.map(obj => `'${obj.GSTIN}'`)})`);
      }


      /**IATA Filter */
      if (iata) {
        if (iata && iata.length > 0) {
          conditions.push(`IATANUMBER IN (${iata.map((obj) => `'${obj}'`)})`);
        } else {
          const allIATAs = IATAs;
          conditions.push(`IATANUMBER IN (${allIATAs.map((obj) => `'${obj.IATACODE}'`)})`);
        }
      }

      const condition = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const query = `
            WITH NumberedDocumentHistory AS (
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY INVOICEDATE DESC) as rn,
                    *
                FROM 
                    "DOCUMENTHISTORY"
                ${condition}
            )
            SELECT *
            FROM NumberedDocumentHistory
            WHERE rn BETWEEN ${offset + 1} AND ${offset + pageSize}
        `;
      documentHistory = await db.exec(query);
      const invoiceNumberData = await db.exec(`SELECT DISTINCT INVOICENUMBER FROM DOCUMENTHISTORY ${condition}`);
      const invoiceNumbers = invoiceNumberData.map((item) => item.INVOICENUMBER).filter(Boolean);
      const ticketNumberData = await db.exec(`SELECT DISTINCT PRIMARYDOCUMENTNBR FROM DOCUMENTHISTORY ${condition}`);
     
      const ticketNumbers = ticketNumberData.map((item) => item.PRIMARYDOCUMENTNBR).filter(Boolean); // Filter out null values

      if (!generateExcel) {
        const filters = {
          invoiceNumber: invoiceNumbers,
          ticketNumber: ticketNumbers,
          gstin: gstins,
          iata: iatacodes,
        };
       
        const totalCount = await db.exec(`SELECT COUNT(*) as totalcount FROM DOCUMENTHISTORY ${condition}`)[0];
        return res.status(200).send(generateResponse('Success', 'Data Fetched', 'T', 'S', 'null', false, { documentHistory, filters, totalcount: totalCount.TOTALCOUNT }));
      } else {
        if (invoiceNumber.length > 0) {
          invoicenum.push(`INVOICENUMBER IN (${invoiceNumber.map((obj) => `'${obj}'`)})`);
        }
        let exceldata = await db.exec(`SELECT * FROM DOCUMENTHISTORY where ${invoicenum}`);
        const excel = await jsonToExcelBase64(exceldata, columns);
        const data = { excel };
        return res.status(200).send(generateResponse('Success', 'Excel generated successfully', 'T', 'S', 'null', false, data));
      }
    } catch (error) {
      return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
    }
  },
  getFilterDataNew: async (req, res) => {
    try {

      const db = req.db;

     


      let initialSearchParameters = Object.assign({}, req.body);
      let searchParameters = Object.assign({}, req.body);
     
;

      delete initialSearchParameters.bookingType;
      delete initialSearchParameters.isInitial;
      delete initialSearchParameters.apiType;

      delete searchParameters.bookingType;
      delete searchParameters.isInitial;
      delete searchParameters.apiType;

      const { apiType} = req.body;

      



      let tableName = 'AREASUMMARY';
      let orderby ;

      switch (apiType) {
        case 'AreaSummary':
          orderby = 'INVOICEDATE DESC'
          break;
        case 'Documents':
          tableName = 'INVOICE';
          break;
          case 'TCSDetailsReport':
            tableName = 'TCSI_RT';
          break;
          case 'DocumentHistoryPriorTo':
            tableName = 'DOCUMENTHISTORY';
            
            break;

           
        // case 'TCSReport':
        //   tableName = 'TCSSUMMARYMAIN';
        //   orderby = 'YEAR DESC, MONTH DESC' ;
        //   break;
        // case 'TCSDetailsReport':
        //   tableName = 'TCSSUMMARYDETAILS';
        //   orderby = 'INVOICEDATE DESC'
        //   break;
        // case 'Reports':
        //   orderby = 'INVOICEDATE DESC'
        //   break;
        // default:
        //   break;
      }
 

     
      const searchOptions = Object.assign({}, initialSearchParameters);
    
    

      const searchKeys = Object.keys(req?.body);
      const filteredSearchKeys = _.pullAll(searchKeys,['apiType']);
      
      if(filteredSearchKeys.length == 0) {
      console.log(e);
        const response = generateResponse('Failed', 'Search parameter not found', 'T', 'E', '', '', null);
        return res.json(response);
      }
      
      const searchItem = filteredSearchKeys[0] 
    
      const key = Object.keys(searchOptions)[0]; 
     
      const value = `%${searchOptions[key]}%`;
      let keyvalue
      if(key==="passengerGSTIN"||key==="ota_gstin"){
        keyvalue ="SUPPLIERGSTIN"
      }
      else if(key==="gstin"){
        keyvalue ="PASSENGERGSTIN"
      }
      else if(key==="gstin_ota"){
        keyvalue ="GSTIN_OTA"
      }
     
      else if(key==="passengerName"){
        keyvalue ="PASSANGERNAME"
      }
     
      else{
        keyvalue=key.toUpperCase()
      }
    
      const query = `SELECT  ${keyvalue} FROM ${tableName} WHERE ${keyvalue} LIKE ? LIMIT 100`;


let datafilter = db.exec(query, [value]);


const uniqueData = Array.from(new Set(datafilter.map(item => item[keyvalue])))
  .filter(list => list.trim() !== '')
  const uniqueDataObject = uniqueData.map(pnr => ({ [keyvalue]: pnr }));

      let data = {};
      data.filters = {} ;
      
      data.filters[searchItem] =  uniqueDataObject.map(item => item[keyvalue]);
      
     
     
      const response = generateResponse('Success', 'Invoice(s) fetched successfully.', 'T', 'E', '', '', data);
      return res.json(response);

    }
    catch(e){
      console.log(e);
      const response = generateResponse('Failed', 'Search parameter not found', 'T', 'E', '', '', null);
      return res.json(response);
    }},
  getFilterData: async (req, res) => {
    try {

      const db = req.db;

      const { Cid, Uid, Email, PAN, ISB2A, UserRole, category } = req.user;

      const { error } = await validateFilterRequest(req.body,req.body?.apiType??"");

      if (error) {
        const response = generateResponse('Failed', error, 'T', 'E', '', '', null);
        return res.json(response);
      }

      let initialSearchParameters = Object.assign({}, req.body);
      let searchParameters = Object.assign({}, req.body);
      const filters = {};

      filters.isB2A = ISB2A;


      delete initialSearchParameters.bookingType;
      delete initialSearchParameters.isInitial;
      delete initialSearchParameters.apiType;

      delete searchParameters.bookingType;
      delete searchParameters.isInitial;
      delete searchParameters.apiType;

      const { apiType} = req.body;

      const adminIATAcodes = (apiType === "TCSReport" || apiType === "TCSDetailsReport") ? (await getAgentsTCS(db, Cid)).data : (await getAgents(db, Cid)).data;

      const adminGSTINs = (await getGSTINsForAdmin(db, Cid)).data;
      const userIATAcodes = (apiType === "TCSReport" || apiType === "TCSDetailsReport") ? (await getAgentsForUsersTCS(db, Uid, Cid)).data : (await getAgentsForUsers(db, Uid, Cid)).data;
      const userGSTINs = (await getGSTINsForUsers(db, Uid, Cid)).data;



      let tableName = 'AREASUMMARY';
      let orderby ;

      switch (apiType) {
        case 'AreaSummary':
          orderby = 'INVOICEDATE DESC'
          break;
        case 'Document':
          tableName = 'INVOICE';
          orderby = 'INVOICEDATE DESC'
          break;
        case 'TCSReport':
          tableName = 'TCSSUMMARYMAIN';
          orderby = 'YEAR DESC, MONTH DESC' ;
          break;
        case 'TCSDetailsReport':
          tableName = 'TCSSUMMARYDETAILS';
          orderby = 'INVOICEDATE DESC'
          break;
        case 'Reports':
          orderby = 'INVOICEDATE DESC'
          break;
        default:
          break;
      }


      let searchIata;
      let searchGSTIN;

      if (UserRole == 'Admin') {
        searchIata = adminIATAcodes;
        searchGSTIN = adminGSTINs;
      } else {
        searchIata = userIATAcodes;
        searchGSTIN = userGSTINs;
      }

      const searchOptions = Object.assign({}, initialSearchParameters);

      if (searchIata?.length > 0 ) {
        searchOptions["iataNumber_OR"] = searchIata;
      }

      if(apiType != "TCSReport" && apiType != "TCSDetailsReport"){
        if (searchGSTIN?.length > 0) {
          searchOptions["passengerGSTIN_OR"] = searchGSTIN;
        }
      }

      let finalSearchOptions = Object.assign({},searchOptions);
      const searchKeys = Object.keys(req?.body);
      const filteredSearchKeys = _.pullAll(searchKeys,['apiType']);
      
      if(filteredSearchKeys.length == 0) {
        const response = generateResponse('Failed', 'Search parameter not found', 'T', 'E', '', '', null);
        return res.json(response);
      }
      
      const searchItem = filteredSearchKeys[0] //.toUpperCase()
      const searchPattern = req?.body[searchItem]
      let filterData = (await getSearchFilterData(db, tableName, searchItem, finalSearchOptions))?.data ?? [];
      let data = {};
      data.filters = {} ;
      const sortedItem = prioritizeAndSort(filterData,searchPattern)
      data.filters[searchItem] = sortedItem;
      
      const response = generateResponse('Success', 'Invoice(s) fetched successfully.', 'T', 'E', '', '', data);
      return res.json(response);

    } catch (error) {
      console.log(error);
      return res.status(500).send(generateResponse(error.message, 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
    }
  },
};
