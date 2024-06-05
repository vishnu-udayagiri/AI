const _ = require("lodash");
const { nextSequence } = require("../common-functions/modules/sequence.gen");

/**
 * Generates a sequence number
 * @param {object} db - Database connection
 * @param {string} state - State
 * @param {string} fyear - Financial year
 * @param {string} docType - Document type
 * @param {string} system - System
 * @param {string} customerType - Customer type
 * @param {string} nop - Nature of operation
 * @param {number} month - Month
 * @returns {string} Running Number
 */
exports.sequenceGenerator = async (db, state, fyear,docType,system, customerType, nop,month) => {
    try {

        const data = [state, fyear,docType,system, customerType, nop,month]
        const cleanedData =  _.without(_.uniq(data),null,undefined, "")


        if(cleanedData.length != 7){
            return {
                status:'FAILED',
                message:'Error occurred : All fields are required. Only these fields are available.'+ cleanedData.join(', '),
                data:"",
            };
        }

        
        const key = cleanedData.join('').toUpperCase();
        const query = `SELECT RUNNINGNUMBER FROM INVOICESERIAL WHERE ID = ?`
        
        console.log(key);

        const readResults = await db.exec(query, [key]);

        let currentSequence = "AAA000";
        
        if (readResults.length > 0) {
            currentSequence = readResults[0].RUNNINGNUMBER;
        }

        console.log(currentSequence);

        const newSequence = nextSequence(currentSequence);
        const updateQuery = `UPSERT INVOICESERIAL (ID, RUNNINGNUMBER) VALUES (?, ?) WHERE ID = ?`;
        await db.exec(updateQuery,[key, newSequence,key]);

        const sequence = `${key}${newSequence}`

        return {
            status:'SUCCESS',
            message:'Sequence generated successfully',
            data:sequence,
        };

    } catch (err) {
        console.log(err);
        return {
            status:'FAILED',
            message:'Error occurred : ' + err.message,
            data:"",
        };
    }
};