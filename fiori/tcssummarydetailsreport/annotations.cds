using tcsSummaryDetailsService as service from '../../srv/tcsSummaryDetails-Service';

@UI.DeleteHidden: true
annotate service.tcsSummaryDetails with @(
    UI.LineItem       : [

        {
            $Type: 'UI.DataField',
            Value: TICKETNUMBER,
        },
        {
            $Type: 'UI.DataField',
            Value: TRANSACTIONTYPE,
            Label: 'SALE/REFUND'
        },
        {
            $Type: 'UI.DataField',
            Value: INVOICEDATE,

        },
        {
            $Type: 'UI.DataField',
            Value: IATANUMBER,
        },
        {
            $Type: 'UI.DataField',
            Value: OTA_GSTIN,
        },
        {
            $Type: 'UI.DataField',
            Value: ORGINALINVOICEDATE,
        },
        {
            $Type: 'UI.DataField',
            Value: PS_STATENAME,
            Label: 'Place of Supply'
        },
        {
            $Type: 'UI.DataField',
            Value: DOCUMENTTYPE,
        },

        {
            $Type: 'UI.DataField',
            Value: STATE_OF_DEPOSIT,
        },
        {
            $Type: 'UI.DataField',
            Value: TAXABLE,
        },
        {
            $Type: 'UI.DataField',
            Value: NONTAXABLE,
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_K3,
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_PERC_GST_VALUE,
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_CGST,
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_SGST,
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_UTGST,
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_IGST,
        },
        {
            $Type: 'UI.DataField',
            Value: TOTAL_TICKET_VALUE,
        },
        {
            $Type: 'UI.DataField',
            Value: REMARKS,
        },
        {
            $Type: 'UI.DataField',
            Value: USERID,
        },
    ],
    UI.SelectionFields: [
        TICKETNUMBER,
        INVOICEDATE,
        IATANUMBER,
        TRANSACTIONTYPE,
        DOCUMENTTYPE
    ]
);

annotate service.tcsSummaryDetails with @(UI.HeaderInfo: {
    $Type         : 'UI.HeaderInfoType',
    TypeName      : 'TCS Summary Details',
    TypeNamePlural: 'TCS Summary Details',
    Title         : {
        $Type: 'UI.DataField',
        Value: TICKETNUMBER,
    },
    Description   : {
        $Type: 'UI.DataField',
        Value: TICKETNUMBER,
    }

}

);

annotate service.tcsSummaryDetails with {

    TICKETNUMBER
    @(
        title                          : 'Ticket Number',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListTicketNumber',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'TICKETNUMBER',
                ValueListProperty: 'TICKETNUMBER'
            }]
        }
    );
    TRANSACTIONTYPE
    @(
        title                          : 'Transaction Type',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListTransactionType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'TRANSACTIONTYPE',
                ValueListProperty: 'TRANSACTIONTYPE'
            }]
        }
    );
    DOCUMENTTYPE
    @(
        title                          : 'Document Type',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListDocumentType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'DOCUMENTTYPE',
                ValueListProperty: 'DOCUMENTTYPE'
            }]
        }
    );
    IATANUMBER
    @(
        title                          : 'IATA Number',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListIATANumber',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'IATANUMBER',
                ValueListProperty: 'IATANUMBER'
            }]
        }
    );
}
