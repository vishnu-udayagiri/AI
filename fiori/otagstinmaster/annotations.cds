using otagstinMaster as service from '../../srv/otagstinMaster-Service';

annotate service.otagstinmaster with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : OTAGSTIN,
        },
        {
            $Type : 'UI.DataField',
            Value : IATACODE,
        },
        {
            $Type : 'UI.DataField',
            Value : OTAGSTIN_NAME,
        },
        {
            $Type : 'UI.DataField',
            Value : STATE,
        },
        {
            $Type : 'UI.DataField',
            Value : STATE_CODE,
        },
    ]
);
annotate service.otagstinmaster with @(
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : IATACODE,
            },
            {
                $Type : 'UI.DataField',
                Value : OTAGSTIN,
            },
            {
                $Type : 'UI.DataField',
                Value : OTAGSTIN_NAME,
            },
            {
                $Type : 'UI.DataField',
                Value : STATE,
            },
            {
                $Type : 'UI.DataField',
                Value : STATE_CODE,
            },
            {
                $Type : 'UI.DataField',
                Value : DEFAULT,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup1',
        },
    ]
);
