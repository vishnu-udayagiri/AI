using Reports as service from '../../srv/reports-Service';

@UI.DeleteHidden: true

annotate service.DiscrepancyReport with @UI: {
    LineItem           : [
        {
            $Type: 'UI.DataField',
            Value: AIRLINE_CODE,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Value: PNR,
        // },
        {
            $Type: 'UI.DataField',
            Value: MAIN_TICKET_NUMBER,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Value: INVOICENUMBER,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Value: DISCREPANCYCODE,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Value: DESCRIPTION,
        // },
        {
            $Type: 'UI.DataField',
            Value: IATANUMBER,
        },
        {
            $Type: 'UI.DataField',
            Value: B2B_B2C_INDICATOR,
        },
        {
            $Type: 'UI.DataField',
            Value: DATE_OF_ISSUE,
        },
        {
            $Type: 'UI.DataField',
            Value: ROUTING,
        },
        {
            $Type: 'UI.DataField',
            Value: TRANSACTION_CODE,
        },
        {
            $Type: 'UI.DataField',
            Value: TRANSACTION_TYPE,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Value: ISSUE_TYPE,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Value: DOCUMENT_TYPE,
        // },
        {
            $Type: 'UI.DataField',
            Value: RATE_OF_EXCHANGE,
        },
        {
            $Type: 'UI.DataField',
            Value: RATE_OF_EXCHANGE_CURR,
        },
        {
            $Type: 'UI.DataField',
            Value: TAXABLE_AMOUNT,
        },
        {
            $Type: 'UI.DataField',
            Value: BASIC_FARE,
        },
        {
            $Type: 'UI.DataField',
            Value: APPLICABLE_TAX_FEES_AMOUNT,
        },
        {
            $Type: 'UI.DataField',
            Value: OTHER_TAX_AMOUNT,
        },
        {
            $Type: 'UI.DataField',
            Value: GST_RATE_CALCULATED,
        },
        {
            $Type: 'UI.DataField',
            Value: GST_RATE_COLLECTED,
        },
        {
            $Type: 'UI.DataField',
            Value: SGST_AMOUNT,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Value: SGST_RATE,
        // },
        {
            $Type: 'UI.DataField',
            Value: CGST_AMOUNT,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Value: CGST_RATE,
        // },
        {
            $Type: 'UI.DataField',
            Value: IGST_AMOUNT,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Value: IGST_RATE,
        // },
        {
            $Type: 'UI.DataField',
            Value: UTGST_AMOUNT,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Value: UTGST_RATE,
        // },
        {
            $Type: 'UI.DataField',
            Value: GST_COLLECTED,
        },
        {
            $Type: 'UI.DataField',
            Value: GST_DERIVED,
        },
        {
            $Type: 'UI.DataField',
            Value: GST_DIFFERENCE,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Value: COLLECTED_INVOICEAMOUNT,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Value: CALCULATED_INVOICEAMOUNT,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Value: DIFFERENCE_INVOICEAMOUNT,
        // },
    ],
    HeaderInfo         : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Discrepancy Report',
        TypeNamePlural: 'Discrepancy Report',
        Title         : {
            $Type: 'UI.DataField',
            Value: MAIN_TICKET_NUMBER,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: GST_DIFFERENCE,
        }
    },
    SelectionFields    : [
        MAIN_TICKET_NUMBER,
        B2B_B2C_INDICATOR,
        INVOICENUMBER,
        IATANUMBER,
        TRANSACTION_CODE,
        DOCUMENT_TYPE,
        ISSUE_TYPE
    ],
    PresentationVariant: {
        SortOrder     : [{
            Property  : MAIN_TICKET_NUMBER,
            Descending: true,
            $Type     : 'Common.SortOrderType'
        }, ],
        Visualizations: ['@UI.LineItem'],
    }
};

annotate service.DiscrepancyReport with {

    MAIN_TICKET_NUMBER
    @(
        title                          : 'Ticket Number',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListTicketNumber',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'MAIN_TICKET_NUMBER',
                ValueListProperty: 'MAIN_TICKET_NUMBER'
            }]
        }
    );
    B2B_B2C_INDICATOR
    @(
        title                          : 'B2B or B2C Indicator',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListSectionType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'B2B_B2C_INDICATOR',
                ValueListProperty: 'B2B_B2C_INDICATOR'
            }]
        }
    );
    IATANUMBER
    @(
        title                          : 'Agent Code',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListIataNumber',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: 'IATANUMBER',
                    ValueListProperty: 'IATANUMBER'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'legalName',
                },
            ]
        }
    );
    TRANSACTION_CODE
    @(
        title                          : 'Transaction Code',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListTransactionType',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: 'TRANSACTION_CODE',
                    ValueListProperty: 'TRANSACTION_CODE'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'transactionText',
                },
            ]
        }
    );
    DOCUMENT_TYPE
    @(
        title                          : 'Document Type',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListDocumentType',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: 'DOCUMENT_TYPE',
                    ValueListProperty: 'DOCUMENT_TYPE'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'description',
                },
            ]
        }
    );
    ISSUE_TYPE
    @(
        title                          : 'Issue Type',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListIssueIndicator',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'ISSUE_TYPE',
                ValueListProperty: 'ISSUE_TYPE'
            }]
        }
    );
    INVOICENUMBER
    @(
        title                          : 'Invoice Number',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListInvoiceNumber',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'INVOICENUMBER',
                ValueListProperty: 'INVOICENUMBER'
            }]
        }
    );
    DISCREPANCYCODE
    @(
        title                          : 'Discrepancy Code',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListDiscrepancyCode',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: 'DISCREPANCYCODE',
                    ValueListProperty: 'DISCREPANCYCODE'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'Description',
                },
            ]
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
    TRANSACTION_TYPE
    @(
        title                          : 'Transaction Type',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListTransactionCode',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'TRANSACTION_TYPE',
                ValueListProperty: 'TRANSACTION_TYPE'
            }]
        }
    );


}
