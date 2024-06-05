using areaSummaryService as service from '../../srv/areaSummary-Service';

@UI.DeleteHidden
annotate service.AREASUMMARY with @(
    UI.LineItem       : [
        {
            $Type                : 'UI.DataField',
            Value                : IATANUMBER,
            Label                : 'IATA number of Agent',
            ![@HTML5.CssDefaults]: {width: '165.2px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : STATION,
            Label                : 'Station',
            ![@HTML5.CssDefaults]: {width: '143px'}
        },
        {
            $Type: 'UI.DataField',
            Value: REGION,
            Label: 'Region'
        },
        {
            $Type: 'UI.DataField',
            Value: TICKETNUMBER,
            Label: 'Ticket Number'
        },
        {
            $Type: 'UI.DataField',
            Value: TRANSACTIONTYPE,
            Label: 'Transaction Type'
            // Label: 'Sale/Refund'
        },
        {
            $Type: 'UI.DataField',
            Value: TICKETISSUEDATE,
            Label: 'Date of Issue/Refund'
        },
        {
            $Type: 'UI.DataField',
            Value: TCSGSTIN,
            Label: 'Passenger GSTIN'
        },
        {
            $Type                : 'UI.DataField',
            Value                : K3TAX,
            Label                : 'K3 Tax',
            ![@HTML5.CssDefaults]: {width: '131px'}
        },
        // {
        //     $Type: 'UI.DataField',
        //     Value: TICKETISSUEDATE,
        //     Label: 'Date of Original Issue refund'
        // },
        {
            $Type                : 'UI.DataField',
            Value                : PS_STATENAME,
            Label                : 'Place of Supply',
            ![@HTML5.CssDefaults]: {width: '134px'}
        },
        {
            $Type: 'UI.DataField',
            Value: SUPPLIERGSTIN,
            Label: 'Supplier GSTN'
        //Label: 'Airline GSTN'
        },
        {
            $Type                : 'UI.DataField',
            Value                : STATEOFDEPOSITEOF_STATENAME,
            Label                : 'State of Deposit of GST',
            ![@HTML5.CssDefaults]: {width: '172px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : DOCUMENTTYPE,
            Label                : 'Document Type',
            // Label                : 'Tax Invoice or CR/DR',
            ![@HTML5.CssDefaults]: {width: '155px'}
        },
        {
            $Type: 'UI.DataField',
            Value: INVOICE_MONTH,
            Label: 'Invoice Month'
        },
        {
            $Type: 'UI.DataField',
            Value: TAXABLE,
            Label: 'Taxable Value'
        },
        {
            $Type: 'UI.DataField',
            Value: NONTAXABLE,
            Label: 'Non-Taxable Value'
        },
        {
            $Type: 'UI.DataField',
            Value: TOTALINVOICEAMOUNT,
            Label: 'Total Ticket Value'
        },
        {
            $Type: 'UI.DataField',
            Value: TCSGSTVALUE,
            Label: 'TCS GST Value'
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_CGST,
            Label: 'TCS-CGST'
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_SGST_SGST,
            Label: 'TCS-SGST'
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_SGST_UGST,
            Label: 'TCS-UGST'
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_IGST,
            Label: 'TCS-IGST'
        }
    ],
    UI.SelectionFields: [
        IATANUMBER,
        SUPPLIERGSTIN,
        DOCUMENTTYPE,
        PS_STATENAME,
        TRANSACTIONTYPE,
        TICKETISSUEDATE,
        TICKETNUMBER
    ]
);

annotate service.AREASUMMARY with {
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
        title                   : 'Sale/Refund',
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
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: SUPPLIERGSTIN,
                ValueListProperty: 'SUPPLIERGSTIN'
            }]
        }
    };

    DOCUMENTTYPE    @Common: {
        ValueListWithFixedValues: false,
        title                   : 'Document Type',
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListDocumentType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: DOCUMENTTYPE,
                ValueListProperty: 'DOCUMENTTYPE'
            }]
        }
    }  @title: 'Document Type';

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

    REGION          @Common: {
        ValueListWithFixedValues: false,
        title                   : 'Region',
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListRegion',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: REGION,
                ValueListProperty: 'REGION'
            }]
        }
    };

    TCSGSTIN        @Common: {
        ValueListWithFixedValues: false,
        title                   : 'GSTN of OTA',
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListTCSGSTIN',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: TCSGSTIN,
                ValueListProperty: 'TCSGSTIN'
            }]
        }
    }  @title: 'GSTN of OTA';
}

annotate service.AREASUMMARY with @(UI.HeaderInfo: {
    $Type         : 'UI.HeaderInfoType',
    TypeName      : 'Area Summary Report',
    TypeNamePlural: 'Area Summary Report'
});
