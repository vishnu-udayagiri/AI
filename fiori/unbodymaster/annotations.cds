using ScheduleService as service from '../../srv/Master-Service';

annotate service.UNBodyMaster with @(
    UI.LineItem       : [
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
            Value: shortName,
        }
    ],
    UI.HeaderInfo     : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'UN Body',
        TypeNamePlural: 'UN Body',
        Title         : {
            $Type: 'UI.DataField',
            Value: gstinUIN,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: legalNameOfBusiness,
        },
    },
    UI.SelectionFields: [gstinUIN]
);

annotate service.UNBodyMaster with {
    gstinUIN @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'UNBodyMaster',
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
}

annotate service.UNBodyMaster with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
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
                Value: dateOfCancellation,
            },
            {
                $Type: 'UI.DataField',
                Value: shortName,
            }
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'UN Body',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
