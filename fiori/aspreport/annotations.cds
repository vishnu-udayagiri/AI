using ASPReportService as service from '../../srv/aspReport-Service';

@UI.DeleteHidden: true
annotate service.aspReport with @(
    UI.HeaderInfo                                : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'ASP Report',
        TypeNamePlural: 'ASP Report',
        Title         : {
            $Type: 'UI.DataField',
            Value: Division,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: Division,
        },
    },
    UI.LineItem                            : [
        {
            $Type: 'UI.DataField',
            Label: 'Type',
            Value: type,
            ![@HTML5.CssDefaults]: {width: '90px'}
        },
        {
            $Type: 'UI.DataField',
            Label: 'Source Identifier',
            Value: SourceIdentifier,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Source File Name',
            Value: SourceFileName,
            ![@HTML5.CssDefaults]: {width: '100px'}
        },
        {
            $Type: 'UI.DataField',
            Label: 'GL Account Code',
            Value: GLAccountCode,

        },
        {
            $Type: 'UI.DataField',
            Label: 'Division',
            Value: Division,

        },
        {
            $Type: 'UI.DataField',
            Label: 'Sub Division',
            Value: SubDivision,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Profit Centre 1',
            Value: ProfitCentre1,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Profit Centre 2',
            Value: ProfitCentre2,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Plant Code',
            Value: PlantCode,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Return Period',
            Value: ReturnPeriod,
            ![@HTML5.CssDefaults]: {width: '120px'}
        },
        {
            $Type: 'UI.DataField',
            Label: 'Supplier GSTIN',
            Value: supplierGSTIN,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Document Type',
            Value: DocumentType,
            ![@HTML5.CssDefaults]: {width: '120px'}
        },
        {
            $Type: 'UI.DataField',
            Label: 'Supply Type',
            Value: SupplyType,
            ![@HTML5.CssDefaults]: {width: '120px'}
        },
        {
            $Type: 'UI.DataField',
            Label: 'Document Number',
            Value: DocumentNumber,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Document Date',
            Value: DocumentDate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Original Document Number',
            Value: OriginalDocumentNumber,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Original Document Date',
            Value: OriginalDocumentDate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'CRDR Pre GST',
            Value: CRDRPreGST,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Line Number',
            Value: LineNumber,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Customer GSTIN',
            Value: CustomerGSTIN,
        },
        {
            $Type: 'UI.DataField',
            Label: 'UIN or Composition',
            Value: UINorComposition,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Original Customer GSTIN',
            Value: OriginalCustomerGSTIN,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Customer Name',
            Value: CustomerName,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Customer Code',
            Value: CustomerCode,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Bill To State',
            Value: BillToState,
            ![@HTML5.CssDefaults]: {width: '90px'}
        },
        {
            $Type: 'UI.DataField',
            Label: 'Ship To State',
            Value: ShipToState,
        },
        {
            $Type: 'UI.DataField',
            Label: 'POS',
            Value: POS,
            ![@HTML5.CssDefaults]: {width: '90px'}
        },
        {
            $Type: 'UI.DataField',
            Label: 'Port Code',
            Value: PortCode,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Shipping Bill Number',
            Value: ShippingBillNumber,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Shipping Bill Date',
            Value: ShippingBillDate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'FOB',
            Value: FOB,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Export Duty',
            Value: ExportDuty,
        },
        {
            $Type: 'UI.DataField',
            Label: 'HSN or SAC',
            Value: HSNorSAC,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Product Code',
            Value: ProductCode,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Product Description',
            Value: ProductDescription,
            ![@HTML5.CssDefaults]: {width: '120px'}
        },
        {
            $Type: 'UI.DataField',
            Label: 'Category Of Product',
            Value: CategoryOfProduct,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Unit Of Measurement',
            Value: UnitOfMeasurement,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Quantity',
            Value: Quantity,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Taxable Value',
            Value: TaxableValue,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Integrated Tax Rate',
            Value: IntegratedTaxRate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Integrated Tax Amount',
            Value: IntegratedTaxAmount,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Central Tax Rate',
            Value: CentralTaxRate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Central Tax Amount',
            Value: CentralTaxAmount,
        },
        {
            $Type: 'UI.DataField',
            Label: 'State UT Tax Rate',
            Value: StateUTTaxRate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'State UT Tax Amount',
            Value: StateUTTaxAmount,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Cess Rate Advalorem',
            Value: CessRateAdvalorem,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Cess Amount Advalorem',
            Value: CessAmountAdvalorem,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Cess Rate Specific',
            Value: CessRateSpecific,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Cess Amount Specific',
            Value: CessAmountSpecific,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Invoice Value',
            Value: InvoiceValue,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reverse Charge Flag',
            Value: ReverseChargeFlag,
        },
        {
            $Type: 'UI.DataField',
            Label: 'TCS Flag',
            Value: TCSFlag,
            ![@HTML5.CssDefaults]: {width: '90px'}
        },
        {
            $Type: 'UI.DataField',
            Label: 'eCom GSTIN',
            Value: eComGSTIN,
        },
        {
            $Type: 'UI.DataField',
            Label: 'ITC Flag',
            Value: ITCFlag,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reason For Credit Debit Note',
            Value: ReasonForCreditDebitNote,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Accounting Voucher Number',
            Value: AccountingVoucherNumber,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Accounting Voucher Date',
            Value: AccountingVoucherDate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Userdefined Field 1',
            Value: Userdefinedfield1,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Userdefined Field 2',
            Value: Userdefinedfield2,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Userdefined Field 3',
            Value: Userdefinedfield3,
        },
                {
            $Type: 'UI.DataField',
            Label: 'Record Type',
            Value: RecordType,
        },
    ],
    UI.SelectionFields                           : [

        supplierGSTIN,
        DocumentNumber,
        DocumentDate,
        CustomerGSTIN,
        SupplyType,
        ReturnPeriod
        
    ],
    UI.SelectionPresentationVariant #SVB2BInvoice: {
        $Type              : 'UI.SelectionPresentationVariantType',
        Text               : 'INV',
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            Text         : 'List Orders',
            SelectOptions: [{
                $Type       : 'UI.SelectOptionType',
                PropertyName: type,
                Ranges      : [{
                    $Type : 'UI.SelectionRangeType',
                    Sign  : #I,
                    Option: #EQ,
                    Low   : 'INV',
                }, ],
            }, ],
        },
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.LineItem', ],
        },
    },
    UI.SelectionPresentationVariant #SVB2BCredit : {
        $Type              : 'UI.SelectionPresentationVariantType',
        Text               : 'CRDR',
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            Text         : 'List Orders',
            SelectOptions: [{
                $Type       : 'UI.SelectOptionType',
                PropertyName: type,
                Ranges      : [{
                    $Type : 'UI.SelectionRangeType',
                    Sign  : #I,
                    Option: #EQ,
                    Low   : 'CRDR',
                }, ],
            }, ],
        },
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.LineItem' ],
        },
    },
        UI.SelectionPresentationVariant #SVB2CInvoice: {
        $Type              : 'UI.SelectionPresentationVariantType',
        Text               : 'B2C NEG',
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            Text         : 'List Orders',
            SelectOptions: [{
                $Type       : 'UI.SelectOptionType',
                PropertyName: type,
                Ranges      : [{
                    $Type : 'UI.SelectionRangeType',
                    Sign  : #I,
                    Option: #EQ,
                    Low   : 'B2C NEG',
                }, ],
            }, ],
        },
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.LineItem' ],
        },
    },
            UI.SelectionPresentationVariant #SVB2CCredit: {
        $Type              : 'UI.SelectionPresentationVariantType',
        Text               : 'B2C',
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            Text         : 'List Orders',
            SelectOptions: [{
                $Type       : 'UI.SelectOptionType',
                PropertyName: type,
                Ranges      : [{
                    $Type : 'UI.SelectionRangeType',
                    Sign  : #I,
                    Option: #EQ,
                    Low   : 'B2C',
                }, ],
            }, ],
        },
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.LineItem', ],
        },
    }
);

