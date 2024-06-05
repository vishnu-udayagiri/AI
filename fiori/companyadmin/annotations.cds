using ConfigService as service from '../../srv/configuration-Service';

annotate service.companyAdmin with @(
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: company,
        },
        {
            $Type: 'UI.DataField',
            Value: email
        },
        {
            $Type: 'UI.DataField',
            Value: name,
        },
        {
            $Type: 'UI.DataField',
            Value: role,
        },
    ],
    UI.HeaderInfo     : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Company Admin',
        TypeNamePlural: 'Company Admins',
        Title         : {
            $Type: 'UI.DataField',
            Value: email,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: name,
        },
    },
    UI.SelectionFields: [
        company,
        email,
        name
    ]
);

annotate service.companyAdmin with {
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
    email
            @(
        title                          : 'Email',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'companyAdmin',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'email',
                ValueListProperty: 'email'
            }]
        }
    );
    name
            @(
        title                          : 'Name',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListName',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'name',
                ValueListProperty: 'Name'
            }]
        }
    );
};

annotate service.companyAdmin with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: company,
            },
            {
                $Type: 'UI.DataField',
                Value: email,
            },
            {
                $Type: 'UI.DataField',
                Value: name,
            },
            {
                $Type: 'UI.DataField',
                Value: role,
            },
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'Company Admin',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
