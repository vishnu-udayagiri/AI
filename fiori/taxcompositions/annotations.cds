using ScheduleService as service from '../../srv/Master-Service';

annotate service.TaxCompositions with @(
    UI.LineItem       : [
        {
            $Type                 : 'UI.DataField',
            Value                 : taxType,
            Label                 : 'Tax Type',
            ![@HTML5.CssDefaults] : {width: '50%'}
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : taxText,
            Label                 : 'Tax Text',
            ![@HTML5.CssDefaults] : {width: '50%'}
        },
    ],
    UI.SelectionFields: [taxType]
);

annotate service.TaxCompositions with {
    taxType @Common: {
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
}

annotate service.TaxCompositions with @(
    UI.HeaderInfo                 : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Tax Composition',
        TypeNamePlural: 'Tax Compositions',
        Title         : {
            $Type: 'UI.DataField',
            Value: taxType,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: taxText,
        },
    },
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: taxType,
                Label: 'Tax Type'
            },
            {
                $Type: 'UI.DataField',
                Value: taxText,
                Label: 'Tax Text'
            },
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'Tax Compositions',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
