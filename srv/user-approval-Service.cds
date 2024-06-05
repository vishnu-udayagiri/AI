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
    CompanyDocuments     as companyDocuments,
    DocumentCategory     as documentCategory

} from '../db/schema';

service userApprovalService @(path: '/userApproval') {
    entity CompanyUsers                        as
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
            status in (
                'I', 'R', 'A', 'X'
            )

    entity CompanyUserRoles                    as projection on companyUserRoles;
    entity StateCodes                          as projection on stateCodes;
    entity CompanyIATA                         as projection on companyIATA;
    entity AgentMaster                         as projection on agentMaster;
    entity CategoryMaster                      as projection on categoryMaster;
    entity AuditTrail                          as projection on auditTrail;
    entity CompanyMaster                       as projection on companyMasters;
    entity DocumentCategory                    as projection on documentCategory;

    entity CompanyDocuments                    as projection on companyDocuments
                                                  where
                                                          fileName is not null
                                                      and fileName !=     '';

    entity CompanyGSTINAdresses                as
        projection on companyGSTINAdresses
        excluding {
            createdAt,
            createdBy,
            modifiedAt,
            modifiedBy
        };

    entity CompanyGSTIN                        as
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


    @cds.redirection.target
    entity initiatedUsers                      as
        select from companyMasters {
            *,
            CompanyUsers,
            CompanyUserRoles,
            StateCodes,
            CompanyGSTIN,
            CompanyIATA,
            CategoryMaster,
            CompanyDocuments
        }
        excluding {
            modifiedAt,
            modifiedBy,
            createdBy
        }
        where
            status in (
                'I', 'R', 'A', 'X'
            )
        actions {
            @(
                cds.odata.bindingparameter.name: '_it',
                Common.SideEffects             : {TargetProperties: ['_it/']}
            )
            action approveInitiatedUser() returns String;
            @(
                cds.odata.bindingparameter.name: '_it',
                Common.SideEffects             : {TargetProperties: ['_it/']}
            )
            action rejectInitiatedUser( @(title:'Rejection Reason') reason : String);
        };


    //Value List - Initiated Users
    entity valueListCategory_initiatedUsers    as
        select distinct
            category                   as Category,
            CategoryMaster.description as Name
        from companyMasters
        where
                category is not null
            and status   in     (
                'I', 'R', 'A', 'X'
            )
        group by
            category,
            CategoryMaster.description;

    entity valueListCountry_initiatedUsers     as
        select distinct
            country       as Country,
            country.descr as Name
        from companyMasters
        where
            status in (
                'I', 'R', 'A', 'X'
            )
        group by
            country,
            country.descr;

    entity valueListCompanyName_initiatedUsers as
        select distinct companyName : String(256) @title: 'User Name' from companyMasters
        where
                companyName is not null
            and status      in     (
                'I', 'R', 'A', 'X'
            )
        group by
            companyName;

    entity pendingForApproval                  as
        select * from companyMasters
        where
            status = 'I';

}
