using userService as service from '../../srv/user-Service';

@UI.DeleteHidden
@UI.CreateHidden
annotate service.CompanyMasters with @(
    UI.LineItem           : [
        {
            $Type                : 'UI.DataField',
            Value                : CategoryMaster.description,
            Label                : 'Category',
            ![@HTML5.CssDefaults]: {width: '151px', },
        },
        {
            $Type                : 'UI.DataField',
            Value                : companyName,
            Label                : 'Company Name',
            ![@HTML5.CssDefaults]: {width: '282px', }
        },
        {
            $Type                : 'UI.DataField',
            Value                : companyRegistrationNumber,
            ![@HTML5.CssDefaults]: {width: '213px', }
        },
        {
            $Type                : 'UI.DataField',
            Value                : companyPan,
            ![@HTML5.CssDefaults]: {width: '7.0825rem', },
            @UI.Hidden           : togglePAN
        },
        {
            $Type                : 'UI.DataField',
            Value                : companyTan,
            ![@HTML5.CssDefaults]: {width: '7.0825rem', }
        },
        {
            $Type                : 'UI.DataField',
            Label                : 'Status',
            Value                : statusName,
            Criticality          : criticality,
            ![@HTML5.CssDefaults]: {width: '148px'}
        },
        {
            $Type                : 'UI.DataField',
            Value                : address,
            ![@HTML5.CssDefaults]: {width: '254px', }
        },
        {
            $Type                : 'UI.DataField',
            Value                : country.descr,
            Label                : 'Country',
            ![@HTML5.CssDefaults]: {width: '109px', }
        },
        {
            $Type                : 'UI.DataField',
            Value                : StateCodes.stateName,
            Label                : 'State',
            ![@HTML5.CssDefaults]: {width: '109px', }
        },
        {
            $Type                : 'UI.DataField',
            Value                : city,
            Label                : 'City',
            ![@HTML5.CssDefaults]: {width: '109px', }
        },
        {
            $Type                : 'UI.DataField',
            Value                : pincode,
            Label                : 'Pincode',
            ![@HTML5.CssDefaults]: {width: '109px', }
        },
        {
            $Type: 'UI.DataField',
            Value: contactNumber,
            Label: 'Contact Number'
        },
        {
            $Type: 'UI.DataField',
            Value: isEcommerceOperator,
            Label: 'Ecommerce Operator',
        },
        {
            $Type: 'UI.DataField',
            Value: website,
            Label: 'Website'
        },
        {
            $Type: 'UI.DataField',
            Value: createdAt,
            Label: 'Created On'
        },
        {
            $Type        : 'UI.DataField',
            Value        : consulateEmbassyCountry_code,
            ![@UI.Hidden]: true
        },
        {
            $Type        : 'UI.DataField',
            Value        : category,
            ![@UI.Hidden]: true
        },
        {
            $Type        : 'UI.DataField',
            Value        : ID,
            ![@UI.Hidden]: true
        },
        {
            $Type        : 'UI.DataField',
            Value        : country_code,
            ![@UI.Hidden]: true
        },
        {
            $Type        : 'UI.DataField',
            Value        : state,
            ![@UI.Hidden]: true
        },
        {
            $Type        : 'UI.DataField',
            Value        : toggleIATACode,
            ![@UI.Hidden]: true
        },
        {
            $Type: 'UI.DataField',
            Label: 'Agent Code',
            Value: agentCode,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Region',
            Value: region,
        },
        {
            $Type: 'UI.DataField',
            Value: unShortCode,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Status Code',
            Value: status,
        }
    ],
    UI.SelectionFields    : [
        category,
        companyName,
        country_code
    ],
    UI.PresentationVariant: {
        SortOrder     : [{
            Property  : createdAt,
            Descending: true,
            $Type     : 'Common.SortOrderType'
        }, ],
        Visualizations: ['@UI.LineItem'],
    }
);

annotate service.CompanyMasters with {
    category
            @(
        title                          : 'Category',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListCategory',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: 'category',
                    ValueListProperty: 'Category'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'Name'
                }
            ]
        }
    );
    companyName
            @(
        title                          : 'Company Name',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListCompanyName',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'companyName',
                ValueListProperty: 'companyName'
            }]
        }
    );
    country @(Common: {
        Text           : country.name,
        TextArrangement: #TextOnly,
        ValueList      : {
            Label         : '{i18n>customer}',
            CollectionPath: 'Countries',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    ValueListProperty: 'code',
                    LocalDataProperty: country_code
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ]
        }
    });

    state   @(Common: {
        Text           : StateCodes.stateName,
        TextArrangement: #TextOnly,
        ValueList      : {
            Label         : '{i18n>customer}',
            CollectionPath: 'StateCodes',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: 'country_code',
                    ValueListProperty: 'country_code'
                },
                {
                    $Type            : 'Common.ValueListParameterOut',
                    LocalDataProperty: 'state',
                    ValueListProperty: 'stateCode'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'stateName'
                }
            ]
        }
    });
    ID
            @(
        title                          : 'ID',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'CompanyMasters',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'ID',
                ValueListProperty: 'ID'
            }]
        }
    );
};

