using MJVReportService as service from '../../srv/MJVReport-Service';
@UI.DeleteHidden : true 
annotate service.mjvreport with @(
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: DOCNO,
        },
        {
            $Type: 'UI.DataField',
            Value: SERIAL,
        },
        {
            $Type: 'UI.DataField',
            Value: DOCDATE,
        },
        {
            $Type: 'UI.DataField',
            Value: DOCTYPE,
        },
        {
            $Type: 'UI.DataField',
            Value: BUKRS,
        },
        {
            $Type: 'UI.DataField',
            Value: BUDAT,
        },
        {
            $Type: 'UI.DataField',
            Value: WAERS,
        },
        {
            $Type: 'UI.DataField',
            Value: XBLNR,
        },
        {
            $Type: 'UI.DataField',
            Value: BKTXT,
        },
        {
            $Type: 'UI.DataField',
            Value: POSTINGKEY,
        },
        {
            $Type: 'UI.DataField',
            Value: CC_1GLACCOUNT,
        },

        {
            $Type: 'UI.DataField',
            Value: AMOUNT,
        },
        {
            $Type: 'UI.DataField',
            Value: SAPSECTONCODE,
        },
        {
            $Type: 'UI.DataField',
            Value: SAPBUSINESSPLACE,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Value: SUPPLIERGSTIN,
        // },
        {
            $Type: 'UI.DataField',
            Value: GSTR1PERIOD,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Value: DTYPE,
        // },
        {
            $Type: 'UI.DataField',
            Value: SGTXT,
        },
        {
            $Type: 'UI.DataField',
            Value: GSBER,
        },
        {
            $Type: 'UI.DataField',
            Value: KOSTL,
        },

        {
            $Type: 'UI.DataField',
            Value: XREF3,
        },

    ],
    UI.SelectionFields: [DOCDATE ,GSTR1PERIOD]
);

annotate service.mjvreport with @(UI.HeaderInfo: {
    $Type         : 'UI.HeaderInfoType',
    TypeName      : 'GST MJV Report',
    TypeNamePlural: 'GST MJV Report',
    Title         : {
        $Type: 'UI.DataField',
        Value: DOCNO,
    },
    Description   : {
        $Type: 'UI.DataField',
        Value: DOCNO,
    }

});
annotate service.mjvreport with {

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