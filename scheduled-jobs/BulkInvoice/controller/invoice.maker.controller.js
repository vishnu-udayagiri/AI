const fs = require('fs');


//Regex Replace for Invoice Items
function contentReplace(Content, search, replace) {
    return Content.replace(new RegExp("\\[" + search + "\\]", 'g'), replace ? replace : "");
}

//search and replace Line Items
function InvoiceReplace(Content, search, replace) {
    return Content.replace(search, replace ? replace : "");
}


function Rs(amount) {
    var words = new Array();
    words[0] = 'Zero';
    words[1] = 'One';
    words[2] = 'Two';
    words[3] = 'Three';
    words[4] = 'Four';
    words[5] = 'Five';
    words[6] = 'Six';
    words[7] = 'Seven';
    words[8] = 'Eight';
    words[9] = 'Nine';
    words[10] = 'Ten';
    words[11] = 'Eleven';
    words[12] = 'Twelve';
    words[13] = 'Thirteen';
    words[14] = 'Fourteen';
    words[15] = 'Fifteen';
    words[16] = 'Sixteen';
    words[17] = 'Seventeen';
    words[18] = 'Eighteen';
    words[19] = 'Nineteen';
    words[20] = 'Twenty';
    words[30] = 'Thirty';
    words[40] = 'Forty';
    words[50] = 'Fifty';
    words[60] = 'Sixty';
    words[70] = 'Seventy';
    words[80] = 'Eighty';
    words[90] = 'Ninety';
    var op;
    amount = amount.toString();
    var atemp = amount.split(".");
    var number = atemp[0].split(",").join("");
    var n_length = number.length;
    var words_string = "";
    if (n_length <= 9) {
        var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
        var received_n_array = new Array();
        for (var i = 0; i < n_length; i++) {
            received_n_array[i] = number.substr(i, 1);
        }
        for (var i = 9 - n_length, j = 0; i < 9; i++, j++) {
            n_array[i] = received_n_array[j];
        }
        for (var i = 0, j = 1; i < 9; i++, j++) {
            if (i == 0 || i == 2 || i == 4 || i == 7) {
                if (n_array[i] == 1) {
                    n_array[j] = 10 + parseInt(n_array[j]);
                    n_array[i] = 0;
                }
            }
        }
        var value = "";
        for (var i = 0; i < 9; i++) {
            if (i == 0 || i == 2 || i == 4 || i == 7) {
                value = n_array[i] * 10;
            } else {
                value = n_array[i];
            }
            if (value != 0) {
                words_string += words[value] + " ";
            }
            if ((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Crores ";
            }
            if ((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Lakhs ";
            }
            if ((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Thousand ";
            }
            if (i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)) {
                words_string += "Hundred and ";
            } else if (i == 6 && value != 0) {
                words_string += "Hundred ";
            }
        }
        words_string = words_string.split(" ").join(" ");
    }
    return words_string;
}


function RsPaise(n) {
    n = n.toString().replace(/,/g, '')
    var nums = n.toString().split('.')
    var whole = Rs(nums[0])
    if (nums[1] == null) nums[1] = 0;
    if (nums[1].length == 1) nums[1] = nums[1] + '0';
    if (nums[1].length > 2) {
        nums[1] = nums[1].substring(2, length - 1)
    }
    if (nums.length == 2) {
        if (nums[0] <= 9) {
            nums[0] = nums[0] * 10
        } else {
            nums[0] = nums[0]
        };
        var fraction = Rs(nums[1]);
        var op = '';
        if (whole == '' && fraction == '') {
            op = 'Zero only';
        }
        if (whole == '' && fraction != '') {
            op = 'paise ' + fraction + ' only';
        }
        if (whole != '' && fraction == '') {
            op = 'Rupees ' + whole + ' only';
        }
        if (whole != '' && fraction != '') {
            op = 'Rupees ' + whole + 'and ' + fraction + 'paise only';
        }
        var amt = n;
        if (amt > 999999999.99) {
            op = 'The amount cannot be displayed.';
        }
        if (isNaN(amt) == true) {
            op = 'Error : Amount in number appears to be incorrect. Please Check.';
        }
    }
    return op;
}

module.exports = (invoiceData, Invoice) => {
    // let Invoice;
    // var logo = undefined;


    
    var Operationsfile = '';
    try {

        Fields = invoiceData;

        Object.keys(Fields).forEach((element) => {
            if (element != 'RefDtls' && element != 'ItemList' && element != 'AddlDocDtls' &&
                element != 'qrcode' && element != 'SignedIrn' &&
                element != 'Version' && element != 'AckDt' && element != 'AckNo' &&
                element != 'IrnNo') {

                Object.keys(Fields[element]).forEach((field) => {
                    var keyVal = element + '_' + field;
                    invoiceData[keyVal] = Fields[element][field];
                });

            } else if (element === 'RefDtls') {
                Object.keys(Fields[element]).forEach((field) => {
                    if (Fields[element].PrecDocDtls != undefined) {
                        Fields[element].PrecDocDtls.forEach((predocField) => {
                            Object.keys(predocField).forEach((FieldElement) => {
                                var keyVal = element + '_' + field + '_' + FieldElement;
                                invoiceData[keyVal] = predocField[FieldElement];
                            });

                        });
                    }
                    if (Fields[element].ContrDtls != undefined) {
                        Fields[element].ContrDtls.forEach((predocField) => {
                            Object.keys(predocField).forEach((FieldElement) => {
                                var keyVal = element + '_' + field + '_' + FieldElement;
                                invoiceData[keyVal] = predocField[FieldElement];
                            });

                        });
                    }

                });
            }
            else if (element === 'AddlDocDtls') {
                console.log('AddlDocDtls loop');
                if (Fields[element] != undefined) {
                    Fields[element].forEach((addDocField) => {

                        Object.keys(addDocField).forEach((FieldElement) => {
                            var keyVal = element + '_' + FieldElement;
                            //console.log('AddlDocDtls ::',keyVal);
                            invoiceData[keyVal] = addDocField[FieldElement];
                        });



                    });
                }
            }

        });


        //Terms and conditions are not part of Filing Data but need to be in Invoice
        // invoiceData.TermsAndConditions = response.Item.TermsAndConditions;
        // invoiceData.AckNo =Fields.AckNo;
        // invoiceData.AckDt =response.Item.AckDt;


        //get company Logo
        // if (logo != undefined) {
        //     invoiceData.logo = 'data:image/jpg;base64,' + logo;
        // } else {
        //     invoiceData.logo = '../Console/assets/images/NoLogo.png';
        // }

        //Determine whether CGST/SGST Toalts or IGST TOtal should be displayed
        //Only IGST in case of different States
        //CGST and SGST in case of same states
        // if (response.filingData.Supplier_GSTIN.toString().substring(0, 2) == response.filingData.ShippingTo_GSTIN.toString().substring(0, 2)) {
        // if (response.filingData.SellerDtls.Gstin.toString().substring(0, 2) == response.filingData.BuyerDtls.Gstin.toString().substring(0, 2)) {
        //     Invoice = InvoiceReplace(Invoice, '*IgstVal*', 'style="display:none"');
        //     Invoice = InvoiceReplace(Invoice, '*CgstVal*', '');
        //     Invoice = InvoiceReplace(Invoice, '*SgstVal*', '');
        // } else {
        //     Invoice = InvoiceReplace(Invoice, '*CgstVal*', 'style="display:none"');
        //     Invoice = InvoiceReplace(Invoice, '*SgstVal*', 'style="display:none"');
        //     Invoice = InvoiceReplace(Invoice, '*IgstVal*', '');
        // }

        if (invoiceData.DocDtls_IsCancelled == 'true') {
        }
        else{
            Invoice = InvoiceReplace(Invoice, '*watermarkCancel*', 'style="display:none"');
        }




        //Determine the rows to be shown/hidden
        var replaceValues = ['ValDtls_CesVal', 'ValDtls_StCesVal', 'tot_otherChrg']

        //PAN is the 10 letters starting from third character of GSTIN
        // invoiceData.Supplier_PAN = response.filingData.SellerDtls.Gstin.toString().match(/(?<=\d{2}).{10}/);
        invoiceData.Invoice_type_code = invoiceData.DocDtls_Typ == 'INV' ? 'TAX INVOICE' : invoiceData.DocDtls_Typ == 'CRN' ? 'CREDIT NOTE' : invoiceData.DocDtls_Typ == 'DBN' ? 'DEBIT NOTE' : '';
        // invoiceData.SignedIrn = response.filingData.SignedIrn;

        invoiceData.Invoice_Number = invoiceData.DocDtls_Typ == 'INV' ? 'Invoice No' : invoiceData.DocDtls_Typ == 'CRN' ? 'Credit Note No' : invoiceData.DocDtls_Typ == 'DBN' ? 'Debit Note No' : '';
        invoiceData.Invoice_Date = invoiceData.DocDtls_Typ == 'INV' ? 'Invoice Date' : invoiceData.DocDtls_Typ == 'CRN' ? 'Credit Note Date' : invoiceData.DocDtls_Typ == 'DBN' ? 'Debit Note Date' : '';

        //Convert a given number to words (in Indian system of crore,lakh etc.)
        if (Fields.ValDtls.hasOwnProperty('TotInvVal'))
            invoiceData.amount_in_words = RsPaise(Fields.ValDtls.TotInvVal);

        invoiceData.Tax_Total = (Number(invoiceData.ValDtls_CgstVal || 0) + Number(invoiceData.ValDtls_SgstVal || 0) +
            Number(invoiceData.ValDtls_IgstVal || 0) + Number(invoiceData.ValDtls_CesVal || 0) + Number(invoiceData.ValDtls_StCesVal || 0));

        invoiceData.Tax_Total = invoiceData.Tax_Total.toFixed(2);
        //Set all non-list items into variable containing invoice html code
        Object.keys(invoiceData).forEach((element) => {
            //In case the row is part of rows to be hidden/shown,
            //either hide or show the row 
            // console.log("Item HTML :", element);
            if ((replaceValues.indexOf(element) != -1 && invoiceData[element] == 0) || replaceValues.indexOf(element) != -1) {
                Invoice = InvoiceReplace(Invoice, '*' + element + '*', 'style="display:none"');
                delete replaceValues[replaceValues.indexOf(element)]
            } else {
                Invoice = contentReplace(Invoice, element, invoiceData[element]);
            }

        });
        replaceValues.forEach(unassignedValue => {
            Invoice = InvoiceReplace(Invoice, '*' + unassignedValue + '*', 'style="display:none"');
        })

        if (invoiceData.DocDtls_Typ == 'TAX INVOICE') {
            let replaceValue = Invoice.match(/<div class="OriginalInvoiceDetails[\s\S]*?<\/div>/g);
            Invoice = InvoiceReplace(Invoice, replaceValue);
            Invoice = InvoiceReplace(Invoice, '*bosHideFields*', '');
        }
        else if (invoiceData.DocDtls_Typ.indexOf('BILL OF SUPPLY') != -1) {
            let replaceValue = Invoice.match(/<div class="OriginalInvoiceDetails[\s\S]*?<\/div>/g);
            if (invoiceData.DocDtls_Typ == 'BILL OF SUPPLY')
                Invoice = InvoiceReplace(Invoice, replaceValue);
            Invoice = InvoiceReplace(Invoice, '*bosHideFields*', 'display:none');
            Invoice = InvoiceReplace(Invoice, '*thPrdDesc*', 'width:40%');
        }
        else {
            Invoice = InvoiceReplace(Invoice, '*bosHideFields*', '');
            Invoice = InvoiceReplace(Invoice, '*thPrdDesc*', 'width:14%');
        }

        if (!invoiceData.hasOwnProperty('ValDtls_TaxableCalculation') || invoiceData.ValDtls_TaxableCalculation == '')
            Invoice = InvoiceReplace(Invoice, '*TaxableCalculation*', 'style="display:none"');

        if (!invoiceData.hasOwnProperty('ValDtls_NonTaxableCalculation') || invoiceData.ValDtls_NonTaxableCalculation == '')
            Invoice = InvoiceReplace(Invoice, '*NonTaxableCalculation*', 'style="display:none"');
        //get all List Item values into Invoice
        var ListItemRow = Invoice.match(/<tr class="ListItem[\s\S]*?<\/tr>/g);
        var ListItems = '';
        // console.log(ListItemRow); // newly added for draft popup
        if (ListItemRow == undefined) {
            ListItemRow = Invoice.match(/<tr class="ItemList[\s\S]*?<\/tr>/g);

        }
        //get list items
        var i = 1;
        var otherChrg = 0;
        Fields.ItemList.forEach((element) => {
            var copyListItemRow = ListItemRow.toString();
            //Set a serial Number

            copyListItemRow = contentReplace(copyListItemRow, 'SLNO', i);
            element.GrossAmount = element.TotItemVal;
            Object.keys(element).forEach((FieldElement) => {
                if (FieldElement == 'PrdDesc') {
                    element[FieldElement] = element.HsnCd + '<br/>' + element[FieldElement];
                }
                if (FieldElement === 'OthChrg') {
                    otherChrg += element.OthChrg;
                }
                //Update each field of List item
                copyListItemRow = contentReplace(copyListItemRow, FieldElement, element[FieldElement]);
            });
            ListItems += copyListItemRow;
            i++;
        });
        if (otherChrg > 0) {
            // invoiceData.tot_otherChrg = otherChrg;
            Invoice = contentReplace(Invoice, 'tot_otherChrg', otherChrg);
        }
        // console.log("Invoice other Charge :", Invoice);
        //Remove "Original Invoice Details" section in caseof not debit Or Credit Note(Temporary patch only)

        var keepPODetails = Invoice.match(/<td id="ContrDtls"[\s\S]*?\/table>[\s\S]*?\/td>/g) === null ?
            null : Invoice.match(/<td id="ContrDtls"[\s\S]*?\/table>[\s\S]*?\/td>/g)[0];
        keepPODetails = keepPODetails === null ? 0 : (keepPODetails.match(/\[/g) || []).length;
        if (keepPODetails === 3)
            Invoice = InvoiceReplace(Invoice, 'id="ContrDtls"', 'style="display:none"');

        //Add List Items to Invoice HTML variable
        Invoice = InvoiceReplace(Invoice, ListItemRow[0], ListItems);





        //Remove all square bracket values not found 
        Invoice = contentReplace(Invoice, '.*', '');
        return Invoice;
    }
    catch (Ex) {
        console.log(Ex);
        return Invoice
    }
}
