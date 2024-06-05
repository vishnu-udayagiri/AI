using ScheduleService as service from '../../srv/Master-Service';

annotate service.IataGst with @(
    UI.LineItem       : [
        {
            $Type                : 'UI.DataField',
            Label                : 'IATA Number ',
            Value                : iataNumber_8,
            ![@HTML5.CssDefaults]: {width: '154px'},
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'IATA Number',
            Value                : iataNumber_7,
            ![@HTML5.CssDefaults]: {width: '180px'}
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'State',
            Value                : StateCodes.stateName,
            ![@HTML5.CssDefaults]: {width: '154px'}
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'GSTIN',
            Value                : gstIn,
            ![@HTML5.CssDefaults]: {width: '200px'}
        },
    ],
    UI.SelectionFields: [
        stateCode,
        gstIn
    ]
);


annotate service.IataGst with {

    gstIn     @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListGSTIN',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: gstIn,
                ValueListProperty: 'gstIn'
            }]
        }
    };

    stateCode @Common: {
        Text                    : StateCodes.stateCode,
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
        }
    };
}

annotate service.IataGst with @(
    UI.HeaderInfo                 : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'IATA GSTIN',
        TypeNamePlural: 'IATA GSTIN',
        Title         : {
            $Type: 'UI.DataField',
            Value: iataNumber_8,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: gstIn,
        },
    },
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Iata Number_8',
                Value: iataNumber_8,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Iata Number_7',
                Value: iataNumber_7,
            },
            {
                $Type: 'UI.DataField',
                Label: 'State Code',
                Value: stateCode,
            },
            {
                $Type: 'UI.DataField',
                Label: 'GSTIN',
                Value: gstIn,
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
