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
            const reqFilter = {
                "gstr1period": selectedFields.gstr1period
            }
            let data = {
                ID: uuid(),
                type: 'Excel',
                reqEmail: req.user.id,
                reqDateTime: new Date(),
                status: 'Pending',
                statusMessage: '',
                fileType: '',
                fileName: 'GST JVM Convenience Fee Report',
                appType: 'B2E',
                filter: JSON.stringify(reqFilter),
                tableName: 'MJVCONVENIENCEREPORTSERVICE_MJVCONVENIENCEREPORT',
                excelColumnName: '',
                isMultiple: false,
                fileRange: selectedFields.range ?? "50000",
                jobName: selectedFields.JobName,
                orderBy: 'GSTR1PERIOD',
                dateFilterBy: 'GSTR1PERIOD'
            }

            await INSERT.into(ReportGenerator).entries(data);

            // Assuming you have a function to start the export process
            // const exportResult = await startExportProcess();

            // Assuming you have a function to send an email
            return ('Export process started in background. Please check processing tile for status.');

        } catch (error) {
            // eslint-disable-next-line no-debugger
        }

    });

    this.on("getCSRFToken", (req) => {
        return "Token";
    });
}

function getExcelName(selectedFields) {

    const originalArray = {
        "DOCNO": "DOCNO",
        "seqNumber": "seq number",
        "DocumentDate": "Document Date",
        "Documenttype": "Document type",
        "CompanyCode": "Company Code",
        "PostingDate": "Posting Date",
        "Currency": "'Currency",
        "Exchange_Rate_Direct_Quotation": "Exchange Rate Direct Quotation",
        "Reference": "Reference",
        "Document_HeaderText": "Document Header Text",
        "TranslationDate": "Translation Date",
        "Calculate_tax_automatically": "Calculate tax automatically",
        "Cross_CC_No": "Cross CC No.",
        "Trading_Partner_BA": "Trading Partner BA",
        "Posting_Key": "Posting Key",
        "Account": "Account",
        "Special_GL_ind": "Special G-L ind",
        "Transaction_Type": "Transaction Type",
        "Amount_in_Document_currency": "Amount in Document currency",
        "Amount_in_Local_Currency": "Amount in Local Currency",
        "Business_Place": "Business Place",
        "Section_Code": "Section Code",
        "Credit_control_area": "Credit control area",
        "Invoice_Reference": "Invoice Reference",
        "Fiscal_Year_of_the_Relevant_Invoice": "Fiscal Year of the Relevant Invoice",
        "Line_Item_in_Relevant_Invoice": "Line Item in Relevant Invoice",
        "Assignment_number": "Assignment number",
        "Text": "Text",
        "Business_Area": "Business Area",
        "Cost_Centre": "Cost Centre",
        "WBS_Element": "WBS Element",
        "Terms_of_payment_key": "Terms of payment key",
        "Payment_Block_Key": "Payment Block Key",
        "Profit_Center": "Profit Center",
        "Baseline_Date": "Baseline Date",
        "Internal_Order": "Internal Order",
        "Tax_Type": "Tax Type (for TDS)",
        "Tax_Code_TDS": "Tax Code (for TDS)",
        "Withholding_Tax_Base": "Withholding Tax Base",
        "Withholding_Tax_Amount": "Withholding Tax Amount",
        "Quantity": "Quantity",
        "Base_Unit_of_Measure": "Base Unit of Measure",
        "Tax_code": "Tax code (tax on sales/purchases)",
        "Reference_Key_1": "Reference Key 1",
        "Reference_Key_2": "Reference Key 2",
        "Reference_Key_3": "Reference Key 3"
    };

    const newArray = selectedFields.map(field => ({ [field]: originalArray[field] }));
    return newArray ?? [];
}