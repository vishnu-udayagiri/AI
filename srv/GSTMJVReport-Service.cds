using {
    Invoice      as invoice,
    InvoiceItems as invoiceitems
} from '../db/schema';

service GSTMJVService @(path: '/gstmjvservice') {
    entity GSTMJVReport          as
        select
            ''                   as DOCNO                               : String(15),
            ''                   as seqNumber                           : Integer,
            invoiceDate          as InvoiceDate,
            ''                   as DocumentDate                        : Date       @title: 'Document Date',
            ''                   as Documenttype                        : String(2),
            ''                   as CompanyCode                         : String(25),
            ''                   as PostingDate                         : Date       @title: 'Posting Date',
            'INR'                as Currency                            : String(10),
            ''                   as Exchange_Rate_Direct_Quotation      : Decimal(14, 2),
            ''                   as Reference                           : String(16),
            ''                   as Document_HeaderText                 : String(25),
            ''                   as TranslationDate                     : Date,
            ''                   as Calculate_tax_automatically         : Boolean,
            ''                   as Cross_CC_No                         : String(16),
            ''                   as Trading_Partner_BA                  : String(4),
            ''                   as Posting_Key                         : String(2),
            ''                   as Account                             : String(10),
            ''                   as Special_GL_ind                      : String(3),
            max(transactionType) as Transaction_Type                    : String(20) @title: 'Transaction Type',
            SUM(
                invoiceitems.netTaxableValue
            )+SUM(
                invoiceitems.collectedCgst
            )+SUM(
                invoiceitems.collectedSgst
            )+SUM(
                invoiceitems.collectedutgst
            )+SUM(
                invoiceitems.collectedIgst
            )+SUM(
                invoiceitems.nonTaxable,
            )                    as Amount_in_Document_currency         : Decimal(14, 2),
            ''                   as Amount_in_Local_Currency            : Decimal(14, 2),
            ''                   as Business_Place                      : String(4),
            ''                   as Section_Code                        : String(20) @title: 'Section Code ',
            ''                   as Credit_control_area                 : String(4),
            ''                   as Invoice_Reference                   : String(10),
            ''                   as Fiscal_Year_of_the_Relevant_Invoice : String(4),
            ''                   as Line_Item_in_Relevant_Invoice       : String(3),
            ''                   as Assignment_number                   : String(18),
            ''                   as Text                                : String(50),
            ''                   as Business_Area                       : String(4),
            ''                   as Cost_Centre                         : String(10),
            ''                   as WBS_Element                         : String(24),
            ''                   as Terms_of_payment_key                : String(4),
            ''                   as Payment_Block_Key                   : Boolean,
            ''                   as Profit_Center                       : String(25),
            ''                   as Baseline_Date                       : Date,
            ''                   as Internal_Order                      : String(10),
            ''                   as Tax_Type                            : String(40),
            ''                   as Tax_Code_TDS                        : String(2),
            ''                   as Withholding_Tax_Base                : String(15),
            ''                   as Withholding_Tax_Amount              : String(15),
            '1'                  as Quantity                            : String(25),
            'OTH'                as Base_Unit_of_Measure                : String(25),
            max(
                invoice.taxCode
            )                    as Tax_code                            : String(2),
            ''                   as Reference_Key_1                     : String(12),
            ''                   as Reference_Key_2                     : String(12),
            supplierGSTIN        as Reference_Key_3
        from invoice as invoice
        inner join invoiceitems
            on invoiceitems.invoice.ID = ID

        where
                invoice.supplierGSTIN is not null
            and invoice.invoiceDate   is not null
        group by
            supplierGSTIN,
            invoiceDate
        order By
            Reference_Key_3;

    entity valueListDocumentType as select distinct documentType from invoice;
    function getCSRFToken()             returns String;
    action   exportAll(fields : String) returns String;
}
