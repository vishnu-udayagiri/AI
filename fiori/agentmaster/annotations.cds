using ScheduleService as service from '../../srv/Master-Service';

annotate service.AgentMaster with @(
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: iataNumber,
        },
        {
            $Type: 'UI.DataField',
            Value: siteType,
        },
        {
            $Type: 'UI.DataField',
            Value: legalName,
        },
        {
            $Type: 'UI.DataField',
            Value: tradeName,
        },
        {
            $Type: 'UI.DataField',
            Value: city,
        },
        {
            $Type: 'UI.DataField',
            Value: regionCode,
        },
        {
            $Type: 'UI.DataField',
            Value: region,
        },
        {
            $Type: 'UI.DataField',
            Value: country_code,
        },
        {
            $Type: 'UI.DataField',
            Value: countryName,
        },
        {
            $Type: 'UI.DataField',
            Value: postalCode,
        },
        {
            $Type: 'UI.DataField',
            Value: crossReferenceAgentNum,
        },
    ],
    UI.HeaderInfo     : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Agent Master',
        TypeNamePlural: 'Agent Master',
        Title         : {
            $Type: 'UI.DataField',
            Value: iataNumber,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: legalName,
        },
    },
    UI.SelectionFields: [
        iataNumber,
        siteType,
        crossReferenceAgentNum,
        countryName,
        region
    ]
);

annotate service.AgentMaster with {
    iataNumber             @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'AgentMaster',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: iataNumber,
                    ValueListProperty: 'iataNumber'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'legalName'
                }
            ]
        }
    };

    siteType               @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListSiteType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: siteType,
                ValueListProperty: 'siteType'
            }]
        }
    };

    crossReferenceAgentNum @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListCrossRefNumber',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: crossReferenceAgentNum,
                ValueListProperty: 'crossReferenceAgentNum'
            }]
        }
    };

    countryName                @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListCountry',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: countryName,
                ValueListProperty: 'countryName'
            }]
        }
    };

    region                 @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListRegion',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: region,
                ValueListProperty: 'region'
            }]
        }
    };
}

annotate service.AgentMaster with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: iataNumber,
            },
            {
                $Type: 'UI.DataField',
                Value: siteType,
            },
            {
                $Type: 'UI.DataField',
                Value: legalName,
            },
            {
                $Type: 'UI.DataField',
                Value: tradeName,
            },
            {
                $Type: 'UI.DataField',
                Value: city,
            },
            {
                $Type: 'UI.DataField',
                Value: regionCode,
            },
            {
                $Type: 'UI.DataField',
                Value: region,
            },
            {
                $Type: 'UI.DataField',
                Value: country_code,
            },
            {
                $Type: 'UI.DataField',
                Value: countryName,
            },
            {
                $Type: 'UI.DataField',
                Value: postalCode,
            },
            {
                $Type: 'UI.DataField',
                Value: crossReferenceAgentNum,
            },
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'Agent Master',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
