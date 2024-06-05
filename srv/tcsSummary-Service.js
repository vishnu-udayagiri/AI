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
                fileName: 'TCS Summary Report',
                appType: 'B2E',
                filter: JSON.stringify(reqFilter),
                tableName: 'TCSSUMMARY',
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
            return ('Export process started in background. Will update through mail when completed.');

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
        "TRANSACTIONTYPE": "Transaction Type",
        "TICKETISSUEDATE": "Ticket Issue Date",
        "IATANUMBER": "IATA Number",
        "TCSGSTIN": "TCS GSTIN",
        "PS_STATENAME": "PS State Name",
        "SUPPLIERGSTIN": "Supplier GSTIN",
        "STATEOFDEPOSITEOF_STATENAME": "State of Deposit of State Name",
        "TAXABLE": "Taxable",
        "NONTAXABLE": "Non-Taxable",
        "K3TAX": "K3 Tax",
        "TCSGSTVALUE": "TCS GST Value",
        "TCS_CGST": "TCS CGST",
        "TCS_SGST_UGST": "TCS SGST/UGST",
        "TCS_IGST": "TCS IGST",
        "TCS_SGST_SGST": "TCS SGST/SGST",
        "TOTALINVOICEAMOUNT": "Total Invoice Amount"
    };

    const newArray = selectedFields.map(field => ({ [field]: originalArray[field] }));
    return newArray ?? [];
}