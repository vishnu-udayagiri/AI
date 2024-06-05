using {
    TCSSUMMARY      as tAREASUMMARY,
    ReportGenerator as reportGenerator
} from '../db/schema';

service areaSummaryService @(path: '/areaSummary') {
    entity AREASUMMARY              as
        projection on tAREASUMMARY {
            IATANUMBER,
            REGION,
            TICKETNUMBER,
            TRANSACTIONTYPE,
            TCSGSTIN,
            K3TAX                       @UI.HiddenFilter,
            TICKETISSUEDATE             @UI.HiddenFilter,
            PLACEOFSUPPLY               @UI.HiddenFilter @UI.Hidden,
            SUPPLIERGSTIN,
            DOCUMENTTYPE,
            TAXABLE                     @UI.HiddenFilter,
            NONTAXABLE                  @UI.HiddenFilter,
            TOTALINVOICEAMOUNT          @UI.HiddenFilter,
            TCSGSTVALUE                 @UI.HiddenFilter,
            TCS_CGST                    @UI.HiddenFilter,
            TCS_SGST_UGST               @UI.HiddenFilter,
            TCS_IGST                    @UI.HiddenFilter,
            STATION                     @UI.HiddenFilter,
            PS_STATENAME,
            STATEOFDEPOSITEOF_STATENAME @UI.HiddenFilter,
            INVOICE_MONTH               @UI.HiddenFilter,
            TCS_SGST_SGST               @UI.HiddenFilter,
            LEGALNAME                   @UI.HiddenFilter @UI.Hidden
        };


    //Value list
    entity valueListTicketNumber    as
        select distinct TICKETNUMBER : String(15) @title: 'Ticket Number' from tAREASUMMARY
        where
            TICKETNUMBER is not null;

    entity valueListTransactionType as
        select distinct TRANSACTIONTYPE : String(10) @title: 'Transaction Type' from tAREASUMMARY
        where
            TRANSACTIONTYPE is not null;

    entity valueListPlaceOfSupply   as
        select distinct PS_STATENAME : String(255) @title: 'Place of Supply' from tAREASUMMARY
        where
            PS_STATENAME is not null;

    entity valueListSupplierGSTIN   as
        select distinct SUPPLIERGSTIN : String(15) @title: 'Supplier GSTIN' from tAREASUMMARY
        where
            SUPPLIERGSTIN is not null;

    entity valueListIATANumber      as
        select distinct
            IATANUMBER : String(10)  @title: 'IATA Number',
            LEGALNAME  : String(255) @title: 'Legal Name'
        from tAREASUMMARY
        where
            IATANUMBER is not null;

    entity valueListRegion          as
        select distinct REGION : String(10) @title: 'Region' from tAREASUMMARY
        where
            REGION is not null;

    entity valueListTCSGSTIN        as
        select distinct TCSGSTIN : String(15) @title: 'GSTN of OTA' from tAREASUMMARY
        where
            TCSGSTIN is not null;

    entity valueListDocumentType    as
        select distinct DOCUMENTTYPE as DOCUMENTTYPE : String(20) @title: 'Document Type' from tAREASUMMARY
        where
            DOCUMENTTYPE is not null
        group by
            DOCUMENTTYPE;


    function getCSRFToken()             returns String;
    entity ReportGenerator          as projection on reportGenerator;
    action   exportAll(fields : String) returns String;
}
