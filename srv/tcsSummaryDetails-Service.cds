using {
    TCSSUMMARY        as tTCSSUMMARY,
    StateCodes        as tStateCodes,
    ReportGenerator   as reportGenerator,
    TCSSUMMARYDETAILS as tCSSUMMARYDETAILS
} from '../db/schema';

service tcsSummaryDetailsService @(path: '/tcsSummaryDetail') {

    entity tcsSummaryDetails        as projection on tCSSUMMARYDETAILS;

    entity valueListTransactionType as
        select distinct TRANSACTIONTYPE as TRANSACTIONTYPE : String(15) @title: 'Transaction Type' from tCSSUMMARYDETAILS
        where
                TRANSACTIONTYPE !=     ''
            and TRANSACTIONTYPE is not null
        group by
            TRANSACTIONTYPE;

    entity valueListDocumentType    as
        select distinct DOCUMENTTYPE as DOCUMENTTYPE : String(15) @title: 'Document Type' from tCSSUMMARYDETAILS
        where
                DOCUMENTTYPE !=     ''
            and DOCUMENTTYPE is not null
        group by
            DOCUMENTTYPE;

    entity valueListIATANumber      as
        select distinct IATANUMBER as IATANUMBER  : String(15) @title: 'IATA Number' from tCSSUMMARYDETAILS
        where
                IATANUMBER !=     ''
            and IATANUMBER is not null
        group by
            IATANUMBER;

    entity valueListTicketNumber    as select distinct TICKETNUMBER as TICKETNUMBER : String(20) @title: 'Ticket Number' from tCSSUMMARYDETAILS;
    function getCSRFToken()             returns String;
    action   exportAll(fields : String) returns String;
}
