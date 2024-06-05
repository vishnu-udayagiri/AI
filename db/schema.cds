using {
    managed,
    cuid,
    Country,
    Currency
} from '@sap/cds/common';

//using from '@sap/cds-common-content';

entity TransactionTypes {
    key transactionType : String(10)                  @title: 'Transaction Code';
        transactionText : String(50)                  @title: 'Transaction text'  @UI.HiddenFilter;
        hsn             : String(8)                   @title: 'HSN'               @UI.HiddenFilter;
        hsnText         : String(120)                 @title: 'HSN Text'          @UI.HiddenFilter;
        taxCode         : type of TaxCodes : taxCode  @title: 'Tax Code'          @UI.Hidden  @UI.HiddenFilter;
        TaxCodes        : Association to TaxCodes
                              on TaxCodes.taxCode = taxCode;
}

entity TaxCodes {
    key company        : type of Company : code @title: 'Company';
    key taxCode        : String(3)              @title: 'Tax Code';
        taxDescription : String(50)             @title: 'Description';
        Company        : Association to Company
                             on Company.code = company;
}

entity TaxCompositions {
    key taxType : String(5)   @title: 'Tax Type';
        taxText : String(50)  @title: 'Tax Text'  @UI.HiddenFilter;
}

entity TaxRates {
    key taxCode         : type of TaxCodes : taxCode        @title: 'Tax Code';
        TaxCodes        : Association to TaxCodes
                              on TaxCodes.taxCode = taxCode;
    key taxType         : type of TaxCompositions : taxType @title: 'Tax Type';
        TaxCompositions : Association to TaxCompositions
                              on TaxCompositions.taxType = taxType;
    key validFrom       : Date                              @title: 'Valid From'  @UI.HiddenFilter;
        validTo         : Date                              @title: 'Valid To'    @UI.HiddenFilter;
        rate            : Decimal(5, 2) default 0.0         @title: 'Rate'        @UI.HiddenFilter;
        taxBase         : String(50)                        @title: 'Tax Base'    @UI.HiddenFilter;
}

entity TaxRules {
    key company      : type of Company : code     @title: 'Company';
    key ticketClass  : String(3)                  @title: 'Ticket Class'     @UI.HiddenFilter;
    key eindia       : String(1)                  @title: 'E-India'          @UI.HiddenFilter  @assert.range: [
            0,
            1
        ];
    key exemptedZone : String(1)                  @title: 'Exempted Zone'    @UI.HiddenFilter  @assert.range: [
            0,
            1
        ];
    key b2b          : String(1)                  @title: 'B2B'              @UI.HiddenFilter  @assert.range: [
            0,
            1
        ];
    key IsSEZ        : String(1)                  @title: 'Is Sez'           @UI.HiddenFilter  @assert.range: [
            0,
            1
        ];
    key intrastate   : String(1)                  @title: 'Intra State'      @UI.HiddenFilter  @assert.range: [
            0,
            1
        ];
    key isUT         : String(1)                  @title: 'Union Territory'  @UI.HiddenFilter  @assert.range: [
            0,
            1
        ];
    key validFrom    : Date default '1900-01-01'  @title: 'Valid From'       @UI.HiddenFilter;
        validTo      : Date default '9999-12-31'  @title: 'Valid To'         @UI.HiddenFilter;
        taxCode      : type of TaxCodes : taxCode @title: 'Tax Code';
        TaxCodes     : Association to TaxCodes
                           on TaxCodes.taxCode = taxCode;

        @readonly
        ruleId       : String(10)                 @title: 'Rule Id'          @UI.HiddenFilter;
        ruleText     : String(255)                @title: 'Rule Text'        @UI.HiddenFilter;
        Company      : Association to Company
                           on Company.code = company;
}

entity StateCodes {
    key stateCode : String(2)   @title: 'Code'     @readonly;
        stateName : String(50)  @title: 'State'    @readonly  @UI.HiddenFilter;
        country   : Country     @title: 'Country'  @readonly  @UI.HiddenFilter;
        region    : String(10)  @title: 'Region'   @UI.HiddenFilter;
}

entity GstExemptedZones {
    key stateCode       : type of StateCodes : stateCode @title: 'State';
        StateCodes      : Association to StateCodes
                              on StateCodes.stateCode = stateCode;
    key ValidFrom       : Date                           @title: 'Valid From';
        ValidTo         : Date                           @title: 'Valid To';
        GstExemptedZone : String(1)                      @title: 'Gst Exempted Zone';
}

entity StateMapping {
    key CompCode         : String(4)                      @title: 'Company';
    key stateCode        : type of StateCodes : stateCode @title: 'State';
        StateCodes       : Association to StateCodes
                               on StateCodes.stateCode = stateCode;
    key ValidFrom        : Date                           @title: 'Valid From';
        ValidTo          : Date                           @title: 'Valid To';
        SAPbusinessPlace : String(4)                      @title: 'SAP Business Place';
        profitCenter     : String(10)                     @title: 'Profit Center ';
        SAPIgstGl        : String(10)                     @title: 'SAP IGST GL';
        SAPCgstGl        : String(10)                     @title: 'SAP CGST GL';
        SAPSgstGl        : String(10)                     @title: 'SAP SGST GL';
}

entity AirportCodes {
    key airportCode    : String(4)                                  @title: 'Airport Code';
    key company        : type of Company : code                     @title: 'Company'                     @UI.HiddenFilter;
        isDomestic     : Boolean default false                      @title: 'Is Domestic'                 @UI.Hidden  @UI.HiddenFilter;
        isUT           : Boolean default false                      @title: 'Is UT'                       @UI.HiddenFilter;
        region         : String(10)                                 @title: 'Region'                      @UI.Hidden  @UI.HiddenFilter;
        stateCode      : type of StateCodes : stateCode             @title: 'State Code';
        city           : String(255)                                @title: 'City'                        @UI.HiddenFilter;
        businessPlace  : String(4)                                  @title: 'Business Place'              @UI.Hidden  @UI.HiddenFilter;
        StateCodes     : Association to StateCodes
                             on StateCodes.stateCode = stateCode;
        gstin          : type of GSTIN : gstin                      @title: 'GSTIN'                       @UI.HiddenFilter;
        Gstins         : Association to GSTIN
                             on Gstins.gstin = gstin;
        exemptedZone   : type of GstExemptedZones : GstExemptedZone @title: 'Exempted or not';
        address        : String(255)                                @title: 'Primary Address'             @UI.HiddenFilter;
        usedForInvoice : type of gstinAddress : address             @title: 'Address used for invoicing'  @UI.HiddenFilter;
        Company        : Association to Company
                             on Company.code = company;
}

entity RFISC {
    key RFISC            : String(3)   @title: 'RFISC';
        RFISCDescription : String(50)  @title: 'RFISC Description'  @UI.HiddenFilter;
        HSNCode          : String(3)   @title: 'HSN Code';
        HSNDescription   : String(50)  @title: 'HSN Description'    @UI.HiddenFilter;
}

entity FOP {
    key FOP             : String(13)             @title: 'FOP';
        FOPDescription  : String(255)            @title: 'Description'     @UI.HiddenFilter;
        isGSTApplicable : Boolean default false  @title: 'GST Applicable'  @UI.HiddenFilter;
}

entity GSTIN {
    key gstin        : String(15);
        status       : String(20);
        taxpayertype : String(50);
        validatedOn  : Date;
        blockStatus  : String(2);
        dtReg        : Date;
        dtDReg       : Date;
        legalName    : String(255);
        tradeName    : String(255);
        address      : String(510);
        postalCode   : String(6);
        stateCode    : String(2);
}

entity Company {
    key code        : String(4);
        description : String(50);
}

entity Tolerances : managed {
    key company       : type of Company : code;
    key dateFrom      : Date;
        dateTill      : Date;
        toleranceType : String(1);
        positiveTol   : Decimal(5, 2);
        negativeTol   : Decimal(5, 2);
        Company       : Association to Company
                            on Company.code = company
}

entity CategoryMaster {
    key code        : String(3)  @readonly;
        description : String(50) @readonly;
        isAgent     : Boolean default false;
}

entity DocumentCategory {
    key documentTypeCode : String(5)              @title: 'Document Type Code';
        documentName     : String(120)            @UI.HiddenFilter  @title: 'Document Name';
        description      : String(100)            @UI.HiddenFilter  @title: 'Document Type Description';
        isMandatory      : Boolean default false  @UI.HiddenFilter  @title: 'Is Mandatory ';
}

entity FeeCodes {
    key company        : String(4)   @title: 'Company'          @UI.HiddenFilter;
    key feeCode        : String(5)   @title: 'Fee Code';
    key ValidFrom      : Date        @title: 'Valid From';
        ValidTo        : Date        @title: 'Valid To'         @UI.HiddenFilter  default '9999-12-31';
        feeDescription : String(40)  @title: 'Fee Description'  @UI.HiddenFilter;
        taxableFactor  : Integer     @title: 'Taxable Factor'   @UI.HiddenFilter;
        taxComponent   : Integer     @title: 'Tax Component'    @UI.HiddenFilter;
        taxInclusive   : Integer     @title: 'Tax Inclusive'    @UI.HiddenFilter;
        invoiceFactor  : Integer     @title: 'Invoice Factor'   @UI.HiddenFilter;
        Company        : Association to Company
                             on Company.code = company;
}

entity ReturnTravelSplits {
    key company         : String(4);
    key RoutingType     : String(1);
    key OnewayIndicator : String(1);
    key InvoiceSplitNo  : String(1);
    key ValidFrom       : Date;
        ValidTo         : Date;
        Remarks         : String(100);
}

entity BookingClass {
    key company       : String(4);
    key BookingClass  : String(1);
        Cabin         : String(1) not null;
        Rank          : String(2) not null;
        CabinForRules : String(1) not null;
        Description   : String(25);
}

entity EMDRFISC {
    key company               : String(4)              @title: 'Company'                   @UI.HiddenFilter;
    key code                  : String(1)              @title: 'RFIC'                      @UI.HiddenFilter;
    key RFISC                 : String(3)              @title: 'RFISC';
        serviceType           : String(4)              @title: 'Service Type'              @UI.HiddenFilter;
        serviceCode           : String(4)              @title: 'Service Code'              @UI.HiddenFilter;
        isAssociated          : Boolean default false  @title: 'Associated'                @UI.HiddenFilter;
        RFISCDescription      : String(255)            @title: 'RFISC Description'         @UI.HiddenFilter;
        remarks               : String(255)            @title: 'Remarks'                   @UI.HiddenFilter;
        comments              : String(255)            @title: 'Comments'                  @UI.HiddenFilter;
        routingInfo           : String(1)              @title: 'Routing Info'              @UI.HiddenFilter  @assert.range  enum {
            N;
            Y;
        };
        baggageInfo           : String(1)              @title: 'Baggage Info'              @UI.HiddenFilter  @assert.range  enum {
            N;
            Y;
        };
        withInfo              : String(1)              @title: 'With Info'                 @UI.HiddenFilter;
        limitEMDCoupon        : String(1)              @title: 'Limit EMD Coupon'          @UI.HiddenFilter  @assert.range  enum {
            N;
            Y;
        };
        refundable            : String(1)              @title: 'Non-Refundable'            @UI.HiddenFilter  @assert.range  enum {
            N;
            Y;
        };
        exchangeable          : String(1)              @title: 'Non-Exchangeable'          @UI.HiddenFilter  @assert.range  enum {
            N;
            Y;
        };
        interlineable         : String(1)              @title: 'Non-Interlineable'         @UI.HiddenFilter  @assert.range  enum {
            N;
            Y;
        };
        endorsable            : String(1)              @title: 'Non-Endorsable'            @UI.HiddenFilter  @assert.range  enum {
            N;
            Y;
        };
        consumedAtIssuance    : String(1)              @title: 'Consumed at Issuance'      @UI.HiddenFilter  @assert.range  enum {
            N;
            Y;
        };
        restrictAssociation   : String(1)              @title: 'Restrict Association'      @UI.HiddenFilter  @assert.range  enum {
            N;
            Y;
        };
        addlDocument          : String(1)              @title: 'Additional Document'       @UI.HiddenFilter  @assert.range  enum {
            N;
            Y;
        };
        residualValue         : String(1)              @title: 'Residual Value'            @UI.HiddenFilter  @assert.range  enum {
            N;
            Y;
        };
        notIssuableByAgent    : String(1)              @title: 'Not Issuable By Agent'     @UI.HiddenFilter  @assert.range  enum {
            N;
            Y;
        };
        restrictDisplayAgent  : String(1)              @title: 'Restrict Display Agent'    @UI.HiddenFilter  @assert.range  enum {
            N;
            Y;
        };
        restrictFollowupAgent : String(1)              @title: 'Restrict Follow-up Agent'  @UI.HiddenFilter  @assert.range  enum {
            N;
            Y;
        };
        GLCode                : String(10)             @title: 'GL Code'                   @UI.HiddenFilter;
        GLCodeRemarks         : String(255)            @title: 'GL Code'                   @UI.HiddenFilter;
        GLDescription         : String(255)            @title: 'GL Description'            @UI.HiddenFilter;

        routedFSA             : String(1)              @title: 'Routed FSA'                @UI.HiddenFilter  @assert.range  enum {
            N;
            Y;
        };
        GSTApplicable         : Boolean default false  @title: 'GST Applicable'            @UI.HiddenFilter;
        GSTApplicableRemarks  : String(255)            @title: 'GST Applicable Remarks'    @UI.HiddenFilter;
        isComposite           : Boolean default false  @title: 'Composite'                 @UI.HiddenFilter;
        GSTRateRemarks        : String(255)            @title: 'GST Rate Remarks '         @UI.HiddenFilter;
        // isCabinDependent      : Boolean default false  @title: 'Cabin Dependent'           @UI.HiddenFilter;
        linkedToTaxcode       : Boolean default false  @title: 'Linked to Tax Code'        @UI.HiddenFilter;
        taxCodeRemarks        : String(255)            @title: 'Tax Code Remarks '         @UI.HiddenFilter;
        // isAirportSpecific     : Boolean default false  @title: 'Airport Specific'          @UI.HiddenFilter;
        docType               : String(1)              @title: 'Document Type'             @UI.HiddenFilter;
        HSN                   : String(8)              @title: 'HSN'                       @UI.HiddenFilter;

        Company               : Association to Company
                                    on Company.code = company;
}


entity EMDRules {
    key company      : String(4)                  @title: 'Company'        @UI.HiddenFilter;
    key code         : String(1)                  @title: 'Code'           @UI.HiddenFilter;
    key RFISC        : String(3)                  @title: 'RFISC';
    key slno         : Integer default 0          @readonly                @title: 'Serial Number'  @UI.HiddenFilter;
    key validFrom    : Date default '1900-01-01'  @title: 'Valid From';
        validityTill : Date default '9999-12-31'  @title: 'Validity Till'  @UI.HiddenFilter;
        intrastate   : String(1) default 0        @title: 'Intrastate'     @UI.HiddenFilter         @assert.range: [
            0,
            1
        ];
        isUT         : String(1) default 0        @title: 'Is UT'          @UI.HiddenFilter         @assert.range: [
            0,
            1
        ];
        b2b          : String(1) default 0        @title: 'B2B'            @UI.HiddenFilter         @assert.range: [
            0,
            1
        ];
        IsSEZ        : String(1) default 0        @title: 'Is SEZ'         @UI.HiddenFilter         @assert.range: [
            0,
            1
        ];
        cabinClass   : String(1)                  @title: 'Cabin Class'    @UI.HiddenFilter;
        taxCode      : String(3)                  @title: 'Tax Code'       @UI.HiddenFilter;
        ruleId       : String(10)                 @readonly                @title: 'Rule ID'        @UI.HiddenFilter;
        ruleText     : String(255)                @title: 'Rule Text'      @UI.HiddenFilter;


        TaxCodes     : Association to TaxCodes
                           on TaxCodes.taxCode = taxCode;

        Company      : Association to Company
                           on Company.code = company;

        EMDRFISC     : Association to EMDRFISC
                           on EMDRFISC.RFISC = RFISC;
}

entity AuthOtp {
    key id           : UUID;
        otp          : String(6);
        email        : String(255);
        verified     : Boolean default false;
        type         : String(10);
        createdAt    : Timestamp  @cds.on.insert: $now  @cds.on.update: $now;
        expiresOn    : Timestamp;
        categoryCode : String(40);
}

entity AppConfig {
    key company                       : type of Company : code;
        value                         : String(10);
        cutOverDate                   : Date;
        isAdminApproval               : Boolean default false;
        isGstinApiValidation          : Boolean default false;
        maxInvoicesPerBulk            : Integer;
        sendPdfToRegisteredEmail      : Boolean default false;
        sendPdfToPassengerEmail       : Boolean default false;
        sendPdfToUserGstinEmail       : Boolean default false;
        isGstinAPIRunning             : Boolean default false  @UI.Hidden  @UI.HiddenFilter;
        isInvoiceProcessRunning       : Boolean default false  @UI.Hidden  @UI.HiddenFilter;
        isAmendmentProcessRunning     : Boolean default false  @UI.Hidden  @UI.HiddenFilter;
        isInvoicePdfGenerationRunning : Boolean default false  @UI.Hidden  @UI.HiddenFilter;
        pauseInvoiceProcess           : Boolean default false  @UI.Hidden  @UI.HiddenFilter;
        pauseGstinAPI                 : Boolean default false  @UI.Hidden  @UI.HiddenFilter;
        pausePdfGeneration            : Boolean default false  @UI.Hidden  @UI.HiddenFilter;
        GSTINValidationApplicable     : Boolean default false  @UI.Hidden  @UI.HiddenFilter;
        IsBulkInvoiceEnabled          : Boolean default false  @UI.Hidden  @UI.HiddenFilter;
        Company                       : Association to Company
                                            on Company.code = company;
}

entity CategoryDocuments {
    key category         : String(4);
        documentTypeCode : String(20)            @title: 'Document Type Code';
        documentTypeName : String(40)            @title: 'Document Type Name';
        description      : String(100)           @title: 'Document Type Description';
        isMandatory      : Boolean default false @title: 'Is Mandatory ';
}