// @UI.DeleteHidden: true
// annotate service.aspReportB2C with @(
//     UI.HeaderInfo                                : {
//         $Type         : 'UI.HeaderInfoType',
//         TypeName      : 'ASP Report',
//         TypeNamePlural: 'ASP Report',
//         Title         : {
//             $Type: 'UI.DataField',
//             Value: Type,
//         },
//         Description   : {
//             $Type: 'UI.DataField',
//             Value: orgSupplierGstin,
//         },
//     },
//     UI.LineItem #b2c                             : [
//         {
//             $Type: 'UI.DataField',
//             Label: 'Type',
//             Value: Type
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Supplier GSTIN',
//             Value: orgSupplierGstin
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'DocumentDate',
//             Value: DocumentDate
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Return Period',
//             Value: ReturnPeriod
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Trancsaction Type',
//             Value: TrancsactionType
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Month',
//             Value: Month
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Org POS',
//             Value: OrgPOS
//         },


//         {
//             $Type: 'UI.DataField',
//             Label: 'Org HSN or SAC',
//             Value: OrgHSNorSAC

//         },
//         {
//             $Type: 'UI.DataField',
//             Label: ' Org Unit Of Measurement',
//             Value: OrgUnitOfMeasurement
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Org Quantity',
//             Value: OrgQuantity
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Org Rate	',
//             Value: OrgRate

//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Org Taxable Value	',
//             Value: OrgTaxableValue

//         },
//         {
//             $Type: 'UI.DataField',
//             Label: ' Org eCom GSTIN',
//             Value: OrgeComGSTIN
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Org eCom Supply Value',
//             Value: OrgeComSupplyValue

