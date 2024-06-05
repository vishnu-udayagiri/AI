const moment = require('moment');
const { getFiscalYearBounds, getFinancialYearDates } = require("./common.helper");

exports.buildQuery = (baseQuery, input, pageNumber, pageSize, countOnly = false, invoiceNumberOnly = false) => {
    let query = '';
    let conditions = [];
    let rowNumberConditions = "";

    for (let key in input) {
        if (input[key]) {
            switch (key) {
                case 'invoiceFilter':
                    let today = new Date();
                    let dateBounds;
                    switch (input[key]) {
                        case 'CM':
                            conditions.push(`MONTH(INVOICEDATE) = ${today.getMonth() + 1} AND YEAR(INVOICEDATE) = ${today.getFullYear()}`);
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
                            let lastYear = new Date(today.getFullYear() - 1, today.getMonth(), 1);
                            dateBounds = getFiscalYearBounds(lastYear);
                            conditions.push(`INVOICEDATE BETWEEN CAST('${dateBounds.start.toISOString().split('T')[0]}' AS DATE) AND CAST('${dateBounds.end.toISOString().split('T')[0]}' AS DATE)`);
                            break;
                    }
                    break;


                case 'invoiceNumber':
                    if (Array.isArray(input[key]) && input[key].length > 0) {
                        const numbersList = input[key].map(num => `'${num}'`).join(',');
                        conditions.push(`INVOICENUMBER IN (${numbersList})`);
                    } else if (typeof input[key] === 'string' && input[key].trim() !== '') {
                        conditions.push(`INVOICENUMBER = '${input[key]}'`);
                    }
                    break;

                case 'supplierGSTIN':
                    if (Array.isArray(input[key]) && input[key].length > 0) {
                        const numbersList = input[key].map(num => `'${num}'`).join(',');
                        conditions.push(`SUPPLIERGSTIN IN (${numbersList})`);
                    } else if (typeof input[key] === 'string' && input[key].trim() !== '') {
                        conditions.push(`SUPPLIERGSTIN = '${input[key]}'`);
                    }
                    break;

                case 'passengerGSTIN':
                    if (!input['isAmended'] || input['isAmended'] != 'true') {
                        if (Array.isArray(input[key]) && input[key].length > 0) {
                            const numbersList = input[key].map(num => `'${num}'`).join(',');
                            conditions.push(`PASSENGERGSTIN IN (${numbersList})`);
                        } else if (typeof input[key] === 'string' && input[key].trim() !== '') {
                            conditions.push(`PASSENGERGSTIN = '${input[key]}'`);
                        }
                    }
                    break;

                case 'iataNumber':

                    let iataNumberCondition = '';


                    if (Array.isArray(input[key]) && input[key].length > 0) {
                        const numbersList = input[key].map(num => `'${num}'`).join(',');
                        iataNumberCondition = (`IATANUMBER IN (${numbersList})`);
                    } else if (typeof input[key] === 'string' && input[key].trim() !== '') {
                        iataNumberCondition = (`IATANUMBER = '${input[key]}'`);
                    }

                    if (input['passengerGSTINOR']) {

                        const passengerGSTIN = input['passengerGSTINOR']

                        if (Array.isArray(passengerGSTIN) && passengerGSTIN.length > 0) {
                            const numbersList = passengerGSTIN.map(num => `'${num}'`).join(',');
                            iataNumberCondition = (`((${iataNumberCondition}) OR PASSENGERGSTIN IN (${numbersList}))`);
                        } else if (typeof passengerGSTIN === 'string' && passengerGSTIN.trim() !== '') {
                            iataNumberCondition = (`((${iataNumberCondition}) OR PASSENGERGSTIN = '${passengerGSTIN}')`);
                        }
                    }

                    if (iataNumberCondition) {
                        conditions.push(iataNumberCondition)
                    }
                    break;

                case 'isAmended':
                    let gstinCondition = '';
                    const passengerGSTIN = input['passengerGSTIN'];

                    if (input[key] === "true") {

                        if (Array.isArray(passengerGSTIN) && passengerGSTIN.length > 0) {
                            const gstinList = passengerGSTIN.map(gstin => `'${gstin}'`).join(',');
                            gstinCondition = `(PASSENGERGSTIN IN (${gstinList}) OR ORIGINALGSTIN IN (${gstinList}))`;
                        } else if (typeof passengerGSTIN === 'string' && passengerGSTIN.trim() !== '') {
                            gstinCondition = `(PASSENGERGSTIN = '${passengerGSTIN}' OR ORIGINALGSTIN = '${passengerGSTIN}')`;
                        }

                        if (gstinCondition) {
                            conditions.push(`(ISAMENDED = True AND ${gstinCondition})`);
                        } else {
                            conditions.push(`ISAMENDED = True`);
                        }
                    } else if (input[key] === "false") {
                        // const date180DaysAgo = new Date(new Date().setDate(new Date().getDate() - 180)).toISOString().split('T')[0];
                        // if (gstinCondition) {
                        //     conditions.push(`((ISAMENDED IS NULL OR ISAMENDED = False) AND INVOICEDATE > '${date180DaysAgo}' AND ${gstinCondition})`);
                        // } else {
                        //     conditions.push(`(ISAMENDED IS NULL OR ISAMENDED = False) AND INVOICEDATE > '${date180DaysAgo}'`);
                        // }

                        if (Array.isArray(passengerGSTIN) && passengerGSTIN.length > 0) {
                            const gstinList = passengerGSTIN.map(gstin => `'${gstin}'`).join(',');
                            gstinCondition = `(PASSENGERGSTIN IN (${gstinList}))`;
                        } else if (typeof passengerGSTIN === 'string' && passengerGSTIN.trim() !== '') {
                            gstinCondition = `(PASSENGERGSTIN = '${passengerGSTIN}')`;
                        }

                        const currentYear = new Date().getFullYear();
                        let fromDate, toDate;
                        if (input['invoiceFilter'] == 'PY') {
                            fromDate = `${currentYear - 1}-04-01`;
                            toDate = `${currentYear}-10-31`;
                        } else if (!input.hasOwnProperty('invoiceFilter')) {
                            fromDate = `${currentYear}-04-01`;
                            toDate = `${currentYear + 1}-03-31`;
                        }


                        if(input.hasOwnProperty('invoiceFilter')){
                            if (gstinCondition) {
                                conditions.push(`((ISAMENDED IS NULL OR ISAMENDED = False)  AND ${gstinCondition} )`);
                            } else {
                                conditions.push(`(ISAMENDED IS NULL OR ISAMENDED = False)`);
                            }
                        }else{

                            if (gstinCondition) {
                                conditions.push(`((ISAMENDED IS NULL OR ISAMENDED = False) AND (INVOICEDATE BETWEEN CAST('${fromDate}' AS DATE) AND CAST('${toDate}' AS DATE) AND ${gstinCondition}))`);
                            } else {
                                conditions.push(`(ISAMENDED IS NULL OR ISAMENDED = False) AND (INVOICEDATE BETWEEN CAST('${fromDate}' AS DATE) AND CAST('${toDate}' AS DATE))`);
                            }

                        }

                    }
                    break;

                case 'invoiceStatus':
                    if (input[key] == 'non-cancelled') {
                        conditions.push(`(INVOICESTATUS <> 'Cancelled' OR INVOICESTATUS IS NULL)`);
                    }
                    if (input[key] == 'cancelled') {
                        conditions.push(` INVOICESTATUS = 'Cancelled'`);
                    }
                    break;


                case 'from':
                    if (input["to"]) {
                        const from = moment(input["from"], "YYYY-MM-DD").toDate();
                        const to = moment(input["to"], "YYYY-MM-DD").toDate();
                        conditions.push(`INVOICEDATE BETWEEN CAST('${input["from"]}' AS DATE) AND CAST('${input["to"]}' AS DATE)`);
                        break;
                    }
                    break;
                case 'to':
                    //nothing to do here. This is to prevent the to from processing
                    break;
                case 'issuanceFrom':
                    if (input["issuanceTo"]) {
                        const from = moment(input["issuanceFrom"], "YYYY-MM-DD").toDate();
                        const to = moment(input["issuanceTo"], "YYYY-MM-DD").toDate();
                        conditions.push(`INVOICEDATE BETWEEN CAST('${input["issuanceFrom"]}' AS DATE) AND CAST('${input["issuanceTo"]}' AS DATE)`);
                        break;
                    }
                    break;
                case 'issuanceTo':
                    //nothing to do here. This is to prevent the issuanceTo from processing
                    break;

                case 'passengerGSTINOR':
                    //nothing to do here. This is to prevent the passengerGSTINOR from processing
                    break;

                case 'amendmentRequestedOnFrom':
                    if (input["amendmentRequestedOnTo"]) {
                        conditions.push(`AMENDMENTREQUESTEDON BETWEEN CAST('${input["amendmentRequestedOnFrom"]}' AS DATE) AND CAST('${input["amendmentRequestedOnTo"]}' AS DATE)`);
                        break;
                    }
                    break;

                case 'amendmentRequestedOnTo':
                    //nothing to do here. This is to prevent the amendmentRequestedOnTo from processing
                    break;

                case 'amendmentApprovedOnFrom':
                    if (input["amendmentApprovedOnTo"]) {
                        conditions.push(`AMENDMENTAPPROVEDON BETWEEN CAST('${input["amendmentApprovedOnFrom"]}' AS TIMESTAMP) AND CAST('${input["amendmentApprovedOnTo"]}' AS TIMESTAMP)`);
                        break;
                    }
                    break;
                case 'amendmentApprovedOnTo':
                    //nothing to do here. This is to prevent the amendmentApprovedOnTo from processing
                    break;

                case 'financialYear':
                    let _dateBounds = getFinancialYearDates(input['financialYear']);
                    conditions.push(`INVOICEDATE BETWEEN CAST('${_dateBounds.start.toISOString().split('T')[0]}' AS DATE) AND CAST('${_dateBounds.stop.toISOString().split('T')[0]}' AS DATE)`);
                    break;

                case 'status':
                    let status = ""
                    let AIstatus = ""
                    if (input["status"] == "approved") {
                        status = "A"
                        AIstatus = "AY";
                    }
                    else if (input["status"] == "rejected") {
                        status = "R";
                        AIstatus = "RY";
                    }
                    else if (input["status"] == "pending") status = "P"

                    if ((status && status != "") && !AIstatus) {
                        conditions.push(`AMENDEMENTSTATUS = '${status}'`);
                        break;
                    }

                    if ((status && status != "") && (AIstatus && AIstatus != "")) {
                        conditions.push(`(AMENDEMENTSTATUS = '${status}' OR AMENDEMENTSTATUS = '${AIstatus}')`);
                        break;
                    }

                    break;

                case 'ticketIssueDateFrom':
                    if (input["ticketIssueDateTo"]) {
                        const from = moment(input["from"], "YYYY-MM-DD").toDate();
                        const to = moment(input["to"], "YYYY-MM-DD").toDate();
                        conditions.push(`TICKETISSUEDATE BETWEEN CAST('${input["ticketIssueDateFrom"]}' AS DATE) AND CAST('${input["ticketIssueDateTo"]}' AS DATE)`);
                        break;
                    }
                    break;

                case 'ticketIssueDateTo':
                    //nothing to do here. This is to prevent the ticketIssueDateTo from processing
                    break;


                default:
                    if (Array.isArray(input[key]) && input[key].length > 0) {
                        const numbersList = input[key].map(num => `'${num}'`).join(',');
                        conditions.push(`${key.toUpperCase()} IN (${numbersList})`);
                    } else if (typeof input[key] === 'string' && input[key].trim() !== '') {
                        conditions.push(`${key.toUpperCase()} = '${input[key]}'`);
                    }
                    // conditions.push(`${key.toUpperCase()} = '${input[key]}'`);
                    break;
            }
        }
    }

    let finalConditions = conditions.filter(Boolean).join(' AND ');

    const joinedQuery = `
        SELECT 
            INVOICE.*,
            INVOICEITEMS.*, 
            TRANSACTIONTYPES.TRANSACTIONTEXT,
            (
                CASE 
                    WHEN INVOICEITEMS.IGSTAMOUNT != 0 THEN INVOICEITEMS.IGSTAMOUNT
                    ELSE INVOICEITEMS.CGSTRATE + INVOICEITEMS.SGSTRATE
                END
            ) AS TotalRate,
            (COALESCE(CGSTRATE, 0) + COALESCE(IGSTRATE, 0) + COALESCE(UTGSTRATE, 0) + COALESCE(SGSTRATE, 0)) as COMBINEDTAXRATE
        FROM 
            INVOICE 
        LEFT JOIN 
            INVOICEITEMS 
        ON 
            INVOICE.ID = INVOICEITEMS.INVOICE_ID
        LEFT JOIN
            TRANSACTIONTYPES
        ON INVOICE.TRANSACTIONCODE = TRANSACTIONTYPES.TRANSACTIONTYPE
        WHERE ${finalConditions}
    `;

    if (invoiceNumberOnly) {
        const joinedQuery = `
            SELECT DISTINCT
                INVOICE.INVOICENUMBER
            FROM 
                INVOICE 
            WHERE ${finalConditions}
        `;
        return joinedQuery;
    }


    if (countOnly) {

        const joinedQuery = `
        SELECT 
            COUNT(*)
        FROM 
            INVOICE 
        LEFT JOIN 
            INVOICEITEMS 
        ON 
            INVOICE.ID = INVOICEITEMS.INVOICE_ID 
        WHERE ${finalConditions}
    `;

        return joinedQuery;

    }



    if (!pageSize || !pageNumber) {
        return joinedQuery;
    }

    const offset = (pageNumber - 1) * pageSize + 1;
    const nextOffset = pageNumber * pageSize;

    return `
    WITH NumberedInvoices AS (
        ${joinedQuery.replace('SELECT', 'SELECT ROW_NUMBER() OVER(ORDER BY INVOICE.ID) as rn,')}
    ) 
    SELECT * 
    FROM NumberedInvoices 
    WHERE rn BETWEEN ${offset} AND ${nextOffset}
`;

};

