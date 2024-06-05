using AmendmentService as service from '../../srv/amendments-Service';

@UI.DeleteHidden: true
annotate service.Invoice with @UI: {
    PresentationVariant: {
        Visualizations: ['@UI.LineItem'],
        SortOrder     : [{
            Property  : amendmentRequestedOn,
            Descending: true
        }],
    },
    LineItem           : [
        {
            $Type: 'UI.DataField',
            Value: documentCurrency_code,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Value: company,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Value: ID,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Value: documentId,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Value: billToCountry_code,
            ![@UI.Hidden]
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Invoice Number',
            Value                : invoiceNumber,
            ![@HTML5.CssDefaults]: {width: '151px'}
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Invoice Date',
            Value                : invoiceDate,
            ![@HTML5.CssDefaults]: {width: '6.9rem'}
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'PNR',
            Value                : PNR,
            ![@HTML5.CssDefaults]: {width: '72px'}
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Passenger GSTIN',
            Value                : passengerGSTIN,
            ![@HTML5.CssDefaults]: {width: '126px'}
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Supplier GSTIN',
            Value                : supplierGSTIN,
            ![@HTML5.CssDefaults]: {width: '146px'}
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Amendment Request Number',
            Value                : amendmentRequestNo,
            ![@HTML5.CssDefaults]: {width: '203px'}
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Amendment Requested By',
            Value                : amendmentRequestedBy,
            ![@HTML5.CssDefaults]: {width: '190px'}
        },
        {
            $Type      : 'UI.DataField',
            Label      : 'Amendment Status',
            Value      : amendementStatus,
            Criticality: criticality
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Amendment Requested On',
            Value                : amendmentRequestedOn,
            ![@HTML5.CssDefaults]: {width: '187px'}
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Amended Address',
            Value                : amendentedAddress,
            ![@HTML5.CssDefaults]: {width: '280px'}
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Amendment Old Value',
            Value                : amendementOldValue,
            ![@HTML5.CssDefaults]: {width: '176px'}
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Amendment New Value',
            Value                : amendementNewValue,
            ![@HTML5.CssDefaults]: {width: '176px'}
        },
        {
            $Type: 'UI.DataField',
            Label: 'Amendment Approved by',
            Value: amendmentApprovedBy
        },
        {
            $Type: 'UI.DataField',
            Label: 'Amendment Approved On',
            Value: amendmentApprovedOn
        },
        {
            $Type: 'UI.DataField',
            Label: 'Amendment Reason',
            Value: amendmentReason
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Invoice Amount',
            Value                : totalInvoiceAmount,
            ![@HTML5.CssDefaults]: {width: '106px'}
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Taxable Value',
            Value                : netTaxableValue,
            ![@HTML5.CssDefaults]: {width: '89px'}
        },
        // {
        //     $Type                : 'UI.DataField',
        //     Label                : 'Total Tax',
        //     Value                : totalTax,
        //     ![@HTML5.CssDefaults]: {width: '89px'}
        // },
        {
            $Type: 'UI.DataField',
            Label: 'Taxable Calculation',
            Value: taxableCalculation
        },
        {
            $Type: 'UI.DataField',
            Label: 'Discount Taxable Calculation',
            Value: discountTaxableCalculation
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Currency',
            Value                : documentCurrency.descr,
            ![@HTML5.CssDefaults]: {width: '89px'}
        },
        {
            $Type: 'UI.DataField',
            Label: 'Airport Code',
            Value: airportCode
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Code',
            Value: taxCode
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Code Description',
            Value: TaxCodes.taxDescription,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Full Routing',
            Value: fullRouting
        },
        {
            $Type: 'UI.DataField',
            Label: 'Journey Covered',
            Value: journeyCovered,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Label: 'Bill To Name',
            Value: billToName,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Label: 'Bill To Full Address',
            Value: billToFullAddress,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Label: 'Bill To Country',
            Value: billToCountry.descr,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Label: 'Bill To State Code',
            Value: billToStateCode,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Label: 'Bill To Postal Code',
            Value: billToPostalCode,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Label: 'Invoice Status',
            Value: invoiceStatus,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Is Reverse Charge Applicable',
            Value: isReverseChargeApplicable,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Label: 'SBR Received On',
            Value: SBRRecivedOn,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Label: 'SBR Processed On',
            Value: SBRProcessedOn,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Label: 'Document Type',
            Value: documentType,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Ticket Type',
            Value: ticketType,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Section Type',
            Value: sectionType,
        },
        {
            $Type: 'UI.DataField',
            Label: 'IATA Number',
            Value: iataNumber,
        },
        {
            $Type: 'UI.DataField',
            Label: 'GSTR1 Period',
            Value: gstR1Period,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Label: 'GSTR1 Filing Status',
            Value: gstR1filingStatus,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Label: 'Original Invoice Number',
            Value: originalInvoiceNumber,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Original GSTIN',
            Value: originalGstin,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Original Section Type',
            Value: originalSectionType,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Issue Indicator',
            Value: issueIndicator,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Routing Type',
            Value: routingType,
        },
        {
            $Type: 'UI.DataField',
            Label: 'One-Way Indicator',
            Value: oneWayIndicator,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Direction Indicator',
            Value: directionIndicator,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Place of Supply',
            Value: StateCodes.stateName,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Ticket Number',
            Value: ticketNumber,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Ticket Issue Date',
            Value: ticketIssueDate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Ticket Class',
            Value: ticketClass,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Passenger Name',
            Value: passangerName,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Transaction Code',
            Value: transactionCode,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Transaction Type',
            Value: transactionType,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Total Journey',
            Value: totalJourney,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Label: 'Company',
            Value: Company.description,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Label: 'Orginal Document Number',
            Value: OriginalDocumentNbr,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Orginal Invoice Number',
            Value: originalInvoiceNumber,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Orginal Invoice Date',
            Value: orginalInvoiceDate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Agency Memo Code',
            Value: reasonForMemoCode,
        },
        {
            $Type: 'UI.DataField',
            Label: 'B2B',
            Value: b2b,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Label: 'E-India',
            Value: eindia,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Label: 'Exempted Zone',
            Value: exemptedZone,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Label: 'Inter State',
            Value: intrastate,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Label: 'Is SEZ',
            Value: IsSEZ,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Label: 'Is UT',
            Value: isUT,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Label: 'FOP',
            Value: fop
        },
        {
            $Type: 'UI.DataField',
            Label: 'XONO',
            Value: xoNo,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Value: placeOfSupply,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Value: criticality,
            @UI.Hidden
        },
    // {
    //     $Type : 'UI.DataFieldForAction',
    //     Action: 'AmendmentService.approveAmendment',
    //     Inline: false,
    //     Label : 'Approve',
    // },
    // {
    //     $Type : 'UI.DataFieldForAction',
    //     Action: 'AmendmentService.rejectAmendment',
    //     Inline: false,
    //     Label : 'Reject',
    // },
    ],
    SelectionFields    : [
        company,
        PNR,
        ticketNumber,
        passengerGSTIN,
        supplierGSTIN,
        ticketIssueDate,
        invoiceDate,
        invoiceNumber,
        iataNumber,
        documentType
    ],
};


