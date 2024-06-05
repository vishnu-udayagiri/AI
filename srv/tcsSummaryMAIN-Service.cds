using {
    TCSSUMMARYMAIN  as tCSSUMMARYMAIN
} from '../db/schema';

service tcsSummaryMAINService @(path: '/tcsSummaryMAIN') {
    @Capabilities.FilterRestrictions: { RequiresFilter : true, RequiredProperties: ['GSTR_MONTH'] }
    entity tcsSummaryMAIN      as projection on tCSSUMMARYMAIN;

    entity valueListMonth      as
        select distinct GSTR_MONTH as GSTR_MONTH : String(15) @title: 'Month' from tCSSUMMARYMAIN
        where
                GSTR_MONTH !=     ''
            and GSTR_MONTH is not null
        group by
            GSTR_MONTH;

    entity valueListIATANumber as
        select distinct IATANUMBER as IATANUMBER : String(15) @title: 'IATA Number' from tCSSUMMARYMAIN
        where
                IATANUMBER !=     ''
            and IATANUMBER is not null
        group by
            IATANUMBER;

    entity valueListOTAGSTIN   as
        select distinct OTA_GSTIN as OTA_GSTIN : String(15) @title: 'OTA GSTIN' from tCSSUMMARYMAIN
        where
                OTA_GSTIN !=     ''
            and OTA_GSTIN is not null
        group by
            OTA_GSTIN;


    function getCSRFToken()             returns String;
    action   exportAll(fields : String) returns String;
}
