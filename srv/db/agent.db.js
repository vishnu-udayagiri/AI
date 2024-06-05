  /**
   *
   * @param {Object} db - Database connection
   * @param {String} companyId - Company ID
   * @returns {<Promise>Objec} - JSON Object with fields status, message and data (Array of GSTIN numbers).
   */
  exports.getAgents = async (db, companyId) => {
    try {
      if (!db) throw new Error('DB Connection is required');

      if (!companyId) return {
        status: 'FAILED',
        message: 'Company id is required',
        data: [],
      };

      const query = `SELECT COMPANYIATA.IATACODE FROM COMPANYIATA WHERE COMPANYID = '${companyId}'`;
      const agentCodes = (await db.exec(query)).map(agentCode => agentCode.IATACODE);

      return {
        status: 'SUCCESS',
        message: 'Query executed successfully',
        data: agentCodes,
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
 * @returns {<Promise>Object} - JSON Object with fields status, message and data (Array of GSTIN numbers).
*/
  exports.getAdminsFromCompanyId = async (tx, companyId) => {
    try {
      if (!tx) throw new Error('DB Connection is required');

      if (!companyId) return {
        status: 'FAILED',
        message: 'Company id is required',
        data: [],
      };

      const query = `WITH ADMINUSERID AS (
          SELECT USERID
          FROM COMPANYUSERROLES
          WHERE COMPANYID = '${companyId}' 
            AND (ISADMIN = TRUE OR CANAMENDMENTAPPROVE = TRUE) AND STATUS != 'X'
        )
        SELECT COMPANYUSERS.LOGINEMAIL,COMPANYUSERS.FIRSTNAME,COMPANYUSERS.LASTNAME,COMPANYUSERS.MOBILE,COMPANYUSERS.ID,COMPANYUSERS.COMPANYID
        FROM COMPANYUSERS
        JOIN ADMINUSERID
        ON COMPANYUSERS.ID = ADMINUSERID.USERID;`;
      const admins = (await tx.run(query))

      return {
        status: 'SUCCESS',
        message: 'Query executed successfully',
        data: admins,
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
    exports.getAgentDetails = async (db, iataNumber) => {
      try {
        if (!db) throw new Error('DB Connection is required');
  
        if (!iataNumber) return {
          status: 'FAILED',
          message: 'IATA Number is required',
          data: [],
        };

        let conditions = "";
        
        if (Array.isArray(iataNumber) && iataNumber.length > 0) {
          const numbersList = iataNumber.map(num => `'${num}'`).join(',');
          conditions =`IATANUMBER IN (${numbersList})`
        } else if (typeof iataNumber === 'string' && iataNumber.trim() !== '') {
          conditions = `INVOICENUMBER = '${iataNumber}'`;
        }else{ 
          return {
            status: 'FAILED',
            message: 'IATA Number is in incorrect format',
            data: [],
          };
        }
  
        const query = `SELECT AGENTMASTER.IATANUMBER, AGENTMASTER.LEGALNAME, AGENTMASTER.TRADENAME FROM AGENTMASTER WHERE ${conditions}`;
        const agents = await db.exec(query)
  
        return {
          status: 'SUCCESS',
          message: 'Query executed successfully',
          data: agents,
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
 * @returns {<Promise>Object} - JSON Object with fields status, message and data (Array of GSTIN numbers).
*/

exports.getAISuperAdmins = async (tx) => {
  try {

    if (!tx) throw new Error('DB Connection is required');

    const query = 'SELECT * FROM COMPANYADMIN WHERE ROLE = ?';
    const admins = (await tx.run(query,['Super Admin']))

    return {
      status: 'SUCCESS',
      message: 'Query executed successfully',
      data: admins,
    };
  } catch (error) {
    return {
      status: 'FAILED',
      message: 'Query execution failed. ' + error,
      data: [],
    };
  }
}