using {
    RECONCILIATIONVIEW1 as reconciliationReport,
    AgentMaster      as agentMaster,
} from '../db/schema';


service Reconciliation @(path: '/reconciliationReport') {
    
    entity RECONCILIATIONVIEW1         as projection on reconciliationReport;

    entity valueListDocumentNumber    as
        select distinct DOCUMENTNUMBER from reconciliationReport
        group by
            DOCUMENTNUMBER;

    entity valueListTransactionType    as
        select distinct TRANSACTIONTYPE from reconciliationReport
        group by
            TRANSACTIONTYPE;

    entity valueListTransactionCode    as
        select distinct TRANSACTIONCODE from reconciliationReport
        group by
            TRANSACTIONCODE;

    entity valueListIssueIndicator    as
        select distinct ISSUEINDICATOR from reconciliationReport
        group by
            ISSUEINDICATOR;

    entity valueListRoutingType    as
        select distinct ROUTINGTYPE from reconciliationReport
        group by
            ROUTINGTYPE;

    entity valueListEventType    as
        select distinct EVENTTYPE from reconciliationReport
        group by
            EVENTTYPE;

    entity valueListEntityStatus    as
        select distinct ENTITYSTATUS from reconciliationReport
        group by
            ENTITYSTATUS;

    entity valueListGSTIN    as
        select distinct GSTIN from reconciliationReport
        group by
            GSTIN;


 entity valueListIATANumber        as
        select distinct
            i.IATANUMBER : String(10)  @title: 'IATA Number',
            a.legalName  : String(255) @title: 'Legal Name'
        from reconciliationReport as i
        inner join agentMaster as a
            on a.iataNumber = i.IATANUMBER
        where
                i.IATANUMBER is not null
            and i.IATANUMBER !=     ''
        group by
            i.IATANUMBER,
            a.legalName;
}
