using ScheduleService as service from '../../srv/Master-Service';

annotate service.TaxCodes with @(
    UI.LineItem       : [
        {
            $Type                 : 'UI.DataField',
            Label                 : 'Company',
            Value                 : company,
            ![@HTML5.CssDefaults] : {width: '220px'}

        },
        {
            $Type                 : 'UI.DataField',
            Label                 : 'Tax Code',
            Value                 : taxCode,
            ![@HTML5.CssDefaults] : {width: '220px'}
        },
        {
            $Type                 : 'UI.DataField',
            Label                 : 'Description',
            Value                 : taxDescription,
            ![@HTML5.CssDefaults] : {width: '900px'}

        },
        {
            $Type: 'UI.DataField',
            Value: company,
            ![@UI.Hidden]
        },
    ],
    UI.SelectionFields: [taxCode]
);

annotate service.TaxCodes with {
    company @Common: {
        Text                    : Company.description,
        TextArrangement         : #TextOnly,
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Company',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: company,
                    ValueListProperty: 'code'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'description'
                }
            ]
        },
    };
    taxCode @Common: {
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
}

annotate service.TaxCodes with @(
    UI.HeaderInfo                 : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Tax Code',
        TypeNamePlural: 'Tax Codes',
        Title         : {
            $Type: 'UI.DataField',
            Value: taxCode,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: taxDescription,
        },
    },
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Company',
                Value: company,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Tax Code',
                Value: taxCode,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Tax Description',
                Value: taxDescription,
            },
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'Tax Code',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ],
);
