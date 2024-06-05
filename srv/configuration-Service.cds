using {
    DocumentCategory as documentCategory,
    AuditTrail       as auditTrail,
    InvoiceSignatory as invoiceSignatory,
    AppConfig        as appConfig,
    Company          as company,
    companyAdmin     as tcompanyAdmin
} from '../db/schema';

service ConfigService @(path: '/config') {
    entity AuditTrail       as projection on auditTrail;
    entity Company          as projection on company;

    @odata.draft.enabled
    entity DocumentCategory as projection on documentCategory;


    @odata.draft.enabled
    entity companyAdmin     as projection on tcompanyAdmin;

    entity InvoiceSignatory as projection on invoiceSignatory;
    entity AppConfig        as projection on appConfig;
    function getConfigurationDetails()               returns String;
    action   saveConfigurationDetails(Data : String) returns String;


    entity valueListName    as
        select distinct name as Name from tcompanyAdmin
        where
            name is not null
        group by
            name;

}
