const cds = require('@sap/cds');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const { makeGSTINAmendment, makeAddressAmendment, makeChangeAddressAmendment } = require('./db/invoices.db');
const { processAmendmentRequestsExcel, isExcelDataProcessingCountExceeded } = require('./helpers/amendment.excel.upload.helper');
const { validateGSTIN } = require('./validations/gstin.validation');
const { v4: uuid } = require('uuid');

const { ReportGenerator } = cds.entities

module.exports = function () {

    this.on("requestAmendment", async (req) => {
        try {
            /**
             * @Request : Object
             * @Response : Message
            */

            const tx = cds.transaction(req);
            const reqData = req.data;
            const userEmail = req?.user?.id ?? "";
            const reqType = reqData?.reqType ?? ""
            const invoiceId = reqData?.invoiceId ?? ""
            const invoiceNumber = reqData?.invNo ?? ""
            const gstinNumber = reqData?.gstinNumber ?? ""
            const newAddress = reqData?.newAddress ?? ""
            const reason = reqData?.reason ?? ""
            const date = new Date().toISOString().replace('T', ' ').split('.')[0];
            const userName = req?.user?.name ?? ""


            const originalInvoiceQuery = `SELECT * FROM INVOICE WHERE ID = ?`;
            const [originalInvoice] = await tx.run(originalInvoiceQuery, [invoiceId]);

            /** reqData :
             * gstinNumber:'072422CP09ABS56'
             * invNo:'072422CP09ABS514'
             * newAddress:null
             * reason:'Reason for Test'
             * reqType:'Change GSTIN' --- {Remove GSTIN, Change GSTIN, Remove Address}
             */

            /** To get email
             * email = req.user.id {user email => who is creating amendment}
             */

            /** @Aromal : TODO : Create Single Amendments */

            if (!originalInvoice) {
                return { status: 400, message: 'Invoice not found' };
            }

            let result;

            switch (reqType) {
                case 'CHANGE GSTIN':
                    const gstinStatus = await validateGSTIN(tx, gstinNumber)
                    if (gstinStatus?.status == "Failed") {
                        return { status: 400, message: gstinStatus?.message };
                    }
                    result = await makeGSTINAmendment(tx, invoiceNumber, gstinNumber, true, 'AF', userEmail, date, '', originalInvoice, userName, reason)
                    return req.notify(200, result);
                    break;
                case 'REMOVE GSTIN':
                    result = await makeAddressAmendment(tx, newAddress, invoiceNumber, true, 'AF', userEmail, date, '', originalInvoice, userName, reason)
                    return req.notify(200, result);
                    break;
                case 'CHANGE ADDRESS':
                    result = await makeChangeAddressAmendment(tx, newAddress, invoiceNumber, true, 'AF', userEmail, date, '', originalInvoice, userName, reason)
                    return req.notify(200, result);
                    break;
                default:
                    return {
                        status: 400,
                        message: 'Invalid request type'
                    }
            }



            // return {
            //     status: "S",
            //     message: `Invoice ${reqData.invNo} Amended`,
            // };

        } catch (error) {
            return req.error({
                message: "Error in amending invoice",
                status: 400
            });
        }
    });

    this.on("requestBulkAmendment", async (req) => {
        try {

            /**
             * @Request : Base64
             * @Response : Base64
            */

            const tx = cds.transaction(req);
            let reqFile = req.data.reqFile;
            const userName = req?.user?.name ?? ""
            const userEmail = req?.user?.id ?? "";
            /**
             * reqFile : Base64 of file uploaded
             */

            /** @Aromal TODO : Bulk amendmet request */

            if (reqFile) reqFile = reqFile.split(',')[1];

            const MAX_AMENTMENT_REQUESTS = 150

            const amendmentRequestsExceeded = await isExcelDataProcessingCountExceeded(reqFile, MAX_AMENTMENT_REQUESTS)

            if (amendmentRequestsExceeded) {
                return res.notify({ status: 400, message: MAX_AMENTMENT_REQUESTS + ' amendment requests can be done at a time.' });
            }

            const processedExcelFile = await processAmendmentRequestsExcel(tx, reqFile, userName, userEmail)

            return processedExcelFile;

        } catch (error) {
            return req.error(500, error.message);
        }
    });

    this.on("downloadExcel", async (req) => {
        try {

            const filePath = path.join(process.cwd(), 'srv', 'excel-templates', 'amendmentdata.xlsx');
            const excelBase64 = fs.readFileSync(filePath, 'base64');

            return excelBase64;

        } catch (error) {
            return req.error(500, 'Failed to fetch excel template');
        }
    });

    this.on("getCSRFToken", (req) => {
        return "Token";
    });

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
                fileName: 'Amendment Request',
                appType: 'B2E',
                filter: JSON.stringify(reqFilter),
                tableName: 'INVOICE',
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
            debugger;
        }

    });
}