entity Document : managed {
    key company                          : String(4);
    key ID                               : UUID;
        eventId                          : Integer;
        PNR                              : String(8);
        primaryDocumentNbr               : String(15);
        type                             : String(10);
        issueIndicator                   : String(15);
        internalId                       : String(15);
        IATANumber                       : String(10);
        agencyName                       : String(255);
        fullRouting                      : String(255);
        dateOfIssuance                   : Date;
        transactionCode                  : String(10);
        transactionType                  : String(10);
        acquisitionType                  : String(10);
        bookingAgencyIataNumber          : String(10);
        surname                          : String(40);
        firstName                        : String(40);
        PassengerTypeCode                : String(5);
        routingType                      : String(1);
        oneWayIndicator                  : String(1);
        originCity                       : String(5);
        destinationCity                  : String(5);
        totalDocumentAmount              : Decimal(16, 2);
        netFare                          : Decimal(16, 2);
        publishedFare                    : Decimal(16, 2);
        sellingFare                      : Decimal(16, 2);
        fop1                             : String(6);
        fopAmount1                       : Decimal(16, 2);
        fop2                             : String(14);
        fopAmount2                       : Decimal(16, 2);
        fop3                             : String(14);
        fopAmount3                       : Decimal(16, 2);
        fop4                             : String(14);
        fopAmount4                       : Decimal(16, 2);
        fop5                             : String(14);
        fopAmount5                       : Decimal(16, 2);
        fop6                             : String(14);
        fopAmount6                       : Decimal(16, 2);
        fop7                             : String(14);
        fopAmount7                       : Decimal(16, 2);
        fop8                             : String(14);
        fopAmount8                       : Decimal(16, 2);
        tax1                             : String(6);
        taxNatureCode1                   : String(6);
        taxType1                         : String(20);
        taxRefundable1                   : String(5);
        taxAmount1                       : Decimal(16, 2);
        tax2                             : String(6);
        taxNatureCode2                   : String(6);
        taxType2                         : String(20);
        taxRefundable2                   : String(5);
        taxAmount2                       : Decimal(16, 2);
        tax3                             : String(6);
        taxNatureCode3                   : String(6);
        taxType3                         : String(20);
        taxRefundable3                   : String(5);
        taxAmount3                       : Decimal(16, 2);
        tax4                             : String(6);
        taxNatureCode4                   : String(6);
        taxType4                         : String(20);
        taxRefundable4                   : String(5);
        taxAmount4                       : Decimal(16, 2);
        tax5                             : String(6);
        taxNatureCode5                   : String(6);
        taxType5                         : String(20);
        taxRefundable5                   : String(5);
        taxAmount5                       : Decimal(16, 2);
        tax6                             : String(6);
        taxNatureCode6                   : String(6);
        taxType6                         : String(20);
        taxRefundable6                   : String(5);
        taxAmount6                       : Decimal(16, 2);
        tax7                             : String(6);
        taxNatureCode7                   : String(6);
        taxType7                         : String(20);
        taxRefundable7                   : String(5);
        taxAmount7                       : Decimal(16, 2);
        tax8                             : String(6);
        taxNatureCode8                   : String(6);
        taxType8                         : String(20);
        taxRefundable8                   : String(5);
        taxAmount8                       : Decimal(16, 2);
        tax9                             : String(6);
        taxNatureCode9                   : String(6);
        taxType9                         : String(20);
        taxRefundable9                   : String(5);
        taxAmount9                       : Decimal(16, 2);
        tax10                            : String(6);
        taxNatureCode10                  : String(6);
        taxType10                        : String(20);
        taxRefundable10                  : String(5);
        taxAmount10                      : Decimal(16, 2);
        tax11                            : String(6);
        taxNatureCode11                  : String(6);
        taxType11                        : String(20);
        taxRefundable11                  : String(5);
        taxAmount11                      : Decimal(16, 2);
        tax12                            : String(6);
        taxNatureCode12                  : String(6);
        taxType12                        : String(20);
        taxRefundable12                  : String(5);
        taxAmount12                      : Decimal(16, 2);
        tax13                            : String(6);
        taxNatureCode13                  : String(6);
        taxType13                        : String(20);
        taxRefundable13                  : String(5);
        taxAmount13                      : Decimal(16, 2);
        tax14                            : String(6);
        taxNatureCode14                  : String(6);
        taxType14                        : String(20);
        taxRefundable14                  : String(5);
        taxAmount14                      : Decimal(16, 2);
        tax15                            : String(6);
        taxNatureCode15                  : String(6);
        taxType15                        : String(20);
        taxRefundable15                  : String(5);
        taxAmount15                      : Decimal(16, 2);
        tax16                            : String(6);
        taxNatureCode16                  : String(6);
        taxType16                        : String(20);
        taxRefundable16                  : String(5);
        taxAmount16                      : Decimal(16, 2);
        tax17                            : String(6);
        taxNatureCode17                  : String(6);
        taxType17                        : String(20);
        taxRefundable17                  : String(5);
        taxAmount17                      : Decimal(16, 2);
        tax18                            : String(6);
        taxNatureCode18                  : String(6);
        taxType18                        : String(20);
        taxRefundable18                  : String(5);
        taxAmount18                      : Decimal(16, 2);
        tax19                            : String(6);
        taxNatureCode19                  : String(6);
        taxType19                        : String(20);
        taxRefundable19                  : String(5);
        taxAmount19                      : Decimal(16, 2);
        tax20                            : String(6);
        taxNatureCode20                  : String(6);
        taxType20                        : String(20);
        taxRefundable20                  : String(5);
        taxAmount20                      : Decimal(16, 2);
        gstin                            : type of GSTIN : gstin;
        gstCompany                       : String(255);
        dwhGstin                         : type of GSTIN : gstin;
        sbrGstin                         : type of GSTIN : gstin;
        entityStatus                     : String(20);
        class                            : String(1);
        endorsement                      : String(100);
        review                           : String(255);
        orginalFileName                  : String(255);
        convertedFileName                : String(255);
        rowId                            : Integer;
        countryOfIssue_code              : Country;
        SBRRecivedOn                     : Timestamp;
        SBRProcessedOn                   : Timestamp;
        status                           : String(3) default 'NEW';
        eventNumber                      : String(20);
        eventType                        : String(100);
        eventTypeShortCode               : String(15);
        refundedDocumentNumber           : String(15);
        refundedDocumentIssueDate        : Date;
        originalDocumentNumber           : String(15);
        originalDocumentDate             : Date;
        refundFeeCode1                   : String(6);
        refundFeeAmount1                 : Decimal(16, 2);
        refundFeeCode2                   : String(6);
        refundFeeAmount2                 : Decimal(16, 2);
        refundFeeCode3                   : String(6);
        refundFeeAmount3                 : Decimal(16, 2);
        refundFeeCode4                   : String(6);
        refundFeeAmount4                 : Decimal(16, 2);
        refundFeeCode5                   : String(6);
        refundFeeAmount5                 : Decimal(16, 2);
        refundFeeCode6                   : String(6);
        refundFeeAmount6                 : Decimal(16, 2);
        refundFeeCode7                   : String(6);
        refundFeeAmount7                 : Decimal(16, 2);
        isRedemptionTicket               : String(1);
        isRedemptionWithFareTicket       : String(1);
        isStaff                          : String(1);
        officeId                         : String(15);
        officeCityCode                   : String(3);
        reasonForIssuanceCode            : String(10);
        feeCode1                         : String(10);
        feeAmount1                       : Decimal(16, 2);
        feeCode2                         : String(10);
        feeAmount2                       : Decimal(16, 2);
        feeCode3                         : String(10);
        feeAmount3                       : Decimal(16, 2);
        feeCode4                         : String(10);
        feeAmount4                       : Decimal(16, 2);
        feeCode5                         : String(10);
        feeAmount5                       : Decimal(16, 2);
        feeCode6                         : String(10);
        feeAmount6                       : Decimal(16, 2);
        feeCode7                         : String(10);
        feeAmount7                       : Decimal(16, 2);
        feeCode8                         : String(10);
        feeAmount8                       : Decimal(16, 2);
        feeCode9                         : String(10);
        feeAmount9                       : Decimal(16, 2);
        feeCode10                        : String(10);
        feeAmount10                      : Decimal(16, 2);
        conversionRule                   : String(30);
        originalCurrency                 : String(10);
        roe                              : Decimal(12, 8);
        endorsementText                  : String(255);
        reasonForIssuanceDescription     : String(255);
        issuanceCityPOS                  : String(30);
        issuanceIssuerSystem             : String(10);
        issuanceChannel                  : String(10);
        issuanceiatacode                 : String(10);
        issuanceOfficeId                 : String(20);
        issuanceCountryCodeOfIssue       : String(10);
        issuanceCountryAgentSign         : String(20);
        refundedOriginalDocIssueDate     : Date;
        refundNetFares                   : Decimal(16, 2);
        refundPublishedFares             : Decimal(16, 2);
        refundedTotalDocumentAmount      : Decimal(16, 2);
        refundTax1                       : String(6);
        refundTaxNatureCode1             : String(8);
        refundTaxType1                   : String(20);
        refundTaxRefundable1             : String(5);
        refundTaxAmount1                 : Decimal(16, 2);
        refundTax2                       : String(6);
        refundTaxNatureCode2             : String(8);
        refundTaxType2                   : String(20);
        refundTaxRefundable2             : String(5);
        refundTaxAmount2                 : Decimal(16, 2);
        refundTax3                       : String(6);
        refundTaxNatureCode3             : String(8);
        refundTaxType3                   : String(20);
        refundTaxRefundable3             : String(5);
        refundTaxAmount3                 : Decimal(16, 2);
        refundTax4                       : String(6);
        refundTaxNatureCode4             : String(8);
        refundTaxType4                   : String(20);
        refundTaxRefundable4             : String(5);
        refundTaxAmount4                 : Decimal(16, 2);
        refundTax5                       : String(6);
        refundTaxNatureCode5             : String(8);
        refundTaxType5                   : String(20);
        refundTaxRefundable5             : String(5);
        refundTaxAmount5                 : Decimal(16, 2);
        refundTax6                       : String(6);
        refundTaxNatureCode6             : String(8);
        refundTaxType6                   : String(20);
        refundTaxRefundable6             : String(5);
        refundTaxAmount6                 : Decimal(16, 2);
        refundTax7                       : String(6);
        refundTaxNatureCode7             : String(8);
        refundTaxType7                   : String(20);
        refundTaxRefundable7             : String(5);
        refundTaxAmount7                 : Decimal(16, 2);
        refundTax8                       : String(6);
        refundTaxNatureCode8             : String(8);
        refundTaxType8                   : String(20);
        refundTaxRefundable8             : String(5);
        refundTaxAmount8                 : Decimal(16, 2);
        refundTax9                       : String(6);
        refundTaxNatureCode9             : String(8);
        refundTaxType9                   : String(20);
        refundTaxRefundable9             : String(5);
        refundTaxAmount9                 : Decimal(16, 2);
        refundTax10                      : String(6);
        refundTaxNatureCode10            : String(8);
        refundTaxType10                  : String(20);
        refundTaxRefundable10            : String(5);
        refundTaxAmount10                : Decimal(16, 2);
        refundTax11                      : String(6);
        refundTaxNatureCode11            : String(8);
        refundTaxType11                  : String(20);
        refundTaxRefundable11            : String(5);
        refundTaxAmount11                : Decimal(16, 2);
        refundTax12                      : String(6);
        refundTaxNatureCode12            : String(8);
        refundTaxType12                  : String(20);
        refundTaxRefundable12            : String(5);
        refundTaxAmount12                : Decimal(16, 2);
        refundTax13                      : String(6);
        refundTaxNatureCode13            : String(8);
        refundTaxType13                  : String(20);
        refundTaxRefundable13            : String(5);
        refundTaxAmount13                : Decimal(16, 2);
        refundTax14                      : String(6);
        refundTaxNatureCode14            : String(8);
        refundTaxType14                  : String(20);
        refundTaxRefundable14            : String(5);
        refundTaxAmount14                : Decimal(16, 2);
        refundTax15                      : String(6);
        refundTaxNatureCode15            : String(8);
        refundTaxType15                  : String(20);
        refundTaxRefundable15            : String(5);
        refundTaxAmount15                : Decimal(16, 2);
        refundTax16                      : String(6);
        refundTaxNatureCode16            : String(8);
        refundTaxType16                  : String(20);
        refundTaxRefundable16            : String(5);
        refundTaxAmount16                : Decimal(16, 2);
        refundTax17                      : String(6);
        refundTaxNatureCode17            : String(8);
        refundTaxType17                  : String(20);
        refundTaxRefundable17            : String(5);
        refundTaxAmount17                : Decimal(16, 2);
        refundTax18                      : String(6);
        refundTaxNatureCode18            : String(8);
        refundTaxType18                  : String(20);
        refundTaxRefundable18            : String(5);
        refundTaxAmount18                : Decimal(16, 2);
        refundTax19                      : String(6);
        refundTaxNatureCode19            : String(8);
        refundTaxType19                  : String(20);
        refundTaxRefundable19            : String(5);
        refundTaxAmount19                : Decimal(16, 2);
        refundTax20                      : String(6);
        refundTaxNatureCode20            : String(8);
        refundTaxType20                  : String(20);
        refundTaxRefundable20            : String(5);
        refundTaxAmount20                : Decimal(16, 2);
        refundedCouponNumbers            : String(100);
        residualValue                    : String(20);
        refundingEntityIata              : String(20);
        refundRoe                        : Decimal(12, 8);
        refundOriginalCurrency           : String(10);
        doc2RefundedDocumentNumber       : String(15);
        doc2RefundedDocumentIssueDate    : String(10);
        doc2RefundedOriginalDocIssueDate : String(10);
        doc2RefundNetFares               : Decimal(16, 2);
        doc2RefundPublishedFares         : Decimal(16, 2);
        doc2RefundedTotalDocAmount       : Decimal(16, 2);
        doc2RefundTax1                   : String(6);
        doc2RefundTaxNatureCode1         : String(8);
        doc2RefundTaxType1               : String(20);
        doc2RefundTaxRefundable1         : String(5);
        doc2RefundTaxAmount1             : Decimal(16, 2);
        doc2RefundTax2                   : String(6);
        doc2RefundTaxNatureCode2         : String(8);
        doc2RefundTaxType2               : String(20);
        doc2RefundTaxRefundable2         : String(5);
        doc2RefundTaxAmount2             : Decimal(16, 2);
        doc2RefundTax3                   : String(6);
        doc2RefundTaxNatureCode3         : String(8);
        doc2RefundTaxType3               : String(20);
        doc2RefundTaxRefundable3         : String(5);
        doc2RefundTaxAmount3             : Decimal(16, 2);
        doc2RefundTax4                   : String(6);
        doc2RefundTaxNatureCode4         : String(8);
        doc2RefundTaxType4               : String(20);
        doc2RefundTaxRefundable4         : String(5);
        doc2RefundTaxAmount4             : Decimal(16, 2);
        doc2RefundTax5                   : String(6);
        doc2RefundTaxNatureCode5         : String(8);
        doc2RefundTaxType5               : String(20);
        doc2RefundTaxRefundable5         : String(5);
        doc2RefundTaxAmount5             : Decimal(16, 2);
        doc2RefundTax6                   : String(6);
        doc2RefundTaxNatureCode6         : String(8);
        doc2RefundTaxType6               : String(20);
        doc2RefundTaxRefundable6         : String(5);
        doc2RefundTaxAmount6             : Decimal(16, 2);
        doc2RefundTax7                   : String(6);
        doc2RefundTaxNatureCode7         : String(8);
        doc2RefundTaxType7               : String(20);
        doc2RefundTaxRefundable7         : String(5);
        doc2RefundTaxAmount7             : Decimal(16, 2);
        doc2RefundTax8                   : String(6);
        doc2RefundTaxNatureCode8         : String(8);
        doc2RefundTaxType8               : String(20);
        doc2RefundTaxRefundable8         : String(5);
        doc2RefundTaxAmount8             : Decimal(16, 2);
        doc2RefundTax9                   : String(6);
        doc2RefundTaxNatureCode9         : String(8);
        doc2RefundTaxType9               : String(20);
        doc2RefundTaxRefundable9         : String(5);
        doc2RefundTaxAmount9             : Decimal(16, 2);
        doc2RefundTax10                  : String(6);
        doc2RefundTaxNatureCode10        : String(8);
        doc2RefundTaxType10              : String(20);
        doc2RefundTaxRefundable10        : String(5);
        doc2RefundTaxAmount10            : Decimal(16, 2);
        doc2RefundTax11                  : String(6);
        doc2RefundTaxNatureCode11        : String(8);
        doc2RefundTaxType11              : String(20);
        doc2RefundTaxRefundable11        : String(5);
        doc2RefundTaxAmount11            : Decimal(16, 2);
        doc2RefundTax12                  : String(6);
        doc2RefundTaxNatureCode12        : String(8);
        doc2RefundTaxType12              : String(20);
        doc2RefundTaxRefundable12        : String(5);
        doc2RefundTaxAmount12            : Decimal(16, 2);
        doc2RefundTax13                  : String(6);
        doc2RefundTaxNatureCode13        : String(8);
        doc2RefundTaxType13              : String(20);
        doc2RefundTaxRefundable13        : String(5);
        doc2RefundTaxAmount13            : Decimal(16, 2);
        doc2RefundTax14                  : String(6);
        doc2RefundTaxNatureCode14        : String(8);
        doc2RefundTaxType14              : String(20);
        doc2RefundTaxRefundable14        : String(5);
        doc2RefundTaxAmount14            : Decimal(16, 2);
        doc2RefundTax15                  : String(6);
        doc2RefundTaxNatureCode15        : String(8);
        doc2RefundTaxType15              : String(20);
        doc2RefundTaxRefundable15        : String(5);
        doc2RefundTaxAmount15            : Decimal(16, 2);
        doc2RefundTax16                  : String(6);
        doc2RefundTaxNatureCode16        : String(8);
        doc2RefundTaxType16              : String(20);
        doc2RefundTaxRefundable16        : String(5);
        doc2RefundTaxAmount16            : Decimal(16, 2);
        doc2RefundTax17                  : String(6);
        doc2RefundTaxNatureCode17        : String(8);
        doc2RefundTaxType17              : String(20);
        doc2RefundTaxRefundable17        : String(5);
        doc2RefundTaxAmount17            : Decimal(16, 2);
        doc2RefundTax18                  : String(6);
        doc2RefundTaxNatureCode18        : String(8);
        doc2RefundTaxType18              : String(20);
        doc2RefundTaxRefundable18        : String(5);
        doc2RefundTaxAmount18            : Decimal(16, 2);
        doc2RefundTax19                  : String(6);
        doc2RefundTaxNatureCode19        : String(8);
        doc2RefundTaxType19              : String(20);
        doc2RefundTaxRefundable19        : String(5);
        doc2RefundTaxAmount19            : Decimal(16, 2);
        doc2RefundTax20                  : String(6);
        doc2RefundTaxNatureCode20        : String(8);
        doc2RefundTaxType20              : String(20);
        doc2RefundTaxRefundable20        : String(5);
        doc2RefundTaxAmount20            : Decimal(16, 2);
        doc2RefundedCouponNumbers        : String(100);
        doc2RefundingEntityIata          : String(20);
        doc2RefundRoe                    : Decimal(12, 8);
        doc2RefundOriginalCurrency       : String(10);
        doc3RefundedDocumentNumber       : String(15);
        doc3RefundedDocumentIssueDate    : String(10);
        doc3RefundedOriginalDocIssueDate : String(10);
        doc3RefundNetFares               : Decimal(16, 2);
        doc3RefundPublishedFares         : Decimal(16, 2);
        doc3RefundedTotalDocAmount       : Decimal(16, 2);
        doc3RefundTax1                   : String(6);
        doc3RefundTaxNatureCode1         : String(8);
        doc3RefundTaxType1               : String(20);
        doc3RefundTaxRefundable1         : String(5);
        doc3RefundTaxAmount1             : Decimal(16, 2);
        doc3RefundTax2                   : String(6);
        doc3RefundTaxNatureCode2         : String(8);
        doc3RefundTaxType2               : String(20);
        doc3RefundTaxRefundable2         : String(5);
        doc3RefundTaxAmount2             : Decimal(16, 2);
        doc3RefundTax3                   : String(6);
        doc3RefundTaxNatureCode3         : String(8);
        doc3RefundTaxType3               : String(20);
        doc3RefundTaxRefundable3         : String(5);
        doc3RefundTaxAmount3             : Decimal(16, 2);
        doc3RefundTax4                   : String(6);
        doc3RefundTaxNatureCode4         : String(8);
        doc3RefundTaxType4               : String(20);
        doc3RefundTaxRefundable4         : String(5);
        doc3RefundTaxAmount4             : Decimal(16, 2);
        doc3RefundTax5                   : String(6);
        doc3RefundTaxNatureCode5         : String(8);
        doc3RefundTaxType5               : String(20);
        doc3RefundTaxRefundable5         : String(5);
        doc3RefundTaxAmount5             : Decimal(16, 2);
        doc3RefundTax6                   : String(6);
        doc3RefundTaxNatureCode6         : String(8);
        doc3RefundTaxType6               : String(20);
        doc3RefundTaxRefundable6         : String(5);
        doc3RefundTaxAmount6             : Decimal(16, 2);
        doc3RefundTax7                   : String(6);
        doc3RefundTaxNatureCode7         : String(8);
        doc3RefundTaxType7               : String(20);
        doc3RefundTaxRefundable7         : String(5);
        doc3RefundTaxAmount7             : Decimal(16, 2);
        doc3RefundTax8                   : String(6);
        doc3RefundTaxNatureCode8         : String(8);
        doc3RefundTaxType8               : String(20);
        doc3RefundTaxRefundable8         : String(5);
        doc3RefundTaxAmount8             : Decimal(16, 2);
        doc3RefundTax9                   : String(6);
        doc3RefundTaxNatureCode9         : String(8);
        doc3RefundTaxType9               : String(20);
        doc3RefundTaxRefundable9         : String(5);
        doc3RefundTaxAmount9             : Decimal(16, 2);
        doc3RefundTax10                  : String(6);
        doc3RefundTaxNatureCode10        : String(8);
        doc3RefundTaxType10              : String(20);
        doc3RefundTaxRefundable10        : String(5);
        doc3RefundTaxAmount10            : Decimal(16, 2);
        doc3RefundTax11                  : String(6);
        doc3RefundTaxNatureCode11        : String(8);
        doc3RefundTaxType11              : String(20);
        doc3RefundTaxRefundable11        : String(5);
        doc3RefundTaxAmount11            : Decimal(16, 2);
        doc3RefundTax12                  : String(6);
        doc3RefundTaxNatureCode12        : String(8);
        doc3RefundTaxType12              : String(20);
        doc3RefundTaxRefundable12        : String(5);
        doc3RefundTaxAmount12            : Decimal(16, 2);
        doc3RefundTax13                  : String(6);
        doc3RefundTaxNatureCode13        : String(8);
        doc3RefundTaxType13              : String(20);
        doc3RefundTaxRefundable13        : String(5);
        doc3RefundTaxAmount13            : Decimal(16, 2);
        doc3RefundTax14                  : String(6);
        doc3RefundTaxNatureCode14        : String(8);
        doc3RefundTaxType14              : String(20);
        doc3RefundTaxRefundable14        : String(5);
        doc3RefundTaxAmount14            : Decimal(16, 2);
        doc3RefundTax15                  : String(6);
        doc3RefundTaxNatureCode15        : String(8);
        doc3RefundTaxType15              : String(20);
        doc3RefundTaxRefundable15        : String(5);
        doc3RefundTaxAmount15            : Decimal(16, 2);
        doc3RefundTax16                  : String(6);
        doc3RefundTaxNatureCode16        : String(8);
        doc3RefundTaxType16              : String(20);
        doc3RefundTaxRefundable16        : String(5);
        doc3RefundTaxAmount16            : Decimal(16, 2);
        doc3RefundTax17                  : String(6);
        doc3RefundTaxNatureCode17        : String(8);
        doc3RefundTaxType17              : String(20);
        doc3RefundTaxRefundable17        : String(5);
        doc3RefundTaxAmount17            : Decimal(16, 2);
        doc3RefundTax18                  : String(6);
        doc3RefundTaxNatureCode18        : String(8);
        doc3RefundTaxType18              : String(20);
        doc3RefundTaxRefundable18        : String(5);
        doc3RefundTaxAmount18            : Decimal(16, 2);
        doc3RefundTax19                  : String(6);
        doc3RefundTaxNatureCode19        : String(8);
        doc3RefundTaxType19              : String(20);
        doc3RefundTaxRefundable19        : String(5);
        doc3RefundTaxAmount19            : Decimal(16, 2);
        doc3RefundTax20                  : String(6);
        doc3RefundTaxNatureCode20        : String(8);
        doc3RefundTaxType20              : String(20);
        doc3RefundTaxRefundable20        : String(5);
        doc3RefundTaxAmount20            : Decimal(16, 2);
        doc3RefundedCouponNumbers        : String(100);
        doc3RefundingEntityIata          : String(20);
        doc3RefundRoe                    : Decimal(12, 8);
        doc3RefundOriginalCurrency       : String(10);
        doc4RefundedDocumentNumber       : String(15);
        doc4RefundedDocumentIssueDate    : String(10);
        doc4RefundedOriginalDocIssueDate : String(10);
        doc4RefundNetFares               : Decimal(16, 2);
        doc4RefundPublishedFares         : Decimal(16, 2);
        doc4RefundedTotalDocAmount       : Decimal(16, 2);
        doc4RefundTax1                   : String(6);
        doc4RefundTaxNatureCode1         : String(8);
        doc4RefundTaxType1               : String(20);
        doc4RefundTaxRefundable1         : String(5);
        doc4RefundTaxAmount1             : Decimal(16, 2);
        doc4RefundTax2                   : String(6);
        doc4RefundTaxNatureCode2         : String(8);
        doc4RefundTaxType2               : String(20);
        doc4RefundTaxRefundable2         : String(5);
        doc4RefundTaxAmount2             : Decimal(16, 2);
        doc4RefundTax3                   : String(6);
        doc4RefundTaxNatureCode3         : String(8);
        doc4RefundTaxType3               : String(20);
        doc4RefundTaxRefundable3         : String(5);
        doc4RefundTaxAmount3             : Decimal(16, 2);
        doc4RefundTax4                   : String(6);
        doc4RefundTaxNatureCode4         : String(8);
        doc4RefundTaxType4               : String(20);
        doc4RefundTaxRefundable4         : String(5);
        doc4RefundTaxAmount4             : Decimal(16, 2);
        doc4RefundTax5                   : String(6);
        doc4RefundTaxNatureCode5         : String(8);
        doc4RefundTaxType5               : String(20);
        doc4RefundTaxRefundable5         : String(5);
        doc4RefundTaxAmount5             : Decimal(16, 2);
        doc4RefundTax6                   : String(6);
        doc4RefundTaxNatureCode6         : String(8);
        doc4RefundTaxType6               : String(20);
        doc4RefundTaxRefundable6         : String(5);
        doc4RefundTaxAmount6             : Decimal(16, 2);
        doc4RefundTax7                   : String(6);
        doc4RefundTaxNatureCode7         : String(8);
        doc4RefundTaxType7               : String(20);
        doc4RefundTaxRefundable7         : String(5);
        doc4RefundTaxAmount7             : Decimal(16, 2);
        doc4RefundTax8                   : String(6);
        doc4RefundTaxNatureCode8         : String(8);
        doc4RefundTaxType8               : String(20);
        doc4RefundTaxRefundable8         : String(5);
        doc4RefundTaxAmount8             : Decimal(16, 2);
        doc4RefundTax9                   : String(6);
        doc4RefundTaxNatureCode9         : String(8);
        doc4RefundTaxType9               : String(20);
        doc4RefundTaxRefundable9         : String(5);
        doc4RefundTaxAmount9             : Decimal(16, 2);
        doc4RefundTax10                  : String(6);
        doc4RefundTaxNatureCode10        : String(8);
        doc4RefundTaxType10              : String(20);
        doc4RefundTaxRefundable10        : String(5);
        doc4RefundTaxAmount10            : Decimal(16, 2);
        doc4RefundTax11                  : String(6);
        doc4RefundTaxNatureCode11        : String(8);
        doc4RefundTaxType11              : String(20);
        doc4RefundTaxRefundable11        : String(5);
        doc4RefundTaxAmount11            : Decimal(16, 2);
        doc4RefundTax12                  : String(6);
        doc4RefundTaxNatureCode12        : String(8);
        doc4RefundTaxType12              : String(20);
        doc4RefundTaxRefundable12        : String(5);
        doc4RefundTaxAmount12            : Decimal(16, 2);
        doc4RefundTax13                  : String(6);
        doc4RefundTaxNatureCode13        : String(8);
        doc4RefundTaxType13              : String(20);
        doc4RefundTaxRefundable13        : String(5);
        doc4RefundTaxAmount13            : Decimal(16, 2);
        doc4RefundTax14                  : String(6);
        doc4RefundTaxNatureCode14        : String(8);
        doc4RefundTaxType14              : String(20);
        doc4RefundTaxRefundable14        : String(5);
        doc4RefundTaxAmount14            : Decimal(16, 2);
        doc4RefundTax15                  : String(6);
        doc4RefundTaxNatureCode15        : String(8);
        doc4RefundTaxType15              : String(20);
        doc4RefundTaxRefundable15        : String(5);
        doc4RefundTaxAmount15            : Decimal(16, 2);
        doc4RefundTax16                  : String(6);
        doc4RefundTaxNatureCode16        : String(8);
        doc4RefundTaxType16              : String(20);
        doc4RefundTaxRefundable16        : String(5);
        doc4RefundTaxAmount16            : Decimal(16, 2);
        doc4RefundTax17                  : String(6);
        doc4RefundTaxNatureCode17        : String(8);
        doc4RefundTaxType17              : String(20);
        doc4RefundTaxRefundable17        : String(5);
        doc4RefundTaxAmount17            : Decimal(16, 2);
        doc4RefundTax18                  : String(6);
        doc4RefundTaxNatureCode18        : String(8);
        doc4RefundTaxType18              : String(20);
        doc4RefundTaxRefundable18        : String(5);
        doc4RefundTaxAmount18            : Decimal(16, 2);
        doc4RefundTax19                  : String(6);
        doc4RefundTaxNatureCode19        : String(8);
        doc4RefundTaxType19              : String(20);
        doc4RefundTaxRefundable19        : String(5);
        doc4RefundTaxAmount19            : Decimal(16, 2);
        doc4RefundTax20                  : String(6);
        doc4RefundTaxNatureCode20        : String(8);
        doc4RefundTaxType20              : String(20);
        doc4RefundTaxRefundable20        : String(5);
        doc4RefundTaxAmount20            : Decimal(16, 2);
        doc4RefundedCouponNumbers        : String(100);
        doc4RefundingEntityIata          : String(20);
        doc4RefundRoe                    : Decimal(12, 8);
        doc4RefundOriginalCurrency       : String(10);
        doc5RefundedDocumentNumber       : String(15);
        doc5RefundedDocumentIssueDate    : String(10);
        doc5RefundedOriginalDocIssueDate : String(10);
        doc5RefundNetFares               : Decimal(16, 2);
        doc5RefundPublishedFares         : Decimal(16, 2);
        doc5RefundedTotalDocAmount       : Decimal(16, 2);
        doc5RefundTax1                   : String(6);
        doc5RefundTaxNatureCode1         : String(8);
        doc5RefundTaxType1               : String(20);
        doc5RefundTaxRefundable1         : String(5);
        doc5RefundTaxAmount1             : Decimal(16, 2);
        doc5RefundTax2                   : String(6);
        doc5RefundTaxNatureCode2         : String(8);
        doc5RefundTaxType2               : String(20);
        doc5RefundTaxRefundable2         : String(5);
        doc5RefundTaxAmount2             : Decimal(16, 2);
        doc5RefundTax3                   : String(6);
        doc5RefundTaxNatureCode3         : String(8);
        doc5RefundTaxType3               : String(20);
        doc5RefundTaxRefundable3         : String(5);
        doc5RefundTaxAmount3             : Decimal(16, 2);
        doc5RefundTax4                   : String(6);
        doc5RefundTaxNatureCode4         : String(8);
        doc5RefundTaxType4               : String(20);
        doc5RefundTaxRefundable4         : String(5);
        doc5RefundTaxAmount4             : Decimal(16, 2);
        doc5RefundTax5                   : String(6);
        doc5RefundTaxNatureCode5         : String(8);
        doc5RefundTaxType5               : String(20);
        doc5RefundTaxRefundable5         : String(5);
        doc5RefundTaxAmount5             : Decimal(16, 2);
        doc5RefundTax6                   : String(6);
        doc5RefundTaxNatureCode6         : String(8);
        doc5RefundTaxType6               : String(20);
        doc5RefundTaxRefundable6         : String(5);
        doc5RefundTaxAmount6             : Decimal(16, 2);
        doc5RefundTax7                   : String(6);
        doc5RefundTaxNatureCode7         : String(8);
        doc5RefundTaxType7               : String(20);
        doc5RefundTaxRefundable7         : String(5);
        doc5RefundTaxAmount7             : Decimal(16, 2);
        doc5RefundTax8                   : String(6);
        doc5RefundTaxNatureCode8         : String(8);
        doc5RefundTaxType8               : String(20);
        doc5RefundTaxRefundable8         : String(5);
        doc5RefundTaxAmount8             : Decimal(16, 2);
        doc5RefundTax9                   : String(6);
        doc5RefundTaxNatureCode9         : String(8);
        doc5RefundTaxType9               : String(20);
        doc5RefundTaxRefundable9         : String(5);
        doc5RefundTaxAmount9             : Decimal(16, 2);
        doc5RefundTax10                  : String(6);
        doc5RefundTaxNatureCode10        : String(8);
        doc5RefundTaxType10              : String(20);
        doc5RefundTaxRefundable10        : String(5);
        doc5RefundTaxAmount10            : Decimal(16, 2);
        doc5RefundTax11                  : String(6);
        doc5RefundTaxNatureCode11        : String(8);
        doc5RefundTaxType11              : String(20);
        doc5RefundTaxRefundable11        : String(5);
        doc5RefundTaxAmount11            : Decimal(16, 2);
        doc5RefundTax12                  : String(6);
        doc5RefundTaxNatureCode12        : String(8);
        doc5RefundTaxType12              : String(20);
        doc5RefundTaxRefundable12        : String(5);
        doc5RefundTaxAmount12            : Decimal(16, 2);
        doc5RefundTax13                  : String(6);
        doc5RefundTaxNatureCode13        : String(8);
        doc5RefundTaxType13              : String(20);
        doc5RefundTaxRefundable13        : String(5);
        doc5RefundTaxAmount13            : Decimal(16, 2);
        doc5RefundTax14                  : String(6);
        doc5RefundTaxNatureCode14        : String(8);
        doc5RefundTaxType14              : String(20);
        doc5RefundTaxRefundable14        : String(5);
        doc5RefundTaxAmount14            : Decimal(16, 2);
        doc5RefundTax15                  : String(6);
        doc5RefundTaxNatureCode15        : String(8);
        doc5RefundTaxType15              : String(20);
        doc5RefundTaxRefundable15        : String(5);
        doc5RefundTaxAmount15            : Decimal(16, 2);
        doc5RefundTax16                  : String(6);
        doc5RefundTaxNatureCode16        : String(8);
        doc5RefundTaxType16              : String(20);
        doc5RefundTaxRefundable16        : String(5);
        doc5RefundTaxAmount16            : Decimal(16, 2);
        doc5RefundTax17                  : String(6);
        doc5RefundTaxNatureCode17        : String(8);
        doc5RefundTaxType17              : String(20);
        doc5RefundTaxRefundable17        : String(5);
        doc5RefundTaxAmount17            : Decimal(16, 2);
        doc5RefundTax18                  : String(6);
        doc5RefundTaxNatureCode18        : String(8);
        doc5RefundTaxType18              : String(20);
        doc5RefundTaxRefundable18        : String(5);
        doc5RefundTaxAmount18            : Decimal(16, 2);
        doc5RefundTax19                  : String(6);
        doc5RefundTaxNatureCode19        : String(8);
        doc5RefundTaxType19              : String(20);
        doc5RefundTaxRefundable19        : String(5);
        doc5RefundTaxAmount19            : Decimal(16, 2);
        doc5RefundTax20                  : String(6);
        doc5RefundTaxNatureCode20        : String(8);
        doc5RefundTaxType20              : String(20);
        doc5RefundTaxRefundable20        : String(5);
        doc5RefundTaxAmount20            : Decimal(16, 2);
        doc5RefundedCouponNumbers        : String(100);
        doc5RefundingEntityIata          : String(20);
        doc5RefundRoe                    : Decimal(12, 8);
        doc5RefundOriginalCurrency       : String(10);
        doc6RefundedDocumentNumber       : String(15);
        doc6RefundedDocumentIssueDate    : String(10);
        doc6RefundedOriginalDocIssueDate : String(10);
        doc6RefundNetFares               : Decimal(16, 2);
        doc6RefundPublishedFares         : Decimal(16, 2);
        doc6RefundedTotalDocAmount       : Decimal(16, 2);
        doc6RefundTax1                   : String(6);
        doc6RefundTaxNatureCode1         : String(8);
        doc6RefundTaxType1               : String(20);
        doc6RefundTaxRefundable1         : String(5);
        doc6RefundTaxAmount1             : Decimal(16, 2);
        doc6RefundTax2                   : String(6);
        doc6RefundTaxNatureCode2         : String(8);
        doc6RefundTaxType2               : String(20);
        doc6RefundTaxRefundable2         : String(5);
        doc6RefundTaxAmount2             : Decimal(16, 2);
        doc6RefundTax3                   : String(6);
        doc6RefundTaxNatureCode3         : String(8);
        doc6RefundTaxType3               : String(20);
        doc6RefundTaxRefundable3         : String(5);
        doc6RefundTaxAmount3             : Decimal(16, 2);
        doc6RefundTax4                   : String(6);
        doc6RefundTaxNatureCode4         : String(8);
        doc6RefundTaxType4               : String(20);
        doc6RefundTaxRefundable4         : String(5);
        doc6RefundTaxAmount4             : Decimal(16, 2);
        doc6RefundTax5                   : String(6);
        doc6RefundTaxNatureCode5         : String(8);
        doc6RefundTaxType5               : String(20);
        doc6RefundTaxRefundable5         : String(5);
        doc6RefundTaxAmount5             : Decimal(16, 2);
        doc6RefundTax6                   : String(6);
        doc6RefundTaxNatureCode6         : String(8);
        doc6RefundTaxType6               : String(20);
        doc6RefundTaxRefundable6         : String(5);
        doc6RefundTaxAmount6             : Decimal(16, 2);
        doc6RefundTax7                   : String(6);
        doc6RefundTaxNatureCode7         : String(8);
        doc6RefundTaxType7               : String(20);
        doc6RefundTaxRefundable7         : String(5);
        doc6RefundTaxAmount7             : Decimal(16, 2);
        doc6RefundTax8                   : String(6);
        doc6RefundTaxNatureCode8         : String(8);
        doc6RefundTaxType8               : String(20);
        doc6RefundTaxRefundable8         : String(5);
        doc6RefundTaxAmount8             : Decimal(16, 2);
        doc6RefundTax9                   : String(6);
        doc6RefundTaxNatureCode9         : String(8);
        doc6RefundTaxType9               : String(20);
        doc6RefundTaxRefundable9         : String(5);
        doc6RefundTaxAmount9             : Decimal(16, 2);
        doc6RefundTax10                  : String(6);
        doc6RefundTaxNatureCode10        : String(8);
        doc6RefundTaxType10              : String(20);
        doc6RefundTaxRefundable10        : String(5);
        doc6RefundTaxAmount10            : Decimal(16, 2);
        doc6RefundTax11                  : String(6);
        doc6RefundTaxNatureCode11        : String(8);
        doc6RefundTaxType11              : String(20);
        doc6RefundTaxRefundable11        : String(5);
        doc6RefundTaxAmount11            : Decimal(16, 2);
        doc6RefundTax12                  : String(6);
        doc6RefundTaxNatureCode12        : String(8);
        doc6RefundTaxType12              : String(20);
        doc6RefundTaxRefundable12        : String(5);
        doc6RefundTaxAmount12            : Decimal(16, 2);
        doc6RefundTax13                  : String(6);
        doc6RefundTaxNatureCode13        : String(8);
        doc6RefundTaxType13              : String(20);
        doc6RefundTaxRefundable13        : String(5);
        doc6RefundTaxAmount13            : Decimal(16, 2);
        doc6RefundTax14                  : String(6);
        doc6RefundTaxNatureCode14        : String(8);
        doc6RefundTaxType14              : String(20);
        doc6RefundTaxRefundable14        : String(5);
        doc6RefundTaxAmount14            : Decimal(16, 2);
        doc6RefundTax15                  : String(6);
        doc6RefundTaxNatureCode15        : String(8);
        doc6RefundTaxType15              : String(20);
        doc6RefundTaxRefundable15        : String(5);
        doc6RefundTaxAmount15            : Decimal(16, 2);
        doc6RefundTax16                  : String(6);
        doc6RefundTaxNatureCode16        : String(8);
        doc6RefundTaxType16              : String(20);
        doc6RefundTaxRefundable16        : String(5);
        doc6RefundTaxAmount16            : Decimal(16, 2);
        doc6RefundTax17                  : String(6);
        doc6RefundTaxNatureCode17        : String(8);
        doc6RefundTaxType17              : String(20);
        doc6RefundTaxRefundable17        : String(5);
        doc6RefundTaxAmount17            : Decimal(16, 2);
        doc6RefundTax18                  : String(6);
        doc6RefundTaxNatureCode18        : String(8);
        doc6RefundTaxType18              : String(20);
        doc6RefundTaxRefundable18        : String(5);
        doc6RefundTaxAmount18            : Decimal(16, 2);
        doc6RefundTax19                  : String(6);
        doc6RefundTaxNatureCode19        : String(8);
        doc6RefundTaxType19              : String(20);
        doc6RefundTaxRefundable19        : String(5);
        doc6RefundTaxAmount19            : Decimal(16, 2);
        doc6RefundTax20                  : String(6);
        doc6RefundTaxNatureCode20        : String(8);
        doc6RefundTaxType20              : String(20);
        doc6RefundTaxRefundable20        : String(5);
        doc6RefundTaxAmount20            : Decimal(16, 2);
        doc6RefundedCouponNumbers        : String(100);
        doc6RefundingEntityIata          : String(20);
        doc6RefundRoe                    : Decimal(12, 8);
        doc6RefundOriginalCurrency       : String(10);
        doc7RefundedDocumentNumber       : String(15);
        doc7RefundedDocumentIssueDate    : String(10);
        doc7RefundedOriginalDocIssueDate : String(10);
        doc7RefundNetFares               : Decimal(16, 2);
        doc7RefundPublishedFares         : Decimal(16, 2);
        doc7RefundedTotalDocumentAmount  : Decimal(16, 2);
        doc7RefundTax1                   : String(6);
        doc7RefundTaxNatureCode1         : String(8);
        doc7RefundTaxType1               : String(20);
        doc7RefundTaxRefundable1         : String(5);
        doc7RefundTaxAmount1             : Decimal(16, 2);
        doc7RefundTax2                   : String(6);
        doc7RefundTaxNatureCode2         : String(8);
        doc7RefundTaxType2               : String(20);
        doc7RefundTaxRefundable2         : String(5);
        doc7RefundTaxAmount2             : Decimal(16, 2);
        doc7RefundTax3                   : String(6);
        doc7RefundTaxNatureCode3         : String(8);
        doc7RefundTaxType3               : String(20);
        doc7RefundTaxRefundable3         : String(5);
        doc7RefundTaxAmount3             : Decimal(16, 2);
        doc7RefundTax4                   : String(6);
        doc7RefundTaxNatureCode4         : String(8);
        doc7RefundTaxType4               : String(20);
        doc7RefundTaxRefundable4         : String(5);
        doc7RefundTaxAmount4             : Decimal(16, 2);
        doc7RefundTax5                   : String(6);
        doc7RefundTaxNatureCode5         : String(8);
        doc7RefundTaxType5               : String(20);
        doc7RefundTaxRefundable5         : String(5);
        doc7RefundTaxAmount5             : Decimal(16, 2);
        doc7RefundTax6                   : String(6);
        doc7RefundTaxNatureCode6         : String(8);
        doc7RefundTaxType6               : String(20);
        doc7RefundTaxRefundable6         : String(5);
        doc7RefundTaxAmount6             : Decimal(16, 2);
        doc7RefundTax7                   : String(6);
        doc7RefundTaxNatureCode7         : String(8);
        doc7RefundTaxType7               : String(20);
        doc7RefundTaxRefundable7         : String(5);
        doc7RefundTaxAmount7             : Decimal(16, 2);
        doc7RefundTax8                   : String(6);
        doc7RefundTaxNatureCode8         : String(8);
        doc7RefundTaxType8               : String(20);
        doc7RefundTaxRefundable8         : String(5);
        doc7RefundTaxAmount8             : Decimal(16, 2);
        doc7RefundTax9                   : String(6);
        doc7RefundTaxNatureCode9         : String(8);
        doc7RefundTaxType9               : String(20);
        doc7RefundTaxRefundable9         : String(5);
        doc7RefundTaxAmount9             : Decimal(16, 2);
        doc7RefundTax10                  : String(6);
        doc7RefundTaxNatureCode10        : String(8);
        doc7RefundTaxType10              : String(20);
        doc7RefundTaxRefundable10        : String(5);
        doc7RefundTaxAmount10            : Decimal(16, 2);
        doc7RefundTax11                  : String(6);
        doc7RefundTaxNatureCode11        : String(8);
        doc7RefundTaxType11              : String(20);
        doc7RefundTaxRefundable11        : String(5);
        doc7RefundTaxAmount11            : Decimal(16, 2);
        doc7RefundTax12                  : String(6);
        doc7RefundTaxNatureCode12        : String(8);
        doc7RefundTaxType12              : String(20);
        doc7RefundTaxRefundable12        : String(5);
        doc7RefundTaxAmount12            : Decimal(16, 2);
        doc7RefundTax13                  : String(6);
        doc7RefundTaxNatureCode13        : String(8);
        doc7RefundTaxType13              : String(20);
        doc7RefundTaxRefundable13        : String(5);
        doc7RefundTaxAmount13            : Decimal(16, 2);
        doc7RefundTax14                  : String(6);
        doc7RefundTaxNatureCode14        : String(8);
        doc7RefundTaxType14              : String(20);
        doc7RefundTaxRefundable14        : String(5);
        doc7RefundTaxAmount14            : Decimal(16, 2);
        doc7RefundTax15                  : String(6);
        doc7RefundTaxNatureCode15        : String(8);
        doc7RefundTaxType15              : String(20);
        doc7RefundTaxRefundable15        : String(5);
        doc7RefundTaxAmount15            : Decimal(16, 2);
        doc7RefundTax16                  : String(6);
        doc7RefundTaxNatureCode16        : String(8);
        doc7RefundTaxType16              : String(20);
        doc7RefundTaxRefundable16        : String(5);
        doc7RefundTaxAmount16            : Decimal(16, 2);
        doc7RefundTax17                  : String(6);
        doc7RefundTaxNatureCode17        : String(8);
        doc7RefundTaxType17              : String(20);
        doc7RefundTaxRefundable17        : String(5);
        doc7RefundTaxAmount17            : Decimal(16, 2);
        doc7RefundTax18                  : String(6);
        doc7RefundTaxNatureCode18        : String(8);
        doc7RefundTaxType18              : String(20);
        doc7RefundTaxRefundable18        : String(5);
        doc7RefundTaxAmount18            : Decimal(16, 2);
        doc7RefundTax19                  : String(6);
        doc7RefundTaxNatureCode19        : String(8);
        doc7RefundTaxType19              : String(20);
        doc7RefundTaxRefundable19        : String(5);
        doc7RefundTaxAmount19            : Decimal(16, 2);
        doc7RefundTax20                  : String(6);
        doc7RefundTaxNatureCode20        : String(8);
        doc7RefundTaxType20              : String(20);
        doc7RefundTaxRefundable20        : String(5);
        doc7RefundTaxAmount20            : Decimal(16, 2);
        doc7RefundedCouponNumbers        : String(100);
        doc7RefundingEntityIata          : String(20);
        doc7RefundRoe                    : Decimal(12, 8);
        doc7RefundOriginalCurrency       : String(10);
        ADDITIONALCOLLECTIONFARE         : Decimal(16, 2);
        ISSUEDINEXCHANGEFOR              : String(15);
        UNIQUEROWIDENTIFIER              : String(255);
        RECORDNUMBER                     : Integer;
        EXCHANGEDCOUPONS                 : String(100);
        BILLINGPERIOD                    : String(15);
        REPORTINGPERIOD                  : String(15);
        PRORATEFACTORSUM                 : Decimal(16, 2);
        TOTALTAXCOUNT                    : Integer;
        ADDITIONALTAXES                  : String(5000);
        eventVersion                     : Integer;
        exchangedTicketNumbers           : String(500);
        coupons                          : Association to many Coupon
                                               on  coupons.documentNbr = primaryDocumentNbr
                                               and coupons.company     = company
                                               and coupons.PNR         = PNR;
        Gstn                             : Association to GSTIN
                                               on Gstn.gstin = gstin;
        Company                          : Association to Company
                                               on Company.code = company
}

