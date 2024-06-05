using ScheduleService as service from '../../srv/Master-Service';

annotate service.FeeCodes with @(
    UI.LineItem           : [
        {
            $Type: 'UI.DataField',
            Value: company
        },
        {
            $Type                : 'UI.DataField',
            Value                : feeCode,
            ![@HTML5.CssDefaults]: {width: '150px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : feeDescription,
            ![@HTML5.CssDefaults]: {width: '450px'}
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
            Value: taxableFactor,
        },
        {
            $Type: 'UI.DataField',
            Value: taxComponent,
        },
        {
            $Type: 'UI.DataField',
            Value: taxInclusive,
        },
        {
            $Type: 'UI.DataField',
            Value: invoiceFactor,
        }
    ],
    UI.HeaderInfo         : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Airline Tax Codes & Fee Code',
        TypeNamePlural: 'Airline Tax Codes & Fee Codes',
    },
    UI.PresentationVariant: {
        SortOrder     : [{
            Property  : feeCode,
            Descending: false,
            $Type     : 'Common.SortOrderType'
        }, ],
        Visualizations: ['@UI.LineItem', ],
    },
    UI.SelectionFields    : [
        feeCode,
        ValidFrom
    ]
);

annotate service.FeeCodes with {
    feeCode @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'FeeCodes',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: feeCode,
                    ValueListProperty: 'feeCode'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'feeDescription'
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
}

annotate service.FeeCodes with @(
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
                Value: feeCode,
            },
            {
                $Type: 'UI.DataField',
                Value: feeDescription,
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
                Value: taxableFactor,
            },
            {
                $Type: 'UI.DataField',
                Value: taxComponent,
            },
            {
                $Type: 'UI.DataField',
                Value: taxInclusive,
            },
            {
                $Type: 'UI.DataField',
                Value: invoiceFactor,
            }
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'Airline Tax Codes & Fee Codes',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
