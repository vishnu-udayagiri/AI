
const { escapeDoubleQuotes, escapeSingleQuotes } = require('@sap/hdbext').sqlInjectionUtils;

/**
 * Returns a SQL query to fetch company user details based on the provided parameters.
 *
 * @param {string} companyId - The ID of the company to filter by.
 * @param {string} userid - The ID of the user to filter by.
 * @param {string} email - The email of the user to filter by.
 * @param {string} pan - The PAN of the company to filter by.
 * @param {string} status - The PAN of the company to filter by.
 * @returns {string} The SQL query to fetch company user details.
 */
const CompanyUserRole = (companyId, userid, email, pan, status) => {
  const baseQuery = `SELECT COMPANYMASTER.COMPANYPAN,COMPANYUSERS.ID,COMPANYMASTER.CATEGORY,
                                COMPANYUSERS.COMPANYID,COMPANYUSERS.LOGINEMAIL,
                                COMPANYUSERS.PASSWORD,COMPANYUSERS.FIRSTNAME,COMPANYUSERS.MOBILE,
                                COMPANYUSERS.LASTNAME,COMPANYUSERS.STATUS,COMPANYUSERROLES.VALIDFROM,
                                COMPANYUSERROLES.VALIDTILL,COMPANYUSERROLES.ISADMIN,
                                COMPANYUSERROLES.CANADDGSTIN,COMPANYUSERROLES.CANEDITGSTINADDRESS,
                                COMPANYUSERROLES.CANAMENDMENTREQUEST,COMPANYUSERROLES.CANAMENDMENTAPPROVE,
                                COMPANYUSERS.FAILEDATTEMPTS,COMPANYUSERS.LASTFAILEDLOGINDATE,
                                COMPANYUSERROLES.CANEDITGST,COMPANYUSERS.LASTLOGGEDON,REASONFORDEACTIVATION,
                                CASE WHEN COMPANYUSERROLES.ISADMIN = true THEN 'Admin' ELSE 'User' END AS "USERROLE",
                                CASE WHEN (COMPANYMASTER.CATEGORY = '01' OR COMPANYMASTER.CATEGORY = '02' OR COMPANYMASTER.CATEGORY = '07') THEN true ELSE false END AS "ISB2A"
                            FROM
                                COMPANYMASTER AS COMPANYMASTER
                            INNER JOIN
                                COMPANYUSERS AS COMPANYUSERS
                                ON COMPANYMASTER.ID = COMPANYUSERS.COMPANYID
                            INNER JOIN
                                COMPANYUSERROLES AS COMPANYUSERROLES
                                ON COMPANYUSERS.ID = COMPANYUSERROLES.USERID
                                AND COMPANYUSERS.COMPANYID = COMPANYUSERROLES.COMPANYID
                                WHERE  COMPANYMASTER.STATUS != 'X'`;

  const conditions = [];
  if (companyId) {
    conditions.push(`COMPANYUSERS.COMPANYID = '${companyId}'`);
  }
  if (userid) {
    conditions.push(`COMPANYUSERS.ID ${userid}`);
  }
  if (email) {
    conditions.push(`LOWER(COMPANYUSERS.LOGINEMAIL) = LOWER('${email}')`);
  }
  if (pan) {
    conditions.push(`UPPER(COMPANYMASTER.COMPANYPAN) = UPPER('${pan}')`);
  }
  if (status) {
    conditions.push(`COMPANYUSERS.STATUS ${status}`);
  }
  const whereCondition = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
  const query = `${baseQuery} ${whereCondition}`;

  return query;
};

const CompanyUserWithStatus = (companyId, status) => {
  let query = `SELECT ID, FIRSTNAME, LASTNAME,LOGINEMAIL,MOBILE,STATUS FROM COMPANYUSERS WHERE COMPANYID='${companyId}'`;
  if (status) {
    query = query + ` AND STATUS${status}`;
  }
  return query;
};

const sanitizeString = (value) => {
  if (!value) return "";
  let output = value.replace(/\s\s+/g, ' ');
  output = escapeSingleQuotes(output);
  return output;
  return escapeDoubleQuotes(output);
};
module.exports = {
  CompanyUserRole,
  CompanyUserWithStatus,
  sanitizeString
};
