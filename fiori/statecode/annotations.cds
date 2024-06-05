using ScheduleService as service from '../../srv/Master-Service';

@UI.CreateHidden
@UI.DeleteHidden
annotate service.StateCodes with @(
    UI.LineItem       : [
        {
            $Type                : 'UI.DataField',
            Value                : stateCode,
            Label                : 'Code',
            ![@HTML5.CssDefaults]: {width: '100px'},
        },
        {
            $Type                : 'UI.DataField',
            Value                : country.descr,
            Label                : 'Country Name',
            ![@HTML5.CssDefaults]: {width: '154px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : stateName,
            Label                : 'State Name',
            ![@HTML5.CssDefaults]: {width: '700px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : region,
            Label                : 'Region',
            ![@HTML5.CssDefaults]: {width: '250px'}
        },
    ],
    UI.SelectionFields: [stateCode]

);

annotate service.StateCodes with {
    stateCode @Common: {
        ValueListWithFixedValues: false,
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
        }
    };
}

annotate service.StateCodes with @(
    UI.HeaderInfo                 : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'State Code',
        TypeNamePlural: 'State Codes',
        Title         : {
            $Type: 'UI.DataField',
            Value: stateCode,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: stateName,
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
                Value: stateName,
                Label: 'State Name',
            },
            {
                $Type: 'UI.DataField',
                Value: country.descr,
                Label: 'Country Name',
            },
            {
                $Type: 'UI.DataField',
                Value: region,
                Label: 'Region',
            },
        ],
    },


    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'State Code Details',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