/**
 * Value Help
 */
annotate service.Invoice with {

    company
                    @(
        title                          : 'Company',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListCompany',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'company',
                ValueListProperty: 'Company'
            }]
        }
    );

    PNR
                    @(
        title                          : 'PNR',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListPNR',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'PNR',
                ValueListProperty: 'PNR'
            }]
        }
    );

    ticketNumber

                    @(
        title                          : 'Ticket Number',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListTicketNumber',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                ValueListProperty: 'ticketNumber',
                LocalDataProperty: 'ticketNumber'
            }]
        }
    );

    passengerGSTIN

                    @(
        title                          : 'Passenger GSTIN',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListPassengerGSTIN',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                ValueListProperty: 'passengerGSTIN',
                LocalDataProperty: 'passengerGSTIN'
            }]
        }
    );

    supplierGSTIN

                    @(
        title                          : 'Supplier GSTIN',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListSupplierGSTIN',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                ValueListProperty: 'supplierGSTIN',
                LocalDataProperty: 'supplierGSTIN'
            }]
        }
    );

    // ticketIssueDate

    // @(
    //     title                          : 'Ticket Issue Date',
    //     Common.ValueListWithFixedValues: false,
    //     Common.ValueList               : {
    //         CollectionPath: 'valueListTicketIssueDate',
    //         Parameters    : [{
    //             $Type            : 'Common.ValueListParameterInOut',
    //             ValueListProperty: 'ticketIssueDate',
    //             LocalDataProperty: 'ticketIssueDate'
    //         }]
    //     }
    // );

    // invoiceDate

    // @(
    //     title                          : 'Invoice Date',
    //     Common.ValueListWithFixedValues: false,
    //     Common.ValueList               : {
    //         CollectionPath: 'valueListInvoiceDate',
    //         Parameters    : [{
    //             $Type            : 'Common.ValueListParameterInOut',
    //             ValueListProperty: 'invoiceDate',
    //             LocalDataProperty: 'invoiceDate'
    //         }]
    //     }
    // );

    invoiceNumber

                    @(
        title                          : 'Invoice Number',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListInvoiceNumber',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                ValueListProperty: 'invoiceNumber',
                LocalDataProperty: 'invoiceNumber'
            }]
        }
    );
    iataNumber

                    @(
        title                          : 'IATA Number',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListIataNumber',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    ValueListProperty: 'iataNumber',
                    LocalDataProperty: 'iataNumber'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'legalName',
                },
            ]
        }
    );

    invoiceStatus

                    @(
        title                          : 'Invoice Status',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListInvoiceStatus',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                ValueListProperty: 'invoiceStatus',
                LocalDataProperty: 'invoiceStatus'
            }]
        }
    );

    documentType

                    @(
        title                          : 'Document Type',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListDocumentType',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    ValueListProperty: 'documentType',
                    LocalDataProperty: 'documentType'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'description'
                }
            ]
        }
    );

    transactionCode @Common: {
        title                   : 'Transaction Type',
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListTransactionType',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: transactionCode,
                    ValueListProperty: 'transactionCode'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'transactionText'
                }
            ]
        }
    };

    sectionType

                    @(
        title                          : 'Section Type',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListSectionType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                ValueListProperty: 'sectionType',
                LocalDataProperty: 'sectionType'
            }]
        }
    );

    routingType

                    @(
        title                          : 'Routing Type',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListRoutingType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                ValueListProperty: 'routingType',
                LocalDataProperty: 'routingType'
            }]
        }
    );

    issueIndicator

                    @(
        title                          : 'Issue Indicator',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListIssueIndicator',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                ValueListProperty: 'issueIndicator',
                LocalDataProperty: 'issueIndicator'
            }]
        }
    );

    passangerName

                    @(
        title                          : 'Passenger Name',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListPassengerName',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                ValueListProperty: 'passangerName',
                LocalDataProperty: 'passangerName'
            }]
        }
    );
}

