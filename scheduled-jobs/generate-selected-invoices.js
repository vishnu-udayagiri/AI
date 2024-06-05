const hdbext = require('@sap/hdbext');

const config = require('./config.json');

const invoiceIds=`6b6f16b0-7f0a-71c6-1800-273a596bab6a,de2e16b0-7f0a-71c6-1800-273a596bab6a`;

const createHanaClient = () => {
    return new Promise((resolve, reject) => {
        hdbext.createConnection(config.hana[0].credentials, (err, client) => {
            if (err) {
                reject(err);
            } else {
                resolve(client);
            }
        });
    });
};


createHanaClient()
.then((client) => {
    hdbext.loadProcedure(client, null, 'GetInvoiceDetails', function (err, sp) {
        if (err) {
            return console.error('Error loading procedure:', err);
        }

        // Now check if sp is a function
        if (typeof sp === 'function') {
            sp({ INVOICEID: invoiceIds }, function (err, parameters, rows, tablesRows) {
                if (err) {
                    return console.error(err);
                }

                console.log('C:', parameters.C);
                console.log('Dummy rows:', rows);
                console.log('Tables rows:', tablesRows);
            });
        } else {
            console.error('Loaded procedure is not a function:', sp,typeof sp);
        }
    });
})
.catch((error) => {
    console.error('Error creating HANA client:', error);
});
