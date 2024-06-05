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
                "DOCUMENTTYPE": selectedFields.documentType,
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
                fileName: 'TCS Summary Details Report',
                appType: 'B2E',
                filter: JSON.stringify(reqFilter),
                tableName: 'TCSSUMMARYDETAILSSERVICE_TCSSUMMARYDETAILS',
                excelColumnName: JSON.stringify(fieldsToMap),
                isMultiple: selectedFields.isMultiple,
                fileRange: selectedFields.range ?? "0",
                jobName: selectedFields.JobName,
                orderBy: 'INVOICEDATE',
                dateFilterBy: 'INVOICEDATE'
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
        "TICKETNUMBER": "Ticket Number",
        "IATANUMBER" : "IATA Number",
        "INVOICEDATE" : "Invoice Date",
        "TRANSACTIONTYPE" : "Transaction Type",
        "DOCUMENTTYPE" : "Document Type",
        "OTA_GSTIN"  : "OTA GSTIN",
        "ORGINALINVOICEDATE" :"Orginal Invoicedate",
        "PS_STATENAME" : "PS Statename",
        "AIRLINE_GSTN" : "Airline GSTIN",
        "STATE_OF_DEPOSIT" : "State of Deposit",
        "TAXABLE" : "Taxable",
        "NONTAXABLE" : "Non Taxable",
        "TCS_K3" : "TCS K3",
        "TCS_PERC_GST_VALUE" : "CS PERC GST Value",
        "TCS_CGST" : "TCS CGST",
        "TCS_SGST" : "TCS SGST",
        "TCS_UTGST": "TCS_UTGST",
        "TCS_IGST" : "TCS IGST",
        "TCS_SGST_UTGST" : "TCS SGST UGST",
        "TOTAL_TICKET_VALUE": "Total Ticket Value",
        "REMARKS" : "Remarks",
        "USERID" : "User ID"
    };

    const newArray = selectedFields.map(field => ({ [field]: originalArray[field] }));
    return newArray ?? [];
}