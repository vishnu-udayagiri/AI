using ScheduleService as service from '../../srv/Master-Service';

annotate service.TaxRates with @(
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: TaxCompositions.taxType
        },
        {
            $Type                : 'UI.DataField',
            Value                : TaxCodes.taxCode,
            ![@HTML5.CssDefaults]: {width: '82px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : TaxCodes.taxDescription,
            ![@HTML5.CssDefaults]: {width: '286px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : validFrom,
            ![@HTML5.CssDefaults]: {width: '248px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : validTo,
            ![@HTML5.CssDefaults]: {width: '204px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : rate,
            ![@HTML5.CssDefaults]: {width: '204px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : taxBase,
            ![@HTML5.CssDefaults]: {width: '244px'},
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Value: taxCode,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Value: taxType,
            ![@UI.Hidden]
        }
    ],
    UI.SelectionFields: [
        taxCode,
        taxType
    ]
);

annotate service.TaxRates with {
    taxCode @Common: {
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

    taxType @Common: {
        Text                    : TaxCompositions.taxText,
        TextArrangement         : #TextOnly,
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'TaxCompositions',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: taxType,
                    ValueListProperty: 'taxType'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'taxText'
                }
            ]
        },
    };
};

annotate service.TaxRates with @(
    UI.HeaderInfo                 : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Tax Rate',
        TypeNamePlural: 'Tax Rates',
        Title         : {
            $Type: 'UI.DataField',
            Value: TaxCodes.taxDescription,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: validFrom,
        },
    },
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: TaxCodes.taxCode,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Tax Code Description',
                Value: taxCode,
            },
            {
                $Type: 'UI.DataField',
                Value: taxType,
            },
            {
                $Type: 'UI.DataField',
                Value: validFrom,
            },
            {
                $Type: 'UI.DataField',
                Value: validTo,
            },
            {
                $Type: 'UI.DataField',
                Value: rate,
            },
            {
                $Type: 'UI.DataField',
                Value: taxBase,
                ![@UI.Hidden]
            },
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'Tax Rate',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