entity Coupon {
    key company                                 : type of Company : code;
    key ID                                      : UUID;
    key number                                  : Integer;
        eventId                                 : Integer;
        PNR                                     : String(8);
        documentNbr                             : type of Document : primaryDocumentNbr;
        internalid                              : String(15);
        type                                    : String(10);
        issueIndicator                          : String(15);
        ticketDocumentNbr                       : String(15);
        conjunctiveNumber                       : Integer;
        conjunctiveDocumentNbr                  : String(15);
        reasonForIssuanceSubCode                : String(3);
        directionIndicator                      : String(1);
        originAirport                           : type of AirportCodes : airportCode;
        destinationAirport                      : type of AirportCodes : airportCode;
        operatingCabinClass                     : String(1);
        bookingCabinClass                       : String(1);
        marketingCabinClass                     : String(1);
        baseAmount                              : Decimal(16, 2);
        tax1                                    : String(6);
        taxNatureCode1                          : String(6);
        taxType1                                : String(20);
        taxRefundable1                          : String(5);
        taxAmount1                              : Decimal(16, 2);
        tax2                                    : String(6);
        taxNatureCode2                          : String(6);
        taxType2                                : String(20);
        taxRefundable2                          : String(5);
        taxAmount2                              : Decimal(16, 2);
        tax3                                    : String(6);
        taxNatureCode3                          : String(6);
        taxType3                                : String(20);
        taxRefundable3                          : String(5);
        taxAmount3                              : Decimal(16, 2);
        tax4                                    : String(6);
        taxNatureCode4                          : String(6);
        taxType4                                : String(20);
        taxRefundable4                          : String(5);
        taxAmount4                              : Decimal(16, 2);
        tax5                                    : String(6);
        taxNatureCode5                          : String(6);
        taxType5                                : String(20);
        taxRefundable5                          : String(5);
        taxAmount5                              : Decimal(16, 2);
        tax6                                    : String(6);
        taxNatureCode6                          : String(6);
        taxType6                                : String(20);
        taxRefundable6                          : String(5);
        taxAmount6                              : Decimal(16, 2);
        tax7                                    : String(6);
        taxNatureCode7                          : String(6);
        taxType7                                : String(20);
        taxRefundable7                          : String(5);
        taxAmount7                              : Decimal(16, 2);
        tax8                                    : String(6);
        taxNatureCode8                          : String(6);
        taxType8                                : String(20);
        taxRefundable8                          : String(5);
        taxAmount8                              : Decimal(16, 2);
        tax9                                    : String(6);
        taxNatureCode9                          : String(6);
        taxType9                                : String(20);
        taxRefundable9                          : String(5);
        taxAmount9                              : Decimal(16, 2);
        tax10                                   : String(6);
        taxNatureCode10                         : String(6);
        taxType10                               : String(20);
        taxRefundable10                         : String(5);
        taxAmount10                             : Decimal(16, 2);
        tax11                                   : String(6);
        taxNatureCode11                         : String(6);
        taxType11                               : String(20);
        taxRefundable11                         : String(5);
        taxAmount11                             : Decimal(16, 2);
        tax12                                   : String(6);
        taxNatureCode12                         : String(6);
        taxType12                               : String(20);
        taxRefundable12                         : String(5);
        taxAmount12                             : Decimal(16, 2);
        tax13                                   : String(6);
        taxNatureCode13                         : String(6);
        taxType13                               : String(20);
        taxRefundable13                         : String(5);
        taxAmount13                             : Decimal(16, 2);
        tax14                                   : String(6);
        taxNatureCode14                         : String(6);
        taxType14                               : String(20);
        taxRefundable14                         : String(5);
        taxAmount14                             : Decimal(16, 2);
        tax15                                   : String(6);
        taxNatureCode15                         : String(6);
        taxType15                               : String(20);
        taxRefundable15                         : String(5);
        taxAmount15                             : Decimal(16, 2);
        tax16                                   : String(6);
        taxNatureCode16                         : String(6);
        taxType16                               : String(20);
        taxRefundable16                         : String(5);
        taxAmount16                             : Decimal(16, 2);
        tax17                                   : String(6);
        taxNatureCode17                         : String(6);
        taxType17                               : String(20);
        taxRefundable17                         : String(5);
        taxAmount17                             : Decimal(16, 2);
        tax18                                   : String(6);
        taxNatureCode18                         : String(6);
        taxType18                               : String(20);
        taxRefundable18                         : String(5);
        taxAmount18                             : Decimal(16, 2);
        tax19                                   : String(6);
        taxNatureCode19                         : String(6);
        taxType19                               : String(20);
        taxRefundable19                         : String(5);
        taxAmount19                             : Decimal(16, 2);
        tax20                                   : String(6);
        taxNatureCode20                         : String(6);
        taxType20                               : String(20);
        taxRefundable20                         : String(5);
        taxAmount20                             : Decimal(16, 2);
        orginalFileName                         : String(255);
        convertedFileName                       : String(255);
        rowId                                   : Integer;
        createdAt                               : Timestamp;
        refundedCouponNumbers                   : String(30);
        dateOfIssuance                          : Date;
        primaryDocumentNbr                      : String(15);
        entityStatus                            : String(20);
        eventNumber                             : String(20);
        fareBasisCode                           : String(15);
        baggageAllowanceQuantity                : Integer;
        baggageAllowanceWeight                  : Decimal(16, 3);
        baggageAllowanceWeightUnit              : String(10);
        baggageAllowanceSeatUsedForBaggage      : String(20);
        baggageAllowanceRatePerUnitAmount       : Decimal(16, 2);
        baggageAllowanceRatePerUnitCurrencyCode : String(10);
        rfiscDescription                        : String(255);
        refundedFareCpnLvl1                     : String(10);
        refundedFareCpnLvl2                     : String(10);
        refundedFareCpnLvl3                     : String(10);
        refundedFareCpnLvl4                     : String(10);
        refundedFareCpnLvl5                     : String(10);
        feeCode1                                : String(10);
        feeAmount1                              : Decimal(16, 2);
        feeCode2                                : String(10);
        feeAmount2                              : Decimal(16, 2);
        feeCode3                                : String(10);
        feeAmount3                              : Decimal(16, 2);
        feeCode4                                : String(10);
        feeAmount4                              : Decimal(16, 2);
        feeCode5                                : String(10);
        feeAmount5                              : Decimal(16, 2);
        refundTax1                              : String(6);
        refundTaxNatureCode1                    : String(8);
        refundTaxType1                          : String(20);
        refundTaxRefundable1                    : String(5);
        refundTaxAmount1                        : Decimal(16, 2);
        refundTax2                              : String(6);
        refundTaxNatureCode2                    : String(8);
        refundTaxType2                          : String(20);
        refundTaxRefundable2                    : String(5);
        refundTaxAmount2                        : Decimal(16, 2);
        refundTax3                              : String(6);
        refundTaxNatureCode3                    : String(8);
        refundTaxType3                          : String(20);
        refundTaxRefundable3                    : String(5);
        refundTaxAmount3                        : Decimal(16, 2);
        refundTax4                              : String(6);
        refundTaxNatureCode4                    : String(8);
        refundTaxType4                          : String(20);
        refundTaxRefundable4                    : String(5);
        refundTaxAmount4                        : Decimal(16, 2);
        refundTax5                              : String(6);
        refundTaxNatureCode5                    : String(8);
        refundTaxType5                          : String(20);
        refundTaxRefundable5                    : String(5);
        refundTaxAmount5                        : Decimal(16, 2);
        refundTax6                              : String(6);
        refundTaxNatureCode6                    : String(8);
        refundTaxType6                          : String(20);
        refundTaxRefundable6                    : String(5);
        refundTaxAmount6                        : Decimal(16, 2);
        refundTax7                              : String(6);
        refundTaxNatureCode7                    : String(8);
        refundTaxType7                          : String(20);
        refundTaxRefundable7                    : String(5);
        refundTaxAmount7                        : Decimal(16, 2);
        refundTax8                              : String(6);
        refundTaxNatureCode8                    : String(8);
        refundTaxType8                          : String(20);
        refundTaxRefundable8                    : String(5);
        refundTaxAmount8                        : Decimal(16, 2);
        refundTax9                              : String(6);
        refundTaxNatureCode9                    : String(8);
        refundTaxType9                          : String(20);
        refundTaxRefundable9                    : String(5);
        refundTaxAmount9                        : Decimal(16, 2);
        refundTax10                             : String(6);
        refundTaxNatureCode10                   : String(8);
        refundTaxType10                         : String(20);
        refundTaxRefundable10                   : String(5);
        refundTaxAmount10                       : Decimal(16, 2);
        refundTax11                             : String(6);
        refundTaxNatureCode11                   : String(8);
        refundTaxType11                         : String(20);
        refundTaxRefundable11                   : String(5);
        refundTaxAmount11                       : Decimal(16, 2);
        refundTax12                             : String(6);
        refundTaxNatureCode12                   : String(8);
        refundTaxType12                         : String(20);
        refundTaxRefundable12                   : String(5);
        refundTaxAmount12                       : Decimal(16, 2);
        refundTax13                             : String(6);
        refundTaxNatureCode13                   : String(8);
        refundTaxType13                         : String(20);
        refundTaxRefundable13                   : String(5);
        refundTaxAmount13                       : Decimal(16, 2);
        refundTax14                             : String(6);
        refundTaxNatureCode14                   : String(8);
        refundTaxType14                         : String(20);
        refundTaxRefundable14                   : String(5);
        refundTaxAmount14                       : Decimal(16, 2);
        refundTax15                             : String(6);
        refundTaxNatureCode15                   : String(8);
        refundTaxType15                         : String(20);
        refundTaxRefundable15                   : String(5);
        refundTaxAmount15                       : Decimal(16, 2);
        refundTax16                             : String(6);
        refundTaxNatureCode16                   : String(8);
        refundTaxType16                         : String(20);
        refundTaxRefundable16                   : String(5);
        refundTaxAmount16                       : Decimal(16, 2);
        refundTax17                             : String(6);
        refundTaxNatureCode17                   : String(8);
        refundTaxType17                         : String(20);
        refundTaxRefundable17                   : String(5);
        refundTaxAmount17                       : Decimal(16, 2);
        refundTax18                             : String(6);
        refundTaxNatureCode18                   : String(8);
        refundTaxType18                         : String(20);
        refundTaxRefundable18                   : String(5);
        refundTaxAmount18                       : Decimal(16, 2);
        refundTax19                             : String(6);
        refundTaxNatureCode19                   : String(8);
        refundTaxType19                         : String(20);
        refundTaxRefundable19                   : String(5);
        refundTaxAmount19                       : Decimal(16, 2);
        refundTax20                             : String(6);
        refundTaxNatureCode20                   : String(8);
        refundTaxType20                         : String(20);
        refundTaxRefundable20                   : String(5);
        refundTaxAmount20                       : Decimal(16, 2);
        refundFeeCode1                          : String(6);
        refundFeeAmount1                        : Decimal(16, 2);
        refundFeeCode2                          : String(6);
        refundFeeAmount2                        : Decimal(16, 2);
        refundFeeCode3                          : String(6);
        refundFeeAmount3                        : Decimal(16, 2);
        refundFeeCode4                          : String(6);
        refundFeeAmount4                        : Decimal(16, 2);
        refundFeeCode5                          : String(6);
        refundFeeAmount5                        : Decimal(16, 2);
        refundFeeCode6                          : String(6);
        refundFeeAmount6                        : Decimal(16, 2);
        refundFeeCode7                          : String(6);
        refundFeeAmount7                        : Decimal(16, 2);
        PRORATEFACTOR                           : Decimal(16, 2);
        TURNAROUNDSTATIONCODE                   : String(20);
        exchangeBalanceCouponLevel              : Decimal(16, 2);
        HeaderDocuments                         : Association to Document
                                                      on  HeaderDocuments.primaryDocumentNbr = documentNbr
                                                      and HeaderDocuments.company            = company;
        OrginAirport                            : Association to AirportCodes
                                                      on OrginAirport.airportCode = originAirport;
        Company                                 : Association to Company
                                                      on Company.code = company
}

entity Invoice : cuid, managed {
    key company                    : type of Company : code not null    @title : 'Company';
        documentId                 : UUID;
        PNR                        : String(10);
        ticketNumber               : String(15)                         @title : 'Ticket Number';
        internalId                 : String(15);
        supplierGSTIN              : String(15)                         @title : 'Supplier GSTIN';
        passengerGSTIN             : String(15)                         @title : 'Passenger GSTIN';
        ticketIssueDate            : Date                               @title : 'Ticket Issue Date';
        invoiceDate                : Date                               @title : 'Invoice Date';
        invoiceNumber              : String(16)                         @title : 'Invoice Number';
        documentType               : String(20)                         @title : 'Document Type';
        transactionCode            : type of Document : transactionCode @title : 'Transaction Code';
        transactionType            : type of Document : transactionType @title : 'Transaction Type';
        ticketType                 : String(2)                          @title : 'Ticket Type';
        sectionType                : String(3)                          @title : 'Section Type';
        ticketClass                : String(3);
        eindia                     : String(1);
        exemptedZone               : String(1);
        b2b                        : String(1);
        IsSEZ                      : String(1);
        intrastate                 : String(1);
        isUT                       : String(1);
        taxCode                    : String(3);
        iataNumber                 : String(10)                         @title : 'IATA Number';
        gstR1Period                : String(6);
        gstR1filingStatus          : String(25);
        originalInvoiceNumber      : String(16);
        orginalInvoiceDate         : Date;
        originalGstin              : String(15);
        originalSectionType        : String(3);
        issueIndicator             : String(15)                         @title : 'Issue Indicator';
        routingType                : String(1);
        fullRouting                : String(255);
        oneWayIndicator            : String(1);
        directionIndicator         : String(1);
        placeOfSupply              : String(255);
        collectedTax               : String(255);
        taxableCalculation         : String(255);
        nonTaxableCalculation      : String(255)                        @title : 'Non Taxable Calculation';
        discountTaxableCalculation : String(255);
        netTaxableValue            : Decimal(16, 2);
        totalTax                   : Decimal(16, 2);
        totalInvoiceAmount         : Decimal(16, 2);
        documentCurrency           : Currency;
        xoNo                       : String(16);
        totalJourney               : String(255);
        journeyCovered             : String(255);
        fop                        : type of FOP : FOP;
        passangerName              : String(255);
        billToName                 : String(255);
        billToFullAddress          : String(500);
        billToCountry              : Country;
        billToStateCode            : String(2);
        billToPostalCode           : String(20);
        invoiceStatus              : String(25) default 'Active';
        isReverseChargeApplicable  : Boolean default false;
        SBRRecivedOn               : Timestamp;
        SBRProcessedOn             : Timestamp;
        amendmentRequestNo         : String(16)                         @title : 'Amendment No.';
        isAmended                  : Boolean default false;
        amendmentRequestedBy       : String(255)                        @title : 'Amendment Requested By';
        amendmentRequestedOn       : Timestamp                          @title : 'Amendment Requested On';
        amendmentReason            : String(255);
        amendementStatus           : String(3);
        amendmentApprovedOn        : Timestamp;
        amendmentApprovedBy        : String(255);
        amendmentRejectedBy        : String(255);
        amendmentRejectionReason   : String(255);
        amendmentType              : String(25);
        amendentedAddress          : String(255);
        amendementOldValue         : String(255);
        amendementNewValue         : String(255);
        airportCode                : String(4);
        originAirport              : String(4);
        destinationAirport         : String(4);
        OriginalDocumentNbr        : String(15);
        reasonForMemoCode          : String(255)                        @titile: 'Agency Memo Code';
        reasonForIssuanceCode      : String(10);
        status                     : String(25) default 'NEW';
        emailSend                  : Boolean default false              @UI.Hidden  @UI.HiddenFilter;
        type                       : type of Document : type            @UI.Hidden  @UI.HiddenFilter;
        exitIndiaCouponNo          : String(2)                          @UI.Hidden  @UI.HiddenFilter;
        refDocNbr                  : String(256)                        @titile: 'Conjunctive Ticket';
        isHistory                  : Boolean default false              @UI.Hidden  @UI.HiddenFilter;
        rfndStatus                 : String(15)                         @UI.Hidden  @UI.HiddenFilter;
        agencyCountryCode          : String(2)                          @UI.Hidden  @UI.HiddenFilter;
        InvoiceItems               : Association to many InvoiceItems
                                         on InvoiceItems.invoice = $self;
        InvoiceDocuments           : Association to many InvoiceDocuments
                                         on InvoiceDocuments.invoice = $self;
        AirportCodes               : Association to AirportCodes
                                         on AirportCodes.airportCode = airportCode;
        Company                    : Association to Company
                                         on Company.code = company;
        CompanyGSTINAdresses       : Association to CompanyGSTINAdresses
                                         on  CompanyGSTINAdresses.gstin                 = passengerGSTIN
                                         and CompanyGSTINAdresses.useForInvoicePrinting = true;
        FOP                        : Association to FOP
                                         on FOP.FOP = fop;
        StateCodes                 : Association to StateCodes
                                         on StateCodes.stateCode = placeOfSupply;
        TaxCodes                   : Association to TaxCodes
                                         on TaxCodes.taxCode = taxCode;
        TransactionTypes           : Association to TransactionTypes
                                         on TransactionTypes.transactionType = transactionCode;

}

entity InvoiceItems {
    key invoice                  : Association to Invoice;
    key invoiceSlNo              : Integer;
        descOfService            : String(255);
        HSNCode                  : String(8);
        valueOfService           : Decimal(16, 2) default 0.00;
        taxable                  : Decimal(16, 2) default 0.00;
        nonTaxable               : Decimal(16, 2) default 0.00;
        totalTaxableValue        : Decimal(16, 2) default 0.00;
        discount                 : Decimal(16, 2) default 0.00;
        netTaxableValue          : Decimal(16, 2) default 0.00;
        cgstRate                 : Decimal(16, 2) default 0.00;
        cgstAmount               : Decimal(16, 2) default 0.00;
        sgstRate                 : Decimal(16, 2) default 0.00;
        sgstAmount               : Decimal(16, 2) default 0.00;
        utgstRate                : Decimal(16, 2) default 0.00;
        utgstAmount              : Decimal(16, 2) default 0.00;
        igstRate                 : Decimal(16, 2) default 0.00;
        igstAmount               : Decimal(16, 2) default 0.00;
        collectedCgstRate        : Decimal(16, 2) default 0.00;
        collectedSgstRate        : Decimal(16, 2) default 0.00;
        collectedIgstRate        : Decimal(16, 2) default 0.00;
        collectedUtgstRate       : Decimal(16, 2) default 0.00;
        collectedCgst            : Decimal(16, 2) default 0.00;
        collectedSgst            : Decimal(16, 2) default 0.00;
        collectedIgst            : Decimal(16, 2) default 0.00;
        collectedutgst           : Decimal(16, 2) default 0.00;
        collectedInvoiceValue    : Decimal(16, 2) default 0.00;
        cess1Rate                : Decimal(16, 2) default 0.00;
        cess1Amount              : Decimal(16, 2) default 0.00;
        cess2Rate                : Decimal(16, 2) default 0.00;
        cess2Amount              : Decimal(16, 2) default 0.00;
        reasonForIssuanceSubCode : String(3);
        total_Tax                : Decimal(16, 2) default 0.00;
}

entity InvoiceDocuments : managed {
    key invoice          : Association to Invoice;
    key documentSlNo     : Integer;
        fileName         : String(256);
        fileId           : String(4);
        file             : LargeString;
        mimeType         : String(4);
        description      : String(4);
        documentStatus   : String(4);
        remarks          : String(256);
        cancelledTime    : Timestamp;
        cancelledBy      : String(256);
        sbrEmails        : String(256);
        adminEmails      : String(256);
        companyEmails    : String(256);
        documentNumber   : String(30);
        IsemailAttempted : Boolean default false;
}

entity SBR : managed {
    key company                   : String(4);
    key PNR                       : String(8);
    key primaryDocumentNbr        : String(15);
    key convertedFileName         : String(255);
    key rowNumber                 : Integer;
        airlineCode               : String(4);
        couponNumber              : String(15);
        bookingDate               : Date;
        fullRouting               : String(255);
        typeOfDocument            : String(1);
        envelopeNumber            : Integer;
        flightNumber              : Integer;
        departureDate             : Date;
        boardPoint                : String(3);
        offPoint                  : String(3);
        cabin                     : String(1);
        paxType                   : String(2);
        firstName                 : String(40);
        lastName                  : String(40);
        passengerTicketTattoo     : Integer;
        segmentsTattoo            : Integer;
        GSTIN                     : String(15);
        GSTEmail                  : String(255);
        GSTAddress                : String(255);
        orginalFileName           : String(255);
        gstinValidatedOn          : Timestamp;
        status                    : String(5) default 'NEW';
        COMPANY_NAME              : String(50);
        TICKET_ISSUANCE_TIMESTAMP : String(30);
}

entity CompanyMaster : managed {
    key ID                         : UUID                   @UI.HiddenFilter;
        agentCode                  : String(8)              @readonly                              @title: 'Agent Code'  @UI.HiddenFilter;
        companyName                : String(255)            @title: 'Company Name';
        companyRegistrationNumber  : String(21)             @title: 'Registration Number'          @UI.HiddenFilter;
        companyPan                 : String(10)             @readonly                              @title: 'PAN'         @UI.HiddenFilter;
        companyTan                 : String(10)             @title: 'TAN'                          @UI.HiddenFilter;
        address                    : String(500)            @title: 'Address'                      @UI.HiddenFilter;
        country                    : Country                @title: 'Country';
        state                      : String(40)             @title: 'State'                        @UI.HiddenFilter;
        region                     : String(40)             @title: 'Region'                       @UI.HiddenFilter;
        city                       : String(40)             @title: 'City'                         @UI.HiddenFilter;
        pincode                    : String(10)             @title: 'Pincode'                      @UI.HiddenFilter;
        contactNumber              : String(13)             @title: 'Contact Number'               @UI.HiddenFilter;
        website                    : String(255)            @title: 'Website'                      @UI.HiddenFilter;
        category                   : String(3)              @title: 'Category'                     @readOnly;
        isEcommerceOperator        : Boolean default false  @title: 'Is E-commerce Operator'       @UI.HiddenFilter;
        consulateEmbassyCountry    : Country                @title: 'Consulate / Embassy Country'  @UI.HiddenFilter;
        unShortCode                : String(20)             @title: 'UN Short Code'                @UI.HiddenFilter;
        status                     : String(3)              @title: 'Status'                       @UI.HiddenFilter      @readonly;
        virtual toggleIfAgent      : Boolean default false  @UI.HiddenFilter                       @UI.Hidden;
        virtual toggleButton       : Boolean default false  @UI.HiddenFilter                       @UI.Hidden;
        virtual toggleBasedOnAgent : Boolean default false  @UI.HiddenFilter                       @UI.Hidden;
        virtual togglePAN          : Boolean default false  @UI.HiddenFilter                       @UI.Hidden;
        virtual toggleGSTIN        : Boolean default false  @UI.HiddenFilter                       @UI.Hidden;
        virtual toggleTCS          : Boolean default false  @UI.HiddenFilter                       @UI.Hidden;
        virtual toggleIATACode     : Boolean default false  @UI.HiddenFilter;
        virtual criticality        : Boolean default false  @UI.HiddenFilter                       @UI.Hidden;
        virtual toggleEdit         : Boolean default false  @UI.HiddenFilter                       @UI.Hidden;
        virtual toggleNotEdit      : Boolean default false  @UI.HiddenFilter                       @UI.Hidden;
        virtual statusName         : String(20)             @UI.HiddenFilter;
        CategoryMaster             : Association to CategoryMaster
                                         on CategoryMaster.code = category;

        CompanyUsers               : Association to many CompanyUsers
                                         on CompanyUsers.companyId = ID;

        CompanyUserRoles           : Association to CompanyUserRoles
                                         on CompanyUserRoles.companyId = ID;
        StateCodes                 : Association to one StateCodes
                                         on StateCodes.stateCode = state;


        CompanyGSTIN               : Association to many CompanyGSTIN
                                         on CompanyGSTIN.companyId = ID;

        // CompanyGSTINAdresses       : Association to many CompanyGSTINAdresses
        //                                  on CompanyGSTINAdresses.companyId = ID;

        CompanyIATA                : Association to many CompanyIATA
                                         on CompanyIATA.companyId = ID;

        CompanyMasterTCS           : Association to many CompanyMasterTCS
                                         on CompanyMasterTCS.companyId = ID;

        CompanyDocuments           : Association to many CompanyDocuments
                                         on CompanyDocuments.companyId = ID;
}

