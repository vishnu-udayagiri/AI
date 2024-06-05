const ExcelJS = require('exceljs');

exports.jsonToExcelBase64 = async (jsonArray, columns) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');
  
    let headers;
    if (columns) {
      headers = Object.values(columns);
    } else {
      headers = Object.keys(jsonArray[0]);
    }
  
    worksheet.addRow(headers);
  
    jsonArray.forEach((item) => {
      let row;
      if (columns) {
        row = Object.keys(columns).map((key) => (key in item ? item[key] : undefined));
      } else {
        row = Object.values(item);
      }
      worksheet.addRow(row);
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = buffer.toString('base64');
    return base64;
  };