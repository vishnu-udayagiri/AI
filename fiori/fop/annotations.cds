using ScheduleService as service from '../../srv/Master-Service';

annotate service.FOP with @(
    UI.LineItem       : [
        {
            $Type                 : 'UI.DataField',
            Label                 : 'FOP',
            Value                 : FOP,
            ![@HTML5.CssDefaults] : {width: '115px'}
        },
        {
            $Type                 : 'UI.DataField',
            Label                 : 'Description',
            Value                 : FOPDescription,
            ![@HTML5.CssDefaults] : {width: '1057px'}
        },
        {
            $Type                 : 'UI.DataField',
            Label                 : 'GST Applicable',
            Value                 : isGSTApplicable,
            ![@HTML5.CssDefaults] : {width: '167px'}
        },
    ],
    UI.SelectionFields: [FOP]
);

annotate service.FOP with {
    FOP @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'FOP',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: FOP,
                    ValueListProperty: 'FOP'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'FOPDescription'
                }
            ]
        }
    };
}

annotate service.FOP with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'FOP',
                Value: FOP,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Description',
                Value: FOPDescription,
            },
            {
                $Type: 'UI.DataField',
                Label: 'GST Applicable',
                Value: isGSTApplicable,
            },
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'General Information',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
