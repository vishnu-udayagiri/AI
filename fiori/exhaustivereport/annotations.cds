using exhaustiveReport as service from '../../srv/exhaustiveReport-Service';
using from '../../db/schema';

@UI.DeleteHidden: true

annotate service.exhaustiveReport with @(
    UI.LineItem           : [
        {
            $Type: 'UI.DataField',
            Value: TAX_INVOICE_TYPE,
            Label: 'Tax Invoice Type'
        },
        {
            $Type: 'UI.DataField',
            Value: REFERENCE_NUMBER,
            Label: 'Reference number'
        },
        {
            $Type: 'UI.DataField',
            Value: REFERENCE_DATE,
            Label: 'Reference Date'
        },
        {
            $Type: 'UI.DataField',
            Value: DOCUMENT_TYPE,
            Label: 'Document Type',
        },
        {
            $Type: 'UI.DataField',
            Value: ACTIVITY,
            Label: 'Activity',
        },
        {
            $Type: 'UI.DataField',
            Value: DOCUMENT_NUMBER,
            Label: 'Document Number',
        },
        {
            $Type: 'UI.DataField',
            Value: DOCUMENT_DATE,
            Label: 'Document Date',
        },
        {
            $Type: 'UI.DataField',
            Value: HSN_CODE,
            Label: 'HSN Code'
        },
        {
            $Type: 'UI.DataField',
            Value: IATA_OFFICE,
            Label: 'IATA office'
        },
        {
            $Type: 'UI.DataField',
            Value: ORIGINAL_TKT,
            Label: 'Orginal Ticket'
        },
        {
            $Type: 'UI.DataField',
            Value: B2B_B2C,
            Label: 'B2B or B2C'
        },
        {
            $Type: 'UI.DataField',
            Value: GSTIN_NO,
            Label: 'GSTIN No.'
        },
        {
            $Type: 'UI.DataField',
            Value: PAX_NAME,
            Label: 'Pax Name'
        },
        {
            $Type: 'UI.DataField',
            Value: SECTOR_JOURNEY,
            Label: 'Sector Journey'
        },
        {
            $Type: 'UI.DataField',
            Label: 'International or Domestic',
            Value: INTERNATIONAL_DOMESTIC,
        },
        {
            $Type: 'UI.DataField',
            Value: APPLICABLE_CLASS_OF_TRAVEL,
            Label: 'Applicable Class Of Travel'
        },
        {
            $Type: 'UI.DataField',
            Value: PLACE_OF_EMBARKATION,
            Label: 'Place Of Embarkation'
        },
        {
            $Type: 'UI.DataField',
            Value: PLACE_OF_DISEMBARKATION,
            Label: 'Place Of Disembarkation'
        },
        {
            $Type: 'UI.DataField',
            Value: FOP_DTLS,
            Label: 'FOP Dtls'
        },
        {
            $Type: 'UI.DataField',
            Label: 'GSTR1 Period',
            Value: gstR1Period
        },
        {
            $Type: 'UI.DataField',
            Label: 'GSTR1 Filing Status',
            Value: gstR1filingStatus
        },

        {
            $Type: 'UI.DataField',
            Value: PAN_NO,
            Label: 'PAN'
        },
        {
            $Type: 'UI.DataField',
            Value: TRANSACTION_TYPE,
            Label: 'Transaction Code'
        },
        {
            $Type: 'UI.DataField',
            Value: issueIndicator,
            Label: 'Issue Indicator'
        },

        {
            $Type: 'UI.DataField',
            Value: BASE_FARE,
            Label: 'Base Fare'
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 1',
            Value: TAX_1
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 1',
            Value: TAX_AMOUNT_1
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 2',
            Value: TAX_2
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 2',
            Value: TAX_AMOUNT_2
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 3',
            Value: TAX_3
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 3',
            Value: TAX_AMOUNT_3
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 4',
            Value: TAX_4
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 4',
            Value: TAX_AMOUNT_4
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 5',
            Value: TAX_5
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 5',
            Value: TAX_AMOUNT_5
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 6',
            Value: TAX_6
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 6',
            Value: TAX_AMOUNT_6
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 7',
            Value: TAX_7
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 7',
            Value: TAX_AMOUNT_7
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 8',
            Value: TAX_8
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 8',
            Value: TAX_AMOUNT_8
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 9',
            Value: TAX_9
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 9',
            Value: TAX_AMOUNT_9
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 10',
            Value: TAX_10
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 10',
            Value: TAX_AMOUNT_10
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 11',
            Value: TAX_11
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 11',
            Value: TAX_AMOUNT_11
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 12',
            Value: TAX_12
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 12',
            Value: TAX_AMOUNT_12
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 13',
            Value: TAX_13
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 13',
            Value: TAX_AMOUNT_13
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 14',
            Value: TAX_14
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 14',
            Value: TAX_AMOUNT_14
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 15',
            Value: TAX_15
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 15',
            Value: TAX_AMOUNT_15
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 16',
            Value: TAX_16
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 16',
            Value: TAX_AMOUNT_16
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 17',
            Value: TAX_17
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 17',
            Value: TAX_AMOUNT_17
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 18',
            Value: TAX_18
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 18',
            Value: TAX_AMOUNT_18
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 19',
            Value: TAX_19
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 19',
            Value: TAX_AMOUNT_19
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 20',
            Value: TAX_20
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Amount 20',
            Value: TAX_AMOUNT_20
        },
        {
            $Type: 'UI.DataField',
            Label: 'Total Fare',
            Value: TOTAL_FARE
        },
        {
            $Type: 'UI.DataField',
            Label: 'Total Taxable Value',
            Value: TOTAL_TAXABLE_VALUE
        },
        {
            $Type: 'UI.DataField',
            Label: 'Discount',
            Value: DISCOUNT
        },
        {
            $Type: 'UI.DataField',
            Label: 'Net Taxable Value',
            Value: NET_TAXABLE_VALUE
        },
        {
            $Type: 'UI.DataField',
            Value: CGST_AMOUNT,
            Label: 'CGST Amount'
        },
        {
            $Type: 'UI.DataField',
            Value: CGST_RATE,
            Label: 'CGST Rate'
        },
        {
            $Type: 'UI.DataField',
            Value: SGST_AMOUNT,
            Label: 'SGST Amount'
        },
        {
            $Type: 'UI.DataField',
            Value: SGST_RATE,
            Label: 'SGST Rate'
        },
        {
            $Type: 'UI.DataField',
            Value: UTGST_AMOUNT,
            Label: 'UGST Amount'
        },
        {
            $Type: 'UI.DataField',
            Value: UTGST_RATE,
            Label: 'UGST Rate'
        },
        {
            $Type: 'UI.DataField',
            Value: IGST_AMOUNT,
            Label: 'IGST Amount'
        },
        {
            $Type: 'UI.DataField',
            Value: IGST_RATE,
            Label: 'IGST Rate'
        },
        {
            $Type: 'UI.DataField',
            Label: 'GST Value',
            Value: GST_VALUE
        },
        {
            $Type: 'UI.DataField',
            Label: 'AI GSTIN No',
            Value: AI_GSTIN_NO
        },
        {
            $Type: 'UI.DataField',
            Label: 'Place of Supply',
            Value: PLACE_OF_SUPPLY
        },
        {
            $Type: 'UI.DataField',
            Label: 'Liability Discharge State',
            Value: LIABILITY_DISCHARGE_STATE
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund Sector',
            Value: REFUND_SECTOR
        },
        {
            $Type: 'UI.DataField',
            Label: 'CP Charges',
            Value: CP_CHARGES
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund CGST Amount',
            Value: REFUND_CGST_AMOUNT
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund CGST Rate',
            Value: REFUND_CGST_RATE
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund SGST Amount',
            Value: REFUND_SGST_AMOUNT
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund SGST Rate',
            Value: REFUND_SGST_RATE
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund UTGST Amount',
            Value: REFUND_UTGST_AMOUNT
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund UTGST Rate',
            Value: REFUND_UTGST_RATE
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund IGST Amount',
            Value: REFUND_IGST_AMOUNT
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund IGST Rate',
            Value: REFUND_IGST_RATE
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund GST Amount',
            Value: REFUND_GST_AMT
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue Sector',
            Value: REISSUE_SECTOR
        },
        {
            $Type: 'UI.DataField',
            Label: 'XP OD Charges',
            Value: XP_OD_CHARGES
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue CGST Amount',
            Value: REISSUE_CGST_AMOUNT
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue CGST Rate',
            Value: REISSUE_CGST_RATE
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue SGST Amount',
            Value: REISSUE_SGST_AMOUNT
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue SGST Rate',
            Value: REISSUE_SGST_RATE
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue UTGST Amount',
            Value: REISSUE_UTGST_AMOUNT
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue UTGST Rate',
            Value: REISSUE_UTGST_RATE
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue IGST Amount',
            Value: REISSUE_IGST_AMOUNT
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue IGST Rate',
            Value: REISSUE_IGST_RATE
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue GST Amount',
            Value: REISSUE_GST_AMT
        },
        {
            $Type: 'UI.DataField',
            Label: 'Address of the Corporate',
            Value: ADDRESS_OF_THE_CORPORATE
        },
        {
            $Type: 'UI.DataField',
            Label: 'Email of the Corporate',
            Value: EMAIL_ID_OF_CORPORATE
        },
        {
            $Type: 'UI.DataField',
            Label: 'Contact number of the Corporate',
            Value: CONTACT_NO_OF_CORPORATE
        },
        {
            $Type: 'UI.DataField',
            Label: 'State Code',
            Value: STATE_CODE
        },
        {
            $Type: 'UI.DataField',
            Label: 'State',
            Value: STATE
        },
        {
            $Type: 'UI.DataField',
            Label: 'Excess Baggage - Weight/PCS',
            Value: EXCESS_BAGGAGE_WEIGHT
        },
        {
            $Type: 'UI.DataField',
            Label: 'Excess Baggage - Rate',
            Value: EXCESS_BAGGAGE_RATE
        },
        {
            $Type: 'UI.DataField',
            Label: 'XO N0 in case of GOI',
            Value: XO_N0_IN_CASE_OF_GOI
        },
        {
            $Type: 'UI.DataField',
            Label: 'Endorsement Detail',
            Value: ENDORSEMENT_DTLS
        },

    ],
    UI.SelectionFields    : [
        gstR1Period,
        TAX_INVOICE_TYPE,
        REFERENCE_NUMBER,
        REFERENCE_DATE,
        ORIGINAL_TKT,
        B2B_B2C,
        GSTIN_NO,
        AI_GSTIN_NO,
        IATA_OFFICE,
        DOCUMENT_DATE,
        DOCUMENT_TYPE,
        HSN_CODE,
        INTERNATIONAL_DOMESTIC,
        APPLICABLE_CLASS_OF_TRAVEL
    ],
    UI.PresentationVariant: {
        SortOrder     : [{
            Property  : REFERENCE_NUMBER,
            Descending: true,
            $Type     : 'Common.SortOrderType'
        }, ],
        Visualizations: ['@UI.LineItem'],
    }
);

