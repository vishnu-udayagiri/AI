using ScheduleService as service from '../../srv/Master-Service';

annotate service.ConsulateEmbassyMaster with @(
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: gstinUIN,
        },
        {
            $Type                : 'UI.DataField',
            Value                : country_code,
            ![@HTML5.CssDefaults]: {width: '152px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : taxpayerType,
            ![@HTML5.CssDefaults]: {width: '292px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : legalNameOfBusiness,
            ![@HTML5.CssDefaults]: {width: '354px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : tradeName,
            ![@HTML5.CssDefaults]: {width: '306px'},
            @UI.Hidden
        },
        {
            $Type                : 'UI.DataField',
            Value                : gstinStatus,
            ![@HTML5.CssDefaults]: {width: '85px'}
        }
    ],
    UI.SelectionFields: [
        country_code,
        gstinUIN
    ],
    UI.HeaderInfo     : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Consulate / Embassy',
        TypeNamePlural: 'Consulate / Embassy',
        Title         : {
            $Type: 'UI.DataField',
            Value: gstinUIN,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: legalNameOfBusiness,
        },
    },
);

annotate service.ConsulateEmbassyMaster with {
    gstinUIN @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ConsulateEmbassyMaster',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: gstinUIN,
                    ValueListProperty: 'gstinUIN'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'taxpayerType'
                }
            ]
        }
    };
    country  @Common: {
        Text                    : country.descr,
        TextArrangement         : #TextOnly,
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Countries',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: country_code,
                    ValueListProperty: 'code'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'descr'
                }
            ]
        }
    };
}

annotate service.ConsulateEmbassyMaster with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: country_code,
            },
            {
                $Type: 'UI.DataField',
                Value: gstinUIN,
            },
            {
                $Type: 'UI.DataField',
                Value: taxpayerType,
            },
            {
                $Type: 'UI.DataField',
                Value: legalNameOfBusiness,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Trade Name',
                Value: tradeName,
                @UI.Hidden
            },
            {
                $Type: 'UI.DataField',
                Value: gstinStatus,
            },
            {
                $Type: 'UI.DataField',
                Value: dateOfCancellation,
            },
            {
                $Type: 'UI.DataField',
                Value: gstinStatus
            }
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'Consulate/Embassy',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
