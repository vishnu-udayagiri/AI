exports.ruleEngine = async (db, newGSTIN, oldGSTIN, invoiceItems) => {

    try {

        if (!db) {
            return generateExecResponse('FAILED', 'DB is required', 0, 0, 0, 0, 0, 0, 0, 0, 0,0);
        }

        if (!newGSTIN && !oldGSTIN) {
            return generateExecResponse('FAILED', 'New and old GSTINs are required', 0, 0, 0, 0, 0, 0, 0, 0, 0,0);
        }

        const oldStateCode = oldGSTIN?.substring(0, 2) ?? ""
        const newStateCode = newGSTIN?.substring(0, 2) ?? ""
        const isOldStateUnionTerritory = (await checkUnionTerritory(db, oldStateCode))?.data?.ISUT ?? false;
        const isNewStateUnionTerritory = (await checkUnionTerritory(db, newStateCode))?.data?.ISUT ?? false;
        const _taxPayerType = (await getGSTDetails(db, newGSTIN))?.data
        const taxPayerType = (_taxPayerType?.TAXPAYERTYPE) ?? ""
        const isSez = taxPayerType == "SEZ" ? true : false;

        const collectedCGSTRate = parseNumber(formatRate(invoiceItems?.COLLECTEDCGSTRATE)) ?? 0
        const collectedSGSTRate = parseNumber(formatRate(invoiceItems?.COLLECTEDSGSTRATE)) ?? 0
        const collectedIGSTRate = parseNumber(formatRate(invoiceItems?.COLLECTEDIGSTRATE)) ?? 0
        const collectedUTGSTRate = parseNumber(formatRate(invoiceItems?.COLLECTEDUTGSTRATE)) ?? 0

        const collectedCGST = parseNumber(invoiceItems?.COLLECTEDCGST) ?? 0
        const collectedSGST = parseNumber(invoiceItems?.COLLECTEDSGST) ?? 0
        const collectedIGST = parseNumber(invoiceItems?.COLLECTEDIGST) ?? 0
        const collectedUTGST = parseNumber(invoiceItems?.COLLECTEDUTGST) ?? 0

        const status = "SUCCESS";
        const message = "Query execution success";

        if (!newGSTIN) {
            return generateExecResponse('SUCCESS', 'Query execution success', 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }

        if ((oldStateCode !== newStateCode) || ((oldStateCode === newStateCode) && isSez)) {

            if (isOldStateUnionTerritory) {
                const newTax = collectedIGST;
                const newTaxRate = collectedIGSTRate
                const newTaxcode = (await getTaxCodeDetails(db, newTaxRate))?.data?.TAXCODE
                return generateExecResponse(status, message, newTaxcode, 0, 0, 0, 0, 0, 0, newTax, newTaxRate,newStateCode);
            }

            const newTax = collectedIGST;
            const newTaxRate =collectedIGSTRate
            const _newTaxcode = await getTaxCodeDetails(db, newTaxRate)
            const newTaxcode = _newTaxcode?.data?.TAXCODE
            return generateExecResponse(status, message, newTaxcode, 0, 0, 0, 0, 0, 0, newTax, newTaxRate,newStateCode);
        }


        if (isNewStateUnionTerritory) {

            const newTax = collectedIGST / 2;
            const newTaxRate = collectedIGSTRate / 2
            const newTaxcode = (await getTaxCodeDetails(db, newTaxRate))?.data?.TAXCODE
            return generateExecResponse(status, message, newTaxcode, newTax, newTaxRate, 0, 0, newTax, newTaxRate, 0, 0,newStateCode);

        } else {

            const newTax = collectedIGST / 2;
            const newTaxRate = collectedIGSTRate / 2
            const newTaxcode = (await getTaxCodeDetails(db, newTaxRate))?.data?.TAXCODE
            return generateExecResponse(status, message, newTaxcode, newTax, newTaxRate, newTax, newTaxRate, 0, 0, 0, 0,newStateCode);

        }

    } catch (error) {
        return generateExecResponse('FAILED', 'Query execution failed', 0, 0, 0, 0, 0, 0, 0, 0, 0,0);
    }
}



function generateExecResponse(status, message, taxcode, collectedCGST, collectedCGSTRate, collectedSGST, collectedSGSTRate, collectedUTGST, collectedUTGSTRate, collectedIGST, collectedIGSTRate,placeofsupply) {
    const response = {
        status: status,
        message: message,
        data: {
            taxCode: taxcode,
            cgst: collectedCGST,
            cgstRate: collectedCGSTRate,
            sgst: collectedSGST,
            sgstRate: collectedSGSTRate,
            ugst: collectedUTGST,
            ugstRate: collectedUTGSTRate,
            igst: collectedIGST,
            igstRate: collectedIGSTRate,
            placeofsupply
        }
    };

    return response;
}

async function checkUnionTerritory(db, stateCode) {

    try {

        if (!db) {

            const response = {
                status: 'FAILED',
                message: 'DB is required',
                data: {}
            }

            return response;

        }

        if (!stateCode) {

            const response = {
                status: 'FAILED',
                message: 'State code is required',
                data: {}
            }

            return response;

        }

        const query = 'SELECT DISTINCT ISUT, STATECODE FROM AIRPORTCODES WHERE STATECODE = ?';
        const data = (await db.exec(query, [stateCode]))[0]

        const response = {
            status: 'SUCCESS',
            message: 'Query execution success',
            data: data
        }

        return response;


    } catch (error) {

        console.log(error);

        const response = {
            status: 'FAILED',
            message: 'Query execution failed',
            data: {}
        }

        return response;

    }

}

async function getGSTDetails(db, gstin) {

    try {

        if (!db) {

            const response = {
                status: 'FAILED',
                message: 'DB is required',
                data: {}
            }

            return response;

        }

        if (!gstin) {

            const response = {
                status: 'FAILED',
                message: 'GSTIN is required',
                data: {}
            }

            return response;

        }

        const query = 'SELECT GSTIN.GSTIN, GSTIN.TAXPAYERTYPE, GSTIN.STATUS FROM GSTIN WHERE GSTIN = ?';
        const data = (await db.exec(query, [gstin]))[0]

        const response = {
            status: 'SUCCESS',
            message: 'Query execution success',
            data: data
        }

        return response;


    } catch (error) {

        console.log(error);

        const response = {
            status: 'FAILED',
            message: 'Query execution failed',
            data: {}
        }

        return response;

    }

}

async function getTaxCodeDetails(db, taxRate) {

    try {

        if (!db) {

            const response = {
                status: 'FAILED',
                message: 'DB is required',
                data: {}
            }

            return response;

        }


        const query = 'SELECT TAXRATES.TAXCODE, TAXRATES.TAXTYPE FROM TAXRATES WHERE RATE = ?';
        const data = (await db.exec(query, [taxRate]))[0]

        const response = {
            status: 'SUCCESS',
            message: 'Query execution success',
            data: data
        }

        return response;


    } catch (error) {

        console.log(error);

        const response = {
            status: 'FAILED',
            message: 'Query execution failed',
            data: {}
        }

        return response;

    }

}

function parseNumber(string) {

    try {
        return Number(string);
    } catch (error) {
        return 0;
    }

}

function formatRate(input) {
    try {
        input = Number(input);
        const number = parseFloat(input);
        if (number) return number.toFixed(2);
        else return 0.00
    } catch (error) {
        console.log(error);
        return 0.00;
    }
}