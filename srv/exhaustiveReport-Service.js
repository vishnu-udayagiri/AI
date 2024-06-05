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
                fileName: 'Exhaustive Report',
                appType: 'B2E',
                filter: JSON.stringify(reqFilter),
                tableName: 'EXHAUSTIVEREPORT_EXHAUSTIVEREPORT',
                excelColumnName: JSON.stringify(fieldsToMap),
                isMultiple: selectedFields.isMultiple,
                fileRange: selectedFields.range ?? "0",
                jobName: selectedFields.JobName,
                orderBy: 'DOCUMENT_DATE',
                dateFilterBy: 'DOCUMENT_DATE'
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
        "DOCUMENT_DATE": "Document Date",
        "HSN_CODE": "HSN Code",
        "IATA_OFFICE": "IATA Office",
        "ORIGINAL_TKT": "Original Ticket",
        "B2B_B2C": "B2B/B2C",
        "GSTIN_NO": "GSTIN Number",
        "PAX_NAME": "Passenger Name",
        "SECTOR_JOURNEY": "Sector Journey",
        "INTERNATIONAL_DOMESTIC": "International/ Domestic",
        "APPLICABLE_CLASS_OF_TRAVEL": "Applicable Class of Travel",
        "PLACE_OF_EMBARKATION": "Place of Embarkation",
        "PLACE_OF_DISEMBARKATION": "Place of Disembarkation",
        "FOP_DTLS": "Form of Payment Details",
        "PAN_NO": "PAN Number",
        "TRANSACTION_TYPE": "Transaction Type",
        "BASE_FARE": "Base Fare",
        "TAX_1": "Tax 1",
        "TAX_AMOUNT_1": "Tax Amount 1",
        "TAX_2": "Tax 2",
        "TAX_AMOUNT_2": "Tax Amount 2",
        "TAX_3": "Tax 3",
        "TAX_AMOUNT_3": "Tax Amount 3",
        "TAX_4": "Tax 4",
        "TAX_AMOUNT_4": "Tax Amount 4",
        "TAX_5": "Tax 5",
        "TAX_AMOUNT_5": "Tax Amount 5",
        "TAX_6": "Tax 6",
        "TAX_AMOUNT_6": "Tax Amount 6",
        "TAX_7": "Tax 7",
        "TAX_AMOUNT_7": "Tax Amount 7",
        "TAX_8": "Tax 8",
        "TAX_AMOUNT_8": "Tax Amount 8",
        "TAX_9": "Tax 9",
        "TAX_AMOUNT_9": "Tax Amount 9",
        "TAX_10": "Tax 10",
        "TAX_AMOUNT_10": "Tax Amount 10",
        "TAX_11": "Tax 11",
        "TAX_AMOUNT_11": "Tax Amount 11",
        "TAX_12": "Tax 12",
        "TAX_AMOUNT_12": "Tax Amount 12",
        "TAX_13": "Tax 13",
        "TAX_AMOUNT_13": "Tax Amount 13",
        "TAX_14": "Tax 14",
        "TAX_AMOUNT_14": "Tax Amount 14",
        "TAX_15": "Tax 15",
        "TAX_AMOUNT_15": "Tax Amount 15",
        "TAX_16": "Tax 16",
        "TAX_AMOUNT_16": "Tax Amount 16",
        "TAX_17": "Tax 17",
        "TAX_AMOUNT_17": "Tax Amount 17",
        "TAX_18": "Tax 18",
        "TAX_AMOUNT_18": "Tax Amount 18",
        "TAX_19": "Tax 19",
        "TAX_AMOUNT_19": "Tax Amount 19",
        "TAX_20": "Tax 20",
        "TAX_AMOUNT_20": "Tax Amount 20",
        "TOTAL_FARE": "Total Fare",
        "TOTAL_TAXABLE_VALUE": "Total Taxable Value",
        "DISCOUNT": "Discount",
        "NET_TAXABLE_VALUE": "Net Taxable Value",
        "CGST_AMOUNT": "CGST Amount",
        "CGST_RATE": "CGST Rate",
        "SGST_AMOUNT": "SGST Amount",
        "SGST_RATE": "SGST Rate",
        "UTGST_AMOUNT": "UTGST Amount",
        "UTGST_RATE": "UTGST Rate",
        "IGST_AMOUNT": "IGST Amount",
        "IGST_RATE": "IGST Rate",
        "GST_VALUE": "GST Value",
        "AI_GSTIN_NO": "AI GSTIN Number",
        "PLACE_OF_SUPPLY": "Place of Supply",
        "LIABILITY_DISCHARGE_STATE": "Liability Discharge State",
        "REFUND_SECTOR": "Refund Sector",
        "CP_CHARGES": "CP Charges",
        "REFUND_CGST_AMOUNT": "Refund CGST Amount",
        "REFUND_CGST_RATE": "Refund CGST Rate",
        "REFUND_SGST_AMOUNT": "Refund SGST Amount",
        "REFUND_SGST_RATE": "Refund SGST Rate",
        "REFUND_UTGST_AMOUNT": "Refund UTGST Amount",
        "REFUND_UTGST_RATE": "Refund UTGST Rate",
        "REFUND_IGST_AMOUNT": "Refund IGST Amount",
        "REFUND_IGST_RATE": "Refund IGST Rate",
        "REFUND_GST_AMT": "Refund GST Amount",
        "REISSUE_SECTOR": "Reissue Sector",
        "XP_OD_CHARGES": "XP OD Charges",
        "REISSUE_CGST_AMOUNT": "Reissue CGST Amount",
        "REISSUE_CGST_RATE": "Reissue CGST Rate",
        "REISSUE_SGST_AMOUNT": "Reissue SGST Amount",
        "REISSUE_SGST_RATE": "Reissue SGST Rate",
        "REISSUE_UTGST_AMOUNT": "Reissue UTGST Amount",
        "REISSUE_UTGST_RATE": "Reissue UTGST Rate",
        "REISSUE_IGST_AMOUNT": "Reissue IGST Amount",
        "REISSUE_IGST_RATE": "Reissue IGST Rate",
        "REISSUE_GST_AMT": "Reissue GST Amount",
        "ADDRESS_OF_THE_CORPORATE": "Address of the Corporate",
        "EMAIL_ID_OF_CORPORATE": "Email ID of Corporate",
        "CONTACT_NO_OF_CORPORATE": "Contact Number of Corporate",
        "STATE_CODE": "State Code",
        "STATE": "State",
        "EXCESS_BAGGAGE_WEIGHT": "Excess Baggage Weight",
        "EXCESS_BAGGAGE_RATE": "Excess Baggage Rate",
        "XO_N0_IN_CASE_OF_GOI": "XO Number in Case of GOI",
        "ENDORSEMENT_DTLS": "Endorsement Details"
    }

    const newArray = selectedFields.map(field => ({ [field]: originalArray[field] }));
    return newArray ?? [];
}