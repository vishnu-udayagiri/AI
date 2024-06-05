const stateCodeVariableInSchema = ['Stcd', 'Pos'];
const masters = require('./masters.controller');
let exchangeRate = 1;

//Copy Objects as javascript does refernce based passing and not value based
function objectCopy(objectToCopy) {
    return JSON.parse(JSON.stringify(objectToCopy));
}

function formatIndianCurrency(number) {
    // Check if the input is a valid number
    if (isNaN(number)) {
        return "Invalid input";
    }

    // Convert the number to a string
    const numStr = number.toString();

    // Split the number into integer and decimal parts
    const [integerPart, decimalPart] = numStr.split(".");

    // Add commas to the integer part
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Combine the integer and decimal parts with the appropriate currency format
    const formattedValue = `${formattedIntegerPart}.${decimalPart || "00"}`;

    return formattedValue;
}
//Check if Two arrays are the same
function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}
function decimalAdjuster(number) {
    return number % 1 === 0 ? number : Number(number.toFixed(2))
}

//Type conversion to Schema accepted type
function typeConverter(value, convertTo) {
    if (convertTo != typeof value)
        switch (convertTo.toLowerCase()) {
            case 'number':
                return decimalAdjuster(Number(value));
                break;
            case 'string':
                return value.toString();
                break;
            case 'number money':
                return formatIndianCurrency(value);
                break;
            case 'date string':
                return ExcelDateToJSDate(value);
                break;
        }
    return value;
}

//Map fileds which are in array
function ArrayMapper(fieldName, objectInArray, schema) {
    let schemaElements = Object.keys(schema);
    if (schemaElements.indexOf(fieldName) != -1) {
        let numberOfElements = schema[fieldName].length;
        //copy the schema inside Array for populating (original should remin intact for populating further values)
        let copyschema = objectCopy(schema[fieldName][numberOfElements - 1]);
        let mappedValue = putValueToSchema(fieldName, objectInArray, copyschema);
        //insert the populated schema to the second last position 
        //(when putting in last index, the postion at last index wil move further down)
        schema[fieldName].splice(numberOfElements - 1, 0, mappedValue);
    }
    else {
        //required array might be nested deep down in the object
        //Recusive search to find the required Array 
        schemaElements.forEach(element => {
            if (schema[element].constructor === Object &&
                !arrayEquals(Object.keys(schema[element]), ['type', 'value']))
                ArrayMapper(fieldName, objectInArray, schema[element]);
            else if (schema[element].constructor === Array) {
                let arrayLength = schema[element].length;
                ArrayMapper(fieldName, objectInArray, schema[element][arrayLength - 1]);
            }
        })
    }
}

function ExcelDateToJSDateConverter(serial) {
    var utc_days = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;
    var date_info = new Date(utc_value * 1000);

    var fractional_day = serial - Math.floor(serial) + 0.0000001;

    var total_seconds = Math.floor(86400 * fractional_day);

    var seconds = total_seconds % 60;

    total_seconds -= seconds;

    var hours = Math.floor(total_seconds / (60 * 60));
    var minutes = Math.floor(total_seconds / 60) % 60;

    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}

function ExcelDateToJSDate(Documentdate) {
    if (typeof Documentdate === 'string') {
        if (Documentdate.match(/\d{2}[-\/]\d{2}[-\/]\d{4}/gm))
            Documentdate = Documentdate.replace(/-/gm, '/');
        else {
            Documentdate = Documentdate.split('-')
            Documentdate = Documentdate[2] + '/' + Documentdate[1] + '/' + Documentdate[0];
        }
    }
    else {
        Documentdate = ExcelDateToJSDateConverter(Documentdate);
        var Month = Documentdate.getMonth() + 1;
        Documentdate = ("0" + Documentdate.getDate()).slice(-2) + '/' + ("0" + (Documentdate.getMonth() + 1)).slice(-2) + '/' + Documentdate.getFullYear();
    }
    return Documentdate;
}


