const { generateResponse } = require('../libs/response');
const moment = require('moment');
const timeZone = require('moment-timezone');

const getAuditLog = async (req, res) => {
  try {
    const db = req.db;
    const { ISB2A, Cid, Uid, Email } = req.user;
    let auditLog;
    const pageNumber = parseInt(req.body.pageNumber) || 1;
    const pageSize = parseInt(req.body.pageSize) || 10;
    const offset = (pageNumber - 1) * pageSize;

    // req.data = {
    //     module: [],
    //     event: [],
    //     user: [],
    //     from: '',
    //     to: ''
    // };

    const module = req.body.module ?? [];
    const event = req.body.event ?? [];
    const user = req.body.user ?? [];
    const from = req.body.from ?? '';
    const to = req.body.to ?? '';

    var conditions = [],
      start,
      end;
    /**Module Filter */
    if (module.length > 0) {
      conditions.push(`MODULE IN (${module.map((obj) => `'${obj}'`)})`);
    }

    /**Event Filter */
    if (event.length > 0) {
      conditions.push(`EVENTID IN (${event.map((obj) => `'${obj}'`)})`);
    }

    /**User Filter */
    if (user.length > 0) {
      conditions.push(`USERID IN (${user.map((obj) => `'${obj}'`)})`);
    }

    /**Date Range Filter */
    if (Object.keys(from).length > 0 && Object.keys(to).length > 0) {
      start = moment(from).format('YYYY-MM-DD');
      end = moment(to).format('YYYY-MM-DD');
      conditions.push(`SUBSTRING(A.CREATEDAT,0,10) BETWEEN CAST('${start}' AS DATETIME) AND CAST('${end}' AS DATETIME)`);
    }
    conditions.push(`A.COMPANYID = '${Cid}'`);
    //conditions.push(`A.USERID = '${Email}'`);
    const condition = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    

    const query = `
            WITH NumberedAuditLog AS (
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY A.CREATEDAT DESC) as rn,
                    MODULE, EVENTID, FINALSTATUSMESSAGETEXT, USERID, A.CREATEDAT, A.CREATEDBY,
                    OLDVALUE, NEWVALUE, DESCRIPTION, 
                    concat(concat(FIRSTNAME, ' '), LASTNAME) AS USERNAME,
                    CASE
                        WHEN FINALSTATUS = 'S' THEN 'Success'
                        WHEN FINALSTATUS = 'E' THEN 'Error'
                        WHEN FINALSTATUS = 'W' THEN 'Warning'
                    END AS FINALSTATUS
                FROM 
                    "AUDITTRAIL" AS "A"
                LEFT OUTER JOIN
                    "COMPANY"
                ON 
                    CODE = COMPANYCODE
                LEFT OUTER JOIN
                    "COMPANYUSERS" AS "CU"
                ON 
                    CU.ID = USERID
                ${condition}
            )
            SELECT *
            FROM NumberedAuditLog
            WHERE rn BETWEEN ${offset + 1} AND ${offset + pageSize}
        `;

    auditLog = await db.exec(query);

    const filters = {
      module: await db.exec(`SELECT DISTINCT 
                                                MODULE 
                                            FROM 
                                                AUDITTRAIL AS "module" 
                                            WHERE 
                                                COMPANYID = '${Cid}'`),
      event: await db.exec(`SELECT DISTINCT 
                                                EVENTID 
                                            FROM 
                                                AUDITTRAIL AS "evnet" 
                                            WHERE 
                                                COMPANYID = '${Cid}'`),
      user: await db.exec(`SELECT DISTINCT 
                                                USERID,
                                                concat( concat( FIRSTNAME, ' ' ), LASTNAME ) AS USERNAME
                                            FROM 
                                               "AUDITTRAIL" AS "A"
                                            LEFT OUTER JOIN
                                                "COMPANYUSERS" AS "CU"
                                            ON 
                                                CU.LOGINEMAIL = USERID
                                            WHERE A.COMPANYID = '${Cid}'`),
    };
    console.log(filters,"filters");

    const totalcount = await db.exec(`SELECT COUNT(*) as totalcount FROM  AUDITTRAIL as A ${condition}`)[0];

    function formatCreatedAt(array) {
      for (let i = 0; i < array.length; i++) {
        const createdAt = new Date(array[i].CREATEDAT);
        const utcTime = timeZone.utc(createdAt);
        const indianTime = utcTime.tz('Asia/Kolkata');

        const formattedDate = indianTime.format('DD-MM-YYYY h:mm A');
        array[i].CREATEDAT = formattedDate;
      }
      return array;
    }

    return res
      .status(200)
      .send(generateResponse('Success', 'Data fetched', 'T', 'S', 'null', false, { auditlog: formatCreatedAt(auditLog), filters: filters, totalcount: totalcount.TOTALCOUNT }));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

// const getAuditLogWithFilter = async (req, res) => {
//     try {
//         const db = req.db;
//         const { ISB2A, Cid, Uid } = req.user;
//         req.data = [{
//             module: [],
//             event: [],
//             user: [],
//             from: '2024-08-11',
//             to: ''
//         }
//         ]

//         const module = req.data.module;
//         const event = req.data.event;
//         const user = req.data.user;
//         const from = req.data.from;
//         const to = req.data.to;

//         var conditions = [];
//         /**Supplier GSTIN Filter */
//         if (module.length > 0) {
//             conditions.push(`MODULE IN (${module.map(obj => `'${obj.value}'`)})`);
//         }

//         /**Supplier GSTIN Filter */
//         if (event.length > 0) {
//             conditions.push(`EVENTID IN (${event.map(obj => `'${obj.value}'`)})`);
//         }

//         /**Supplier GSTIN Filter */
//         if (user.length > 0) {
//             conditions.push(`USERID IN (${user.map(obj => `'${obj.value}'`)})`);
//         }

//         if (Object.keys(from).length > 0 && Object.keys(to).length > 0) {
//             start = moment(financialYearDate.start).format("YYYY-MM-DD");
//             to = moment(financialYearDate.to).format("YYYY-MM-DD");
//             conditions.push(`CREATEDAT BETWEEN CAST('${start}' AS DATE) AND CAST('${to}' AS DATE)`);
//         }

//         condition = conditions.push(`A.COMPANYID = '${Cid}'`);
//         const condition = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

//         let auditLog;
//         auditLog = await db.exec(`SELECT
//                                         MODULE,
//                                         EVENTID,
//                                         FINALSTATUSMESSAGETEXT,
//                                         USERID,
//                                         A.CREATEDAT,
//                                         A.CREATEDBY,
//                                         OLDVALUE,
//                                         NEWVALUE,
//                                         DESCRIPTION,
//                                         concat( concat( FIRSTNAME, ' ' ), LASTNAME ) AS USERNAME,
//                                         CASE
//                                             WHEN FINALSTATUS = 'S' THEN 'Success'
//                                             WHEN FINALSTATUS = 'E' THEN 'Error'
//                                             WHEN FINALSTATUS = 'W' THEN 'Warning'
//                                         END AS FINALSTATUS
//                                     FROM
//                                         "AUDITTRAIL" AS "A"
//                                         LEFT OUTER JOIN
//                                         "COMPANY"
//                                         ON CODE = COMPANYCODE
//                                         LEFT OUTER JOIN
//                                         "COMPANYUSERS" AS "CU"
//                                         ON CU.ID = USERID
//                                     ${condition}
//                                     ORDER BY CREATEDAT DESC`);
//     } catch (error) {
//         debugger;
//     }
// };

const getInvoiceNumber = async (req, res) => {
  try {
    const db = req.db;
    const { ISB2A, Cid, Uid } = req.user;
    let invoiceList;
    let gstins = await db.exec(`SELECT GSTIN FROM USERDEFAULTGSTIN WHERE USERID = '${Uid}'`);
    if (ISB2A) {
      const iataNumber = await db.exec(`SELECT IATACODE FROM COMPANYIATA WHERE COMPANYID = '${Cid}'`);
      const gstinValues = gstins.map((result) => result.GSTIN);
      const iataValues = iataNumber.map((result) => result.IATACODE);

      // Construct the SQL query with placeholders
      const query = `
              SELECT INVOICENUMBER
              FROM INVOICE
              WHERE (PASSENGERGSTIN IN (${gstinValues.map(() => '?').join(', ')})
              OR IATANUMBER IN (${iataValues.map(() => '?').join(', ')})) AND INVOICENUMBER IS NOT NULL
            `;
      // Combine the two arrays for the parameters
      const parameters = [...gstinValues, ...iataValues];

      // Execute the query with parameters
      invoiceList = await db.exec(query, parameters);
    } else {
      const gstinValues = gstins.map((result) => result.GSTIN);
      const query = `
              SELECT INVOICENUMBER
              FROM INVOICE
              WHERE PASSENGERGSTIN IN (${gstinValues.map(() => '?').join(', ')})
            `;
      // Execute the query with parameters
      invoiceList = await db.exec(query, gstinValues);
    }
    return res.status(200).send(generateResponse('Success', 'Data Fetched', 'T', 'S', 'null', false, { invoiceList: invoiceList }));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

const getInvoiceLog = async (req, res) => {
  try {
    const db = req.db;
    const invoiceNumber = req.query.INVOICENUMBER;
    const invoiceLog = await db.exec(`SELECT 
        TO_CHAR(TICKETISSUEDATE, 'DD/MM/YYYY') AS TICKETISSUEDATE,
        TO_CHAR(INVOICEDATE, 'DD/MM/YYYY') AS INVOICEDATE,
        ISAMENDED,
        AMENDMENTREQUESTEDBY,
        TO_CHAR(AMENDMENTREQUESTEDON, 'DD/MM/YYYY') AS AMENDMENTREQUESTEDON,
        TO_CHAR(AMENDMENTAPPROVEDON, 'DD/MM/YYYY') AS AMENDMENTAPPROVEDON,
        CASE 
            WHEN AMENDEMENTSTATUS = 'P' THEN 'Pending'
            WHEN AMENDEMENTSTATUS = 'A' THEN 'Approved'
            WHEN AMENDEMENTSTATUS = 'R' THEN 'Rejected'
            WHEN AMENDEMENTSTATUS = 'AP' THEN 'Forwarded to Air India for approval'
            WHEN AMENDEMENTSTATUS = 'AF' THEN 'Air India Requested'
            WHEN AMENDEMENTSTATUS = 'AA' THEN 'Air India Approved'
            WHEN AMENDEMENTSTATUS = 'AR' THEN 'Air India Rejected'
            WHEN AMENDEMENTSTATUS = 'AY' THEN 'Air India Approved the Forwarded request from B2A'
            ELSE ' '  -- Handling for any other status not listed above
        END AS AMENDEMENTSTATUS,
        CASE 
            WHEN SBRRECIVEDON IS NULL THEN ''
            ELSE TO_CHAR(SBRRECIVEDON, 'DD/MM/YYYY')
        END AS SBRRECIVEDON,
        TO_CHAR(SBRPROCESSEDON, 'DD/MM/YYYY') AS SBRPROCESSEDON
    FROM 
        INVOICE
    WHERE 
        INVOICENUMBER = '${invoiceNumber}'`);

    const result = [];

    if (invoiceLog.length > 0) {
      // Iterate through the columns in the first row of the result
      const columns = Object.keys(invoiceLog[0]);
      var title = '',
        isVisible;
      columns.forEach((column) => {
        // Add each column to the result array
        if (column == 'TICKETISSUEDATE') {
          title = 'Ticket Issue Date';
          isVisible = true;
        } else if (column == 'INVOICEDATE') {
          title = 'Invoice Date';
          isVisible = true;
        } else if (column == 'AMENDMENTREQUESTEDBY') {
          title = 'Amendment Requested By';
          isVisible = invoiceLog[0].ISAMENDED;
        } else if (column == 'AMENDMENTREQUESTEDON') {
          title = 'Amendment Requested On';
          isVisible = invoiceLog[0].ISAMENDED;
        } else if (column == 'AMENDEMENTSTATUS') {
          title = 'Amendment Status';
          isVisible = invoiceLog[0].ISAMENDED;
        } else if (column == 'AMENDMENTAPPROVEDON') {
          title = 'Amendment Approved On';
          isVisible = invoiceLog[0].ISAMENDED;
        } else if (column == 'SBRRECIVEDON') {
          title = 'SBR Received on';
          isVisible = true;
        } else if (column == 'SBRPROCESSEDON') {
          title = 'SBR Processed on';
          isVisible = true;
        }
        if (column != 'ISAMENDED' && isVisible) {
          result.push({
            title: title,
            event: column,
            value: invoiceLog[0][column],
          });
        }
      });
      return res.status(200).send(generateResponse('Success', 'Data Fetched', 'T', 'S', 'null', false, { invoiceLog: result }));
    }
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

module.exports = {
  getAuditLog,
  getInvoiceLog,
  getInvoiceNumber,
};