entity CompanyGSTIN : managed {
    key companyId                   : UUID;
    key GSTIN                       : type of GSTIN : gstin;
        gsttype                     : String(50)            @readonly;
        IsEcommerceOperator         : Boolean default false;
        isRegisteredForGstAsSezUnit : Boolean default false;
        isRegisteredForGstAsPsuUnit : Boolean default false;
        dateOfIssueGST              : Date                  @readonly;
        GSTCertificate              : LargeString;
        default                     : Boolean default false @readonly;
        ARNNo                       : String(25);
        dateOfIssueARN              : Date;
        arnCertificate              : LargeString;
        address                     : String(510);
        country                     : Country               @readonly;
        state                       : String(40)            @readonly;
        city                        : String(40);
        pincode                     : String(10);
        status                      : String(20)            @readonly;
        lastValidatedOn             : Date                  @readonly;
        effectiveDate               : Date;
        newAddress                  : String(510);
        oldAddress                  : String(510);
        newState                    : String(40);
        newCity                     : String(40);
        newPincode                  : String(10);
        neweffectiveDate            : Date;
        newCountry                  : String(100)           @readonly;
        legalName                   : String(255);
        tradeName                   : String(255);
        CompanyMasters              : Association to CompanyMaster
                                          on CompanyMasters.ID = companyId;
        CompanyGSTINAdresses        : Association to many CompanyGSTINAdresses
                                          on  CompanyGSTINAdresses.companyId = companyId
                                          and CompanyGSTINAdresses.gstin     = GSTIN;


        // CompanyGSTIN               : Composition of many CompanyGSTIN
        //                                  on CompanyGSTIN.companyId = ID;
        StateCodes                  : Association to one StateCodes
                                          on StateCodes.stateCode = state;

}

entity CompanyGSTINAdresses : managed {
    key companyId             : UUID;
    key gstin                 : String(15) @readonly;
    key serialNo              : Integer    @readonly;
        type                  : String(50) @readonly;
        useForInvoicePrinting : Boolean default false;
    key effectiveFrom         : Date;
        effectiveTill         : Date       @readonly;
        address               : String(500);
        state                 : String(40) @readonly;
        stateName             : String(40) @readonly;
        city                  : String(40);
        pincode               : String(6);
        StateCodes            : Association to one StateCodes
                                    on StateCodes.stateCode = state;

        CompanyGSTIN          : Association to CompanyGSTIN
                                    on CompanyGSTIN.companyId = companyId;
}

entity CompanyIATA {
    key companyId           : UUID                                     @readonly  @UI.Hidden;
    key iataCode            : String(8)                                @readonly;
        legalName           : String(255)                              @readonly  @title: 'Legal Name'    @UI.HiddenFilter;
        tradeName           : String(255)                              @readonly  @title: 'Trade Name'    @UI.HiddenFilter;
        city                : String(255)                              @readonly  @title: 'City'          @UI.HiddenFilter;
        region              : String(255)                              @readonly  @title: 'Region'        @UI.HiddenFilter;
        countryName         : String(255)                              @readonly  @title: 'Country Name'  @UI.HiddenFilter;
        postalCode          : String(15)                               @readonly  @title: 'Postal Code'   @UI.HiddenFilter;
        isEcommerceOperator : Boolean default false                    @title: 'Is E-commerce Operator';
        CompanyMasters      : Association to CompanyMaster
                                  on CompanyMasters.ID = companyId;
        AgentMaster         : Association to one AgentMaster
                                  on AgentMaster.iataNumber = iataCode @readonly;
}

entity userIATA {
    key companyId              : UUID;
    key userId                 : UUID;
    key iataCode               : String(8);
        siteType               : String(3)             @title: 'Site Type';
        legalName              : String(255)           @title: 'Legal Name';
        tradeName              : String(255)           @title: 'Trade Name';
        city                   : String(255)           @title: 'City';
        region                 : String(255)           @title: 'Region';
        countryName            : String(255)           @title: 'Country Name';
        postalCode             : String(15)            @title: 'Postal Code';
        crossReferenceAgentNum : String(15)            @title: 'Cross Reference Agent No.';
        isEcommerceOperator    : Boolean default false @title: 'Is E-commerce Operator';
}


entity CompanyMasterTCS {
    key companyId         : UUID;
    key TCSGSTNo          : String(15);
        IATACode          : String(8) not null;
        type              : String(3);
        dateOfIssue       : Date;
        TCSGSTCertificate : LargeString;
        dateOfIssueARN    : Date;
        address           : String(255) not null;
        state             : String(40) not null;
        city              : String(40) not null;
        pincode           : String(10) not null;
        companyContactNo  : String(20) not null;
        companyEmail      : String(255) not null;
        mobile            : String(20) not null;
        CompanyMasters    : Association to CompanyMaster
                                on CompanyMasters.ID = companyId;
}

entity CompanyUsers : cuid, managed {
    key companyId             : UUID;
        loginEmail            : String(255) not null   @title: 'Email'                     @readonly;
        password              : String(80) not null    @title: 'Password'                  @readonly;
        title                 : String(5) not null     @title: 'Title';
        firstName             : String(40) not null    @title: 'First Name';
        lastName              : String(40) not null    @title: 'Last Name';
        mobile                : String(13) not null    @title: 'Mobile';
        lastLoggedOn          : Timestamp              @title: 'Last Logged On'            @readonly;
        lastPasswordChangedOn : Timestamp              @title: 'Last Password Changed On'  @readonly;
        loginAttempts         : Integer                @title: 'Login Attempts'            @readonly;
        failedAttempts        : Integer                @title: 'Failed Attempts'           @readonly;
        lastFailedLoginDate   : Timestamp              @title: 'Last Failed Login Date'    @readonly;
        status                : String(1)              @title: 'Status'                    @readonly;
        isIntialLogin         : Boolean default false  @title: 'Is Initial Login'          @readonly;
        reasonForDeactivation : String(255)            @title: 'Reason'                    @readonly;
        reactivatedOn         : Timestamp              @title: 'Reactivated On'            @readonly;
        reactivatedBy         : String(255)            @title: 'Reactivated By'            @readonly;
        virtual criticality   : Integer;
        jwt                   : String(1500)           @title: 'JWT'                       @UI.Hidden  @UI.HiddenFilter  @readonly;
        jwtExpiresOn          : Timestamp              @title: 'JWT Expires On'            @UI.Hidden  @UI.HiddenFilter  @readonly;

        CompanyMasters        : Association to CompanyMaster
                                    on CompanyMasters.ID = companyId;
        CompanyUserRoles      : Association to CompanyUserRoles
                                    on CompanyUserRoles.userId = ID;
}

entity CompanyUserRoles : managed {
    key companyId           : UUID;
    key userId              : UUID;
        validFrom           : Date;
        validTill           : Date;
        isAdmin             : Boolean default false @readonly;
        canAddGSTIN         : Boolean default false;
        canEditGSTINAddress : Boolean default false;
        canAmendmentRequest : Boolean default false;
        canAmendmentApprove : Boolean default false;
        canEditGst          : Boolean default false;
        approvedBy          : String(255);
        approvedOn          : Timestamp;
        approvedAt          : Timestamp;
        CompanyMasters      : Association to CompanyMaster
                                  on CompanyMasters.ID = companyId;
        CompanyUsers        : Association to CompanyUsers
                                  on  CompanyUsers.ID        = userId
                                  and CompanyUsers.companyId = companyId;
}

entity UserDefault {
    key userId        : UUID;
        defaultPeriod : String(2);
        CompanyUsers  : Association to CompanyUsers
                            on CompanyUsers.ID = userId

}

entity UserDefaultGSTIN : managed {
    key companyId      : UUID;
    key userId         : UUID;
    key GSTIN          : String(15);
        isDefault      : Boolean default false;
        CompanyMasters : Association to CompanyMaster
                             on CompanyMasters.ID = companyId;
        CompanyUsers   : Association to CompanyUsers
                             on  CompanyUsers.ID        = userId
                             and CompanyUsers.companyId = companyId;
}

entity CompanyDocuments : cuid {
    key companyId        : UUID         @UI.Hidden               @readOnly;
        documentTypeCode : String(10)   @title: 'Document Type'  @readOnly;
        fileName         : String(100)  @title: 'File Name'      @readOnly;
        fileId           : String(36)   @UI.Hidden               @readOnly;
        mimeType         : String(255)  @title: 'Mime Type'      @readOnly;
        issuedOn         : Date         @title: 'Issued On'      @readOnly;
        file             : LargeString  @title: 'File'           @readOnly;
        validFrom        : Date         @title: 'Valid From'     @readOnly;
        validTo          : Date         @title: 'Valid To'       @readOnly;
        CompanyMasters   : Association to CompanyMaster
                               on CompanyMasters.ID = companyId;
        DocumentCategory : Association to DocumentCategory
                               on DocumentCategory.documentTypeCode = documentTypeCode;
}


entity AuditTrail {
    key ID                     : UUID               @UI.Hidden  @UI.HiddenFilter;
        companyCode            : type of Company : code not null;
        companyId              : String(255);
        companyName            : String(255)        @title: 'Company Name';
        module                 : String(50) not null;
        eventId                : String(50) not null;
        eventName              : String(255)        @UI.HiddenFilter;
        businessDocumentId     : String(50)         @UI.HiddenFilter;
        finalStatus            : String(10)         @UI.HiddenFilter;
        finalStatusMessageText : String(255)        @UI.HiddenFilter;
        userId                 : String(255);
        createdAt              : Timestamp not null @UI.HiddenFilter;
        createdBy              : String(255)        @UI.HiddenFilter;
        modifiedAt             : Timestamp          @UI.HiddenFilter;
        modifiedBy             : String(255)        @UI.HiddenFilter;
        attributeName          : String(255)        @UI.HiddenFilter;
        oldValue               : String(500)        @UI.HiddenFilter;
        newValue               : String(500)        @UI.HiddenFilter;
        Company                : Association to Company
                                     on Company.code = companyCode;
        User                   : Association to one CompanyUsers
                                     on User.ID = userId;
        CompanyMaster          : Association to one CompanyMaster
                                     on CompanyMaster.ID = companyId;
}

entity AuditTrailItems {
    key auditID            : type of AuditTrail : ID;
    key item               : UUID not null;
        businessDocumentId : String(50);
        attributeName      : String(255);
        oldValue           : String(500);
        newValue           : String(500);
        AuditTrail         : Association to AuditTrail
                                 on AuditTrail.ID = auditID;
}

entity Logs {
    key ID          : UUID not null;
        module      : String(20) not null;
        message     : String(500);
        logDateTime : Timestamp not null;
        logType     : String(50) not null;
}

entity InvoiceSerial {
    key ID            : String(10);
        runningNumber : String(6);
}

entity ProcessErrors {
    CODE    : String(500);
    MESSAGE : String(3000);
}

entity Events {
    key company        : String(4);
    key area           : String(10);
    key eventLabel     : String(6);
    key eventCode      : String(15);
        eventName      : String(100);
        eventAccounted : String(1);
        trigger        : String(200);
        invoicing      : String(1);
}

entity ConsulateEmbassyMaster {
    key country             : Country      @title: 'Country';
    key gstinUIN            : String(15)   @title: 'GSTIN/UIN';
        taxpayerType        : String(255)  @title: 'Tax Payer Type'        @UI.HiddenFilter;
        legalNameOfBusiness : String(255)  @title: 'Legal Name'            @UI.HiddenFilter;
        tradeName           : String(255)  @title: 'Trade Name'            @UI.HiddenFilter;
        gstinStatus         : String(15)   @title: 'Status'                @UI.HiddenFilter;
        dateOfCancellation  : Date         @title: 'Date of Cancellation'  @UI.HiddenFilter;

}

entity UNBodyMaster {
    key gstinUIN            : String(15)   @title: 'GSTIN/UIN';
        taxpayerType        : String(255)  @title: 'Tax Payer Type'        @UI.HiddenFilter;
        legalNameOfBusiness : String(255)  @title: 'Legal Name'            @UI.HiddenFilter;
        shortName           : String(20)   @title: 'Short Name'            @UI.HiddenFilter;
        tradeName           : String(255)  @title: 'Trade Name'            @UI.HiddenFilter;
        gstinStatus         : String(15)   @title: 'Status'                @UI.HiddenFilter;
        dateOfCancellation  : Date         @title: 'Date of Cancellation'  @UI.HiddenFilter;
}

entity AgentMaster {
    key iataNumber             : String(10)             @title: 'IATA Code';
        siteType               : String(3)              @title: 'Site Type';
        legalName              : String(255)            @title: 'Legal Name'              @UI.HiddenFilter;
        tradeName              : String(255)            @title: 'Trade Name'              @UI.HiddenFilter;
        city                   : String(255)            @title: 'City'                    @UI.HiddenFilter;
        region                 : String(255)            @title: 'Region';
        regionCode             : String(3)              @title: 'Region Code'             @UI.HiddenFilter;
        countryName            : String(255)            @title: 'Country Name';
        country                : Country                @title: 'Country'                 @UI.HiddenFilter;
        postalCode             : String(15)             @title: 'Postal Code'             @UI.HiddenFilter;
        crossReferenceAgentNum : String(15)             @title: 'Cross Reference Agent No.';
        isEcommerceOperator    : Boolean default false  @title: 'Is E-commerce Operator'  @UI.HiddenFilter;
        CREATEDAT              : Timestamp              @UI.HiddenFilter;
        CONVERTEDFILENAME      : String(255)            @UI.HiddenFilter;
}

