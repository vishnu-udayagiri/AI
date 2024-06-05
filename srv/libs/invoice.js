
// const invoiceHtml = require('../files/Invoice.html')

exports.generateInvoiceNumber = () => {
    const truncatedTimestamp = (Date.now() % 10000000000).toString();
    const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${truncatedTimestamp}${randomNumber}`;
}

exports.generateRequestNumber = () => {
    const truncatedTimestamp = (Date.now() % 10000000000).toString();
    const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${randomNumber}${truncatedTimestamp}`;
}
