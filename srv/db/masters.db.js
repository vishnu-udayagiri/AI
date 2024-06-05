/**
  *
  * @param {Object} db - Database connection
  * @param {String} countryCode - Country code
  * @returns {<Promise>Objec} - JSON Object with fields status, message and data (Array of Consulate GSTIN Details).
*/
exports.getConsulateGSTINs = async (db, countryCode = '') => {
  try {
    if (!db) throw new Error('DB Connection is required');

    if (!companyId) return {
      status: 'FAILED',
      message: 'Company id is required',
      data: [],
    };


    let data = [];
    if (countryCode) {
      const query = `SELECT * FROM CONSULATEEMBASSYMASTER WHERE COUNTRY_CODE = ?`;
      data = (await db.exec(query, [countryCode]))
    } else {
      const query = `SELECT * FROM CONSULATEEMBASSYMASTER`;
      data = (await db.exec(query))

    }

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: data,
    };
  } catch (error) {
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: [],
    };
  }
}

/**
  *
  * @param {Object} db - Database connection
  * @param {String} countryCode - Country code
  * @returns {<Promise>Objec} - JSON Object with fields status, message and data (Array of Consulate GSTIN Details).
*/
exports.getCountryCodes = async (db, countryCode = '') => {
  try {
    if (!db) throw new Error('DB Connection is required');

    let data = [];
    if (countryCode) {
      const query = `SELECT * FROM SAP_COMMON_COUNTRIES WHERE CODE = ?`;
      data = (await db.exec(query, [countryCode]))
    } else {
      const query = `SELECT * FROM SAP_COMMON_COUNTRIES`;
      data = (await db.exec(query))

    }

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: data,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: [],
    };
  }
}

/**
  *
  * @param {Object} db - Database connection
  * @returns {<Promise>Objec} - JSON Object with fields status, message and data (Array of Consulate GSTIN Details).
*/
exports.getEmbassys = async (db) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    let data = [];

    const query = `SELECT DESCR as	DESCR, CODE as COUNTRY_CODE  FROM SAP_COMMON_COUNTRIES;
    `;

    data = await db.exec(query)

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: data,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: [],
    };
  }
}

/**
  *
  * @param {Object} db - Database connection
  * @param {String} companyId - Company ID
  * @returns {<Promise>Objec} - JSON Object with fields status, message and data (Array of User Details).
*/
exports.getCompanyDetails = async (db, companyId) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    if (!companyId) return {
      status: 'FAILED',
      message: 'Company id is required',
      data: [],
    };

    const query = `SELECT * FROM COMPANYMASTER WHERE ID = ?`;
    const companyUsers = (await db.exec(query, [companyId]))

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: companyUsers,
    };
  } catch (error) {
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: [],
    };
  }
}

exports.unbodies = async (db) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    let data = [];
    const query = `SELECT DISTINCT SHORTNAME , LEGALNAMEOFBUSINESS FROM UNBODYMASTER`;
    const companyUsers = (await db.exec(query))

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: companyUsers,
    };
  } catch (error) {
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: [],
    };
  }
}


exports.getCountryCodesIATA = async (db) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    let data = [];
    const query = `SELECT DISTINCT COUNTRYNAME, COUNTRY_CODE FROM AGENTMASTER`;
    data = (await db.exec(query))

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: data,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: [],
    };
  }
}

/**
*
* @param {Object} db - Database connection
* @param {String} statecode - State code
* @returns {<Promise>Objec} - JSON Object with fields status, message and data.
*/
exports.getPlaceOfSupplyDetails = async (db, statecode) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    if (!statecode) return {
      status: 'FAILED',
      message: 'State code is required',
      data: [],
    };

    let conditions = "";

    if (Array.isArray(statecode) && statecode.length > 0) {
      const numbersList = statecode.map(num => `'${num}'`).join(',');
      conditions = `STATECODE IN (${numbersList})`
    } else if (typeof statecode === 'string' && statecode.trim() !== '') {
      conditions = `STATECODE = '${statecode}'`;
    } else {
      return {
        status: 'FAILED',
        message: 'IATA Number is in incorrect format',
        data: [],
      };
    }

    const query = `SELECT STATECODES.STATECODE, STATECODES.STATENAME FROM STATECODES WHERE ${conditions}`;
    const placeOfSupply = await db.exec(query)

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: placeOfSupply,
    };
  } catch (error) {
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: [],
    };
  }
}