entity AgencyMemo {
    key ID                                     : String(36)     @title: 'ID';
        MEMOTYPE                               : String(20)     @title: 'MEMOTYPE';
        STATUS                                 : String(10)     @title: 'STATUS';
        LASTUPDATEDATE                         : String(15)     @title: 'LASTUPDATEDATE';
        MEMONUMBER                             : String(50)     @title: 'MEMONUMBER';
        DATEOFISSUE                            : String(15)     @title: 'DATEOFISSUE';
        DISPUTEDATE                            : String(15)     @title: 'DISPUTEDATE';
        DISPUTEAPPROVEDDATE                    : String(15)     @title: 'DISPUTEAPPROVEDDATE';
        DISPUTEREJECTEDDATE                    : String(15)     @title: 'DISPUTEREJECTEDDATE';
        IATANUMBER                             : String(10)     @title: 'IATA Number';
        ISOCOUNTRYCODE                         : String(10)     @title: 'ISOCOUNTRYCODE';
        OFFICEID                               : String(255)    @title: 'OFFICEID';
        AGENTSINE                              : String(255)    @title: 'AGENTSINE';
        BILLINGPERIODWEEK                      : Integer        @title: 'BILLINGPERIODWEEK';
        BILLINGPERIODMONTH                     : Integer        @title: 'BILLINGPERIODMONTH';
        BILLINGPERIODYEAR                      : Integer        @title: 'BILLINGPERIODYEAR';
        AIRLINECONTACTCONTACTNAME              : String(255)    @title: 'AIRLINECONTACTCONTACTNAME';
        AIRLINECONTACTPHONEFAX                 : String(20)     @title: 'AIRLINECONTACTPHONEFAX';
        AIRLINECONTACTEMAIL                    : String(255)    @title: 'AIRLINECONTACTEMAIL';
        AIRLINECONTACTOWNERTEAM                : String(255)    @title: 'AIRLINECONTACTOWNERTEAM';
        REASONFORMEMOCODE                      : String(255)    @title: 'REASONFORMEMOCODE';
        EVENTNUMBER                            : Integer        @title: 'EVENTNUMBER';
        EVENTTYPE                              : String(255)    @title: 'EVENTTYPE';
        EVENT                                  : String(15)     @title: 'EVENT';
        ENTITYSTATUS                           : String(20)     @title: 'ENTITYSTATUS';
        EVENTTYPESHORTCODE                     : String(20)     @title: 'EVENTTYPESHORTCODE';
        JOURNALDATE                            : String(15)     @title: 'JOURNALDATE';
        WITHUPDATEDACCOUNTEDDATE               : String(15)     @title: 'WITHUPDATEDACCOUNTEDDATE';
        CREATEDBY                              : String(10)     @title: 'CREATEDBY';
        MICURRENCYCODE                         : String(10)     @title: 'MICURRENCYCODE';
        MIREMITTANCEAMOUNT                     : Decimal(16, 2) @title: 'MIREMITTANCEAMOUNT';
        MIREMITTANCEAMOUNTCURRENCYCODE         : String(10)     @title: 'MIREMITTANCEAMOUNTCURRENCYCODE';
        MISETTLEDAMOUNT                        : Decimal(16, 2) @title: 'MISETTLEDAMOUNT';
        MISETTLEDAMOUNTCURRENCYCODE            : String(10)     @title: 'MISETTLEDAMOUNTCURRENCYCODE';
        CUMULATIVEPAIDAMOUNTAMOUNT1            : Decimal(16, 2) @title: 'CUMULATIVEPAIDAMOUNTAMOUNT1';
        CUMULATIVEPAIDAMOUNTCURRENCYCODE1      : String(10)     @title: 'CUMULATIVEPAIDAMOUNTCURRENCYCODE1';
        CUMULATIVEPAIDAMOUNTAMOUNT2            : Decimal(16, 2) @title: 'CUMULATIVEPAIDAMOUNTAMOUNT2';
        CUMULATIVEPAIDAMOUNTCURRENCYCODE2      : String(10)     @title: 'CUMULATIVEPAIDAMOUNTCURRENCYCODE2';
        CUMULATIVEPAIDAMOUNTAMOUNT3            : Decimal(16, 2) @title: 'CUMULATIVEPAIDAMOUNTAMOUNT3';
        CUMULATIVEPAIDAMOUNTCURRENCYCODE3      : String(10)     @title: 'CUMULATIVEPAIDAMOUNTCURRENCYCODE3';
        CUMULATIVEPAIDAMOUNTAMOUNT4            : Decimal(16, 2) @title: 'CUMULATIVEPAIDAMOUNTAMOUNT4';
        CUMULATIVEPAIDAMOUNTCURRENCYCODE4      : String(10)     @title: 'CUMULATIVEPAIDAMOUNTCURRENCYCODE4';
        CUMULATIVEPAIDAMOUNTAMOUNT5            : Decimal(16, 2) @title: 'CUMULATIVEPAIDAMOUNTAMOUNT5';
        CUMULATIVEPAIDAMOUNTCURRENCYCODE5      : String(10)     @title: 'CUMULATIVEPAIDAMOUNTCURRENCYCODE5';
        NEWREMITTANCEAMOUNTAMOUNT1             : Decimal(16, 2) @title: 'NEWREMITTANCEAMOUNTAMOUNT1';
        NEWREMITTANCEAMOUNTCURRENCYCODE1       : String(10)     @title: 'NEWREMITTANCEAMOUNTCURRENCYCODE1';
        NEWREMITTANCEAMOUNTAMOUNT2             : Decimal(16, 2) @title: 'NEWREMITTANCEAMOUNTAMOUNT2';
        NEWREMITTANCEAMOUNTCURRENCYCODE2       : String(10)     @title: 'NEWREMITTANCEAMOUNTCURRENCYCODE2';
        NEWREMITTANCEAMOUNTAMOUNT3             : Decimal(16, 2) @title: 'NEWREMITTANCEAMOUNTAMOUNT3';
        NEWREMITTANCEAMOUNTCURRENCYCODE3       : String(10)     @title: 'NEWREMITTANCEAMOUNTCURRENCYCODE3';
        NEWREMITTANCEAMOUNTAMOUNT4             : Decimal(16, 2) @title: 'NEWREMITTANCEAMOUNTAMOUNT4';
        NEWREMITTANCEAMOUNTCURRENCYCODE4       : String(10)     @title: 'NEWREMITTANCEAMOUNTCURRENCYCODE4';
        NEWREMITTANCEAMOUNTAMOUNT5             : Decimal(16, 2) @title: 'NEWREMITTANCEAMOUNTAMOUNT5';
        NEWREMITTANCEAMOUNTCURRENCYCODE5       : String(10)     @title: 'NEWREMITTANCEAMOUNTCURRENCYCODE5';
        CUMULATEDDISPUTEAPPROVEDAMOUNT1        : Decimal(16, 2) @title: 'CUMULATEDDISPUTEAPPROVEDAMOUNT1';
        CUMULATEDDISPUTEAPPROVEDCURRENCYCODE1  : String(10)     @title: 'CUMULATEDDISPUTEAPPROVEDCURRENCYCODE1';
        CUMULATEDDISPUTEAPPROVEDAMOUNT2        : Decimal(16, 2) @title: 'CUMULATEDDISPUTEAPPROVEDAMOUNT2';
        CUMULATEDDISPUTEAPPROVEDCURRENCYCODE2  : String(10)     @title: 'CUMULATEDDISPUTEAPPROVEDCURRENCYCODE2';
        CUMULATEDDISPUTEAPPROVEDAMOUNT3        : Decimal(16, 2) @title: 'CUMULATEDDISPUTEAPPROVEDAMOUNT3';
        CUMULATEDDISPUTEAPPROVEDCURRENCYCODE3  : String(10)     @title: 'CUMULATEDDISPUTEAPPROVEDCURRENCYCODE3';
        CUMULATEDDISPUTEAPPROVEDAMOUNT4        : Decimal(16, 2) @title: 'CUMULATEDDISPUTEAPPROVEDAMOUNT4';
        CUMULATEDDISPUTEAPPROVEDCURRENCYCODE4  : String(10)     @title: 'CUMULATEDDISPUTEAPPROVEDCURRENCYCODE4';
        CUMULATEDDISPUTEAPPROVEDAMOUNT5        : Decimal(16, 2) @title: 'CUMULATEDDISPUTEAPPROVEDAMOUNT5';
        CUMULATEDDISPUTEAPPROVEDCURRENCYCODE5  : String(10)     @title: 'CUMULATEDDISPUTEAPPROVEDCURRENCYCODE5';
        ACCOUNTEDAMOUNTDIFFBUDGETAMOUNT1       : Decimal(16, 2) @title: 'ACCOUNTEDAMOUNTDIFFBUDGETAMOUNT1';
        ACCOUNTEDAMOUNTDIFFBUDGETCURRENCYCODE1 : String(10)     @title: 'ACCOUNTEDAMOUNTDIFFBUDGETCURRENCYCODE1';
        ACCOUNTEDAMOUNTDIFFBUDGETAMOUNT2       : Decimal(16, 2) @title: 'ACCOUNTEDAMOUNTDIFFBUDGETAMOUNT2';
        ACCOUNTEDAMOUNTDIFFBUDGETCURRENCYCODE2 : String(10)     @title: 'ACCOUNTEDAMOUNTDIFFBUDGETCURRENCYCODE2';
        ACCOUNTEDAMOUNTDIFFBUDGETAMOUNT3       : Decimal(16, 2) @title: 'ACCOUNTEDAMOUNTDIFFBUDGETAMOUNT3';
        ACCOUNTEDAMOUNTDIFFBUDGETCURRENCYCODE3 : String(10)     @title: 'ACCOUNTEDAMOUNTDIFFBUDGETCURRENCYCODE3';
        ACCOUNTEDAMOUNTDIFFBUDGETAMOUNT4       : Decimal(16, 2) @title: 'ACCOUNTEDAMOUNTDIFFBUDGETAMOUNT4';
        ACCOUNTEDAMOUNTDIFFBUDGETCURRENCYCODE4 : String(10)     @title: 'ACCOUNTEDAMOUNTDIFFBUDGETCURRENCYCODE4';
        ACCOUNTEDAMOUNTDIFFBUDGETAMOUNT5       : Decimal(16, 2) @title: 'ACCOUNTEDAMOUNTDIFFBUDGETAMOUNT5';
        ACCOUNTEDAMOUNTDIFFBUDGETCURRENCYCODE5 : String(10)     @title: 'ACCOUNTEDAMOUNTDIFFBUDGETCURRENCYCODE5';
        BALANCEBUDGETNUMBERAMOUNT1             : Decimal(16, 2) @title: 'BALANCEBUDGETNUMBERAMOUNT1';
        BALANCEBUDGETNUMBERCURRENCYCODE1       : String(10)     @title: 'BALANCEBUDGETNUMBERCURRENCYCODE1';
        BALANCEBUDGETNUMBERAMOUNT2             : Decimal(16, 2) @title: 'BALANCEBUDGETNUMBERAMOUNT2';
        BALANCEBUDGETNUMBERCURRENCYCODE2       : String(10)     @title: 'BALANCEBUDGETNUMBERCURRENCYCODE2';
        BALANCEBUDGETNUMBERAMOUNT3             : Decimal(16, 2) @title: 'BALANCEBUDGETNUMBERAMOUNT3';
        BALANCEBUDGETNUMBERCURRENCYCODE3       : String(10)     @title: 'BALANCEBUDGETNUMBERCURRENCYCODE3';
        BALANCEBUDGETNUMBERAMOUNT4             : Decimal(16, 2) @title: 'BALANCEBUDGETNUMBERAMOUNT4';
        BALANCEBUDGETNUMBERCURRENCYCODE4       : String(10)     @title: 'BALANCEBUDGETNUMBERCURRENCYCODE4';
        BALANCEBUDGETNUMBERAMOUNT5             : Decimal(16, 2) @title: 'BALANCEBUDGETNUMBERAMOUNT5';
        BALANCEBUDGETNUMBERCURRENCYCODE5       : String(10)     @title: 'BALANCEBUDGETNUMBERCURRENCYCODE5';
        MDTYPE1                                : String(10)     @title: 'MDTYPE1';
        TYPEAFAREAMOUNTAMOUNT1                 : Decimal(16, 2) @title: 'TYPEAFAREAMOUNTAMOUNT1';
        TYPEAFAREAMOUNTCURRENCYCODE1           : String(10)     @title: 'TYPEAFAREAMOUNTCURRENCYCODE1';
        TYPEAFAREAMOUNTAMOUNT2                 : Decimal(16, 2) @title: 'TYPEAFAREAMOUNTAMOUNT2';
        TYPEAFAREAMOUNTCURRENCYCODE2           : String(10)     @title: 'TYPEAFAREAMOUNTCURRENCYCODE2';
        TYPEAFAREAMOUNTAMOUNT3                 : Decimal(16, 2) @title: 'TYPEAFAREAMOUNTAMOUNT3';
        TYPEAFAREAMOUNTCURRENCYCODE3           : String(10)     @title: 'TYPEAFAREAMOUNTCURRENCYCODE3';
        TYPEAFAREAMOUNTAMOUNT4                 : Decimal(16, 2) @title: 'TYPEAFAREAMOUNTAMOUNT4';
        TYPEAFAREAMOUNTCURRENCYCODE4           : String(10)     @title: 'TYPEAFAREAMOUNTCURRENCYCODE4';
        TYPEAFAREAMOUNTAMOUNT5                 : Decimal(16, 2) @title: 'TYPEAFAREAMOUNTAMOUNT5';
        TYPEAFAREAMOUNTCURRENCYCODE5           : String(10)     @title: 'TYPEAFAREAMOUNTCURRENCYCODE5';
        TYPEATOTALTAXAMOUNT                    : Decimal(16, 2) @title: 'TYPEATOTALTAXAMOUNT';
        TYPEATOTALTAXCURRENCYCODE              : String(10)     @title: 'TYPEATOTALTAXCURRENCYCODE';
        TYPEATOTALTAXDETAILSTAXTYPE1           : String(20)     @title: 'TYPEATOTALTAXDETAILSTAXTYPE1';
        TYPEATOTALTAXDETAILSTAXAMOUNT1         : Decimal(16, 2) @title: 'TYPEATOTALTAXDETAILSTAXAMOUNT1';
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE1   : String(10)     @title: 'TYPEATOTALTAXDETAILSTAXCURRENCYCODE1';
        TYPEATOTALTAXDETAILSTAXTYPE2           : String(20)     @title: 'TYPEATOTALTAXDETAILSTAXTYPE2';
        TYPEATOTALTAXDETAILSTAXAMOUNT2         : Decimal(16, 2) @title: 'TYPEATOTALTAXDETAILSTAXAMOUNT2';
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE2   : String(10)     @title: 'TYPEATOTALTAXDETAILSTAXCURRENCYCODE2';
        TYPEATOTALTAXDETAILSTAXTYPE3           : String(20)     @title: 'TYPEATOTALTAXDETAILSTAXTYPE3';
        TYPEATOTALTAXDETAILSTAXAMOUNT3         : Decimal(16, 2) @title: 'TYPEATOTALTAXDETAILSTAXAMOUNT3';
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE3   : String(10)     @title: 'TYPEATOTALTAXDETAILSTAXCURRENCYCODE3';
        TYPEATOTALTAXDETAILSTAXTYPE4           : String(20)     @title: 'TYPEATOTALTAXDETAILSTAXTYPE4';
        TYPEATOTALTAXDETAILSTAXAMOUNT4         : Decimal(16, 2) @title: 'TYPEATOTALTAXDETAILSTAXAMOUNT4';
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE4   : String(10)     @title: 'TYPEATOTALTAXDETAILSTAXCURRENCYCODE4';
        TYPEATOTALTAXDETAILSTAXTYPE5           : String(20)     @title: 'TYPEATOTALTAXDETAILSTAXTYPE5';
        TYPEATOTALTAXDETAILSTAXAMOUNT5         : Decimal(16, 2) @title: 'TYPEATOTALTAXDETAILSTAXAMOUNT5';
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE5   : String(10)     @title: 'TYPEATOTALTAXDETAILSTAXCURRENCYCODE5';
        TYPEATOTALTAXDETAILSTAXTYPE6           : String(20)     @title: 'TYPEATOTALTAXDETAILSTAXTYPE6';
        TYPEATOTALTAXDETAILSTAXAMOUNT6         : Decimal(16, 2) @title: 'TYPEATOTALTAXDETAILSTAXAMOUNT6';
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE6   : String(10)     @title: 'TYPEATOTALTAXDETAILSTAXCURRENCYCODE6';
        TYPEATOTALTAXDETAILSTAXTYPE7           : String(20)     @title: 'TYPEATOTALTAXDETAILSTAXTYPE7';
        TYPEATOTALTAXDETAILSTAXAMOUNT7         : Decimal(16, 2) @title: 'TYPEATOTALTAXDETAILSTAXAMOUNT7';
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE7   : String(10)     @title: 'TYPEATOTALTAXDETAILSTAXCURRENCYCODE7';
        TYPEATOTALTAXDETAILSTAXTYPE8           : String(20)     @title: 'TYPEATOTALTAXDETAILSTAXTYPE8';
        TYPEATOTALTAXDETAILSTAXAMOUNT8         : Decimal(16, 2) @title: 'TYPEATOTALTAXDETAILSTAXAMOUNT8';
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE8   : String(10)     @title: 'TYPEATOTALTAXDETAILSTAXCURRENCYCODE8';
        TYPEATOTALTAXDETAILSTAXTYPE9           : String(20)     @title: 'TYPEATOTALTAXDETAILSTAXTYPE9';
        TYPEATOTALTAXDETAILSTAXAMOUNT9         : Decimal(16, 2) @title: 'TYPEATOTALTAXDETAILSTAXAMOUNT9';
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE9   : String(10)     @title: 'TYPEATOTALTAXDETAILSTAXCURRENCYCODE9';
        TYPEATOTALTAXDETAILSTAXTYPE10          : String(20)     @title: 'TYPEATOTALTAXDETAILSTAXTYPE10';
        TYPEATOTALTAXDETAILSTAXAMOUNT10        : Decimal(16, 2) @title: 'TYPEATOTALTAXDETAILSTAXAMOUNT10';
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE10  : String(10)     @title: 'TYPEATOTALTAXDETAILSTAXCURRENCYCODE10';
        TYPEACOMMISSIONAMOUNTAMOUNT1           : Decimal(16, 2) @title: 'TYPEACOMMISSIONAMOUNTAMOUNT1';
        TYPEACOMMISSIONAMOUNTCURRENCYCODE1     : String(10)     @title: 'TYPEACOMMISSIONAMOUNTCURRENCYCODE1';
        TYPEACOMMISSIONAMOUNTAMOUNT2           : Decimal(16, 2) @title: 'TYPEACOMMISSIONAMOUNTAMOUNT2';
        TYPEACOMMISSIONAMOUNTCURRENCYCODE2     : String(10)     @title: 'TYPEACOMMISSIONAMOUNTCURRENCYCODE2';
        TYPEACOMMISSIONAMOUNTAMOUNT3           : Decimal(16, 2) @title: 'TYPEACOMMISSIONAMOUNTAMOUNT3';
        TYPEACOMMISSIONAMOUNTCURRENCYCODE3     : String(10)     @title: 'TYPEACOMMISSIONAMOUNTCURRENCYCODE3';
        TYPEACOMMISSIONAMOUNTAMOUNT4           : Decimal(16, 2) @title: 'TYPEACOMMISSIONAMOUNTAMOUNT4';
        TYPEACOMMISSIONAMOUNTCURRENCYCODE4     : String(10)     @title: 'TYPEACOMMISSIONAMOUNTCURRENCYCODE4';
        TYPEACOMMISSIONAMOUNTAMOUNT5           : Decimal(16, 2) @title: 'TYPEACOMMISSIONAMOUNTAMOUNT5';
        TYPEACOMMISSIONAMOUNTCURRENCYCODE5     : String(10)     @title: 'TYPEACOMMISSIONAMOUNTCURRENCYCODE5';
        TYPEASPAMAMOUNTAMOUNT1                 : Decimal(16, 2) @title: 'TYPEASPAMAMOUNTAMOUNT1';
        TYPEASPAMAMOUNTCURRENCYCODE1           : String(10)     @title: 'TYPEASPAMAMOUNTCURRENCYCODE1';
        TYPEASPAMAMOUNTAMOUNT2                 : Decimal(16, 2) @title: 'TYPEASPAMAMOUNTAMOUNT2';
        TYPEASPAMAMOUNTCURRENCYCODE2           : String(10)     @title: 'TYPEASPAMAMOUNTCURRENCYCODE2';
        TYPEASPAMAMOUNTAMOUNT3                 : Decimal(16, 2) @title: 'TYPEASPAMAMOUNTAMOUNT3';
        TYPEASPAMAMOUNTCURRENCYCODE3           : String(10)     @title: 'TYPEASPAMAMOUNTCURRENCYCODE3';
        TYPEASPAMAMOUNTAMOUNT4                 : Decimal(16, 2) @title: 'TYPEASPAMAMOUNTAMOUNT4';
        TYPEASPAMAMOUNTCURRENCYCODE4           : String(10)     @title: 'TYPEASPAMAMOUNTCURRENCYCODE4';
        TYPEASPAMAMOUNTAMOUNT5                 : Decimal(16, 2) @title: 'TYPEASPAMAMOUNTAMOUNT5';
        TYPEASPAMAMOUNTCURRENCYCODE5           : String(10)     @title: 'TYPEASPAMAMOUNTCURRENCYCODE5';
        TYPEATOCAAMOUNTTYPE1                   : String(10)     @title: 'TYPEATOCAAMOUNTTYPE1';
        TYPEATOCAAMOUNT1                       : Decimal(16, 2) @title: 'TYPEATOCAAMOUNT1';
        TYPEATOCAAMOUNTCURRENCYCODE1           : String(10)     @title: 'TYPEATOCAAMOUNTCURRENCYCODE1';
        TYPEATOCAAMOUNTTYPE2                   : String(10)     @title: 'TYPEATOCAAMOUNTTYPE2';
        TYPEATOCAAMOUNT2                       : Decimal(16, 2) @title: 'TYPEATOCAAMOUNT2';
        TYPEATOCAAMOUNTCURRENCYCODE2           : String(10)     @title: 'TYPEATOCAAMOUNTCURRENCYCODE2';
        TYPEATOCAAMOUNTTYPE3                   : String(10)     @title: 'TYPEATOCAAMOUNTTYPE3';
        TYPEATOCAAMOUNT3                       : Decimal(16, 2) @title: 'TYPEATOCAAMOUNT3';
        TYPEATOCAAMOUNTCURRENCYCODE3           : String(10)     @title: 'TYPEATOCAAMOUNTCURRENCYCODE3';
        TYPEATOCAAMOUNTTYPE4                   : String(10)     @title: 'TYPEATOCAAMOUNTTYPE4';
        TYPEATOCAAMOUNT4                       : Decimal(16, 2) @title: 'TYPEATOCAAMOUNT4';
        TYPEATOCAAMOUNTCURRENCYCODE4           : String(10)     @title: 'TYPEATOCAAMOUNTCURRENCYCODE4';
        TYPEATOCAAMOUNTTYPE5                   : String(10)     @title: 'TYPEATOCAAMOUNTTYPE5';
        TYPEATOCAAMOUNT5                       : Decimal(16, 2) @title: 'TYPEATOCAAMOUNT5';
        TYPEATOCAAMOUNTCURRENCYCODE5           : String(10)     @title: 'TYPEATOCAAMOUNTCURRENCYCODE5';
        TYPEACPAMOUNTAMOUNT1                   : Decimal(16, 2) @title: 'TYPEACPAMOUNTAMOUNT1';
        TYPEACPAMOUNTCURRENCYCODE1             : String(10)     @title: 'TYPEACPAMOUNTCURRENCYCODE1';
        TYPEACPAMOUNTAMOUNT2                   : Decimal(16, 2) @title: 'TYPEACPAMOUNTAMOUNT2';
        TYPEACPAMOUNTCURRENCYCODE2             : String(10)     @title: 'TYPEACPAMOUNTCURRENCYCODE2';
        TYPEACPAMOUNTAMOUNT3                   : Decimal(16, 2) @title: 'TYPEACPAMOUNTAMOUNT3';
        TYPEACPAMOUNTCURRENCYCODE3             : String(10)     @title: 'TYPEACPAMOUNTCURRENCYCODE3';
        TYPEACPAMOUNTAMOUNT4                   : Decimal(16, 2) @title: 'TYPEACPAMOUNTAMOUNT4';
        TYPEACPAMOUNTCURRENCYCODE4             : String(10)     @title: 'TYPEACPAMOUNTCURRENCYCODE4';
        TYPEACPAMOUNTAMOUNT5                   : Decimal(16, 2) @title: 'TYPEACPAMOUNTAMOUNT5';
        TYPEACPAMOUNTCURRENCYCODE5             : String(10)     @title: 'TYPEACPAMOUNTCURRENCYCODE5';
        TYPEAMFAMOUNTAMOUNT1                   : Decimal(16, 2) @title: 'TYPEAMFAMOUNTAMOUNT1';
        TYPEAMFAMOUNTCURRENCYCODE1             : String(10)     @title: 'TYPEAMFAMOUNTCURRENCYCODE1';
        TYPEAMFAMOUNTAMOUNT2                   : Decimal(16, 2) @title: 'TYPEAMFAMOUNTAMOUNT2';
        TYPEAMFAMOUNTCURRENCYCODE2             : String(10)     @title: 'TYPEAMFAMOUNTCURRENCYCODE2';
        TYPEAMFAMOUNTAMOUNT3                   : Decimal(16, 2) @title: 'TYPEAMFAMOUNTAMOUNT3';
        TYPEAMFAMOUNTCURRENCYCODE3             : String(10)     @title: 'TYPEAMFAMOUNTCURRENCYCODE3';
        TYPEAMFAMOUNTAMOUNT4                   : Decimal(16, 2) @title: 'TYPEAMFAMOUNTAMOUNT4';
        TYPEAMFAMOUNTCURRENCYCODE4             : String(10)     @title: 'TYPEAMFAMOUNTCURRENCYCODE4';
        TYPEAMFAMOUNTAMOUNT5                   : Decimal(16, 2) @title: 'TYPEAMFAMOUNTAMOUNT5';
        TYPEAMFAMOUNTCURRENCYCODE5             : String(10)     @title: 'TYPEAMFAMOUNTCURRENCYCODE5';
        MDTYPE2                                : String(10)     @title: 'MDTYPE2';
        TYPECFAREAMOUNTAMOUNT1                 : Decimal(16, 2) @title: 'TYPECFAREAMOUNTAMOUNT1';
        TYPECFAREAMOUNTCURRENCYCODE1           : String(10)     @title: 'TYPECFAREAMOUNTCURRENCYCODE1';
        TYPECFAREAMOUNTAMOUNT2                 : Decimal(16, 2) @title: 'TYPECFAREAMOUNTAMOUNT2';
        TYPECFAREAMOUNTCURRENCYCODE2           : String(10)     @title: 'TYPECFAREAMOUNTCURRENCYCODE2';
        TYPECFAREAMOUNTAMOUNT3                 : Decimal(16, 2) @title: 'TYPECFAREAMOUNTAMOUNT3';
        TYPECFAREAMOUNTCURRENCYCODE3           : String(10)     @title: 'TYPECFAREAMOUNTCURRENCYCODE3';
        TYPECFAREAMOUNTAMOUNT4                 : Decimal(16, 2) @title: 'TYPECFAREAMOUNTAMOUNT4';
        TYPECFAREAMOUNTCURRENCYCODE4           : String(10)     @title: 'TYPECFAREAMOUNTCURRENCYCODE4';
        TYPECFAREAMOUNTAMOUNT5                 : Decimal(16, 2) @title: 'TYPECFAREAMOUNTAMOUNT5';
        TYPECFAREAMOUNTCURRENCYCODE5           : String(10)     @title: 'TYPECFAREAMOUNTCURRENCYCODE5';
        TYPECTOTALTAXAMOUNT                    : Decimal(16, 2) @title: 'TYPECTOTALTAXAMOUNT';
        TYPECTOTALTAXCURRENCYCODE              : String(10)     @title: 'TYPECTOTALTAXCURRENCYCODE';
        TYPECTOTALTAXDETAILSTAXTYPE1           : String(20)     @title: 'TYPECTOTALTAXDETAILSTAXTYPE1';
        TYPECTOTALTAXDETAILSTAXAMOUNT1         : Decimal(16, 2) @title: 'TYPECTOTALTAXDETAILSTAXAMOUNT1';
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE1   : String(10)     @title: 'TYPECTOTALTAXDETAILSTAXCURRENCYCODE1';
        TYPECTOTALTAXDETAILSTAXTYPE2           : String(20)     @title: 'TYPECTOTALTAXDETAILSTAXTYPE2';
        TYPECTOTALTAXDETAILSTAXAMOUNT2         : Decimal(16, 2) @title: 'TYPECTOTALTAXDETAILSTAXAMOUNT2';
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE2   : String(10)     @title: 'TYPECTOTALTAXDETAILSTAXCURRENCYCODE2';
        TYPECTOTALTAXDETAILSTAXTYPE3           : String(20)     @title: 'TYPECTOTALTAXDETAILSTAXTYPE3';
        TYPECTOTALTAXDETAILSTAXAMOUNT3         : Decimal(16, 2) @title: 'TYPECTOTALTAXDETAILSTAXAMOUNT3';
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE3   : String(10)     @title: 'TYPECTOTALTAXDETAILSTAXCURRENCYCODE3';
        TYPECTOTALTAXDETAILSTAXTYPE4           : String(20)     @title: 'TYPECTOTALTAXDETAILSTAXTYPE4';
        TYPECTOTALTAXDETAILSTAXAMOUNT4         : Decimal(16, 2) @title: 'TYPECTOTALTAXDETAILSTAXAMOUNT4';
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE4   : String(10)     @title: 'TYPECTOTALTAXDETAILSTAXCURRENCYCODE4';
        TYPECTOTALTAXDETAILSTAXTYPE5           : String(20)     @title: 'TYPECTOTALTAXDETAILSTAXTYPE5';
        TYPECTOTALTAXDETAILSTAXAMOUNT5         : Decimal(16, 2) @title: 'TYPECTOTALTAXDETAILSTAXAMOUNT5';
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE5   : String(10)     @title: 'TYPECTOTALTAXDETAILSTAXCURRENCYCODE5';
        TYPECTOTALTAXDETAILSTAXTYPE6           : String(20)     @title: 'TYPECTOTALTAXDETAILSTAXTYPE6';
        TYPECTOTALTAXDETAILSTAXAMOUNT6         : Decimal(16, 2) @title: 'TYPECTOTALTAXDETAILSTAXAMOUNT6';
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE6   : String(10)     @title: 'TYPECTOTALTAXDETAILSTAXCURRENCYCODE6';
        TYPECTOTALTAXDETAILSTAXTYPE7           : String(20)     @title: 'TYPECTOTALTAXDETAILSTAXTYPE7';
        TYPECTOTALTAXDETAILSTAXAMOUNT7         : Decimal(16, 2) @title: 'TYPECTOTALTAXDETAILSTAXAMOUNT7';
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE7   : String(10)     @title: 'TYPECTOTALTAXDETAILSTAXCURRENCYCODE7';
        TYPECTOTALTAXDETAILSTAXTYPE8           : String(20)     @title: 'TYPECTOTALTAXDETAILSTAXTYPE8';
        TYPECTOTALTAXDETAILSTAXAMOUNT8         : Decimal(16, 2) @title: 'TYPECTOTALTAXDETAILSTAXAMOUNT8';
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE8   : String(10)     @title: 'TYPECTOTALTAXDETAILSTAXCURRENCYCODE8';
        TYPECTOTALTAXDETAILSTAXTYPE9           : String(20)     @title: 'TYPECTOTALTAXDETAILSTAXTYPE9';
        TYPECTOTALTAXDETAILSTAXAMOUNT9         : Decimal(16, 2) @title: 'TYPECTOTALTAXDETAILSTAXAMOUNT9';
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE9   : String(10)     @title: 'TYPECTOTALTAXDETAILSTAXCURRENCYCODE9';
        TYPECTOTALTAXDETAILSTAXTYPE10          : String(20)     @title: 'TYPECTOTALTAXDETAILSTAXTYPE10';
        TYPECTOTALTAXDETAILSTAXAMOUNT10        : Decimal(16, 2) @title: 'TYPECTOTALTAXDETAILSTAXAMOUNT10';
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE10  : String(10)     @title: 'TYPECTOTALTAXDETAILSTAXCURRENCYCODE10';
        TYPECCOMMISSIONAMOUNTAMOUNT1           : Decimal(16, 2) @title: 'TYPECCOMMISSIONAMOUNTAMOUNT1';
        TYPECCOMMISSIONAMOUNTCURRENCYCODE1     : String(10)     @title: 'TYPECCOMMISSIONAMOUNTCURRENCYCODE1';
        TYPECCOMMISSIONAMOUNTAMOUNT2           : Decimal(16, 2) @title: 'TYPECCOMMISSIONAMOUNTAMOUNT2';
        TYPECCOMMISSIONAMOUNTCURRENCYCODE2     : String(10)     @title: 'TYPECCOMMISSIONAMOUNTCURRENCYCODE2';
        TYPECCOMMISSIONAMOUNTAMOUNT3           : Decimal(16, 2) @title: 'TYPECCOMMISSIONAMOUNTAMOUNT3';
        TYPECCOMMISSIONAMOUNTCURRENCYCODE3     : String(10)     @title: 'TYPECCOMMISSIONAMOUNTCURRENCYCODE3';
        TYPECCOMMISSIONAMOUNTAMOUNT4           : Decimal(16, 2) @title: 'TYPECCOMMISSIONAMOUNTAMOUNT4';
        TYPECCOMMISSIONAMOUNTCURRENCYCODE4     : String(10)     @title: 'TYPECCOMMISSIONAMOUNTCURRENCYCODE4';
        TYPECCOMMISSIONAMOUNTAMOUNT5           : Decimal(16, 2) @title: 'TYPECCOMMISSIONAMOUNTAMOUNT5';
        TYPECCOMMISSIONAMOUNTCURRENCYCODE5     : String(10)     @title: 'TYPECCOMMISSIONAMOUNTCURRENCYCODE5';
        TYPECSPAMAMOUNTAMOUNT1                 : Decimal(16, 2) @title: 'TYPECSPAMAMOUNTAMOUNT1';
        TYPECSPAMAMOUNTCURRENCYCODE1           : String(10)     @title: 'TYPECSPAMAMOUNTCURRENCYCODE1';
        TYPECSPAMAMOUNTAMOUNT2                 : Decimal(16, 2) @title: 'TYPECSPAMAMOUNTAMOUNT2';
        TYPECSPAMAMOUNTCURRENCYCODE2           : String(10)     @title: 'TYPECSPAMAMOUNTCURRENCYCODE2';
        TYPECSPAMAMOUNTAMOUNT3                 : Decimal(16, 2) @title: 'TYPECSPAMAMOUNTAMOUNT3';
        TYPECSPAMAMOUNTCURRENCYCODE3           : String(10)     @title: 'TYPECSPAMAMOUNTCURRENCYCODE3';
        TYPECSPAMAMOUNTAMOUNT4                 : Decimal(16, 2) @title: 'TYPECSPAMAMOUNTAMOUNT4';
        TYPECSPAMAMOUNTCURRENCYCODE4           : String(10)     @title: 'TYPECSPAMAMOUNTCURRENCYCODE4';
        TYPECSPAMAMOUNTAMOUNT5                 : Decimal(16, 2) @title: 'TYPECSPAMAMOUNTAMOUNT5';
        TYPECSPAMAMOUNTCURRENCYCODE5           : String(10)     @title: 'TYPECSPAMAMOUNTCURRENCYCODE5';
        TYPECTOCAAMOUNTTYPE1                   : String(10)     @title: 'TYPECTOCAAMOUNTTYPE1';
        TYPECTOCAAMOUNT1                       : Decimal(16, 2) @title: 'TYPECTOCAAMOUNT1';
        TYPECTOCAAMOUNTCURRENCYCODE1           : String(10)     @title: 'TYPECTOCAAMOUNTCURRENCYCODE1';
        TYPECTOCAAMOUNTTYPE2                   : String(10)     @title: 'TYPECTOCAAMOUNTTYPE2';
        TYPECTOCAAMOUNT2                       : Decimal(16, 2) @title: 'TYPECTOCAAMOUNT2';
        TYPECTOCAAMOUNTCURRENCYCODE2           : String(10)     @title: 'TYPECTOCAAMOUNTCURRENCYCODE2';
        TYPECTOCAAMOUNTTYPE3                   : String(10)     @title: 'TYPECTOCAAMOUNTTYPE3';
        TYPECTOCAAMOUNT3                       : Decimal(16, 2) @title: 'TYPECTOCAAMOUNT3';
        TYPECTOCAAMOUNTCURRENCYCODE3           : String(10)     @title: 'TYPECTOCAAMOUNTCURRENCYCODE3';
        TYPECTOCAAMOUNTTYPE4                   : String(10)     @title: 'TYPECTOCAAMOUNTTYPE4';
        TYPECTOCAAMOUNT4                       : Decimal(16, 2) @title: 'TYPECTOCAAMOUNT4';
        TYPECTOCAAMOUNTCURRENCYCODE4           : String(10)     @title: 'TYPECTOCAAMOUNTCURRENCYCODE4';
        TYPECTOCAAMOUNTTYPE5                   : String(10)     @title: 'TYPECTOCAAMOUNTTYPE5';
        TYPECTOCAAMOUNT5                       : Decimal(16, 2) @title: 'TYPECTOCAAMOUNT5';
        TYPECTOCAAMOUNTCURRENCYCODE5           : String(10)     @title: 'TYPECTOCAAMOUNTCURRENCYCODE5';
        TYPECCPAMOUNTAMOUNT1                   : Decimal(16, 2) @title: 'TYPECCPAMOUNTAMOUNT1';
        TYPECCPAMOUNTCURRENCYCODE1             : String(10)     @title: 'TYPECCPAMOUNTCURRENCYCODE1';
        TYPECCPAMOUNTAMOUNT2                   : Decimal(16, 2) @title: 'TYPECCPAMOUNTAMOUNT2';
        TYPECCPAMOUNTCURRENCYCODE2             : String(10)     @title: 'TYPECCPAMOUNTCURRENCYCODE2';
        TYPECCPAMOUNTAMOUNT3                   : Decimal(16, 2) @title: 'TYPECCPAMOUNTAMOUNT3';
        TYPECCPAMOUNTCURRENCYCODE3             : String(10)     @title: 'TYPECCPAMOUNTCURRENCYCODE3';
        TYPECCPAMOUNTAMOUNT4                   : Decimal(16, 2) @title: 'TYPECCPAMOUNTAMOUNT4';
        TYPECCPAMOUNTCURRENCYCODE4             : String(10)     @title: 'TYPECCPAMOUNTCURRENCYCODE4';
        TYPECCPAMOUNTAMOUNT5                   : Decimal(16, 2) @title: 'TYPECCPAMOUNTAMOUNT5';
        TYPECCPAMOUNTCURRENCYCODE5             : String(10)     @title: 'TYPECCPAMOUNTCURRENCYCODE5';
        TYPECMFAMOUNTAMOUNT1                   : Decimal(16, 2) @title: 'TYPECMFAMOUNTAMOUNT1';
        TYPECMFAMOUNTCURRENCYCODE1             : String(10)     @title: 'TYPECMFAMOUNTCURRENCYCODE1';
        TYPECMFAMOUNTAMOUNT2                   : Decimal(16, 2) @title: 'TYPECMFAMOUNTAMOUNT2';
        TYPECMFAMOUNTCURRENCYCODE2             : String(10)     @title: 'TYPECMFAMOUNTCURRENCYCODE2';
        TYPECMFAMOUNTAMOUNT3                   : Decimal(16, 2) @title: 'TYPECMFAMOUNTAMOUNT3';
        TYPECMFAMOUNTCURRENCYCODE3             : String(10)     @title: 'TYPECMFAMOUNTCURRENCYCODE3';
        TYPECMFAMOUNTAMOUNT4                   : Decimal(16, 2) @title: 'TYPECMFAMOUNTAMOUNT4';
        TYPECMFAMOUNTCURRENCYCODE4             : String(10)     @title: 'TYPECMFAMOUNTCURRENCYCODE4';
        TYPECMFAMOUNTAMOUNT5                   : Decimal(16, 2) @title: 'TYPECMFAMOUNTAMOUNT5';
        TYPECMFAMOUNTCURRENCYCODE5             : String(10)     @title: 'TYPECMFAMOUNTCURRENCYCODE5';
        MDTYPE3                                : String(10)     @title: 'MDTYPE3';
        TYPEDFAREAMOUNTAMOUNT1                 : Decimal(16, 2) @title: 'TYPEDFAREAMOUNTAMOUNT1';
        TYPEDFAREAMOUNTCURRENCYCODE1           : String(10)     @title: 'TYPEDFAREAMOUNTCURRENCYCODE1';
        TYPEDFAREAMOUNTAMOUNT2                 : Decimal(16, 2) @title: 'TYPEDFAREAMOUNTAMOUNT2';
        TYPEDFAREAMOUNTCURRENCYCODE2           : String(10)     @title: 'TYPEDFAREAMOUNTCURRENCYCODE2';
        TYPEDFAREAMOUNTAMOUNT3                 : Decimal(16, 2) @title: 'TYPEDFAREAMOUNTAMOUNT3';
        TYPEDFAREAMOUNTCURRENCYCODE3           : String(10)     @title: 'TYPEDFAREAMOUNTCURRENCYCODE3';
        TYPEDFAREAMOUNTAMOUNT4                 : Decimal(16, 2) @title: 'TYPEDFAREAMOUNTAMOUNT4';
        TYPEDFAREAMOUNTCURRENCYCODE4           : String(10)     @title: 'TYPEDFAREAMOUNTCURRENCYCODE4';
        TYPEDFAREAMOUNTAMOUNT5                 : Decimal(16, 2) @title: 'TYPEDFAREAMOUNTAMOUNT5';
        TYPEDFAREAMOUNTCURRENCYCODE5           : String(10)     @title: 'TYPEDFAREAMOUNTCURRENCYCODE5';
        TYPEDTOTALTAXAMOUNT                    : Decimal(16, 2) @title: 'TYPEDTOTALTAXAMOUNT';
        TYPEDTOTALTAXCURRENCYCODE              : String(10)     @title: 'TYPEDTOTALTAXCURRENCYCODE';
        TYPEDTOTALTAXDETAILSTAXTYPE1           : String(20)     @title: 'TYPEDTOTALTAXDETAILSTAXTYPE1';
        TYPEDTOTALTAXDETAILSTAXAMOUNT1         : Decimal(16, 2) @title: 'TYPEDTOTALTAXDETAILSTAXAMOUNT1';
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE1   : String(10)     @title: 'TYPEDTOTALTAXDETAILSTAXCURRENCYCODE1';
        TYPEDTOTALTAXDETAILSTAXTYPE2           : String(20)     @title: 'TYPEDTOTALTAXDETAILSTAXTYPE2';
        TYPEDTOTALTAXDETAILSTAXAMOUNT2         : Decimal(16, 2) @title: 'TYPEDTOTALTAXDETAILSTAXAMOUNT2';
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE2   : String(10)     @title: 'TYPEDTOTALTAXDETAILSTAXCURRENCYCODE2';
        TYPEDTOTALTAXDETAILSTAXTYPE3           : String(20)     @title: 'TYPEDTOTALTAXDETAILSTAXTYPE3';
        TYPEDTOTALTAXDETAILSTAXAMOUNT3         : Decimal(16, 2) @title: 'TYPEDTOTALTAXDETAILSTAXAMOUNT3';
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE3   : String(10)     @title: 'TYPEDTOTALTAXDETAILSTAXCURRENCYCODE3';
        TYPEDTOTALTAXDETAILSTAXTYPE4           : String(20)     @title: 'TYPEDTOTALTAXDETAILSTAXTYPE4';
        TYPEDTOTALTAXDETAILSTAXAMOUNT4         : Decimal(16, 2) @title: 'TYPEDTOTALTAXDETAILSTAXAMOUNT4';
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE4   : String(10)     @title: 'TYPEDTOTALTAXDETAILSTAXCURRENCYCODE4';
        TYPEDTOTALTAXDETAILSTAXTYPE5           : String(20)     @title: 'TYPEDTOTALTAXDETAILSTAXTYPE5';
        TYPEDTOTALTAXDETAILSTAXAMOUNT5         : Decimal(16, 2) @title: 'TYPEDTOTALTAXDETAILSTAXAMOUNT5';
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE5   : String(10)     @title: 'TYPEDTOTALTAXDETAILSTAXCURRENCYCODE5';
        TYPEDTOTALTAXDETAILSTAXTYPE6           : String(20)     @title: 'TYPEDTOTALTAXDETAILSTAXTYPE6';
        TYPEDTOTALTAXDETAILSTAXAMOUNT6         : Decimal(16, 2) @title: 'TYPEDTOTALTAXDETAILSTAXAMOUNT6';
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE6   : String(10)     @title: 'TYPEDTOTALTAXDETAILSTAXCURRENCYCODE6';
        TYPEDTOTALTAXDETAILSTAXTYPE7           : String(20)     @title: 'TYPEDTOTALTAXDETAILSTAXTYPE7';
        TYPEDTOTALTAXDETAILSTAXAMOUNT7         : Decimal(16, 2) @title: 'TYPEDTOTALTAXDETAILSTAXAMOUNT7';
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE7   : String(10)     @title: 'TYPEDTOTALTAXDETAILSTAXCURRENCYCODE7';
        TYPEDTOTALTAXDETAILSTAXTYPE8           : String(20)     @title: 'TYPEDTOTALTAXDETAILSTAXTYPE8';
        TYPEDTOTALTAXDETAILSTAXAMOUNT8         : Decimal(16, 2) @title: 'TYPEDTOTALTAXDETAILSTAXAMOUNT8';
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE8   : String(10)     @title: 'TYPEDTOTALTAXDETAILSTAXCURRENCYCODE8';
        TYPEDTOTALTAXDETAILSTAXTYPE9           : String(20)     @title: 'TYPEDTOTALTAXDETAILSTAXTYPE9';
        TYPEDTOTALTAXDETAILSTAXAMOUNT9         : Decimal(16, 2) @title: 'TYPEDTOTALTAXDETAILSTAXAMOUNT9';
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE9   : String(10)     @title: 'TYPEDTOTALTAXDETAILSTAXCURRENCYCODE9';
        TYPEDTOTALTAXDETAILSTAXTYPE10          : String(20)     @title: 'TYPEDTOTALTAXDETAILSTAXTYPE10';
        TYPEDTOTALTAXDETAILSTAXAMOUNT10        : Decimal(16, 2) @title: 'TYPEDTOTALTAXDETAILSTAXAMOUNT10';
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE10  : String(10)     @title: 'TYPEDTOTALTAXDETAILSTAXCURRENCYCODE10';
        TYPEDCOMMISSIONAMOUNTAMOUNT1           : Decimal(16, 2) @title: 'TYPEDCOMMISSIONAMOUNTAMOUNT1';
        TYPEDCOMMISSIONAMOUNTCURRENCYCODE1     : String(10)     @title: 'TYPEDCOMMISSIONAMOUNTCURRENCYCODE1';
        TYPEDCOMMISSIONAMOUNTAMOUNT2           : Decimal(16, 2) @title: 'TYPEDCOMMISSIONAMOUNTAMOUNT2';
        TYPEDCOMMISSIONAMOUNTCURRENCYCODE2     : String(10)     @title: 'TYPEDCOMMISSIONAMOUNTCURRENCYCODE2';
        TYPEDCOMMISSIONAMOUNTAMOUNT3           : Decimal(16, 2) @title: 'TYPEDCOMMISSIONAMOUNTAMOUNT3';
        TYPEDCOMMISSIONAMOUNTCURRENCYCODE3     : String(10)     @title: 'TYPEDCOMMISSIONAMOUNTCURRENCYCODE3';
        TYPEDCOMMISSIONAMOUNTAMOUNT4           : Decimal(16, 2) @title: 'TYPEDCOMMISSIONAMOUNTAMOUNT4';
        TYPEDCOMMISSIONAMOUNTCURRENCYCODE4     : String(10)     @title: 'TYPEDCOMMISSIONAMOUNTCURRENCYCODE4';
        TYPEDCOMMISSIONAMOUNTAMOUNT5           : Decimal(16, 2) @title: 'TYPEDCOMMISSIONAMOUNTAMOUNT5';
        TYPEDCOMMISSIONAMOUNTCURRENCYCODE5     : String(10)     @title: 'TYPEDCOMMISSIONAMOUNTCURRENCYCODE5';
        TYPEDSPAMAMOUNTAMOUNT1                 : Decimal(16, 2) @title: 'TYPEDSPAMAMOUNTAMOUNT1';
        TYPEDSPAMAMOUNTCURRENCYCODE1           : String(10)     @title: 'TYPEDSPAMAMOUNTCURRENCYCODE1';
        TYPEDSPAMAMOUNTAMOUNT2                 : Decimal(16, 2) @title: 'TYPEDSPAMAMOUNTAMOUNT2';
        TYPEDSPAMAMOUNTCURRENCYCODE2           : String(10)     @title: 'TYPEDSPAMAMOUNTCURRENCYCODE2';
        TYPEDSPAMAMOUNTAMOUNT3                 : Decimal(16, 2) @title: 'TYPEDSPAMAMOUNTAMOUNT3';
        TYPEDSPAMAMOUNTCURRENCYCODE3           : String(10)     @title: 'TYPEDSPAMAMOUNTCURRENCYCODE3';
        TYPEDSPAMAMOUNTAMOUNT4                 : Decimal(16, 2) @title: 'TYPEDSPAMAMOUNTAMOUNT4';
        TYPEDSPAMAMOUNTCURRENCYCODE4           : String(10)     @title: 'TYPEDSPAMAMOUNTCURRENCYCODE4';
        TYPEDSPAMAMOUNTAMOUNT5                 : Decimal(16, 2) @title: 'TYPEDSPAMAMOUNTAMOUNT5';
        TYPEDSPAMAMOUNTCURRENCYCODE5           : String(10)     @title: 'TYPEDSPAMAMOUNTCURRENCYCODE5';
        TYPEDTOCAAMOUNTTYPE1                   : String(10)     @title: 'TYPEDTOCAAMOUNTTYPE1';
        TYPEDTOCAAMOUNT1                       : Decimal(16, 2) @title: 'TYPEDTOCAAMOUNT1';
        TYPEDTOCAAMOUNTCURRENCYCODE1           : String(10)     @title: 'TYPEDTOCAAMOUNTCURRENCYCODE1';
        TYPEDTOCAAMOUNTTYPE2                   : String(10)     @title: 'TYPEDTOCAAMOUNTTYPE2';
        TYPEDTOCAAMOUNT2                       : Decimal(16, 2) @title: 'TYPEDTOCAAMOUNT2';
        TYPEDTOCAAMOUNTCURRENCYCODE2           : String(10)     @title: 'TYPEDTOCAAMOUNTCURRENCYCODE2';
        TYPEDTOCAAMOUNTTYPE3                   : String(10)     @title: 'TYPEDTOCAAMOUNTTYPE3';
        TYPEDTOCAAMOUNT3                       : Decimal(16, 2) @title: 'TYPEDTOCAAMOUNT3';
        TYPEDTOCAAMOUNTCURRENCYCODE3           : String(10)     @title: 'TYPEDTOCAAMOUNTCURRENCYCODE3';
        TYPEDTOCAAMOUNTTYPE4                   : String(10)     @title: 'TYPEDTOCAAMOUNTTYPE4';
        TYPEDTOCAAMOUNT4                       : Decimal(16, 2) @title: 'TYPEDTOCAAMOUNT4';
        TYPEDTOCAAMOUNTCURRENCYCODE4           : String(10)     @title: 'TYPEDTOCAAMOUNTCURRENCYCODE4';
        TYPEDTOCAAMOUNTTYPE5                   : String(10)     @title: 'TYPEDTOCAAMOUNTTYPE5';
        TYPEDTOCAAMOUNT5                       : Decimal(16, 2) @title: 'TYPEDTOCAAMOUNT5';
        TYPEDTOCAAMOUNTCURRENCYCODE5           : String(10)     @title: 'TYPEDTOCAAMOUNTCURRENCYCODE5';
        TYPEDCPAMOUNTAMOUNT1                   : Decimal(16, 2) @title: 'TYPEDCPAMOUNTAMOUNT1';
        TYPEDCPAMOUNTCURRENCYCODE1             : String(10)     @title: 'TYPEDCPAMOUNTCURRENCYCODE1';
        TYPEDCPAMOUNTAMOUNT2                   : Decimal(16, 2) @title: 'TYPEDCPAMOUNTAMOUNT2';
        TYPEDCPAMOUNTCURRENCYCODE2             : String(10)     @title: 'TYPEDCPAMOUNTCURRENCYCODE2';
        TYPEDCPAMOUNTAMOUNT3                   : Decimal(16, 2) @title: 'TYPEDCPAMOUNTAMOUNT3';
        TYPEDCPAMOUNTCURRENCYCODE3             : String(10)     @title: 'TYPEDCPAMOUNTCURRENCYCODE3';
        TYPEDCPAMOUNTAMOUNT4                   : Decimal(16, 2) @title: 'TYPEDCPAMOUNTAMOUNT4';
        TYPEDCPAMOUNTCURRENCYCODE4             : String(10)     @title: 'TYPEDCPAMOUNTCURRENCYCODE4';
        TYPEDCPAMOUNTAMOUNT5                   : Decimal(16, 2) @title: 'TYPEDCPAMOUNTAMOUNT5';
        TYPEDCPAMOUNTCURRENCYCODE5             : String(10)     @title: 'TYPEDCPAMOUNTCURRENCYCODE5';
        TYPEDMFAMOUNTAMOUNT1                   : Decimal(16, 2) @title: 'TYPEDMFAMOUNTAMOUNT1';
        TYPEDMFAMOUNTCURRENCYCODE1             : String(10)     @title: 'TYPEDMFAMOUNTCURRENCYCODE1';
        TYPEDMFAMOUNTAMOUNT2                   : Decimal(16, 2) @title: 'TYPEDMFAMOUNTAMOUNT2';
        TYPEDMFAMOUNTCURRENCYCODE2             : String(10)     @title: 'TYPEDMFAMOUNTCURRENCYCODE2';
        TYPEDMFAMOUNTAMOUNT3                   : Decimal(16, 2) @title: 'TYPEDMFAMOUNTAMOUNT3';
        TYPEDMFAMOUNTCURRENCYCODE3             : String(10)     @title: 'TYPEDMFAMOUNTCURRENCYCODE3';
        TYPEDMFAMOUNTAMOUNT4                   : Decimal(16, 2) @title: 'TYPEDMFAMOUNTAMOUNT4';
        TYPEDMFAMOUNTCURRENCYCODE4             : String(10)     @title: 'TYPEDMFAMOUNTCURRENCYCODE4';
        TYPEDMFAMOUNTAMOUNT5                   : Decimal(16, 2) @title: 'TYPEDMFAMOUNTAMOUNT5';
        TYPEDMFAMOUNTCURRENCYCODE5             : String(10)     @title: 'TYPEDMFAMOUNTCURRENCYCODE5';
        CreatedAt                              : Timestamp      @title: 'CreatedAt';
        FILENAME                               : String(255)    @title: 'FILENAME';
        orginalFileName                        : String(255);
        convertedFileName                      : String(255);
        lifecycleStatus                        : String(10) default 'NEW';
        TYPEATOTALTAXDETAILSTAXTYPE11          : String(20);
        TYPEATOTALTAXDETAILSTAXAMOUNT11        : Decimal(16, 2);
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE11  : String(10);
        TYPEATOTALTAXDETAILSTAXTYPE12          : String(20);
        TYPEATOTALTAXDETAILSTAXAMOUNT12        : Decimal(16, 2);
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE12  : String(10);
        TYPEATOTALTAXDETAILSTAXTYPE13          : String(20);
        TYPEATOTALTAXDETAILSTAXAMOUNT13        : Decimal(16, 2);
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE13  : String(10);
        TYPEATOTALTAXDETAILSTAXTYPE14          : String(20);
        TYPEATOTALTAXDETAILSTAXAMOUNT14        : Decimal(16, 2);
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE14  : String(10);
        TYPEATOTALTAXDETAILSTAXTYPE15          : String(20);
        TYPEATOTALTAXDETAILSTAXAMOUNT15        : Decimal(16, 2);
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE15  : String(10);
        TYPEATOTALTAXDETAILSTAXTYPE16          : String(20);
        TYPEATOTALTAXDETAILSTAXAMOUNT16        : Decimal(16, 2);
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE16  : String(10);
        TYPEATOTALTAXDETAILSTAXTYPE17          : String(20);
        TYPEATOTALTAXDETAILSTAXAMOUNT17        : Decimal(16, 2);
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE17  : String(10);
        TYPEATOTALTAXDETAILSTAXTYPE18          : String(20);
        TYPEATOTALTAXDETAILSTAXAMOUNT18        : Decimal(16, 2);
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE18  : String(10);
        TYPEATOTALTAXDETAILSTAXTYPE19          : String(20);
        TYPEATOTALTAXDETAILSTAXAMOUNT19        : Decimal(16, 2);
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE19  : String(10);
        TYPEATOTALTAXDETAILSTAXTYPE20          : String(20);
        TYPEATOTALTAXDETAILSTAXAMOUNT20        : Decimal(16, 2);
        TYPEATOTALTAXDETAILSTAXCURRENCYCODE20  : String(10);
        TYPECTOTALTAXDETAILSTAXTYPE11          : String(20);
        TYPECTOTALTAXDETAILSTAXAMOUNT11        : Decimal(16, 2);
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE11  : String(10);
        TYPECTOTALTAXDETAILSTAXTYPE12          : String(20);
        TYPECTOTALTAXDETAILSTAXAMOUNT12        : Decimal(16, 2);
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE12  : String(10);
        TYPECTOTALTAXDETAILSTAXTYPE13          : String(20);
        TYPECTOTALTAXDETAILSTAXAMOUNT13        : Decimal(16, 2);
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE13  : String(10);
        TYPECTOTALTAXDETAILSTAXTYPE14          : String(20);
        TYPECTOTALTAXDETAILSTAXAMOUNT14        : Decimal(16, 2);
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE14  : String(10);
        TYPECTOTALTAXDETAILSTAXTYPE15          : String(20);
        TYPECTOTALTAXDETAILSTAXAMOUNT15        : Decimal(16, 2);
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE15  : String(10);
        TYPECTOTALTAXDETAILSTAXTYPE16          : String(20);
        TYPECTOTALTAXDETAILSTAXAMOUNT16        : Decimal(16, 2);
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE16  : String(10);
        TYPECTOTALTAXDETAILSTAXTYPE17          : String(20);
        TYPECTOTALTAXDETAILSTAXAMOUNT17        : Decimal(16, 2);
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE17  : String(10);
        TYPECTOTALTAXDETAILSTAXTYPE18          : String(20);
        TYPECTOTALTAXDETAILSTAXAMOUNT18        : Decimal(16, 2);
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE18  : String(10);
        TYPECTOTALTAXDETAILSTAXTYPE19          : String(20);
        TYPECTOTALTAXDETAILSTAXAMOUNT19        : Decimal(16, 2);
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE19  : String(10);
        TYPECTOTALTAXDETAILSTAXTYPE20          : String(20);
        TYPECTOTALTAXDETAILSTAXAMOUNT20        : Decimal(16, 2);
        TYPECTOTALTAXDETAILSTAXCURRENCYCODE20  : String(10);
        TYPEDTOTALTAXDETAILSTAXTYPE11          : String(20);
        TYPEDTOTALTAXDETAILSTAXAMOUNT11        : Decimal(16, 2);
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE11  : String(10);
        TYPEDTOTALTAXDETAILSTAXTYPE12          : String(20);
        TYPEDTOTALTAXDETAILSTAXAMOUNT12        : Decimal(16, 2);
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE12  : String(10);
        TYPEDTOTALTAXDETAILSTAXTYPE13          : String(20);
        TYPEDTOTALTAXDETAILSTAXAMOUNT13        : Decimal(16, 2);
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE13  : String(10);
        TYPEDTOTALTAXDETAILSTAXTYPE14          : String(20);
        TYPEDTOTALTAXDETAILSTAXAMOUNT14        : Decimal(16, 2);
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE14  : String(10);
        TYPEDTOTALTAXDETAILSTAXTYPE15          : String(20);
        TYPEDTOTALTAXDETAILSTAXAMOUNT15        : Decimal(16, 2);
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE15  : String(10);
        TYPEDTOTALTAXDETAILSTAXTYPE16          : String(20);
        TYPEDTOTALTAXDETAILSTAXAMOUNT16        : Decimal(16, 2);
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE16  : String(10);
        TYPEDTOTALTAXDETAILSTAXTYPE17          : String(20);
        TYPEDTOTALTAXDETAILSTAXAMOUNT17        : Decimal(16, 2);
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE17  : String(10);
        TYPEDTOTALTAXDETAILSTAXTYPE18          : String(20);
        TYPEDTOTALTAXDETAILSTAXAMOUNT18        : Decimal(16, 2);
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE18  : String(10);
        TYPEDTOTALTAXDETAILSTAXTYPE19          : String(20);
        TYPEDTOTALTAXDETAILSTAXAMOUNT19        : Decimal(16, 2);
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE19  : String(10);
        TYPEDTOTALTAXDETAILSTAXTYPE20          : String(20);
        TYPEDTOTALTAXDETAILSTAXAMOUNT20        : Decimal(16, 2);
        TYPEDTOTALTAXDETAILSTAXCURRENCYCODE20  : String(10);
}

