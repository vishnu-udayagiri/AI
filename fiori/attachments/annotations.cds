using ConfigService as service from '../../srv/configuration-Service';

annotate service.DocumentCategory with @(
    UI.LineItem  : [
        {
            $Type                 : 'UI.DataField',
            Value                 : documentTypeCode,
            ![@HTML5.CssDefaults] : {width: '175px'}
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : documentName,
            ![@HTML5.CssDefaults] : {width: '366px'}
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : description,
            ![@HTML5.CssDefaults] : {width: '391px'}
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : isMandatory,
            ![@HTML5.CssDefaults] : {width: '430px'}
        },
    ],
    UI.HeaderInfo: {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Attachment Configuration',
        TypeNamePlural: 'Attachment Configuration',
        Title         : {
            $Type: 'UI.DataField',
            Value: documentTypeCode,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: documentName,
        },
    },
);

annotate service.DocumentCategory with {
    documentTypeCode @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'DocumentCategory',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: documentTypeCode,
                    ValueListProperty: 'documentTypeCode'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'documentName'
                }
            ]
        }
    };
}

annotate service.DocumentCategory with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: documentTypeCode,
            },
            {
                $Type: 'UI.DataField',
                Value: documentName,
            },
            {
                $Type: 'UI.DataField',
                Value: description,
            },
            {
                $Type: 'UI.DataField',
                Value: isMandatory,
            },
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'Document',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
