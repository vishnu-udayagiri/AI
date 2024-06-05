using tcsSummaryDtlsReportService as service from '../../srv/tcsSummaryDtlsReport-Service';

@UI.DeleteHidden: true
annotate service.tcsSummaryDetailsReport with @(
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: TICKETNUMBER,
        },
        {
            $Type: 'UI.DataField',
            Value: TRANSACTIONTYPE,

        },
        {
            $Type: 'UI.DataField',
            Value: INVOICEDATE,
        },
        {
            $Type: 'UI.DataField',
            Value: IATANUMBER,
        },
        {
            $Type: 'UI.DataField',
            Value: GSTIN_OTA,
            Label: 'GSTIN OF OTA USED FOR TCS'
        },
        {
            $Type: 'UI.DataField',
            Value: ORGINALINVOICEDATE,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Value: STATECODE,
        // },
        {
            $Type: 'UI.DataField',
            Value: SUPPLIERGSTIN,
            Label: 'Airline GSTIN'
        },
        {
            $Type: 'UI.DataField',
            Value: GSTR1PERIOD,
        },
        {
            $Type: 'UI.DataField',
            Value: GSTR1FILINGSTATUS,
        },

        {
            $Type: 'UI.DataField',
            Value: SUPPLIERGSTIN2,
            Label: 'State of Deposit'
        },
        // {
        //     $Type: 'UI.DataField',
        //     Value: PLACEOFSUPPLY,
        // },
        {
            $Type: 'UI.DataField',
            Value: STATENAME,
            Label: 'Place of supply'
        },
        {
            $Type: 'UI.DataField',
            Value: TAXABLE,
        },
        {
            $Type: 'UI.DataField',
            Value: NONTAXABLE,
        },
        {
            $Type: 'UI.DataField',
            Value: TOTAL_TAX,
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_PERC_GST_VALUE,
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_CGST,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Value: TCS_SGST,
        // },
        {
            $Type: 'UI.DataField',
            Value: TCS_SGST_UTGST,
        },
        {
            $Type: 'UI.DataField',
            Value: TCS_IGST,
        },
        {
            $Type: 'UI.DataField',
            Value: TOTAL_TICKET_VALUE,
        },
        {
            $Type: 'UI.DataField',
            Value: REMARKS,
        },
    // {
    //     $Type: 'UI.DataField',
    //     Value: DOCUMENTTYPE,
    // },
    // {
    //     $Type: 'UI.DataField',
    //     Value: STATUS,
    // },


    // {
    //     $Type: 'UI.DataField',
    //     Value: COMPANY,
    // },


    // {
    //     $Type: 'UI.DataField',
    //     Value: USERID,
    // },

    // {
    //     $Type: 'UI.DataField',
    //     Value: PLACE_SUPPLY,
    // },


    // {
    //     $Type: 'UI.DataField',
    //     Value: IATANUMBER_1,
    // },
    // {
    //     $Type: 'UI.DataField',
    //     Value: ISECOMMERCEOPERATOR,
    // },
    // {
    //     $Type: 'UI.DataField',
    //     Value: SUPPLIERGSTIN2,
    // },
    // {
    //     $Type: 'UI.DataField',
    //     Value: COMPANYID,
    // },

    // {
    //     $Type: 'UI.DataField',
    //     Value: TICKETISSUEDATE_RFND,
    // },
    // {
    //     $Type: 'UI.DataField',
    //     Value: I_YEAR,
    // },
    // {
    //     $Type: 'UI.DataField',
    //     Value: I_MONTH,
    // },
    // {
    //     $Type: 'UI.DataField',
    //     Value: G_YEAR,
    // },
    // {
    //     $Type: 'UI.DataField',
    //     Value: G_MONTH,
    // },
    // {
    //     $Type: 'UI.DataField',
    //     Value: YEAR_MONTH,
    // },
    // {
    //     $Type: 'UI.DataField',
    //     Value: TAXABLE_1,
    // },
    // {
    //     $Type: 'UI.DataField',
    //     Value: CGSTRATE,
    // },
    // {
    //     $Type: 'UI.DataField',
    //     Value: SGSTRATE,
    // },
    // {
    //     $Type: 'UI.DataField',
    //     Value: IGSTRATE,
    // },
    // {
    //     $Type: 'UI.DataField',
    //     Value: UTGSTRATE,
    // },
    // {
    //     $Type: 'UI.DataField',
    //     Value: COLLECTEDINVOICEVALUE,
    // },


    // {
    //     $Type: 'UI.DataField',
    //     Value: TCS_UTGST,
    // },
    ],
    UI.SelectionFields: [
        TICKETNUMBER,
        INVOICEDATE,
        IATANUMBER,
        SUPPLIERGSTIN,
        GSTR1PERIOD
    ]
);

annotate service.tcsSummaryDetailsReport with @(UI.HeaderInfo: {
    $Type         : 'UI.HeaderInfoType',
    TypeName      : 'TCS Summary Details',
    TypeNamePlural: 'TCS Summary Details',
    Title         : {
        $Type: 'UI.DataField',
        Value: TICKETNUMBER,
    },
    Description   : {
        $Type: 'UI.DataField',
        Value: TICKETNUMBER,
    }

});

annotate service.tcsSummaryDetailsReport with {

    TICKETNUMBER
    @(
        title                          : 'Ticket Number',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListTICKETNUMBER',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'TICKETNUMBER',
                ValueListProperty: 'TICKETNUMBER'
            }]
        }
    );
    SUPPLIERGSTIN
    @(
        title                          : 'Supplier GSTIN',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListSUPPLIERGSTIN',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'SUPPLIERGSTIN',
                ValueListProperty: 'SUPPLIERGSTIN'
            }]
        }
    );
    DOCUMENTTYPE
    @(
        title                          : 'Document Type',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListDocumentType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'DOCUMENTTYPE',
                ValueListProperty: 'DOCUMENTTYPE'
            }]
        }
    );
    IATANUMBER
    @(
        title                          : 'IATA Number',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListIATANumber',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'IATANUMBER',
                ValueListProperty: 'IATANUMBER'
            }]
        }
    );
    GSTR1PERIOD
    @(
        title                          : 'GSTR1 Period',
        Common.ValueListWithFixedValues: false,
        Common.ValueList               : {
            CollectionPath: 'valueListGSTR1PERIOD',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'GSTR1PERIOD',
                ValueListProperty: 'GSTR1PERIOD'
            }]
        }
    );
}
