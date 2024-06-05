using {
    Invoice          as rInvoice,
    InvoiceItems     as rInvoiceItems,
    TransactionTypes as tTransactionTypes,
    CompanyIATA      as tCompanyIATA,
    OTAGSTINMaster   as tOTAGSTINMaster
} from '../db/schema';

service ASPReportService @(path: '/ASPReport') {

    entity invoiceItems            as projection on rInvoiceItems;

    @cds.redirection.target
    entity invoice                 as projection on rInvoice;

    @Capabilities.FilterRestrictions: {
        RequiresFilter    : true,
        RequiredProperties: ['ReturnPeriod']
    }
    entity aspReport               as
        select
            case
                when
                    (
                        INVOICE.documentType in (
                            'DEBIT', 'CREDIT', 'BOSCN', 'BOSDN'
                        )
                        and INVOICE.b2b      in ('1')
                    )
                then
                    'CRDR'
                when
                    (
                        INVOICE.documentType in (
                            'INVOICE', 'BOS'
                        )
                        and INVOICE.b2b      in ('1')
                    )
                then
                    'INV'
                when
                    (
                        INVOICE.documentType in (
                            'DEBIT', 'CREDIT', 'BOSCN', 'BOSDN'
                        )
                        and INVOICE.b2b      in ('0')
                    )
                then
                    'B2C NEG'
                when
                    (
                        INVOICE.documentType in (
                            'INVOICE', 'BOS'
                        )
                        and INVOICE.b2b      in ('0')
                    )
                then
                    'B2C'
            end                           as type                     : String(20)     @UI.HiddenFilter,
            case
                when
                    (
                        INVOICE.documentType in (
                            'DEBIT', 'CREDIT', 'BOSCN', 'BOSDN'
                        )
                        and INVOICE.b2b      in ('1')
                    )
                then
                    'PAX_' || MONTH(invoiceDate) || YEAR(invoiceDate) || '_CRDR'
                when
                    (
                        INVOICE.documentType in (
                            'INVOICE', 'BOS'
                        )
                        and INVOICE.b2b      in ('1')
                    )
                then
                    'PAX_' || MONTH(invoiceDate) || YEAR(invoiceDate) || '_INV'
                when
                    (
                        INVOICE.documentType in (
                            'DEBIT', 'CREDIT', 'BOSCN', 'BOSDN'
                        )
                        and INVOICE.b2b      in ('0')
                    )
                then
                    'PAX_' || MONTH(invoiceDate) || YEAR(invoiceDate) || '_B2CNEG'
                when
                    (
                        INVOICE.documentType in (
                            'INVOICE', 'BOS'
                        )
                        and INVOICE.b2b      in ('0')
                    )
                then
                    'PAX_' || MONTH(invoiceDate) || YEAR(invoiceDate) || '_B2C'
            end                           as SourceIdentifier         : String(20)     @UI.HiddenFilter,
            'Pax'                         as SourceFileName           : String(20)     @UI.HiddenFilter,
            ''                            as GLAccountCode            : String(20)     @UI.Hidden,
            ''                            as Division                 : String(20)     @UI.Hidden,
            ''                            as SubDivision              : String(20)     @UI.Hidden,
            ''                            as ProfitCentre1            : String(20)     @UI.Hidden,
            ''                            as ProfitCentre2            : String(20)     @UI.Hidden,
            ''                            as PlantCode                : String(20)     @UI.Hidden,
            INVOICE.gstR1Period           as ReturnPeriod             : String(20),
            supplierGSTIN,
            case
                when
                    documentType = 'INVOICE'
                then
                    'INV'
                when
                    documentType = 'CREDIT'
                then
                    'CR'
                when
                    documentType = 'DEBIT'
                then
                    'DR'
                when
                    documentType = 'BOS'
                then
                    'INV'
                when
                    documentType = 'BOSCN'
                then
                    'CR'
                when
                    documentType = 'BOSDN'
                then
                    'DR'
            end                           as DocumentType             : String(20)     @UI.HiddenFilter,
            case
                when
                    IsSEZ                  = 1
                    and sum(collectedIgst) > 0
                then
                    'SEZ'
                when
                    documentType like 'BOS%'
                then
                    'EXT'
                else
                    'TAX'
            end                           as SupplyType               : String(20),
            invoiceNumber                 as DocumentNumber,
            invoiceDate                   as DocumentDate,
            INVOICE.originalInvoiceNumber as OriginalDocumentNumber                    @UI.HiddenFilter,
            INVOICE.orginalInvoiceDate    as OriginalDocumentDate                      @UI.HiddenFilter,
            case
                when
                    (
                        INVOICE.documentType in (
                            'DEBIT', 'CREDIT', 'BOSCN', 'BOSDN'
                        )
                    )
                then
                    'N'
                when
                    (
                        INVOICE.documentType in (
                            'INVOICE', 'BOS'
                        )
                    )
                then
                    ''
            end                           as CRDRPreGST               : String(20)     @UI.HiddenFilter,
            min(invoiceSlNo)              as LineNumber               : Integer        @UI.HiddenFilter,
            passengerGSTIN                as CustomerGSTIN,
            ''                            as UINorComposition         : String(20)     @UI.Hidden,
            originalGstin                 as OriginalCustomerGSTIN                     @UI.HiddenFilter,
            ''                            as CustomerName             : String(20)     @UI.HiddenFilter,
            ''                            as CustomerCode             : String(20)     @UI.Hidden,
            placeOfSupply                 as BillToState                               @UI.HiddenFilter,
            ''                            as ShipToState              : String(20)     @UI.Hidden,
            placeOfSupply                 as POS                                       @UI.HiddenFilter,
            ''                            as PortCode                 : String(20)     @UI.Hidden,
            ''                            as ShippingBillNumber       : String(20)     @UI.Hidden,
            ''                            as ShippingBillDate         : String(20)     @UI.Hidden,
            ''                            as FOB                      : String(20)     @UI.Hidden,
            ''                            as ExportDuty               : String(20)     @UI.Hidden,
            HSNCode                       as HSNorSAC                                  @UI.HiddenFilter,
            ''                            as ProductCode              : String(20)     @UI.Hidden,
            hsnText                       as ProductDescription                        @UI.HiddenFilter,
            ''                            as CategoryOfProduct        : String(20)     @UI.Hidden,
            'OTH'                         as UnitOfMeasurement        : String(20)     @UI.HiddenFilter,
            1                             as Quantity                 : Decimal(14, 2) @UI.HiddenFilter,
            SUM(
                INVOICEITEMS.netTaxableValue
            )                             as TaxableValue             : Decimal(16, 2) @UI.HiddenFilter,
            collectedIgstRate             as IntegratedTaxRate                         @UI.HiddenFilter,
            SUM(collectedIgst)            as IntegratedTaxAmount      : Decimal(16, 2) @UI.HiddenFilter,
            collectedCgstRate             as CentralTaxRate                            @UI.HiddenFilter,
            sum(collectedCgst)            as CentralTaxAmount         : Decimal(16, 2) @UI.HiddenFilter,
            case
                when
                    max(collectedSgstRate) > 0
                then
                    max(collectedSgstRate)
                else
                    max(collectedUtgstRate)
            end                           as StateUTTaxRate           : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    sum(collectedSgst) > 0
                then
                    sum(collectedSgst)
                else
                    sum(collectedutgst)
            end                           as StateUTTaxAmount         : Decimal(14, 2) @UI.HiddenFilter,
            ''                            as CessRateAdvalorem        : String(20)     @UI.Hidden,
            ''                            as CessAmountAdvalorem      : String(20)     @UI.Hidden,
            ''                            as CessRateSpecific         : String(20)     @UI.Hidden,
            ''                            as CessAmountSpecific       : String(20)     @UI.Hidden,
            sum(
                INVOICEITEMS.netTaxableValue
            )+sum(
                INVOICEITEMS.collectedCgst
            )+sum(
                INVOICEITEMS.collectedSgst
            )+sum(
                INVOICEITEMS.collectedutgst
            )+sum(
                INVOICEITEMS.collectedIgst
            )+sum(
                INVOICEITEMS.nonTaxable
            )                             as InvoiceValue             : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    isReverseChargeApplicable = TRUE
                then
                    'Y'
                else
                    'N'
            end                           as ReverseChargeFlag        : String(20)     @UI.HiddenFilter,
            case
                when
                    OTAGSTINMaster.OTAGSTIN is null
                then
                    case
                        when
                            OTAGSTIN.OTAGSTIN is null
                        then
                            'N'
                        else
                            'Y'
                    end
                else
                    'Y'
            end                           as TCSFlag                  : String(20)     @UI.HiddenFilter,
            case
                when
                    OTAGSTINMaster.OTAGSTIN is null
                then
                    OTAGSTIN.OTAGSTIN
                else
                    OTAGSTINMaster.OTAGSTIN
            end                           as eComGSTIN                : String(20)     @UI.HiddenFilter,
            ''                            as ITCFlag                  : String(20)     @UI.HiddenFilter,
            case
                when
                    (
                        INVOICE.documentType in (
                            'DEBIT', 'CREDIT', 'BOSCN', 'BOSDN'
                        )
                    )
                then
                    'Others'
                when
                    (
                        INVOICE.documentType in (
                            'INVOICE', 'BOS'
                        )
                    )
                then
                    ''
            end                           as ReasonForCreditDebitNote : String(20)     @UI.HiddenFilter,
            ''                            as AccountingVoucherNumber  : String(20)     @UI.Hidden,
            ''                            as AccountingVoucherDate    : String(20)     @UI.Hidden,
            ''                            as Userdefinedfield1        : String(20)     @UI.Hidden,
            ''                            as Userdefinedfield2        : String(20)     @UI.Hidden,
            ''                            as Userdefinedfield3        : String(20)     @UI.Hidden,
            case
                when
                    (
                        INVOICE.b2b in ('1')
                    )
                then
                    'B2B'
                when
                    (
                        INVOICE.b2b in ('0')
                    )
                then
                    'B2C'
            end                           as RecordType               : String(10)     @UI.HiddenFilter
        from rInvoice as INVOICE
        left outer join rInvoiceItems as INVOICEITEMS
            on  INVOICE.ID      = INVOICEITEMS.invoice.ID
            and INVOICE.company = INVOICEITEMS.invoice.company
        left outer join tTransactionTypes as TRANSACTIONTYPES
            on  TRANSACTIONTYPES.transactionType = INVOICE.transactionType
            and TRANSACTIONTYPES.hsn             = INVOICEITEMS.HSNCode
        left outer join tOTAGSTINMaster as OTAGSTINMaster
            on  INVOICE.iataNumber = OTAGSTINMaster.IATACODE
            and SUBSTRING(
                INVOICE.supplierGSTIN, 0, 2
            )                      = OTAGSTINMaster.STATE_CODE
        left outer join tOTAGSTINMaster as OTAGSTIN
            on  INVOICE.iataNumber = OTAGSTIN.IATACODE
            and OTAGSTIN.DEFAULT   = true
        where
               b2b = 1
            or b2b = 0
        group by
            INVOICE.invoiceNumber,
            INVOICE.documentType,
            INVOICE.b2b,
            INVOICE.invoiceDate,
            INVOICE.gstR1Period,
            INVOICE.supplierGSTIN,
            INVOICE.IsSEZ,
            INVOICE.originalInvoiceNumber,
            INVOICE.orginalInvoiceDate,
            INVOICE.passengerGSTIN,
            INVOICE.originalGstin,
            INVOICE.placeOfSupply,
            INVOICEITEMS.HSNCode,
            TRANSACTIONTYPES.hsnText,
            INVOICEITEMS.collectedIgstRate,
            INVOICEITEMS.collectedCgstRate,
            INVOICEITEMS.collectedSgstRate,
            INVOICEITEMS.collectedUtgstRate,
            INVOICE.isReverseChargeApplicable,
            OTAGSTINMaster.OTAGSTIN,
            OTAGSTIN.OTAGSTIN;


    entity aspReportB2C            as
        select
            case
                when
                    (
                        INVOICE.documentType in (
                            'CREDIT', 'BOSCN'
                        )
                    )
                then
                    'B2CNEG'
                when
                    (
                        INVOICE.documentType in (
                            'DEBIT', 'INVOICE', 'BOS', 'BOSDN'
                        )
                    )
                then
                    'B2C'
            end                     as Type                 : String(20),
            INVOICE.supplierGSTIN   as orgSupplierGstin,
            ''                      as TrancsactionType     : String(20),
            INVOICE.invoiceDate     as DocumentDate,
            ''                      as OrgPOS               : String(20),
            ''                      as OrgHSNorSAC          : String(20),
            ''                      as OrgTaxableValue      : String(20),
            SUM(collectedIgst)      as IntegratedTaxAmount  : Decimal(14, 2),
            SUM(collectedCgst)      as CentralTaxAmount     : Decimal(14, 2),
            SUM(collectedSgst)      as CollectedSGST        : Decimal(14, 2),
            SUM(collectedutgst)     as CollectedUTGST       : Decimal(14, 2),
            SUM(
                INVOICEITEMS.netTaxableValue
            )+SUM(
                INVOICEITEMS.collectedCgst
            )+SUM(
                INVOICEITEMS.collectedSgst
            )+SUM(
                INVOICEITEMS.collectedutgst
            )+SUM(
                INVOICEITEMS.collectedIgst
            )+SUM(
                INVOICEITEMS.nonTaxable
            )                       as TotalValue           : Decimal(14, 2),
            INVOICE.gstR1Period     as ReturnPeriod         : String(10),
            INVOICE.transactionType as TransactionType,
            ''                      as OrgUnitOfMeasurement : String(10),
            ''                      as OrgQuantity          : String(10),
            ''                      as Month                : Date,
            0.0                     as OrgRate              : Decimal(14, 2),
            ''                      as OrgeComGSTIN         : String(10),
            ''                      as OrgeComSupplyValue   : String(10),
            INVOICE.placeOfSupply   as NewPOS               : String(10),
            INVOICEITEMS.HSNCode    as NewHSNorSAC          : String(10),
            'OTH'                   as NewUnitOfMeasurement : String(10),
            '1'                     as NewQuantity          : String(10),
            (
                INVOICEITEMS.collectedCgstRate + INVOICEITEMS.collectedSgstRate + INVOICEITEMS.collectedUtgstRate + INVOICEITEMS.collectedIgstRate
            )                       as NewRate              : Decimal(14, 2),
            SUM(
                INVOICEITEMS.netTaxableValue
            )                       as NewTaxableValue      : Decimal(14, 2),
            ''                      as NeweComGSTIN         : String(10),
            ''                      as NeweComSupplyValue   : String(10),
            case
                when
                    MAX(collectedSgstRate) > 0
                then
                    MAX(collectedSgstRate)
                else
                    MAX(collectedUtgstRate)
            end                     as StateUTTaxRate       : Decimal(14, 2),
            case
                when
                    SUM(collectedSgst) > 0
                then
                    SUM(collectedSgst)
                else
                    SUM(collectedutgst)
            end                     as StateUTTaxAmount     : Decimal(14, 2),
            0.0                     as CessAmount           : Decimal(14, 2)
        from rInvoice as INVOICE
        inner join rInvoiceItems as INVOICEITEMS
            on  INVOICE.ID      = INVOICEITEMS.invoice.ID
            and INVOICE.company = INVOICEITEMS.invoice.company
        where
            b2b = 0
        group by
            INVOICE.supplierGSTIN,
            INVOICE.placeOfSupply,
            INVOICEITEMS.HSNCode,
            INVOICE.transactionType,
            INVOICE.invoiceDate,
            INVOICE.documentType,
            INVOICE.gstR1Period,
            INVOICEITEMS.collectedCgstRate,
            INVOICEITEMS.collectedSgstRate,
            INVOICEITEMS.collectedUtgstRate,
            INVOICEITEMS.collectedIgstRate;

    entity valueListDocumentType   as

        select type from (
            select distinct case
                                when
                                    (
                                        documentType in (
                                            'DEBIT', 'CREDIT', 'BOSCN', 'BOSDN'
                                        )
                                        and b2b      =  '1'
                                    )
                                then
                                    'CRDR'
                                when
                                    (
                                        documentType in (
                                            'INVOICE', 'BOS'
                                        )
                                        and b2b      =  '1'
                                    )
                                then
                                    'INV'
                                when
                                    (
                                        documentType in (
                                            'DEBIT', 'CREDIT', 'BOSCN', 'BOSDN'
                                        )
                                        and b2b      =  '0'
                                    )
                                then
                                    'B2C NEG'
                                when
                                    (
                                        documentType in (
                                            'INVOICE', 'BOS'
                                        )
                                        and b2b      =  '0'
                                    )
                                then
                                    'B2C'
                            end as type : String(15) @title: 'Type' from rInvoice
        ) as type
        where
            type is not null;


    entity valueListDocumentNumber as
        select distinct invoiceNumber as invoiceNumber : String(20) @title: 'Document Number' from rInvoice
        group by
            invoiceNumber;

    entity valueListCustomerGSTIN  as
        select distinct passengerGSTIN as passengerGSTIN : String(20) @title: 'Customer GSTIN' from rInvoice
        group by
            passengerGSTIN;

    entity valueListsupplierGSTIN  as
        select distinct supplierGSTIN as supplierGSTIN : String(15) @title: 'Supplier GSTIN' from rInvoice
        group by
            supplierGSTIN;

    entity valueListgstR1Period    as
        select distinct gstR1Period as gstR1Period : String(15) @title: 'GSTR1 Period' from rInvoice
        where
                gstR1Period !=     ''
            and gstR1Period is not null
        group by
            gstR1Period;

    entity valueListsupplyType     as
        select distinct case
                            when
                                IsSEZ = 1
                            then
                                'SEZ'
                            when
                                documentType like 'BOS%'
                            then
                                'EXT'
                            else
                                'TAX'
                        end as supplytype : String(15) @title: 'Supply Type' from rInvoice;

    entity valueListRecordType     as
        select b2b from (
            select distinct case
                                when
                                    (
                                        b2b in ('1')
                                    )
                                then
                                    'B2B'
                                when
                                    (
                                        b2b in ('0')
                                    )
                                then
                                    'B2C'
                            end as b2b : String(15) @title: 'Record Type' from rInvoice
        ) as b2b
        where
            b2b is not null;

    function getCSRFToken()             returns String;
    action   exportAll(fields : String) returns String;

}
