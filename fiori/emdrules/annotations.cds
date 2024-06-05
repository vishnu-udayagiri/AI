using ScheduleService as service from '../../srv/Master-Service';

annotate service.EMDRules with @(
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: company,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Value: code,
        },
        {
            $Type: 'UI.DataField',
            Value: RFISC,
        },
        {
            $Type: 'UI.DataField',
            Value: slno,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Value: intrastate,
        },
        {
            $Type: 'UI.DataField',
            Value: isUT,
        },
        {
            $Type: 'UI.DataField',
            Value: b2b,
        },
        {
            $Type: 'UI.DataField',
            Value: IsSEZ,
        },
        {
            $Type: 'UI.DataField',
            Value: ruleId,
        },
        {
            $Type                : 'UI.DataField',
            Value                : ruleText,
            ![@HTML5.CssDefaults]: {width: '499px'}
        },
        {
            $Type: 'UI.DataField',
            Value: cabinClass,
        },
        {
            $Type: 'UI.DataField',
            Value: TaxCodes.taxCode,
        },
        {
            $Type: 'UI.DataField',
            Value: taxCode,
        },
        {
            $Type: 'UI.DataField',
            Value: validFrom,
        },
        {
            $Type: 'UI.DataField',
            Value: validityTill,
        }
    ],
    UI.HeaderInfo     : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'EMD Rules',
        TypeNamePlural: 'EMD Rules',
        Title         : {
            $Type: 'UI.DataField',
            Value: RFISC,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: ruleId,
        },
    },
    UI.SelectionFields: [
        RFISC,
        validFrom
    ]
);

annotate service.EMDRules with {
    RFISC   @Common: {
        Text                    : RFISC,
        TextArrangement         : #TextOnly,
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'EMDRFISC',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: RFISC,
                    ValueListProperty: 'RFISC'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'RFISCDescription'
                }
            ]
        }
    };

    company @Common: {
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
        }
    };
}

annotate service.EMDRules with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: company,
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Value: code,
            },
            {
                $Type: 'UI.DataField',
                Value: slno,
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Value: RFISC,
            },
            {
                $Type: 'UI.DataField',
                Value: intrastate,
            },
            {
                $Type: 'UI.DataField',
                Value: isUT,
            },
            {
                $Type: 'UI.DataField',
                Value: b2b,
            },
            {
                $Type: 'UI.DataField',
                Value: IsSEZ,
            },
            {
                $Type: 'UI.DataField',
                Value: cabinClass,
            },
            {
                $Type: 'UI.DataField',
                Value: taxCode,
            },
            {
                $Type: 'UI.DataField',
                Value: ruleId,
            },
            {
                $Type: 'UI.DataField',
                Value: ruleText,
            },
            {
                $Type: 'UI.DataField',
                Value: validFrom,
            },
            {
                $Type: 'UI.DataField',
                Value: validityTill,
            },
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'EMD Rules',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
