const hdbext = require('@sap/hdbext');

module.exports = {
  connectToDatabase: (config) => {
    return new Promise((resolve, reject) => {
      hdbext.createConnection(config, (err, client) => {
        if (err) {
          reject(err);
        } else {
          resolve(client);
        }
      });
    });
  },
};
