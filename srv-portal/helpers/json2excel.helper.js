const ExcelJS = require('exceljs');
// const fs = require('fs-extra');
// const fastcsv = require('fast-csv');
// const path = require('path');
module.exports = {


// jsonToCSV :async (jsonArray) => {

//     return new Promise((resolve, reject) => {
    
//       const filePath = path.join(__dirname, "sample.csv");

      
//       fs.ensureFileSync(filePath);

//         const writeStream = fs.createWriteStream(filePath);
//         const csvStream = fastcsv.format({ headers: true, quoteColumns: true, rowDelimiter:'\r\n' });

//         csvStream.pipe(writeStream)
//         .on('finish', () => {
            
//             resolve(true);
//         })
//         .on('error', (err) => {
        
//             reject(false);
//         });

//     jsonArray.forEach(row => {
//         csvStream.write(row);
//     });

//     csvStream.end();

//     })





   

// },
jsonToExcelBase64: async (jsonArray, columns, batchSize = 1000) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');

  let headers;
  if (columns) {
    headers = Object.values(columns);
  } else {
    headers = Object.keys(jsonArray[0]);
  }

  worksheet.addRow(headers);

 
  for (let i = 0; i < jsonArray.length; i += batchSize) {
    const batch = jsonArray.slice(i, i + batchSize);
    batch.forEach((item) => {
      let row;
      if (columns) {
        row = Object.keys(columns).map((key) => (key in item ? item[key] : ""));
      } else {
        row = Object.values(item);
      }
      worksheet.addRow(row);
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = buffer.toString('base64');
  return base64;
}
,
  jsonArrayToExcel: async(jsonArray) => {
    // Create a new workbook and add a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    // Add headers to the worksheet based on the keys of the first object in the array
    const headers = Object.keys(jsonArray[0]);
    worksheet.addRow(headers);

    // Add data to the worksheet
    jsonArray.forEach((item) => {
      const rowValues = headers.map((key) => item[key]);
      worksheet.addRow(rowValues);
    });

    // Return the workbook as base64
    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = buffer.toString('base64');
    return base64;
  }
};