using ScheduleService as service from '../../srv/Master-Service';

annotate service.RFISC with @(
    UI.LineItem  : [
        {
            $Type: 'UI.DataField',
            Value: RFISC,
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : RFISCDescription,
            ![@HTML5.CssDefaults] : {width: '500px'}
        },
        {
            $Type: 'UI.DataField',
            Value: HSNCode,
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : HSNDescription,
            ![@HTML5.CssDefaults] : {width: '500px'}
        },
    ],
    UI.HeaderInfo: {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'RFISC',
        TypeNamePlural: 'RFISC',
    },
);

annotate service.RFISC with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: RFISC,
            },
            {
                $Type: 'UI.DataField',
                Value: RFISCDescription,
            },
            {
                $Type: 'UI.DataField',
                Value: HSNCode,
            },
            {
                $Type: 'UI.DataField',
                Value: HSNDescription,
            },
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'RFISC',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
