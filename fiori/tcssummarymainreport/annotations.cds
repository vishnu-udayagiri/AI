using tcsSummaryMAINService as service from '../../srv/tcsSummaryMAIN-Service';

@UI.DeleteHidden: true
annotate service.tcsSummaryMAIN with @(
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: OTA_GSTIN,
        },
        {
            $Type: 'UI.DataField',
            Value: AIRLINE_GSTN,
        },
        {
            $Type: 'UI.DataField',
            Value: IATANUMBER,
        },
        {
            $Type: 'UI.DataField',
            Value: STATE_OF_DEPOSIT,
        },

        //    {
        //         $Type : 'UI.DataField',
        //         Value : MONTH,
        //     },
        //                 {
        //         $Type : 'UI.DataField',
        //         Value : YEAR,
        //     },
        {
            $Type: 'UI.DataField',
            Value: GSTR_MONTH,
            Label : 'GSTR1 Period'
        },
        {
            $Type: 'UI.DataField',
            Value: TOTAL_TICKET_VALUE,
        },
        {
            $Type: 'UI.DataField',
            Value: TAXABLE,
        },

        // {
        //     $Type : 'UI.DataField',
        //     Value : TRANSACTIONTYPE,
        // },
        // {
        //     $Type : 'UI.DataField',
        //     Value : DOCUMENTTYPE,
        // },
        // {
        //     $Type : 'UI.DataField',
        //     Value : ORGINALINVOICEDATE,
        // },
        // {
        //     $Type : 'UI.DataField',
        //     Value : PS_STATENAME,
        // },

        // {
        //     $Type : 'UI.DataField',
        //     Value : STATE_OF_DEPOSIT,
        // },

        // {
        //     $Type : 'UI.DataField',
        //     Value : NONTAXABLE,
        // },
        {
            $Type: 'UI.DataField',
            Value: TCS_PERC_GST_VALUE,
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_CGST,
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_SGST_UTGST,
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_IGST,
        },

    ],
    UI.SelectionFields: [
    
    IATANUMBER,
    OTA_GSTIN,
    GSTR_MONTH

    ]
);

annotate service.tcsSummaryMAIN with @(UI.HeaderInfo: {
    $Type         : 'UI.HeaderInfoType',
    TypeName      : 'TCS Summary Report',
    TypeNamePlural: 'TCS Summary Report',
    Title         : {
        $Type: 'UI.DataField',
        Value: IATANUMBER,
    },
    Description   : {
        $Type: 'UI.DataField',
        Value: IATANUMBER,
    }

}

);
annotate service.tcsSummaryMAIN with {

    IATANUMBER
    @(
        title                          : 'IATA Number',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListIATANumber',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: 'IATANUMBER',
                    ValueListProperty: 'IATANUMBER'
                }
            ]
        }
    );
    OTA_GSTIN
    @(
        title                          : 'OTA GSTIN',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListOTAGSTIN',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: 'OTA_GSTIN',
                    ValueListProperty: 'OTA_GSTIN'
                }
            ]
        }
    );
    GSTR_MONTH
    @(
        title                          : 'GSTR1 Period',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListMonth',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: 'GSTR_MONTH',
                    ValueListProperty: 'GSTR_MONTH'
                }
            ]
        }
    );
}
