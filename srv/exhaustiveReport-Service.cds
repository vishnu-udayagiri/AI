using {
    Invoice              as invoice,
    InvoiceItems         as invoiceItems,
    InvoiceDocuments     as invoiceDocuments,
    Company              as company,
    AirportCodes         as airportCode,
    Document             as documents,
    AgentMaster          as agentMaster,
    TransactionTypes     as transactionTypes,
    CompanyGSTIN         as companyGSTIN,
    CompanyGSTINAdresses as companyGSTINAdresses,
    CompanyUsers         as companyUsers,
    SBR                  as sbr,
    CompanyUserRoles     as companyUserRoles,
    StateCodes           as stateCode,
    Coupon               as coupon,
    ReportGenerator      as reportGenerator
} from '../db/schema';


service exhaustiveReport @(path: '/exhaustiveReport') {
    entity TransactionTypes         as projection on transactionTypes;
    function getCSRFToken()             returns String;
    entity ReportGenerator          as projection on reportGenerator;

    /*  Exhaustive Report Start */

    entity valueListTaxInvoiceType  as
        select distinct
            documentType as TAX_INVOICE_TYPE : String(20) @title: 'Tax Invoice Type',
            case
                when
                    documentType = 'INVOICE'
                then
                    'TAX INVOICE'
                when
                    documentType = 'CREDIT'
                then
                    'CREDIT NOTE'
                when
                    documentType = 'DEBIT'
                then
                    'DEBIT NOTE'
                when
                    documentType = 'BOS'
                then
                    'BILL OF SUPPLY'
                when
                    documentType = 'BOSCN'
                then
                    'BILL OF SUPPLY - CN'
                when
                    documentType = 'BOSDN'
                then
                    'BILL OF SUPPLY - DN'
                else
                    'TAX INVOICE'
            end          as description      : String(20) @title: 'Description'
        from invoice
        where
                documentType is not null
            and documentType !=     ''
        group by
            documentType;

    entity valueListReferenceNumber as
        select distinct invoiceNumber as REFERENCE_NUMBER : String(16) @title: 'Reference Number' from invoice
        where
                invoiceNumber !=     ''
            and invoiceNumber is not null
        group by
            invoiceNumber;

    entity valueListReferenceDate   as
        select distinct invoiceDate as REFERENCE_DATE from invoice
        where
                invoiceDate !=     ''
            and invoiceDate is not null
        group by
            invoiceDate;

    entity valueListOrginalTicket   as
        select distinct ticketNumber as ORIGINAL_TKT : String(15) @title: 'Original Ticket' from invoice
        where
                ticketNumber !=     ''
            and ticketNumber is not null
        group by
            ticketNumber;

    entity valueListB2BORB2C        as
        select distinct sectionType as B2B_B2C : String(10) @title: 'B2B or B2C' from invoice
        where
                sectionType !=     ''
            and sectionType is not null
        group by
            sectionType;


    entity valueListGSTIN           as
        select distinct passengerGSTIN as GSTIN_NO : String(15) @title: 'GSTIN No' from invoice
        where
                passengerGSTIN !=     ''
            and passengerGSTIN is not null
        group by
            passengerGSTIN;

    entity valueListDocumentType    as
        select distinct transactionCode as DOCUMENT_TYPE : String(15) @title: 'Document Type' from invoice
        where
                transactionCode !=     ''
            and transactionCode is not null
        group by
            transactionCode;

    entity valueListSupplierGSTIN   as
        select distinct supplierGSTIN as AI_GSTIN_NO : String(15) @title: 'AI GSTIN No' from invoice
        where
                supplierGSTIN !=     ''
            and supplierGSTIN is not null
        group by
            supplierGSTIN;

    entity valueListIATAOffice      as
        select distinct iataNumber as IATA_OFFICE : String(10) @title: 'IATA Office' from invoice
        where
                iataNumber !=     ''
            and iataNumber is not null
        group by
            iataNumber;

    entity valueListDocumentNumber  as
        select distinct d.primaryDocumentNbr as DOCUMENT_NUMBER : String(32) @title: 'Document Number' from invoiceItems as InvoiceItems
        left outer join invoice as i
            on InvoiceItems.invoice.ID = i.ID
        left outer join documents as d
            on d.ID = i.documentId
        where
                d.primaryDocumentNbr !=     ''
            and d.primaryDocumentNbr is not null
        group by
            d.primaryDocumentNbr;

    entity valueListPassengerName   as
        select distinct passangerName as PAX_NAME : String(10) @title: 'Passenger Name' from invoice
        where
                passangerName !=     ''
            and passangerName is not null
        group by
            passangerName;

    entity valueListRoutingType     as
        select distinct
            routingType        : String(2)  @title: 'Routing Type',
            case
                when
                    routingType = 'I'
                then
                    'International'
                when
                    routingType = 'D'
                then
                    'Domestic'
            end as description : String(15) @title: 'Description'
        from invoice
        where
                routingType is not null
            and routingType !=     ''
        group by
            routingType;

    entity valueListHSNcode         as
        select distinct HSNCode as HSNCode : String(15) @title: 'HSN Code' from invoiceItems
        where
                HSNCode !=     ''
            and HSNCode is not null
        group by
            HSNCode;

    entity valueListTicketClass     as
        select distinct ticketClass as ticketClass : String(10) @title: ' Applicable Class Of Travel' from invoice
        where
                ticketClass !=     ''
            and ticketClass is not null
        group by
            ticketClass;

    entity valueListgstR1Period     as
        select distinct gstR1Period as gstR1Period : String(10) @title: 'GSTR1 Period' from invoice
        where
                gstR1Period !=     ''
            and gstR1Period is not null
        group by
            gstR1Period;

    @Capabilities.FilterRestrictions: { RequiresFilter : true, RequiredProperties: ['gstR1Period'] }
    entity exhaustiveReport         as
        select
            i.documentType                      as TAX_INVOICE_TYPE         : String(20)     @title: 'Tax Invoice Type',
            i.invoiceNumber                     as REFERENCE_NUMBER         : String(16)     @title: 'Reference Number',
            i.invoiceDate                       as REFERENCE_DATE           : Date           @title: 'Reference Date',
            i.transactionCode                   as DOCUMENT_TYPE            : String(20)     @title: 'Document Type',
            d.acquisitionType                   as ACTIVITY                                  @UI.HiddenFilter,
            i.ticketNumber                      as DOCUMENT_NUMBER          : String(15)     @title: 'Document Number',
            i.ticketIssueDate                   as DOCUMENT_DATE            : Date           @title: 'Document Date',
            InvoiceItems.HSNCode                as HSN_CODE,
            i.iataNumber                        as IATA_OFFICE              : String(10)     @title: 'IATA Office',
            i.OriginalDocumentNbr               as ORIGINAL_TKT             : String(15)     @title: 'Original Ticket',
            i.sectionType                       as B2B_B2C                  : String(10)     @title: 'B2B or B2C',
            i.passengerGSTIN                    as GSTIN_NO                 : String(15)     @title: 'GSTIN No',
            i.passangerName                     as PAX_NAME                 : String(255)    @title: 'Passenger Name',
            i.fullRouting                       as SECTOR_JOURNEY                            @UI.HiddenFilter,
            i.issueIndicator                    as issueIndicator           : String(25)     @title: 'Issue Indicator'  @UI.HiddenFilter,
            i.gstR1filingStatus                 as gstR1filingStatus        : String(25)     @title: 'GSTR1 Filing Status',
            i.gstR1Period                       as gstR1Period              : String(6)      @title: 'GSTR1 Period',
            case
                when
                    i.routingType = 'I'
                then
                    'International'
                when
                    i.routingType = 'D'
                then
                    'Domestic'
            end                                 as INTERNATIONAL_DOMESTIC   : String(20),
            i.ticketClass                       as APPLICABLE_CLASS_OF_TRAVEL,
            i.originAirport                     as PLACE_OF_EMBARKATION     : String(3)      @UI.HiddenFilter,
            i.destinationAirport                as PLACE_OF_DISEMBARKATION  : String(3)      @UI.HiddenFilter,
            i.fop                               as FOP_DTLS                                  @UI.HiddenFilter,
            SUBSTRING(
                left(
                    i.passengerGSTIN, 12
                ), 3, 10
            )                                   as PAN_NO                   : String(10)     @UI.HiddenFilter,
            i.transactionCode                   as TRANSACTION_TYPE                          @UI.HiddenFilter,
            InvoiceItems.valueOfService         as BASE_FARE                                 @UI.HiddenFilter,
            d.tax1                              as TAX_1                                     @UI.HiddenFilter,
            d.taxAmount1                        as TAX_AMOUNT_1                              @UI.HiddenFilter,
            d.tax2                              as TAX_2                                     @UI.HiddenFilter,
            d.taxAmount2                        as TAX_AMOUNT_2                              @UI.HiddenFilter,
            d.tax3                              as TAX_3                                     @UI.HiddenFilter,
            d.taxAmount3                        as TAX_AMOUNT_3                              @UI.HiddenFilter,
            d.tax4                              as TAX_4                                     @UI.HiddenFilter,
            d.taxAmount4                        as TAX_AMOUNT_4                              @UI.HiddenFilter,
            d.tax5                              as TAX_5                                     @UI.HiddenFilter,
            d.taxAmount5                        as TAX_AMOUNT_5                              @UI.HiddenFilter,
            d.tax6                              as TAX_6                                     @UI.HiddenFilter,
            d.taxAmount6                        as TAX_AMOUNT_6                              @UI.HiddenFilter,
            d.tax7                              as TAX_7                                     @UI.HiddenFilter,
            d.taxAmount7                        as TAX_AMOUNT_7                              @UI.HiddenFilter,
            d.tax8                              as TAX_8                                     @UI.HiddenFilter,
            d.taxAmount8                        as TAX_AMOUNT_8                              @UI.HiddenFilter,
            d.tax9                              as TAX_9                                     @UI.HiddenFilter,
            d.taxAmount9                        as TAX_AMOUNT_9                              @UI.HiddenFilter,
            d.tax10                             as TAX_10                                    @UI.HiddenFilter,
            d.taxAmount10                       as TAX_AMOUNT_10                             @UI.HiddenFilter,
            d.tax11                             as TAX_11                                    @UI.HiddenFilter,
            d.taxAmount11                       as TAX_AMOUNT_11                             @UI.HiddenFilter,
            d.tax12                             as TAX_12                                    @UI.HiddenFilter,
            d.taxAmount12                       as TAX_AMOUNT_12                             @UI.HiddenFilter,
            d.tax13                             as TAX_13                                    @UI.HiddenFilter,
            d.taxAmount13                       as TAX_AMOUNT_13                             @UI.HiddenFilter,
            d.tax14                             as TAX_14                                    @UI.HiddenFilter,
            d.taxAmount14                       as TAX_AMOUNT_14                             @UI.HiddenFilter,
            d.tax15                             as TAX_15                                    @UI.HiddenFilter,
            d.taxAmount15                       as TAX_AMOUNT_15                             @UI.HiddenFilter,
            d.tax16                             as TAX_16                                    @UI.HiddenFilter,
            d.taxAmount16                       as TAX_AMOUNT_16                             @UI.HiddenFilter,
            d.tax17                             as TAX_17                                    @UI.HiddenFilter,
            d.taxAmount17                       as TAX_AMOUNT_17                             @UI.HiddenFilter,
            d.tax18                             as TAX_18                                    @UI.HiddenFilter,
            d.taxAmount18                       as TAX_AMOUNT_18                             @UI.HiddenFilter,
            d.tax19                             as TAX_19                                    @UI.HiddenFilter,
            d.taxAmount19                       as TAX_AMOUNT_19                             @UI.HiddenFilter,
            d.tax20                             as TAX_20                                    @UI.HiddenFilter,
            d.taxAmount20                       as TAX_AMOUNT_20                             @UI.HiddenFilter,
            d.totalDocumentAmount               as TOTAL_FARE                                @UI.HiddenFilter,
            InvoiceItems.totalTaxableValue      as TOTAL_TAXABLE_VALUE                       @UI.HiddenFilter,
            InvoiceItems.discount               as DISCOUNT                                  @UI.HiddenFilter,
            InvoiceItems.netTaxableValue        as NET_TAXABLE_VALUE                         @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=       'RFND'
                    and i.issueIndicator not like 'REISSUE%'
                then
                    InvoiceItems.collectedCgst
                else
                    0.0
            end                                 as CGST_AMOUNT              : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=       'RFND'
                    and i.issueIndicator not like 'REISSUE%'
                then
                    InvoiceItems.collectedCgstRate
                else
                    0.0
            end                                 as CGST_RATE                : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=       'RFND'
                    and i.issueIndicator not like 'REISSUE%'
                then
                    InvoiceItems.collectedSgst
                else
                    0.0
            end                                 as SGST_AMOUNT              : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=       'RFND'
                    and i.issueIndicator not like 'REISSUE%'
                then
                    InvoiceItems.collectedSgstRate
                else
                    0.0
            end                                 as SGST_RATE                : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=       'RFND'
                    and i.issueIndicator not like 'REISSUE%'
                then
                    InvoiceItems.collectedutgst
                else
                    0.0
            end                                 as UTGST_AMOUNT             : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=       'RFND'
                    and i.issueIndicator not like 'REISSUE%'
                then
                    InvoiceItems.collectedUtgstRate
                else
                    0.0
            end                                 as UTGST_RATE               : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=       'RFND'
                    and i.issueIndicator not like 'REISSUE%'
                then
                    InvoiceItems.collectedIgst
                else
                    0.0
            end                                 as IGST_AMOUNT              : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=       'RFND'
                    and i.issueIndicator not like 'REISSUE%'
                then
                    InvoiceItems.collectedIgstRate
                else
                    0.0
            end                                 as IGST_RATE                : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=       'RFND'
                    and i.issueIndicator not like 'REISSUE%'
                then
                    (
                        InvoiceItems.collectedCgst + InvoiceItems.collectedSgst + InvoiceItems.collectedutgst + InvoiceItems.collectedIgst
                    )
                else
                    0.0
            end                                 as GST_VALUE                : Decimal(14, 2) @UI.HiddenFilter,
            i.supplierGSTIN                     as AI_GSTIN_NO              : String(15)     @title: 'AI GSTIN No',
            sp.stateName                        as PLACE_OF_SUPPLY                           @UI.HiddenFilter,
            sd.stateName                        as LIABILITY_DISCHARGE_STATE                 @UI.HiddenFilter,
            case
                when
                    i.transactionCode = 'RFND'
                then
                    i.transactionCode
                else
                    null
            end                                 as REFUND_SECTOR            : String(20)     @UI.HiddenFilter,
            case
                when
                    i.transactionCode = 'RFND'
                then
                    cast(
                        SUBSTR_REGEXPR(
                            '([0-9]+\.?[0-9]*)' in (
                                COALESCE(
                                    SUBSTR_REGEXPR(
                                        'CP *= *([0-9]+\.?[0-9]*)' in cast(
                                            i.taxableCalculation as           String
                                        )
                                    ), 'CP = 0.00'
                                )
                            )
                        ) as                                                  Decimal(16, 2)
                    )
                else
                    null
            end                                 as CP_CHARGES               : String(255)    @UI.HiddenFilter,
            case
                when
                    i.transactionCode = 'RFND'
                then
                    InvoiceItems.collectedCgst
                else
                    0.0
            end                                 as REFUND_CGST_AMOUNT       : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode = 'RFND'
                then
                    InvoiceItems.collectedCgstRate
                else
                    0.0
            end                                 as REFUND_CGST_RATE         : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode = 'RFND'
                then
                    InvoiceItems.collectedSgst
                else
                    0.0
            end                                 as REFUND_SGST_AMOUNT       : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode = 'RFND'
                then
                    InvoiceItems.collectedSgstRate
                else
                    0.0
            end                                 as REFUND_SGST_RATE         : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode = 'RFND'
                then
                    InvoiceItems.collectedutgst
                else
                    0.0
            end                                 as REFUND_UTGST_AMOUNT      : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode = 'RFND'
                then
                    InvoiceItems.collectedUtgstRate
                else
                    0.0
            end                                 as REFUND_UTGST_RATE        : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode = 'RFND'
                then
                    InvoiceItems.collectedIgst
                else
                    0.0
            end                                 as REFUND_IGST_AMOUNT       : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode = 'RFND'
                then
                    InvoiceItems.collectedIgstRate
                else
                    0.0
            end                                 as REFUND_IGST_RATE         : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode = 'RFND'
                then
                    (
                        InvoiceItems.collectedCgst + InvoiceItems.collectedSgst + InvoiceItems.collectedutgst + InvoiceItems.collectedIgst
                    )
                else
                    0.0
            end                                 as REFUND_GST_AMT           : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=   'RFND'
                    and i.issueIndicator like 'REISSUE%'
                then
                    i.issueIndicator
                else
                    null
            end                                 as REISSUE_SECTOR           : String(20)     @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=   'RFND'
                    and i.issueIndicator like 'REISSUE%'
                then
                    COALESCE(
                        SUBSTR_REGEXPR(
                            'XP *= *([0-9]+\.?[0-9]*)' in cast(
                                i.taxableCalculation as                       String
                            )
                        ), 'XP = 0.00'
                    ) || ',' || COALESCE(
                        SUBSTR_REGEXPR(
                            'OD *= *([0-9]+\.?[0-9]*)' in cast(
                                i.taxableCalculation as                       String
                            )
                        ), 'OD = 0.00'
                    )
                else
                    null
            end                                 as XP_OD_CHARGES            : String(255)    @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=   'RFND'
                    and i.issueIndicator like 'REISSUE%'
                then
                    InvoiceItems.collectedCgst
                else
                    0.0
            end                                 as REISSUE_CGST_AMOUNT      : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=   'RFND'
                    and i.issueIndicator like 'REISSUE%'
                then
                    InvoiceItems.collectedCgstRate
                else
                    0.0
            end                                 as REISSUE_CGST_RATE        : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=   'RFND'
                    and i.issueIndicator like 'REISSUE%'
                then
                    InvoiceItems.collectedSgst
                else
                    0.0
            end                                 as REISSUE_SGST_AMOUNT      : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=   'RFND'
                    and i.issueIndicator like 'REISSUE%'
                then
                    InvoiceItems.collectedSgstRate
                else
                    0.0
            end                                 as REISSUE_SGST_RATE        : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=   'RFND'
                    and i.issueIndicator like 'REISSUE%'
                then
                    InvoiceItems.collectedutgst
                else
                    0.0
            end                                 as REISSUE_UTGST_AMOUNT     : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=   'RFND'
                    and i.issueIndicator like 'REISSUE%'
                then
                    InvoiceItems.collectedUtgstRate
                else
                    0.0
            end                                 as REISSUE_UTGST_RATE       : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=   'RFND'
                    and i.issueIndicator like 'REISSUE%'
                then
                    InvoiceItems.collectedIgst
                else
                    0.0
            end                                 as REISSUE_IGST_AMOUNT      : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=   'RFND'
                    and i.issueIndicator like 'REISSUE%'
                then
                    InvoiceItems.collectedIgstRate
                else
                    0.0
            end                                 as REISSUE_IGST_RATE        : Decimal(14, 2) @UI.HiddenFilter,
            case
                when
                    i.transactionCode    !=   'RFND'
                    and i.issueIndicator like 'REISSUE%'
                then
                    (
                        InvoiceItems.collectedCgst + InvoiceItems.collectedSgst + InvoiceItems.collectedutgst + InvoiceItems.collectedIgst
                    )
                else
                    0.0
            end                                 as REISSUE_GST_AMT          : Decimal(14, 2) @UI.HiddenFilter,
            i.billToFullAddress                 as ADDRESS_OF_THE_CORPORATE : String(255)    @UI.HiddenFilter,
            i.billToStateCode                   as STATE_CODE               : String(3)      @UI.HiddenFilter,
            sc.stateName                        as STATE                    : String(50)     @UI.HiddenFilter,
            case
                when
                    cc.loginEmail is null
                then
                    sbr.GSTEMAIL
                else
                    cc.loginEmail
            end                                 as EMAIL_ID_OF_CORPORATE    : String(255)    @UI.HiddenFilter,
            case
                when
                    cc.mobile is null
                then
                    null
                else
                    cc.mobile
            end                                 as CONTACT_NO_OF_CORPORATE  : String(15)     @UI.HiddenFilter,
            d.endorsementText                   as ENDORSEMENT_DTLS         : String(255)    @UI.HiddenFilter,
            i.xoNo                              as XO_N0_IN_CASE_OF_GOI     : String(16)     @UI.HiddenFilter,
            c.baggageAllowanceWeight            as EXCESS_BAGGAGE_WEIGHT    : Decimal(16, 2) @UI.HiddenFilter,
            c.baggageAllowanceRatePerUnitAmount as EXCESS_BAGGAGE_RATE      : Decimal(16, 2) @UI.HiddenFilter
        from invoiceItems as InvoiceItems
        left outer join invoice as i
            on InvoiceItems.invoice.ID = i.ID
        left outer join documents as d
            on d.ID = i.documentId
        left outer join stateCode as sc
            on sc.stateCode = i.billToStateCode
        left outer join stateCode as sp
            on sp.stateCode = i.placeOfSupply
        left outer join stateCode as sd
            on sd.stateCode = SUBSTRING(
                i.supplierGSTIN, 0, 2
            )
        left outer join coupon as c
            on  c.ID      = d.ID
            and c.company = i.company
            and c.number  = 1
        left outer join (
            (
                select distinct
                    MAX(GSTEmail) as GSTEMAIL,
                    primaryDocumentNbr,
                    PNR
                from sbr
                group by
                    GSTEmail,
                    primaryDocumentNbr,
                    PNR
            )
        ) as sbr
            on  sbr.PNR                = i.PNR
            and sbr.primaryDocumentNbr = i.OriginalDocumentNbr
        left outer join companyGSTINAdresses as cga
            on  cga.gstin                 = passengerGSTIN
            and cga.useForInvoicePrinting = true
        left outer join (
            (
                select
                    cu.loginEmail,
                    cu.mobile,
                    cu.companyId
                from companyUsers as cu
                left outer join companyUserRoles as cur
                    on cur.userId = cu.ID
                where
                    isAdmin = true
            )
        ) as cc
            on cc.companyId = cga.companyId
        where
            i.createdBy not in ('DOC_HISTORY');

    action   exportAll(fields : String) returns String;


// RFISC No of EMD
// UID NO in case of Embassy

// Remarks on ACM/ADM  -> NE
// Remarks on RF7

// NO show charges
// TTL CP CHGS
// charges for travel
// Rebooking chgs


/* Exhaustive Report End */
}
