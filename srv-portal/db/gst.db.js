/**
 *
 * @param {Object} db - Database connection
 * @param {String} userId - User ID
 * @returns {<Promise>Objec} - JSON Object with fields status, message and data (default GSTIN Number).
 */
exports.getDefaultGSTIN = async (db, userId) => {
    try {
      if (!db) throw new Error('DB Connection is required');
  
      if (!userId)    return {
        status: 'FAILED',
        message: 'Company id is required',
        data: "",
      };

      const query = `SELECT USERDEFAULTGSTIN.GSTIN FROM USERDEFAULTGSTIN WHERE USERID = '${userId}' AND ISDEFAULT = TRUE`;  
      const gstin = (await db.exec(query))[0].GSTIN;

  
      return {
        status: 'SUCCESS',
        message: 'Query executed successfully',
        data: gstin,
      };
    } catch (error) {
      console.log(error);
      return {
        status: 'FAILED',
        message: 'Query execution failed. ' + error,
        data: "",
      };
    }
  }

  /**
 *
 * @param {Object} db - Database connection
 * @param {String} userId - User ID
 * @returns {<Promise>Objec} - JSON Object with fields status, message and data (Array of GSTIN numbers).
 */
exports.getGSTINs = async (db, userId) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    if (!userId)    return {
      status: 'FAILED',
      message: 'Company id is required',
      data: [],
    };

    const query = `SELECT USERDEFAULTGSTIN.GSTIN FROM USERDEFAULTGSTIN WHERE USERID = '${userId}'`;  
    const gstin = (await db.exec(query)).map(gstin => gstin.GSTIN);

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: gstin,
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
 * @param {String} companyId - Company ID
 * @returns {<Promise>Objec} - JSON Object with fields status, message and data (Array of GSTIN numbers).
 */
 exports.getGSTINsForAdmin = async (db, companyId) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    if (!companyId)    return {
      status: 'FAILED',
      message: 'Company id is required',
      data: [],
    };

    const query = `SELECT USERDEFAULTGSTIN.GSTIN FROM USERDEFAULTGSTIN WHERE COMPANYID = '${companyId}'`;  
    const gstin = (await db.exec(query)).map(gstin => gstin.GSTIN);

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: gstin,
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
 * @param {String} companyId - Company ID
 * @returns {<Promise>Objec} - JSON Object with fields status, message and data (Array of GSTIN numbers).
 */
 exports.getGSTINsForUsers = async (db, userId, companyId) => {
  try {
    if (!db) throw new Error('DB Connection is required');

    if (!userId)    return {
      status: 'FAILED',
      message: 'User id is required',
      data: [],
    };

    if (!companyId)    return {
      status: 'FAILED',
      message: 'Company id is required',
      data: [],
    };

    const query = `SELECT USERDEFAULTGSTIN.GSTIN FROM USERDEFAULTGSTIN WHERE COMPANYID = ? AND USERID = ?`;  
    const gstin = (await db.exec(query,[companyId,userId])).map(gstin => gstin.GSTIN);

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: gstin,
    };
  } catch (error) {
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: [],
    };
  }
}