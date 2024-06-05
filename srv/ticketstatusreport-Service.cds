using {TICKETSTATUSREPORT as tICKETSTATUSREPORT} from '../db/schema';

service ticketstatusService @(path: '/ticketstatusreport') {

    entity ticketstatusreport     as projection on tICKETSTATUSREPORT;

    entity valueListIATANUMBER    as
        select distinct IATANUMBER as IATANUMBER : String(15) @title: 'IATA Number' from tICKETSTATUSREPORT
        where
                IATANUMBER !=     ''
            and IATANUMBER is not null
        group by
            IATANUMBER;

    entity valueListTICKETNUMBER  as
        select distinct TICKETNUMBER as TICKETNUMBER : String(15) @title: 'Ticket Number' from tICKETSTATUSREPORT
        where
                TICKETNUMBER !=     ''
            and TICKETNUMBER is not null
        group by
            TICKETNUMBER;

    entity valueListSUPPLIERGSTIN as
        select distinct SUPPLIERGSTIN as SUPPLIERGSTIN : String(15) @title: 'Supplier GSTIN' from tICKETSTATUSREPORT
        where
                SUPPLIERGSTIN !=     ''
            and SUPPLIERGSTIN is not null
        group by
            SUPPLIERGSTIN;

    entity valueListINVOICENUMBER as
        select distinct INVOICENUMBER as INVOICENUMBER : String(15) @title: 'Invoice Number' from tICKETSTATUSREPORT
        where
                INVOICENUMBER !=     ''
            and INVOICENUMBER is not null
        group by
            INVOICENUMBER;

    entity valueListDOCUMENTTYPE  as
        select distinct DOCUMENTTYPE as DOCUMENTTYPE : String(15) @title: 'Document Type' from tICKETSTATUSREPORT
        where
                DOCUMENTTYPE !=     ''
            and DOCUMENTTYPE is not null
        group by
            DOCUMENTTYPE;

    function getCSRFToken()             returns String;
    action   exportAll(fields : String) returns String;
}
