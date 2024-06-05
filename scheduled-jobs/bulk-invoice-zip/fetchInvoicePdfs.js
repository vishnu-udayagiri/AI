module.exports = {
    invoicePdf: (connection, filter) => {
      let baseQuery = `SELECT FILENAME,FILE FROM INVOICEDOCUMENTS
      INNER JOIN INVOICE ON INVOICE.ID= INVOICEDOCUMENTS.INVOICE_ID
      WHERE `;
      let subQuery = [];
      //process the filter
      if (filter.from != "")
        subQuery.push(`INVOICE.INVOICEDATE >='${filter.from}'`);
      if (filter.to != "") subQuery.push(`INVOICE.INVOICEDATE <='${filter.to}'`);
      if (filter.iataNumber != "") subQuery.push(`INVOICE.IATANUMBER ='${filter.iataNumber}'`); 
      if (filter.supplierGSTIN != "") subQuery.push(`INVOICE.SUPPLIERGSTIN='${filter.supplierGSTIN}'`); 
      baseQuery+= subQuery.join(' AND ');
      let filesToMerge=connection.exec(baseQuery);
      return filesToMerge;
    },
  };