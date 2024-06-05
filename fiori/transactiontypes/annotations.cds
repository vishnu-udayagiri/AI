using ScheduleService as service from '../../srv/Master-Service';

annotate service.TransactionTypes with @(
    UI.LineItem       : [
        {
            $Type                : 'UI.DataField',
            Label                : 'Transaction Code',
            Value                : transactionType,
            ![@HTML5.CssDefaults]: {width: '250px'}
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Transaction Text',
            Value                : transactionText,
            ![@HTML5.CssDefaults]: {width: '300px'}
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'HSN',
            Value                : hsn,
            ![@HTML5.CssDefaults]: {width: '250px'}
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'HSN Text',
            Value                : hsnText,
            ![@HTML5.CssDefaults]: {width: '250px'}
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Tax Code',
            Value                : TaxCodes.taxCode,
            ![@HTML5.CssDefaults]: {width: '84px'},
            ![@UI.Hidden]
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Tax Code Description',
            Value                : TaxCodes.taxDescription,
            ![@HTML5.CssDefaults]: {width: '300px'},
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Value: taxCode,
            ![@UI.Hidden]
        },
    ],
    UI.SelectionFields: [transactionType]
);

annotate service.TransactionTypes with {
    taxCode         @Common: {
        Text                    : TaxCodes.taxDescription,
        TextArrangement         : #TextOnly,
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'TaxCodes',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: taxCode,
                    ValueListProperty: 'taxCode'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'taxDescription'
                }
            ]
        },
    };
    transactionType @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'TransactionTypes',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: transactionType,
                    ValueListProperty: 'transactionType'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'transactionText'
                }
            ]
        },
    };
}

annotate service.TransactionTypes with @(
    UI.HeaderInfo                 : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Transaction Code',
        TypeNamePlural: 'Transaction Codes',
        Title         : {
            $Type: 'UI.DataField',
            Value: transactionType,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: transactionText,
        },
    },
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Transaction Code',
                Value: transactionType,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Transaction Text',
                Value: transactionText,
            },
            {
                $Type: 'UI.DataField',
                Label: 'HSN',
                Value: hsn,
            },
            {
                $Type: 'UI.DataField',
                Label: 'HSN Text',
                Value: hsnText,
            },
            {
                $Type                : 'UI.DataField',
                Label                : 'Tax Code',
                Value                : TaxCodes.taxCode,
                ![@HTML5.CssDefaults]: {width: '84px'}
            },
            {
                $Type: 'UI.DataField',
                Label: 'Tax Code Description',
                Value: taxCode,
            },
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'Transaction Type',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
