exports.ruleEngine = async (tx, newGSTIN, oldGSTIN, invoiceItems) => {

    try {

        if (!tx) {
            return generateExecResponse('FAILED', 'DB is required', 0, 0, 0, 0, 0, 0, 0, 0, 0,0);
        }

        if (!newGSTIN && !oldGSTIN) {
            return generateExecResponse('FAILED', 'New and old GSTINs are required', 0, 0, 0, 0, 0, 0, 0, 0, 0,0);
        }

        const oldStateCode = oldGSTIN?.substring(0, 2) ?? ""
        const newStateCode = newGSTIN?.substring(0, 2) ?? ""
        const isOldStateUnionTerritory = (await checkUnionTerritory(tx, oldStateCode))?.data?.ISUT ?? false;
        const isNewStateUnionTerritory = (await checkUnionTerritory(tx, newStateCode))?.data?.ISUT ?? false;
        const _taxPayerType = (await getGSTDetails(tx, newGSTIN))?.data
        const taxPayerType = (_taxPayerType?.TAXPAYERTYPE) ?? ""
        const isSez = taxPayerType == "SEZ" ? true : false;

        const collectedCGSTRate = parseNumber(formatRate(invoiceItems?.COLLECTEDCGSTRATE)) ?? 0
        const collectedSGSTRate = parseNumber(formatRate(invoiceItems?.COLLECTEDSGSTRATE)) ?? 0
        const collectedIGSTRate = parseNumber(formatRate(invoiceItems?.COLLECTEDIGSTRATE)) ?? 0
        const collectedUTGSTRate = parseNumber(formatRate(invoiceItems?.COLLECTEDUTGSTRATE)) ?? 0

        const CGSTRate = parseNumber(formatRate(invoiceItems?.CGSTRATE)) ?? 0
        const SGSTRate = parseNumber(formatRate(invoiceItems?.SGSTRATE)) ?? 0
        const IGSTRate = parseNumber(formatRate(invoiceItems?.IGSTRATE)) ?? 0
        const UTGSTRate = parseNumber(formatRate(invoiceItems?.UTGSTRATE)) ?? 0

        const collectedCGST = parseNumber(invoiceItems?.COLLECTEDCGST) ?? 0
        const collectedSGST = parseNumber(invoiceItems?.COLLECTEDSGST) ?? 0
        const collectedIGST = parseNumber(invoiceItems?.COLLECTEDIGST) ?? 0
        const collectedUTGST = parseNumber(invoiceItems?.COLLECTEDUTGST) ?? 0

        const CGST = parseNumber(invoiceItems?.CGSTAMOUNT) ?? 0
        const SGST = parseNumber(invoiceItems?.SGSTAMOUNT) ?? 0
        const IGST = parseNumber(invoiceItems?.IGSTAMOUNT) ?? 0
        const UTGST = parseNumber(invoiceItems?.UTGSTAMOUNT) ?? 0

        const status = "SUCCESS";
        const message = "Query execution success";

        if (!newGSTIN) {
            return generateExecResponse('SUCCESS', 'Query execution success', 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }

        const newPlaceOfsupply = newStateCode == 'UN'?oldStateCode:newStateCode

        if (((oldStateCode !== newStateCode) || ((oldStateCode === newStateCode) && isSez))&& (newStateCode != 'TE' && newStateCode != 'UN')) {

            if (isNewStateUnionTerritory) {
                const newCollectedTax = collectedCGST+collectedUTGST;
                const newCollectedTaxRate = collectedCGSTRate+collectedUTGSTRate
                const newCollectedTaxcode = (await getTaxCodeDetails(tx, newCollectedTaxRate))?.data?.TAXCODE
                const collectedTaxDetails = generateCollectedTaxResponse(newCollectedTaxcode, 0, 0, 0, 0, 0, 0, newCollectedTax, newCollectedTaxRate,newPlaceOfsupply);
                const newTax = CGST+UTGST;
                const newTaxRate = CGSTRate+UTGSTRate
                const taxDetails = generateTaxResponse(0, 0, 0, 0, 0, 0, newTax, newTaxRate);
                const response = generateExecResponse(status,message, taxDetails,collectedTaxDetails)
                return response
            }

            if(collectedIGST>0 && collectedIGSTRate > 0){

                const newCollectedTax = collectedIGST;
                const newCollectedTaxRate = collectedIGSTRate
                const _newCollectedTaxcode = await getTaxCodeDetails(tx, newCollectedTaxRate)
                const newCollectedTaxcode = _newCollectedTaxcode?.data?.TAXCODE
                const collectedTaxDetails = generateCollectedTaxResponse(newCollectedTaxcode, 0, 0, 0, 0, 0, 0, newCollectedTax, newCollectedTaxRate,newPlaceOfsupply);
                const newTax = IGST;
                const newTaxRate = IGSTRate
                const taxDetails = generateTaxResponse(0, 0, 0, 0, 0, 0, newTax, newTaxRate);
                const response = generateExecResponse(status,message, taxDetails,collectedTaxDetails)
                return response

            }

            const newCollectedTax = collectedCGST+collectedSGST;
            const newCollectedTaxRate =collectedCGSTRate+collectedSGSTRate
            const _newCollectedTaxcode = await getTaxCodeDetails(tx, newCollectedTaxRate)
            const newCollectedTaxcode = _newCollectedTaxcode?.data?.TAXCODE
            const collectedTaxDetails = generateCollectedTaxResponse(newCollectedTaxcode, 0, 0, 0, 0, 0, 0, newCollectedTax, newCollectedTaxRate,newPlaceOfsupply);
            const newTax = CGST+SGST;
            const newTaxRate = CGSTRate+SGSTRate
            const taxDetails = generateTaxResponse(0, 0, 0, 0, 0, 0, newTax, newTaxRate);
            const response = generateExecResponse(status,message, taxDetails,collectedTaxDetails)
            return response


        }

        if((oldStateCode === newStateCode) && !isSez){

            if(collectedCGSTRate>0){
                const newCollectedTaxcode = (await getTaxCodeDetails(tx, collectedCGSTRate))?.data?.TAXCODE
                const collectedTaxDetails = generateCollectedTaxResponse( newCollectedTaxcode, collectedCGST, collectedCGSTRate, collectedSGST, collectedSGSTRate, collectedUTGST, collectedUTGSTRate, 0, 0,newPlaceOfsupply);
                const taxDetails = generateTaxResponse( CGST, CGSTRate, SGST, SGSTRate, UTGST, UTGSTRate, 0, 0,);
                const response = generateExecResponse(status,message, taxDetails,collectedTaxDetails)
                return response
            }

            // if(collectedIGSTRate > 0){
            //     const newCollectedTaxcode = (await getTaxCodeDetails(tx, collectedIGSTRate))?.data?.TAXCODE
            //     const collectedTaxDetails = generateCollectedTaxResponse( newCollectedTaxcode, 0, 0, 0, 0, 0, 0, collectedIGST, collectedCGSTRate,newPlaceOfsupply);
            //     const taxDetails = generateTaxResponse( 0, 0, 0, 0, 0, 0, IGST, IGSTRate,);
            //     const response = generateExecResponse(status,message, taxDetails,collectedTaxDetails)
            //     return response
            // }


        }


        if (isNewStateUnionTerritory) {

            const newCollectedTax = collectedIGST / 2;
            const newCollectedTaxRate = collectedIGSTRate / 2
            const newCollectedTaxcode = (await getTaxCodeDetails(tx, newCollectedTaxRate))?.data?.TAXCODE
            const collectedTaxDetails = generateCollectedTaxResponse( newCollectedTaxcode, newCollectedTax, newCollectedTaxRate, 0, 0, newCollectedTax, newCollectedTaxRate, 0, 0,newPlaceOfsupply);
            const newTax = IGST / 2;
            const newTaxRate = IGSTRate / 2
            const taxDetails = generateTaxResponse( newTax, newTaxRate, 0, 0, newTax, newTaxRate, 0, 0,);
            const response = generateExecResponse(status,message, taxDetails,collectedTaxDetails)
            return response

        } else {

            const newCollectedTax = collectedIGST / 2;
            const newCollectedTaxRate = collectedIGSTRate / 2
            const newCollectedTaxcode = (await getTaxCodeDetails(tx, newCollectedTaxRate))?.data?.TAXCODE
            const collectedTaxDetails = generateCollectedTaxResponse(newCollectedTaxcode, newCollectedTax, newCollectedTaxRate, newCollectedTax, newCollectedTaxRate, 0, 0, 0, 0,newPlaceOfsupply);
            const newTax = IGST / 2;
            const newTaxRate = IGSTRate / 2
            const taxDetails = generateTaxResponse( newTax, newTaxRate, newTax, newTaxRate, 0, 0, 0, 0,);
            const response = generateExecResponse(status,message, taxDetails,collectedTaxDetails)
            return response

        }

    } catch (error) {
        const collectedTaxDetails = generateCollectedTaxResponse( 0, 0, 0, 0, 0, 0, 0, 0, 0,0);
        const taxDetails = generateTaxResponse( 0, 0, 0, 0, 0, 0, 0, 0);
        const response = generateExecResponse('FAILED', 'Query execution failed', taxDetails,collectedTaxDetails)
        return response
    }
}



function generateCollectedTaxResponse(taxcode, collectedCGST, collectedCGSTRate, collectedSGST, collectedSGSTRate, collectedUTGST, collectedUTGSTRate, collectedIGST, collectedIGSTRate,placeofsupply) {
    const response = {
            taxCode: taxcode,
            collectedcgst: collectedCGST,
            collectedcgstRate: collectedCGSTRate,
            collectedsgst: collectedSGST,
            collectedsgstRate: collectedSGSTRate,
            collectedugst: collectedUTGST,
            collectedugstRate: collectedUTGSTRate,
            collectedigst: collectedIGST,
            collectedigstRate: collectedIGSTRate,
            placeofsupply
    };

    return response;
}

function generateTaxResponse(CGST, CGSTRate, SGST, SGSTRate, UTGST, UTGSTRate, IGST, IGSTRate) {
    const response = {
        cgst: CGST,
        cgstRate: CGSTRate,
        sgst: SGST,
        sgstRate: SGSTRate,
        ugst: UTGST,
        ugstRate: UTGSTRate,
        igst: IGST,
        igstRate: IGSTRate,
    };

    return response;
}

function generateExecResponse(status,message, taxDetails, collectedTaxDetails){
    const response = {
        status: status,
        message: message,
        data: {
            ...taxDetails,
            ...collectedTaxDetails,
        }
    }

    return response;

}

async function checkUnionTerritory(tx, stateCode) {

    try {

        if (!tx) {

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
        const data = (await tx.run(query, [stateCode]))[0]

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

async function getGSTDetails(tx, gstin) {

    try {

        if (!tx) {

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
        const data = (await tx.run(query, [gstin]))[0]

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

async function getTaxCodeDetails(tx, taxRate) {

    try {

        if (!tx) {

            const response = {
                status: 'FAILED',
                message: 'DB is required',
                data: {}
            }

            return response;

        }


        const query = 'SELECT TAXRATES.TAXCODE, TAXRATES.TAXTYPE FROM TAXRATES WHERE RATE = ?';
        const data = (await tx.run(query, [taxRate]))[0]

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