function getExcelName(selectedFields) {

    const originalArray = {
        "ID": "ID",
        "company": "Company",
        "documentId": "Document ID",
        "PNR": "PNR",
        "ticketNumber": "Ticket Number",
        "supplierGSTIN": "Supplier GSTIN",
        "passengerGSTIN": "Passenger GSTIN",
        "ticketIssueDate": "Ticket Issue Date",
        "invoiceDate": "Invoice Date",
        "invoiceNumber": "Invoice Number",
        "documentType": "Document Type",
        "transactionCode": "Transaction Code",
        "ticketType": "Ticket Type",
        "sectionType": "Section Type",
        "ticketClass": "Ticket Class",
        "eindia": "EIndia",
        "exemptedZone": "Exempted Zone",
        "b2b": "B2B",
        "IsSEZ": "Is Special Economic Zone (SEZ)",
        "intrastate": "Intrastate",
        "isUT": "Is Union Territory (UT)",
        "taxCode": "Tax Code",
        "iataNumber": "IATA Number",
        "gstR1Period": "GST Return 1 Period",
        "gstR1filingStatus": "GST Return 1 Filing Status",
        "originalInvoiceNumber": "Original Invoice Number",
        "orginalInvoiceDate": "Original Invoice Date",
        "originalGstin": "Original GSTIN",
        "originalSectionType": "Original Section Type",
        "issueIndicator": "Issue Indicator",
        "routingType": "Routing Type",
        "fullRouting": "Full Routing",
        "oneWayIndicator": "One Way Indicator",
        "directionIndicator": "Direction Indicator",
        "placeOfSupply": "Place of Supply",
        "taxableCalculation": "Taxable Calculation",
        "discountTaxableCalculation": "Discount Taxable Calculation",
        "netTaxableValue": "Net Taxable Value",
        "totalTax": "Total Tax",
        "totalInvoiceAmount": "Total Invoice Amount",
        "documentCurrency": "Document Currency",
        "totalJourney": "Total Journey",
        "journeyCovered": "Journey Covered",
        "fop": "Form of Payment (FOP)",
        "billToName": "Bill To Name",
        "billToFullAddress": "Bill To Full Address",
        "billToCountry": "Bill To Country",
        "billToStateCode": "Bill To State Code",
        "billToPostalCode": "Bill To Postal Code",
        "invoiceStatus": "Invoice Status",
        "isReverseChargeApplicable": "Is Reverse Charge Applicable",
        "SBRRecivedOn": "SBR Received On",
        "SBRProcessedOn": "SBR Processed On",
        "airportCode": "Airport Code",
        "OriginalDocumentNbr": "Original Document Number",
        "transactionType": "Transaction Type",
        "nonTaxableCalculation": "Non-taxable Calculation",
        "reasonForMemoCode": "Reason for Memo Code",
        "passangerName": "Passenger Name"
    };

    const newArray = selectedFields.map(field => ({ [field.toUpperCase()]: originalArray[field] }));
    return newArray ?? [];
}