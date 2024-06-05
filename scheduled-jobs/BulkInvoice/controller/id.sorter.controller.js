exports.getUniqueIDs = (array) => {
    const idSet = new Set();
    return array.reduce((uniqueIDs, obj) => {
        if (!idSet.has(obj.ID)) {
            idSet.add(obj.ID);
            uniqueIDs.push({
                ID: obj.ID,
                COMPANYCODE: obj.COMPANY,
                customerName:obj.BILLTONAME,
                INVOICENUMBER: obj.INVOICENUMBER,
                adminEmails: obj.SENDPDFTOREGISTEREDEMAIL,
                sbrEmails: obj.SENDPDFTOPASSENGEREMAIL,
                companyEmails: obj.SENDPDFTOUSERGSTINEMAIL
            });
        }
        return uniqueIDs;
    }, []);
}