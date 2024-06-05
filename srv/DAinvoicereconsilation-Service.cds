using {
    DA_INV_RECON_SUM as da_INV_RECON_SUM,
    DA_RECON_MAIN    as da_RECON_MAIN
} from '../db/schema';

service DAInvoiceService @(path: '/dainvoiceservice') {

    entity DAinvoicereport  as projection on da_INV_RECON_SUM;


    @readonly
    entity DAinvoicereportmain(GSTR1PERIOD : String(6)) as
        select from da_RECON_MAIN (
            GSTR1PERIOD: :GSTR1PERIOD
        ) {
            *
        };
    function getCSRFToken()  returns String;
    action   exportAll(fields : String) returns String;
}
