const Joi = require('joi');
const _ = require('lodash');

const datePairValidation = (fromField, toField) => {
    return {
        [fromField]: Joi.alternatives().conditional(toField, {
            is: Joi.exist(),
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
        [toField]: Joi.alternatives().conditional(fromField, {
            is: Joi.exist(),
            then: Joi.required(),
            otherwise: Joi.optional()
        })
    };
};

exports.validategetInvoiceRequest = (data) => {

    const schema = Joi.object({
        pageNumber: Joi.number().optional(),
        pageSize: Joi.number().optional(),
        pnr: Joi.array().items(Joi.string()).optional(),
        ticketNumber: Joi.array().items(Joi.string().max(30)).optional(),
        supplierGSTIN: Joi.array().items(Joi.string().max(30)).optional(),
        passengerGSTIN: Joi.array().items(Joi.string().max(30)).optional(),
        invoiceNumber: Joi.array().items(Joi.string().max(30)).optional(),
        documentType: Joi.array().items(Joi.string().valid('INVOICE', 'DEBIT', 'CREDIT', 'BOS', 'BOSCN', 'BOSDN')),
        sectionType: Joi.array().items(Joi.string().max(30)).optional(),
        iataNumber: Joi.array().items(Joi.string().max(30)).optional(),
        placeOfSupply: Joi.array().items(Joi.string().max(50)).optional(),
        billToName: Joi.array().items(Joi.string().max(100)).optional(),
        passengerName: Joi.array().items(Joi.string().max(100)).optional(),
        amendmentRequestNo: Joi.array().items(Joi.string().max(30)).optional(),
        invoiceFilter: Joi.string().valid('CM', 'PM', 'CY', 'PY').optional(),
        financialYear:Joi.number().optional(),
        apiType: Joi.string().valid('Documents', 'DocumentHistory', 'AmendmentRequest', 'AmendmentsApproved', 'AmendmentsRejected', 'PendingAmendments').required(),
        isInitial: Joi.boolean().default(false),
        generateExcel: Joi.boolean().default(false),
        columns:Joi.object().optional(),
        bookingType: Joi.string().default('my bookings'),
        ...datePairValidation('amendmentRequestedOnFrom', 'amendmentRequestedOnTo'),
        ...datePairValidation('amendmentApprovedOnFrom', 'amendmentApprovedOnTo'),
        ...datePairValidation('ticketIssueDateFrom', 'ticketIssueDateTo'),
        ...datePairValidation('issuanceFrom', 'issuanceTo'),
        ...datePairValidation('from', 'to'),
    })

    const { error } = schema.validate(data);
    if (error) {
        const message = error.details[0].message.replace(/"/g, '');
        const formattedMessage = message.charAt(0).toUpperCase() + message.slice(1);
        return {
            error: formattedMessage
        }
    }
    return {};
};


exports.validategetReportsRequest = (data,report) => {

    if(!report){
        return {
            error: "API Type is required"
        }
    }

    const schema = getReportValidationSchema(report);

    const { error } = schema.validate(data);
    if (error) {
        const message = error.details[0].message.replace(/"/g, '');
        const formattedMessage = message.charAt(0).toUpperCase() + message.slice(1);
        return {
            error: formattedMessage
        }
    }
    return {};
};

exports.validatemail = (data) => {

    const schema = Joi.object({
        email: Joi.string().max(255).optional(),
        password : Joi.string().max(80).optional()
    })
    const { error } = schema.validate(data);
    if (error) {
        const message = error.details[0].message.replace(/"/g, '');
        const formattedMessage = message.charAt(0).toUpperCase() + message.slice(1);
        return {
            error: formattedMessage
        }
    }
    return {};
};

exports.validateFilterRequest = (data,report) => {

    if(!report){
        return {
            error: "API Type is required"
        }
    }

    

    const searchKeys = Object.keys(data);
    const filteredSearchKeys = _.pullAll(searchKeys,['apiType']);

    if(filteredSearchKeys.length == 0){
        return {
            error: "Atleast one filter must be specified"
        }
    }

    if(filteredSearchKeys.length!=1){
        return {
            error: "Please send one filter data request at a time."
        }
    }


    const schema = getFilterValidationSchema(report)
    // const schema = {
    //     apiType:Joi.string().valid('Document', 'Amendment', 'TCSReport','TCSDetails','Reports')
    // }

    const { error } = schema.validate(data);
    if (error) {
        const message = error.details[0].message.replace(/"/g, '');
        const formattedMessage = message.charAt(0).toUpperCase() + message.slice(1);
        return {
            error: formattedMessage
        }
    }
    return {};
};


function getReportValidationSchema(report){

    switch(report){
        case 'TCSReport':
            return Joi.object({
                id:Joi.array().items(Joi.string()).optional(),
                pageNumber: Joi.number().optional(),
                pageSize: Joi.number().optional(),
                iataNumber: Joi.array().items(Joi.string()).optional(),
                year: Joi.array().items(Joi.number()).optional().default([new Date().getFullYear()]),
                month: Joi.array().items(Joi.number().valid(1,2,3,4,5,6,7,8,9,10,11,12)).optional().default([new Date().getMonth()]),
                ota_gstin:Joi.array().items(Joi.string()).optional(),
                gstr_month:Joi.string(),
                documentType: Joi.array().items(Joi.string().valid('INVOICE', 'DEBIT', 'CREDIT', 'BOS', 'BOSCN', 'BOSDN')),
                apiType: Joi.string().valid('Reports','AreaSummary','TCSReport','TCSDetailsReport').required(),
                isInitial: Joi.boolean().default(false),
                generateExcel: Joi.boolean().default(false),
                columns:Joi.object().optional(),
                enableDefaultGSTIN:Joi.boolean().default(false),
            });
        case 'TCSDetailsReport':
            return Joi.object({
                id:Joi.array().items(Joi.string()).optional(),
                pageNumber: Joi.number().optional(),
                pageSize: Joi.number().optional(),
                ticketNumber: Joi.array().items(Joi.string()).optional(),
                iataNumber: Joi.array().items(Joi.string()).optional(),
                ...datePairValidation('from', 'to'),
                documentType: Joi.array().items(Joi.string().valid('INVOICE', 'DEBIT', 'CREDIT', 'BOS', 'BOSCN', 'BOSDN')),
                gstin_ota:Joi.array().items(Joi.string()).optional(),
                gstr1period:Joi.string(),
                apiType: Joi.string().valid('Reports','AreaSummary','TCSReport','TCSDetailsReport').required(),
                isInitial: Joi.boolean().default(false),
                generateExcel: Joi.boolean().default(false),
                columns:Joi.object().optional(),
                enableDefaultGSTIN:Joi.boolean().default(false),
            });
        default:
            return Joi.object({
                id:Joi.array().items(Joi.string()).optional(),
                pageNumber: Joi.number().optional(),
                pageSize: Joi.number().optional(),
                pnr: Joi.array().items(Joi.string()).optional(),
                ticketNumber: Joi.array().items(Joi.string()).optional(),
                supplierGSTIN: Joi.array().items(Joi.string()).optional(),
                passengerGSTIN: Joi.array().items(Joi.string()).optional(),
                invoiceNumber: Joi.array().items(Joi.string()).optional(),
                documentType: Joi.array().items(Joi.string().valid('INVOICE', 'DEBIT', 'CREDIT', 'BOS', 'BOSCN', 'BOSDN')),
                sectionType: Joi.array().items(Joi.string()).optional(),
                iataNumber: Joi.array().items(Joi.string()).optional(),
                placeOfSupply: Joi.array().items(Joi.string()).optional(),
                billToName: Joi.array().items(Joi.string()).optional(),
                passengerName: Joi.array().items(Joi.string()).optional(),
                amendmentRequestNo: Joi.array().items(Joi.string()).optional(),
                invoiceFilter: Joi.string().valid('CM', 'PM', 'CY', 'PY').optional(),
                financialYear:Joi.number().optional(),
                apiType: Joi.string().valid('Reports','AreaSummary','TCSReport','TCSDetailsReport').required(),
                isInitial: Joi.boolean().default(false),
                generateExcel: Joi.boolean().default(false),
                columns:Joi.object().optional(),
                bookingType: Joi.string().default('my bookings'),
                enableDefaultGSTIN:Joi.boolean().default(false),
                ...datePairValidation('amendmentRequestedOnFrom', 'amendmentRequestedOnTo'),
                ...datePairValidation('amendmentApprovedOnFrom', 'amendmentApprovedOnTo'),
                ...datePairValidation('ticketIssueDateFrom', 'ticketIssueDateTo'),
                ...datePairValidation('issuanceFrom', 'issuanceTo'),
                ...datePairValidation('from', 'to'),
            });
    }

}

function getFilterValidationSchema(report){

    switch(report){
        case 'TCSReport':
            return Joi.object({
                iataNumber:Joi.string().optional(),
                year: Joi.number(),
                month: Joi.number().optional(),
                ota_gstin:Joi.string().optional(),
                documentType: Joi.string(),
                apiType: Joi.string().valid('Document', 'Amendment', 'TCSReport','TCSDetails','Reports').required(),
            });
        case 'TCSDetailsReport':
            return Joi.object({
                pageNumber: Joi.number().optional(),
                pageSize: Joi.number().optional(),
                ticketNumber: Joi.string().optional(),
                iataNumber: Joi.string().optional(),
                gstin_ota:Joi.string().optional(),
                apiType: Joi.string().valid('Document', 'Amendment', 'TCSReport','TCSDetails','Reports').required(),
            });
        default:
            return Joi.object({
                pnr: Joi.string().optional(),
                ticketNumber: Joi.string().optional(),
                supplierGSTIN: Joi.string().optional(),
                passengerGSTIN: Joi.string().optional(),
                invoiceNumber: Joi.string().optional(),
                sectionType: Joi.string().optional(),
                iataNumber: Joi.string().optional(),
                placeOfSupply: Joi.string().optional(),
                billToName: Joi.string().optional(),
                passengerName: Joi.string().optional(),
                amendmentRequestNo: Joi.string().optional(),
                apiType: Joi.string().valid('Document', 'Amendment', 'TCSReport','TCSDetails','Reports').required(),
            });
    }

}

