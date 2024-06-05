using ScheduleService as service from '../../srv/Master-Service';

annotate service.AirportMaster with @(
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: airportCode,
        },
        {
            $Type: 'UI.DataField',
            Value: airportName,
        },
        {
            $Type: 'UI.DataField',
            Value: city,
        },
        {
            $Type: 'UI.DataField',
            Value: stateCode,
        },
        {
            $Type: 'UI.DataField',
            Value: countryCode,
        },
    ],
    UI.HeaderInfo     : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Airport Master',
        TypeNamePlural: 'Airport Master',
        Title         : {
            $Type: 'UI.DataField',
            Value: airportCode,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: airportName,
        },
    },
    UI.SelectionFields: [
        airportCode,
        city,
        stateCode,
        countryCode
    ]
);

annotate service.AirportMaster with {
    airportCode @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListAirport',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: airportCode,
                    ValueListProperty: 'airportCode'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'airportName'
                }
            ]
        }
    };

    city        @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListCity',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: city,
                ValueListProperty: 'city'
            }]
        }
    };

    stateCode   @Common: {
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

    countryCode @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Countries',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: countryCode,
                    ValueListProperty: 'code'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name'
                }
            ]
        }
    };

}

annotate service.AirportMaster with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: airportCode,
            },
            {
                $Type: 'UI.DataField',
                Value: airportName,
            },
            {
                $Type: 'UI.DataField',
                Value: city,
            },
            {
                $Type: 'UI.DataField',
                Value: stateCode,
            },
            {
                $Type: 'UI.DataField',
                Value: countryCode,
            },
        ]
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'Airport Master',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
