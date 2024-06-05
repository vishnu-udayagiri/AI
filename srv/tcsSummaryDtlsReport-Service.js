const cds = require('@sap/cds');
const moment = require('moment');
const axios = require('axios');
const archiver = require('archiver');
const { v4: uuid } = require('uuid');

const { ReportGenerator } = cds.entities

module.exports = function () {

    this.on("exportAll", async (req) => {
        try {
            const selectedFields = JSON.parse(req.data.fields);
            const fieldsToMap = getExcelName(selectedFields.fieldsToMap);
            const reqFilter = {
                GSTR1PERIOD : selectedFields.gstr1period
            }
            let data = {
                ID: uuid(),
                type: 'Excel',
                reqEmail: req.user.id,
                reqDateTime: new Date(),
                status: 'Pending',
                statusMessage: '',
                fileType: '',
                fileName: 'TCS Summary Details Report',
                appType: 'B2E',
                filter: JSON.stringify(reqFilter),
                tableName: 'TCSSUMMARYDTLSREPORTSERVICE_TCSSUMMARYDETAILSREPORT',
                excelColumnName: JSON.stringify(fieldsToMap),
                isMultiple: selectedFields.isMultiple,
                fileRange: selectedFields.range ?? "50000",
                jobName: selectedFields.JobName,
                orderBy: 'INVOICEDATE',
                dateFilterBy: 'GSTR1PERIOD'
            }

            await INSERT.into(ReportGenerator).entries(data);

            // Assuming you have a function to start the export process
            // const exportResult = await startExportProcess();

            // Assuming you have a function to send an email
            return ('Export process started in background. Please check processing tile for status.');

        } catch (error) {
            // error
        }

    });

    this.on("getCSRFToken", (req) => {
        return "Token";
    });
}

function getExcelName(selectedFields) {

    const originalArray = {
        "TICKETNUMBER"          :"Ticket Number",
        "TRANSACTIONTYPE"       : "Transaction Type ",
        "INVOICEDATE"           : "Invoice Date",  
        "IATANUMBER"            : "IATA Number",
        "GSTIN_OTA"             : "GSTIN OF OTA USED FOR TCS",
        "ORGINALINVOICEDATE"    : "Original Invoice Date",
        "DOCUMENTTYPE"          : "Document Type",
        "SUPPLIERGSTIN"         : "Airline GSTIN",
        "GSTR1PERIOD"           : "GSTR1 Period",
        "GSTR1FILINGSTATUS"     : "GSTR1 Filing Status",
        "SUPPLIERGSTIN2"        : "State of Deposit",
        "STATENAME"             : "Place of supply",
        "TAXABLE"               : "Taxable",
        "NONTAXABLE"            : "NON Taxable",
        "TOTAL_TAX"             :  "TCS K3",
        "TCS_PERC_GST_VALUE"    : "TCS PERC GST VALUE",
        "TCS_CGST"              : "TCS CGST",
        "TCS_SGST_UTGST"        : "TCS SGST UTGST",
        "TCS_IGST"              : "TCS IGST",
        "TOTAL_TICKET_VALUE"    : "Total Ticket Value",
        "REMARKS"               : "Remarks",
        // "STATUS"                : "Status",
        // "COMPANY"               : "Company",
        // "USERID"                : "User ID",
        // "PLACEOFSUPPLY"         : "Ticket Number",
        // "PLACE_SUPPLY"          : "Place of Supply",
        // "STATECODE"             : "State Code",
        // "IATANUMBER_1"          : "IATA Number ",
        // "ISECOMMERCEOPERATOR"   : "IS E-Commerceoperator",
        // "COMPANYID"             : "Company ID",
        // "TICKETISSUEDATE_RFND"  : "Ticket Issue Date Refund",
        // "I_YEAR"                : "Invoice Year",
        // "I_MONTH"               : "Invoice Month",
        // "G_YEAR"                : "Year",
        // "G_MONTH"               : "Month",
        // "YEAR_MONTH"            : "Year Month",
        // "TAXABLE_1"             : "Taxable",
        // "CGSTRATE"              : "CGST Rate",
        // "SGSTRATE"              : "SGST Rate",
        // "IGSTRATE"              : "IGST Rate",
        // "UTGSTRATE"             : "UGST Rate",
        // "COLLECTEDINVOICEVALUE" : "Collected Invoice Value",
        // "TCS_SGST"              : "TCS SGST",
        // "TCS_UTGST"             : "TCS UTGST",
    };

    const newArray = selectedFields.map(field => ({ [field]: originalArray[field] }));
    return newArray ?? [];
}