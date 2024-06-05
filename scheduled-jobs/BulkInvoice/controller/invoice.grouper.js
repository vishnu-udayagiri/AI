const mapper = require('../files/mapper.json');

function replaceOrPush(array, n, newElement) {
    if (n === -1) {
        // If n is -1, push the new element to the array
        array.push(newElement);
    } else if (n >= 0 && n < array.length) {
        // If n is a valid index, replace the element at that index
        array[n] = newElement;
    } else {
        // Handle the case where n is out of bounds
        console.error('Invalid index:', n);
    }

    return array;
}

module.exports = (inputValue) => {
    //Get list of all columns which are line Items
    let lineItemFieldNames = Object.keys(mapper.ItemList[0]).reduce((result, key) => {
        const values = mapper.ItemList[0][key].value;
        return result.concat(values);
    }, []);

    let outputExcelValue = [];
    let invoiceIds = []
    console.time(`Invoice Grouping of ${inputValue.length} records completed in`);
    inputValue.forEach(invoiceSet => {

        //Check if invoice ID Exists, if not, push the ID
        let invoiceIndex = invoiceIds.indexOf(invoiceSet['ID']);
        if (invoiceIndex == -1) invoiceIds.push(invoiceSet['ID'])
        delete invoiceSet['ID'];

        let invoiceElement = invoiceIndex == -1 ? { ItemList: [] } : outputExcelValue[invoiceIndex],
            lineItemElement = {};

        Object.keys(invoiceSet).forEach(invoiceField => {
            //Check if line item, else update invoice
            if (lineItemFieldNames.indexOf(invoiceField) == -1) {
                if (invoiceIndex == -1)
                    invoiceElement[invoiceField] = invoiceSet[invoiceField];
            }
            else {
                lineItemElement[invoiceField] = invoiceSet[invoiceField];
            }

        })

        invoiceElement.ItemList.push(lineItemElement);
        replaceOrPush(outputExcelValue, invoiceIndex, invoiceElement);

    });
    console.timeEnd(`Invoice Grouping of ${inputValue.length} records completed in`);
    return outputExcelValue;
}