annotate service.CompanyMasters with @(
    UI.HeaderInfo                 : {
        TypeName      : 'Customer Master',
        TypeNamePlural: 'Customer Master',
        Title         : {
            $Type: 'UI.DataField',
            Value: companyName,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: address
        },
    },
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: CategoryMaster.description,
                Label: 'Category'
            },
            {
                $Type: 'UI.DataField',
                Value: companyName,
                Label: 'Company Name'
            },
            {
                $Type: 'UI.DataField',
                Value: companyRegistrationNumber,
            },
            {
                $Type     : 'UI.DataField',
                Value     : agentCode,
                Label     : 'Agent Code',
                @UI.Hidden: toggleIATACode
            },
            {
                $Type     : 'UI.DataField',
                Value     : companyPan,
                @UI.Hidden: togglePAN
            },
            {
                $Type: 'UI.DataField',
                Value: companyTan,
            },
            {
                $Type: 'UI.DataField',
                Value: address,
            },
            {
                $Type: 'UI.DataField',
                Value: country_code,
                Label: 'Country'
            },
            {
                $Type: 'UI.DataField',
                Label: 'State',
                Value: state
            },
            {
                $Type: 'UI.DataField',
                Value: city,
            },
            {
                $Type: 'UI.DataField',
                Value: pincode,
            },
            {
                $Type: 'UI.DataField',
                Value: contactNumber,
            },
            {
                $Type: 'UI.DataField',
                Value: website,
            },
            {
                $Type: 'UI.DataField',
                Value: isEcommerceOperator
            }
        ],
    },
    UI.Facets                     : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : 'General Details',
            Target: '@UI.FieldGroup#GeneratedGroup1',
        },
        {
            $Type     : 'UI.ReferenceFacet',
            Label     : 'GSTIN / UIN Details',
            ID        : 'companyGSTINFacet',
            Target    : 'CompanyGSTIN/@UI.LineItem',
            @UI.Hidden: toggleGSTIN
        },
        {
            $Type     : 'UI.ReferenceFacet',
            Label     : 'IATA Details',
            ID        : 'companyIATAFacet',
            Target    : 'CompanyIATA/@UI.LineItem',
            @UI.Hidden: toggleIATACode
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'User Details',
            ID    : 'companyUsersFacet',
            Target: 'CompanyUsers/@UI.LineItem'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Attachments',
            ID    : 'CompanyDocumentsFacet',
            Target: 'CompanyDocuments/@UI.LineItem'
        },
    ]
);

@UI.DeleteHidden
annotate service.CompanyUsers with @UI: {
    LineItem  : [
        {
            $Type: 'UI.DataField',
            Value: companyId,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Value: ID,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Value: criticality,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Value: loginEmail,
            Label: 'Login Email'
        },
        {
            $Type: 'UI.DataField',
            Value: title,
            Label: 'Title'
        },
        {
            $Type: 'UI.DataField',
            Value: firstName,
            Label: 'First Name'
        },
        {
            $Type: 'UI.DataField',
            Value: lastName,
            Label: 'Last Name'
        },
        {
            $Type: 'UI.DataField',
            Value: mobile,
            Label: 'Mobile'
        },
        {
            $Type: 'UI.DataField',
            Value: lastLoggedOn,
            Label: 'Last Logged On'
        },
        // {
        //     $Type      : 'UI.DataFieldForAction',
        //     Label      : 'Activate',
        //     Inline     : false,
        //     Criticality: #Positive,
        //     Action     : 'userService.activateUser'
        // },
        // {
        //     $Type      : 'UI.DataFieldForAction',
        //     Label      : 'Deactivate',
        //     Inline     : false,
        //     Criticality: #Negative,
        //     Action     : 'userService.deactivateUser'
        // },
        {
            $Type                : 'UI.DataField',
            Value                : status,
            Label                : 'Status',
            Criticality          : criticality,
            ![@HTML5.CssDefaults]: {width: '179px'}
        },
        {
            $Type: 'UI.DataField',
            Value: reasonForDeactivation,
            Label: 'Reason For Deactivation'
        },
        {
            $Type: 'UI.DataField',
            Value: CompanyUserRoles.isAdmin,
            Label: 'Admin'
        },
        {
            $Type: 'UI.DataField',
            Value: failedAttempts,
            Label: 'Failed Attempts'
        },
        {
            $Type: 'UI.DataField',
            Value: lastFailedLoginDate,
            Label: 'Last Failed Login Date'
        },
        {
            $Type: 'UI.DataField',
            Value: lastPasswordChangedOn,
            Label: 'Last Password Changed Date'
        },
        {
            $Type: 'UI.DataField',
            Value: loginAttempts,
            Label: 'Login Attempts'
        }
    ],
    HeaderInfo: {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'User',
        TypeNamePlural: 'Users',
    },
};

