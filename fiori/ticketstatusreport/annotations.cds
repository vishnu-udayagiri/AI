using ticketstatusService as service from '../../srv/ticketstatusreport-Service';
@UI.DeleteHidden
annotate service.ticketstatusreport with @(
    UI.LineItem : [
            {
                $Type : 'UI.DataField',
                Value : IATANUMBER,
            },
            {
                $Type : 'UI.DataField',
                Value : TICKETNUMBER,
            },
            {
                $Type : 'UI.DataField',
                Value : TICKETISSUEDATE,
            },
            {
                $Type : 'UI.DataField',
                Value : SUPPLIERGSTIN,
            },
            {
                $Type : 'UI.DataField',
                Value : SBRRECIVEDON,
            },
            {
                $Type : 'UI.DataField',
                Value : SBRPROCESSEDON,
            },
            {
                $Type : 'UI.DataField',
                Value : INVOICENUMBER,
            },
            {
                $Type : 'UI.DataField',
                Value : INVOICEDATE,
            },
            {
                $Type : 'UI.DataField',
                Value : SECTIONTYPE,
            },
            {
                $Type : 'UI.DataField',
                Value : PLACEOFSUPPLY,
            },
            {
                $Type : 'UI.DataField',
                Value : FULLROUTING,
            },
            {
                $Type : 'UI.DataField',
                Value : DOCUMENTCURRENCY_CODE,
            },
            {
                $Type : 'UI.DataField',
                Value : BILLTONAME,
            },
            {
                $Type : 'UI.DataField',
                Value : PASSENGERGSTIN,
            },
            {
                $Type : 'UI.DataField',
                Value : NETTAXABLEVALUE,
            },
            {
                $Type : 'UI.DataField',
                Value : TAXABLECALCULATION,
            },
            {
                $Type : 'UI.DataField',
                Value : TOTALINVOICEAMOUNT,
            },
            {
                $Type : 'UI.DataField',
                Value : EXEMPTEDZONE,
            },
            {
                $Type : 'UI.DataField',
                Value : COMPANYID,
            },
            {
                $Type : 'UI.DataField',
                Value : REASONFORISSUANCESUBCODE,
            },
            {
                $Type : 'UI.DataField',
                Value : ORGINALFILENAME,
            },
            {
                $Type : 'UI.DataField',
                Value : TRANSACTIONTYPE,
            },
            {
                $Type : 'UI.DataField',
                Value : TRANSACTIONCODE,
            },
            {
                $Type : 'UI.DataField',
                Value : ORIGINCITY,
            },
            {
                $Type : 'UI.DataField',
                Value : DESTINATIONCITY,
            },
            {
                $Type : 'UI.DataField',
                Value : PUBLISHEDFARE,
            },
            {
                $Type : 'UI.DataField',
                Value : STATUS,
            },
            {
                $Type : 'UI.DataField',
                Value : HSNCODE,
            },
            {
                $Type : 'UI.DataField',
                Value : DISCOUNT,
            },
            {
                $Type : 'UI.DataField',
                Value : CGSTRATE,
            },
            {
                $Type : 'UI.DataField',
                Value : CGSTAMOUNT,
            },
            {
                $Type : 'UI.DataField',
                Value : SGSTRATE,
            },
            {
                $Type : 'UI.DataField',
                Value : SGSTAMOUNT,
            },
            {
                $Type : 'UI.DataField',
                Value : UTGSTRATE,
            },
            {
                $Type : 'UI.DataField',
                Value : UTGSTAMOUNT,
            },
            {
                $Type : 'UI.DataField',
                Value : IGSTRATE,
            },
            {
                $Type : 'UI.DataField',
                Value : IGSTAMOUNT,
            },
            {
                $Type : 'UI.DataField',
                Value : DOCUMENTTYPE,
            },
            {
                $Type : 'UI.DataField',
                Value : LEGALNAME,
            },
            {
                $Type : 'UI.DataField',
                Value : TRADENAME,
            },
    ],
        UI.SelectionFields: [
        IATANUMBER,
        SUPPLIERGSTIN,
        DOCUMENTTYPE,
        TICKETISSUEDATE,
        TICKETNUMBER,
        INVOICENUMBER,
        INVOICEDATE
    ]
);
annotate service.ticketstatusreport with {
    TICKETNUMBER    @Common: {
        title                   : 'Ticket Number',
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListTICKETNUMBER',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: TICKETNUMBER,
                ValueListProperty: 'TICKETNUMBER'
            }]
        }
    };


    SUPPLIERGSTIN   @Common: {
        title                   : 'Supplier GSTIN',
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListSUPPLIERGSTIN',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: SUPPLIERGSTIN,
                ValueListProperty: 'SUPPLIERGSTIN'
            }]
        }
    };

    DOCUMENTTYPE    @Common: {
        ValueListWithFixedValues: false,
        title                   : 'Document Type',
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListDOCUMENTTYPE',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: DOCUMENTTYPE,
                ValueListProperty: 'DOCUMENTTYPE'
            }]
        }
    }  @title: 'Document Type';

    IATANUMBER      @Common: {
        ValueListWithFixedValues: false,
        title                   : 'IATA Number',
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListIATANUMBER',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: IATANUMBER,
                    ValueListProperty: 'IATANUMBER'
                }
            ]
        }
    };
    INVOICENUMBER      @Common: {
        ValueListWithFixedValues: false,
        title                   : 'Invoice Number',
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListINVOICENUMBER',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: INVOICENUMBER,
                    ValueListProperty: 'INVOICENUMBER'
                }
            ]
        }
    };
   
}

annotate service.ticketstatusreport with @(UI.HeaderInfo: {
    $Type         : 'UI.HeaderInfoType',
    TypeName      : 'Ticket Status Report',
    TypeNamePlural: 'Ticket Status Report'
});
