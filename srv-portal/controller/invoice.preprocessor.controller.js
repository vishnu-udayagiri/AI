// let invoiceSample = require('../Files/SampleInvoice.json');
let masters = require('./masters.controller');
function areAllKeysObjects(obj) {
    if (typeof obj != 'object' || obj == null || Array.isArray(obj))
        return false;

    else return true;
}

function findFirstNumber(values) {
    for (const value of values) {
        if ((typeof value === 'number' && !isNaN(value)) || (typeof value === 'string' && !isNaN(parseFloat(value)))) {
            return Number(value);
        }
    }
    return null; // or undefined, depending on your preference
}

function documentIdentifier(docType) {
    switch (docType) {
        case "INVOICE":
            return { DOCUMENTTYPE: "TAX INVOICE", NumberField: "Invoice Number", DateField: "Invoice Date" };
            break;
        case "CREDIT":
            return { DOCUMENTTYPE: "CREDIT NOTE", NumberField: "Credit Note Number", DateField: "Credit Note Date" };
            break;
        case "DEBIT":
            return { DOCUMENTTYPE: "DEBIT NOTE", NumberField: "Debit Note Number", DateField: "Debit Note Date" };
            break;
        case "BOS":
            return { DOCUMENTTYPE: "BILL OF SUPPLY", NumberField: "Bill Number", DateField: "Bill Date" };
            break;
        case "BOSCN":
            return { DOCUMENTTYPE: "BILL OF SUPPLY - CN", NumberField: "Bill Number", DateField: "Bill Date" };
            break;
        case "BOSDN":
            return { DOCUMENTTYPE: "BILL OF SUPPLY - DN", NumberField: "Bill Number", DateField: "Bill Date" };
            break;
        default:
            return { DOCUMENTTYPE: "TAX INVOICE", NumberField: "Invoice Number", DateField: "Invoice Date" };
            break;
    }
}

function transactionCodeIdentifier(RefDocType) {
    switch (RefDocType) {
        case "TKKT":
            return "Ticket";
            break;
        default:
            return RefDocType;
            break;
    }
}

function directionIdentifier(docType) {
    switch (docType) {
        case "O":
            return "Onward";
            break;
        case "I":
            return "Inward";
            break;
    }
}

function calculateOtherTaxable(lineItem) {
    let output = parseFloat(lineItem.NETTAXABLEVALUE);
    let requiredFields = ['DISCOUNT', 'VALUEOFSERVICE']
    requiredFields.forEach(field => {
        if (lineItem.hasOwnProperty(field) && !isNaN(parseFloat(lineItem[field])))
            output -= parseFloat(lineItem[field]);
    })
    return output.toFixed(2);
}
function calculateTotal(lineItem) {
    let output = 0;
    let requiredFields = ['NETTAXABLEVALUE', 'NONTAXABLE', 'COLLECTEDCGST', 'COLLECTEDSGST', 'COLLECTEDUTGST', 'COLLECTEDIGST'];
    requiredFields.forEach(field => {
        if (lineItem.hasOwnProperty(field) && !isNaN(parseFloat(lineItem[field])))
            output += parseFloat(lineItem[field]);
    })

    return output.toFixed(2);
}

function calculateInvoiceTotals(lineItems) {
    let requiredFields = ['NETTAXABLEVALUE', 'NONTAXABLE', 'COLLECTEDCGST', 'COLLECTEDSGST', 'COLLECTEDUTGST', 'COLLECTEDIGST', 'DISCOUNT', 'VALUEOFSERVICE', 'TOTALVALUE'];
    let invoiceTotals = {};
    requiredFields.forEach(requiredField => {
        let total = 0;
        lineItems.forEach(lineItem => {
            total += parseFloat(lineItem[requiredField]);
        })
        invoiceTotals[requiredField] = parseFloat(total).toFixed(2);
    })

    return invoiceTotals;
}

function calculateLineItemTotal(lineItem) {
    let output = 0;
    let requiredFields = ['NETTAXABLEVALUE', 'NONTAXABLE', 'COLLECTEDCGST', 'COLLECTEDSGST', 'COLLECTEDUTGST', 'COLLECTEDIGST'];
    requiredFields.forEach(field => {
        // Check if the field exists in lineItem and its value is a valid number
        if (lineItem.hasOwnProperty(field) && !isNaN(parseFloat(lineItem[field])))
            output += parseFloat(lineItem[field]);

    })
    return output.toFixed(2);
}

