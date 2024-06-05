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

// type Amendments {
//     ID : String(36);
// }

service AmendmentRequestService @(path: '/amendmentrequest') {
    entity InvoiceItems             as projection on invoiceItems;
    entity InvoiceDocuments         as projection on invoiceDocuments;
    entity Company                  as projection on company;
    entity AirportCodes             as projection on airportCode;
    entity StateCodes               as projection on stateCodes;
    entity TaxCodes                 as projection on taxCodes;
    entity TransactionTypes         as projection on transactionTypes;
    entity FOP                      as projection on fop;

    entity valueListCompany         as
        select distinct company as Company from invoice
        where
                company   is not null
            and isAmended =      false
        group by
            company;

    entity valueListPNR             as
        select distinct PNR from invoice
        where
                PNR       is not null
            and isAmended =      false
        group by
            PNR;

    entity valueListTicketNumber    as
        select distinct ticketNumber from invoice
        where
                ticketNumber is not null
            and isAmended    =      false
        group by
            ticketNumber;

    entity valueListSupplierGSTIN   as
        select distinct supplierGSTIN from invoice
        where
                supplierGSTIN is not null
            and isAmended     =      false
        group by
            supplierGSTIN;

    entity valueListPassengerGSTIN  as
        select distinct passengerGSTIN from invoice
        where
                passengerGSTIN is not null
            and isAmended      =      false
        group by
            passengerGSTIN;

    entity valueListTicketIssueDate as
        select distinct ticketIssueDate from invoice
        where
                ticketIssueDate is not null
            and isAmended       =      false
        group by
            ticketIssueDate;

    entity valueListInvoiceDate     as
        select distinct invoiceDate from invoice
        where
                invoiceDate is not null
            and isAmended   =      false
        group by
            invoiceDate;

    entity valueListInvoiceNumber   as
        select distinct invoiceNumber from invoice
        where
                invoiceNumber is not null
            and isAmended     =      false
        group by
            invoiceNumber;

    entity valueListInvoiceStatus   as
        select distinct invoiceStatus from invoice
        where
                invoiceStatus is not null
            and isAmended     =      false
        group by
            invoiceStatus;

    entity valueListIataNumber      as
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

    entity valueListDocumentType    as
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
            and isAmended    =      false
        group by
            documentType;

    entity valueListTicketType      as
        select distinct
            ticketType,
            case
                when
                    ticketType = '01'
                then
                    'TICKET'
                when
                    ticketType = '02'
                then
                    'EMDA'
                when
                    ticketType = '03'
                then
                    'EMDS'
                when
                    ticketType = '04'
                then
                    '04'
            end as Description : String(10)
        from invoice
        where
                ticketType is not null
            and isAmended  =      false
        group by
            ticketType;

    entity valueListSectionType     as
        select distinct sectionType from invoice
        where
                sectionType is not null
            and isAmended   =      false
        group by
            sectionType;

    entity valueListIssueIndicator  as
        select distinct issueIndicator : String(2) @title: 'Issue Indicator' from invoice
        where
                issueIndicator is not null
            and isAmended      =      false
        group by
            issueIndicator;

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
            and isAmended   =      false
        group by
            routingType;

    entity valueListBuyerName       as
        select distinct billToName : String(2) @title: 'Buyer Name' from invoice
        where
                billToName is not null
            and billToName !=     ''
            and isAmended  =      false
        group by
            billToName;

    entity valueListPassengerName   as
        select distinct passangerName : String(255) @title: 'Passenger Name' from invoice
        where
                passangerName is not null
            and passangerName !=     ''
            and isAmended     =      false
        group by
            passangerName;

    entity valueListTransactionType as
        select distinct
            transactionCode : String(10) @title: 'Transaction Type',
            transactionText : String(50) @title: 'Description'
        from invoice
        left outer join TransactionTypes as t
            on t.transactionType = transactionCode
        where
                transactionCode is not null
            and transactionCode !=     ''
            and isAmended       =      false
        group by
            transactionCode,
            transactionText;

    @cds.redirection.target
    entity Invoice                  as
        select from invoice {
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
            netTaxableValue                        @UI.HiddenFilter,
            totalTax                               @UI.HiddenFilter,
            totalInvoiceAmount                     @UI.HiddenFilter,
            documentCurrency                       @UI.HiddenFilter,
            totalJourney                           @UI.HiddenFilter,
            journeyCovered                         @UI.HiddenFilter,
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
            transactionType                        @UI.HiddenFilter,
            nonTaxableCalculation                  @UI.HiddenFilter,
            reasonForMemoCode                      @UI.HiddenFilter,
            passangerName,
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
        where
            isAmended = false;

    action   requestAmendment(reqType : String(20), invNo : String(16), invoiceId : UUID, reason : String(255), newAddress : String(255), gstinNumber : String(15)) returns String;
    action   requestBulkAmendment(reqFile : LargeString)                                                                                                            returns LargeString;
    function downloadExcel()                                                                                                                                        returns LargeString;
    function getCSRFToken()                                                                                                                                         returns String;
    entity ReportGenerator          as projection on reportGenerator;
    action   exportAll(fields : String)                                                                                                                             returns String;
};
