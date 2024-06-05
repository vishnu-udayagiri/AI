using AuditTrailService as service from '../../srv/AuditLog-Services';

@UI.DeleteHidden: true
annotate service.AuditTrail with @UI: {
    PresentationVariant: {
        SortOrder     : [{
            Property  : createdAt,
            Descending: true,
            $Type     : 'Common.SortOrderType'
        }, ],
        Visualizations: ['@UI.LineItem', ],
    },

    LineItem           : [ 
        {
            $Type: 'UI.DataField',
            Label: 'Company',
            Value: Company.description,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Label: 'Module',
            Value: module,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Event',
            Value: eventId,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Event Details',
            Value: eventName,
        },
        {
            $Type: 'UI.DataField',
            Label: 'New Value',
            Value: newValue,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Old Value',
            Value: oldValue
        },
        {
            $Type: 'UI.DataField',
            Label: 'Created By',
            Value: createdBy,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Created At',
            Value: createdAt,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Final Message',
            Value: finalStatusMessageText,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Company',
            Value: CompanyMaster.companyName
        },
        {
            $Type         : 'UI.DataField',
            Value         : ID,
            ![@UI.Hidden] : true
        },
        {
            $Type         : 'UI.DataField',
            Value         : companyId,
            ![@UI.Hidden] : true
        },
        {
            $Type         : 'UI.DataField',
            Value         : userId,
            ![@UI.Hidden] : true
        },
        {
            $Type         : 'UI.DataField',
            Value         : companyCode,
            ![@UI.Hidden] : true
        },
    ],
    SelectionFields    : [
        companyCode,
        module,
        eventId,
        companyId,
        userId
    ],
};

annotate service.AuditTrail with @(UI.HeaderInfo: {
    TypeName      : 'Audit Trail',
    TypeNamePlural: 'Audit Trails',
    Title         : {
        $Type: 'UI.DataField',
        Value: module,
    }
});

annotate service.AuditTrail with {

    companyCode
    @(
        title                          : 'Company',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListCompany',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: 'companyCode',
                    ValueListProperty: 'Company'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'Name'
                }
            ]
        }
    );

    module
    @(
        title                          : 'Module',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListModule',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'module',
                ValueListProperty: 'Module'
            }]
        }
    );

    eventId
    @(
        title                          : 'Event',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListEventId',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'eventId',
                ValueListProperty: 'Event'
            }]
        }
    );

    companyId
    @(
        title                          : 'Organisation / Agent',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListCompanyMaster',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: 'companyId',
                    ValueListProperty: 'ID'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'Name'
                }
            ]
        }
    );

    userId
    @(
        title                          : 'User Name',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListCompanyUsers',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: 'userId',
                    ValueListProperty: 'ID'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'Name'
                }
            ]
        }
    );
};
