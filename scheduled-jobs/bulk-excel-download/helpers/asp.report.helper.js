const ExcelJS = require("exceljs");
const fs = require("fs-extra");

const getCustomHeadingsForASP = () =>{
    const customHeadings = {
        INV: {
          SOURCEIDENTIFIER: "SourceIdentifier",
          SOURCEFILENAME: "SourceFileName",
          GLACCOUNTCODE: "GLAccountCode",
          DIVISION: "Division",
          SUBDIVISION: "SubDivision",
          PROFITCENTRE1: "ProfitCentre1",
          PROFITCENTRE2: "ProfitCentre2",
          PLANTCODE: "PlantCode",
          RETURNPERIOD: "ReturnPeriod",
          SUPPLIERGSTIN: "SupplierGSTIN",
          DOCUMENTTYPE: "DocumentType",
          SUPPLYTYPE: "SupplyType",
          DOCUMENTNUMBER: "DocumentNumber",
          DOCUMENTDATE: "DocumentDate",
          ORIGINALDOCUMENTNUMBER: "OriginalDocumentNumber",
          ORIGINALDOCUMENTDATE: "OriginalDocumentDate",
          CRDRPREGST: "CRDRPreGST",
          LINENUMBER: "LineNumber",
          CUSTOMERGSTIN: "CustomerGSTIN",
          UINORCOMPOSITION: "UINorComposition",
          ORIGINALCUSTOMERGSTIN: "OriginalCustomerGSTIN",
          CUSTOMERNAME: "CustomerName",
          CUSTOMERCODE: "CustomerCode",
          BILLTOSTATE: "BillToState",
          SHIPTOSTATE: "ShipToState",
          POS: "POS",
          PORTCODE: "PortCode",
          SHIPPINGBILLNUMBER: "ShippingBillNumber",
          SHIPPINGBILLDATE: "ShippingBillDate",
          FOB: "FOB",
          EXPORTDUTY: "ExportDuty",
          HSNORSAC: "HSNorSAC",
          PRODUCTCODE: "ProductCode",
          PRODUCTDESCRIPTION: "ProductDescription",
          CATEGORYOFPRODUCT: "CategoryOfProduct",
          UNITOFMEASUREMENT: "UnitOfMeasurement",
          QUANTITY: "Quantity",
          TAXABLEVALUE: "TaxableValue",
          INTEGRATEDTAXRATE: "IntegratedTaxRate",
          INTEGRATEDTAXAMOUNT: "IntegratedTaxAmount",
          CENTRALTAXRATE: "CentralTaxRate",
          CENTRALTAXAMOUNT: "CentralTaxAmount",
          STATEUTTAXRATE: "StateUTTaxRate",
          STATEUTTAXAMOUNT: "StateUTTaxAmount",
          CESSRATEADVALOREM: "CessRateAdvalorem",
          CESSAMOUNTADVALOREM: "CessAmountAdvalorem",
          CESSRATESPECIFIC: "CessRateSpecific",
          CESSAMOUNTSPECIFIC: "CessAmountSpecific",
          INVOICEVALUE: "InvoiceValue",
          REVERSECHARGEFLAG: "ReverseChargeFlag",
          TCSFLAG: "TCSFlag",
          ECOMGSTIN: "eComGSTIN",
          ITCFLAG: "ITCFlag",
          REASONFORCREDITDEBITNOTE: "ReasonForCreditDebitNote",
          ACCOUNTINGVOUCHERNUMBER: "AccountingVoucherNumber",
          ACCOUNTINGVOUCHERDATE: "AccountingVoucherDate",
          USERDEFINEDFIELD1: "Userdefinedfield1",
          USERDEFINEDFIELD2: "Userdefinedfield2",
          USERDEFINEDFIELD3: "Userdefinedfield3",
        },
        CRDR: {
          SOURCEIDENTIFIER: "SourceIdentifier",
          SOURCEFILENAME: "SourceFileName",
          GLACCOUNTCODE: "GLAccountCode",
          DIVISION: "Division",
          SUBDIVISION: "SubDivision",
          PROFITCENTRE1: "ProfitCentre1",
          PROFITCENTRE2: "ProfitCentre2",
          PLANTCODE: "PlantCode",
          RETURNPERIOD: "ReturnPeriod",
          SUPPLIERGSTIN: "SupplierGSTIN",
          DOCUMENTTYPE: "DocumentType",
          SUPPLYTYPE: "SupplyType",
          DOCUMENTNUMBER: "DocumentNumber",
          DOCUMENTDATE: "DocumentDate",
          ORIGINALDOCUMENTNUMBER: "OriginalDocumentNumber",
          ORIGINALDOCUMENTDATE: "OriginalDocumentDate",
          CRDRPREGST: "CRDRPreGST",
          LINENUMBER: "LineNumber",
          CUSTOMERGSTIN: "CustomerGSTIN",
          UINORCOMPOSITION: "UINorComposition",
          ORIGINALCUSTOMERGSTIN: "OriginalCustomerGSTIN",
          CUSTOMERNAME: "CustomerName",
          CUSTOMERCODE: "CustomerCode",
          BILLTOSTATE: "BillToState",
          SHIPTOSTATE: "ShipToState",
          POS: "POS",
          PORTCODE: "PortCode",
          SHIPPINGBILLNUMBER: "ShippingBillNumber",
          SHIPPINGBILLDATE: "ShippingBillDate",
          FOB: "FOB",
          EXPORTDUTY: "ExportDuty",
          HSNORSAC: "HSNorSAC",
          PRODUCTCODE: "ProductCode",
          PRODUCTDESCRIPTION: "ProductDescription",
          CATEGORYOFPRODUCT: "CategoryOfProduct",
          UNITOFMEASUREMENT: "UnitOfMeasurement",
          QUANTITY: "Quantity",
          TAXABLEVALUE: "TaxableValue",
          INTEGRATEDTAXRATE: "IntegratedTaxRate",
          INTEGRATEDTAXAMOUNT: "IntegratedTaxAmount",
          CENTRALTAXRATE: "CentralTaxRate",
          CENTRALTAXAMOUNT: "CentralTaxAmount",
          STATEUTTAXRATE: "StateUTTaxRate",
          STATEUTTAXAMOUNT: "StateUTTaxAmount",
          CESSRATEADVALOREM: "CessRateAdvalorem",
          CESSAMOUNTADVALOREM: "Cess Amount (Advalorem)",
          CESSRATESPECIFIC: "CessAmountAdvalorem",
          CESSAMOUNTSPECIFIC: "CessRateSpecific",
          INVOICEVALUE: "InvoiceValue",
          REVERSECHARGEFLAG: "ReverseChargeFlag",
          TCSFLAG: "TCSFlag",
          ECOMGSTIN: "eComGSTIN",
          ITCFLAG: "ITCFlag",
          REASONFORCREDITDEBITNOTE: "ReasonForCreditDebitNote",
          ACCOUNTINGVOUCHERNUMBER: "AccountingVoucherNumber",
          ACCOUNTINGVOUCHERDATE: "AccountingVoucherDate",
          USERDEFINEDFIELD1: "Userdefinedfield1",
          USERDEFINEDFIELD2: "Userdefinedfield2",
          USERDEFINEDFIELD3: "Userdefinedfield3",
        },
        B2C: {
          ORGSUPPLIERGSTIN: "SupplierGSTIN",
          RETURNPERIOD: "ReturnPeriod",
          TRANSACTIONTYPE: "TransactionType",
          MONTH: "Month",
          ORGPOS: "OrgPOS",
          ORGHSNORSAC: "OrgHSNorSAC",
          ORGUNITOFMEASUREMENT: "OrgUnitOfMeasurement",
          ORGQUANTITY: "OrgQuantity",
          ORGRATE: "OrgRate",
          ORGTAXABLEVALUE: "OrgTaxableValue",
          ORGECOMGSTIN: "OrgeComGSTIN",
          ORGECOMSUPPLYVALUE: "OrgeComSupplyValue",
          NEWPOS: "NewPOS",
          NEWHSNORSAC: "NewHSNorSAC",
          NEWUNITOFMEASUREMENT: "NewUnitOfMeasurement",
          NEWQUANTITY: "NewQuantity",
          NEWRATE: "NewRate",
          NEWTAXABLEVALUE: "NewTaxableValue",
          NEWECOMGSTIN: "NeweComGSTIN",
          NEWECOMSUPPLYVALUE: "NeweComSupplyValue",
          INTEGRATEDTAXAMOUNT: "IntegratedTaxAmount",
          CENTRALTAXAMOUNT: "CentralTaxAmount",
          STATEUTTAXAMOUNT: "StateUTTaxAmount",
          CESSAMOUNT: "CessAmount",
          TOTALVALUE: "TotalValue",
        },
        B2CNEG: {
        ORGSUPPLIERGSTIN: "SupplierGSTIN",
          RETURNPERIOD: "ReturnPeriod",
          TRANSACTIONTYPE: "TransactionType",
          MONTH: "Month",
          ORGPOS: "OrgPOS",
          ORGHSNORSAC: "OrgHSNorSAC",
          ORGUNITOFMEASUREMENT: "OrgUnitOfMeasurement",
          ORGQUANTITY: "OrgQuantity",
          ORGRATE: "OrgRate",
          ORGTAXABLEVALUE: "OrgTaxableValue",
          ORGECOMGSTIN: "OrgeComGSTIN",
          ORGECOMSUPPLYVALUE: "OrgeComSupplyValue",
          NEWPOS: "NewPOS",
          NEWHSNORSAC: "NewHSNorSAC",
          NEWUNITOFMEASUREMENT: "NewUnitOfMeasurement",
          NEWQUANTITY: "NewQuantity",
          NEWRATE: "NewRate",
          NEWTAXABLEVALUE: "NewTaxableValue",
          NEWECOMGSTIN: "NeweComGSTIN",
          NEWECOMSUPPLYVALUE: "NeweComSupplyValue",
          INTEGRATEDTAXAMOUNT: "IntegratedTaxAmount",
          CENTRALTAXAMOUNT: "CentralTaxAmount",
          STATEUTTAXAMOUNT: "StateUTTaxAmount",
          CESSAMOUNT: "CessAmount",
          TOTALVALUE: "TotalValue",
        },
      };

      return customHeadings;

}

