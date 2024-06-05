using ScheduleService as service from '../../srv/Master-Service';

annotate service.AirportCodes with @(
    UI.LineItem       : [
        {
            $Type                : 'UI.DataField',
            Value                : Company.description,
            Label                : 'Company Name',
            ![@HTML5.CssDefaults]: {width: '154px'},
            @UI.Hidden
        },
        {
            $Type                : 'UI.DataField',
            Value                : airportCode,
            ![@HTML5.CssDefaults]: {width: '109px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : StateCodes.stateName,
            Label                : 'State',
            ![@HTML5.CssDefaults]: {width: '173px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : city,
            ![@HTML5.CssDefaults]: {width: '173px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : gstin,
            ![@HTML5.CssDefaults]: {width: '176px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : address,
            ![@HTML5.CssDefaults]: {width: '488px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : usedForInvoice,
            ![@HTML5.CssDefaults]: {width: '250px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : exemptedZone,
            ![@HTML5.CssDefaults]: {width: '116px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : isUT,
            ![@HTML5.CssDefaults]: {width: '64px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : region,
            ![@HTML5.CssDefaults]: {width: '64px'}
        },
        {
            $Type: 'UI.DataField',
            Value: stateCode,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Value: company,
            ![@UI.Hidden]
        }
    ],
    UI.SelectionFields: [
        stateCode,
        airportCode,
        exemptedZone
    ]
);

annotate service.AirportCodes with {
    stateCode      @Common: {
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

    company        @Common: {
        Text                    : Company.description,
        TextArrangement         : #TextOnly,
        ValueListWithFixedValues: true,
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
        }
    };

    airportCode    @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'AirportCodes',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: airportCode,
                    ValueListProperty: 'airportCode'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'gstin'
                }
            ]
        }
    };

    exemptedZone   @Common: {
        ValueListWithFixedValues: true,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListExemptedZone',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: exemptedZone,
                    ValueListProperty: 'exemptedZone'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'description'
                }
            ]
        }
    };
    usedForInvoice @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListgstinAddress',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: usedForInvoice,
                    ValueListProperty: 'address'
                },
                {
                    $Type            : 'Common.ValueListParameterFilterOnly',
                    ValueListProperty: 'validFrom',
                },
                {
                    $Type            : 'Common.ValueListParameterFilterOnly',
                    ValueListProperty: 'validTo',
                },
                {
                    $Type            : 'Common.ValueListParameterIn', 
                    LocalDataProperty: gstin,
                    ValueListProperty: 'gstin',
                },
            ]
        }
    };
}

annotate service.AirportCodes with @(
    UI.HeaderInfo                 : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Air India GSTIN Detail',
        TypeNamePlural: 'Air India GSTIN Details',
        Title         : {
            $Type: 'UI.DataField',
            Value: airportCode,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: StateCodes.stateName,
        },
    },
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: airportCode,
            },
            {
                $Type                : 'UI.DataField',
                Value                : StateCodes.stateName,
                Label                : 'State',
                ![@HTML5.CssDefaults]: {width: '400px'}
            },
            {
                $Type                : 'UI.DataField',
                Value                : city,
                ![@HTML5.CssDefaults]: {width: '400px'}
            },
            {
                $Type: 'UI.DataField',
                Value: company,
                Label: 'Company',
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Value: gstin,
            },
            {
                $Type: 'UI.DataField',
                Value: exemptedZone
            },
            {
                $Type                : 'UI.DataField',
                Value                : address,
                ![@HTML5.CssDefaults]: {width: '400px'}
            },
            {
                $Type                : 'UI.DataField',
                Value                : usedForInvoice,
                ![@HTML5.CssDefaults]: {width: '250px'}
            },
            {
                $Type                : 'UI.DataField',
                Value                : exemptedZone,
                ![@HTML5.CssDefaults]: {width: '400px'}
            },
            {
                $Type                : 'UI.DataField',
                Value                : isUT,
                ![@HTML5.CssDefaults]: {width: '400px'}
            },
            {
                $Type                : 'UI.DataField',
                Value                : region,
                ![@HTML5.CssDefaults]: {width: '400px'}
            }
        ]
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'Air India GSTIN Details',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