exports.buildFilterQuery = (tableName, input, fieldName,orderby='') => {

    let conditions = [];
    let OR_Conditions = [];

    for (let key in input) {
        if (input[key]) {
            switch (key) {
                case 'invoiceFilter':
                    let today = new Date();
                    let dateBounds;
                    switch (input[key]) {
                        case 'CM':
                            conditions.push(`MONTH(INVOICEDATE) = ${today.getMonth() + 1} AND YEAR(INVOICEDATE) = ${today.getFullYear()}`);
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
                            let lastYear = new Date(today.getFullYear() - 1, today.getMonth(), 1);
                            dateBounds = getFiscalYearBounds(lastYear);
                            conditions.push(`INVOICEDATE BETWEEN CAST('${dateBounds.start.toISOString().split('T')[0]}' AS DATE) AND CAST('${dateBounds.end.toISOString().split('T')[0]}' AS DATE)`);
                            break;
                    }
                    break;


                case 'invoiceNumber':
                    if (Array.isArray(input[key]) && input[key].length > 0) {
                        const numbersList = input[key].map(num => `'${num}'`).join(',');
                        conditions.push(`INVOICENUMBER IN (${numbersList})`);
                    } else if (typeof input[key] === 'string' && input[key].trim() !== '') {
                        conditions.push(`INVOICENUMBER = '${input[key]}'`);
                    }
                    break;

                case 'supplierGSTIN':
                    if (Array.isArray(input[key]) && input[key].length > 0) {
                        const numbersList = input[key].map(num => `'${num}'`).join(',');
                        conditions.push(`SUPPLIERGSTIN IN (${numbersList})`);
                    } else if (typeof input[key] === 'string' && input[key].trim() !== '') {
                        conditions.push(`SUPPLIERGSTIN = '${input[key]}'`);
                    }
                    break;

                case 'passengerGSTIN':
                    if (!input['isAmended'] || input['isAmended'] != 'true') {
                        if (Array.isArray(input[key]) && input[key].length > 0) {
                            const numbersList = input[key].map(num => `'${num}'`).join(',');
                            conditions.push(`PASSENGERGSTIN IN (${numbersList})`);
                        } else if (typeof input[key] === 'string' && input[key].trim() !== '') {
                            conditions.push(`PASSENGERGSTIN = '${input[key]}'`);
                        }
                    }
                    break;

                case 'iataNumber':

                    let iataNumberCondition = '';


                    if (Array.isArray(input[key]) && input[key].length > 0) {
                        const numbersList = input[key].map(num => `'${num}'`).join(',');
                        iataNumberCondition = (`IATANUMBER IN (${numbersList})`);
                    } else if (typeof input[key] === 'string' && input[key].trim() !== '') {
                        iataNumberCondition = (`IATANUMBER = '${input[key]}'`);
                    }

                    if (input['passengerGSTINOR']) {

                        const passengerGSTIN = input['passengerGSTINOR']

                        if (Array.isArray(passengerGSTIN) && passengerGSTIN.length > 0) {
                            const numbersList = passengerGSTIN.map(num => `'${num}'`).join(',');
                            iataNumberCondition = (`((${iataNumberCondition}) OR PASSENGERGSTIN IN (${numbersList}))`);
                        } else if (typeof passengerGSTIN === 'string' && passengerGSTIN.trim() !== '') {
                            iataNumberCondition = (`((${iataNumberCondition}) OR PASSENGERGSTIN = '${passengerGSTIN}')`);
                        }
                    }

                    if (iataNumberCondition) {
                        conditions.push(iataNumberCondition)
                    }
                    break;

                case 'isAmended':
                    let gstinCondition = '';
                    const passengerGSTIN = input['passengerGSTIN'];

                    if (input[key] === "true") {

                        if (Array.isArray(passengerGSTIN) && passengerGSTIN.length > 0) {
                            const gstinList = passengerGSTIN.map(gstin => `'${gstin}'`).join(',');
                            gstinCondition = `(PASSENGERGSTIN IN (${gstinList}) OR ORIGINALGSTIN IN (${gstinList}))`;
                        } else if (typeof passengerGSTIN === 'string' && passengerGSTIN.trim() !== '') {
                            gstinCondition = `(PASSENGERGSTIN = '${passengerGSTIN}' OR ORIGINALGSTIN = '${passengerGSTIN}')`;
                        }

                        if (gstinCondition) {
                            conditions.push(`(ISAMENDED = True AND ${gstinCondition})`);
                        } else {
                            conditions.push(`ISAMENDED = True`);
                        }
                    } else if (input[key] === "false") {
                        // const date180DaysAgo = new Date(new Date().setDate(new Date().getDate() - 180)).toISOString().split('T')[0];
                        // if (gstinCondition) {
                        //     conditions.push(`((ISAMENDED IS NULL OR ISAMENDED = False) AND INVOICEDATE > '${date180DaysAgo}' AND ${gstinCondition})`);
                        // } else {
                        //     conditions.push(`(ISAMENDED IS NULL OR ISAMENDED = False) AND INVOICEDATE > '${date180DaysAgo}'`);
                        // }

                        if (Array.isArray(passengerGSTIN) && passengerGSTIN.length > 0) {
                            const gstinList = passengerGSTIN.map(gstin => `'${gstin}'`).join(',');
                            gstinCondition = `(PASSENGERGSTIN IN (${gstinList}))`;
                        } else if (typeof passengerGSTIN === 'string' && passengerGSTIN.trim() !== '') {
                            gstinCondition = `(PASSENGERGSTIN = '${passengerGSTIN}')`;
                        }

                        const currentYear = new Date().getFullYear();
                        let fromDate, toDate;
                        if (input['invoiceFilter'] == 'PY') {
                            fromDate = `${currentYear - 1}-04-01`;
                            toDate = `${currentYear}-10-31`;
                        } else if (!input.hasOwnProperty('invoiceFilter')) {
                            fromDate = `${currentYear}-04-01`;
                            toDate = `${currentYear + 1}-03-31`;
                        }

                        if(input.hasOwnProperty('invoiceFilter')){
                            if (gstinCondition) {
                                conditions.push(`((ISAMENDED IS NULL OR ISAMENDED = False)  AND ${gstinCondition} )`);
                            } else {
                                conditions.push(`(ISAMENDED IS NULL OR ISAMENDED = False)`);
                            }
                        }else{

                            if (gstinCondition) {
                                conditions.push(`((ISAMENDED IS NULL OR ISAMENDED = False) AND (INVOICEDATE BETWEEN CAST('${fromDate}' AS DATE) AND CAST('${toDate}' AS DATE) AND ${gstinCondition}))`);
                            } else {
                                conditions.push(`(ISAMENDED IS NULL OR ISAMENDED = False) AND (INVOICEDATE BETWEEN CAST('${fromDate}' AS DATE) AND CAST('${toDate}' AS DATE))`);
                            }

                        }


                    }
                    break;

                
                case 'ISAMENDEDFILTER':
                    if (input[key] === "true") {
                        conditions.push(`(ISAMENDED IS NULL OR ISAMENDED = True)`);
                    }else{
                        conditions.push(`(ISAMENDED IS NULL OR ISAMENDED = False)`);
                    }
                    break;

                case 'invoiceStatus':
                    if (input[key] == 'non-cancelled') {
                        conditions.push(`(INVOICESTATUS <> 'Cancelled' OR INVOICESTATUS IS NULL)`);
                    }
                    if (input[key] == 'cancelled') {
                        conditions.push(` INVOICESTATUS = 'Cancelled'`);
                    }
                    break;


                case 'from':
                    if (input["to"]) {
                        const from = moment(input["from"], "YYYY-MM-DD").toDate();
                        const to = moment(input["to"], "YYYY-MM-DD").toDate();
                        conditions.push(`INVOICEDATE BETWEEN CAST('${input["from"]}' AS DATE) AND CAST('${input["to"]}' AS DATE)`);
                        break;
                    }
                    break;
                case 'to':
                    //nothing to do here. This is to prevent the to from processing
                    break;
                case 'issuanceFrom':
                    if (input["issuanceTo"]) {
                        const from = moment(input["issuanceFrom"], "YYYY-MM-DD").toDate();
                        const to = moment(input["issuanceTo"], "YYYY-MM-DD").toDate();
                        conditions.push(`INVOICEDATE BETWEEN CAST('${input["issuanceFrom"]}' AS DATE) AND CAST('${input["issuanceTo"]}' AS DATE)`);
                        break;
                    }
                    break;
                case 'issuanceTo':
                    //nothing to do here. This is to prevent the issuanceTo from processing
                    break;

                case 'passengerGSTINOR':
                    //nothing to do here. This is to prevent the passengerGSTINOR from processing
                    break;

                case 'amendmentRequestedOnFrom':
                    if (input["amendmentRequestedOnTo"]) {
                        conditions.push(`AMENDMENTREQUESTEDON BETWEEN CAST('${input["amendmentRequestedOnFrom"]}' AS DATE) AND CAST('${input["amendmentRequestedOnTo"]}' AS DATE)`);
                        break;
                    }
                    break;

                case 'amendmentRequestedOnTo':
                    //nothing to do here. This is to prevent the amendmentRequestedOnTo from processing
                    break;

                case 'amendmentApprovedOnFrom':
                    if (input["amendmentApprovedOnTo"]) {
                        conditions.push(`AMENDMENTAPPROVEDON BETWEEN CAST('${input["amendmentApprovedOnFrom"]}' AS TIMESTAMP) AND CAST('${input["amendmentApprovedOnTo"]}' AS TIMESTAMP)`);
                        break;
                    }
                    break;
                case 'amendmentApprovedOnTo':
                    //nothing to do here. This is to prevent the amendmentApprovedOnTo from processing
                    break;

                case 'financialYear':
                    let _dateBounds = getFinancialYearDates(input['financialYear']);
                    conditions.push(`INVOICEDATE BETWEEN CAST('${_dateBounds.start.toISOString().split('T')[0]}' AS DATE) AND CAST('${_dateBounds.stop.toISOString().split('T')[0]}' AS DATE)`);
                    break;

                case 'status':
                    let status = ""
                    let AIstatus = ""
                    if (input["status"] == "approved") {
                        status = "A"
                        AIstatus = "AY";
                    }
                    else if (input["status"] == "rejected") {
                        status = "R";
                        AIstatus = "RY";
                    }
                    else if (input["status"] == "pending") status = "P"

                    if ((status && status != "") && !AIstatus) {
                        conditions.push(`AMENDEMENTSTATUS = '${status}'`);
                        break;
                    }

                    if ((status && status != "") && (AIstatus && AIstatus != "")) {
                        conditions.push(`(AMENDEMENTSTATUS = '${status}' OR AMENDEMENTSTATUS = '${AIstatus}')`);
                        break;
                    }

                    break;

                case 'ticketIssueDateFrom':
                    if (input["ticketIssueDateTo"]) {
                        const from = moment(input["from"], "YYYY-MM-DD").toDate();
                        const to = moment(input["to"], "YYYY-MM-DD").toDate();
                        conditions.push(`TICKETISSUEDATE BETWEEN CAST('${input["ticketIssueDateFrom"]}' AS DATE) AND CAST('${input["ticketIssueDateTo"]}' AS DATE)`);
                        break;
                    }
                    break;

                case 'ticketIssueDateTo':
                    //nothing to do here. This is to prevent the ticketIssueDateTo from processing
                    break;


                default:

                if(key?.endsWith('_OR')){
                    if (Array.isArray(input[key]) && input[key].length > 0) {
                        const numbersList = input[key].map(num => `'${num}'`).join(',');
                        key = key?.substring(0,key.length-3)
                        OR_Conditions.push(`${key.toUpperCase()} IN (${numbersList})`);
                    } else if (typeof input[key] === 'string' && input[key].trim() !== '') {
                        key = key?.substring(0,key.length-3)
                        OR_Conditions.push(`${key.toUpperCase()} = '${input[key]}'`);
                    }
                }else{
                    if (Array.isArray(input[key]) && input[key].length > 0) {
                        const numbersList = input[key].map(num => `'${num}'`).join(',');
                        conditions.push(`${key.toUpperCase()} IN (${numbersList})`);
                    } else if (typeof input[key] === 'string' && input[key].trim() !== '') {
                        conditions.push(`${key.toUpperCase()} = '${input[key]}'`);
                    }
                    // conditions.push(`${key.toUpperCase()} = '${input[key]}'`);
                    break;
                }
            }
        }
    }

    let finalConditions = conditions.filter(Boolean).join(' AND ');
    finalConditions = (OR_Conditions.length != 0) &&  (conditions.length != 0) ? finalConditions + ' AND ' : finalConditions;
    finalConditions += OR_Conditions.filter(Boolean).join(' OR ');

    let joinedQuery;

    if(orderby){

        const row_order = tableName == 'TCSI_RT'? 'IATANUMBER' : 'ID'

        joinedQuery = `
        SELECT STRING_AGG(${fieldName}, ',') AS DATA
        FROM (
            With OrderedFilter as(
                SELECT ${fieldName}, ROW_NUMBER() OVER(ORDER BY ${tableName}.${row_order}) as rn from ${tableName} where ${finalConditions}
            ) Select * from OrderedFilter where rn between 1 and 100
        ) AS distinct_values;
        `;
    }else{

        const row_order = tableName == 'TCSI_RT'? 'IATANUMBER' : 'ID'

        joinedQuery = `
        SELECT STRING_AGG(${fieldName}, ',') AS DATA
        FROM (
            With OrderedFilter as(
                SELECT ${fieldName}, ROW_NUMBER() OVER(ORDER BY ${tableName}.${row_order}) as rn from ${tableName} where ${finalConditions}
            ) Select * from OrderedFilter where  rn between 1 and 100
        ) AS distinct_values;
        `; 

    }


    return joinedQuery;
};