entity UnregisteredCustomer : managed {
    key gstin        : String(15)                    @title: 'GSTIN';
        pan          : String(10)                    @title: 'PAN'             @UI.HiddenFilter;
        legalName    : type of GSTIN : legalName     @title: 'Legal Name'      @UI.HiddenFilter;
        tradeName    : type of GSTIN : tradeName     @title: 'Trade Name'      @UI.HiddenFilter;
        address      : type of GSTIN : address       @title: 'Address'         @UI.HiddenFilter;
        postalCode   : type of GSTIN : postalCode    @title: 'Postal Code'     @UI.HiddenFilter;
        stateCode    : type of GSTIN : stateCode     @title: 'State Code';
        taxPayerType : type of GSTIN : taxpayertype  @title: 'Tax Payer Type'  @UI.HiddenFilter;
        StateCodes   : Association to StateCodes
                           on StateCodes.stateCode = stateCode;
}

entity InvoiceSignatory {
    key company       : type of Company : code @title: 'Company';
    key ValidFrom     : Date;
        ValidTill     : Date;
        SignatoryName : String(255);
        mimeType      : String(255);
        SignatureFile : LargeString;
        Company       : Association to Company
                            on Company.code = company;
}

entity iataGst {
    key iataNumber_8 : String(8);
        iataNumber_7 : String(7);
        stateCode    : String(2)  @title: 'State Code';
        gstIn        : String(15) @title: 'GSTIN';
        StateCodes   : Association to StateCodes
                           on StateCodes.stateCode = stateCode;
}

entity companyAdmin {
    key company : type of Company : code @title: 'Company';
    key email   : String(255)            @title: 'Email';
        name    : String(255) not null   @title: 'Name';
        role    : String(50)             @title: 'Role'  @UI.HiddenFilter;
        Company : Association to Company
                      on Company.code = company;
}

entity documentHistory : managed {
    key company                 : String(4)      @UI.HiddenFilter;
    key ID                      : UUID           @UI.HiddenFilter;
        taxInvoiceType          : String(5)      @UI.HiddenFilter;
        invoiceNumber           : String(16)     @title: 'Invoice Number';
        invoiceDate             : Date           @title: 'Invoice Date';
        documentTypeCode        : String(10)     @UI.HiddenFilter;
        acquisitionType         : String(10)     @UI.HiddenFilter;
        primaryDocumentNbr      : String(13);
        dateOfIssuance          : Date           @title: 'Date of Issuance';
        HSNCode                 : String(8)      @UI.HiddenFilter;
        iataNumber              : String(10)     @title: 'IATA Number';
        ticketNumber            : String(15)     @title: 'Ticket Number';
        RFISC                   : String(3)      @UI.HiddenFilter;
        sectionType             : String(3)      @title: 'Section Type'  @UI.HiddenFilter;
        passengerGSTIN          : String(15)     @title: 'Passenger GSTIN';
        passangerName           : String(255)    @title: 'Passenger Name';
        fullRouting             : String(255)    @UI.HiddenFilter;
        routingType             : String(1)      @UI.HiddenFilter;
        class                   : String(1)      @UI.HiddenFilter;
        placeoOfEmbarkation     : String(255)    @UI.HiddenFilter;
        placeoOfDisembarkation  : String(255)    @UI.HiddenFilter;
        xoNo                    : String(16)     @UI.HiddenFilter;
        uidNniInCaseOfEmbassy   : String(36)     @UI.HiddenFilter;
        pan                     : String(10)     @UI.HiddenFilter;
        fop                     : String(13)     @UI.HiddenFilter;
        endorsementDtls         : String(255)    @UI.HiddenFilter;
        remarksOnACMADM         : String(255)    @UI.HiddenFilter;
        remarksOnRF7            : String(255)    @UI.HiddenFilter;
        excessBaggageWeightPCS  : Decimal(16, 3) @UI.HiddenFilter;
        excessBaggageRate       : Decimal(16, 2) @UI.HiddenFilter;
        baseAmount              : Decimal(16, 2) @UI.HiddenFilter;
        tax1                    : String(6)      @UI.HiddenFilter;
        taxAmount1              : Decimal(16, 2) @UI.HiddenFilter;
        tax2                    : String(6)      @UI.HiddenFilter;
        taxAmount2              : Decimal(16, 2) @UI.HiddenFilter;
        tax3                    : String(6)      @UI.HiddenFilter;
        taxAmount3              : Decimal(16, 2) @UI.HiddenFilter;
        tax4                    : String(6)      @UI.HiddenFilter;
        taxAmount4              : Decimal(16, 2) @UI.HiddenFilter;
        tax5                    : String(6)      @UI.HiddenFilter;
        taxAmount5              : Decimal(16, 2) @UI.HiddenFilter;
        tax6                    : String(6)      @UI.HiddenFilter;
        taxAmount6              : Decimal(16, 2) @UI.HiddenFilter;
        tax7                    : String(6)      @UI.HiddenFilter;
        taxAmount7              : Decimal(16, 2) @UI.HiddenFilter;
        tax8                    : String(6)      @UI.HiddenFilter;
        taxAmount8              : Decimal(16, 2) @UI.HiddenFilter;
        tax9                    : String(6)      @UI.HiddenFilter;
        taxAmount9              : Decimal(16, 2) @UI.HiddenFilter;
        tax10                   : String(6)      @UI.HiddenFilter;
        taxAmount10             : Decimal(16, 2) @UI.HiddenFilter;
        tax11                   : String(6)      @UI.HiddenFilter;
        taxAmount11             : Decimal(16, 2) @UI.HiddenFilter;
        tax12                   : String(6)      @UI.HiddenFilter;
        taxAmount12             : Decimal(16, 2) @UI.HiddenFilter;
        tax13                   : String(6)      @UI.HiddenFilter;
        taxAmount13             : Decimal(16, 2) @UI.HiddenFilter;
        tax14                   : String(6)      @UI.HiddenFilter;
        taxAmount14             : Decimal(16, 2) @UI.HiddenFilter;
        tax15                   : String(6)      @UI.HiddenFilter;
        taxAmount15             : Decimal(16, 2) @UI.HiddenFilter;
        tax16                   : String(6)      @UI.HiddenFilter;
        taxAmount16             : Decimal(16, 2) @UI.HiddenFilter;
        tax17                   : String(6)      @UI.HiddenFilter;
        taxAmount17             : Decimal(16, 2) @UI.HiddenFilter;
        tax18                   : String(6)      @UI.HiddenFilter;
        taxAmount18             : Decimal(16, 2) @UI.HiddenFilter;
        tax19                   : String(6)      @UI.HiddenFilter;
        taxAmount19             : Decimal(16, 2) @UI.HiddenFilter;
        tax20                   : String(6)      @UI.HiddenFilter;
        taxAmount20             : Decimal(16, 2) @UI.HiddenFilter;
        totalDocumentAmount     : Decimal(16, 2) @UI.HiddenFilter;
        totalTaxableValue       : Decimal(16, 2) @UI.HiddenFilter;
        discount                : Decimal(16, 2) @UI.HiddenFilter;
        netTaxableValue         : Decimal(16, 2) @UI.HiddenFilter;
        cgstAmount              : Decimal(16, 2) @UI.HiddenFilter;
        cgstRate                : Decimal(16, 2) @UI.HiddenFilter;
        sgstAmount              : Decimal(16, 2) @UI.HiddenFilter;
        sgstRate                : Decimal(16, 2) @UI.HiddenFilter;
        utgstAmount             : Decimal(16, 2) @UI.HiddenFilter;
        utgstRate               : Decimal(16, 2) @UI.HiddenFilter;
        igstAmount              : Decimal(16, 2) @UI.HiddenFilter;
        igstRate                : Decimal(16, 2) @UI.HiddenFilter;
        totalRate               : Decimal(16, 2) @UI.HiddenFilter;
        gstValue                : Decimal(16, 2) @UI.HiddenFilter;
        AIGstinNo               : String(15)     @title: 'AI GSTIN';
        addressOfTheCorporate   : String(255)    @UI.HiddenFilter;
        placeOfSupply           : String(255)    @UI.HiddenFilter;
        contactNooftheCorporate : String(20)     @UI.HiddenFilter;
        emailIdOfCorporate      : String(255)    @UI.HiddenFilter;
        State                   : String(50)     @UI.HiddenFilter;
        stateCode               : String(3)      @UI.HiddenFilter;
        liabilityDischargeState : String(255)    @UI.HiddenFilter;
        refundSector            : String(3)      @UI.HiddenFilter;
        refundCPcharge          : Decimal(16, 2) @UI.HiddenFilter;
        refundNoShowCharges     : Decimal(16, 2) @UI.HiddenFilter;
        refundTTLCPCHGS         : Decimal(16, 2) @UI.HiddenFilter;
        refundCGST              : Decimal(16, 2) @UI.HiddenFilter;
        refundCGSTRate          : Decimal(16, 2) @UI.HiddenFilter;
        refundsgstutgst         : Decimal(16, 2) @UI.HiddenFilter;
        refundsgstutgstRate     : Decimal(16, 2) @UI.HiddenFilter;
        refundIgst              : Decimal(16, 2) @UI.HiddenFilter;
        refundIgstRate          : Decimal(16, 2) @UI.HiddenFilter;
        refundGstAmt            : Decimal(16, 2) @UI.HiddenFilter;
        reissueSector           : String(3)      @UI.HiddenFilter;
        reissueXpodCharges      : Decimal(16, 2) @UI.HiddenFilter;
        reissueChargesForTravel : Decimal(16, 2) @UI.HiddenFilter;
        reissueRebooking        : Decimal(16, 2) @UI.HiddenFilter;
        reissueCGST             : Decimal(16, 2) @UI.HiddenFilter;
        reissueCgstRate         : Decimal(16, 2) @UI.HiddenFilter;
        reissueSgstutgst        : Decimal(16, 2) @UI.HiddenFilter;
        reissueSgstutgstRate    : Decimal(16, 2) @UI.HiddenFilter;
        reissueIgst             : Decimal(16, 2) @UI.HiddenFilter;
        reissueIgstRate         : Decimal(16, 2) @UI.HiddenFilter;
        reissueGstAmt           : Decimal(16, 2) @UI.HiddenFilter;
        originalFilename        : String(255)    @UI.HiddenFilter;
        convertedFilename       : String(255)    @UI.HiddenFilter;
        status                  : String(10)     @UI.HiddenFilter;
}

entity HSNMAster {
    key code        : String(6);
        description : String(255);
}

@cds.persistence.exists
entity AREASUMMARY {
    ID                          : String(36) not null         @title: 'ID';
    COMPANY                     : String(4) not null          @title: 'COMPANY';
    DOCUMENTID                  : String(36)                  @title: 'DOCUMENTID';
    PNR                         : String(10)                  @title: 'PNR';
    TICKETNUMBER                : String(15)                  @title: 'Ticket Number';
    INTERNALID                  : String(15)                  @title: 'INTERNALID';
    SUPPLIERGSTIN               : String(15)                  @title: 'Supplier GSTIN';
    PASSENGERGSTIN              : String(15)                  @title: 'PASSENGERGSTIN';
    TICKETISSUEDATE             : Date                        @title: 'Ticket Issue Date';
    INVOICEDATE                 : Date                        @title: 'INVOICEDATE';
    INVOICE_MONTH               : String(2)                   @title: 'INVOICE_MONTH';
    INVOICENUMBER               : String(16)                  @title: 'INVOICENUMBER';
    DOCUMENTTYPE                : String(20)                  @title: 'Document Type';
    TICKETTYPE                  : String(2)                   @title: 'TICKETTYPE';
    SECTIONTYPE                 : String(3)                   @title: 'SECTIONTYPE';
    TICKETCLASS                 : String(3)                   @title: 'TICKETCLASS';
    EINDIA                      : String(1)                   @title: 'EINDIA';
    EXEMPTEDZONE                : String(1)                   @title: 'EXEMPTEDZONE';
    B2B                         : String(1)                   @title: 'B2B';
    ISSEZ                       : String(1)                   @title: 'ISSEZ';
    INTRASTATE                  : String(1)                   @title: 'INTRASTATE';
    ISUT                        : String(1)                   @title: 'ISUT';
    TAXCODE                     : String(3)                   @title: 'TAXCODE';
    IATANUMBER                  : String(10)                  @title: 'IATA Number';
    GSTR1PERIOD                 : String(6)                   @title: 'GSTR1PERIOD';
    GSTR1FILINGSTATUS           : String(25)                  @title: 'GSTR1FILINGSTATUS';
    ORIGINALINVOICENUMBER       : String(16)                  @title: 'ORIGINALINVOICENUMBER';
    ORGINALINVOICEDATE          : Date                        @title: 'ORGINALINVOICEDATE';
    ORIGINALGSTIN               : String(15)                  @title: 'ORIGINALGSTIN';
    ORIGINALSECTIONTYPE         : String(3)                   @title: 'ORIGINALSECTIONTYPE';
    ISSUEINDICATOR              : String(15)                  @title: 'ISSUEINDICATOR';
    ROUTINGTYPE                 : String(1)                   @title: 'ROUTINGTYPE';
    FULLROUTING                 : String(255)                 @title: 'FULLROUTING';
    ONEWAYINDICATOR             : String(1)                   @title: 'ONEWAYINDICATOR';
    DIRECTIONINDICATOR          : String(1)                   @title: 'DIRECTIONINDICATOR';
    PLACEOFSUPPLY               : String(255)                 @title: 'PLACEOFSUPPLY';
    COLLECTEDTAX                : String(255)                 @title: 'COLLECTEDTAX';
    TAXABLECALCULATION          : String(255)                 @title: 'TAXABLECALCULATION';
    NONTAXABLECALCULATION       : String(255)                 @title: 'NONTAXABLECALCULATION';
    DISCOUNTTAXABLECALCULATION  : String(255)                 @title: 'DISCOUNTTAXABLECALCULATION';
    TOTALTAX                    : Decimal(16, 2)              @title: 'TOTALTAX';
    TOTALINVOICEAMOUNT          : Decimal(16, 2)              @title: 'TOTALINVOICEAMOUNT';
    DOCUMENTCURRENCY_CODE       : String(3)                   @title: 'DOCUMENTCURRENCY_CODE';
    XONO                        : String(16)                  @title: 'XONO';
    TOTALJOURNEY                : String(255)                 @title: 'TOTALJOURNEY';
    JOURNEYCOVERED              : String(255)                 @title: 'JOURNEYCOVERED';
    FOP                         : String(13)                  @title: 'FOP';
    PASSANGERNAME               : String(255)                 @title: 'PASSANGERNAME';
    BILLTONAME                  : String(255)                 @title: 'BILLTONAME';
    BILLTOFULLADDRESS           : String(500)                 @title: 'BILLTOFULLADDRESS';
    BILLTOCOUNTRY_CODE          : String(3)                   @title: 'BILLTOCOUNTRY_CODE';
    BILLTOSTATECODE             : String(2)                   @title: 'BILLTOSTATECODE';
    BILLTOPOSTALCODE            : String(20)                  @title: 'BILLTOPOSTALCODE';
    INVOICESTATUS               : String(25) default 'Active' @title: 'INVOICESTATUS';
    ISREVERSECHARGEAPPLICABLE   : Boolean default false       @title: 'ISREVERSECHARGEAPPLICABLE';
    SBRRECIVEDON                : Timestamp                   @title: 'SBRRECIVEDON';
    SBRPROCESSEDON              : Timestamp                   @title: 'SBRPROCESSEDON';
    AMENDMENTREQUESTNO          : String(16)                  @title: 'AMENDMENTREQUESTNO';
    ISAMENDED                   : Boolean default false       @title: 'ISAMENDED';
    AMENDMENTREQUESTEDBY        : String(255)                 @title: 'AMENDMENTREQUESTEDBY';
    AMENDMENTREQUESTEDON        : Timestamp                   @title: 'AMENDMENTREQUESTEDON';
    AMENDMENTREASON             : String(255)                 @title: 'AMENDMENTREASON';
    AMENDEMENTSTATUS            : String(3)                   @title: 'AMENDEMENTSTATUS';
    AMENDMENTAPPROVEDON         : Timestamp                   @title: 'AMENDMENTAPPROVEDON';
    AMENDMENTAPPROVEDBY         : String(255)                 @title: 'AMENDMENTAPPROVEDBY';
    AMENDMENTREJECTEDBY         : String(255)                 @title: 'AMENDMENTREJECTEDBY';
    AMENDMENTREJECTIONREASON    : String(255)                 @title: 'AMENDMENTREJECTIONREASON';
    AMENDMENTTYPE               : String(25)                  @title: 'AMENDMENTTYPE';
    AMENDENTEDADDRESS           : String(255)                 @title: 'AMENDENTEDADDRESS';
    AMENDEMENTOLDVALUE          : String(255)                 @title: 'AMENDEMENTOLDVALUE';
    AMENDEMENTNEWVALUE          : String(255)                 @title: 'AMENDEMENTNEWVALUE';
    ORIGINALDOCUMENTNBR         : String(15)                  @title: 'ORIGINALDOCUMENTNBR';
    INVOICE_ID                  : String(36) not null         @title: 'INVOICE_ID';
    INVOICE_COMPANY             : String(4) not null          @title: 'INVOICE_COMPANY';
    INVOICESLNO                 : Integer not null            @title: 'INVOICESLNO';
    DESCOFSERVICE               : String(255)                 @title: 'DESCOFSERVICE';
    HSNCODE                     : String(8)                   @title: 'HSNCODE';
    VALUEOFSERVICE              : Decimal(16, 2) default '0'  @title: 'VALUEOFSERVICE';
    TAXABLE                     : Decimal(16, 2) default '0'  @title: 'TAXABLE';
    NONTAXABLE                  : Decimal(16, 2) default '0'  @title: 'NONTAXABLE';
    TOTALTAXABLEVALUE           : Decimal(16, 2) default '0'  @title: 'TOTALTAXABLEVALUE';
    DISCOUNT                    : Decimal(16, 2) default '0'  @title: 'DISCOUNT';
    NETTAXABLEVALUE             : Decimal(16, 2) default '0'  @title: 'NETTAXABLEVALUE';
    CGSTRATE                    : Decimal(16, 2) default '0'  @title: 'CGSTRATE';
    CGSTAMOUNT                  : Decimal(16, 2) default '0'  @title: 'CGSTAMOUNT';
    SGSTRATE                    : Decimal(16, 2) default '0'  @title: 'SGSTRATE';
    SGSTAMOUNT                  : Decimal(16, 2) default '0'  @title: 'SGSTAMOUNT';
    UTGSTRATE                   : Decimal(16, 2) default '0'  @title: 'UTGSTRATE';
    UTGSTAMOUNT                 : Decimal(16, 2) default '0'  @title: 'UTGSTAMOUNT';
    IGSTRATE                    : Decimal(16, 2) default '0'  @title: 'IGSTRATE';
    IGSTAMOUNT                  : Decimal(16, 2) default '0'  @title: 'IGSTAMOUNT';
    COLLECTEDCGSTRATE           : Decimal(16, 2) default '0'  @title: 'COLLECTEDCGSTRATE';
    COLLECTEDSGSTRATE           : Decimal(16, 2) default '0'  @title: 'COLLECTEDSGSTRATE';
    COLLECTEDIGSTRATE           : Decimal(16, 2) default '0'  @title: 'COLLECTEDIGSTRATE';
    COLLECTEDUTGSTRATE          : Decimal(16, 2) default '0'  @title: 'COLLECTEDUTGSTRATE';
    COLLECTEDCGST               : Decimal(16, 2) default '0'  @title: 'COLLECTEDCGST';
    COLLECTEDSGST               : Decimal(16, 2) default '0'  @title: 'COLLECTEDSGST';
    COLLECTEDIGST               : Decimal(16, 2) default '0'  @title: 'COLLECTEDIGST';
    COLLECTEDUTGST              : Decimal(16, 2) default '0'  @title: 'COLLECTEDUTGST';
    COLLECTEDINVOICEVALUE       : Decimal(16, 2) default '0'  @title: 'COLLECTEDINVOICEVALUE';
    CESS1RATE                   : Decimal(16, 2) default '0'  @title: 'CESS1RATE';
    CESS1AMOUNT                 : Decimal(16, 2) default '0'  @title: 'CESS1AMOUNT';
    CESS2RATE                   : Decimal(16, 2) default '0'  @title: 'CESS2RATE';
    CESS2AMOUNT                 : Decimal(16, 2) default '0'  @title: 'CESS2AMOUNT';
    REASONFORISSUANCESUBCODE    : String(3)                   @title: 'REASONFORISSUANCESUBCODE';
    TOTAL_TAX                   : Decimal(16, 2) default '0'  @title: 'TOTAL_TAX';
    TRANSACTIONCODE             : String(10)                  @title: 'TRANSACTIONCODE';
    TRANSACTIONTYPE             : String(10)                  @title: 'Transaction Type';
    TCSGSTVALUE                 : Decimal(16, 2)              @title: 'TCSGSTVALUE';
    K3TAX                       : Decimal(18, 2)              @title: 'K3TAX';
    TCS_CGST                    : Decimal(16, 2)              @title: 'TCS_CGST';
    TCS_SGST_SGST               : Decimal(16, 2)              @title: 'TCS_SGST_SGST';
    TCS_SGST_UGST               : Decimal(16, 2)              @title: 'TCS_SGST_UGST';
    TCS_IGST                    : Decimal(16, 2)              @title: 'TCS_IGST';
    STATECODE                   : String(2)                   @title: 'STATECODE';
    STATENAME                   : String(50)                  @title: 'STATENAME';
    COUNTRY_CODE                : String(3)                   @title: 'COUNTRY_CODE';
    REGION                      : String(10)                  @title: 'Region';
    PS_STATENAME                : String(50)                  @title: 'Place of Supply';
    HSNTEXT                     : String(120)                 @title: 'HSNTEXT';
    TRANSACTIONTEXT             : String(50)                  @title: 'TRANSACTIONTEXT';
    STATION                     : String(255)                 @title: 'STATION';
    LEGALNAME                   : String(255)                 @title: 'LEGALNAME';
    TCSGSTIN                    : String(15);
    STATEOFDEPOSITEOF_GST       : String(2)                   @title: 'STATEOFDEPOSITEOF_GST';
    STATEOFDEPOSITEOF_STATENAME : String(50)                  @title: 'STATEOFDEPOSITEOF_STATENAME';
    SALESRETURN                 : String(12)                  @title: 'SALESRETURN';
}