const processASPReport = async (data, customHeadings) => {

    try {

        const workbook = new ExcelJS.Workbook();

        const sheetOrder = ["INV", "CRDR", "B2C", "B2CNEG"];

        for (const sheetName of sheetOrder) {

            const dataSet = data[sheetName] ?? [];
            if (dataSet?.length > 0) {
                try {
                    const jsonData = dataSet;
                    if (!Array.isArray(jsonData)) {
                        return {
                            success: false,
                            message: `Error processing ${sheetName}: Data in ${sheetName} is not an array.`,
                            data: null,
                        }
                    }
                    const sheet = workbook.addWorksheet(sheetName);

                    let headers = Object.keys(customHeadings[sheetName]);

                    let headings;
                    if (customHeadings[sheetName]) {
                        headings = Object.values(customHeadings[sheetName]) || [];
                    } else if (jsonData.length > 0) {
                        headings = Object.keys(jsonData[0]);
                    } else {
                        return {
                            success: false,
                            message: `Error processing ${sheetName}: o JSON data found.`,
                            data: null,
                        }
                    }

                    sheet.addRow(headings);

                    jsonData?.forEach((row) => {
                        const rowData = headers.map((key) => (key in row ? row[key] : ""));
                        sheet.addRow(rowData);
                    });
                } catch (error) {
                    console.error(`Error processing ${sheetName}: ${error.message}`);

                    return {
                        success: false,
                        message: `Error processing ${sheetName}: ${error.message}`,
                        data: null,
                    }

                }
            }
        }


        const excelWorkBook = await workbook.xlsx.writeBuffer();

        return {
            success: true,
            message: 'Report generated successfully',
            data: excelWorkBook
        };

    } catch (error) {

        return {
            success: false,
            message: `Error generating report : ${error.message}`,
            data: null,
        }

    }


}



exports.generateASPReportFile = async (fileData,tempFileName) => {

    try {
        const customHeadings = getCustomHeadingsForASP()
        const {success,message,data} = await processASPReport(fileData, customHeadings);

        if(success) {
            await fs.ensureFile(tempFileName);
            await fs.writeFile(tempFileName, data)
            return {
                success:true,
                message:message
            }
        }

        return {
            success:false,
            message:message
        }

    } catch (error) {

        if(fs.existsSync(tempFileName)){
            fs.unlinkSync(tempFileName);
        }

        return {
            success:false,
            message:'Failed to generate report. Error: ' + error.message
        }
        
    }


}

module.exports = {getCustomHeadingsForASP}