@UI.UpdateHidden
annotate service.CompanyGSTIN with @UI: {LineItem: [
    {
        $Type        : 'UI.DataField',
        Value        : companyId,
        ![@UI.Hidden]: true
    },
    {
        $Type: 'UI.DataField',
        Label: 'GSTIN / UIN',
        Value: GSTIN
    },
    {
        $Type: 'UI.DataField',
        Label: 'Default',
        Value: default
    },
    {
        $Type: 'UI.DataField',
        Label: 'Status',
        Value: status
    },
    {
        $Type: 'UI.DataField',
        Label: 'Type',
        Value: gsttype
    },
    {
        $Type: 'UI.DataField',
        Label: 'Legal Name',
        Value: legalName
    },
    {
        $Type: 'UI.DataField',
        Label: 'Trade Name',
        Value: tradeName
    },
    {
        $Type: 'UI.DataField',
        Label: 'Date of Issue GST',
        Value: dateOfIssueGST
    },
    {
        $Type        : 'UI.DataField',
        Label        : 'ARN No',
        Value        : ARNNo,
        ![@UI.Hidden]: true
    },
    {
        $Type        : 'UI.DataField',
        Label        : 'Date of Issue ARN',
        Value        : dateOfIssueARN,
        ![@UI.Hidden]: true
    },
    {
        $Type: 'UI.DataField',
        Label: 'Address',
        Value: address
    },
    {
        $Type                : 'UI.DataField',
        Label                : 'Country',
        Value                : country_code,
        ![@HTML5.CssDefaults]: {width: '150px'}
    },
    {
        $Type                : 'UI.DataField',
        Label                : 'State',
        Value                : state,
        ![@HTML5.CssDefaults]: {width: '150px'}
    },
    {
        $Type: 'UI.DataField',
        Label: 'City',
        Value: city
    },
    {
        $Type: 'UI.DataField',
        Label: 'Pincode',
        Value: pincode
    },
    {
        $Type: 'UI.DataField',
        Label: 'Last Validated On',
        Value: lastValidatedOn
    }
]};

annotate service.CompanyGSTIN with {

    country @(Common: {
        Text           : country.name,
        TextArrangement: #TextOnly,
        ValueList      : {
            Label         : '{i18n>customer}',
            CollectionPath: 'Countries',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    ValueListProperty: 'code',
                    LocalDataProperty: country_code
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ]
        }
    });

    state   @(Common: {
        Text           : StateCodes.stateName,
        TextArrangement: #TextOnly,
        ValueList      : {
            Label         : '{i18n>customer}',
            CollectionPath: 'StateCodes',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: 'country_code',
                    ValueListProperty: 'country_code'
                },
                {
                    $Type            : 'Common.ValueListParameterOut',
                    LocalDataProperty: 'state',
                    ValueListProperty: 'stateCode'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'stateName'
                }
            ]
        }
    });
};

@UI.DeleteHidden
annotate service.CompanyGSTIN with @(
    UI.HeaderInfo                 : {
        TypeName      : 'GSTIN / UIN',
        TypeNamePlural: 'GSTIN / UIN',
        Title         : {
            $Type: 'UI.DataField',
            Value: GSTIN,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: dateOfIssueGST
        }
    },
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Default',
                Value: default
            },
            {
                $Type: 'UI.DataField',
                Label: 'Status',
                Value: status
            },
            {
                $Type: 'UI.DataField',
                Label: 'GST Type',
                Value: gsttype
            },
            {
                $Type: 'UI.DataField',
                Label: 'Legal Name',
                Value: legalName
            },
            {
                $Type: 'UI.DataField',
                Label: 'Trade Name',
                Value: tradeName
            },
            {
                $Type: 'UI.DataField',
                Label: 'Date of Issue GST',
                Value: dateOfIssueGST
            },
            {
                $Type        : 'UI.DataField',
                Label        : 'ARN No',
                Value        : ARNNo,
                ![@UI.Hidden]: true
            },
            {
                $Type        : 'UI.DataField',
                Label        : 'Date of Issue ARN',
                Value        : dateOfIssueARN,
                ![@UI.Hidden]: true
            },
            {
                $Type: 'UI.DataField',
                Label: 'Address',
                Value: address
            },
            {
                $Type: 'UI.DataField',
                Label: 'Country',
                Value: country_code
            },
            {
                $Type: 'UI.DataField',
                Label: 'State',
                Value: state
            },
            {
                $Type: 'UI.DataField',
                Label: 'City',
                Value: city
            },
            {
                $Type: 'UI.DataField',
                Label: 'Pincode',
                Value: pincode
            },
            {
                $Type: 'UI.DataField',
                Label: 'Last Validated On',
                Value: lastValidatedOn
            }
        ],
    },
    UI.Facets                     : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : 'GSTIN / UIN',
            Target: '@UI.FieldGroup#GeneratedGroup1',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'GSTIN / UIN Address',
            ID    : 'companyGSTINAddressFacet',
            Target: 'CompanyGSTINAdresses/@UI.LineItem'
        }
    ]
);