annotate service.exhaustiveReport with {

    TAX_INVOICE_TYPE
    @(
        title                          : 'Tax Invoice Type',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListTaxInvoiceType',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: 'TAX_INVOICE_TYPE',
                    ValueListProperty: 'TAX_INVOICE_TYPE'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'description'
                }
            ]
        }
    );
    REFERENCE_NUMBER
    @(
        title                          : 'Reference Number',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListReferenceNumber',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'REFERENCE_NUMBER',
                ValueListProperty: 'REFERENCE_NUMBER'
            }]
        }
    );
    REFERENCE_DATE
    @(title: 'Reference Date');
    DOCUMENT_DATE
    @(title: 'Document Date');
    ORIGINAL_TKT
    @(
        title                          : 'Original Ticket',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListOrginalTicket',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'ORIGINAL_TKT',
                ValueListProperty: 'ORIGINAL_TKT'
            }]
        }
    );
    B2B_B2C
    @(
        title                          : 'B2B or B2C',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListB2BORB2C',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'B2B_B2C',
                ValueListProperty: 'B2B_B2C'
            }]
        }
    );
    GSTIN_NO
    @(
        title                          : 'GSTIN No.',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListGSTIN',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'GSTIN_NO',
                ValueListProperty: 'GSTIN_NO'
            }]
        }
    );
    AI_GSTIN_NO
    @(
        title                          : 'AI GSTIN No.',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListSupplierGSTIN',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'AI_GSTIN_NO',
                ValueListProperty: 'AI_GSTIN_NO'
            }]
        }
    );
    IATA_OFFICE
    @(
        title                          : 'IATA Office',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListIATAOffice',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'IATA_OFFICE',
                ValueListProperty: 'IATA_OFFICE'
            }]
        }
    );
    DOCUMENT_TYPE
    @(
        title                          : 'Document Type',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListDocumentType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'DOCUMENT_TYPE',
                ValueListProperty: 'DOCUMENT_TYPE'
            }]
        }
    );
    DOCUMENT_NUMBER
    @(
        title                          : 'Document Number',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListDocumentNumber',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'DOCUMENT_NUMBER',
                ValueListProperty: 'DOCUMENT_NUMBER'
            }]
        }
    );
    PAX_NAME
    @(
        title                          : 'Pax Name',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListPassengerName',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'PAX_NAME',
                ValueListProperty: 'PAX_NAME'
            }]
        }
    );
    INTERNATIONAL_DOMESTIC
    @(
        title                          : 'International or Domestic',
        Common.ValueListWithFixedValues: true,
        Common.ValueList               : {
            CollectionPath: 'valueListRoutingType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'INTERNATIONAL_DOMESTIC',
                ValueListProperty: 'description'
            }]
        }
    );
    HSN_CODE
    @(
        title                          : 'HSN Code',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListHSNcode',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'HSN_CODE',
                ValueListProperty: 'HSNCode'
            }]
        }
    );
    APPLICABLE_CLASS_OF_TRAVEL
    @(
        title                          : 'Applicable Class Of Travel',
        Common.ValueListWithFixedValues: true,
        Common.ValueList               : {
            CollectionPath: 'valueListTicketClass',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'APPLICABLE_CLASS_OF_TRAVEL',
                ValueListProperty: 'ticketClass'
            }]
        }
    );

    gstR1Period
    @(
        title                          : 'GSTR1 Period',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListgstR1Period',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'gstR1Period',
                ValueListProperty: 'gstR1Period'
            }]
        }
    );
}

annotate service.exhaustiveReport with @(UI.HeaderInfo: {
    $Type         : 'UI.HeaderInfoType',
    TypeName      : 'Exhaustive Report',
    TypeNamePlural: 'Exhaustive Report',
    Title         : {
        $Type: 'UI.DataField',
        Value: REFERENCE_NUMBER
    },
    Description   : {
        $Type: 'UI.DataField',
        Value: REFERENCE_DATE
    }
}, );
