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
                "DOCUMENT_TYPE": selectedFields.documentType,
                "from": moment(selectedFields.from).format("YYYY-MM-DD"),
                "to": moment(selectedFields.to).format("YYYY-MM-DD")
            }
            let data = {
                ID: uuid(),
                type: 'Excel',
                reqEmail: req.user.id,
                reqDateTime: new Date(),
                status: 'Pending',
                statusMessage: '',
                fileType: '',
                fileName: 'Discrepancy Report',
                appType: 'B2E',
                filter: JSON.stringify(reqFilter),
                tableName: 'DISCREPANCYTABLE',
                excelColumnName: JSON.stringify(fieldsToMap),
                isMultiple: selectedFields.isMultiple,
                fileRange: selectedFields.range ?? "0",
                jobName: selectedFields.JobName,
                orderBy: 'DATE_OF_ISSUE',
                dateFilterBy: 'DATE_OF_ISSUE'
            }

            await INSERT.into(ReportGenerator).entries(data);

            // Assuming you have a function to start the export process
            // const exportResult = await startExportProcess();

            // Assuming you have a function to send an email
            return ('Export process started in background. Please check processing tile for status.');

        } catch (error) {
            debugger;
        }

    });

    this.on("getCSRFToken", (req) => {
        return "Token";
    });
}

function getExcelName(selectedFields) {

    const originalArray = {
        "TAX_INVOICE_TYPE": "Tax Invoice Type",
        "REFERENCE_NUMBER": "Reference Number",
        "REFERENCE_DATE": "Reference Date",
        "DOCUMENT_TYPE": "Document Type",
        "ACTIVITY": "Activity",
        "DOCUMENT_NUMBER": "Document Number",
        "AIRLINE_CODE": "Airline Code",
        "ID": "ID",
        "DOCUMENT_ID": "Document ID",
        "PNR": "PNR",
        "MAIN_TICKET_NUMBER": "Main Ticket Number",
        "INVOICENUMBER": "Invoice Number",
        "DISCREPANCYCODE": "Discrepancy Code",
        "DESCRIPTION": "Description",
        "IATANUMBER": "IATA Number",
        "B2B_B2C_INDICATOR": "B2B/B2C Indicator",
        "DATE_OF_ISSUE": "Date of Issue",
        "ROUTING": "Routing",
        "TRANSACTION_CODE": "Transaction Code",
        "TRANSACTION_TYPE": "Transaction Type",
        "ISSUE_TYPE": "Issue Type",
        "RATE_OF_EXCHANGE": "Rate of Exchange",
        "RATE_OF_EXCHANGE_CURR": "Rate of Exchange (Currency)",
        "TAXABLE_AMOUNT": "Taxable Amount",
        "BASIC_FARE": "Basic Fare",
        "APPLICABLE_TAX_FEES_AMOUNT": "Applicable Tax/Fees Amount",
        "OTHER_TAX_AMOUNT": "Other Tax Amount",
        "GST_RATE_CALCULATED": "GST Rate (Calculated)",
        "GST_RATE_COLLECTED": "GST Rate (Collected)",
        "SGST_AMOUNT": "SGST Amount",
        "SGST_RATE": "SGST Rate",
        "CGST_AMOUNT": "CGST Amount",
        "CGST_RATE": "CGST Rate",
        "IGST_AMOUNT": "IGST Amount",
        "IGST_RATE": "IGST Rate",
        "UTGST_AMOUNT": "UTGST Amount",
        "UTGST_RATE": "UTGST Rate",
        "GST_COLLECTED": "GST Collected",
        "GST_DERIVED": "GST Derived",
        "GST_DIFFERENCE": "GST Difference",
        "COLLECTED_INVOICEAMOUNT": "Collected Invoice Amount",
        "CALCULATED_INVOICEAMOUNT": "Calculated Invoice Amount",
        "DIFFERENCE_INVOICEAMOUNT": "Difference in Invoice Amount"
    };

    const newArray = selectedFields.map(field => ({ [field]: originalArray[field] }));
    return newArray ?? [];
}