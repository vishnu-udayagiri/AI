const cds = require('@sap/cds');
const moment = require('moment');
const { getDescription } = require('./files/description');
const { v4: uuid } = require('uuid');
module.exports = function () {
    const { AirportCodes, TransactionTypes, BookingClass, StateCodes, EMDRFISC, AirportMaster } = this.entities;


    this.on("getCSRFToken", (req) => {
        return "Token";
    });

    /**Application Configuration */
    this.on("getFilterDetails", async (req) => {
        const tx = cds.transaction(req);
        try {
            let airportCodes = await tx.run(SELECT`airportCode,airportName,countryCode`.from(AirportMaster).orderBy`airportCode`);
            // let airportCodes = await tx.run(`SELECT 
            //                                     "AM"."AIRPORTCODE" AS "airportCode",
            //                                     "AM"."AIRPORTNAME" AS "airportName",
            //                                     "AM"."CITY" AS "city",
            //                                     "AM"."STATECODE" AS "stateCode",
            //                                     "CC"."NAME" AS "countryName",
            //                                     "AM"."COUNTRYCODE" AS "countryCode"
            //                                 FROM 
            //                                     "AIRPORTMASTER" AS "AM"
            //                                 LEFT OUTER JOIN
            //                                     "SAP_COMMON_COUNTRIES" AS "CC"
            //                                     ON "CC"."CODE" = "AM".COUNTRYCODE;`);

            let transactionTypes = await tx.run(SELECT`transactionType,transactionText`.from(TransactionTypes));
            let bookingClass = await tx.run(SELECT.distinct`CabinForRules,Description`.from(BookingClass));
            let stateCodes = await tx.run(SELECT.from(StateCodes));
            let emdRFISCs = await tx.run(SELECT`RFISC,RFISCDescription`.from(EMDRFISC));

            let routingType = [{
                "code": "I",
                "name": "International"
            },
            {
                "code": "D",
                "name": "Domestic"
            }];

            return {
                "status": 200,
                "data": {
                    airportCodes: airportCodes,
                    transactionTypes: transactionTypes,
                    bookingClass: bookingClass,
                    stateCodes: stateCodes,
                    routingType: routingType,
                    emdRFISCs: emdRFISCs
                }
            }

        } catch (error) {
            debugger;
        }
    });


    this.on("getTaxRule", async (req) => {
        const tx = cds.transaction(req);
        const reqData = JSON.parse(req.data.Data);
        try {
            let transactionCode = reqData.transactionCode,
                tcktIssueDate = reqData.tcktIssueDate,
                ticketClass = reqData.ticketClass,
                B2B = reqData.B2B ? '1' : '0',
                ISSEZ = reqData.SEZ ? '1' : '0',
                routingType = '',
                orginAirport = reqData.orginAirport,
                destinationAirport = reqData.destinationAirport,
                passengerState = reqData.passengerState,
                RFISC = reqData.RFISC;

            let originAirportDetails = await tx.run(`SELECT 
                                                        "AC"."AIRPORTCODE",
                                                        "COMPANY",
                                                        "ISDOMESTIC",
                                                        "ISUT",
                                                        "REGION",
                                                        "AC"."STATECODE",
                                                        "BUSINESSPLACE",
                                                        "GSTIN",
                                                        "EXEMPTEDZONE",
                                                        "ADDRESS",
                                                        "AIRPORTNAME",
                                                        "AC"."CITY",
                                                        "COUNTRYCODE"
                                                    FROM 
                                                        AIRPORTMASTER AS "AM"
                                                        INNER JOIN
                                                        AIRPORTCODES AS "AC"
                                                        ON "AC".AIRPORTCODE = "AM".AIRPORTCODE
                                                    WHERE "AC".AIRPORTCODE = '${orginAirport}'`);
            let destinationAirportDetails = await tx.run(`SELECT 
                                                            "AC"."AIRPORTCODE",
                                                            "COMPANY",
                                                            "ISDOMESTIC",
                                                            "ISUT",
                                                            "REGION",
                                                            "AC"."STATECODE",
                                                            "BUSINESSPLACE",
                                                            "GSTIN",
                                                            "EXEMPTEDZONE",
                                                            "ADDRESS",
                                                            "AIRPORTNAME",
                                                            "AC"."CITY",
                                                            "COUNTRYCODE"
                                                        FROM 
                                                            AIRPORTMASTER AS "AM"
                                                            INNER JOIN
                                                            AIRPORTCODES AS "AC"
                                                            ON "AC".AIRPORTCODE = "AM".AIRPORTCODE
                                                        WHERE "AC".AIRPORTCODE = '${destinationAirport}'`);

            if (destinationAirport) {
                let destinationAirportCountry = await tx.run(SELECT.one`countryCode`.from(AirportMaster).where({ airportCode: destinationAirport }));
                if (destinationAirportCountry?.countryCode == 'IN') {
                    routingType = 'D';
                } else {
                    routingType = 'I';
                }
            }

            // if (originAirportDetails.length > 0 && destinationAirportDetails.length > 0) {

            let isUT = "0",
                exemptedZone = "0",
                eIndia = "0",
                intraState = "1";

            if (B2B == "1") {
                intraState = (originAirportDetails[0].STATECODE == passengerState) ? "1" : "0";
            }

            if (originAirportDetails[0].EXEMPTEDZONE === '1' || (routingType == 'D' && destinationAirportDetails?.[0]?.EXEMPTEDZONE === '1')) {
                exemptedZone = "1";
            }

            if (originAirportDetails[0].ISUT) {
                isUT = "1";
            }

            if (originAirportDetails[0].ISDOMESTIC && routingType == 'I') {
                eIndia = "1";
            }

            let query = '';
            if (B2B == "1" && passengerState) {
                query = `INNER JOIN STATECODES ON STATECODE = '${passengerState}'`;
            }

            var taxRules;
            if (transactionCode == 'TKTT') {
                taxRules = await tx.run(`SELECT
                *
                FROM TAXRULES AS RULE 
                                            INNER JOIN TAXRATES AS RATE 
                                            ON RULE.TAXCODE = RATE.TAXCODE ${query}
                                            WHERE 
                                                RULE."TICKETCLASS" = '${ticketClass}' AND
                                                RULE."EINDIA" = '${eIndia}' AND
                                                RULE."EXEMPTEDZONE" = '${exemptedZone}' AND
                                                RULE."B2B" = '${B2B}' AND
                                                RULE."ISSEZ" = '${ISSEZ}' AND
                                                RULE."INTRASTATE" = '${intraState}' AND
                                                RULE."ISUT" = '${isUT}' AND 
                                                '${tcktIssueDate}' BETWEEN RULE.VALIDFROM AND COALESCE(RULE.VALIDTO, '9999-12-31')`);
            } else if (transactionCode == 'EMD') {
                taxRules = await tx.run(`SELECT *
                FROM 
                                                EMDRULES AS RULE
                                                INNER JOIN
                                                TAXRATES AS RATE
                                                ON RULE.TAXCODE = RATE.TAXCODE ${query}
                                            WHERE '${tcktIssueDate}' BETWEEN RULE.VALIDFROM AND COALESCE(RULE.VALIDITYTILL, '9999-12-31')
                                                AND RULE."RFISC" = '${RFISC}'
                                                AND RULE."B2B" = '${B2B}'
                                                AND RULE."ISSEZ" = '${ISSEZ}'
                                                AND RULE."INTRASTATE" = '${intraState}'
                                                AND RULE."ISUT" = '${isUT}'; `);
            }

            return {
                "status": 200,
                "data": taxRules ?? []
            }
            // }
        } catch (error) {
            debugger;
        }
    });
}

function findDifference(original, edit) {
    return Object.keys(edit).reduce((diff, key) => {
        if (original[key] === edit[key]) return diff
        return {
            ...diff,
            [key]: edit[key]
        }
    }, {})
}