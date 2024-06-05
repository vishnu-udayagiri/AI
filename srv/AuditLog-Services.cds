using {
    AuditTrail      as audit,
    AuditTrailItems as audititems,
    Company         as company,
    CompanyUsers    as companyUsers,
    CompanyMaster   as companyMaster
} from '../db/schema';

service AuditTrailService @(path: '/audit') {
    entity AuditTrailItems        as projection on audititems;
    entity Company                as projection on company;
    entity CompanyMaster          as projection on companyMaster;
    entity CompanyUsers           as projection on companyUsers;

    @cds.redirection.target
    entity AuditTrail             as projection on audit {
        *,
        concat(
            concat(
                User.firstName, ' '
            ), User.lastName
        ) as userName : String(256)  @title: 'User Name'  @UI.HiddenFilter
    } excluding {
        attributeName,
        businessDocumentId,
        modifiedAt,
        modifiedBy
    };

    //Filters

    entity valueListCompany       as
        select distinct
            Company.description as Name,
            companyCode         as Company
        from audit
        where
            Company.description is not null
        group by
            Company.description,
            companyCode;

    entity valueListModule        as
        select distinct module as Module from audit
        where
            module is not null
        group by
            module;

    entity valueListEventId       as
        select distinct eventId as Event from audit
        where
            eventId is not null
        group by
            eventId;

    entity valueListCompanyMaster as
        select distinct
            companyId                 as ID,
            CompanyMaster.companyName as Name
        from audit
        where
            CompanyMaster.companyName is not null
        group by
            companyId,
            CompanyMaster.companyName;

    entity valueListCompanyUsers  as
        select
            userId as ID,
            concat(
                concat(
                    User.firstName, ' '
                ), User.lastName
            )      as Name : String(256)
        from audit
        where
            userId is not null
        group by
            userId,
            User.firstName,
            User.lastName;
}
