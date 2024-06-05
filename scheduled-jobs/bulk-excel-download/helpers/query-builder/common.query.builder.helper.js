const moment = require('moment');
const { convertToPlaceholderFormat } = require('../utils.helper');

exports.buildCommonQuery = (tableName, input, pageNumber,pageSize,orderBy, dateFilterBy,countOnly=false,isParameterized = false, paramFilter = {}) => {

    let conditions = [];
  
    for (let key in input) {
        if (input[key]) {
            switch (key) {
                case 'from':
                    if(input["to"]){
                        const from = moment(input["from"], "YYYY-MM-DD").toDate();
                        const to = moment(input["to"], "YYYY-MM-DD").toDate();
                        conditions.push(`(${dateFilterBy} BETWEEN CAST('${input["from"]}' AS DATE) AND CAST('${input["to"]}' AS DATE))`);
                        break;
                    }
                    break;
                case 'to':
                    //nothing to do here. This is to prevent the to from processing
                    break;
                default:
                    if (Array.isArray(input[key]) && input[key].length > 0) {
                        const numbersList = input[key].map(num => `'${num}'`).join(',');
                        conditions.push(`${key.toUpperCase()} IN (${numbersList})`);
                    } else if (typeof input[key] === 'string' && input[key].trim() !== '') {
                        conditions.push(`${key.toUpperCase()} = '${input[key]}'`);
                    }
                    // conditions.push(`${key.toUpperCase()} = '${input[key]}'`);
                    break;


            }
        }
    }

    let finalConditions = conditions.filter(Boolean).join(' AND ');

    if(isParameterized){
        tableName += convertToPlaceholderFormat(paramFilter)
    }

    let joinedQuery = `SELECT * FROM ${tableName}`

    if (finalConditions.length>0) {
        joinedQuery += ` WHERE ${finalConditions}`
    }

    if(countOnly){

        let groupByConditions =''

        if(Object.keys(input).length>0 && isParameterized){
            groupByConditions = Object.keys(input).join(',')
            finalConditions += ' GROUP BY ' + groupByConditions
        }
        

        if (finalConditions.length>0) {
            return `
            SELECT 
                COUNT(*)
            FROM 
                ${tableName}
            WHERE ${finalConditions}
            `;
        }else{
            return `SELECT COUNT(*) FROM ${tableName}`
        }
    }

    if (!pageSize || !pageNumber) {
        return joinedQuery;
    }

    const offset = (pageNumber - 1) * pageSize+1;
    const nextOffset = pageNumber * pageSize;

    return `
    WITH NumberedInvoices AS (
        ${joinedQuery.replace('SELECT', `SELECT ROW_NUMBER() OVER(ORDER BY ${orderBy}) as rn,`)}
    ) 
    SELECT * 
    FROM NumberedInvoices 
    WHERE rn BETWEEN ${offset} AND ${nextOffset}
`;
}