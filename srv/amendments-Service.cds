using {
    Invoice          as invoice,
    InvoiceItems     as invoiceItems,
    InvoiceDocuments as invoiceDocuments,
    Company          as company,
    AirportCodes     as airportCode,
    AgentMaster      as agentMaster,
    StateCodes       as stateCodes,
    FOP              as fop,
    TaxCodes         as taxCodes,
    TransactionTypes as transactionTypes
} from '../db/schema';

type Amendments {
    ID : String(36);
}

// type Invoices {
//     ID : String(36);
// }

service AmendmentService @(path: '/amendment') {
    // entity Invoice          as projection on invoice;
    entity InvoiceItems                  as projection on invoiceItems;
    entity InvoiceDocuments              as projection on invoiceDocuments;
    entity Company                       as projection on company;
    entity AirportCodes                  as projection on airportCode;
    entity StateCodes                    as projection on stateCodes;
    entity TaxCodes                      as projection on taxCodes;
    entity TransactionTypes              as projection on transactionTypes;
    entity FOP                           as projection on fop;
    action   downloadInvoice(invoices : array of Amendments)                  returns String;
    function getCSRFToken()                                                   returns String;

    entity valueListCompany              as
        select distinct company as Company from invoice
        where
                company          is not null
            and isAmended        =      true
            and amendementStatus in     (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        group by
            company;

    entity valueListPNR                  as
        select distinct PNR from invoice
        where
                PNR              is not null
            and isAmended        =      true
            and amendementStatus in     (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        group by
            PNR;

    entity valueListTicketNumber         as
        select distinct ticketNumber from invoice
        where
                ticketNumber     is not null
            and isAmended        =      true
            and amendementStatus in     (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        group by
            ticketNumber;

    entity valueListSupplierGSTIN        as
        select distinct supplierGSTIN from invoice
        where
                supplierGSTIN    is not null
            and isAmended        =      true
            and amendementStatus in     (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        group by
            supplierGSTIN;

    entity valueListPassengerGSTIN       as
        select distinct passengerGSTIN from invoice
        where
                passengerGSTIN   is not null
            and isAmended        =      true
            and amendementStatus in     (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        group by
            passengerGSTIN;

    entity valueListInvoiceNumber        as
        select distinct invoiceNumber from invoice
        where
                invoiceNumber    is not null
            and isAmended        =      true
            and amendementStatus in     (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        group by
            invoiceNumber;

    entity valueListInvoiceStatus        as
        select distinct invoiceStatus from invoice
        where
                invoiceStatus    is not null
            and isAmended        =      true
            and amendementStatus in     (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        group by
            invoiceStatus;

    entity valueListIataNumber           as
        select distinct
            i.iataNumber : String(10)  @title: 'IATA Number',
            a.legalName  : String(255) @title: 'Legal Name'
        from invoice as i
        inner join agentMaster as a
            on a.iataNumber = i.iataNumber
        where
                i.iataNumber     is not null
            and isAmended        =      true
            and amendementStatus in     (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        group by
            i.iataNumber,
            a.legalName;

    entity valueListDocumentType         as
        select distinct
            documentType,
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
            end as description : String(20) @title: 'Description'
        from invoice
        where
                documentType     is not null
            and isAmended        =      true
            and amendementStatus in     (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        group by
            documentType;

    entity valueListSectionType          as
        select distinct sectionType from invoice
        where
                sectionType      is not null
            and isAmended        =      true
            and amendementStatus in     (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        group by
            sectionType;

    entity valueListIssueIndicator       as
        select distinct issueIndicator : String(2) @title: 'Issue Indicator' from invoice
        where
                issueIndicator   is not null
            and isAmended        =      true
            and amendementStatus in     (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        group by
            issueIndicator;

    entity valueListRoutingType          as
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
                routingType      is not null
            and isAmended        =      true
            and amendementStatus in     (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        group by
            routingType;

    entity valueListAmendmentRequestNo   as
        select distinct amendmentRequestNo : String(2) @title: 'Request No.' from invoice
        where
                amendmentRequestNo is not null
            and isAmended          =      true
            and amendementStatus   in     (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        group by
            amendmentRequestNo;

    entity valueListAmendmentRequestedBy as
        select distinct amendmentRequestedBy : String(2) @title: 'Requested By' from invoice
        where
                amendmentRequestedBy is not null
            and isAmended            =      true
            and amendementStatus     in     (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        group by
            amendmentRequestedBy;

    entity valueListAmendmentRequestedOn as
        select distinct amendmentRequestedOn : String(2) @title: 'Requested On' from invoice
        where
                amendmentRequestedOn is not null
            and isAmended            =      true
            and amendementStatus     in     (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        group by
            amendmentRequestedOn;

    entity valueListPassengerName        as
        select distinct passangerName : String(255) @title: 'Passenger Name' from invoice
        where
                passangerName    is not null
            and passangerName    !=     ''
            and isAmended        =      true
            and amendementStatus in     (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        group by
            passangerName;

    entity valueListTransactionType      as
        select distinct
            transactionCode : String(10) @title: 'Transaction Type',
            transactionText : String(50) @title: 'Description'
        from invoice
        left outer join TransactionTypes as t
            on t.transactionType = transactionCode
        where
                transactionCode  is not null
            and transactionCode  !=     ''
            and isAmended        =      true
            and amendementStatus in     (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        group by
            transactionCode,
            transactionText;

    @cds.redirection.target
    entity Invoice                       as
        select from invoice {
            ID                                     @UI.HiddenFilter @UI.Hidden,
            company,
            documentId                             @UI.HiddenFilter,
            PNR,
            ticketNumber,
            supplierGSTIN,
            passengerGSTIN,
            ticketIssueDate,
            invoiceDate,
            invoiceNumber,
            documentType,
            transactionCode,
            transactionType                        @UI.HiddenFilter,
            ticketType                             @UI.HiddenFilter,
            sectionType,
            ticketClass                            @UI.HiddenFilter,
            eindia                                 @UI.HiddenFilter,
            exemptedZone                           @UI.HiddenFilter,
            b2b                                    @UI.HiddenFilter,
            IsSEZ                                  @UI.HiddenFilter,
            intrastate                             @UI.HiddenFilter,
            isUT                                   @UI.HiddenFilter,
            taxCode                                @UI.HiddenFilter,
            iataNumber,
            gstR1Period                            @UI.HiddenFilter,
            gstR1filingStatus                      @UI.HiddenFilter,
            originalInvoiceNumber                  @UI.HiddenFilter,
            orginalInvoiceDate                     @UI.HiddenFilter,
            originalGstin                          @UI.HiddenFilter,
            originalSectionType                    @UI.HiddenFilter,
            issueIndicator,
            case
                when
                    routingType = 'I'
                then
                    'International'
                when
                    routingType = 'D'
                then
                    'Domestic'
            end as routingType        : String(20),
            fullRouting                            @UI.HiddenFilter,
            oneWayIndicator                        @UI.HiddenFilter,
            case
                when
                    directionIndicator = 'I'
                then
                    'Inward'
                when
                    directionIndicator = 'O'
                then
                    'Onward'
            end as directionIndicator : String(20) @UI.HiddenFilter,
            placeOfSupply                          @UI.HiddenFilter,
            taxableCalculation                     @UI.HiddenFilter,
            discountTaxableCalculation             @UI.HiddenFilter,
            netTaxableValue                        @UI.HiddenFilter,
            totalTax                               @UI.HiddenFilter,
            totalInvoiceAmount                     @UI.HiddenFilter,
            documentCurrency                       @UI.HiddenFilter,
            xoNo                                   @UI.HiddenFilter,
            totalJourney                           @UI.HiddenFilter,
            journeyCovered                         @UI.HiddenFilter,
            fop                                    @UI.HiddenFilter,
            billToName                             @UI.HiddenFilter,
            billToFullAddress                      @UI.HiddenFilter,
            billToCountry                          @UI.HiddenFilter,
            billToStateCode                        @UI.HiddenFilter,
            billToPostalCode                       @UI.HiddenFilter,
            invoiceStatus                          @UI.HiddenFilter,
            isReverseChargeApplicable              @UI.HiddenFilter,
            SBRRecivedOn                           @UI.HiddenFilter,
            SBRProcessedOn                         @UI.HiddenFilter,
            airportCode                            @UI.HiddenFilter,
            OriginalDocumentNbr                    @UI.HiddenFilter,
            amendmentRequestNo,
            amendmentRequestedBy,
            amendmentRequestedOn,
            amendmentReason                        @UI.HiddenFilter,
            amendmentApprovedOn                    @UI.HiddenFilter,
            amendmentApprovedBy                    @UI.HiddenFilter,
            amendentedAddress                      @UI.HiddenFilter,
            amendementOldValue                     @UI.HiddenFilter,
            amendementNewValue                     @UI.HiddenFilter,
            passangerName,
            InvoiceItems,
            InvoiceDocuments,
            AirportCodes,
            Company,
            CompanyGSTINAdresses,
            FOP,
            StateCodes,
            TaxCodes,
            TransactionTypes,
            case
                when
                    amendementStatus = 'Y'
                then
                    'Pending'
                when
                    amendementStatus = 'AF'
                then
                    'Pending'
                when
                    amendementStatus = 'AA'
                then
                    'Approved'
                when
                    amendementStatus = 'AR'
                then
                    'Rejected'
                when
                    amendementStatus = 'RY'
                then
                    'Rejected'
                when
                    amendementStatus = 'AY'
                then
                    'Approved'
            end as amendementStatus   : String(15) @UI.HiddenFilter,
            case
                when
                    amendementStatus = 'Y'
                then
                    2
                when
                    amendementStatus = 'AF'
                then
                    2
                when
                    amendementStatus = 'AA'
                then
                    3
                when
                    amendementStatus = 'AR'
                then
                    1
                when
                    amendementStatus = 'RY'
                then
                    1
                when
                    amendementStatus = 'AY'
                then
                    3
            end as criticality        : Integer    @title: 'Status Name'  @UI.HiddenFilter,
            reasonForMemoCode                      @UI.HiddenFilter
        }
        where
                isAmended        =  true
            and amendementStatus in (
                'Y', 'AF', 'AA', 'AR', 'AY', 'RY'
            )
        actions {
            // @(
            //     cds.odata.bindingparameter.name: '_it',
            //     Common.SideEffects             : {TargetProperties: ['_it/amendementStatus']}
            // )
            // action approveAmendment() returns String;

            // @(
            //     cds.odata.bindingparameter.name: '_it',
            //     Common.SideEffects             : {TargetProperties: ['_it/amendementStatus']}
            // )

            action rejectAmendment( @(title:'Rejection Reason') reason : String);
        // action downloadInvoice() returns String;
        }

    action   approveAmendment(invoices : array of Amendments)                 returns String;
    action   rejectAmendment(invoices : array of Amendments, reason : String) returns String;

    entity pendingForApproval            as
        select * from invoice
        where
            amendementStatus in (
                'Y', 'AF'
            );
}
