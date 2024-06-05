using ScheduleService as service from '../../srv/Master-Service';

annotate service.TaxRules with @(
    UI.LineItem       : [
        {
            $Type                 : 'UI.DataField',
            Label                 : 'Company',
            Value                 : Company.description,
            ![@HTML5.CssDefaults] : {width: '140px'}
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : ticketClass,
            ![@HTML5.CssDefaults] : {width: '93px'}
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : eindia,
            ![@HTML5.CssDefaults] : {width: '69px'}
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : exemptedZone,
            ![@HTML5.CssDefaults] : {width: '115px'}
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : b2b,
            ![@HTML5.CssDefaults] : {width: '54px'}
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : IsSEZ,
            ![@HTML5.CssDefaults] : {width: '69px'}
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : intrastate,
            ![@HTML5.CssDefaults] : {width: '97px'}
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : isUT,
            ![@HTML5.CssDefaults] : {width: '112px'}
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : ruleId,
            ![@HTML5.CssDefaults] : {width: '79px'}
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : ruleText,
            ![@HTML5.CssDefaults] : {width: '120px'}
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : validFrom,
            ![@HTML5.CssDefaults] : {width: '106px'}
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : validTo,
            ![@HTML5.CssDefaults] : {width: '111px'}
        },
        {
            $Type: 'UI.DataField',
            Value: company,
            ![@UI.Hidden]
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : TaxCodes.taxCode,
            ![@HTML5.CssDefaults] : {width: '84px'}
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax Code Description',
            Value: taxCode
        }
    ],
    UI.SelectionFields: [
        company,
        taxCode
    ]
);

annotate service.TaxRules with {
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
        },
    };
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

};

annotate service.TaxRules with @(
    UI.HeaderInfo                 : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Tax Rule',
        TypeNamePlural: 'Tax Rules',
        Title         : {
            $Type: 'UI.DataField',
            Value: TaxCodes.taxDescription,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: ruleId,
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
                Value: ticketClass,
            },
            {
                $Type: 'UI.DataField',
                Value: eindia,
            },
            {
                $Type: 'UI.DataField',
                Value: exemptedZone,
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
                Value: intrastate,
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
                Value: validTo,
            },
            {
                $Type: 'UI.DataField',
                Value: TaxCodes.taxCode
            },
            {
                $Type: 'UI.DataField',
                Label: 'Tax Code Description',
                Value: taxCode,
            }
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'Tax Rate',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
