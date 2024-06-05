/**
  *
  * @param {Object} db - Database connection
  * @param {String} email - Email
  * @returns {Object} - JSON Object with fields status, message and data (Array of User Details).
*/
exports.getUserDetails = async (db, email) => {
    try {
      if (!db) throw new Error('DB Connection is required');
  
      if (!email) return {
        status: 'FAILED',
        message: 'email is required',
        data: {},
      };
  
      const query = `SELECT COMPANYUSERS.COMPANYID, COMPANYUSERS.LOGINEMAIL, COMPANYUSERS.FIRSTNAME, COMPANYUSERS.LASTNAME, COMPANYUSERS.MOBILE FROM COMPANYUSERS WHERE LOGINEMAIL = ? AND STATUS != ? AND STATUS != 'X'`;
      const companyUsers = (await db.exec(query,[email,'D']))[0]
  
      return {
        status: 'SUCCESS',
        message: 'Query executed successfully',
        data: companyUsers,
      };

    } catch (error) {
      return {
        status: 'FAILED',
        message: 'Query execution failed. ' + error,
        data: {},
      };
    }
}

/**
  *
  * @param {Object} db - Database connection
  * @param {String} countryCode - Country code
  * @returns {Object} - JSON Object with fields status, message and data (Array of User Details).
*/
exports.getCountryFromCompany = async (db, countryCode) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    if (!countryCode) return {
      status: 'FAILED',
      message: 'Country Code is required',
      data: {},
    };

    const query = `SELECT * FROM COMPANYMASTER WHERE CONSULATEEMBASSYCOUNTRY_CODE = ? AND STATUS != 'X'`;
    const companyUsers = (await db.exec(query,[countryCode]))[0]

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: companyUsers,
    };

  } catch (error) {
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: {},
    };
  }
}

/**
  *
  * @param {Object} db - Database connection
  * @param {String} iataCode - IATA Number
  * @returns {Object} - JSON Object with fields status, message and data (Array of User Details).
*/
exports.getIATAFromCompany = async (db, iataCode) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    if (!iataCode) return {
      status: 'FAILED',
      message: 'IATA Code is required',
      data: {},
    };

    const query = `SELECT * FROM COMPANYMASTER WHERE AGENTCODE = ? AND STATUS != 'X'`;
    const companyUsers = (await db.exec(query,[iataCode]))[0]

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: companyUsers,
    };

  } catch (error) {
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: {},
    };
  }
}

/**
  *
  * @param {Object} db - Database connection
  * @param {String} gstin - GSTIN
  * @returns {Object} - JSON Object with fields status, message and data (Array of User Details).
*/
exports.getGSTINFromCompany = async (db, param1) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    if (!gstin) return {
      status: 'FAILED',
      message: 'GSTIN is required',
      data: {},
    };

    const query = `SELECT * FROM COMPANYMASTER WHERE UNSHORTCODE = ? AND STATUS != 'X'`;
    const companyUsers = (await db.exec(query,[param1]))[0]

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: companyUsers,
    };

  } catch (error) {
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: {},
    };
  }
}


exports.getNameCompany = async (db, countryCode) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    if (!countryCode) return {
      status: 'FAILED',
      message: 'Country is required.',
      data: {},
    };

    const query = `SELECT TOP 1
    LEGALNAMEOFBUSINESS
    FROM CONSULATEEMBASSYMASTER where COUNTRY_CODE =  ?`;
    const companyUsers = (await db.exec(query,[countryCode]))[0]

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: companyUsers,
    };

  } catch (error) {
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: {},
    };
  }
}

exports.getCompanyGstinName = async (db, param1) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    if (!param1) return {
      status: 'FAILED',
      message: 'Company is required',
      data: {},
    };

    const query = `SELECT TOP 1
    LEGALNAMEOFBUSINESS
    FROM UNBODYMASTER where SHORTNAME =  ?`;
    const companyUsers = (await db.exec(query,[param1]))[0]

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: companyUsers,
    };

  } catch (error) {
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: {},
    };
  }
}


exports.getIATACompanyName = async (db, iataCode) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    if (!iataCode) return {
      status: 'FAILED',
      message: 'IATA Code is required',
      data: {},
    };

    const query = `SELECT LEGALNAME, COUNTRY_CODE, REGIONCODE, CITY,POSTALCODE  FROM AGENTMASTER WHERE IATANUMBER = ?`;
    const companyUsers = (await db.exec(query,[iataCode]))[0]

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: companyUsers,
    };

  } catch (error) {
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: {},
    };
  }
}


exports.getUnShortName = async (db, param1) => {
    try {
      if (!db) throw new Error('DB Connection is required');
  
      if (!param1) return {
        status: 'FAILED',
        message: 'UN Short Code is required',
        data: {},
      };
  
      const query = `SELECT * FROM COMPANYMASTER WHERE UNSHORTCODE = ? AND STATUS != 'X'`;
      const companyUsers = (await db.exec(query,[param1]))[0]
  
      return {
        status: 'SUCCESS',
        message: 'Query executed successfully',
        data: companyUsers,
      };
  
    } catch (error) {
      return {
        status: 'FAILED',
        message: 'Query execution failed. ' + error,
        data: {},
      };
    }
  }

/**
  *
  * @param {Object} db - Database connection
  * @param {String} email - Email
  * @returns {Object} - JSON Object with fields status, message and data (Array of User Details).
*/
exports.getUserData = async (db, email) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    if (!email) return {
      status: 'FAILED',
      message: 'email is required',
      data: null,
    };

    const query = `SELECT COMPANYUSERS.COMPANYID, COMPANYUSERS.LOGINEMAIL, COMPANYUSERS.FIRSTNAME, COMPANYUSERS.LASTNAME, COMPANYUSERS.MOBILE FROM COMPANYUSERS WHERE LOGINEMAIL = ?`;
    const companyUsers = (await db.exec(query,[email]))[0]

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: companyUsers,
    };

  } catch (error) {
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: null,
    };
  }
}