annotate service.Invoice with @(
    UI.HeaderInfo                   : {
        TypeName      : 'Document',
        TypeNamePlural: 'Documents',
        Title         : {
            $Type: 'UI.DataField',
            Value: invoiceNumber,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: invoiceDate
        },
    },
    UI.FieldGroup #GeneratedGroup1  : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: documentCurrency_code,
                ![@UI.Hidden]
            },
            {
                $Type: 'UI.DataField',
                Value: company,
                ![@UI.Hidden]
            },
            {
                $Type: 'UI.DataField',
                Value: ID,
                ![@UI.Hidden]
            },
            {
                $Type: 'UI.DataField',
                Value: documentId,
                ![@UI.Hidden]
            },
            {
                $Type: 'UI.DataField',
                Value: billToCountry_code,
                ![@UI.Hidden]
            },
            {
                $Type                : 'UI.DataField',
                Label                : 'Amendment Request Number',
                Value                : amendmentRequestNo,
                ![@HTML5.CssDefaults]: {width: '203px'}
            },
            {
                $Type                : 'UI.DataField',
                Label                : 'Amendment Requested By',
                Value                : amendmentRequestedBy,
                ![@HTML5.CssDefaults]: {width: '190px'}
            },
            {
                $Type      : 'UI.DataField',
                Label      : 'Amendment Status',
                Value      : amendementStatus,
                Criticality: criticality
            },
            {
                $Type                : 'UI.DataField',
                Label                : 'Amendment Requested On',
                Value                : amendmentRequestedOn,
                ![@HTML5.CssDefaults]: {width: '187px'}
            },
            {
                $Type                : 'UI.DataField',
                Label                : 'Amended Address',
                Value                : amendentedAddress,
                ![@HTML5.CssDefaults]: {width: '280px'}
            },
            {
                $Type                : 'UI.DataField',
                Label                : 'Amendment Old Value',
                Value                : amendementOldValue,
                ![@HTML5.CssDefaults]: {width: '176px'}
            },
            {
                $Type                : 'UI.DataField',
                Label                : 'Amendment New Value',
                Value                : amendementNewValue,
                ![@HTML5.CssDefaults]: {width: '176px'}
            },
            {
                $Type: 'UI.DataField',
                Label: 'Amendment Approved by',
                Value: amendmentApprovedBy
            },
            {
                $Type: 'UI.DataField',
                Label: 'Amendment Approved On',
                Value: amendmentApprovedOn
            },
            {
                $Type: 'UI.DataField',
                Label: 'Amendment Reason',
                Value: amendmentReason
            },
            {
                $Type: 'UI.DataField',
                Label: 'Airport Code',
                Value: airportCode
            },
            {
                $Type: 'UI.DataField',
                Label: 'Tax Code',
                Value: TaxCodes.taxDescription
            },
            {
                $Type: 'UI.DataField',
                Label: 'Full Routing',
                Value: fullRouting
            },
            {
                $Type: 'UI.DataField',
                Label: 'Journey Covered',
                Value: journeyCovered,
                @UI.Hidden
            },
            // {
            //     $Type: 'UI.DataField',
            //     Label: 'Bill To Name',
            //     Value: billToName,
            // },
            // {
            //     $Type: 'UI.DataField',
            //     Label: 'Bill To Full Address',
            //     Value: billToFullAddress,
            // },
            // {
            //     $Type: 'UI.DataField',
            //     Label: 'Bill To Country',
            //     Value: billToCountry.descr,
            // },
            // {
            //     $Type: 'UI.DataField',
            //     Label: 'Bill To State Code',
            //     Value: billToStateCode,
            // },
            // {
            //     $Type: 'UI.DataField',
            //     Label: 'Bill To Postal Code',
            //     Value: billToPostalCode,
            // },
            {
                $Type: 'UI.DataField',
                Label: 'Invoice Status',
                Value: invoiceStatus,
            },
            // {
            //     $Type: 'UI.DataField',
            //     Label: 'Is Reverse Charge Applicable',
            // Value: isReverseChargeApplicable,
            // },
            {
                $Type: 'UI.DataField',
                Label: 'SBR Received On',
                Value: SBRRecivedOn,
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Label: 'SBR Processed On',
                Value: SBRProcessedOn,
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Label: 'Document Type',
                Value: documentType,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Ticket Type',
                Value: ticketType,
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Label: 'Section Type',
                Value: sectionType,
            },
            {
                $Type: 'UI.DataField',
                Label: 'IATA Number',
                Value: iataNumber,
            },
            {
                $Type: 'UI.DataField',
                Label: 'GSTR1 Period',
                Value: gstR1Period,
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Label: 'GSTR1 Filing Status',
                Value: gstR1filingStatus,
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Label: 'Original Invoice Number',
                Value: originalInvoiceNumber,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Original GSTIN',
                Value: originalGstin,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Original Section Type',
                Value: originalSectionType,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Issue Indicator',
                Value: issueIndicator,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Routing Type',
                Value: routingType,
            },
            {
                $Type: 'UI.DataField',
                Label: 'One-Way Indicator',
                Value: oneWayIndicator,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Direction Indicator',
                Value: directionIndicator,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Place of Supply',
                Value: StateCodes.stateName,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Ticket Number',
                Value: ticketNumber,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Ticket Issue Date',
                Value: ticketIssueDate,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Ticket Class',
                Value: ticketClass,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Transaction Type',
                Value: transactionCode,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Passenger Name',
                Value: passangerName,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Total Journey',
                Value: totalJourney,
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Label: 'Company',
                Value: Company.description,
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Label: 'Orginal Document Number',
                Value: OriginalDocumentNbr,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Orginal Invoice Number',
                Value: originalInvoiceNumber,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Orginal Invoice Date',
                Value: orginalInvoiceDate,
            },
            {
                $Type: 'UI.DataField',
                Label: 'B2B',
                Value: b2b,
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Label: 'E-India',
                Value: eindia,
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Label: 'Exempted Zone',
                Value: exemptedZone,
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Label: 'Inter State',
                Value: intrastate,
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Label: 'Is SEZ',
                Value: IsSEZ,
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Label: 'Is UT',
                Value: isUT,
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Label: 'FOP',
                Value: fop
            },
            {
                $Type: 'UI.DataField',
                Label: 'XONO',
                Value: xoNo,
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Label: 'Agency Memo Code',
                Value: reasonForMemoCode,
            },
        ],
    },
    UI.DataPoint #PNR               : {
        $Type: 'UI.DataPointType',
        Value: PNR,
        Title: 'PNR',
    },

    UI.DataPoint #supplierGSTIN     : {
        $Type: 'UI.DataPointType',
        Value: supplierGSTIN,
        Title: 'Supplier GSTIN',
    },

    UI.DataPoint #passengerGSTIN    : {
        $Type: 'UI.DataPointType',
        Value: passengerGSTIN,
        Title: 'Passenger GSTIN',
    },

    UI.DataPoint #totalInvoiceAmount: {
        $Type: 'UI.DataPointType',
        Value: totalInvoiceAmount,
        Title: 'Invoice Amount',
    },

    UI.DataPoint #netTaxableValue   : {
        $Type: 'UI.DataPointType',
        Value: netTaxableValue,
        Title: 'Taxable Value',
    },

    // UI.DataPoint #totalTax          : {
    //     $Type: 'UI.DataPointType',
    //     Value: totalTax,
    //     Title: 'Total Tax',
    // },

    UI.DataPoint #taxableCalculation: {
        $Type: 'UI.DataPointType',
        Value: taxableCalculation,
        Title: 'Taxable Calculation',
    },

    UI.DataPoint #ticketNumber      : {
        $Type: 'UI.DataPointType',
        Value: ticketNumber,
        Title: 'Ticket Number',
    },


    UI.HeaderFacets                 : [
        {
            $Type : 'UI.ReferenceFacet',
            Target: '@UI.DataPoint#PNR',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Target: '@UI.DataPoint#supplierGSTIN',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Target: '@UI.DataPoint#passengerGSTIN',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Target: '@UI.DataPoint#totalInvoiceAmount',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Target: '@UI.DataPoint#netTaxableValue',
        },
        // {
        //     $Type : 'UI.ReferenceFacet',
        //     Target: '@UI.DataPoint#totalTax',
        // },
        {
            $Type : 'UI.ReferenceFacet',
            Target: '@UI.DataPoint#taxableCalculation',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Target: '@UI.DataPoint#ticketNumber',
        },
    ],
    UI.Facets                       : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : 'Document',
            Target: '@UI.FieldGroup#GeneratedGroup1',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Document Items',
            ID    : 'invoiceItemFacet',
            Target: 'InvoiceItems/@UI.LineItem'
        }
    ]
);

