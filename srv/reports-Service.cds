using {
    AgentMaster      as agentMaster,
    TransactionTypes as transactionTypes,
    DiscrepancyTable as discrepancyTable,
    ReportGenerator  as reportGenerator
} from '../db/schema';


service Reports @(path: '/report') {
    entity TransactionTypes         as projection on transactionTypes;
    entity DiscrepancyReport        as projection on discrepancyTable;

    /* Discrepancy Report Start */
    entity valueListTicketNumber    as
        select distinct MAIN_TICKET_NUMBER from discrepancyTable
        group by
            MAIN_TICKET_NUMBER;

    entity valueListSectionType     as
        select distinct B2B_B2C_INDICATOR from discrepancyTable
        group by
            B2B_B2C_INDICATOR;

    entity valueListCompany         as
        select distinct AIRLINE_CODE from discrepancyTable
        group by
            AIRLINE_CODE;

    entity valueListIataNumber      as
        select distinct
            i.IATANUMBER : String(10)  @title: 'Agent Code',
            a.legalName  : String(255) @title: 'Legal Name'
        from discrepancyTable as i
        inner join agentMaster as a
            on a.iataNumber = i.IATANUMBER
        group by
            i.IATANUMBER,
            a.legalName;

    entity valueListTransactionType as
        select distinct
            TRANSACTION_CODE,
            transactionText : String(50) @title: 'Description'
        from discrepancyTable
        left outer join TransactionTypes as t
            on t.transactionType = TRANSACTION_CODE
        group by
            TRANSACTION_CODE,
            transactionText;

    entity valueListDiscrepancyCode as
        select distinct
            DISCREPANCYCODE,
            DESCRIPTION as Description
        from discrepancyTable
        group by
            DISCREPANCYCODE,
            DESCRIPTION;

    entity valueListInvoiceNumber   as
        select distinct INVOICENUMBER from discrepancyTable
        group by
            INVOICENUMBER;

    entity valueListPNR             as
        select distinct PNR from discrepancyTable
        group by
            PNR;

    entity valueListTransactionCode as
        select distinct TRANSACTION_TYPE from discrepancyTable
        group by
            TRANSACTION_TYPE;

    entity valueListIssueType       as
        select distinct ISSUE_TYPE from discrepancyTable
        group by
            ISSUE_TYPE;


    entity valueListDocumentType    as
        select distinct
            DOCUMENT_TYPE,
            case
                when
                    DOCUMENT_TYPE = 'INVOICE'
                then
                    'TAX INVOICE'
                when
                    DOCUMENT_TYPE = 'CREDIT'
                then
                    'CREDIT NOTE'
                when
                    DOCUMENT_TYPE = 'DEBIT'
                then
                    'DEBIT NOTE'
                when
                    DOCUMENT_TYPE = 'BOS'
                then
                    'BILL OF SUPPLY'
                when
                    DOCUMENT_TYPE = 'BOSCN'
                then
                    'BILL OF SUPPLY - CN'
                when
                    DOCUMENT_TYPE = 'BOSDN'
                then
                    'BILL OF SUPPLY - DN'
                else
                    'TAX INVOICE'
            end as description : String(20) @title: 'Description'
        from discrepancyTable
        group by
            DOCUMENT_TYPE;


    entity valueListGstDifference   as
        select distinct GST_DIFFERENCE from discrepancyTable
        group by
            GST_DIFFERENCE;


    function getCSRFToken()             returns String;
    entity ReportGenerator          as projection on reportGenerator;
    action   exportAll(fields : String) returns String;

/* Discrepancy Report End  */

}
