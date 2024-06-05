using {TCSI_RT as tCSI_RT} from '../db/schema';

service tcsSummaryDtlsReportService @(path: '/tcsSummaryDtlsReport') {
    @Capabilities.FilterRestrictions: { RequiresFilter : true, RequiredProperties: ['GSTR1PERIOD'] }
    entity tcsSummaryDetailsReport as projection on tCSI_RT;

    entity valueListTICKETNUMBER   as
        select distinct TICKETNUMBER as TICKETNUMBER : String(15) @title: 'Ticket Number' from tCSI_RT
        where
                TICKETNUMBER !=     ''
            and TICKETNUMBER is not null
        group by
            TICKETNUMBER;

    entity valueListDocumentType   as
        select distinct DOCUMENTTYPE as DOCUMENTTYPE : String(15) @title: 'Document Type' from tCSI_RT
        where
                DOCUMENTTYPE !=     ''
            and DOCUMENTTYPE is not null
        group by
            DOCUMENTTYPE;

    entity valueListSUPPLIERGSTIN  as
        select distinct SUPPLIERGSTIN as SUPPLIERGSTIN : String(15) @title: 'Supplier GSTIN' from tCSI_RT
        where
                SUPPLIERGSTIN !=     ''
            and SUPPLIERGSTIN is not null
        group by
            SUPPLIERGSTIN;

    entity valueListIATANumber     as
        select distinct IATANUMBER as IATANUMBER : String(15) @title: 'IATA Number' from tCSI_RT
        where
                IATANUMBER !=     ''
            and IATANUMBER is not null
        group by
            IATANUMBER;

    entity valueListGSTR1PERIOD     as
        select distinct GSTR1PERIOD as GSTR1PERIOD : String(15) @title: 'GSTR1 Period' from tCSI_RT
        where
                GSTR1PERIOD !=     ''
            and GSTR1PERIOD is not null
        group by
            GSTR1PERIOD;

    function getCSRFToken()             returns String;
    action   exportAll(fields : String) returns String;
}
