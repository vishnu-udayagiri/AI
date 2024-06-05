using {
    MJVI_1      as mJVI_1,
} from '../db/schema';

service MJVReportService @(path: '/mjvreportservice') {
    @Capabilities.FilterRestrictions: { RequiresFilter : true, RequiredProperties: ['GSTR1PERIOD'] }
    entity mjvreport  as  projection on mJVI_1
    
    entity valueListGSTR1PERIOD   as
        select distinct GSTR1PERIOD as GSTR1PERIOD : String(15) @title: 'GSTR1 Period' from mJVI_1
        where
                GSTR1PERIOD !=     ''
            and GSTR1PERIOD is not null
        group by
            GSTR1PERIOD;
            
    function getCSRFToken()  returns String;
    action   exportAll(fields : String) returns String;
}