exports.buildSearchFilterQuery = (tableName, input, fieldName,orderby='') => {

    let conditions = [];
    let OR_Conditions = [];

    for (let key in input) {
        if (input[key]) {
            
            if(key?.endsWith('_OR')){
                if (Array.isArray(input[key]) && input[key].length > 0) {
                    const numbersList = input[key].map(num => `'${num}'`).join(',');
                    key = key?.substring(0,key.length-3)
                    OR_Conditions.push(`${key.toUpperCase()} IN (${numbersList})`);
                } else if (typeof input[key] === 'string' && input[key].trim() !== '') {
                    key = key?.substring(0,key.length-3)
                    OR_Conditions.push(`${key.toUpperCase()} = '${input[key]}'`);
                }
            }else{
                conditions.push(`(${key.toUpperCase()} LIKE '${input[key]}%')`);
            }
            
        }
    }

    let finalConditions = conditions.filter(Boolean).join(' AND ');
    finalConditions = (OR_Conditions.length != 0) &&  (conditions.length != 0) ? finalConditions + ' AND ' : finalConditions;
    finalConditions += OR_Conditions.filter(Boolean).join(' OR ');

    let joinedQuery;

    if(orderby || orderby !=''){


        const row_order = tableName == 'TCSI_RT'? 'IATANUMBER' : 'ID'

        joinedQuery = `
        SELECT STRING_AGG(${fieldName}, ',') AS DATA
        FROM (
            With OrderedFilter as(
                SELECT ${fieldName}, ROW_NUMBER() OVER(ORDER BY ${tableName}.${row_order}) as rn from ${tableName}
            ) Select * from OrderedFilter where rn between 1 and 100
        ) AS distinct_values;
        `;
    }else{

        const row_order = tableName == 'TCSI_RT'? 'IATANUMBER' : 'ID'

        joinedQuery = `
        SELECT STRING_AGG(${fieldName}, ',') AS DATA
        FROM (
            With OrderedFilter as(
                SELECT ${fieldName}, ROW_NUMBER() OVER(ORDER BY ${tableName}.${row_order}) as rn from ${tableName}
            ) Select * from OrderedFilter where rn between 1 and 100
        ) AS distinct_values;
        `; 
    }


    return joinedQuery;
};


// INVOICEITEMS.SGSTAMOUNT, 
// INVOICEITEMS.IGSTAMOUNT,
// INVOICEITEMS.CGSTRATE,
// INVOICEITEMS.SGSTRATE,
// INVOICEITEMS.IGSTRATE,
// INVOICEITEMS.COLLECTEDCGST,
// INVOICEITEMS.COLLECTEDSGST,
// INVOICEITEMS.COLLECTEDIGST,
// INVOICEITEMS.COLLECTEDUTGST,
// INVOICEITEMS.COLLECTEDINVOICEVALUE,