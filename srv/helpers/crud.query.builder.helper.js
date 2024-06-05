const { query } = require("express");

function equalJoiner(fields, joiner, prefix = '') {
    let keyValuesInString = []
    Object.keys(fields).forEach(field => {
        if (typeof fields[field] == 'string')
            keyValuesInString.push(`${field} = '${fields[field]}'`);
        else
            keyValuesInString.push(`${field} = ${fields[field]}`);
    })
    keyValuesInString = prefix + keyValuesInString.join(joiner);
    return keyValuesInString;
}

function upsertQuery(tableName, dbValues) {
    let uniqueKeys = [...Object.keys(dbValues[0]), ...Object.keys(dbValues[0].uniqueKeys).filter(x => !Object.keys(dbValues[0]).includes(x.toUpperCase()))];

    let index = uniqueKeys.indexOf('uniqueKeys');

    if (index !== -1) {
        // Element found in the array
        uniqueKeys.splice(index, 1); // Remove one element at the found index
    }
    let queries = [];
    dbValues.forEach(row => {
        let rowKeys = Object.keys(row);
        Object.keys(row.uniqueKeys).forEach(key => {
            if (!rowKeys.includes(key.toUpperCase()))
                row[key] = row.uniqueKeys[key];
        })
        const pKey = JSON.parse(JSON.stringify(row.uniqueKeys));
        delete row.uniqueKeys;
        let values = Object.keys(row).map(x => typeof row[x] == 'string' ? `'${row[x]}'` : row[x]);

        queries.push(`UPSERT ${tableName} (${Object.keys(row).join(', ')})
        VALUES ( ` + values.join(',') + ' ) ' + `${equalJoiner(pKey, ' AND ', 'WHERE ')}`);
    })
    return queries
}
function deleteQuery(tableName, uniqueKeys) {
    let query = `DELETE FROM ${tableName} WHERE (`;
    let deletepks = []
    uniqueKeys.forEach(keypair => {
        deletepks.push(equalJoiner(keypair, ' AND '))
    })
    return [query + deletepks.join(')OR(') + ')'];
}
function insertQuery(tableName, dbValues) {
    let uniqueKeys = [...Object.keys(dbValues[0]), ...Object.keys(dbValues[0].uniqueKeys).filter(x => !Object.keys(dbValues[0]).includes(x.toUpperCase()))];

    let index = uniqueKeys.indexOf('uniqueKeys');

    if (index !== -1) {
        // Element found in the array
        uniqueKeys.splice(index, 1); // Remove one element at the found index
    }
    let additionalQuery = [];
    dbValues.forEach(row => {
        let rowKeys = Object.keys(row);
        Object.keys(row.uniqueKeys).forEach(key => {
            if (!rowKeys.includes(key.toUpperCase()))
                row[key] = row.uniqueKeys[key];
        })
        const pKey = JSON.parse(JSON.stringify(row.uniqueKeys));
        delete row.uniqueKeys;
        let values = Object.keys(row).map(x => typeof row[x] == 'string' ? `'${row[x]}'` : row[x]);

        additionalQuery.push(`INSERT INTO ${tableName} (${Object.keys(row).join(', ')})
        VALUES ( ` + values.join(',') + ' ) ');
    })
    // query += additionalQuery.join(',');
    return additionalQuery;
}

module.exports = {
    upsert: (tableName, dbValues, mode) => {
        let queries;
        switch (mode) {
            case 'upsert':
                queries = upsertQuery(tableName, dbValues);
                break;
            case 'delete':
                queries = deleteQuery(tableName, dbValues);
                break;
            case 'insert':
                queries = insertQuery(tableName, dbValues);
                break;
        }
        return queries;

    }
}