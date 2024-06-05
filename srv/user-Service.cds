using {
    CompanyUsers         as companyUsers,
    CompanyUserRoles     as companyUserRoles,
    CompanyMaster        as companyMasters,
    CategoryMaster       as categoryMaster,
    StateCodes           as stateCodes,
    CompanyGSTIN         as companyGSTIN,
    CompanyGSTINAdresses as companyGSTINAdresses,
    CompanyIATA          as companyIATA,
    AgentMaster          as agentMaster,
    AuditTrail           as auditTrail,
    UnregisteredCustomer as unregisteredCustomer,
    CompanyDocuments     as companyDocuments

} from '../db/schema';

type Users {
    userId    : String(36);
    companyId : String(36);
}

type initiatedUsers {
    userId : String(36);
}

service userService @(path: '/user') {
    //Filters
    entity valueListCategory    as
        select distinct
            category                   as Category @readonly,
            CategoryMaster.description as Name     @readonly
        from companyMasters
        where
                category is not null
            and status   not in (
                'R', 'X', 'I'
            )
        group by
            category,
            CategoryMaster.description;

    entity valueListCountry     as
        select distinct
            country       as Country,
            country.descr as Name
        from companyMasters
        where
            status not in (
                'R', 'X', 'I'
            );

    entity valueListCompanyName as
        select distinct companyName : String(256) @title: 'User Name' from companyMasters
        where
                companyName is not null
            and status      not in (
                'R', 'X', 'I'
            )
        group by
            companyName;


    @cds.redirection.target
    @odata.draft.enabled
    entity CompanyMasters       as
        projection on companyMasters
        excluding {
            modifiedAt,
            modifiedBy,
            createdBy
        }
        where
            status not in (
                'R', 'X', 'I'
            )


    @cds.redirection.target
    entity CompanyUsers         as
        projection on companyUsers
        excluding {
            isIntialLogin,
            password,
            modifiedAt,
            modifiedBy,
            createdAt,
            createdBy,
            reactivatedBy,
            reactivatedOn
        }
        where
            status not in (
                'R', 'X', 'I'
            )
        actions {
            @(
                cds.odata.bindingparameter.name: '_it',
                Common.SideEffects             : {TargetProperties: [
                    '_it/status',
                    '_it/reasonForDeactivation',
                    '_it/criticality'
                ]}
            )

            action activateUser() returns String;

            @(
                cds.odata.bindingparameter.name: '_it',
                Common.SideEffects             : {TargetProperties: [
                    '_it/status',
                    '_it/reasonForDeactivation',
                    '_it/criticality'
                ]}
            )
            action deactivateUser( @(title:'Rejection Reason') reason : String);
        };

    entity CompanyUserRoles     as projection on companyUserRoles;
    entity CategoryMaster       as projection on categoryMaster;
    entity StateCodes           as projection on stateCodes;
    entity CompanyIATA          as projection on companyIATA;
    entity AgentMaster          as projection on agentMaster;
    entity AuditTrail           as projection on auditTrail;

    @readonly
    entity CompanyDocuments     as projection on companyDocuments
                                   where
                                           fileName is not null
                                       and fileName !=     '';


    entity CompanyGSTINAdresses as
        projection on companyGSTINAdresses
        excluding {
            createdAt,
            createdBy,
            modifiedAt,
            modifiedBy
        };

    entity CompanyGSTIN         as
        projection on companyGSTIN {
                *,
            key GSTIN,
            key companyId
        }
        excluding {
            GSTCertificate,
            isRegisteredForGstAsPsuUnit,
            isRegisteredForGstAsSezUnit,
            IsEcommerceOperator,
            createdAt,
            createdBy,
            modifiedBy,
            modifiedAt,
            arnCertificate,
            neweffectiveDate,
            newAddress,
            newCity,
            newCountry,
            newPincode,
            newState,
            effectiveDate,
            oldAddress
        };

    function getCSRFToken()                                          returns String;
    action   assignAsAdmin(users : array of Users)                   returns String;
    action   activateUser(users : array of Users)                    returns String;
    action   deactivateUser(users : array of Users, reason : String) returns String;
    action   exportAll(users : array of Users)                       returns LargeString;
    //Un Registered Customer
    entity UnregisteredCustomer as projection on unregisteredCustomer;
}
