const getDescription = (key, type) => {
    const common = {
        "agentCode": "IATA Code",
        "companyName": "Company Name",
        "companyRegistrationNumber": "Company Registration Number",
        "companyPan": "Company PAN",
        "companyTan": "Company TAN",
        "address": "Address",
        "country": "Country",
        "country_code": "Country",
        "state": "State",
        "city": "City",
        "pincode": "Pincode",
        "contactNumber": "Contact Number",
        "website": "Website",
        "category": "Category",
        "isEcommerceOperator": "Is Ecommerce Operator",
        "consulateEmbassyCountry": "Consulate Embassy Country",
        "unShortCode": "UN Short Code",
        "status": "Status",
        "title": "Title",
        "firstName": "First Name",
        "lastName": "Last Name",
        "mobile": "Mobile",
        "legalName": "Legal Name",
        "company": "Company",
        "code": "Code",
        "RFISC": "RFISC",
        "slno": "slno",
        "validFrom": "Valid From",
        "validityTill": "Validity Till",
        "intrastate": "Intra State",
        "isUT": "Is UT",
        "b2b": "B2B",
        "IsSEZ": "Is SEZ",
        "cabinClass": "Cabin Class",
        "taxCode": "Tax Code",
        "ruleId": "Rule Id",
        "ruleText": "Rule Text",
        "iataNumber": "IATA Number",
        "siteType": "Site Type",
        "legalName": "Legal Name",
        "region": "Region",
        "regionCode": "Region Code",
        "countryName": "Country Name",
        "postalCode": "Postal Code",
        "crossReferenceAgentNum": "Cross Reference Agent",
        "airportCode": "Airport Code",
        "company": "Company",
        "isDomestic": "Is Domestic",
        "isUT": "Is Union Territory",
        "region": "Region",
        "stateCode": "State Code",
        "businessPlace": "Business Place",
        "gstin": "GSTIN",
        "exemptedZone": "Exempted Zone",
        "address": "Address",
        "documentTypeCode": "Document Type Code",
        "documentName": "Document Name",
        "description": "Description",
        "isMandatory": "Is Mandatory",
        "gstinUIN": "GSTIN/UIN",
        "taxpayerType": "Taxpayer Type",
        "legalNameOfBusiness": "Legal Name of Business",
        "tradeName": "Trade Name",
        "gstinStatus": "GSTIN Status",
        "dateOfCancellation": "Date of Cancellation",
        "feeCode": "Fee Code",
        "ValidFrom": "Valid From",
        "ValidTo": "Valid To",
        "feeDescription": "Fee Description",
        "taxableFactor": "Taxable Factor",
        "taxComponent": "Tax Component",
        "taxInclusive": "Tax Inclusive",
        "invoiceFactor": "Invoice Factor",
        "company": "Company",
        "code": "Code",
        "RFISC": "RFISC",
        "serviceType": "Service Type",
        "serviceCode": "Service Code",
        "isAssociated": "Is Associated",
        "RFISCDescription": "RFISC Description",
        "remarks": "Remarks",
        "routingInfo": "Routing Info",
        "baggageInfo": "Baggage Info",
        "withInfo": "With Info",
        "limitEMDCoupon": "Limit EMD Coupon",
        "nonRefundable": "Non-Refundable",
        "nonExchangeable": "Non-Exchangeable",
        "nonInterlineable": "Non-Interlineable",
        "nonEndorsable": "Non-Endorsable",
        "consumedAtIssuance": "Consumed at Issuance",
        "restrictAssociation": "Restrict Association",
        "addlDocument": "Additional Document",
        "residualValue": "Residual Value",
        "notIssuableByAgent": "Not Issuable By Agent",
        "restrictDisplayAgent": "Restrict Display Agent",
        "restrictFollowupAgent": "Restrict Follow-up Agent",
        "GLCode": "GL Code",
        "routedFSA": "Routed FSA",
        "GSTApplicable": "GST Applicable",
        "isComposite": "Is Composite",
        "isCabinDependent": "Is Cabin Dependent",
        "linkedToTaxcode": "Linked To Tax Code",
        "isAirportSpecific": "Is Airport Specific",
        "docType": "Document Type",
        "HSN": "HSN",
        "FOP": "FOP",
        "FOPDescription": "FOP Description",
        "isGSTApplicable": "GST Applicable",
        "taxCode": "Tax Code",
        "taxDescription": "Tax Description",
        "taxType": "Tax Type",
        "taxText": "Tax Text",
        "validTo": "Valid To",
        "rate": "Rate",
        "taxBase": "Tax Base",
        "company": "Company",
        "ticketClass": "Ticket Class",
        "eindia": "EIndia",
        "exemptedZone": "Exempted Zone",
        "b2b": "B2B",
        "IsSEZ": "Is SEZ",
        "intrastate": "Intrastate",
        "isUT": "Is Union Territory",
        "validFrom": "Valid From",
        "validTo": "Valid To",
        "taxCode": "Tax Code",
        "ruleId": "Rule ID",
        "ruleText": "Rule Text",
        "transactionText": "Transaction Text",
        "hsn": "HSN",
        "hsnText": "HSN Text",
        "taxCode": "Tax Code",
        "gstinUIN": "GSTIN/UIN",
        "taxpayerType": "Taxpayer Type",
        "legalNameOfBusiness": "Legal Name of Business",
        "shortName": "Short Name",
        "tradeName": "Trade Name",
        "gstinStatus": "GSTIN Status",
        "dateOfCancellation": "Date of Cancellation",
        "email": "Email",
        "name": "Name",
        "role": "Role",
        "value": "Value",
        "cutOverDate": "Cut Over Date",
        "isAdminApproval": "Admin approval",
        "isGstinApiValidation": "GSTIN API Validation",
        "maxInvoicesPerBulk": "Max Amendments for bulk",
        "sendPdfToRegisteredEmail": "Send PDF to registered email",
        "sendPdfToPassengerEmail": "Send PDF to passenger email",
        "sendPdfToUserGstinEmail": "Send PDF to user GSTIN email"
    }
    return common[key] ?? key;
}

const generatePassword = (length = 8) => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ#@!&%';
    let result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};
module.exports = {
    getDescription
}