using {
    MJVI_VOID      as mJVI_VOID,
} from '../db/schema';

service MJVvoidchargesReportService @(path: '/mjvvoidchargesreportservice') {
    @Capabilities.FilterRestrictions: { RequiresFilter : true, RequiredProperties: ['GSTR1PERIOD'] }
    entity mjvvoidchargesreport  as  projection on mJVI_VOID
    
    entity valueListGSTR1PERIOD   as
        select distinct GSTR1PERIOD as GSTR1PERIOD : String(15) @title: 'GSTR1 Period' from mJVI_VOID
        where
                GSTR1PERIOD !=     ''
            and GSTR1PERIOD is not null
        group by
            GSTR1PERIOD;
            
    function getCSRFToken()  returns String;
    action   exportAll(fields : String) returns String;
}