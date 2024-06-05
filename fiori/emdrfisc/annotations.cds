using ScheduleService as service from '../../srv/Master-Service';

annotate service.EMDRFISC with @(
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: company,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Value: code,
        },
        {
            $Type: 'UI.DataField',
            Value: RFISC,
        },
        {
            $Type: 'UI.DataField',
            Value: serviceType,
        },
        {
            $Type: 'UI.DataField',
            Value: serviceCode,
        },
        {
            $Type: 'UI.DataField',
            Value: isAssociated,
        },
        {
            $Type: 'UI.DataField',
            Value: RFISCDescription,
        },
        {
            $Type: 'UI.DataField',
            Value: remarks,
        },
        {
            $Type: 'UI.DataField',
            Value: GLCode,
        },
        {
            $Type: 'UI.DataField',
            Value: routedFSA,
        },
        {
            $Type: 'UI.DataField',
            Value: GSTApplicable,
        },
        {
            $Type: 'UI.DataField',
            Value: isComposite,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Value: isCabinDependent,
        // },
        {
            $Type: 'UI.DataField',
            Value: linkedToTaxcode,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'isAirportSpecific',
        //     Value: isAirportSpecific,
        // },
        {
            $Type: 'UI.DataField',
            Value: docType,
        },
        {
            $Type: 'UI.DataField',
            Value: HSN,
        }
    ],
    UI.HeaderInfo     : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'EMD RFISC',
        TypeNamePlural: 'EMD RFISC',
    },
    UI.SelectionFields: [RFISC]
);

annotate service.EMDRFISC with {

    RFISC @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'EMDRFISC',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: RFISC,
                    ValueListProperty: 'RFISC'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'RFISCDescription'
                }
            ]
        }
    };
    company
          @Common: {
        Text                    : Company.description,
        TextArrangement         : #TextOnly,
        ValueListWithFixedValues: false,
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
};

annotate service.EMDRFISC with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: company,
            },
            {
                $Type: 'UI.DataField',
                Value: code,
            },
            {
                $Type: 'UI.DataField',
                Value: RFISC,
            },
            {
                $Type: 'UI.DataField',
                Value: serviceType,
            },
            {
                $Type: 'UI.DataField',
                Value: serviceCode,
            },
            {
                $Type: 'UI.DataField',
                Value: isAssociated,
            },
            {
                $Type: 'UI.DataField',
                Value: RFISCDescription,
            },
            {
                $Type: 'UI.DataField',
                Value: remarks,
            },
            {
                $Type: 'UI.DataField',
                Value: GLCode,
            },
            {
                $Type: 'UI.DataField',
                Value: routedFSA,
            },
            {
                $Type: 'UI.DataField',
                Value: GSTApplicable,
            },
            {
                $Type: 'UI.DataField',
                Value: isComposite,
            },
            {
                $Type: 'UI.DataField',
                Value: isCabinDependent,
            },
            {
                $Type: 'UI.DataField',
                Value: linkedToTaxcode,
            },
            {
                $Type: 'UI.DataField',
                Label: 'isAirportSpecific',
                Value: isAirportSpecific,
            },
            {
                $Type: 'UI.DataField',
                Value: docType,
            },
            {
                $Type: 'UI.DataField',
                Value: HSN,
            },
        ],
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'EMD RFISC',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }, ]
);
