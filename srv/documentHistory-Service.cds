using {
    documentHistory as DocumentHistory,
    AgentMaster     as agentMaster

} from '../db/schema';

service DocumentHistoryService @(path: '/documentHistory') {

    function getCSRFToken()                           returns String;

    entity valueListIataNumber         as
        select distinct
            i.iataNumber : String(10)  @title: 'IATA Number',
            a.legalName  : String(255) @title: 'Legal Name'
        from DocumentHistory as i
        left outer join agentMaster as a
            on a.iataNumber = i.iataNumber
        where
                i.iataNumber is not null
            and i.iataNumber !=     ''
        group by
            i.iataNumber,
            a.legalName;

    entity valueListTicketNumber       as
        select distinct ticketNumber as ticketNumber : String(15) @title: 'Ticket Number' from DocumentHistory
        group by
            ticketNumber;

    entity valueListInvoiceNumber      as
        select distinct invoiceNumber as invoiceNumber : String(15) @title: 'Invoice Number' from DocumentHistory
        group by
            invoiceNumber;

    entity valueListprimaryDocumentNbr as
        select distinct primaryDocumentNbr as primaryDocumentNbr : String(20) @title: 'Primary Document Number' from DocumentHistory
        where
                primaryDocumentNbr !=     ''
            and primaryDocumentNbr is not null
        group by
            primaryDocumentNbr;

    entity valueListSupplierGSTIN      as select distinct AIGstinNo as AIGstinNo : String(15) @title: 'AI GSTIN' from DocumentHistory;
    entity valueListPassengerGSTIN     as select distinct passengerGSTIN as passengerGSTIN : String(15) @title: 'Passenger  GSTIN' from DocumentHistory;
    entity valueListPassengerName      as select distinct passangerName as passangerName : String(255) @title: 'Passenger  Name' from DocumentHistory;

    @Capabilities.FilterRestrictions: {
        RequiresFilter    : true,
        RequiredProperties: ['dateOfIssuance']
    }
    entity documentHistory             as projection on DocumentHistory;

    action   downloadInvoice(invoices : array of Ids) returns String;
}

type Ids {
    ID : String(36);
}