@cds.persistence.exists
entity DISCREPANCY {
    AIRLINE_CODE               : String(4) not null  @title: 'Airline Code'                @UI.HiddenFilter;
    PNR                        : String(10)          @title: 'PNR'                         @UI.HiddenFilter;
    MAIN_TICKET_NUMBER         : String(15)          @title: 'Ticket Number';
    INVOICENUMBER              : String(5000)        @title: 'Invoice Number';
    DISCREPANCYCODE            : String(2) not null  @title: 'Discrepancy Code';
    DESCRIPTION                : String(255)         @title: 'Description'                 @UI.HiddenFilter;
    IATANUMBER                 : String(10)          @title: 'IATA Number';
    B2B_B2C_INDICATOR          : String(3)           @title: 'B2B or B2C Indicator';
    DATE_OF_ISSUE              : Date                @title: 'Date of Issue';
    ROUTING                    : String(255)         @title: 'Routing'                     @UI.HiddenFilter;
    TRANSACTION_CODE           : String(10) not null @title: 'Transaction Code';
    TRANSACTION_TYPE           : String(10)          @title: 'Transaction Type'            @UI.HiddenFilter;
    ISSUE_TYPE                 : String(15)          @title: 'Issue Type'                  @UI.HiddenFilter;
    DOCUMENT_TYPE              : String(20)          @title: 'Document Type';
    RATE_OF_EXCHANGE           : Decimal(12, 8)      @title: 'Rate of Exchange'            @UI.HiddenFilter;
    RATE_OF_EXCHANGE_CURR      : String(10)          @title: 'Rate of Exchange Curr'       @UI.HiddenFilter;
    TAXABLE_AMOUNT             : Decimal(16, 2)      @title: 'Taxable Amount'              @UI.HiddenFilter;
    BASIC_FARE                 : Decimal(16, 2)      @title: 'Basic Fare'                  @UI.HiddenFilter;
    APPLICABLE_TAX_FEES_AMOUNT : Decimal(17, 2)      @title: 'Applicable Tax Fees Amount'  @UI.HiddenFilter;
    OTHER_TAX_AMOUNT           : Decimal(16, 2)      @title: 'Other Tax Amount'            @UI.HiddenFilter;
    GST_RATE_CALCULATED        : Decimal(19, 2)      @title: 'GST Rate Calculated'         @UI.HiddenFilter;
    GST_RATE_COLLECTED         : Decimal(19, 2)      @title: 'GST Rate Collected'          @UI.HiddenFilter;
    SGST_AMOUNT                : Decimal(16, 2)      @title: 'SGST Amount'                 @UI.HiddenFilter;
    SGST_RATE                  : Decimal(16, 2)      @title: 'SGST Rate'                   @UI.HiddenFilter;
    CGST_AMOUNT                : Decimal(16, 2)      @title: 'CGST Amount'                 @UI.HiddenFilter;
    CGST_RATE                  : Decimal(16, 2)      @title: 'CGST Rate'                   @UI.HiddenFilter;
    IGST_AMOUNT                : Decimal(16, 2)      @title: 'IGST Amount'                 @UI.HiddenFilter;
    IGST_RATE                  : Decimal(16, 2)      @title: 'IGST Rate'                   @UI.HiddenFilter;
    UTGST_AMOUNT               : Decimal(16, 2)      @title: 'UTGST Amount'                @UI.HiddenFilter;
    UTGST_RATE                 : Decimal(16, 2)      @title: 'UTGST Rate'                  @UI.HiddenFilter;
    GST_COLLECTED              : Decimal(19, 2)      @title: 'GST Collected'               @UI.HiddenFilter;
    GST_DERIVED                : Decimal(19, 2)      @title: 'GST Derived'                 @UI.HiddenFilter;
    GST_DIFFERENCE             : Decimal(20, 2)      @title: 'GST Difference'              @UI.HiddenFilter;
    COLLECTED_INVOICEAMOUNT    : Decimal(16, 2)      @title: 'Collected Invoice Amount'    @UI.HiddenFilter;
    CALCULATED_INVOICEAMOUNT   : Decimal(28, 2)      @title: 'Calculated Invoice Amount'   @UI.HiddenFilter;
    DIFFERENCE_INVOICEAMOUNT   : Decimal(29, 2)      @title: 'Difference Invoice Amount'   @UI.HiddenFilter;
}

@cds.persistence.exists
entity TCSSUMMARY {
    ID                          : String(36) not null         @title: 'ID';
    COMPANY                     : String(4) not null          @title: 'COMPANY';
    DOCUMENTID                  : String(36)                  @title: 'DOCUMENTID';
    PNR                         : String(10)                  @title: 'PNR';
    TICKETNUMBER                : String(15)                  @title: 'Ticket Number';
    INTERNALID                  : String(15)                  @title: 'INTERNALID';
    SUPPLIERGSTIN               : String(15)                  @title: 'Supplier GSTIN';
    PASSENGERGSTIN              : String(15)                  @title: 'PASSENGERGSTIN';
    TICKETISSUEDATE             : Date                        @title: 'Ticket Issue Date';
    INVOICEDATE                 : Date                        @title: 'INVOICEDATE';
    INVOICE_MONTH               : String(2)                   @title: 'INVOICE_MONTH';
    INVOICENUMBER               : String(16)                  @title: 'INVOICENUMBER';
    DOCUMENTTYPE                : String(20)                  @title: 'DOCUMENTTYPE';
    TICKETTYPE                  : String(2)                   @title: 'TICKETTYPE';
    SECTIONTYPE                 : String(3)                   @title: 'SECTIONTYPE';
    TICKETCLASS                 : String(3)                   @title: 'TICKETCLASS';
    EINDIA                      : String(1)                   @title: 'EINDIA';
    EXEMPTEDZONE                : String(1)                   @title: 'EXEMPTEDZONE';
    B2B                         : String(1)                   @title: 'B2B';
    ISSEZ                       : String(1)                   @title: 'ISSEZ';
    INTRASTATE                  : String(1)                   @title: 'INTRASTATE';
    ISUT                        : String(1)                   @title: 'ISUT';
    TAXCODE                     : String(3)                   @title: 'TAXCODE';
    IATANUMBER                  : String(10) not null         @title: 'IATA Number';
    GSTR1PERIOD                 : String(6)                   @title: 'GSTR1PERIOD';
    GSTR1FILINGSTATUS           : String(25)                  @title: 'GSTR1FILINGSTATUS';
    ORIGINALINVOICENUMBER       : String(16)                  @title: 'ORIGINALINVOICENUMBER';
    ORGINALINVOICEDATE          : Date                        @title: 'ORGINALINVOICEDATE';
    ORIGINALGSTIN               : String(15)                  @title: 'ORIGINALGSTIN';
    ORIGINALSECTIONTYPE         : String(3)                   @title: 'ORIGINALSECTIONTYPE';
    ISSUEINDICATOR              : String(15)                  @title: 'ISSUEINDICATOR';
    ROUTINGTYPE                 : String(1)                   @title: 'ROUTINGTYPE';
    FULLROUTING                 : String(255)                 @title: 'FULLROUTING';
    ONEWAYINDICATOR             : String(1)                   @title: 'ONEWAYINDICATOR';
    DIRECTIONINDICATOR          : String(1)                   @title: 'DIRECTIONINDICATOR';
    PLACEOFSUPPLY               : String(255)                 @title: 'PLACEOFSUPPLY';
    COLLECTEDTAX                : String(255)                 @title: 'COLLECTEDTAX';
    TAXABLECALCULATION          : String(255)                 @title: 'TAXABLECALCULATION';
    NONTAXABLECALCULATION       : String(255)                 @title: 'NONTAXABLECALCULATION';
    DISCOUNTTAXABLECALCULATION  : String(255)                 @title: 'DISCOUNTTAXABLECALCULATION';
    TOTALTAX                    : Decimal(16, 2)              @title: 'TOTALTAX';
    TOTALINVOICEAMOUNT          : Decimal(16, 2)              @title: 'TOTALINVOICEAMOUNT';
    DOCUMENTCURRENCY_CODE       : String(3)                   @title: 'DOCUMENTCURRENCY_CODE';
    XONO                        : String(16)                  @title: 'XONO';
    TOTALJOURNEY                : String(255)                 @title: 'TOTALJOURNEY';
    JOURNEYCOVERED              : String(255)                 @title: 'JOURNEYCOVERED';
    FOP                         : String(13)                  @title: 'FOP';
    PASSANGERNAME               : String(255)                 @title: 'PASSANGERNAME';
    BILLTONAME                  : String(255)                 @title: 'BILLTONAME';
    BILLTOFULLADDRESS           : String(500)                 @title: 'BILLTOFULLADDRESS';
    BILLTOCOUNTRY_CODE          : String(3)                   @title: 'BILLTOCOUNTRY_CODE';
    BILLTOSTATECODE             : String(2)                   @title: 'BILLTOSTATECODE';
    BILLTOPOSTALCODE            : String(20)                  @title: 'BILLTOPOSTALCODE';
    INVOICESTATUS               : String(25) default 'Active' @title: 'INVOICESTATUS';
    ISREVERSECHARGEAPPLICABLE   : Boolean default false       @title: 'ISREVERSECHARGEAPPLICABLE';
    SBRRECIVEDON                : Timestamp                   @title: 'SBRRECIVEDON';
    SBRPROCESSEDON              : Timestamp                   @title: 'SBRPROCESSEDON';
    AMENDMENTREQUESTNO          : String(16)                  @title: 'AMENDMENTREQUESTNO';
    ISAMENDED                   : Boolean default false       @title: 'ISAMENDED';
    AMENDMENTREQUESTEDBY        : String(255)                 @title: 'AMENDMENTREQUESTEDBY';
    AMENDMENTREQUESTEDON        : Timestamp                   @title: 'AMENDMENTREQUESTEDON';
    AMENDMENTREASON             : String(255)                 @title: 'AMENDMENTREASON';
    AMENDEMENTSTATUS            : String(3)                   @title: 'AMENDEMENTSTATUS';
    AMENDMENTAPPROVEDON         : Timestamp                   @title: 'AMENDMENTAPPROVEDON';
    AMENDMENTAPPROVEDBY         : String(255)                 @title: 'AMENDMENTAPPROVEDBY';
    AMENDMENTREJECTEDBY         : String(255)                 @title: 'AMENDMENTREJECTEDBY';
    AMENDMENTREJECTIONREASON    : String(255)                 @title: 'AMENDMENTREJECTIONREASON';
    AMENDMENTTYPE               : String(25)                  @title: 'AMENDMENTTYPE';
    AMENDENTEDADDRESS           : String(255)                 @title: 'AMENDENTEDADDRESS';
    AMENDEMENTOLDVALUE          : String(255)                 @title: 'AMENDEMENTOLDVALUE';
    AMENDEMENTNEWVALUE          : String(255)                 @title: 'AMENDEMENTNEWVALUE';
    ORIGINALDOCUMENTNBR         : String(15)                  @title: 'ORIGINALDOCUMENTNBR';
    INVOICE_ID                  : String(36) not null         @title: 'INVOICE_ID';
    INVOICE_COMPANY             : String(4) not null          @title: 'INVOICE_COMPANY';
    INVOICESLNO                 : Integer not null            @title: 'INVOICESLNO';
    DESCOFSERVICE               : String(255)                 @title: 'DESCOFSERVICE';
    HSNCODE                     : String(8)                   @title: 'HSNCODE';
    VALUEOFSERVICE              : Decimal(16, 2) default '0'  @title: 'VALUEOFSERVICE';
    TAXABLE                     : Decimal(16, 2) default '0'  @title: 'TAXABLE';
    NONTAXABLE                  : Decimal(16, 2) default '0'  @title: 'NONTAXABLE';
    TOTALTAXABLEVALUE           : Decimal(16, 2) default '0'  @title: 'TOTALTAXABLEVALUE';
    DISCOUNT                    : Decimal(16, 2) default '0'  @title: 'DISCOUNT';
    NETTAXABLEVALUE             : Decimal(16, 2) default '0'  @title: 'NETTAXABLEVALUE';
    CGSTRATE                    : Decimal(16, 2) default '0'  @title: 'CGSTRATE';
    CGSTAMOUNT                  : Decimal(16, 2) default '0'  @title: 'CGSTAMOUNT';
    SGSTRATE                    : Decimal(16, 2) default '0'  @title: 'SGSTRATE';
    SGSTAMOUNT                  : Decimal(16, 2) default '0'  @title: 'SGSTAMOUNT';
    UTGSTRATE                   : Decimal(16, 2) default '0'  @title: 'UTGSTRATE';
    UTGSTAMOUNT                 : Decimal(16, 2) default '0'  @title: 'UTGSTAMOUNT';
    IGSTRATE                    : Decimal(16, 2) default '0'  @title: 'IGSTRATE';
    IGSTAMOUNT                  : Decimal(16, 2) default '0'  @title: 'IGSTAMOUNT';
    COLLECTEDCGSTRATE           : Decimal(16, 2) default '0'  @title: 'COLLECTEDCGSTRATE';
    COLLECTEDSGSTRATE           : Decimal(16, 2) default '0'  @title: 'COLLECTEDSGSTRATE';
    COLLECTEDIGSTRATE           : Decimal(16, 2) default '0'  @title: 'COLLECTEDIGSTRATE';
    COLLECTEDUTGSTRATE          : Decimal(16, 2) default '0'  @title: 'COLLECTEDUTGSTRATE';
    COLLECTEDCGST               : Decimal(16, 2) default '0'  @title: 'COLLECTEDCGST';
    COLLECTEDSGST               : Decimal(16, 2) default '0'  @title: 'COLLECTEDSGST';
    COLLECTEDIGST               : Decimal(16, 2) default '0'  @title: 'COLLECTEDIGST';
    COLLECTEDUTGST              : Decimal(16, 2) default '0'  @title: 'COLLECTEDUTGST';
    COLLECTEDINVOICEVALUE       : Decimal(16, 2) default '0'  @title: 'COLLECTEDINVOICEVALUE';
    CESS1RATE                   : Decimal(16, 2) default '0'  @title: 'CESS1RATE';
    CESS1AMOUNT                 : Decimal(16, 2) default '0'  @title: 'CESS1AMOUNT';
    CESS2RATE                   : Decimal(16, 2) default '0'  @title: 'CESS2RATE';
    CESS2AMOUNT                 : Decimal(16, 2) default '0'  @title: 'CESS2AMOUNT';
    REASONFORISSUANCESUBCODE    : String(3)                   @title: 'REASONFORISSUANCESUBCODE';
    TOTAL_TAX                   : Decimal(16, 2) default '0'  @title: 'TOTAL_TAX';
    TRANSACTIONCODE             : String(10)                  @title: 'TRANSACTIONCODE';
    TRANSACTIONTYPE             : String(10)                  @title: 'Transaction Type';
    TCSGSTVALUE                 : Decimal(16, 2)              @title: 'TCSGSTVALUE';
    K3TAX                       : Decimal(18, 2)              @title: 'K3TAX';
    TCS_CGST                    : Decimal(16, 2)              @title: 'TCS_CGST';
    TCS_SGST_SGST               : Decimal(16, 2)              @title: 'TCS_SGST_SGST';
    TCS_SGST_UGST               : Decimal(16, 2)              @title: 'TCS_SGST_UGST';
    TCS_IGST                    : Decimal(16, 2)              @title: 'TCS_IGST';
    STATECODE                   : String(2)                   @title: 'STATECODE';
    STATENAME                   : String(50)                  @title: 'STATENAME';
    COUNTRY_CODE                : String(3)                   @title: 'COUNTRY_CODE';
    REGION                      : String(10)                  @title: 'REGION';
    PS_STATENAME                : String(50)                  @title: 'Place of Supply';
    HSNTEXT                     : String(120)                 @title: 'HSNTEXT';
    TRANSACTIONTEXT             : String(50)                  @title: 'TRANSACTIONTEXT';
    STATION                     : String(255)                 @title: 'STATION';
    LEGALNAME                   : String(255)                 @title: 'LEGALNAME';
    TCSGSTIN                    : String(15)                  @title: 'TCSGSTIN';
    STATEOFDEPOSITEOF_GST       : String(2)                   @title: 'STATEOFDEPOSITEOF_GST';
    STATEOFDEPOSITEOF_STATENAME : String(50)                  @title: 'STATEOFDEPOSITEOF_STATENAME';
    SALESRETURN                 : String(12)                  @title: 'SALESRETURN';
}

entity DiscrepancyMaster {
    key code        : String(10);
        description : String(255);
}


entity DiscrepancyTable {
    key AIRLINE_CODE               : String(4) not null   @title: 'Airline Code'                @UI.HiddenFilter;
    key ID                         : String(36) not null  @title: 'ID'                          @UI.Hidden  @UI.HiddenFilter;
        DOCUMENT_ID                : String(36) not null  @title: 'Document ID'                 @UI.Hidden  @UI.HiddenFilter;
        PNR                        : String(10)           @title: 'PNR';
        MAIN_TICKET_NUMBER         : String(15)           @title: 'Ticket Number';
        INVOICENUMBER              : String(5000)         @title: 'Invoice Number';
        DISCREPANCYCODE            : String(2) not null   @title: 'Discrepancy Code';
        DESCRIPTION                : String(255)          @title: 'Description'                 @UI.HiddenFilter;
        IATANUMBER                 : String(10)           @title: 'IATA Number';
        B2B_B2C_INDICATOR          : String(3)            @title: 'B2B or B2C Indicator';
        DATE_OF_ISSUE              : Date                 @title: 'Date of Issue';
        ROUTING                    : String(255)          @title: 'Routing'                     @UI.HiddenFilter;
        TRANSACTION_CODE           : String(10) not null  @title: 'Transaction Code';
        TRANSACTION_TYPE           : String(10)           @title: 'Transaction Type';
        ISSUE_TYPE                 : String(15)           @title: 'Issue Type';
        DOCUMENT_TYPE              : String(20)           @title: 'Document Type';
        RATE_OF_EXCHANGE           : Decimal(12, 8)       @title: 'Rate of Exchange'            @UI.HiddenFilter;
        RATE_OF_EXCHANGE_CURR      : String(10)           @title: 'Rate of Exchange Curr'       @UI.HiddenFilter;
        TAXABLE_AMOUNT             : Decimal(16, 2)       @title: 'Taxable Amount'              @UI.HiddenFilter;
        BASIC_FARE                 : Decimal(16, 2)       @title: 'Basic Fare'                  @UI.HiddenFilter;
        APPLICABLE_TAX_FEES_AMOUNT : Decimal(17, 2)       @title: 'Applicable Tax Fees Amount'  @UI.HiddenFilter;
        OTHER_TAX_AMOUNT           : Decimal(16, 2)       @title: 'Other Tax Amount'            @UI.HiddenFilter;
        GST_RATE_CALCULATED        : Decimal(19, 2)       @title: 'GST Rate Calculated'         @UI.HiddenFilter;
        GST_RATE_COLLECTED         : Decimal(19, 2)       @title: 'GST Rate Collected'          @UI.HiddenFilter;
        SGST_AMOUNT                : Decimal(16, 2)       @title: 'SGST Amount'                 @UI.HiddenFilter;
        SGST_RATE                  : Decimal(16, 2)       @title: 'SGST Rate'                   @UI.HiddenFilter;
        CGST_AMOUNT                : Decimal(16, 2)       @title: 'CGST Amount'                 @UI.HiddenFilter;
        CGST_RATE                  : Decimal(16, 2)       @title: 'CGST Rate'                   @UI.HiddenFilter;
        IGST_AMOUNT                : Decimal(16, 2)       @title: 'IGST Amount'                 @UI.HiddenFilter;
        IGST_RATE                  : Decimal(16, 2)       @title: 'IGST Rate'                   @UI.HiddenFilter;
        UTGST_AMOUNT               : Decimal(16, 2)       @title: 'UTGST Amount'                @UI.HiddenFilter;
        UTGST_RATE                 : Decimal(16, 2)       @title: 'UTGST Rate'                  @UI.HiddenFilter;
        GST_COLLECTED              : Decimal(19, 2)       @title: 'GST Collected'               @UI.HiddenFilter;
        GST_DERIVED                : Decimal(19, 2)       @title: 'GST Derived'                 @UI.HiddenFilter;
        GST_DIFFERENCE             : Decimal(20, 2)       @title: 'GST Difference'              @UI.HiddenFilter;
        COLLECTED_INVOICEAMOUNT    : Decimal(16, 2)       @title: 'Collected Invoice Amount'    @UI.HiddenFilter;
        CALCULATED_INVOICEAMOUNT   : Decimal(28, 2)       @title: 'Calculated Invoice Amount'   @UI.HiddenFilter;
        DIFFERENCE_INVOICEAMOUNT   : Decimal(29, 2)       @title: 'Difference Invoice Amount'   @UI.HiddenFilter;
}

entity ReportGenerator {
    key ID                : UUID;
        type              : String(15);
        reqEmail          : String(255);
        reqDateTime       : Timestamp;
        status            : String(15);
        statusMessage     : String(255);
        fileType          : String(15);
        fileName          : LargeString;
        appType           : String(15);
        filter            : LargeString;
        tableName         : String(125);
        excelColumnName   : LargeString;
        isMultiple        : Boolean;
        fileRange         : String(15);
        jobName           : String(255);
        completedDateTime : Timestamp;
        orderBy           : String(125);
        dateFilterBy      : String(125);
        isparameterized   : Boolean default false ;
        paramfilter       : LargeString;
}

entity ReportBatchFiles {
    key ID   : UUID;
    key SlNo : String(15);
        Type : String(255);
        File : LargeString;
}

entity DA {
        PATH                       : String(1024) not null @title: 'PATH';
    key NAME                       : String(1024)          @title: 'NAME';
    key ROWNUMBER                  : Integer64             @title: 'ROWNUMBER';
        ERROR                      : String(1024)          @title: 'ERROR';
        PARTITION                  : Integer not null      @title: 'PARTITION';
        Description                : String(200)           @title: 'Description';
        UsecaseInfo                : String(200)           @title: 'UsecaseInfo';
        Sign                       : String(20)            @title: 'Sign';
        AccountedAmount            : Decimal(34, 2)        @title: 'AccountedAmount';
        OriginalAmount             : Decimal(34, 2)        @title: 'OriginalAmount';
        OriginalCurrency           : String(20)            @title: 'OriginalCurrency';
        RuleId                     : String(100)           @title: 'RuleId';
        Ruleversion                : String(5)             @title: 'Ruleversion';
        JournalReference           : String(80)            @title: 'JournalReference';
        Eventnumber                : String(5)             @title: 'Eventnumber';
        Eventversion               : String(5)             @title: 'Eventversion';
        Transactiondate            : String(15)            @title: 'Transactiondate';
        Accountingdate             : String(15)            @title: 'Accountingdate';
        Accountingperiod           : String(5)             @title: 'Accountingperiod';
        Postedtoledger             : String(100)           @title: 'Postedtoledger';
        Documentnumber             : String(30)            @title: 'Documentnumber';
        OriginalDocumentNumber     : String(30)            @title: 'OriginalDocumentNumber';
        OriginalEventNumber        : String(30)            @title: 'OriginalEventNumber';
        OriginalEventVersion       : String(10)            @title: 'OriginalEventVersion';
        Sourcedocumenttype         : String(100)           @title: 'Sourcedocumenttype';
        Sourcedocumentreference    : String(80)            @title: 'Sourcedocumentreference';
        Transaction                : String(20)            @title: 'Transaction';
        AmountType                 : String(20)            @title: 'AmountType';
        AmountSubType              : String(20)            @title: 'AmountSubType';
        AmountCategory             : String(80)            @title: 'AmountCategory';
        DifferenceType             : String(80)            @title: 'DifferenceType';
        IssuanceDate               : String(15)            @title: 'IssuanceDate';
        DocumentType               : String(20)            @title: 'DocumentType';
        SubEntityType              : String(80)            @title: 'SubEntityType';
        SubEntityNumber            : String(20)            @title: 'SubEntityNumber';
        JournalDate                : String(15)            @title: 'JournalDate';
        Degraded                   : String(20)            @title: 'Degraded';
        Aggregation1               : String(50)            @title: 'Aggregation1';
        Aggregation2               : String(50)            @title: 'Aggregation2';
        Aggregation3               : String(50)            @title: 'Aggregation3';
        Aggregation4               : String(50)            @title: 'Aggregation4';
        Aggregation5               : String(50)            @title: 'Aggregation5';
        Aggregation6               : String(50)            @title: 'Aggregation6';
        Aggregation7               : String(50)            @title: 'Aggregation7';
        Aggregation8               : String(50)            @title: 'Aggregation8';
        Aggregation9               : String(50)            @title: 'Aggregation9';
        Aggregation10              : String(50)            @title: 'Aggregation10';
        Ledgeraccountnumber        : String(50)            @title: 'Ledgeraccountnumber';
        DestinationLedgerType      : String(20)            @title: 'DestinationLedgerType';
        CostCenter                 : String(20)            @title: 'CostCenter';
        JournalTransactionCurrency : String(20)            @title: 'JournalTransactionCurrency';
        AggregatedJournalLineID    : String(20)            @title: 'AggregatedJournalLineID';
        CreatedAt                  : Timestamp             @title: 'CreatedAt';
        status                     : String(10) default 'NEW';
}

entity AirportMaster {
    key airportCode       : String(3)    @title: 'Airport Code';
        airportName       : String(256)  @title: 'Airport Name'  @UI.HiddenFilter;
        city              : String(256)  @title: 'City';
        stateCode         : String(3)    @title: 'State Code';
        countryCode       : String(3)    @title: 'Country Code';
        CREATEDAT         : Timestamp    @UI.HiddenFilter;
        CONVERTEDFILENAME : String(255)  @UI.HiddenFilter;
}

