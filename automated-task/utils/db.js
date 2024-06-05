const xsenv = require('@sap/xsenv');
var hdbext = require('@sap/hdbext');

const createConnection = () => {
  return new Promise((resolve, reject) => {
    var hanaConfig = xsenv.cfServiceCredentials({ tag: 'hana' });
    hdbext.createConnection(hanaConfig, function (error, client) {
      if (error) {
        console.log("Error connecting to database: ", error);
        reject(error);
      }
      console.log("Connected to database");
      resolve(client);
    });
  });
};

module.exports = {
    createConnection
};
