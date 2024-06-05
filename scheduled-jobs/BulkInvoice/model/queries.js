module.exports = {
  getJobEnabledStatus: (client) => `SELECT
  ISBULKINVOICEENABLED
  FROM APPCONFIG 
  WHERE COMPANY = '${client}'`,
  getInvoiceDetails: (count) => `SELECT TOP ${count}
  INV.ID,
  INV.PNR,
  CASE 
      WHEN c2.conjunctivedocumentnbr IS NULL THEN INV.TICKETNUMBER
      ELSE INV.TICKETNUMBER || ' / ' || c2.conjunctivedocumentnbr 
  END AS TICKETNUMBER,
  INV.SUPPLIERGSTIN,
  INV.PASSENGERGSTIN,
  INV.INVOICEDATE,
  (SELECT MAX(TICKETNUMBER) FROM INVOICE WHERE INVOICENUMBER=INV.ORIGINALINVOICENUMBER) AS ORIGINALDOCUMENTNBR,
  INV.INVOICENUMBER,
  INV.DOCUMENTTYPE,
  INV.SECTIONTYPE,
  INV.B2B,
  INV.IATANUMBER,
  INV.ORIGINALINVOICENUMBER,
  INV.ORGINALINVOICEDATE,
  INV.ISSUEINDICATOR,
  INV.FULLROUTING,
  INV.DIRECTIONINDICATOR,
  INV.PLACEOFSUPPLY,
  INV.TAXABLECALCULATION,
  INV.NONTAXABLECALCULATION,
  INV.NETTAXABLEVALUE AS INVOICENETTAXABLE,
  INV.TOTALTAX,
  INV.PASSANGERNAME,
  INV.BILLTONAME,
  INV.BILLTOFULLADDRESS,
  INV.TRANSACTIONCODE,
  INV.TRANSACTIONTYPE,
  INV.BILLTOSTATECODE,
  ITEM.INVOICESLNO,
  ITEM.HSNCODE,
  ITEM.VALUEOFSERVICE,
  ITEM.TAXABLE,
  ITEM.NONTAXABLE,
  ITEM.TOTALTAXABLEVALUE,
  ITEM.DISCOUNT,
  ITEM.NETTAXABLEVALUE,
  ITEM.CGSTRATE,
  ITEM.SGSTRATE,
  ITEM.UTGSTRATE,
  ITEM.IGSTRATE,
  ITEM.COLLECTEDCGST,
  ITEM.COLLECTEDSGST,
  ITEM.COLLECTEDIGST,
  ITEM.COLLECTEDUTGST,
  CASE
      WHEN ACD.USEDFORINVOICE IS NOT NULL THEN ACD.USEDFORINVOICE
      ELSE ACD.ADDRESS
  END AS AIRPORTCODES_ADDRESS,
  CMP.DESCRIPTION AS COMPANY_DESCRIPTION,
  CGA.ADDRESS AS COMPANYGSTIN_ADDRESS,
  COALESCE(InSig.signaturefile, NULL) AS SIGNATUREFILE,
  COALESCE(InSig.MIMETYPE, NULL) AS MIMETYPE,
  INV.invoicedate,
  InSig.ValidFrom,
  InSig.ValidTill,
  INV.COMPANY,
  APPCONFIG.SENDPDFTOREGISTEREDEMAIL, 
  APPCONFIG.SENDPDFTOPASSENGEREMAIL, 
  APPCONFIG.SENDPDFTOUSERGSTINEMAIL,
  InSig.Company
FROM
  INVOICE AS INV
INNER JOIN INVOICEITEMS AS ITEM ON ITEM.INVOICE_ID = INV.ID
INNER JOIN AIRPORTCODES AS ACD ON ACD.COMPANY = INV.COMPANY AND ACD.AIRPORTCODE = INV.AIRPORTCODE
INNER JOIN COMPANY AS CMP ON CMP.CODE = INV.COMPANY
LEFT OUTER JOIN COMPANYGSTINADRESSES AS CGA ON CGA.GSTIN = INV.PASSENGERGSTIN AND CGA.USEFORINVOICEPRINTING=true
INNER JOIN APPCONFIG ON APPCONFIG.COMPANY=INV.COMPANY
INNER JOIN InvoiceSignatory AS InSig ON INV.COMPANY = InSig.COMPANY
  AND COALESCE(InSig.ValidTill, '9999-12-31') >= INV.invoicedate
  AND InSig.ValidFrom IN (
      SELECT MAX(ValidFrom) 
      FROM InvoiceSignatory AS IM
      WHERE IM.Company = INV.Company
      AND IM.ValidFrom <= INV.invoicedate
      AND COALESCE(InSig.ValidTill, '9999-12-31') >= INV.invoicedate
  )
LEFT OUTER JOIN (
  SELECT DISTINCT id, primarydocumentnbr, conjunctivedocumentnbr 
  FROM coupon
  WHERE conjunctivedocumentnbr != primarydocumentnbr
) AS c2 ON c2.id = INV.documentid
WHERE STATUS = 'NEW' AND B2B='1'
ORDER BY INV.ID;`,

  nextRecord: (id) => `SELECT COUNT(*) AS COUNT
    FROM INVOICEITEMS
    WHERE INVOICE_ID='${id}';`,

  getLastNRows: (n, totalCount) => `SELECT 
  INV.ID,
  INV.PNR,
  CASE 
      WHEN c2.conjunctivedocumentnbr IS NULL THEN INV.TICKETNUMBER
      ELSE INV.TICKETNUMBER || ' / ' || c2.conjunctivedocumentnbr 
  END AS TICKETNUMBER,
  INV.SUPPLIERGSTIN,
  INV.PASSENGERGSTIN,
  INV.INVOICEDATE,
  INV.INVOICENUMBER,
  INV.DOCUMENTTYPE,
  INV.SECTIONTYPE,
  INV.B2B,
  INV.IATANUMBER,
  INV.ORIGINALINVOICENUMBER,
  INV.ORGINALINVOICEDATE,
  INV.ISSUEINDICATOR,
  INV.FULLROUTING,
  INV.DIRECTIONINDICATOR,
  INV.PLACEOFSUPPLY,
  INV.TAXABLECALCULATION,
  INV.NONTAXABLECALCULATION,
  INV.NETTAXABLEVALUE AS INVOICENETTAXABLE,
  INV.TOTALTAX,
  INV.PASSANGERNAME,
  INV.BILLTONAME,
  INV.BILLTOFULLADDRESS,
  INV.TRANSACTIONCODE,
  INV.TRANSACTIONTYPE,
  INV.BILLTOSTATECODE,
  ITEM.INVOICESLNO,
  ITEM.HSNCODE,
  ITEM.VALUEOFSERVICE,
  ITEM.TAXABLE,
  ITEM.NONTAXABLE,
  ITEM.TOTALTAXABLEVALUE,
  ITEM.DISCOUNT,
  ITEM.NETTAXABLEVALUE,
  ITEM.CGSTRATE,
  ITEM.SGSTRATE,
  ITEM.UTGSTRATE,
  ITEM.IGSTRATE,
  ITEM.COLLECTEDCGST,
  ITEM.COLLECTEDSGST,
  ITEM.COLLECTEDIGST,
  ITEM.COLLECTEDUTGST,
  CASE
      WHEN ACD.USEDFORINVOICE IS NOT NULL THEN ACD.USEDFORINVOICE
      ELSE ACD.ADDRESS
  END AS ADDRESS,
  CMP.DESCRIPTION AS COMPANY_DESCRIPTION,
  CGA.ADDRESS AS COMPANYGSTIN_ADDRESS,
  COALESCE(InSig.signaturefile, NULL) AS signaturefile,
  INV.invoicedate,
  InSig.ValidFrom,
  InSig.ValidTill,
  INV.COMPANY,
  APPCONFIG.SENDPDFTOREGISTEREDEMAIL, 
  APPCONFIG.SENDPDFTOPASSENGEREMAIL, 
  APPCONFIG.SENDPDFTOUSERGSTINEMAIL,
  InSig.Company
FROM
  INVOICE AS INV
INNER JOIN INVOICEITEMS AS ITEM ON ITEM.INVOICE_ID = INV.ID
INNER JOIN AIRPORTCODES AS ACD ON ACD.COMPANY = INV.COMPANY AND ACD.AIRPORTCODE = INV.AIRPORTCODE
INNER JOIN COMPANY AS CMP ON CMP.CODE = INV.COMPANY
LEFT OUTER JOIN COMPANYGSTINADRESSES AS CGA ON CGA.GSTIN = INV.PASSENGERGSTIN AND CGA.USEFORINVOICEPRINTING=true
INNER JOIN APPCONFIG ON APPCONFIG.COMPANY=INV.COMPANY
INNER JOIN InvoiceSignatory AS InSig ON INV.COMPANY = InSig.COMPANY
  AND COALESCE(InSig.ValidTill, '9999-12-31') >= INV.invoicedate
  AND InSig.ValidFrom IN (
      SELECT MAX(ValidFrom) 
      FROM InvoiceSignatory AS IM
      WHERE IM.Company = INV.Company
      AND IM.ValidFrom <= INV.invoicedate
      AND COALESCE(InSig.ValidTill, '9999-12-31') >= INV.invoicedate
  )
LEFT OUTER JOIN (
  SELECT DISTINCT id, primarydocumentnbr, conjunctivedocumentnbr 
  FROM coupon
  WHERE conjunctivedocumentnbr != primarydocumentnbr
) AS c2 ON c2.id = INV.documentid
WHERE STATUS = 'NEW' AND B2B='1'
ORDER BY INV.ID
LIMIT ${n} OFFSET ${totalCount};`,

  upsertInvoicePdf: (invoiceDetails) => `MERGE INTO INVOICEDOCUMENTS AS target
    USING (
        SELECT 
            '${invoiceDetails.COMPANYCODE}' AS INVOICE_COMPANY, 
            '${invoiceDetails.ID}' AS INVOICE_ID, 
            'Invoice-${invoiceDetails.INVOICENUMBER}' AS FILENAME,
            '${invoiceDetails.FILE}' AS FILE
        FROM DUMMY
    ) AS source
    ON target.INVOICE_COMPANY = source.INVOICE_COMPANY AND target.INVOICE_ID = source.INVOICE_ID
    WHEN MATCHED THEN
      UPDATE SET 
        target.FILENAME = source.FILENAME,
        target.FILE = source.FILE
    WHEN NOT MATCHED THEN
      INSERT (
        INVOICE_COMPANY,
        CREATEDAT,
        CREATEDBY, 
        INVOICE_ID, 
        DOCUMENTSLNO,
        FILENAME,
        FILE
      ) VALUES (
        source.INVOICE_COMPANY,
        CURRENT_DATE,
        'Bulk Generation Tool',
        source.INVOICE_ID, 
        1, -- Set DOCUMENTSLNO to 1 for every new record
        source.FILENAME,
        source.FILE
      );`,

  updateStatusOfInvoice: (ID) => `UPDATE INVOICE
    SET STATUS = 'C'
    WHERE ID = '${ID}';`,

  getAdminEmails: (idArray) => `SELECT ID,LOGINEMAIL AS EMAIL
   FROM (
       SELECT 
           invoice.ID, cu.COMPANYID, cu.LOGINEMAIL,company.COMPANYPAN,PASSENGERGSTIN,
           ROW_NUMBER() OVER (PARTITION BY cu.COMPANYID ORDER BY cu.ID) AS RowNum
       FROM COMPANYUSERS cu
       INNER JOIN COMPANYUSERROLES cur ON cur.COMPANYID = cu.COMPANYID AND cur.USERID = cu.ID
       INNER JOIN COMPANYMASTER company ON company.ID=cur.COMPANYID
       INNER JOIN INVOICE ON SUBSTRING(INVOICE.PASSENGERGSTIN,2,10)=COMPANY.COMPANYPAN
       WHERE cur.ISADMIN = true and companypan IS NOT NULL AND companypan!='' AND INVOICE.ID IN ('${idArray.join("', '")}')
   ) AS Ranked
   WHERE RowNum = 1;`,

  getSbrEmails: (idArray) => `SELECT INVOICE.ID,SBR.GSTEMAIL AS EMAIL
 FROM SBR
 INNER JOIN INVOICE ON INVOICE.TICKETNUMBER=SBR.PRIMARYDOCUMENTNBR AND INVOICE.COMPANY=SBR.COMPANY
 WHERE SBR.GSTEMAIL IS NOT NULL AND INVOICE.ID IN ('${idArray.join("', '")}')`,

  getCompanyEmails: (idArray) => `SELECT 
       STRING_AGG(Email, ',') AS Email,
       CompanyName
   FROM (
       SELECT DISTINCT 
           ca.EMAIL AS Email,
           i.COMPANY AS CompanyName
       FROM 
           COMPANYADMIN ca
       INNER JOIN 
           INVOICE i ON i.COMPANY = ca.COMPANY
        WHERE i.ID IN ('${idArray.join("', '")}')
   )
   GROUP BY 
       CompanyName;`,

  getMailSendConfirmation: (id) => `SELECT 
  SENDPDFTOREGISTEREDEMAIL, SENDPDFTOPASSENGEREMAIL, SENDPDFTOUSERGSTINEMAIL 
  FROM APPCONFIG 
  WHERE COMPANY = '${id}'`,
  updateEmailStatusOfInvoice: (ID) => `UPDATE INVOICE
    SET EMAILSEND  = true
    WHERE ID = '${ID}';`
}