
const excel = require('excel4node');
const fs = require('fs');
const e2j = require('convert-excel-to-json');
const _ = require('lodash');

const { makeAddressAmendment, makeGSTINAmendment, makeChangeAddressAmendment } = require('../db/invoices.db');
const { sanitizeObject, getKeyByValue, isValidGSTIN, formatHeaderCell } = require('./common.helper');
const { validateGSTIN } = require('../validations/gstin.validation');

/**
 * Bulk processing of amendment requests
 * @param {any} db - Database connection
 * @param {any} base64Excel - Base64 of excel file to be processed
 * @param {any} FirstName - First name of the logged in user
 * @param {any} Cid - Company ID of the logged in user
 * @param {any} Email - Email of the logged in user
 * @returns {Base64} Base64 of the processed excel
 */
exports.processAmendmentRequestsExcel = async (db, base64Excel, FirstName, Cid, Email) => {

    try {

        const binaryBuffer = Buffer.from(base64Excel, 'base64');

        const excelJSON = e2j({
            source: binaryBuffer
        })
    
        const sanitizedExcelJSON = sanitizeObject(excelJSON)
    
    
        const changeGSTINSheet = sanitizedExcelJSON['changegstin'] ?? undefined
        const removeGSTINSheet = sanitizedExcelJSON['removegstin'] ?? undefined
        const changeAddressSheet = sanitizedExcelJSON['changeaddress'] ?? undefined
    
    
        let processedChangeGSTINSheetEntries = [];
        let processedRemoveGSTINSheetEntries = [];
        let processedChangeAddressSheetEntries = [];
    
        const workBook = new excel.Workbook()
    
        const changeGSTINWB = workBook.addWorksheet('Change GSTIN')
        const removeGSTINWB = workBook.addWorksheet('Remove GSTIN')
        const changeAddressWB = workBook.addWorksheet('Change Address')
    
        const changeGSTINWBHeadings = [
            "Invoice Number",
            "New GSTIN",
            "Reason",
            "Remarks"
        ]
    
        const removeGSTINWBHeadings = [
            "Invoice Number",
            "Address",
            "Reason",
            "Remarks"
        ]
    
        const changeAddressWBHeadings = [
            "Invoice Number",
            "Address",
            "Reason",
            "Remarks"
        ]
    
        let changeGSTINWBIndex = 1;
    
        changeGSTINWBHeadings.forEach(heading => {
            changeGSTINWB.cell(1, changeGSTINWBIndex++).string(heading).style(formatHeaderCell('#FFFF00'))
        })
    
        let removeGSTINWBIndex = 1;
    
        removeGSTINWBHeadings.forEach(heading => {
            removeGSTINWB.cell(1, removeGSTINWBIndex++).string(heading).style(formatHeaderCell('#FFFF00'))
        })
    
        let changeAddressWBIndex = 1;
    
        changeAddressWBHeadings.forEach(heading => {
            changeAddressWB.cell(1, changeAddressWBIndex++).string(heading).style(formatHeaderCell('#FFFF00'))
        })
    
    
        if (changeGSTINSheet) {
            const headers = _.slice(changeGSTINSheet, 0, 1)[0]
            const changeGSTINSheetEntries = _.slice(changeGSTINSheet, 1, changeGSTINSheet.length)
    
            // console.log("Headers ::", headers);
            // console.log("Entries ::", changeGSTINSheetEntries);
    
            const invoiceNumberCell = getKeyByValue(headers, "invoicenumber");
            const newGSTINCell = getKeyByValue(headers, "newgstin");
            const amendmentReasonCell = getKeyByValue(headers, "reason");
    
            // console.log(invoiceNumberCell, newGSTINCell, amendmentReasonCell);
    
            let isCellsMissing = false;
    
            if (!invoiceNumberCell || !newGSTINCell || !amendmentReasonCell) isCellsMissing = true;
    
            // console.log(isCellsMissing);
    
            if (!isCellsMissing) {
    
    
                for (const entry of changeGSTINSheetEntries) {
    
                    let processedEntry = Object.assign({}, entry)
                    processedEntry.remarks = ""
    
                    try {
    
                        // console.log(entry);
                        const invoiceNumber = entry[invoiceNumberCell] ?? ""
                        const newGSTIN = entry[newGSTINCell] ?? ""
                        const amendmentReason = entry[amendmentReasonCell] ?? ""
                        // console.log(invoiceNumber, newGSTIN, amendmentReason, isValidGSTIN(newGSTIN));
    
                        processedEntry.remarks = 'FAILED';
    
                        const missingFields = []
    
                        if (!newGSTIN) missingFields.push("New GSTIN");
                        if (!invoiceNumber) missingFields.push("New GSTIN");
    
                        if (missingFields.length > 0) {
                            processedEntry.remarks = `${missingFields.join(",")} not found`;
                            processedChangeGSTINSheetEntries.push(processedEntry);
                            continue;
                        }
    
                        // if (!isValidGSTIN(newGSTIN)) {
                        //     processedEntry.remarks = 'Invalid GSTIN'
                        //     processedChangeGSTINSheetEntries.push(processedEntry);
                        //     continue;
                        // }
    
                        const gstinStatus = await validateGSTIN(db, newGSTIN)
    
                        if (gstinStatus?.status == "Failed") {
                            processedEntry.remarks = gstinStatus?.message
                            processedChangeGSTINSheetEntries.push(processedEntry);
                            continue;
                        }
    
                        const originalInvoiceQuery = `SELECT * FROM INVOICE WHERE INVOICENUMBER = ?`;
                        const [originalInvoice] = await db.exec(originalInvoiceQuery, [invoiceNumber]);
    
                        if (!originalInvoice) {
                            processedEntry.remarks = 'Invoice not found'
                            processedChangeGSTINSheetEntries.push(processedEntry);
                            continue;
                        }
    
                        if (originalInvoice?.ISAMENDED && originalInvoice?.AMENDEMENTSTATUS == 'A') {
                            processedEntry.remarks = 'Cannot amend an already amended invoice'
                            processedChangeGSTINSheetEntries.push(processedEntry);
                            continue;
                        }
    
                        const isAmended = true;
                        const status = 'P';
                        const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
                        const result = await makeGSTINAmendment(db, invoiceNumber, newGSTIN, isAmended, status, Email, timestamp, Cid, originalInvoice, FirstName, amendmentReason);
                        processedEntry.remarks = result.message;
                        processedChangeGSTINSheetEntries.push(processedEntry);
                    } catch (error) {
                        processedEntry.remarks = "Failed to process amendment request";
                        processedChangeGSTINSheetEntries.push(processedEntry);
                    }
                }
    
            }
    
        }
    
        if (removeGSTINSheet) {
            const headers = _.slice(removeGSTINSheet, 0, 1)[0]
            const removeGSTINSheetEntries = _.slice(removeGSTINSheet, 1, removeGSTINSheet.length)
    
            console.log("Headers ::", headers);
            console.log("Entries ::", removeGSTINSheetEntries);
    
            const invoiceNumberCell = getKeyByValue(headers, "invoicenumber");
            const addressCell = getKeyByValue(headers, "address");
            const amendmentReasonCell = getKeyByValue(headers, "reason");
    
            console.log(invoiceNumberCell, addressCell, amendmentReasonCell);
    
            let isCellsMissing = false;
    
            if (!invoiceNumberCell || !addressCell || !amendmentReasonCell) isCellsMissing = true;
    
            console.log(isCellsMissing);
    
            if (!isCellsMissing) {
    
    
                for (const entry of removeGSTINSheetEntries) {
    
                    let processedEntry = Object.assign({}, entry)
                    processedEntry.remarks = ""
    
                    try {
    
                        console.log(entry);
                        const invoiceNumber = entry[invoiceNumberCell] ?? ""
                        const address = entry[addressCell] ?? ""
                        const amendmentReason = entry[amendmentReasonCell] ?? ""
                        // console.log(invoiceNumber, address, amendmentReason);
    
    
                        const missingFields = []
    
                        if (!address) missingFields.push("Address");
                        if (!invoiceNumber) missingFields.push("New GSTIN");
    
                        if (missingFields.length > 0) {
                            processedEntry.remarks = `${missingFields.join(",")} not found`;
                            processedRemoveGSTINSheetEntries.push(processedEntry);
                            continue;
                        }
    
    
                        const originalInvoiceQuery = `SELECT * FROM INVOICE WHERE INVOICENUMBER = ?`;
                        const [originalInvoice] = await db.exec(originalInvoiceQuery, [invoiceNumber]);
    
                        if (!originalInvoice) {
                            processedEntry.remarks = 'Invoice not found'
                            processedRemoveGSTINSheetEntries.push(processedEntry);
                            continue;
                        }
    
                        if (originalInvoice?.ISAMENDED && originalInvoice?.AMENDEMENTSTATUS == 'A') {
                            processedEntry.remarks = 'Cannot amend an already amended invoice'
                            processedRemoveGSTINSheetEntries.push(processedEntry);
                            continue;
                        }
    
                        const isAmended = true;
                        const status = 'P';
                        const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
                        const result = await makeAddressAmendment(db, address, invoiceNumber, isAmended, status, Email, timestamp, Cid, originalInvoice, FirstName, amendmentReason);
                        processedEntry.remarks = result.message;
                        processedRemoveGSTINSheetEntries.push(processedEntry);
    
                    } catch (error) {
                        processedEntry.remarks = "Failed to process amendment request";
                        processedRemoveGSTINSheetEntries.push(processedEntry);
                    }
                }
    
            }
    
        }
    
        if (changeAddressSheet) {
            const headers = _.slice(changeAddressSheet, 0, 1)[0]
            const changeAddressSheetEntries = _.slice(changeAddressSheet, 1, changeAddressSheet.length)
    
            // console.log("Headers ::", headers);
            // console.log("Entries ::", changeAddressSheetEntries);
    
            const invoiceNumberCell = getKeyByValue(headers, "invoicenumber");
            const addressCell = getKeyByValue(headers, "address");
            const amendmentReasonCell = getKeyByValue(headers, "reason");
    
            // console.log(invoiceNumberCell, addressCell, amendmentReasonCell);
    
            let isCellsMissing = false;
    
            if (!invoiceNumberCell || !addressCell || !amendmentReasonCell) isCellsMissing = true;
    
            // console.log(isCellsMissing);
    
            if (!isCellsMissing) {
    
    
                for (const entry of changeAddressSheetEntries) {
    
                    let processedEntry = Object.assign({}, entry)
                    processedEntry.remarks = ""
    
                    try {
    
                        // console.log(entry);
                        const invoiceNumber = entry[invoiceNumberCell] ?? ""
                        const address = entry[addressCell] ?? ""
                        const amendmentReason = entry[amendmentReasonCell] ?? ""
                        // console.log(invoiceNumber, address, amendmentReason);
    
    
                        const missingFields = []
    
                        if (!address) missingFields.push("Address");
                        if (!invoiceNumber) missingFields.push("New GSTIN");
    
                        if (missingFields.length > 0) {
                            processedEntry.remarks = `${missingFields.join(",")} not found`;
                            processedChangeAddressSheetEntries.push(processedEntry);
                            continue;
                        }
    
    
                        const originalInvoiceQuery = `SELECT * FROM INVOICE WHERE INVOICENUMBER = ?`;
                        const [originalInvoice] = await db.exec(originalInvoiceQuery, [invoiceNumber]);
    
                        if (!originalInvoice) {
                            processedEntry.remarks = 'Invoice not found'
                            processedChangeAddressSheetEntries.push(processedEntry);
                            continue;
                        }
    
                        if (originalInvoice?.ISAMENDED && originalInvoice?.AMENDEMENTSTATUS == 'A') {
                            processedEntry.remarks = 'Cannot amend an already amended invoice'
                            processedChangeAddressSheetEntries.push(processedEntry);
                            continue;
                        }
    
                        const isAmended = true;
                        const status = 'P';
                        const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
                        const result = await makeChangeAddressAmendment(db, address, invoiceNumber, isAmended, status, Email, timestamp, Cid, originalInvoice, FirstName, amendmentReason);
                        processedEntry.remarks = result.message;
                        processedChangeAddressSheetEntries.push(processedEntry);
    
                    } catch (error) {
                        processedEntry.remarks = "Failed to process amendment request";
                        processedChangeAddressSheetEntries.push(processedEntry);
                    }
                }
    
            }
    
        }
    
        processedChangeGSTINSheetEntries.forEach((entry, rowIndex) => {
            Object.keys(entry).forEach((key, colIndex) => {
                changeGSTINWB.cell(rowIndex + 2, colIndex + 1).string(entry[key] || "");
            });
        });
    
        processedRemoveGSTINSheetEntries.forEach((entry, rowIndex) => {
            Object.keys(entry).forEach((key, colIndex) => {
                removeGSTINWB.cell(rowIndex + 2, colIndex + 1).string(entry[key] || "");
            });
        });
    
        processedChangeAddressSheetEntries.forEach((entry, rowIndex) => {
            Object.keys(entry).forEach((key, colIndex) => {
                changeAddressWB.cell(rowIndex + 2, colIndex + 1).string(entry[key] || "");
            });
        });
    
    
        const processedExcelBuffer = await workBook.writeToBuffer();
        const processedExcelBase64 = Buffer.from(processedExcelBuffer).toString('base64')
    
        return processedExcelBase64;
        
    } catch (error) {
        return base64Excel;
    }

 
}

exports.isExcelDataProcessingCountExceeded = async (base64Excel, count = 100) => {

    try {

        const binaryBuffer = Buffer.from(base64Excel, 'base64');

        const excelJSON = e2j({
            source: binaryBuffer
        })

        const sanitizedExcelJSON = sanitizeObject(excelJSON)


        const changeGSTINSheet = sanitizedExcelJSON['changegstin'] ?? undefined
        const removeGSTINSheet = sanitizedExcelJSON['removegstin'] ?? undefined
        const changeAddressSheet = sanitizedExcelJSON['changeaddress'] ?? undefined

        let totalCount = 0;


        if (changeGSTINSheet) {
            totalCount += (changeGSTINSheet.length)-1
        }

        if (removeGSTINSheet) {
            totalCount += (removeGSTINSheet.length)-1
        }

        if (changeAddressSheet) {
            totalCount += (changeAddressSheet.length)-1
        }

        if (totalCount > count) return true
        else return false

    } catch (error) {
        return false
    }
}