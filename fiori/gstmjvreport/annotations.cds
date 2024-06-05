using GSTMJVService as service from '../../srv/GSTMJVReport-Service';

@UI.DeleteHidden: true
annotate service.GSTMJVReport with @(
    UI.LineItem       : [
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'DOCNO',
        //     Value: DOCNO,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Seq number',
        //     Value: seqNumber,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Document Date',
        //     Value: DocumentDate,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Document Type',
        //     Value: Documenttype,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Company Code',
        //     Value: CompanyCode,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Posting Date',
        //     Value: PostingDate,
        // },
        {
            $Type: 'UI.DataField',
            Label: 'Transaction Type',
            Value: Transaction_Type,
        },

        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Exchange Rate Direct Quotation',
        //     Value: Exchange_Rate_Direct_Quotation,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Reference',
        //     Value: Reference,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Document Header Text',
        //     Value: Document_HeaderText,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Translation Date',
        //     Value: TranslationDate,
        // },
        {
            $Type: 'UI.DataField',
            Label: 'Calculate tax automatically',
            Value: Calculate_tax_automatically,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Cross CC No.',
        //     Value: Cross_CC_No,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Trading Partner BA',
        //     Value: Trading_Partner_BA,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Posting Key',
        //     Value: Posting_Key,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Account',
        //     Value: Account,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Special G-L ind',
        //     Value: Special_GL_ind,
        // },

        {
            $Type: 'UI.DataField',
            Label: 'Amount in Document currency',
            Value: Amount_in_Document_currency,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Amount in Local Currency',
        //     Value: Amount_in_Local_Currency,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Currency',
        //     Value: Currency,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Business Place',
        //     Value: Business_Place,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Section Code',
        //     Value: Section_Code,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Credit control area',
        //     Value: Credit_control_area,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Invoice Reference',
        //     Value: Invoice_Reference,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Fiscal Year of the Relevant Invoice',
        //     Value: Fiscal_Year_of_the_Relevant_Invoice,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Line Item in Relevant Invoice',
        //     Value: Line_Item_in_Relevant_Invoice,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Assignment number',
        //     Value: Assignment_number,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Text',
        //     Value: Text,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Business Area',
        //     Value: Business_Area,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Cost Centre',
        //     Value: Cost_Centre,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'WBS Element',
        //     Value: WBS_Element,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Terms of payment key',
        //     Value: Terms_of_payment_key,
        // },
        {
            $Type: 'UI.DataField',
            Label: 'Payment Block Key',
            Value: Payment_Block_Key,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Profit Center',
        //     Value: Profit_Center,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Baseline Date',
        //     Value: Baseline_Date,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Internal Order',
        //     Value: Internal_Order,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Tax Type (for TDS)',
        //     Value: Tax_Type,
        // },

        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Tax Code (for TDS)',
        //     Value: Tax_Code_TDS,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Withholding Tax Base',
        //     Value: Withholding_Tax_Base,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Withholding Tax Amount',
        //     Value: Withholding_Tax_Amount,
        // },
        {
            $Type: 'UI.DataField',
            Label: 'Quantity',
            Value: Quantity,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Base Unit of Measure',
            Value: Base_Unit_of_Measure,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax code (tax on sales/purchases)',
            Value: Tax_code,
        },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Reference Key 1',
        //     Value: Reference_Key_1,
        // },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Reference Key 2',
        //     Value: Reference_Key_2,
        // },
        {
            $Type: 'UI.DataField',
            Label: 'Reference Key 3',
            Value: Reference_Key_3

        },
    ],
    UI.SelectionFields: [InvoiceDate]

);

annotate service.GSTMJVReport with @(UI.HeaderInfo: {
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

}

);

annotate service.GSTMJVReport with {
    Documenttype @Common: {
        ValueListWithFixedValues: false,
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListDocumentType',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: Documenttype,
                ValueListProperty: 'documentType'
            },

            ]
        }
    };
}
