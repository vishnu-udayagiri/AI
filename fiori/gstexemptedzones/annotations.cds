using ScheduleService as service from '../../srv/Master-Service';

annotate service.GstExemptedZones with @(UI.LineItem: [
    {
        $Type                : 'UI.DataField',
        Value                : stateCode,
        ![@HTML5.CssDefaults]: {width: '260px'}
    },
    {
        $Type                : 'UI.DataField',
        Value                : GstExemptedZone,
        ![@HTML5.CssDefaults]: {width: '157px'}
    },
    {
        $Type                : 'UI.DataField',
        Value                : ValidFrom,
        ![@HTML5.CssDefaults]: {width: '450px'}
    },
    {
        $Type                : 'UI.DataField',
        Value                : ValidTo,
        ![@HTML5.CssDefaults]: {width: '480px'}
    },
]);

annotate service.GstExemptedZones with {
    stateCode @Common: {
        Text                    : StateCodes.stateName,
        TextArrangement         : #TextOnly,
        ValueListWithFixedValues: true,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'StateCodes',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: stateCode,
                    ValueListProperty: 'stateCode'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'stateName'
                }
            ]
        },
    };
}

annotate service.GstExemptedZones with @(
    UI.HeaderInfo                 : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'GST Exempted Zone',
        TypeNamePlural: 'GST Exempted Zones',
        Title         : {
            $Type: 'UI.DataField',
            Value: StateCodes.stateName,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: GstExemptedZone,
        },
    },
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: stateCode,
            },
            {
                $Type: 'UI.DataField',
                Value: ValidFrom,
            },
            {
                $Type: 'UI.DataField',
                Value: ValidTo,
            },
            {
                $Type: 'UI.DataField',
                Value: GstExemptedZone,
            }
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'GST Exempted Zone',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
