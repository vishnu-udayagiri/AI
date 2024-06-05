using userService as service from '../../srv/user-Service';

@UI.DeleteHidden

annotate service.UnregisteredCustomer with @(
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: gstin,
        },
        {
            $Type: 'UI.DataField',
            Value: pan
        },
        {
            $Type: 'UI.DataField',
            Value: legalName
        },
        {
            $Type: 'UI.DataField',
            Value: tradeName
        },
        {
            $Type: 'UI.DataField',
            Value: address
        },
        {
            $Type: 'UI.DataField',
            Value: postalCode
        },
        {
            $Type: 'UI.DataField',
            Value: StateCodes.stateName
        },
        {
            $Type: 'UI.DataField',
            Value: taxPayerType
        },
        {
            $Type: 'UI.DataField',
            Value: createdAt,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Value: createdBy,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Value: modifiedAt,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Value: modifiedBy,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Value: stateCode,
            @UI.Hidden
        }
    ],
    UI.SelectionFields: [
        gstin,
        stateCode
    ]
);

annotate service.UnregisteredCustomer with {
    gstin     @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'UnregisteredCustomer',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: gstin,
                    ValueListProperty: 'gstin'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'legalName'
                }
            ]
        }
    };
    stateCode @Common: {
        Text                    : StateCodes.stateCode,
        TextArrangement         : #TextOnly,
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'StateCodes',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: stateCode,
                    ValueListProperty: 'stateCode'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'stateName'
                }
            ]
        }
    };
}

annotate service.UnregisteredCustomer with @(
    UI.HeaderInfo                 : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Unregistered Customer',
        TypeNamePlural: 'Unregistered Customers',
        Title         : {
            $Type: 'UI.DataField',
            Value: gstin,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: legalName,
        },
    },
    // UI.FieldGroup #GeneratedGroup1: {
    //     $Type: 'UI.FieldGroupType',
    //     Data : [
    //         {
    //             $Type: 'UI.DataField',
    //             Value: gstin,
    //         },
    //         {
    //             $Type: 'UI.DataField',
    //             Value: pan
    //         },
    //         {
    //             $Type: 'UI.DataField',
    //             Value: legalName
    //         },
    //         {
    //             $Type: 'UI.DataField',
    //             Value: tradeName
    //         },
    //         {
    //             $Type: 'UI.DataField',
    //             Value: address
    //         },
    //         {
    //             $Type: 'UI.DataField',
    //             Value: postalCode
    //         },
    //         {
    //             $Type: 'UI.DataField',
    //             Value: StateCodes.stateName
    //         },
    //         {
    //             $Type: 'UI.DataField',
    //             Value: taxPayerType
    //         }
    //     ]
    // },
    // UI.Facets                     : [{
    //     $Type : 'UI.ReferenceFacet',
    //     ID    : 'GeneratedFacet1',
    //     Label : 'Unregistered Customer',
    //     Target: '@UI.FieldGroup#GeneratedGroup1',
    // }, ]
);
