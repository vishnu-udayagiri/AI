const ExcelJS = require('exceljs');
const { normalizeKey } = require('./utils.helper');

exports.generateMJVExcelFile = async (data) => {

    try {

        let workbook = this.createWorkbook();
        let currentSheet = workbook.getWorksheet('GST');

        const headers = this.getJVMHeadings('heading1');

        for (const entry of data) {
            const normalizedEntry = {};
            Object.keys(entry).forEach(key => {
                if (key == 'TAX_CODE') {
                    let newkey = 'Tax code (tax on sales/purchases)'
                    normalizedEntry[normalizeKey(newkey)] = entry[key];
                } else if (key == 'FORMAT_D_DATE') {
                    let newkey = 'Document Date'
                    normalizedEntry[normalizeKey(newkey)] = entry[key];
                    normalizedEntry['postingdate'] = entry[key];
                } else if (key == 'SERIAL') {
                    let newkey = 'Seq number'
                    normalizedEntry[normalizeKey(newkey)] = entry[key];
                } else if (key == 'DOCTYPE') {
                    let newkey = 'Document type'
                    normalizedEntry[normalizeKey(newkey)] = entry[key];
                } else if (key == 'BUKRS') {
                    let newkey = 'Company Code'
                    normalizedEntry[normalizeKey(newkey)] = entry[key];
                } else if (key == 'BUDAT') {
                    // let newkey = 'Posting Date'
                    // normalizedEntry[normalizeKey(newkey)] = entry[key];
                } else if (key == 'WAERS') {
                    let newkey = 'Currency'
                    normalizedEntry[normalizeKey(newkey)] = entry[key];
                } else if (key == 'XBLNR') {
                    let newkey = 'Reference'
                    normalizedEntry[normalizeKey(newkey)] = entry[key];
                } else if (key == 'BKTXT') {
                    let newkey = 'Document Header Text'
                    normalizedEntry[normalizeKey(newkey)] = entry[key];
                } else if (key == 'CC_1GLACCOUNT') {
                    let newkey = 'Account'
                    normalizedEntry[normalizeKey(newkey)] = entry[key];
                } else if (key == 'SGTXT') {
                    let newkey = 'Text'
                    normalizedEntry[normalizeKey(newkey)] = entry[key];
                } else if (key == 'GSBER') {
                    let newkey = 'Business Area'
                    normalizedEntry[normalizeKey(newkey)] = entry[key];
                } else if (key == 'KOSTL') {
                    let newkey = 'Cost Centre'
                    normalizedEntry[normalizeKey(newkey)] = entry[key];
                } else if (key == 'XREF3') {
                    let newkey = 'Reference Key 3'
                    normalizedEntry[normalizeKey(newkey)] = entry[key];
                } else if (key == 'AMOUNT') {
                    let newkey = 'Amount in Document currency'
                    normalizedEntry[normalizeKey(newkey)] = entry[key];
                } else if (key == 'DOCUMENTDATE' || key == 'INVOICEDATE') {
                    // Do nothing;
                } else {
                    normalizedEntry[normalizeKey(key)] = entry[key];
                }
            });

            const dup = Object.assign({}, normalizedEntry)

            const row = headers.map(header => dup[normalizeKey(header)] || '');
            currentSheet.addRow(row);
        }

        const excelBuffer = await workbook.xlsx.writeBuffer();
        return {success:true, message:'Excel generated successfully', data:excelBuffer};

    } catch (error) {

        console.log(error);
        return {success:false, message:'Failed to generate Excel', data:null};

    }

}


