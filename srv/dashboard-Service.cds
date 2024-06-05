using {
    Invoice          as invoice,
    InvoiceItems     as invoiceItems,
    InvoiceDocuments as invoiceDocuments,
    Company          as company,
    AirportCodes     as airportCode
} from '../db/schema';

service DashboardService @(path: '/dashboard') {

    type GSTIN {
        value : String(36);
    }

    type FinancialYear {
        value : String(36);
    }

    type arrData {
        value : String(36);
    }

    action   getDashboardDetails(supplierGSTIN : array of GSTIN,
                                 financialYear : String,
                                 documentType : array of arrData,
                                 sectionType : array of arrData,
                                 quarter : array of arrData,
                                 year : String,
                                 from : String,
                                 to : String) returns String;

    function getTrendDetails(year :String)                returns String;
    entity supplierGSTIN as select distinct supplierGSTIN from invoice;

}