@UI.DeleteHidden
annotate service.CompanyGSTINAdresses with @UI: {
    LineItem  : [
        {
            $Type: 'UI.DataField',
            Value: gstin,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Label: 'Sl No',
            Value: serialNo
        },
        {
            $Type: 'UI.DataField',
            Label: 'Type',
            Value: type
        },
        {
            $Type: 'UI.DataField',
            Label: 'Invoice Printing',
            Value: useForInvoicePrinting
        },
        {
            $Type: 'UI.DataField',
            Label: 'Effective From',
            Value: effectiveFrom
        },
        {
            $Type: 'UI.DataField',
            Label: 'Effective Till',
            Value: effectiveTill
        },
        {
            $Type: 'UI.DataField',
            Label: 'Address',
            Value: address
        },
        {
            $Type: 'UI.DataField',
            Label: 'State',
            Value: stateName
        },
        {
            $Type: 'UI.DataField',
            Label: 'City',
            Value: city
        },
        {
            $Type: 'UI.DataField',
            Label: 'Pincode',
            Value: pincode
        },
        {
            $Type: 'UI.DataField',
            Value: companyId,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Value: state,
            ![@UI.Hidden]
        }
    ],
    HeaderInfo: {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'GSTIN / UIN Address',
        TypeNamePlural: 'GSTIN / UIN Address',
    },
};

@UI.DeleteHidden
annotate service.CompanyIATA with @UI: {
    LineItem  : [
        {
            $Type: 'UI.DataField',
            Value: iataCode,
            Label: 'IATA'
        },
                {
            $Type: 'UI.DataField',
            Value: isEcommerceOperator,
            Label: 'Ecommerce Operator',
            ![@HTML5.CssDefaults]: {width: '200px', }
        },

        {
            $Type: 'UI.DataField',
            Value: legalName,
            Label: 'Legal Name'
        },
        {
            $Type: 'UI.DataField',
            Value: tradeName,
            Label: 'Trade Name'
        },
        {
            $Type                : 'UI.DataField',
            Value                : countryName,
            Label                : 'Country',
            ![@HTML5.CssDefaults]: {width: '210px'}
        },
        {
            $Type: 'UI.DataField',
            Value: region,
            Label: 'Region'
        },
        {
            $Type                : 'UI.DataField',
            Value                : postalCode,
            Label                : 'Postal Code',
            ![@HTML5.CssDefaults]: {width: '110px'}
        },
    ],
    HeaderInfo: {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'IATA Detail',
        TypeNamePlural: 'IATA Details',
    },
};


@UI.CreateHidden
@UI.DeleteHidden
annotate service.CompanyDocuments with @UI: {
    LineItem  : [
        {
            $Type: 'UI.DataField',
            Value: companyId,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Value: ID,
            ![@UI.Hidden]
        },
        {
            $Type: 'UI.DataField',
            Value: documentTypeCode
        },
        {
            $Type: 'UI.DataField',
            Value: fileName,
        },
        {
            $Type: 'UI.DataField',
            Value: fileId
        },
        {
            $Type: 'UI.DataField',
            Value: mimeType
        },
        {
            $Type: 'UI.DataField',
            Value: issuedOn
        },
        {
            $Type: 'UI.DataField',
            Value: validFrom
        },
        {
            $Type: 'UI.DataField',
            Value: validTo
        },
        {
            $Type                : 'UI.DataField',
            Value                : file,
            ![@HTML5.CssDefaults]: {width: '1px', }
        }
    ],
    HeaderInfo: {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Attachments',
        TypeNamePlural: 'Attachments',
    },
};
