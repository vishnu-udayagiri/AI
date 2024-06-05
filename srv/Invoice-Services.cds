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
    TransactionTypes as transactionTypes,
    ReportGenerator  as reportGenerator
} from '../db/schema';

type Invoices {
    ID : String(36);
}

service InvoiceService @(path: '/invoice') {
    entity InvoiceItems               as projection on invoiceItems;
    entity InvoiceDocuments           as projection on invoiceDocuments;
    entity Company                    as projection on company;
    entity AirportCodes               as projection on airportCode;
    entity StateCodes                 as projection on stateCodes;
    entity TaxCodes                   as projection on taxCodes;
    entity TransactionTypes           as projection on transactionTypes;
    entity FOP                        as projection on fop;
    entity ReportGenerator            as projection on reportGenerator;
    action   downloadInvoice(invoices : array of Invoices) returns String;
    function getCSRFToken()                                returns String;

    entity valueListCompany           as
        select distinct company as Company from invoice
        where
                company is not null
            and company !=     ''
        group by
            company;

    entity valueListPNR               as
        select distinct PNR from invoice
        where
                PNR is not null
            and PNR !=     ''
        group by
            PNR;

    entity valueListTicketNumber      as
        select distinct ticketNumber : String(15) @title: 'Ticket Number' from invoice
        where
                ticketNumber is not null
            and ticketNumber !=     ''
        group by
            ticketNumber;

    entity valueListSupplierGSTIN     as
        select distinct supplierGSTIN : String(15) @title: 'Supplier GSTIN' from invoice
        where
                supplierGSTIN is not null
            and supplierGSTIN !=     ''
        group by
            supplierGSTIN;

    entity valueListPassengerGSTIN    as
        select distinct passengerGSTIN : String(15) @title: 'Passenger GSTIN' from invoice
        where
                passengerGSTIN is not null
            and passengerGSTIN !=     ''
        group by
            passengerGSTIN;

    entity valueListInvoiceNumber     as
        select distinct invoiceNumber : String(16) @title: 'Invoice Number' from invoice
        where
                invoiceNumber is not null
            and invoiceNumber !=     ''
        group by
            invoiceNumber;

    entity valueListInvoiceStatus     as
        select distinct invoiceStatus : String(1) @title: 'Invoice Status' from invoice
        where
                invoiceStatus is not null
            and invoiceStatus !=     ''
        group by
            invoiceStatus;

    entity valueListIataNumber        as
        select distinct
            i.iataNumber : String(10)  @title: 'IATA Number',
            a.legalName  : String(255) @title: 'Legal Name'
        from invoice as i
        inner join agentMaster as a
            on a.iataNumber = i.iataNumber
        where
                i.iataNumber is not null
            and i.iataNumber !=     ''
        group by
            i.iataNumber,
            a.legalName;

    entity valueListDocumentType      as
        select distinct
            documentType       : String(20) @title: 'Document Type',
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
                documentType is not null
            and documentType !=     ''
        group by
            documentType;

    entity valueListTransactionType   as
        select distinct
            transactionCode : String(10) @title: 'Transaction Code',
            transactionText : String(50) @title: 'Description'
        from invoice
        left outer join TransactionTypes as t
            on t.transactionType = transactionCode
        where
                transactionCode is not null
            and transactionCode !=     ''
        group by
            transactionCode,
            transactionText;

    entity valueListSectionType       as
        select distinct sectionType : String(2) @title: 'Section Type' from invoice
        where
                sectionType is not null
            and sectionType !=     ''
        group by
            sectionType;

    entity valueListIssueIndicator    as
        select distinct issueIndicator : String(2) @title: 'Issue Indicator' from invoice
        where
                issueIndicator is not null
            and issueIndicator !=     ''
        group by
            issueIndicator;

    entity valueListRoutingType       as
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

    entity valueListBuyerName         as
        select distinct billToName : String(2) @title: 'Buyer Name' from invoice
        where
                billToName is not null
            and billToName !=     ''
        group by
            billToName;

    entity valueListPassengerName     as
        select distinct passangerName : String(255) @title: 'Passenger Name' from invoice
        where
                passangerName is not null
            and passangerName !=     ''
        group by
            passangerName;

    entity valueListConjunctiveNumber as
        select distinct refDocNbr : String(256) @title: 'Conjunctive Ticket' from invoice
        where
                refDocNbr is not null
            and refDocNbr !=     ''
        group by
            refDocNbr;

    entity valueListRFISC             as
        select distinct reasonForIssuanceCode : String(256)
        @title: 'RFISC' from invoice
        where
                reasonForIssuanceCode is not null
            and reasonForIssuanceCode !=     ''
        group by
            reasonForIssuanceCode;



    @cds.redirection.target
    entity Invoice                    as
        projection on invoice {
            ID                                     @UI.HiddenFilter,
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
            eindia                                 @UI.Hidden @UI.HiddenFilter,
            exemptedZone                           @UI.Hidden @UI.HiddenFilter,
            b2b                                    @UI.Hidden @UI.HiddenFilter,
            IsSEZ                                  @UI.Hidden @UI.HiddenFilter,
            intrastate                             @UI.Hidden @UI.HiddenFilter,
            isUT                                   @UI.Hidden @UI.HiddenFilter,
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
            placeOfSupply                          @UI.Hidden @UI.HiddenFilter,
            taxableCalculation                     @UI.HiddenFilter,
            discountTaxableCalculation             @UI.HiddenFilter,
            nonTaxableCalculation                  @UI.HiddenFilter,
            netTaxableValue                        @UI.HiddenFilter,
            totalTax                               @UI.HiddenFilter,
            totalInvoiceAmount                     @UI.HiddenFilter,
            documentCurrency                       @UI.HiddenFilter,
            totalJourney                           @UI.HiddenFilter,
            journeyCovered                         @UI.Hidden @UI.HiddenFilter,
            fop                                    @UI.HiddenFilter,
            billToName,
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
            reasonForMemoCode                      @UI.HiddenFilter,
            passangerName,
            refDocNbr,
            reasonForIssuanceCode     : String(10) @title: 'RFISC',
            InvoiceItems,
            InvoiceDocuments,
            AirportCodes,
            Company,
            CompanyGSTINAdresses,
            FOP,
            StateCodes,
            TaxCodes,
            TransactionTypes
        }
        actions {
            action downloadInvoice() returns String;
        };

    action   invoiceBulkDownload(reqData : String)         returns String;

}
