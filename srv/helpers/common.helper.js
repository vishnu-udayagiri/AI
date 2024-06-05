const excel = require('excel4node');

exports.getFiscalYearBounds = (date) => {
  let fiscalYearStart, fiscalYearEnd;
  if (date.getMonth() < 3) {
    fiscalYearStart = new Date(date.getFullYear() - 1, 3, 1);
    fiscalYearEnd = new Date(date.getFullYear(), 2, 31);
  } else {
    fiscalYearStart = new Date(date.getFullYear(), 3, 1);
    fiscalYearEnd = new Date(date.getFullYear() + 1, 2, 31);
  }
  return {
    start: fiscalYearStart,
    end: fiscalYearEnd,
  };
};


exports.getFinancialYearDates = (year) => {

  try {
    year = Number(year);
  } catch (error) {
    const currentYear = new Date().getFullYear();
    return {
      start: new Date(currentYear, 3, 1),
      stop: new Date(currentYear+1, 2, 31)
    };
  }

  if (typeof year !== 'number' || year < 1900 || year > 9999) {
    return {
      start: new Date(0),
      stop: new Date(0)
    };
  }

  let startYear, endYear;

  if (year === 0) {
    startYear = year - 1;
    endYear = year;
  } else {
    startYear = year;
    endYear = year + 1;
  }

  return {
    start: new Date(startYear, 3, 1),
    stop: new Date(endYear, 2, 31)
  };
}

exports.isValidValue = (value) => {
  if (value === "" || value === null || value === undefined) return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

exports.sanitizeObject = (jsonObject) => {
  const sanitizedObject = {};
  
  Object.keys(jsonObject)?.forEach((key) => {
    const sanitizedKey = key.toLowerCase().replace(/[^a-z0-9]/gi, '');
    sanitizedObject[sanitizedKey] = jsonObject[key];
  });
  
  return sanitizedObject;
}

exports.getKeyByValue = (object, value) => {
  const sanitizeString = (str) => {
      return str.toLowerCase().replace(/[^a-z0-9]/gi, '');
  };
  const sanitizedValue = sanitizeString(value);
  return Object.keys(object).find(key => sanitizeString(object[key]) === sanitizedValue);
}

exports.isValidGSTIN = (gstin) =>{
  const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[0-9A-Z]{2}$/;
  return gstinPattern.test(gstin);
}


exports.formatHeaderCell =(color) => {

  const workBook = new excel.Workbook()

  return workBook.createStyle({
      border: {
          left: {
              style: 'thin',
              color: 'black',
          },
          right: {
              style: 'thin',
              color: 'black',
          },
          top: {
              style: 'thin',
              color: 'black',
          },
          bottom: {
              style: 'thin',
              color: 'black',
          },
          outline: false,
      },
      alignment:{horizontal:'center'},
      font: { color: "black", size: 12, bold: true },
      fill: {
          type: 'pattern',
          fgColor: color,
          patternType: 'solid',
      }
  });
}

exports.validateAmendmentDate = (inputDate) => {

  try {

    const dateParts = inputDate.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
  
    const invoiceDate = new Date(year, month, day);
    const invoicedYear = invoiceDate.getFullYear();
    const currentYear = new Date().getFullYear();

    const yearGap = currentYear - invoicedYear;

    if(yearGap > 1 || yearGap < 0) {
      return false;
    }

    let validationStartDate;
    let validationEndDate;
  
    
    if(month<=9 || year != currentYear){
      validationEndDate = new Date(currentYear, 9, 31);
    }else{
      validationEndDate = new Date(currentYear+1,9,31);
    }

    validationStartDate = new Date(validationEndDate)
    validationStartDate = new Date(validationStartDate.setMonth(validationStartDate.getMonth()-18))

    if((month<3 && year<currentYear)|| (month==3 && year<currentYear)){
      validationStartDate = new Date(validationStartDate.setMonth(3))
      validationStartDate = new Date(validationStartDate.setDate(1))
    }


    if (invoiceDate >= validationStartDate && invoiceDate <= validationEndDate) {
        return true;
    } else {
        return false;
    }


  } catch (error) {
    return false;
  }



}