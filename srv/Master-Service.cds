using {
    TransactionTypes       as transactionTypes,
    TaxCodes               as tCodes,
    TaxCompositions        as tCompositions,
    TaxRates               as tRates,
    TaxRules               as tRules,
    StateCodes             as tStateCodes,
    GstExemptedZones       as tGstExemptedZones,
    StateMapping           as tStateMapping,
    AirportCodes           as tAirportCodes,
    RFISC                  as tRFISC,
    FOP                    as tFOP,
    GSTIN                  as tGSTIN,
    Company                as tCompany,
    ConsulateEmbassyMaster as tConsulateEmbassyMaster,
    UNBodyMaster           as tUNBodyMaster,
    AgentMaster            as tAgentMaster,
    FeeCodes               as tFeeCodes,
    EMDRFISC               as tEMDRFISC,
    EMDRules               as tEMDRules,
    AuditTrail             as tAuditTrail,
    iataGst                as tiataGst,
    AirportMaster          as airportMaster,
    gstinAddress           as tgstinAddress

} from '../db/schema';


service ScheduleService @(path: '/master') {
    entity AuditTrail              as projection on tAuditTrail;

    @odata.draft.enabled
    entity TransactionTypes        as projection on transactionTypes;

    @odata.draft.enabled
    entity TaxCodes                as projection on tCodes;

    @odata.draft.enabled
    entity TaxCompositions         as projection on tCompositions;

    @odata.draft.enabled
    entity TaxRates                as projection on tRates;

    @odata.draft.enabled
    entity TaxRules                as projection on tRules;

    @odata.draft.enabled
    entity GstExemptedZones        as projection on tGstExemptedZones;

    @odata.draft.enabled
    entity AirportCodes            as projection on tAirportCodes;

    @odata.draft.enabled
    entity StateMapping            as projection on tStateMapping;

    @odata.draft.enabled
    entity ConsulateEmbassyMaster  as projection on tConsulateEmbassyMaster;

    @odata.draft.enabled
    entity UNBodyMaster            as projection on tUNBodyMaster;


    @odata.draft.enabled
    entity AgentMaster             as projection on tAgentMaster;

    @odata.draft.enabled
    entity RFISC                   as projection on tRFISC;

    @odata.draft.enabled
    entity FOP                     as projection on tFOP;

    @odata.draft.enabled
    entity FeeCodes                as projection on tFeeCodes;

    @odata.draft.enabled
    entity EMDRFISC                as projection on tEMDRFISC;

    @odata.draft.enabled
    entity EMDRules                as projection on tEMDRules;

    entity GSTIN                   as projection on tGSTIN;
    entity Company                 as projection on tCompany;

    @odata.draft.enabled
    entity StateCodes              as projection on tStateCodes;

    @odata.draft.enabled
    entity IataGst                 as projection on tiataGst;

    @odata.draft.enabled
    entity AirportMaster           as projection on airportMaster;

    @cds.redirection.target
    entity gstinAddress            as projection on tgstinAddress;

    //Value List

    entity valueListSiteType       as
        select distinct siteType : String(1) @title: 'Site Type' from tAgentMaster
        where
                siteType is not null
            and siteType !=     ''
        group by
            siteType;

    entity valueListCrossRefNumber as
        select distinct crossReferenceAgentNum : String(15) @title: 'Cross Reference Agent No.' from tAgentMaster
        where
                crossReferenceAgentNum is not null
            and crossReferenceAgentNum !=     ''
        group by
            crossReferenceAgentNum;

    entity valueListRegion         as
        select distinct
            regionCode : String(3)   @title: 'Region',
            region     : String(255) @title: 'Region Name'
        from tAgentMaster
        where
                region is not null
            and region !=     ''
        group by
            regionCode,
            region;

    entity valueListCountry        as
        select distinct countryName : String(255) @title: 'Country Name'
        from tAgentMaster
        where
                countryName is not null
            and countryName !=     ''
        group by
            countryName;

    entity valueListAirport        as
        select distinct
            airportCode : String(3)   @title: 'Code',
            airportName : String(255) @title: 'Name'
        from airportMaster
        where
                airportCode is not null
            and airportCode !=     ''
        group by
            airportCode,
            airportName;

    entity valueListCity           as
        select distinct city : String(255) @title: 'City'
        from airportMaster
        where
                city is not null
            and city !=     ''
        group by
            city;

    entity valueListState          as
        select distinct
            am.stateCode : String(3)  @title: 'Code',
            stateName    : String(50) @title: 'Name'
        from airportMaster as am
        inner join StateCodes as sc
            on sc.stateCode = am.stateCode
        where
                am.stateCode is not null
            and am.stateCode !=     ''
        group by
            am.stateCode,
            stateName;

    entity valueListGSTIN          as
        select distinct gstIn : String(15) @title: 'GSTIN'
        from tiataGst
        where
                gstIn is not null
            and gstIn !=     ''
        group by
            gstIn;

    entity valueListExemptedZone   as
        select distinct
            exemptedZone,
            case
                when
                    exemptedZone = '0'
                then
                    'No'
                when
                    exemptedZone = '1'
                then
                    'Yes'
            end as description : String(20)
        from tAirportCodes;

    entity valueListgstinAddress   as select * from tgstinAddress;
}
