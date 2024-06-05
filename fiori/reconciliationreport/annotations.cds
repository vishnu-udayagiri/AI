using Reconciliation as service from '../../srv/reconciliation-Service';

@UI.DeleteHidden: true
annotate service.RECONCILIATIONVIEW1 with @(
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: DOCUMENTNUMBER,
        },
        {
            $Type: 'UI.DataField',
            Value: INVOICED,
        },
        {
            $Type: 'UI.DataField',
            Value: DWH_AVAILABLE,
        },
        {
            $Type: 'UI.DataField',
            Value: SBR_AVAILABLE,
        },
        {
            $Type: 'UI.DataField',
            Value: DATEOFISSUANCE,
        },
        {
            $Type: 'UI.DataField',
            Value: TRANSACTIONTYPE,
        },
        {
            $Type: 'UI.DataField',
            Value: TRANSACTIONCODE,
        },
        {
            $Type: 'UI.DataField',
            Value: ISSUEINDICATOR,
        },
        {
            $Type: 'UI.DataField',
            Value: TYPE,
        },
        {
            $Type: 'UI.DataField',
            Value: IATANUMBER,
        },
        {
            $Type: 'UI.DataField',
            Value: FULLROUTING,
        },
        {
            $Type: 'UI.DataField',
            Value: ROUTINGTYPE,
        },
        {
            $Type: 'UI.DataField',
            Value: ONEWAYINDICATOR,
        },
        {
            $Type: 'UI.DataField',
            Value: PUBLISHEDFARE,
        },
        {
            $Type: 'UI.DataField',
            Value: RESIDUALVALUE,
        },
        {
            $Type: 'UI.DataField',
            Value: EVENTTYPE,
        },
        {
            $Type: 'UI.DataField',
            Value: EVENTTYPESHORTCODE,
        },
        {
            $Type: 'UI.DataField',
            Value: ENTITYSTATUS,
        },
        {
            $Type: 'UI.DataField',
            Value: GSTIN,
        },
        {
            $Type: 'UI.DataField',
            Value: DWH_STATUS,
        },
        {
            $Type: 'UI.DataField',
            Value: SBR_STATUS,
        },
    ],
    UI.HeaderInfo     : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Reconciliation Report',
        TypeNamePlural: 'Reconciliation Report',
        Title         : {
            $Type: 'UI.DataField',
            Value: DOCUMENTNUMBER,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: EVENTTYPE,
        },
    },
    UI.SelectionFields: [
        DOCUMENTNUMBER,
        DATEOFISSUANCE,
        TRANSACTIONTYPE,
        TRANSACTIONCODE,
        ISSUEINDICATOR,
        IATANUMBER,
        ROUTINGTYPE,
        EVENTTYPE,
        ENTITYSTATUS,
        GSTIN
    ]
);

annotate service.RECONCILIATIONVIEW1 with {
    DOCUMENTNUMBER  @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListDocumentNumber',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: DOCUMENTNUMBER,
                ValueListProperty: 'DOCUMENTNUMBER'
            }]
        }
    };

    TRANSACTIONTYPE @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListTransactionType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: TRANSACTIONTYPE,
                ValueListProperty: 'TRANSACTIONTYPE'
            }]
        }
    };

    TRANSACTIONCODE @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListTransactionCode',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: TRANSACTIONCODE,
                ValueListProperty: 'TRANSACTIONCODE'
            }]
        }
    };

    ISSUEINDICATOR  @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListIssueIndicator',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: ISSUEINDICATOR,
                ValueListProperty: 'ISSUEINDICATOR'
            }]
        }
    };

    IATANUMBER      @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListIATANumber',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: IATANUMBER,
                    ValueListProperty: 'IATANUMBER'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'legalName',
                }
            ]
        }
    };

    ROUTINGTYPE     @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListRoutingType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: ROUTINGTYPE,
                ValueListProperty: 'ROUTINGTYPE'
            }]
        }
    };

    EVENTTYPE       @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListEventType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: EVENTTYPE,
                ValueListProperty: 'EVENTTYPE'
            }]
        }
    };

    ENTITYSTATUS    @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListEntityStatus',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: ENTITYSTATUS,
                ValueListProperty: 'ENTITYSTATUS'
            }]
        }
    };

    GSTIN           @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListGSTIN',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: GSTIN,
                ValueListProperty: 'GSTIN'
            }]
        }
    };
    DATEOFISSUANCE @title:'Date of Issuance';

}

annotate service.RECONCILIATIONVIEW1 with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: DOCUMENTNUMBER,
            },
            {
                $Type: 'UI.DataField',
                Value: INVOICED,
            },
            {
                $Type: 'UI.DataField',
                Value: DWH_AVAILABLE,
            },
            {
                $Type: 'UI.DataField',
                Value: SBR_AVAILABLE,
            },
            {
                $Type: 'UI.DataField',
                Value: DATEOFISSUANCE,
            },
            {
                $Type: 'UI.DataField',
                Value: TRANSACTIONTYPE,
            },
            {
                $Type: 'UI.DataField',
                Value: TRANSACTIONCODE,
            },
            {
                $Type: 'UI.DataField',
                Value: ISSUEINDICATOR,
            },
            {
                $Type: 'UI.DataField',
                Value: TYPE,
            },
            {
                $Type: 'UI.DataField',
                Value: IATANUMBER,
            },
            {
                $Type: 'UI.DataField',
                Value: FULLROUTING,
            },
            {
                $Type: 'UI.DataField',
                Value: ROUTINGTYPE,
            },
            {
                $Type: 'UI.DataField',
                Value: ONEWAYINDICATOR,
            },
            {
                $Type: 'UI.DataField',
                Value: PUBLISHEDFARE,
            },
            {
                $Type: 'UI.DataField',
                Value: RESIDUALVALUE,
            },
            {
                $Type: 'UI.DataField',
                Value: EVENTTYPE,
            },
            {
                $Type: 'UI.DataField',
                Value: EVENTTYPESHORTCODE,
            },
            {
                $Type: 'UI.DataField',
                Value: ENTITYSTATUS,
            },
            {
                $Type: 'UI.DataField',
                Value: GSTIN,
            },
            {
                $Type: 'UI.DataField',
                Value: DWH_STATUS,
            },
            {
                $Type: 'UI.DataField',
                Value: SBR_STATUS,
            },
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'Reconciliation Report',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