exports.getJVMHeadings = (heading) =>{
    switch(heading){
        case 'heading1':
            return [
                'DOCNO', 'Seq number', 'Document Date', 'Document type', 'Company Code',
                'Posting Date', 'Currency', 'Exchange Rate Direct Quotation', 'Reference',
                'Document Header Text', 'Translation Date', 'Calculate tax automatically',
                'Cross CC No.', 'Trading Partner BA', 'Posting Key', 'Account', 'Special G-L ind.',
                'Transaction Type', 'Amount in Document currency', 'Amount in Local Currency',
                'Business Place', 'Section Code', 'Credit control area', 'Invoice Reference',
                'Fiscal Year of the Relevant Invoice', 'Line Item in Relevant Invoice',
                'Assignment number', 'Text', 'Business Area', 'Cost Centre', 'WBS Element',
                'Terms of payment key', 'Payment Block Key', 'Profit Center', 'Baseline Date',
                'Internal Order', 'Tax Type (for TDS)', 'Tax Code (for TDS)',
                'Withholding Tax Base', 'Withholding Tax Amount', 'Quantity',
                'Base Unit of Measure', 'Tax code (tax on sales/purchases)',
                'Reference Key 1', 'Reference Key 2', 'Reference Key 3'
            ];
        case 'heading2':
            return [
                '', '', 'BKPF', 'BKPF', 'BKPF', 'BKPF', 'BKPF', 'BKPF', 'BKPF', 'BKPF', 'BKPF',
                'BKPF', 'BKPF', 'BKPF', 'BSEG', 'BSEG', 'BSEG', 'BSEG', 'BSEG', 'BSEG',
                'BSEG', 'BSEG', 'BSEG', 'BSEG', 'BSEG', 'BSEG', 'BSEG', 'BSEG', 'BSEG',
                'BSEG', 'BSEG', 'BSEG', 'BSEG', 'BSEG', 'BSEG', 'BSEG', 'BSEG', 'BSEG',
                'BSEG', 'BSEG', 'BSEG', 'BSEG', 'BSEG', 'BSEG', 'BSEG', 'BSEG',
            ];
        case 'heading3':
            return [
                '', '', 'BLDAT', 'BLART', 'BUKRS', 'BUDAT', 'WAERS', 'KURSF', 'XBLNR', 'BKTXT',
                'WWERT', 'XMWST', 'BVORG', 'PARGB', 'NEWBS', 'NEWKO', 'NEWUM', 'ANBWA',
                'WRBTR', 'DMBTR', 'BUPLA', 'SECCO', 'KKBER', 'REBZG', 'REBZJ', 'REBZZ',
                'ZUONR', 'SGTXT', 'GSBER', 'KOSTL', 'POSID', 'ZTERM', 'ZLSPR', 'PRCTR',
                'ZFBDT', 'AUFNR', 'WT_TYPE', 'WT_WITHCD', 'WT_QSSHB', 'WT_QBSHB', 'MENGE',
                'MEINS', 'MWSKZ', 'XREF1', 'XREF2', 'XREF3'
            ];
        case 'heading4':
            return [
                'ZFI001P', '', 'Document Date', 'Document type', 'Company Code', 'Posting Date',
                'Currency', 'Exchange Rate Direct Quotation', 'Reference', 'Document Header Text',
                'Translation Date', 'Calculate tax automatically', 'Cross CC No.',
                'Trading Partner BA', 'Posting Key', 'Account', 'Special G-L ind.',
                'Transaction Type', 'Amount in Document currency', 'Amount in Local Currency',
                'Business Place', 'Section Code', 'Credit control area', 'Invoice Reference',
                'Fiscal Year of the Relevant Invoice', 'Line Item in Relevant Invoice',
                'Assignment number', 'Text', 'Business Area', 'Cost Centre', 'WBS Element',
                'Terms of payment key', 'Payment Block Key', 'Profit Center', 'Baseline Date',
                'Internal Order', 'Tax Type (for TDS)', 'Tax Code (for TDS)',
                'Withholding Tax Base', 'Withholding Tax Amount', 'Quantity',
                'Base Unit of Measure', 'Tax code', 'Reference Key 1', 'Reference Key 2',
                'Reference Key 3'
            ];
        case 'heading5':
            return [
                '', '', '8', '2', '4', '8', '5', '9', '16', '25', '8', '1', '16', '4', '2', '10',
                '1', '3', '16', '16', '4', '4', '4', '10', '4', '3', '18', '50', '4', '10',
                '24', '4', '1', '10', '8', '10', '40', '2', '15', '15', '13', '3', '2', '12',
                '12', '20'
            ];
        default:
            return [];
    }
}

exports.createWorkbook=()=> {

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('GST');

    sheet.addRow(this.getJVMHeadings('heading1'));
    sheet.addRow(this.getJVMHeadings('heading2'));
    sheet.addRow(this.getJVMHeadings('heading3'));
    sheet.addRow(this.getJVMHeadings('heading4'));
    const fifthRow = this.getJVMHeadings('heading5');

    for (let i = 0; i < fifthRow.length; i++) {
        if (fifthRow[i] === '6') {
            fifthRow[i] = '';
        }
    }
    sheet.addRow(fifthRow);

    return workbook;
}