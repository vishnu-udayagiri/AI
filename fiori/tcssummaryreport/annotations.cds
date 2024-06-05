using tcsSummaryService as service from '../../srv/tcsSummary-Service';

@UI.DeleteHidden
annotate service.TCSSUMMARY with @(
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: TICKETNUMBER,
            Label: 'Ticket Number'
        },
        {
            $Type: 'UI.DataField',
            Value: TRANSACTIONTYPE,
            Label: 'Transaction Type'
        },
        {
            $Type: 'UI.DataField',
            Value: TICKETISSUEDATE,
            Label: 'Ticket Issue Date'
        },
        {
            $Type: 'UI.DataField',
            Value: IATANUMBER,
            Label: 'IATA Number'
        },
        {
            $Type: 'UI.DataField',
            Value: TCSGSTIN,
            Label: 'Passenger GSTIN'
        },
        {
            $Type                : 'UI.DataField',
            Value                : PS_STATENAME,
            Label                : 'Place of Supply',
            ![@HTML5.CssDefaults]: {width: '155px'}

        },
        {
            $Type: 'UI.DataField',
            Value: SUPPLIERGSTIN,
            Label: 'Supplier GSTIN'
        },
        {
            $Type                : 'UI.DataField',
            Value                : STATEOFDEPOSITEOF_STATENAME,
            Label                : 'State of Deposit',
            ![@HTML5.CssDefaults]: {width: '155px'}
        },
        {
            $Type: 'UI.DataField',
            Value: TAXABLE,
            Label: 'Taxable Value'
        },
        {
            $Type: 'UI.DataField',
            Value: NONTAXABLE,
            Label: 'Non Taxable Value'
        },
        {
            $Type: 'UI.DataField',
            Value: K3TAX,
            Label: 'K3 Tax'
        },
        {
            $Type: 'UI.DataField',
            Value: TCSGSTVALUE,
            Label: 'TCS GST Value'
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_CGST,
            Label: 'TCS CGST'
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_IGST,
            Label: 'TCS IGST'
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_SGST_UGST,
            Label: 'TCS UTGST'
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_SGST_SGST,
            Label: 'TCS SGST'
        },
        {
            $Type: 'UI.DataField',
            Value: TOTALINVOICEAMOUNT,
            Label: 'Total Ticket Value'
        }
    ],
    UI.SelectionFields: [
        TICKETNUMBER,
        TRANSACTIONTYPE,
        TICKETISSUEDATE,
        IATANUMBER,
        TCSGSTIN,
        PS_STATENAME,
        SUPPLIERGSTIN
    ],
    UI.HeaderInfo     : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'TCS Summary Report',
        TypeNamePlural: 'TCS Summary Report'
    }
);

annotate service.TCSSUMMARY with {
    TICKETNUMBER    @Common: {
        title                   : 'Ticket Number',
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListTicketNumber',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: TICKETNUMBER,
                ValueListProperty: 'TICKETNUMBER'
            }]
        }
    };

    TRANSACTIONTYPE @Common: {
        title                   : 'Transaction Type',
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListTransactionType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: TRANSACTIONTYPE,
                ValueListProperty: 'TRANSACTIONTYPE'
            }]
        }
    };

    PS_STATENAME    @Common: {
        title                   : 'Place of Supply',
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListPlaceOfSupply',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: PS_STATENAME,
                ValueListProperty: 'PS_STATENAME'
            }]
        }
    };

    SUPPLIERGSTIN   @Common: {
        title                   : 'Airline GSTIN',
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListSupplierGSTIN',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: SUPPLIERGSTIN,
                    ValueListProperty: 'SUPPLIERGSTIN'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'stateName'
                }
            ]
        }
    };

    IATANUMBER      @Common: {
        ValueListWithFixedValues: false,
        title                   : 'IATA Number',
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListIATANumber',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: IATANUMBER,
                    ValueListProperty: 'IATANUMBER'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'LEGALNAME'
                }
            ]
        }
    };

    TCSGSTIN        @Common: {
        ValueListWithFixedValues: false,
        title                   : 'Passenger GSTIN',
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListTCSGSTIN',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: TCSGSTIN,
                ValueListProperty: 'TCSGSTIN'
            }]
        }
    }
                    @title : 'Passenger GSTIN'
}
