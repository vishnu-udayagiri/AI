const hdbext = require("@sap/hdbext");

// require('dotenv').config();


exports.getDatabaseCredentials = () =>{
    return {
        "host"      : process.env.EXCEL_DOWNLOAD_DB_HOST,
        "port"      : process.env.EXCEL_DOWNLOAD_DB_PORT,
        "schema"    : process.env.EXCEL_DOWNLOAD_DB_SCHEMA,
        "user"      : process.env.EXCEL_DOWNLOAD_DB_USER,
        "password"  : process.env.EXCEL_DOWNLOAD_DB_PASSWORD
    };
}



exports.createHanaClient = async (config) => {
    return new Promise((resolve, reject) => {
        hdbext.createConnection(config, (err, client) => {
            if (err) {
                reject(err);
            } else {
                resolve(client);
            }
        });
    });
};