module.exports = (invoice = invoiceSample) => {
    //sort through nested objects
    //and make it one large outer object
    Object.keys(invoice).forEach(invoiceField => {
        if (areAllKeysObjects(invoice[invoiceField])) {
            Object.keys(invoice[invoiceField]).forEach(subField => {
                invoice[invoiceField + '_' + subField] = invoice[invoiceField][subField]
            })
            delete invoice[invoiceField];
        }
    })
    let documentType = documentIdentifier(invoice.DOCUMENTTYPE);
    invoice.DOCUMENTTYPE = documentType.DOCUMENTTYPE;
    invoice.NUMBERFIELD = documentType.NumberField;
    invoice.DATEFIELD = documentType.DateField;

    invoice.DIRECTIONINDICATOR = directionIdentifier(invoice.DIRECTIONINDICATOR);
    invoice.BILLTONAME = invoice.COMPANYGSTINADRESSES ? invoice.COMPANYGSTINADRESSES.ADDRESS : invoice.BILLTONAME;
    invoice.ISREVERSECHARGEAPPLICABLE = invoice.ISREVERSECHARGEAPPLICABLE ? 'YES' : 'NO';
    invoice.TRANSACTIONCODE = transactionCodeIdentifier(invoice.TRANSACTIONCODE);

    if (invoice.hasOwnProperty('ISSEZ') && invoice.ISSEZ == 1)
        invoice.SECTIONTYPE = invoice.SECTIONTYPE + ' SEZ';

    invoice.PLACEOFSUPPLY = !isNaN(Number(invoice.PLACEOFSUPPLY)) ? masters.getStateNameByCode(invoice.PLACEOFSUPPLY) : invoice.PLACEOFSUPPLY;
    if (invoice.hasOwnProperty('ORGINALINVOICEDATE') && invoice.ORGINALINVOICEDATE != null)
        invoice.ORGINALINVOICEDATE = invoice.ORGINALINVOICEDATE.split('-').slice().reverse().join('-');
    if (invoice.hasOwnProperty('PASSENGERGSTIN') && invoice.PASSENGERGSTIN != null && invoice.PASSENGERGSTIN.length >= 15) {
        invoice.BUYERSTATE = masters.getStateNameByCode(invoice.PASSENGERGSTIN.substring(0, 2));
        invoice.STATECODE = invoice.PASSENGERGSTIN.substring(0, 2);
    }
    if (invoice.hasOwnProperty('SECTIONTYPE') && invoice.SECTIONTYPE != 'B2B')
        invoice.PASSENGERGSTIN = '';


    invoice.ItemList.sort((a, b) => a.INVOICESLNO - b.INVOICESLNO);

    //GST Rates
    let gstPrimaryFields = ['CGSTRATE', 'UTGSTRATE', 'IGSTRATE', 'SGSTRATE'];

    invoice.ItemList.forEach((item, idx) => {

        gstPrimaryFields.forEach(rate => {
            if (invoice.ItemList[idx].hasOwnProperty('COLLECTED' + rate) && parseInt(invoice.ItemList[idx]['COLLECTED' + rate]) != 0)
                invoice.ItemList[idx][rate] = invoice.ItemList[idx]['COLLECTED' + rate];
        });

        invoice.ItemList[idx].TOTALVALUE = calculateLineItemTotal(item);
        invoice.ItemList[idx].OTHERTAXABLE = calculateOtherTaxable(item);

        invoice.CGSTRATE = invoice.ItemList[idx].CGSTRATE ? invoice.ItemList[idx].CGSTRATE : invoice.CGSTRATE;
        invoice.SGSTRATE = invoice.ItemList[idx].SGSTRATE ? invoice.ItemList[idx].SGSTRATE : invoice.SGSTRATE;
        invoice.IGSTRATE = invoice.ItemList[idx].IGSTRATE ? invoice.ItemList[idx].IGSTRATE : invoice.IGSTRATE;
        invoice.UTGSTRATE = invoice.ItemList[idx].UTGSTRATE ? invoice.ItemList[idx].UTGSTRATE : invoice.UTGSTRATE;

        invoice.ItemList[idx].GSTRATE = parseFloat(invoice.SGSTRATE) +
            parseFloat(invoice.CGSTRATE) +
            parseFloat(invoice.UTGSTRATE) +
            parseFloat(invoice.IGSTRATE);

        try {
            invoice.ItemList[idx].COLLECTEDSGST = Math.max(
                parseFloat(findFirstNumber([invoice.ItemList[idx].COLLECTEDSGST, invoice.COLLECTEDSGST])
                ),
                parseFloat(findFirstNumber([invoice.ItemList[idx].COLLECTEDUTGST, invoice.COLLECTEDUTGST]))
            ).toFixed(2);
        }
        catch (Ex) {
            console.log(Ex);
        }
    })
    let calcualtedTotals = calculateInvoiceTotals(invoice.ItemList)
    Object.keys(calcualtedTotals).forEach(calcualtedTotal => {
        invoice['TOTAL' + calcualtedTotal] = calcualtedTotals[calcualtedTotal];
    })
    return invoice;

}