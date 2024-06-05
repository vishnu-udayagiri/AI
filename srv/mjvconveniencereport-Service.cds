using {
    MJVI_OB      as mJVI_OB,
} from '../db/schema';

service MJVconvenienceReportService @(path: '/mjvconveniencereportservice') {
    @Capabilities.FilterRestrictions: { RequiresFilter : true, RequiredProperties: ['GSTR1PERIOD'] }
    entity mjvconveniencereport  as  projection on mJVI_OB
    
    entity valueListGSTR1PERIOD   as
        select distinct GSTR1PERIOD as GSTR1PERIOD : String(15) @title: 'GSTR1 Period' from mJVI_OB
        where
                GSTR1PERIOD !=     ''
            and GSTR1PERIOD is not null
        group by
            GSTR1PERIOD;
            
    function getCSRFToken()  returns String;
    action   exportAll(fields : String) returns String;
}