@cds.persistence.exists
entity RECONCILIATIONVIEW1 {
    DOCUMENTNUMBER     : String(30)          @title: 'Document Number';
    INVOICED           : String(3) not null  @title: 'Invoice ID'             @UI.HiddenFilter;
    DWH_AVAILABLE      : String(3) not null  @title: 'DWH Available'          @UI.HiddenFilter;
    SBR_AVAILABLE      : String(3) not null  @title: 'SBR Available'          @UI.HiddenFilter;
    DATEOFISSUANCE     : Date                @title: 'Date of Issuance';
    TRANSACTIONTYPE    : String(10)          @title: 'Transaction Type';
    TRANSACTIONCODE    : String(10)          @title: 'Transaction Code';
    ISSUEINDICATOR     : String(15)          @title: 'Issue Indicator';
    TYPE               : String(10)          @title: 'Type'                   @UI.HiddenFilter;
    IATANUMBER         : String(10)          @title: 'IATA Number';
    FULLROUTING        : String(255)         @title: 'Full Routing'           @UI.HiddenFilter;
    ROUTINGTYPE        : String(1)           @title: 'Routing Type';
    ONEWAYINDICATOR    : String(1)           @title: 'One Way Indicator'      @UI.HiddenFilter;
    PUBLISHEDFARE      : Decimal(16, 2)      @title: 'Published Fare'         @UI.HiddenFilter;
    RESIDUALVALUE      : String(20)          @title: 'Residual Value'         @UI.HiddenFilter;
    EVENTTYPE          : String(100)         @title: 'Event Type';
    EVENTTYPESHORTCODE : String(15)          @title: 'Event Type Short Name'  @UI.HiddenFilter;
    ENTITYSTATUS       : String(20)          @title: 'Entity Status';
    GSTIN              : String(15)          @title: 'GSTIN';
    DWH_STATUS         : String(3)           @title: 'DWH Status'             @UI.HiddenFilter;
    SBR_STATUS         : String(5)           @title: 'SBR Status'             @UI.HiddenFilter;
}

entity aiGstins {
    key CompCode              : String(4)                      @title: 'Company';
    key gstin                 : String(16);
        stateCode             : type of StateCodes : stateCode @title: 'State';
        StateCodes            : Association to StateCodes
                                    on StateCodes.stateCode = stateCode;
        region                : String(255)                    @title: 'Region';
        SAPbusinessPlace      : String(4)                      @title: 'SAP Business Place';
        SAPSectonCode         : String(4)                      @title: 'SAP Section Code';
        SAPSTATE              : String(100)                    @title: 'SAP State';
        GSTSTATE              : String(100)                    @title: 'GST State';
        PAXCLEARINGGL         : String(20)                     @title: 'GST Pax Clearing A/c';
        CANCELLATIONPENALTYGL : String(20)                     @title: 'GST Pax Clearing A/c';
        VOIDCHARGESGL         : String(20)                     @title: 'GST Pax Clearing A/c';
        CONVENIENCEFEEGL      : String(20)                     @title: 'GST Pax Clearing A/c';
        PAXCGSTGL             : String(20)                     @title: 'GST Pax Clearing A/c';
        PAXSGSTGL             : String(20)                     @title: 'GST Pax Clearing A/c';
        PAXIGSTGL             : String(20)                     @title: 'GST Pax Clearing A/c';
        PAXUGSTGL             : String(20)                     @title: 'GST Pax Clearing A/c';
        REMARKS1              : String(252);
        REMARKS2              : String(252);
}

entity gstinAddress {
    key gstin      : String(16);
    key adresstype : String(1); // (P- Principal Address, A - Additional Address)
    key serialNo   : Integer;
    key validFrom  : Date        @title: 'Valid From'  @UI.HiddenFilter;
        validTo    : Date        @title: 'Valid To'    @UI.HiddenFilter;
        address    : String(255) @title: 'Address';
}

@cds.persistence.exists
entity TCSSUMMARYMAIN {
    ID                 : String(36) not null  @title: 'ID'                    @UI.HiddenFilter;
    IATANUMBER         : String(10) not null  @title: 'IATA Number';
    YEAR               : Integer              @title: 'Year'                  @UI.HiddenFilter;
    MONTH              : Integer              @title: 'GSRT1 Period'          @UI.HiddenFilter;
    GSTR_MONTH         : String(23)           @title: 'GSTR Month';
    OTA_GSTIN          : String(15)           @title: 'OTG GSTIN';
    AIRLINE_GSTN       : String(15)           @title: 'Airline GSTIN'         @UI.HiddenFilter;
    TRANSACTIONTYPE    : String(10)           @title: 'Transaction Type'      @UI.HiddenFilter;
    DOCUMENTTYPE       : String(20) not null  @title: 'Document Type'         @UI.HiddenFilter;
    ORGINALINVOICEDATE : Date                 @title: 'Orginal Invoice Date'  @UI.HiddenFilter;
    PS_STATENAME       : String(50)           @title: 'PS Statename'          @UI.HiddenFilter;
    STATE_OF_DEPOSIT   : String(2)            @title: 'State of Deposit'      @UI.HiddenFilter;
    TAXABLE            : Decimal(18, 2)       @title: 'Taxable'               @UI.HiddenFilter;
    NONTAXABLE         : Decimal(18, 2)       @title: 'Non Taxable'           @UI.HiddenFilter;
    TCS_PERC_GST_VALUE : Decimal(16, 2)       @title: 'TCS PERC GST Value'    @UI.HiddenFilter;
    TCS_CGST           : Decimal(16, 2)       @title: 'TCS CGST'              @UI.HiddenFilter;
    TCS_SGST_UTGST     : Decimal(16, 2)       @title: 'TCS SGST UTGST'        @UI.HiddenFilter;
    TCS_IGST           : Decimal(16, 2)       @title: 'TCS IGST'              @UI.HiddenFilter;
    TOTAL_TICKET_VALUE : Decimal(16, 2)       @title: 'Total Ticket Value'    @UI.HiddenFilter;
}

@cds.persistence.exists
entity TCSSUMMARYDETAILS {
    ID                 : String(36) not null  @title: 'ID'                    @UI.HiddenFilter;
    COMPANYID          : String(36)           @title: 'Company ID'            @UI.HiddenFilter;
    TICKETNUMBER       : String(15)           @title: 'Ticket Number';
    IATANUMBER         : String(10) not null  @title: 'IATA Number';
    INVOICEDATE        : Date                 @title: 'Invoice Date';
    TRANSACTIONTYPE    : String(10)           @title: 'Transaction Type ';
    DOCUMENTTYPE       : String(20) not null  @title: 'Document type';
    OTA_GSTIN          : String(15)           @title: 'OTA GSTIN'             @UI.HiddenFilter;
    ORGINALINVOICEDATE : Date                 @title: 'Orginal Invoice Date'  @UI.HiddenFilter;
    REFUNDISSUEDATE    : Date                 @title: 'Refund Issue date'     @UI.HiddenFilter;
    PS_STATENAME       : String(50)           @title: 'Place of Supply'       @UI.HiddenFilter;
    AIRLINE_GSTN       : String(15)           @title: 'Airline GSTIN'         @UI.HiddenFilter;
    STATE_OF_DEPOSIT   : String(2)            @title: 'State of Deposit'      @UI.HiddenFilter;
    TAXABLE            : Decimal(17, 2)       @title: 'Taxable Value'         @UI.HiddenFilter;
    NONTAXABLE         : Decimal(17, 2)       @title: 'Non Taxable Value'     @UI.HiddenFilter;
    TCS_K3             : Decimal(16, 2)       @title: 'TCS K3'                @UI.HiddenFilter;
    TCS_PERC_GST_VALUE : Decimal(16, 2)       @title: 'TCS PERC GST VALUE'    @UI.HiddenFilter;
    TCS_CGST           : Decimal(16, 2)       @title: 'TCS CGST'              @UI.HiddenFilter;
    TCS_SGST           : Decimal(16, 2)       @title: 'TCS SGST'              @UI.HiddenFilter;
    TCS_UTGST          : Decimal(16, 2)       @title: 'TCS UTGST'             @UI.HiddenFilter;
    TCS_IGST           : Decimal(16, 2)       @title: 'TCS IGST'              @UI.HiddenFilter;
    TCS_SGST_UTGST     : Decimal(16, 2)       @title: 'TCS_SGST_UTGST'        @UI.HiddenFilter;
    TOTAL_TICKET_VALUE : Decimal(16, 2)       @title: 'Total Ticket Value'    @UI.HiddenFilter;
    REMARKS            : String(1) not null   @title: 'Remarks'               @UI.HiddenFilter;
    USERID             : String(1) not null   @title: 'User ID'               @UI.HiddenFilter;
}

entity ASPFILINGDATES {
    key MONTH                       : Integer not null      @title: 'Month'                        @UI.HiddenFilter;
    key YEAR                        : Integer not null      @title: 'Year'                         @UI.HiddenFilter;
        ARA_PERIOD_CLOSING_DATE     : Date                  @title: 'ARA period Closing Date'      @UI.HiddenFilter;
        GST_APP_PERIOD_CLOSING_DATE : Date                  @title: 'GST App Period Closing Date'  @UI.HiddenFilter;
        GST_APP_PROCESSING_PERIOD   : String(30)            @title: 'GST App Processing Period'    @UI.HiddenFilter;
        ISCLOSED                    : Boolean default false @title: 'IS Closed';
        CLOSED_ON                   : Timestamp             @title: 'Closed ON';
        CLOSED_BY                   : String(100)           @title: 'Closed By'
}

@cds.persistence.exists
entity TCSI_RT {
    TICKETNUMBER          : String(15)     @title: 'Ticket Number';
    DOCUMENTTYPE          : String(20)     @title: 'Document Type';
    STATUS                : String(25)     @title: 'Status';
    SUPPLIERGSTIN         : String(15)     @title: 'Airline GSTIN';
    INVOICEDATE           : Date           @title: 'Invoice Date';
    ORGINALINVOICEDATE    : Date           @title: 'Original Invoice Date';
    IATANUMBER            : String(10)     @title: 'IATA Number';
    COMPANY               : String(4)      @title: 'Company';
    TRANSACTIONTYPE       : String(10)     @title: 'Sale_Refund';
    REMARKS               : String(1)      @title: 'Remarks';
    USERID                : String(1)      @title: 'User ID';
    PLACEOFSUPPLY         : String(255)    @title: 'Place of Supply';
    PLACE_SUPPLY          : String(2)      @title: 'Place of Supply';
    STATECODE             : String(2)      @title: 'State Code';
    STATENAME             : String(50)     @title: 'State Name';
    IATANUMBER_1          : String(10)     @title: 'IATA Number ';
    ISECOMMERCEOPERATOR   : Boolean        @title: 'IS E-Commerceoperator';
    SUPPLIERGSTIN2        : String(2)      @title: 'Supplier GSTIN';
    COMPANYID             : String(36)     @title: 'Company ID';
    GSTIN_OTA             : String(15)     @title: 'GSTIN OTA';
    TICKETISSUEDATE_RFND  : Date           @title: 'Ticket Issue Date Refund';
    GSTR1PERIOD           : String(6)      @title: 'GSTR1 Period';
    GSTR1FILINGSTATUS     : String(25)     @title: 'GSTR1 Filing Status';
    I_YEAR                : Integer        @title: 'Invoice Year';
    I_MONTH               : Integer        @title: 'Invoice Month';
    G_YEAR                : String(4)      @title: 'Year';
    G_MONTH               : String(2)      @title: 'Month';
    YEAR_MONTH            : String(7)      @title: 'Year Month';
    TAXABLE_1             : Decimal(16, 2) @title: 'Taxable Value';
    CGSTRATE              : Decimal(16, 2) @title: 'CGST Rate';
    SGSTRATE              : Decimal(16, 2) @title: 'SGST Rate';
    IGSTRATE              : Decimal(16, 2) @title: 'IGST Rate';
    UTGSTRATE             : Decimal(16, 2) @title: 'UGST Rate';
    COLLECTEDINVOICEVALUE : Decimal(16, 2) @title: 'Collected Invoice Value';
    NONTAXABLE            : Decimal(16, 2) @title: 'Non Taxable Value';
    TCS_PERC_GST_VALUE    : Decimal(19, 2) @title: 'TCS PERC GST VALUE';
    TOTAL_TICKET_VALUE    : Decimal(17, 2) @title: 'Total Ticket Value';
    TAXABLE               : Decimal(16, 2) @title: 'Taxable';
    TCS_SGST_UTGST        : Decimal(16, 2) @title: 'TCS SGST UTGST';
    TCS_IGST              : Decimal(16, 2) @title: 'TCS IGST';
    TCS_CGST              : Decimal(16, 2) @title: 'TCS CGST';
    TCS_SGST              : Decimal(16, 2) @title: 'TCS SGST';
    TCS_UTGST             : Decimal(16, 2) @title: 'TCS UTGST';
    TOTAL_TAX             : Decimal(16, 2) @title: 'TCS K3';
}

entity OTAGSTINMaster {
    key IATACODE      : String(10)            @title: 'IATA Code';
    key OTAGSTIN      : String(20)            @title: 'OTA GSTIN';
        OTAGSTIN_NAME : String(250)           @title: 'OTA GSTIN Name';
        STATE         : String(100)           @title: 'State';
        STATE_CODE    : String(2)             @title: 'State Code';
        DEFAULT       : Boolean default false @title: 'IS Default';
}

@cds.persistence.exists
entity MJVI_1 {
    SUPPLIERGSTIN    : String(15)      @title: 'Supplier GSTIN'        @UI.HiddenFilter;
    GSTR1PERIOD      : String(6)       @title: 'GSTR1 Period';
    CC_1GLACCOUNT    : String(13)      @title: 'Account'               @UI.HiddenFilter;
    SAPBUSINESSPLACE : String(4)       @title: 'Business Place'        @UI.HiddenFilter;
    SAPSECTONCODE    : String(4)       @title: 'Section Code'          @UI.HiddenFilter;
    POSTINGKEY       : String(2)       @title: 'Posting Key'           @UI.HiddenFilter;
    DTYPE            : String(3)       @title: 'Type'                  @UI.HiddenFilter;
    DOCDATE          : Date            @title: 'Document Date';
    DOCNO            : String(12)      @title: 'DOC NO'                @UI.HiddenFilter;
    DOCTYPE          : String(13)      @title: 'Document Type'         @UI.HiddenFilter;
    BUKRS            : String(4)       @title: 'Company Code'          @UI.HiddenFilter;
    BUDAT            : Date            @title: 'Posting Date'          @UI.HiddenFilter;
    WAERS            : String(3)       @title: 'Currenecy'             @UI.HiddenFilter;
    XBLNR            : String(12)      @title: 'Reference'             @UI.HiddenFilter;
    BKTXT            : String(25)      @title: 'Document Header Text'  @UI.HiddenFilter;
    SGTXT            : String(25)      @title: 'Text'                  @UI.HiddenFilter;
    GSBER            : String(3)       @title: 'Business Area'         @UI.HiddenFilter;
    KOSTL            : String(8)       @title: 'Profit Centre'         @UI.HiddenFilter;
    XREF3            : String(15)      @title: 'Reference key 3'       @UI.HiddenFilter;
    SERIAL           : Integer         @title: 'Seq Number'            @UI.HiddenFilter;
    AMOUNT           : Decimal(16, 2)  @title: 'Amount'                @UI.HiddenFilter;
}

@cds.persistence.exists
entity TICKETSTATUSREPORT {
    key IATANUMBER               : String(10)      @title: 'IATA Number';
        TICKETNUMBER             : String(15)      @title: 'Ticket Number';
        TICKETISSUEDATE          : Date            @title: 'Ticket Issue Date';
        SUPPLIERGSTIN            : String(15)      @title: 'Supplier GSTIN';
        SBRRECIVEDON             : Timestamp       @title: 'SBR Recived ON'                @UI.HiddenFilter;
        SBRPROCESSEDON           : Timestamp       @title: 'SBR Processed ON'              @UI.HiddenFilter;
        INVOICENUMBER            : String(16)      @title: 'Invoice Number';
        INVOICEDATE              : Date            @title: 'Invoice Date';
        SECTIONTYPE              : String(3)       @title: 'Section Type'                  @UI.HiddenFilter;
        PLACEOFSUPPLY            : String(255)     @title: 'Place of Supply'               @UI.HiddenFilter;
        FULLROUTING              : String(255)     @title: 'Full Routing'                  @UI.HiddenFilter;
        DOCUMENTCURRENCY_CODE    : String(3)       @title: 'Document Currency code'        @UI.HiddenFilter;
        BILLTONAME               : String(255)     @title: 'Bill to Name'                  @UI.HiddenFilter;
        PASSENGERGSTIN           : String(15)      @title: 'Passenger GSTIN'               @UI.HiddenFilter;
        NETTAXABLEVALUE          : Decimal(16, 2)  @title: 'Net Taxable Value'             @UI.HiddenFilter;
        TAXABLECALCULATION       : String(255)     @title: 'Taxable Calculation'           @UI.HiddenFilter;
        TOTALINVOICEAMOUNT       : Decimal(16, 2)  @title: 'Total Invoice Amount'          @UI.HiddenFilter;
        EXEMPTEDZONE             : String(1)       @title: 'Exempted Zone'                 @UI.HiddenFilter;
        COMPANYID                : String(36)      @title: 'Company ID'                    @UI.HiddenFilter;
        REASONFORISSUANCESUBCODE : String(3)       @title: 'Reason for Issuances Subcode'  @UI.HiddenFilter;
        ORGINALFILENAME          : String(255)     @title: 'Orginal Filename'              @UI.HiddenFilter;
        TRANSACTIONTYPE          : String(10)      @title: 'Transaction Type'              @UI.HiddenFilter;
        TRANSACTIONCODE          : String(10)      @title: 'Transaction Code'              @UI.HiddenFilter;
        ORIGINCITY               : String(5)       @title: 'Origin City'                   @UI.HiddenFilter;
        DESTINATIONCITY          : String(5)       @title: 'Destination City'              @UI.HiddenFilter;
        PUBLISHEDFARE            : Decimal(16, 2)  @title: 'Published Fare'                @UI.HiddenFilter;
        STATUS                   : String(3)       @title: 'Status'                        @UI.HiddenFilter;
        HSNCODE                  : String(8)       @title: 'HSN Code'                      @UI.HiddenFilter;
        DISCOUNT                 : Decimal(16, 2)  @title: 'Discount'                      @UI.HiddenFilter;
        CGSTRATE                 : Decimal(16, 2)  @title: 'CGST Rate'                     @UI.HiddenFilter;
        CGSTAMOUNT               : Decimal(16, 2)  @title: 'CGST Amount'                   @UI.HiddenFilter;
        SGSTRATE                 : Decimal(16, 2)  @title: 'SGST Rate'                     @UI.HiddenFilter;
        SGSTAMOUNT               : Decimal(16, 2)  @title: 'SGST Amount'                   @UI.HiddenFilter;
        UTGSTRATE                : Decimal(16, 2)  @title: 'UTGST Rate'                    @UI.HiddenFilter;
        UTGSTAMOUNT              : Decimal(16, 2)  @title: 'UTGST Amount'                  @UI.HiddenFilter;
        IGSTRATE                 : Decimal(16, 2)  @title: 'IGST Rate'                     @UI.HiddenFilter;
        IGSTAMOUNT               : Decimal(16, 2)  @title: 'IGST Amount'                   @UI.HiddenFilter;
        DOCUMENTTYPE             : String(20)      @title: 'Document Type';
        LEGALNAME                : String(255)     @title: 'Legal Name'                    @UI.HiddenFilter;
        TRADENAME                : String(255)     @title: 'Trade Name'                    @UI.HiddenFilter;
}

@cds.persistence.exists
entity MJVI_OB {
    SUPPLIERGSTIN    : String(15)      @title: 'Supplier GSTIN'        @UI.HiddenFilter;
    GSTR1PERIOD      : String(6)       @title: 'GSTR1 Period';
    CC_1GLACCOUNT    : String(13)      @title: 'Account'               @UI.HiddenFilter;
    SAPBUSINESSPLACE : String(4)       @title: 'Business Place'        @UI.HiddenFilter;
    SAPSECTONCODE    : String(4)       @title: 'Section Code'          @UI.HiddenFilter;
    POSTINGKEY       : String(2)       @title: 'Posting Key'           @UI.HiddenFilter;
    DTYPE            : String(3)       @title: 'Type'                  @UI.HiddenFilter;
    DOCDATE          : Date            @title: 'Document Date';
    DOCNO            : String(12)      @title: 'DOC NO'                @UI.HiddenFilter;
    DOCTYPE          : String(13)      @title: 'Document Type'         @UI.HiddenFilter;
    BUKRS            : String(4)       @title: 'Company Code'          @UI.HiddenFilter;
    BUDAT            : Date            @title: 'Posting Date'          @UI.HiddenFilter;
    WAERS            : String(3)       @title: 'Currenecy'             @UI.HiddenFilter;
    XBLNR            : String(12)      @title: 'Reference'             @UI.HiddenFilter;
    BKTXT            : String(25)      @title: 'Document Header Text'  @UI.HiddenFilter;
    SGTXT            : String(25)      @title: 'Text'                  @UI.HiddenFilter;
    GSBER            : String(3)       @title: 'Business Area'         @UI.HiddenFilter;
    KOSTL            : String(8)       @title: 'Profit Centre'         @UI.HiddenFilter;
    XREF3            : String(15)      @title: 'Reference key 3'       @UI.HiddenFilter;
    SERIAL           : Integer         @title: 'Seq Number'            @UI.HiddenFilter;
    AMOUNT           : Decimal(16, 2)  @title: 'Amount'                @UI.HiddenFilter;
}

@cds.persistence.exists
entity MJVI_VOID {
    SUPPLIERGSTIN    : String(15)      @title: 'Supplier GSTIN'        @UI.HiddenFilter;
    GSTR1PERIOD      : String(6)       @title: 'GSTR1 Period';
    CC_1GLACCOUNT    : String(13)      @title: 'Account'               @UI.HiddenFilter;
    SAPBUSINESSPLACE : String(4)       @title: 'Business Place'        @UI.HiddenFilter;
    SAPSECTONCODE    : String(4)       @title: 'Section Code'          @UI.HiddenFilter;
    POSTINGKEY       : String(2)       @title: 'Posting Key'           @UI.HiddenFilter;
    DTYPE            : String(3)       @title: 'Type'                  @UI.HiddenFilter;
    DOCDATE          : Date            @title: 'Document Date';
    DOCNO            : String(12)      @title: 'DOC NO'                @UI.HiddenFilter;
    DOCTYPE          : String(13)      @title: 'Document Type'         @UI.HiddenFilter;
    BUKRS            : String(4)       @title: 'Company Code'          @UI.HiddenFilter;
    BUDAT            : Date            @title: 'Posting Date'          @UI.HiddenFilter;
    WAERS            : String(3)       @title: 'Currenecy'             @UI.HiddenFilter;
    XBLNR            : String(12)      @title: 'Reference'             @UI.HiddenFilter;
    BKTXT            : String(25)      @title: 'Document Header Text'  @UI.HiddenFilter;
    SGTXT            : String(25)      @title: 'Text'                  @UI.HiddenFilter;
    GSBER            : String(3)       @title: 'Business Area'         @UI.HiddenFilter;
    KOSTL            : String(8)       @title: 'Profit Centre'         @UI.HiddenFilter;
    XREF3            : String(15)      @title: 'Reference key 3'       @UI.HiddenFilter;
    SERIAL           : Integer         @title: 'Seq Number'            @UI.HiddenFilter;
    AMOUNT           : Decimal(16, 2)  @title: 'Amount'                @UI.HiddenFilter;
}

@cds.persistence.exists
entity MJVI_CP {
    SUPPLIERGSTIN    : String(15)      @title: 'Supplier GSTIN'        @UI.HiddenFilter;
    GSTR1PERIOD      : String(6)       @title: 'GSTR1 Period';
    CC_1GLACCOUNT    : String(13)      @title: 'Account'               @UI.HiddenFilter;
    SAPBUSINESSPLACE : String(4)       @title: 'Business Place'        @UI.HiddenFilter;
    SAPSECTONCODE    : String(4)       @title: 'Section Code'          @UI.HiddenFilter;
    POSTINGKEY       : String(2)       @title: 'Posting Key'           @UI.HiddenFilter;
    DTYPE            : String(3)       @title: 'Type'                  @UI.HiddenFilter;
    DOCDATE          : Date            @title: 'Document Date';
    DOCNO            : String(12)      @title: 'DOC NO'                @UI.HiddenFilter;
    DOCTYPE          : String(13)      @title: 'Document Type'         @UI.HiddenFilter;
    BUKRS            : String(4)       @title: 'Company Code'          @UI.HiddenFilter;
    BUDAT            : Date            @title: 'Posting Date'          @UI.HiddenFilter;
    WAERS            : String(3)       @title: 'Currenecy'             @UI.HiddenFilter;
    XBLNR            : String(12)      @title: 'Reference'             @UI.HiddenFilter;
    BKTXT            : String(25)      @title: 'Document Header Text'  @UI.HiddenFilter;
    SGTXT            : String(25)      @title: 'Text'                  @UI.HiddenFilter;
    GSBER            : String(3)       @title: 'Business Area'         @UI.HiddenFilter;
    KOSTL            : String(8)       @title: 'Profit Centre'         @UI.HiddenFilter;
    XREF3            : String(15)      @title: 'Reference key 3'       @UI.HiddenFilter;
    SERIAL           : Integer         @title: 'Seq Number'            @UI.HiddenFilter;
    AMOUNT           : Decimal(16, 2)  @title: 'Amount'                @UI.HiddenFilter;
}

entity GSTR1ProcFileddata {
    key FILEID            : String(12);
        SOURCEIDENTIFIER  : String(20);
        SOURCEFILENAME    : String(10);
        RETURNPERIOD      : String(20);
        SUPPLIERGSTIN     : String(15);
        DOCUMENTTYPE      : String(20);
        SUPPLYTYPE        : String(10);
        DOCUMENTNUMBER    : String(20);
        DOCUMENTDATE      : Date;
        RECORDTYPE2       : String(5);
        RECORDTYPE        : String(50);
        SUBCATEGORY       : String(50);
        INFOCODES         : String(20);
        INFODESC          : String(250);
        CREATEDAT         : Timestamp;
        CONVERTEDFILENAME : String(255);
}

entity dataIgnore {
    key DOCUMENTNUMBER    : String(20);
        STATE             : String(5);
        CREATEDAT         : Timestamp;
        CONVERTEDFILENAME : String(255);
}

entity PaxAspError {
    key ERRORCODES        : String(250);
        ERRORDESCRIPTION  : String(250);
        FILENAME          : String(250);
        FILEID            : String(50);
        SOURCEIDENTIFIER  : String(250);
        SOURCEFILENAME    : String(20);
        RETURNPERIOD      : String(20);
        SUPPLIERGSTIN     : String(15);
        DOCUMENTTYPE      : String(20);
        SUPPLYTYPE        : String(10);
        DOCUMENTNUMBER    : String(20);
        DOCUMENTDATE      : Date;
        CREATEDAT         : Timestamp;
        CONVERTEDFILENAME : String(255);
}

entity GstnErrors {
    key SOURCEIDENTIFIER  : String(20);
        SOURCEFILENAME    : String(10);
        RETURNPERIOD      : String(20);
        SUPPLIERGSTIN     : String(15);
        DOCUMENTTYPE      : String(10);
        SUPPLYTYPE        : String(10);
        DOCUMENTNUMBER    : String(20);
        DOCUMENTDATE      : Date;
        ERRORCODE         : String(20);
        ERRORDESC         : String(250);
        REFID             : String(50);
        CREATEDAT         : Timestamp;
        CONVERTEDFILENAME : String(255);
}

entity LocationIdentifier {
    key CITY_CODE         : String(3);
        CITY_NAME         : String(3);
        STATE             : String(2);
        COUNTRY_CODE      : String(2);
        TIME_ZONE_CODE    : String(2);
        STV               : String(1);
        AIRPORT_CODE      : String(3);
        AIRPORT_NAME      : String(22);
        NUMERIC_CODE      : String(4);
        LOC_TYPE          : String(1);
        CREATEDAT         : Timestamp;
        CONVERTEDFILENAME : String(255);
}

entity AIRLINE_CODE {
    AIRLINE_NAME1           : String(40);
    AIRLINE_NAME2           : String(40);
    ACCOUNTING_CODE         : String(4);
    THREE_LETTER_CODE       : String(3);
    TWO_CHAR_CODE           : String(2);
    DUPLICATE_FLAG          : String(1);
    ADDRESS1                : String(40);
    ADDRESS2                : String(40);
    CITY                    : String(25);
    STATE                   : String(20);
    COUNTRY                 : String(44);
    POSTAL_CODE             : String(10);
    RESR_DEPT_TYPE          : String(8);
    RESR_CONTACT_NAME       : String(20);
    RESR_CONTACT_TITLE      : String(20);
    RESR_CONTACT_TELE_TYPE  : String(8);
    EMERGENCY_TELE_TYPE     : String(8);
    EMERGENCY_CONTACT_NAME  : String(20);
    EMERGENCY_CONTACT_TITLE : String(20);
    SITA_FLAG               : String(1);
    ARINC_FLAG              : String(1);
    IATA_FLAG               : String(1);
    ATA_FLAG                : String(1);
    TYPE_OP_CODE            : String(1);
    ACCOUNTING_CODE_FLAG    : String(1);
    AIRLINE_PREFIX          : String(3);
    AIRLINE_PREFIX_SEC_FLAG : String(1);
    CREATEDAT               : Timestamp;
    CONVERTEDFILENAME       : String(1024);
}
@cds.persistence.exists
entity DA_INV_RECON_SUM {
    DOC_NUM          : String(15)      @title: 'Document Number';
    USECASE_CAL      : String(50)      @title: 'Usecase cal'       @UI.HiddenFilter;
    DOCUMENTTYPE_CAL : String(5)       @title: 'Documenttype cal'  @UI.HiddenFilter;
    GSTR1PERIOD_1    : String(6)       @title: 'GSTR1 Period';
    DA_INV_CP        : Decimal(16, 2)  @title: 'DA Invoice CP'     @UI.HiddenFilter;
    DIFFERENCE       : Integer         @title: 'Difference'        @UI.HiddenFilter;
    K3_DA            : Decimal(16, 2)  @title: 'K3_DA'             @UI.HiddenFilter;
    CP_TAX           : Decimal(16, 2)  @title: 'CP_TAX'            @UI.HiddenFilter;
    OB_TAX           : Decimal(16, 2)  @title: 'OB_TAX'            @UI.HiddenFilter;
    VOIDCHARGES_TAX  : Decimal(16, 2)  @title: 'VOIDCHARGES_TAX'   @UI.HiddenFilter;
    K3_INV           : Decimal(16, 2)  @title: 'K3_INV'            @UI.HiddenFilter;
}
@cds.persistence.calcview
@cds.persistence.exists
entity DA_RECON_MAIN (GSTR1PERIOD : String(6)) {
    GSTR1PERIOD_1    : String(13)      @title: 'GSTR1 Period';
    USECASE_CAL      : String(50)      @title: 'Usecase cal'       @UI.HiddenFilter;
    DOCUMENTTYPE_CAL : String(5)       @title: 'Documenttype cal'  @UI.HiddenFilter;
    K3_DA            : Decimal(16, 2)  @title: 'K3_DA'             @UI.HiddenFilter;
    CP_TAX           : Decimal(16, 2)  @title: 'CP_TAX'            @UI.HiddenFilter;
    OB_TAX           : Decimal(16, 2)  @title: 'OB_TAX'            @UI.HiddenFilter;
    VOIDCHARGES_TAX  : Decimal(16, 2)  @title: 'VOIDCHARGES_TAX'   @UI.HiddenFilter;
    K3_INV           : Decimal(16, 2)  @title: 'K3_INV'            @UI.HiddenFilter;
}