//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'New POS',
//             Value: NewPOS

//         },
//         {
//             $Type: 'UI.DataField',
//             Label: ' New HSN or SAC	',
//             Value: NewHSNorSAC

//         },
//         {
//             $Type: 'UI.DataField',
//             Label: ' New Unit Of Measurement',
//             Value: NewUnitOfMeasurement
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'New Quantity',
//             Value: NewQuantity

//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'New Rate',
//             Value: NewRate

//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'New Taxable Value',
//             Value: NewTaxableValue

//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'New eCom GSTIN',
//             Value: NeweComGSTIN

//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'New eCom Supply Value',
//             Value: NeweComSupplyValue

//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Integrated Tax Amount',
//             Value: IntegratedTaxAmount

//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Central Tax Amount',
//             Value: CentralTaxAmount

//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'State UT Tax Amount',
//             Value: StateUTTaxAmount
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Cess Amount',
//             Value: CessAmount
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Total Value',
//             Value: TotalValue
//         },

//     ],
//     UI.SelectionFields                           : [
//         TrancsactionType,
//         orgSupplierGstin
//     ],

//     UI.SelectionPresentationVariant #SVB2CInvoice: {
//         $Type              : 'UI.SelectionPresentationVariantType',
//         Text               : 'B2C',
//         SelectionVariant   : {
//             $Type        : 'UI.SelectionVariantType',
//             Text         : 'B2C',
//             SelectOptions: [{
//                 $Type       : 'UI.SelectOptionType',
//                 PropertyName: Type,
//                 Ranges      : [{
//                     $Type : 'UI.SelectionRangeType',
//                     Sign  : #I,
//                     Option: #EQ,
//                     Low   : 'B2C',
//                 }, ],
//             }, ],
//         },
//         PresentationVariant: {
//             $Type         : 'UI.PresentationVariantType',
//             Visualizations: ['@UI.LineItem#b2c'],
//         },
//     },
//     UI.SelectionPresentationVariant #SVB2CCredit : {
//         $Type              : 'UI.SelectionPresentationVariantType',
//         Text               : 'B2C NEG',
//         SelectionVariant   : {
//             $Type        : 'UI.SelectionVariantType',
//             Text         : 'B2C NEG',
//             SelectOptions: [{
//                 $Type       : 'UI.SelectOptionType',
//                 PropertyName: Type,
//                 Ranges      : [{
//                     $Type : 'UI.SelectionRangeType',
//                     Sign  : #I,
//                     Option: #EQ,
//                     Low   : 'B2CNEG',
//                 }, ],
//             }, ],
//         },
//         PresentationVariant: {
//             $Type         : 'UI.PresentationVariantType',
//             Visualizations: ['@UI.LineItem#b2c'],
//         },
//     }
// );

annotate service.aspReport with {

    supplierGSTIN   @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListsupplierGSTIN',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: supplierGSTIN,
                ValueListProperty: 'supplierGSTIN'
            },

            ]
        }
    }  @title: 'Supplier GSTIN';

    DocumentNumber  @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListDocumentNumber',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: DocumentNumber,
                ValueListProperty: 'invoiceNumber'
            },

            ]
        }
    }  @title: 'Document Number';

    CustomerGSTIN   @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListCustomerGSTIN',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: CustomerGSTIN,
                ValueListProperty: 'passengerGSTIN'
            },

            ]
        }
    }  @title: 'Customer GSTIN';

    DocumentDate    @title : 'Document Date';

       RecordType   @Common: {
        ValueListWithFixedValues: true,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListRecordType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: RecordType,
                ValueListProperty: 'b2b'
            },

            ]
        }
    }  @title: 'Record Type';
     type   @Common: {
        ValueListWithFixedValues: true,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListDocumentType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: type,
                ValueListProperty: 'type'
            },

            ]
        }
    }  @title: 'Type';
        SupplyType   @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListsupplyType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: SupplyType,
                ValueListProperty: 'supplytype'
            },

            ]
        }
    }  @title: 'Supply Type';
            ReturnPeriod   @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListgstR1Period',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: ReturnPeriod,
                ValueListProperty: 'gstR1Period'
            },

            ]
        }
    }  @title: 'GSTR1 Period';
    
}

// annotate service.aspReportB2C with {


//     orgSupplierGstin  @Common: {
//         ValueListWithFixedValues: false,
//         ValueList               : {
//             $Type         : 'Common.ValueListType',
//             CollectionPath: 'valueListsupplierGSTIN',
//             Parameters    : [{
//                 $Type            : 'Common.ValueListParameterInOut',
//                 LocalDataProperty: orgSupplierGstin,
//                 ValueListProperty: 'supplierGSTIN'
//             },

//             ]
//         }
//     }  @title: 'Supplier GSTIN';

// }