annotate service.InvoiceItems with @UI: {
    HeaderInfo: {
        TypeName      : 'Document Item',
        TypeNamePlural: 'Document Items',
        Title         : {
            $Type: 'UI.DataField',
            Value: invoiceSlNo,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: descOfService
        }
    },
    LineItem  : [
        {
            $Type: 'UI.DataField',
            Value: invoiceSlNo,
            Label: 'Sl No.'
        },
        {
            $Type: 'UI.DataField',
            Value: taxable,
            Label: 'Taxable Amount'
        },
        {
            $Type: 'UI.DataField',
            Value: nonTaxable,
            Label: 'Non-Taxable Amount'
        },
        {
            $Type: 'UI.DataField',
            Value: totalTaxableValue,
            Label: 'Total Taxable Value'
        },
        {
            $Type: 'UI.DataField',
            Value: discount,
            Label: 'Discount Amount'
        },
        {
            $Type: 'UI.DataField',
            Value: netTaxableValue,
            Label: 'Net Taxable Value'
        },
        {
            $Type: 'UI.DataField',
            Value: cgstRate,
            Label: 'CGST Rate'
        },
        {
            $Type: 'UI.DataField',
            Value: cgstAmount,
            Label: 'CGST Amount'
        },
        {
            $Type: 'UI.DataField',
            Value: sgstRate,
            Label: 'SGST Rate'
        },
        {
            $Type: 'UI.DataField',
            Value: sgstAmount,
            Label: 'SGST Amount'
        },
        {
            $Type: 'UI.DataField',
            Value: utgstRate,
            Label: 'UTGST Rate'
        },
        {
            $Type: 'UI.DataField',
            Value: utgstAmount,
            Label: 'UTGST Amount'
        },
        {
            $Type: 'UI.DataField',
            Value: igstRate,
            Label: 'IGST Rate'
        },
        {
            $Type: 'UI.DataField',
            Value: igstAmount,
            Label: 'IGST Amount'
        },
        {
            $Type: 'UI.DataField',
            Value: cess1Rate,
            Label: 'CESS1 Rate'
        },
        {
            $Type: 'UI.DataField',
            Value: cess1Amount,
            Label: 'CESS1 Amount'
        },
        {
            $Type: 'UI.DataField',
            Value: cess2Rate,
            Label: 'CESS2 Rate'
        },
        {
            $Type: 'UI.DataField',
            Value: cess2Amount,
            Label: 'CESS2 Amount'
        },
        {
            $Type: 'UI.DataField',
            Value: collectedCgst,
            Label: 'Collected CGST'
        },
        {
            $Type: 'UI.DataField',
            Value: collectedCgstRate,
            Label: 'Collected CGST Rate'
        },
        {
            $Type: 'UI.DataField',
            Value: collectedIgst,
            Label: 'Collected IGST'
        },
        {
            $Type: 'UI.DataField',
            Value: collectedIgstRate,
            Label: 'Collected IGST Rate'
        },
        {
            $Type: 'UI.DataField',
            Value: collectedSgst,
            Label: 'Collected SGST'
        },
        {
            $Type: 'UI.DataField',
            Value: collectedSgstRate,
            Label: 'Collected SGST Rate'
        },
        {
            $Type: 'UI.DataField',
            Value: collectedutgst,
            Label: 'Collected UTGST'
        },
        {
            $Type: 'UI.DataField',
            Value: collectedUtgstRate,
            Label: 'Collected UTGST Rate'
        },
        {
            $Type: 'UI.DataField',
            Value: collectedInvoiceValue,
            Label: 'Collected Invoice Value'
        },
        {
            $Type: 'UI.DataField',
            Value: descOfService,
            Label: 'Description of Service'
        },
        {
            $Type: 'UI.DataField',
            Value: HSNCode,
            Label: 'HSN Code'
        },
        {
            $Type: 'UI.DataField',
            Value: valueOfService,
            Label: 'Value of Service'
        },
        {
            $Type: 'UI.DataField',
            Value: invoice_company,
            Label: 'Company'
        },
        {
            $Type: 'UI.DataField',
            Value: invoice_ID,
            ![@UI.Hidden]
        }
    ]

};