function putValueToSchema(fieldName, fieldValue, schema) {
    if (fieldValue != null) {
        if (fieldValue.constructor === Object)
            IRPSchemaInvoiceTransformer(fieldValue, schema);
        else if (fieldValue.constructor === Array) {
            fieldValue.forEach(fieldValueArrayItem => {
                ArrayMapper(fieldName, fieldValueArrayItem, schema)
            })
        }
        else
            Object.keys(schema).forEach(schemaField => {
                if (arrayEquals(Object.keys(schema[schemaField]), ['type', 'value'])) {
                    if (schema[schemaField].value.indexOf(fieldName) != -1) {
                        //Money Based values are also numbers So they need to be seen as numbers
                        // let fieldType = schema[schemaField].type === 'number money' ? 'number' : schema[schemaField].type;
                        let fieldType = schema[schemaField].type;
                        //Some clients don't Give StateCode, 
                        //So the conversion for State name to Statecode must be given
                        if (stateCodeVariableInSchema.includes(schemaField) && isNaN(fieldValue))
                            fieldValue = masters.getStateCodeFromStateName(fieldValue);
                        //Some clients don't Give proper value for Document Type, 
                        //So the conversion for Document Type
                        else if ((schemaField == 'Typ' && schema[schemaField].value.includes('Document type')) ||
                            (schemaField == 'IsServc') || (schemaField == 'Unit'))
                            fieldValue = masters.getStandardName(fieldValue, schemaField);

                        fieldValue = typeConverter(fieldValue, fieldType)

                        schema[schemaField] = fieldValue.toString();
                    }

                    //Save this for the removing section (not sure if it being used now ???)
                    else if (schema[schemaField].hasOwnProperty('value')
                        && schema[schemaField].value.length === 0) {
                        delete schema[schemaField];
                    }
                }
                else if (schema[schemaField].constructor === Object) {
                    putValueToSchema(fieldName, fieldValue, schema[schemaField])
                }
            })
    }
    return schema;
}

function IRPSchemaInvoiceTransformer(invoice, schemaMapper) {
    Object.keys(invoice).forEach(invoiceField => {
        putValueToSchema(invoiceField, invoice[invoiceField], schemaMapper)
    })
    return schemaMapper;
}
let removedFieldsCount = 0;

function findAndDeleteUnusedKeys(schemaInvoice) {
    switch (schemaInvoice.constructor) {
        case Object:
            Object.keys(schemaInvoice).forEach(schemaElement => {
                if (arrayEquals(Object.keys(schemaInvoice[schemaElement]), ['type', 'value']) ||
                    (schemaInvoice[schemaElement].constructor === Object &&
                        Object.keys(schemaInvoice[schemaElement]).length === 0)) {
                    delete schemaInvoice[schemaElement];
                    removedFieldsCount++;
                }
                else if (schemaInvoice[schemaElement].constructor === Array && schemaInvoice[schemaElement].length === 0) {
                    delete schemaInvoice[schemaElement];
                    removedFieldsCount++
                }
                else
                    findAndDeleteUnusedKeys(schemaInvoice[schemaElement])
            });
            break;

        case Array:
            for (let i = schemaInvoice.length - 1; i >= 0; i--) {
                if (schemaInvoice[i].constructor === Object &&
                    Object.keys(schemaInvoice[i]).length === 0) {
                    schemaInvoice.splice(i, 1);
                    removedFieldsCount++;
                }
                else
                    findAndDeleteUnusedKeys(schemaInvoice[i]);
            }
            break;
    }
}

function removeUnwantedFieldsFromInvoice(schemaInvoice) {
    do {
        removedFieldsCount = 0;
        findAndDeleteUnusedKeys(schemaInvoice);
    }
    while (removedFieldsCount != 0)
    return schemaInvoice;
}

function invoiceInIRP(invoiceJSONArray) {
    let mapper = require('../files/mapper.json');
    //Identifying Export Invoices. Need for standardisation here

    let invoicesInSchema = []
    console.time("IRP Mapping completed in");
    invoiceJSONArray.forEach(invoice => {
        let mapperCopy = objectCopy(mapper);
        let IRPMappedInvoice = IRPSchemaInvoiceTransformer(invoice, mapperCopy);
        let sanitizedIRPInvoice = removeUnwantedFieldsFromInvoice(IRPMappedInvoice);
        invoicesInSchema.push(sanitizedIRPInvoice);
    });
    console.timeEnd("IRP Mapping completed in");
    return invoicesInSchema;
}

module.exports = invoiceInIRP;