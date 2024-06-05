using {
    TCSSUMMARY      as tTCSSUMMARY,
    StateCodes      as tStateCodes,
    ReportGenerator as reportGenerator
} from '../db/schema';

service tcsSummaryService @(path: '/tcsSummary') {
    entity TCSSUMMARY               as
        projection on tTCSSUMMARY {
            TICKETNUMBER,
            TRANSACTIONTYPE,
            TICKETISSUEDATE,
            IATANUMBER,
            TCSGSTIN,
            PS_STATENAME,
            SUPPLIERGSTIN,
            STATEOFDEPOSITEOF_STATENAME @UI.HiddenFilter,
            TAXABLE                     @UI.HiddenFilter,
            NONTAXABLE                  @UI.HiddenFilter,
            K3TAX                       @UI.HiddenFilter,
            TCSGSTVALUE                 @UI.HiddenFilter,
            TCS_CGST                    @UI.HiddenFilter,
            TCS_SGST_UGST               @UI.HiddenFilter,
            TCS_IGST                    @UI.HiddenFilter,
            TCS_SGST_SGST               @UI.HiddenFilter,
            TOTALINVOICEAMOUNT          @UI.HiddenFilter,
            DOCUMENTTYPE @UI.Hidden @UI.HiddenFilter
        };

    //Value list
    entity valueListTicketNumber    as
        select distinct TICKETNUMBER : String(15) @title: 'Ticket Number' from tTCSSUMMARY
        where
            TICKETNUMBER is not null;

    entity valueListTransactionType as
        select distinct TRANSACTIONTYPE : String(10) @title: 'Transaction Type' from tTCSSUMMARY
        where
            TRANSACTIONTYPE is not null;

    entity valueListPlaceOfSupply   as
        select distinct PS_STATENAME : String(255) @title: 'Place of Supply' from tTCSSUMMARY
        where
            PS_STATENAME is not null;

    entity valueListSupplierGSTIN   as
        select distinct
            SUPPLIERGSTIN : String(15)  @title: 'Supplier GSTIN',
            sc.stateName  : String(255) @title: 'State'
        from tTCSSUMMARY
        inner join tStateCodes as sc
            on SUBSTRING(
                SUPPLIERGSTIN, 1, 2
            ) = sc.stateCode
        where
            SUPPLIERGSTIN is not null;

    entity valueListIATANumber      as
        select distinct
            IATANUMBER : String(10)  @title: 'IATA Number',
            LEGALNAME  : String(255) @title: 'Legal Name'
        from tTCSSUMMARY
        where
            IATANUMBER is not null;

    entity valueListTCSGSTIN        as
        select distinct TCSGSTIN : String(15) @title: 'Passenger GSTIN' from tTCSSUMMARY
        where
            TCSGSTIN is not null;

    entity valueListDocumentType    as
        select distinct DOCUMENTTYPE as DOCUMENTTYPE : String(15) @title: 'Document Type' from tTCSSUMMARY
        where
                DOCUMENTTYPE !=     ''
            and DOCUMENTTYPE is not null
        group by
            DOCUMENTTYPE;


    function getCSRFToken()             returns String;
    entity ReportGenerator          as projection on reportGenerator;
    action   exportAll(fields : String) returns String;

}
