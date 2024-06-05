using {
    MJVI_CP      as mJVI_CP,
} from '../db/schema';

service MJVCPReportService @(path: '/mjvcpreportservice') {
    @Capabilities.FilterRestrictions: { RequiresFilter : true, RequiredProperties: ['GSTR1PERIOD'] }
    entity mjvcpreport  as  projection on mJVI_CP
    
    entity valueListGSTR1PERIOD   as
        select distinct GSTR1PERIOD as GSTR1PERIOD : String(15) @title: 'GSTR1 Period' from mJVI_CP
        where
                GSTR1PERIOD !=     ''
            and GSTR1PERIOD is not null
        group by
            GSTR1PERIOD;
            
    function getCSRFToken()  returns String;
    action   exportAll(fields : String) returns String;
}