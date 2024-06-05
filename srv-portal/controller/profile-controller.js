const { generateResponse } = require('../libs/response');
const _ = require('lodash');
const timeZone = require('moment-timezone');
const moment = require('moment')
const { CompanyUserRole, CompanyUserWithStatus, sanitizeString } = require('../utils/common-query');
const { sendEMail, generatePassword } = require('../libs/otp.js');
const { auditlog } = require('../libs/auditlog');
const crudHelper = require('../helpers/crud.query.builder.helper');

const bcrypt = require('bcryptjs');
const axios = require('axios');
var jsonSql = require('json-sql')({
  separatedValues: false,
  wrappedIdentifiers: false,
});

const getProfileDetails = async (req, res) => {
  try {
    const db = req.db;
    const { ISB2A, UserRole, Cid, Uid, category } = req.user;
    const userDetails = await db.exec(`SELECT ID,COMPANYID,LOGINEMAIL,TITLE,FIRSTNAME,LASTNAME,MOBILE,LASTLOGGEDON,LASTFAILEDLOGINDATE,DEFAULTPERIOD
                                        FROM "COMPANYUSERS" 
                                        INNER JOIN "USERDEFAULT" ON USERID = ID
                                        WHERE ID='${Uid}' AND COMPANYID='${Cid}'`)[0];
    if (!userDetails) return res.status(500).send(generateResponse('Failed', 'User not found', 'B', 'E', null, true, null));
    const companyDetails = await db.exec(`SELECT * FROM COMPANYMASTER WHERE ID='${Cid}'`)[0];

    const agentDetails = await db.exec(`SELECT * FROM COMPANYIATA WHERE COMPANYID='${Cid}'`);

    var overseasAgentDetails = [];
    if (companyDetails?.AGENTCODE) {
      overseasAgentDetails = await req.db.exec(`SELECT * FROM AGENTMASTER WHERE CROSSREFERENCEAGENTNUM = '${companyDetails.AGENTCODE}'`);
    }
    var GSTDetails = [];
    // if (category == '05' || category == '08') {
    //   GSTDetails = await db.exec(`SELECT CG.GSTIN,
    //                                       CG.GSTTYPE,
    //                                       CG.DATEOFISSUEGST,
    //                                       CG.ARNNo,
    //                                       CG.DATEOFISSUEARN,
    //                                       CG.STATUS,
    //                                       CG.LASTVALIDATEDON,
    //                                       CG.GSTCERTIFICATE,
    //                                       CG.ADDRESS,
    //                                       CG.CITY,
    //                                       CG.STATE,
    //                                       CG.COUNTRY_CODE,
    //                                       CG.LEGALNAME,
    //                                       CG.TRADENAME,
    //                                       CG.STATUS,
    //                                       UDG.ISDEFAULT AS DEFAULT,
    //                                       CG.PINCODE FROM "USERDEFAULTGSTIN" "UDG"
    //                                       LEFT OUTER JOIN
    //                                       "COMPANYGSTIN" "CG"
    //                                       ON "CG".GSTIN = "UDG".GSTIN AND "CG".COMPANYID = "UDG".COMPANYID
    //                                       WHERE "UDG"."COMPANYID"='${Cid}' order by CG.GSTIN`);
    // } else {
    GSTDetails = await db.exec(`SELECT CG.GSTIN,
                                                CG.GSTTYPE,
                                                CG.DATEOFISSUEGST,
                                                CG.ARNNo,
                                                CG.DATEOFISSUEARN,
                                                CG.STATUS,
                                                CG.LASTVALIDATEDON,
                                                CG.GSTCERTIFICATE,
                                                CG.ADDRESS,
                                                CG.CITY,
                                                CG.STATE,
                                                CG.COUNTRY_CODE,
                                                CG.LEGALNAME,
                                                CG.TRADENAME,
                                                CG.STATUS,
                                                UDG.ISDEFAULT AS DEFAULT,
                                                CG.PINCODE FROM "USERDEFAULTGSTIN" "UDG"
                                                LEFT OUTER JOIN 
                                                "COMPANYGSTIN" "CG"
                                                ON "CG".GSTIN = "UDG".GSTIN AND "CG".COMPANYID = "UDG".COMPANYID
                                                WHERE "UDG"."USERID"='${Uid}' and "UDG"."COMPANYID"='${Cid}' order by CG.GSTIN`);
    // }
    if (GSTDetails.length > 0) {
      for (let i = 0; i < GSTDetails.length; i++) {
        const element = GSTDetails[i];
        element.address = [];
        element.addressHistory = [];
        const address = await db.exec(`SELECT * FROM COMPANYGSTINADRESSES WHERE GSTIN='${element.GSTIN}' AND COMPANYID='${Cid}'`);

        if (address.length > 0) {
          for (let j = 0; j < address.length; j++) {
            const addr = address[j];

            const utcEffectDate = timeZone.utc(addr.EFFECTIVEFROM);
            const indianEffectiveDate = utcEffectDate.tz('Asia/Kolkata');

            const formattedEffectiveDate = indianEffectiveDate.format('DDMMYYYY');

            const utcCurrentDate = timeZone.utc(new Date());
            const indianCurrentDate = utcCurrentDate.tz('Asia/Kolkata');

            const formattedCurrentDate = indianCurrentDate.format('DDMMYYYY');

            if (addr.TYPE === 'Principal') {
              element.address.push(addr);
            } else {
              if (formattedCurrentDate <= formattedEffectiveDate) {
                element.address.push(addr);
              } else {
                element.addressHistory.push(addr);
              }
            }
          }
        }
      }
    }

    const userApprovals = await db.exec(`SELECT ID,FIRSTNAME, LASTNAME,LOGINEMAIL,MOBILE,STATUS,CREATEDAT FROM COMPANYUSERS WHERE COMPANYID='${Cid}' AND STATUS='P'`);
    const attachments = await db.exec(`SELECT DOCUMENTCATEGORY.DOCUMENTNAME,DOCUMENTCATEGORY.ISMANDATORY,COMPANYDOCUMENTS.COMPANYID,
                                              COMPANYDOCUMENTS.DOCUMENTTYPECODE,COMPANYDOCUMENTS.FILE,COMPANYDOCUMENTS.FILEID,
                                              COMPANYDOCUMENTS.FILENAME,COMPANYDOCUMENTS.ID,COMPANYDOCUMENTS.ISSUEDON,
                                              COMPANYDOCUMENTS.VALIDFROM,COMPANYDOCUMENTS.VALIDTO,
                                              COMPANYDOCUMENTS.MIMETYPE
                                            FROM
                                              DOCUMENTCATEGORY DOCUMENTCATEGORY
                                            LEFT OUTER JOIN 
                                              COMPANYDOCUMENTS COMPANYDOCUMENTS
                                            ON
                                              DOCUMENTCATEGORY.DOCUMENTTYPECODE = COMPANYDOCUMENTS.DOCUMENTTYPECODE 
                                            WHERE
                                              COMPANYDOCUMENTS.COMPANYID ='${Cid}' OR COMPANYDOCUMENTS.COMPANYID IS NULL
                                            ORDER BY DOCUMENTCATEGORY.DOCUMENTNAME`);

    const IataDetails = await db.exec(`SELECT *,IATACODE as "IATANUMBER" FROM USERIATA WHERE USERID = '${Uid}'`);

    const gstinValues = GSTDetails.map((obj) => `'${obj.GSTIN}'`).join(',');
    var userRequest;
    let query;
    if (ISB2A) {
      iatanumber = companyDetails.AGENTCODE;
      query = `SELECT "ID", "INVOICENUMBER", "AMENDMENTREQUESTNO", "ISAMENDED", "AMENDMENTREQUESTEDBY", 
                        "AMENDMENTREQUESTEDON", "AMENDEMENTSTATUS",
                        "AMENDMENTAPPROVEDON", "AMENDMENTAPPROVEDBY", 
                        "AMENDENTEDADDRESS", "AMENDEMENTOLDVALUE", "AMENDEMENTNEWVALUE"
                      FROM 
                        "INVOICE"
                      WHERE 
                        ISAMENDED=true 
                      AND 
                        AMENDEMENTSTATUS='P' 
                      AND 
                      IATANUMBER = '${iatanumber}'`;
    } else {
      if (gstinValues) {
        query = `SELECT "ID", "INVOICENUMBER", "AMENDMENTREQUESTNO", "ISAMENDED", "AMENDMENTREQUESTEDBY", 
                        "AMENDMENTREQUESTEDON", "AMENDEMENTSTATUS",
                        "AMENDMENTAPPROVEDON", "AMENDMENTAPPROVEDBY", 
                        "AMENDENTEDADDRESS", "AMENDEMENTOLDVALUE", "AMENDEMENTNEWVALUE"
                      FROM 
                        "INVOICE"
                      WHERE 
                        ISAMENDED=true 
                      AND 
                        AMENDEMENTSTATUS='P' 
                      AND 
                        PASSENGERGSTIN IN (${gstinValues})`;
      }
    }
    if (query) {
      // Execute the modified query to get the data
      userRequest = await db.exec(query);
    }

    const output = {
      companyDetails,
      userDetails,
      GSTDetails,
      userApprovals,
      userRequest,
      attachments,
      agentDetails,
      overseasAgentDetails,
      IataDetails,
    };

    if (ISB2A) {
      output.tcsDetails = await db.exec(`SELECT * FROM COMPANYMASTERTCS WHERE COMPANYID='${Cid}'`)[0];
      if (!output.tcsDetails) output.tcsDetails = {};
    }

    var userList;
    if (UserRole === 'Admin') {
      userList = await db.exec(CompanyUserRole(Cid, `!='${Uid}'`, null, null, "NOT IN ('X','P')"));
      output.roles = {
        ISB2A,
        ISADMIN: UserRole === 'Admin',
        CANADDGSTIN: req.user.CANAddGSTIN,
        CANEDITGSTINADDRESS: req.user.CanEditGSTINAddress,
        CANAMENDMENTREQUEST: req.user.CanAmendmentRequest,
        CANAMENDMENTAPPROVE: req.user.CanAmendmentApprove,
        CANEDITGST: req.user.CanEditGst,
      };
    } else {
      userList = await db.exec(CompanyUserRole(Cid, `='${Uid}'`, null, null, "!='P'"));
      output.roles = {
        ISB2A,
        ISADMIN: UserRole === 'Admin',
        CANADDGSTIN: userList[0].CANADDGSTIN,
        CANEDITGSTINADDRESS: userList[0].CANEDITGSTINADDRESS,
        CANAMENDMENTREQUEST: userList[0].CANAMENDMENTREQUEST,
        CANAMENDMENTAPPROVE: userList[0].CANAMENDMENTAPPROVE,
        CANEDITGST: userList[0].CANEDITGST,
      };
    }

    if (UserRole === 'Admin') {
      output.users = [];
      userList.forEach((user) => {
        const { PASSWORD, COMPANYPAN, COMPANYID, ISB2A, USERROLE, ISADMIN, ...rest } = user;
        output.users.push(rest);
      });
    }

    return res.status(200).send(generateResponse('Success', 'Data fetched', 'T', 'S', 'null', false, { ...output }));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

// function fetchPANDetails(PAN) {
//   const apiUrl = 'http://3.7.51.90:3005/api/panValidation?panNumber=' + PAN
//   return new Promise((res, rej) => {
//     // Perform the GET request with Axios
//     axios.get(apiUrl)
//       .then((response) => {
//         // Handle the successful response
//         res(response.data);
//       })
//       .catch((error) => {
//         // Handle any errors
//         rej(error);
//       });
//   });
// }

const fetchGSTINsForPAN = async (req, res) => {
  try {
    const { PAN, UserRole, Cid } = req.user;
    let gstins;
    let DbDatfilter
    if (UserRole === 'Admin') {
      gstins = await fetchPANDetails(PAN);
      DbDatfilter = await fetchPANDetails(PAN);
      gstins = gstins.data
        .filter(x => x !== null) // Filter out null values
        .map(x => ({ GSTIN: x.gstin, LEGALNAME: x.lgnm }));
      //gstins = gstins.data.map((x) => ({ GSTIN: x.gstin, LEGALNAME: x.lgnm }));
    } else {
      gstins = await req.db.exec(`SELECT GSTIN,LEGALNAME FROM COMPANYGSTIN WHERE COMPANYID = '${Cid}'`);
    }

    const filteredGSTINS = gstins.filter((gstin) => gstin.GSTIN.substring(2, 12) === PAN);
    let gstTableData = await req.db.exec(
      `SELECT  GSTIN.ADDRESS AS ADDRESS,GSTIN.TAXPAYERTYPE AS GSTTYPE,GSTIN.LEGALNAME AS LEGALNAME,GSTIN.GSTIN AS GSTIN,GSTIN.DTREG AS DATEOFISSUEGST,
      GSTIN.TRADENAME AS TRADENAME,GSTIN.STATUS AS STATUS,GSTIN.POSTALCODE AS PINCODE,GSTIN.STATECODE AS STATE FROM GSTIN
       WHERE SUBSTRING(GSTIN, 3, 10) = '${PAN}' AND STATUS='A'`
    );

    function itemstatus(finalResult) {
      switch (finalResult) {
        case "0":
          finalResult = "";
          break;
        case "ACT":
          finalResult = "A";
          break;
          case "Active":
          finalResult = "A";
          break;
        case "INA":
          finalResult = "I";
          break;
        case "CNL":
          finalResult = "C";
          break;
        case "PRO":
          finalResult = "P";
          break;
        default:
          finalResult = finalResult?.substring(0, 1)?.toUpperCase() ?? "";
      }
      return finalResult;
    }

    function getTaxpayerType(description) {
 
      const sanitizedInput = (description.toLowerCase()?.replace(/[^a-z0-9]/gi, ''))??"";
   
      const taxpayerTypes = {
          "specialeconomiczone": "SEZ",
          "sezunit":"SEZ",
          "composition": "COM" ,
          "othernotifiedpersons":"ONP",
          "othernotifiedperson":"ONP",
          "taxdeductoratsource":"TDS",
          "taxdeductor":"TDS",
          "inputservicedistributor":"ISD",
          "inputservicedistributorisd":"ISD",
          "embassy":"EMB" ,
          "consulateorembassyofforeigncountry":"EMB",
          "regular":"REG" ,
          "specialeconomicdeveloper":"SEZ",
          "sezdeveloper":"SEZ",
          "unbody":"UNB",
          "unitednationbody":"UNB",
          "taxcollectoratsource":"TCS",
          "taxcollectorelectroniccommerceoperator":"TCS",
          "nonresidenttaxableperson":"NRP",
          "nonresidentonlineservicedistributor":"NRO",
          "casualtaxableperson":"CTP"
      };
   
      return taxpayerTypes[sanitizedInput]??null;
   
  }
  const gstTypeMapping = {
    "SEZ": "Special economic zone",
    "COM": "Composition",
    "ONP": "Other notified persons",
    "TDS": "Tax deductor at source",
    "ISD": "Input service distributor",
    "EMB": "Embassy",
    "REG": "Regular",
    "SED": "Special economic developer",
    "UNB": "UN Body",
    "TCS": "Tax collector at source",
    "NRP": "Non-resident taxable person",
    "NRO": "Non-resident online service distributor",

  };

    function convertGSTType(gstType) {
      return gstTypeMapping[gstType] || gstType;
    }
  
    const newData = gstTableData.map(item => ({ ...item, PAN: `${PAN}`, STATUS: "Active", GSTTYPE: convertGSTType(item.GSTTYPE) }));




    const concatenatedArray = [...filteredGSTINS];

    newData.forEach(item => {
      const existingItem = filteredGSTINS.find(i => i.GSTIN === item.GSTIN);
      if (!existingItem) {
        concatenatedArray.push(item);
      }
    });
    function getStateCode(stateName) {
      let stateCode = req.db.exec(`SELECT STATECODES.STATECODE AS STATECODE FROM STATECODES WHERE STATENAME = ?`, [stateName]);


      return stateCode[0] && stateCode[0].STATECODE


    }
    try {
      const missingElements = DbDatfilter.data.filter(item => !newData.some(i => i.GSTIN === item.gstin));
      for (const item of missingElements) {
        let gsttableDataExist = await req.db.exec(
          `SELECT * FROM GSTIN
   WHERE GSTIN = '${item.gstin}'`
        );


        if (gsttableDataExist.length === 0) {

          let Taxpayertype = getTaxpayerType(item.dty)
          let status = itemstatus(item.sts)
          await req.db.exec(`
  INSERT INTO GSTIN (GSTIN, STATUS, TAXPAYERTYPE, LEGALNAME, TRADENAME,POSTALCODE,ADDRESS,DTREG,STATECODE,VALIDATEDON)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [item.gstin, status, Taxpayertype, item.lgnm, item.tradeNam, item.pradr.addr.pncd, `${item.pradr.addr.bno},${item.pradr.addr.st},${item.pradr.addr.loc},${item.pradr.addr.dst}`, moment(item.rgdt, 'DD/MM/YYYY').format('YYYY-MM-DD'), getStateCode(item.pradr.addr.stcd), moment(item.lstupdt, 'DD/MM/YYYY').format('YYYY-MM-DD')]);

        }
        else {
          // console.log(item,"itemdata");

          let Taxpayertype = getTaxpayerType(item.dty)
          let status = itemstatus(item.sts)

          await req.db.exec(`
  UPDATE GSTIN
  SET STATUS = ?,
      TAXPAYERTYPE = ?,
      LEGALNAME = ?,
      TRADENAME = ?,
      POSTALCODE = ?,
      ADDRESS = ?,
      DTREG = ?,
      STATECODE = ?,
      VALIDATEDON = ?
  WHERE GSTIN = ?
`, [status, Taxpayertype, item.lgnm, item.tradeNam, item.pradr.addr.pncd, `${item.pradr.addr.bno},${item.pradr.addr.st},${item.pradr.addr.loc},${item.pradr.addr.dst}`, moment(item.rgdt, 'DD/MM/YYYY').format('YYYY-MM-DD'), getStateCode(item.pradr.addr.stcd), moment(item.lstupdt, 'DD/MM/YYYY').format('YYYY-MM-DD'), item.gstin]);

        }

      }
    }
    catch (e) {
      console.log(e);
    }


    if (filteredGSTINS.length > 0) {
      return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { GSTINS: concatenatedArray }));
    } else {
      return res.status(200).send(generateResponse('Success', "Couldn't fetch GSTINs associated with the PAN.", 'B', 'S', null, true, null));
    }
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

function fetchPANDetails(PAN) {
  const apiUrl = `http://3.7.51.90:4009/api/v1/pan/get-pan-details?pan=${PAN}&refresh=no`;
  return axios
    .get(apiUrl, {
      headers: {
        'x-api-key': 'MdR0dGyyxbePw3hSVGv/tw==',
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error in fetching data:', error);
      throw new Error('Failed to fetch PAN details');
    });
}

function onlyUnique(value, index, array) {
  return array.indexOf(value) === index;
}

const fetchGSTINDetails = async (req, res) => {
  try {
    const { PAN, UserRole, Cid } = req.user;
    const db = req.db;
    const gstins = req.body;
    const pan = gstins[0].substring(2, 12);
    let filteredGstins = [];
    if (UserRole === 'Admin') {
      let predefinedValues = {
        GSTIN: 'gstin',
        GSTTYPE: 'dty',
        DEFAULT: false,
        DATEOFISSUEGST: 'rgdt',
        ARNNO: '',
        DATEOFISSUEARN: '',
        COUNTRY_CODE: 'IN',
        STATE: 'stcd',
        CITY: '',
        PINCODE: 'pncd',
        GSTCERTIFICATE: '',
        STATUS: 'sts',
        ARNCERTIFICATE: '',
        LEGALNAME: 'lgnm',
        TRADENAME: 'tradeNam',
      };
      let gstD = await fetchPANDetails(pan);
      let outGstDetails = [];
      const gstDetails = (gstD.data ?? gstD.response.data).filter(x => x !== null);;
      gstDetails.forEach((gstDetail) => {
        let outGstDetail = {
          PAN: pan,
        };
        if (gstDetail.hasOwnProperty('pradr')) {
          Object.keys(gstDetail.pradr.addr).forEach((addressVariable) => {
            gstDetail[addressVariable] = gstDetail.pradr.addr[addressVariable];
          });
          outGstDetail.ADDRESS = Object.values(gstDetail.pradr.addr).map(String).join(', ');
        }
        Object.keys(gstDetail).forEach((detail) => {
          Object.keys(predefinedValues).forEach((value) => {
            if (detail == predefinedValues[value]) outGstDetail[value] = gstDetail[detail];
          });
        });
        if (outGstDetail.DATEOFISSUEGST) outGstDetail.DATEOFISSUEGST = outGstDetail.DATEOFISSUEGST.split('/').reverse().join('-');
        outGstDetails.push(outGstDetail);
      });
      filteredGstins = outGstDetails.filter((item) => Array.isArray(gstins) && gstins.includes(item.GSTIN));
    } else {
      const companyGSTINs = await req.db.exec(`SELECT * FROM COMPANYGSTIN WHERE COMPANYID = '${Cid}'`);
      if (companyGSTINs.length > 0) {
        filteredGstins = companyGSTINs.filter((item) => Array.isArray(gstins) && gstins.includes(item.GSTIN));
      }
    }


    const concatenatedArray = [...filteredGstins]; // Assuming filteredGstins is already defined

    for (const gstin of gstins) {
      let gstTableData = await req.db.exec(
        `SELECT GSTIN.ADDRESS AS ADDRESS, GSTIN.TAXPAYERTYPE AS GSTTYPE, GSTIN.LEGALNAME AS LEGALNAME, GSTIN.GSTIN AS GSTIN, GSTIN.DTREG AS DATEOFISSUEGST,
          GSTIN.TRADENAME AS TRADENAME, GSTIN.STATUS AS STATUS, GSTIN.POSTALCODE AS PINCODE, GSTIN.STATECODE AS STATE FROM GSTIN
           WHERE GSTIN = '${gstin}' AND STATUS='A'`
      );
      const gstTypeMapping = {
        "SEZ": "Special economic zone",
        "COM": "Composition",
        "ONP": "Other notified persons",
        "TDS": "Tax deductor at source",
        "ISD": "Input service distributor",
        "EMB": "Embassy",
        "REG": "Regular",
        "SED": "Special economic developer",
        "UNB": "UN Body",
        "TCS": "Tax collector at source",
        "NRP": "Non-resident taxable person",
        "NRO": "Non-resident online service distributor",

      };


      function convertGSTType(gstType) {
        return gstTypeMapping[gstType] || gstType;
      }

      const newData = gstTableData.map(item => ({ ...item, PAN: `${pan}`, STATUS: "Active", GSTTYPE: convertGSTType(item.GSTTYPE) }));

      newData.forEach(item => {
        const existingItem = concatenatedArray.find(i => i.GSTIN === item.GSTIN);
        if (!existingItem) {
          concatenatedArray.push(item);
        }
      });
    }

    return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { GSTINDetails: concatenatedArray }));

    /**
     * Step 1: Check if GSTIN details avilable already in Table validated 20 days back
     */

    /**
     * Step 2: If yes, return the GSTINs
     */

    /**
     * Step 3: If no, call GSTIN API
     */

    /**
     * Step 4: Insert GSTINs in Table
     */

    /**
     * Step 5: Return the GSTIN details
     */
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

const blockUser = async (req, res) => {
  try {
    const { UserRole, Cid, Email, Uid } = req.user;
    if (UserRole != 'Admin') return res.status(403).send(generateResponse('Failed', 'Only the admin can block users.', 'T', 'E', null, true, null));

    const db = req.db;
    const { ID, blockReason = '' } = req.body;

    const user = await db.exec(`SELECT STATUS,LOGINEMAIL FROM COMPANYUSERS WHERE ID='${ID}' AND COMPANYID='${Cid}'`)[0];
    if (user && user.STATUS == 'B') return res.status(500).send(generateResponse('Failed', 'The user is already blocked.', 'T', 'E', null, true, null));

    await db.exec(`
        UPDATE COMPANYUSERS
        SET 
          status = 'B',
          MODIFIEDAT = CURRENT_TIMESTAMP, 
          MODIFIEDBY = '${Email}', 
          REASONFORDEACTIVATION = '${blockReason}'
        WHERE 
          ID='${ID}' AND COMPANYID='${Cid}'
      `);
    const userDetails = await db.exec(`SELECT FIRSTNAME, LASTNAME FROM COMPANYUSERS WHERE LOGINEMAIL='${user.LOGINEMAIL}'`);
    const name = userDetails[0].FIRSTNAME;
    sendEMail(blockReason, user.LOGINEMAIL, 'BLOCKUSER', name);

    const userApprovals = await db.exec(CompanyUserRole(Cid, `!='${Uid}'`, null, null, "!='P'"));
    const output = [];
    userApprovals.forEach((user) => {
      const { PASSWORD, COMPANYPAN, COMPANYID, ISB2A, USERROLE, ISADMIN, ...rest } = user;
      output.push(rest);
    });
    const data = {
      companyCode: 'AI',
      companyId: Cid,
      userId: Uid,
      module: 'User Profile',
      eventId: 'Sub User Status',
      finalStatus: 'S',
      finalStatusMessage: `${user.LOGINEMAIL} has been blocked`,
      oldValue: 'Active',
      newValue: 'Blocked',
    };
    auditlog(db, data);
    return res.status(200).send(generateResponse('Success', 'User Blocked.', 'B', 'S', null, false, { users: output }));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

const unBlockUser = async (req, res) => {
  try {
    const { UserRole, Cid, Email, Uid } = req.user;
    if (UserRole != 'Admin') return res.status(403).send(generateResponse('Failed', 'Only the admin can block users.', 'T', 'E', null, true, null));
    const db = req.db;
    const { ID } = req.body;

    const user = await db.exec(`SELECT STATUS,LOGINEMAIL FROM COMPANYUSERS WHERE ID='${ID}' AND COMPANYID='${Cid}'`)[0];
    if (user && user.STATUS != 'B') return res.status(500).send(generateResponse('Failed', 'User is already unblocked', 'T', 'S', null, true, null));

    let password = generatePassword();
    let hashPassword = await bcrypt.hash(password, 12);

    await db.exec(`UPDATE COMPANYUSERS
        SET 
          status = 'A',
          MODIFIEDAT = CURRENT_TIMESTAMP, 
          MODIFIEDBY = '${Email}',
          REASONFORDEACTIVATION = '',
          PASSWORD = '${hashPassword}',
          LASTLOGGEDON = NULL,
          LASTPASSWORDCHANGEDON = CURRENT_TIMESTAMP,
          LOGINATTEMPTS = 0,
          FAILEDATTEMPTS = 0,
          LASTFAILEDLOGINDATE = NULL
        WHERE 
          ID='${ID}' AND COMPANYID='${Cid}'`);
    const userDetails = await db.exec(`SELECT FIRSTNAME, LASTNAME FROM COMPANYUSERS WHERE LOGINEMAIL='${user.LOGINEMAIL}'`);
    const name = userDetails[0].FIRSTNAME;
    sendEMail(password, user.LOGINEMAIL, 'UNBLOCKUSER', name);

    const userApprovals = await db.exec(CompanyUserRole(Cid, `!='${Uid}'`, null, null, "!='P'"));
    const output = [];
    userApprovals.forEach((user) => {
      const { PASSWORD, COMPANYPAN, COMPANYID, ISB2A, USERROLE, ISADMIN, ...rest } = user;
      output.push(rest);
    });
    const data = {
      companyCode: 'AI',
      companyId: Cid,
      userId: Uid,
      module: 'User Profile',
      eventId: 'Sub User Status',
      finalStatus: 'S',
      finalStatusMessage: `${user.LOGINEMAIL} has been activated`,
      oldValue: 'Blocked',
      newValue: 'Active',
    };
    auditlog(db, data);
    return res.status(200).send(generateResponse('Success', 'User unblocked.', 'B', 'S', null, false, { users: output }));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

const approveUser = async (req, res) => {
  try {
    const { UserRole, Cid, Email, Uid, category } = req.user;

    if (UserRole != 'Admin') return res.status(500).send(generateResponse('Failed', 'Only the admin can activate users.', 'B', 'E', null, true, null));
    const db = req.db;
    const { ID } = req.body;

    const user = await db.exec(`SELECT STATUS,LOGINEMAIL FROM COMPANYUSERS WHERE ID='${ID}' AND COMPANYID='${Cid}'`)[0];
    if (user && user.STATUS != 'P') return res.status(500).send(generateResponse('Failed', 'The user is already approved.', 'B', 'E', null, true, null));
    let deactiveUser = '';
    if (user && user.STATUS == 'D') {
      deactiveUser = `,REACTIVATEDON = CURRENT_TIMESTAMP , REACTIVATEDBY = '${Email}'`;
    }

    if (user.STATUS === 'P') {
      let password = generatePassword();
      let hashPassword = await bcrypt.hash(password, 12);
      const userDetails = await db.exec(`SELECT FIRSTNAME, LASTNAME FROM COMPANYUSERS WHERE LOGINEMAIL='${user.LOGINEMAIL}'`);
      const name = userDetails[0].FIRSTNAME;
      sendEMail(password, user.LOGINEMAIL, 'WELCOME', name);
      deactiveUser += `,PASSWORD = '${hashPassword}'`;
    }

    await db.exec(`UPDATE COMPANYUSERS SET 
                          STATUS = 'A',
                          MODIFIEDAT = CURRENT_TIMESTAMP, 
                          MODIFIEDBY = '${Email}',
                          REASONFORDEACTIVATION = ''
                          ${deactiveUser}
                          WHERE 
                          ID='${ID}' AND COMPANYID='${Cid}'`);
    if (category == '05' || category == '08') {
      const gstDetails = await db.exec(`SELECT * FROM USERDEFAULTGSTIN WHERE USERID = '${Uid}'`);
      if (gstDetails) {
        try {
          for (let i = 0; i < gstDetails.length; i++) {
            const element = gstDetails[i];
            await db.exec(`INSERT INTO USERDEFAULTGSTIN (CREATEDAT,COMPANYID,USERID,GSTIN ) VALUES (
            CURRENT_TIMESTAMP,'${Cid}', '${ID}', '${element.GSTIN}')`);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }

    const userApprovals = await db.exec(CompanyUserWithStatus(Cid, "='P'"));
    const users = await db.exec(CompanyUserRole(Cid, `!='${Uid}'`, null, null, "!='P'"));
    const userRoles = [];
    users.forEach((user) => {
      const { PASSWORD, COMPANYPAN, COMPANYID, ISB2A, USERROLE, ISADMIN, ...rest } = user;
      userRoles.push(rest);
    });
    const data = {
      companyCode: 'AI',
      companyId: Cid,
      userId: Uid,
      module: 'User Profile',
      eventId: 'Sub User Approval Request',
      finalStatus: 'S',
      finalStatusMessage: `${user.LOGINEMAIL} has been approved`,
      oldValue: '',
      newValue: 'Approved',
    };
    auditlog(db, data);
    return res.status(200).send(generateResponse('Success', 'User approved.', 'B', 'S', null, false, { userApprovals: userApprovals, userDetails: users, userRoles }));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

const activateUser = async (req, res) => {
  try {
    const { UserRole, Cid, Uid, Email } = req.user;
    if (UserRole != 'Admin') return res.status(403).send(generateResponse('Failed', 'Only the admin can activate users.', 'T', 'E', null, true, null));
    const db = req.db;
    const { ID } = req.body;

    const user = await db.exec(`SELECT STATUS,LOGINEMAIL FROM COMPANYUSERS WHERE ID='${ID}' AND COMPANYID='${Cid}'`)[0];
    if (user && user.STATUS != 'D') return res.status(500).send(generateResponse('Failed', 'User is not inactive', 'T', 'S', null, true, null));

    let password = generatePassword();
    let hashPassword = await bcrypt.hash(password, 12);

    await db.exec(`UPDATE COMPANYUSERS
        SET 
          status = 'A',
          MODIFIEDAT = CURRENT_TIMESTAMP, 
          MODIFIEDBY = '${Email}',
          REASONFORDEACTIVATION = '',
          PASSWORD = '${hashPassword}',
          LASTLOGGEDON = NULL,
          LASTPASSWORDCHANGEDON = CURRENT_TIMESTAMP,
          LOGINATTEMPTS = 0,
          FAILEDATTEMPTS = 0,
          LASTFAILEDLOGINDATE = NULL
        WHERE 
          ID='${ID}' AND COMPANYID='${Cid}'`);
    const userDetails = await db.exec(`SELECT FIRSTNAME, LASTNAME FROM COMPANYUSERS WHERE LOGINEMAIL='${user.LOGINEMAIL}'`);
    const name = userDetails[0].FIRSTNAME;
    sendEMail(password, user.LOGINEMAIL, 'ACTIVATEUSER', name);
    const userApprovals = await db.exec(CompanyUserRole(Cid, `!='${Uid}'`, null, null, "!='P'"));
    const output = [];
    userApprovals.forEach((user) => {
      const { PASSWORD, COMPANYPAN, COMPANYID, ISB2A, USERROLE, ISADMIN, ...rest } = user;
      output.push(rest);
    });

    return res.status(200).send(generateResponse('Success', 'User account activated.', 'B', 'S', null, false, { users: output }));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

const rejectUser = async (req, res) => {
  try {
    const { UserRole, Cid, Email, Uid } = req.user;
    if (UserRole != 'Admin') return res.status(403).send(generateResponse('Failed', 'Only the admin can activate users.', 'T', 'E', null, true, null));
    const db = req.db;
    const { ID, rejectionReason = '' } = req.body;

    const user = await db.exec(`SELECT STATUS,LOGINEMAIL FROM COMPANYUSERS WHERE ID='${ID}' AND COMPANYID='${Cid}'`)[0];
    if (user && user.STATUS != 'P') return res.status(500).send(generateResponse('Failed', 'Can reject only a pending approval.', 'T', 'S', null, true, null));

    await db.exec(`UPDATE COMPANYUSERS
        SET 
          status = 'X',
          MODIFIEDAT = CURRENT_TIMESTAMP, 
          MODIFIEDBY = '${Email}',
          REASONFORDEACTIVATION = '${rejectionReason}'
        WHERE 
          ID='${ID}' AND COMPANYID='${Cid}'`);
    const userDetails = await db.exec(`SELECT FIRSTNAME, LASTNAME FROM COMPANYUSERS WHERE LOGINEMAIL='${user.LOGINEMAIL}'`);
    const name = userDetails[0].FIRSTNAME;
    sendEMail(rejectionReason, user.LOGINEMAIL, 'REJECTUSER', name);
    const userApprovals = await db.exec(CompanyUserWithStatus(Cid, "='P'"));
    const users = await db.exec(CompanyUserRole(Cid, `!='${Uid}'`, null, null, "!='P'"));
    const userRoles = [];
    users.forEach((user) => {
      const { PASSWORD, COMPANYPAN, COMPANYID, ISB2A, USERROLE, ISADMIN, ...rest } = user;
      userRoles.push(rest);
    });
    const data = {
      companyCode: 'AI',
      companyId: Cid,
      userId: Uid,
      module: 'User Profile',
      eventId: 'Sub User Approval Request',
      finalStatus: 'S',
      finalStatusMessage: `${user.LOGINEMAIL} has been rejected`,
      oldValue: '',
      newValue: 'Rejected',
    };
    auditlog(db, data);
    return res.status(200).send(generateResponse('Success', 'User rejected.', 'B', 'S', null, false, { userApprovals: userApprovals, userDetails: users, userRoles }));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

const editProfile = async (req, res) => {
  try {
    const { companyDetails = {}, agentDetails = [], iataDetails = [], userDetails = {}, defaultDetails, gstinDetails, gstinAddress, userRoleDetails, attachmentDetails } = req.body;
    const db = req.db;
    const { ISB2A, UserRole, Cid, Uid, Email } = req.user;

    const currentDate = new Date().toISOString(),
      user = Email;

    // if (iataDetails) {
    //   try {
    //     for (let i = 0; i < iataDetails.length; i++) {
    //       const element = iataDetails[i];
    //       await db.exec(`INSERT INTO USERIATA (COMPANYID,USERID, IATACODE,SITETYPE, LEGALNAME,TRADENAME,CITY,REGION,COUNTRYNAME,POSTALCODE) VALUES (
    //         '${Cid}', '${Uid}',${element.IATANUMBER},'${element.SITETYPE}','${sanitizeString(element.LEGALNAME)}','${sanitizeString(element.TRADENAME)}','${sanitizeString(element.CITY)}',
    //               '${sanitizeString(element.REGION)}','${sanitizeString(element.COUNTRYNAME)}','${element.POSTALCODE}')`);
    //     }
    //   } catch (error) {
    //     debugger
    //   }
    // }
    /** Agent Details */

    if (iataDetails.hasOwnProperty('deletedItems')) {
      try {
        for (let i = 0; i < iataDetails.deletedItems.length; i++) {
          const element = iataDetails.deletedItems[i];
          await db.exec(`DELETE FROM USERIATA WHERE  COMPANYID='${Cid}' AND USERID='${Uid}' AND IATACODE = ${element}`);
          /**Audit Log - Agnet Delete */
          const data = {
            companyCode: 'AI',
            companyId: Cid,
            userId: Uid,
            module: 'User Profile',
            eventId: 'Delete - Agent Code',
            finalStatus: 'S',
            finalStatusMessage: 'Agent Code Deleted',
            oldValue: element.IATACODE,
            newValue: '',
          };
          auditlog(db, data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    // if (agentDetails.hasOwnProperty('editedItems')) {
    //   try {
    //     for (let i = 0; i < agentDetails.editedItems.length; i++) {
    //       const element = agentDetails.editedItems[i];
    //       let gstinSql = jsonSql.build({
    //         type: "update",
    //         table: "COMPANYIATA",
    //         condition: { COMPANYID: element.COMPANYID, IATACODE: element.IATACODE },
    //         modifier: element
    //       });
    //       await db.exec(gstinSql.query);
    //     }

    //   } catch (error) {
    //     debugger
    //   }
    // }
    if (iataDetails.hasOwnProperty('editedItems')) {
      try {
        const editedItemsArray = Object.entries(iataDetails.editedItems).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        for (let i = 0; i < editedItemsArray.length; i++) {
          const element = editedItemsArray[i];

          try {
            await db.exec(`
        UPDATE COMPANYIATA
        SET ISECOMMERCEOPERATOR = ${element.ISECOMMERCEOPERATOR ? true : false}
        WHERE COMPANYID = '${Cid}' AND IATACODE='${element.id}'
    `);
          }
          catch (e) {
            console.log(e);
          }
          try {
            await db.exec(`
          UPDATE USERIATA
          SET ISECOMMERCEOPERATOR = ${element.ISECOMMERCEOPERATOR ? true : false}
          WHERE COMPANYID = '${Cid}' AND IATACODE='${element.id}'
          `);
          }
          catch (e) {
            console.log(e);
          }

          try {
            await db.exec(`
  UPDATE AGENTMASTER
  SET ISECOMMERCEOPERATOR = ${element.ISECOMMERCEOPERATOR ? true : false}
  WHERE  IATANUMBER='${element.id}'
  `);
          }
          catch (e) {
            console.log(e);
          }




          /**Audit Log - Agnet edit */
          const data = {
            companyCode: 'AI',
            companyId: Cid,
            userId: Uid,
            module: 'User Profile',
            eventId: 'Edit - Agent Code',
            finalStatus: 'S',
            finalStatusMessage: `Agent Code of ${element.id} Edited`,
            oldValue: element.ISECOMMERCEOPERATOR ? 'Ecommerce Operator not selected' : "Ecommerce Operator Selected",
            newValue: element.ISECOMMERCEOPERATOR ? 'Ecommerce Operator Selected' : "Ecommerce Operator not selected",
          };
          auditlog(db, data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (iataDetails.hasOwnProperty('addedItems')) {
      try {
        for (let i = 0; i < iataDetails.addedItems.length; i++) {


          const element = iataDetails.addedItems[i];
          let isCommercecheck = db.exec(`SELECT USERIATA.ISECOMMERCEOPERATOR AS ISECOMMERCEOPERATOR 
          FROM USERIATA 
          WHERE COMPANYID = '${Cid}' AND IATACODE = '${element.IATANUMBER}'
          `)

          element.COMPANYID = Cid;
          element.USERID = Uid;
          element.IATACODE = element.IATANUMBER;
          isCommercecheck.map((item) => {

            if (item.ISECOMMERCEOPERATOR) {
              element.ISECOMMERCEOPERATOR = true
            }
          })


          delete element.IATANUMBER;
          let gstinSql = jsonSql.build({
            type: 'insert',
            table: 'USERIATA',
            values: element,
          });
          await db.exec(gstinSql.query);

          /** Audit Log - Create Agent Code */
          const data = {
            companyCode: 'AI',
            companyId: Cid,
            userId: Uid,
            module: 'User Profile',
            eventId: 'Create - Agent Code',
            finalStatus: 'S',
            finalStatusMessage: 'Agent Code Created',
            oldValue: '',
            newValue: element.IATACODE,
          };
          auditlog(db, data);
        }
      } catch (error) {
        console.log(error);
      }
    }

    /** User Details */
    if (Object.keys(userDetails).length > 0) {
      try {
        const keys = Object.keys(userDetails).join(',');
        const old_UserDetails = await db.exec(`SELECT ${keys} FROM COMPANYUSERS WHERE ID='${Uid}' AND COMPANYID = '${Cid}'`)[0];

        userDetails.MODIFIEDAT = currentDate;
        userDetails.MODIFIEDBY = user;
        var userSql = jsonSql.build({
          type: 'update',
          table: 'COMPANYUSERS',
          condition: { ID: Uid, COMPANYID: Cid },
          modifier: userDetails,
        });
        await req.db.exec(userSql.query);

        // Audit Log - Update user details
        for (const key in old_UserDetails) {
          if (old_UserDetails.hasOwnProperty(key) && userDetails[key] !== old_UserDetails[key]) {
            const data = {
              companyCode: 'AI',
              companyId: Cid,
              userId: Uid,
              module: 'User Profile',
              eventId: `Update - User Details`,
              finalStatus: 'S',
              finalStatusMessage: `${key} Updated`,
              oldValue: old_UserDetails[key],
              newValue: userDetails[key],
            };
            auditlog(db, data);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }

    /** User Defaults */
    if (Object.keys(defaultDetails).length > 0) {
      try {
        if (defaultDetails.hasOwnProperty('DEFAULTPERIOD')) {
          const old_UserDefaults = await db.exec(`SELECT DEFAULTPERIOD FROM USERDEFAULT WHERE USERID='${Uid}'`)[0];

          const tmpQrySupplier = jsonSql.build({
            type: 'insert',
            table: 'USERDEFAULT',
            values: { USERID: Uid, DEFAULTPERIOD: defaultDetails.DEFAULTPERIOD },
            condition: { USERID: Uid },
          });
          const queryIDH = `UPSERT ${tmpQrySupplier.query.substring(12)}`;
          await db.exec(queryIDH);
          delete userDetails.DEFAULTPERIOD;

          // Audit Log - Update user Defaults
          const data = {
            companyCode: 'AI',
            companyId: Cid,
            userId: Uid,
            module: 'User Profile',
            eventId: `Update - Default Period`,
            finalStatus: 'S',
            finalStatusMessage: `DEFAULTPERIOD Updated`,
            oldValue: old_UserDefaults.DEFAULTPERIOD,
            newValue: defaultDetails.DEFAULTPERIOD,
          };
          auditlog(db, data);
        }
      } catch (error) {
        console.log(error);
      }
    }

    /**Company Details */
    if (Object.keys(companyDetails).length > 0) {
      try {
        const keys = Object.keys(companyDetails).join(',');
        const old_companyDetails = await db.exec(`SELECT ${keys} FROM COMPANYMASTER WHERE ID='${Cid}'`)[0];

        companyDetails.MODIFIEDAT = currentDate;
        companyDetails.MODIFIEDBY = user;
        var companySql = jsonSql.build({
          type: 'update',
          table: 'COMPANYMASTER',
          condition: { ID: Cid },
          modifier: companyDetails,
        });
        await req.db.exec(companySql.query);

        // Audit Log - Update user details
        for (const key in old_companyDetails) {
          if (old_companyDetails.hasOwnProperty(key) && companyDetails[key] !== old_companyDetails[key]) {
            const data = {
              companyCode: 'AI',
              companyId: Cid,
              userId: Uid,
              module: 'User Profile',
              eventId: `Update - Company Details`,
              finalStatus: 'S',
              finalStatusMessage: `${key} Updated`,
              oldValue: old_companyDetails[key],
              newValue: companyDetails[key],
            };
            auditlog(db, data);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }

    /**GSTIN Details */
    if (gstinDetails.deletedItems.length > 0) {
      try {
        let deletedGSTINs = gstinDetails.deletedItems;
        for (let i = 0; i < deletedGSTINs.length; i++) {
          const GSTIN = deletedGSTINs[i];
          // await db.exec(`DELETE FROM COMPANYGSTIN WHERE COMPANYID = '${Cid}' AND GSTIN = '${GSTIN}'`);
          // await db.exec(`DELETE FROM COMPANYGSTINADRESSES WHERE GSTIN='${GSTIN}' AND COMPANYID='${Cid}'`);
          // await db.exec(`DELETE FROM USERDEFAULTGSTIN WHERE GSTIN='${GSTIN}'`);

          const deleteCOMPANYGSTINQuery = 'DELETE FROM COMPANYGSTIN WHERE COMPANYID = ? AND GSTIN = ?';
          await db.exec(deleteCOMPANYGSTINQuery, [Cid, GSTIN]);

          const deleteCompanyGSTINAddressQuery = 'DELETE FROM COMPANYGSTINADRESSES WHERE GSTIN=? AND COMPANYID=?';
          await db.exec(deleteCompanyGSTINAddressQuery, [GSTIN, Cid]);

          const deleteUserGSTINQuery = 'DELETE FROM USERDEFAULTGSTIN WHERE GSTIN=?';
          await db.exec(deleteUserGSTINQuery, [GSTIN]);

          /**Audit Log - GSTIN Delete */
          const data = {
            companyCode: 'AI',
            companyId: Cid,
            userId: Uid,
            module: 'User Profile',
            eventId: 'Delete - GSTIN Detail',
            finalStatus: 'S',
            finalStatusMessage: 'GSTIN Deleted',
            oldValue: GSTIN,
            newValue: '',
          };
          auditlog(db, data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (gstinDetails.addedItems.length > 0) {
      try {
        const GSTINDet = gstinDetails.addedItems;
        for (let i = 0; i < GSTINDet.length; i++) {
          const addedObj = GSTINDet[i];
          const ifGSTINExists = await db.exec(`SELECT * FROM COMPANYGSTIN WHERE GSTIN='${addedObj.GSTIN}' AND COMPANYID='${Cid}'`);
          if (ifGSTINExists.length == 0) {
            addedObj.COMPANYID = Cid;
            addedObj.CREATEDAT = currentDate;
            addedObj.CREATEDBY = user;
            const gstinSql = jsonSql.build({
              type: 'insert',
              table: 'COMPANYGSTIN',
              values: addedObj,
            });
            if (UserRole == 'Admin') {
              await db.exec(gstinSql.query);

              /** Audit Log - Create GSTIN Detail */
              const data = {
                companyCode: 'AI',
                companyId: Cid,
                userId: Uid,
                module: 'User Profile',
                eventId: 'Create - GSTIN Detail',
                finalStatus: 'S',
                finalStatusMessage: 'GSTIN Detail Created',
                oldValue: '',
                newValue: addedObj.GSTIN,
              };
              auditlog(db, data);
            }
          }

          /** Insert Default GSTIN */
          const newDefaultGSTIN = {
            CREATEDAT: currentDate,
            CREATEDBY: user,
            COMPANYID: Cid,
            USERID: Uid,
            GSTIN: addedObj.GSTIN,
            ISDEFAULT: addedObj.DEFAULT ?? false,
          };
          var gstinDefaultSql = jsonSql.build({
            type: 'insert',
            table: 'USERDEFAULTGSTIN',
            values: newDefaultGSTIN,
          });
          await db.exec(gstinDefaultSql.query);
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (Object.keys(gstinDetails.editedItems).length > 0) {
      try {
        const GSTINs = Object.keys(gstinDetails.editedItems);
        for (let i = 0; i < GSTINs.length; i++) {
          const aId = GSTINs[i];
          const editObj = gstinDetails.editedItems[aId];

          const keys = Object.keys(editObj).join(',');
          const old_GSTINDetails = await db.exec(`SELECT ${keys} FROM COMPANYGSTIN WHERE COMPANYID='${Cid}' AND GSTIN = '${aId}'`)[0];

          if (editObj) {
            editObj.MODIFIEDAT = currentDate;
            editObj.MODIFIEDBY = user;
            var gstinSql = jsonSql.build({
              type: 'update',
              table: 'COMPANYGSTIN',
              condition: { COMPANYID: Cid, GSTIN: aId },
              modifier: editObj,
            });

            await db.exec(gstinSql.query);

            /** Update Default GSTIN */
            if (editObj.hasOwnProperty('DEFAULT')) {
              const newDefaultGSTIN = {
                MODIFIEDAT: currentDate,
                MODIFIEDBY: user,
                ISDEFAULT: editObj.DEFAULT,
              };
              var gstinDefaultSql = jsonSql.build({
                type: 'update',
                table: 'USERDEFAULTGSTIN',
                condition: { COMPANYID: Cid, USERID: Uid, GSTIN: aId },
                modifier: newDefaultGSTIN,
              });

              await db.exec(gstinDefaultSql.query);
            }

            // Audit Log - Update GSTIN details
            for (const key in old_GSTINDetails) {
              if (old_GSTINDetails.hasOwnProperty(key) && editObj[key] !== old_GSTINDetails[key]) {
                if (key === 'GSTCERTIFICATE') {
                  const data = {
                    companyCode: 'AI',
                    companyId: Cid,
                    userId: Uid,
                    module: 'User Profile',
                    eventId: `Update - GSTIN Details`,
                    finalStatus: 'S',
                    finalStatusMessage: `Attachment Updated/Deleted`,
                    oldValue: '',
                    newValue: '',
                  };
                  auditlog(db, data);
                }
              }
            }
          }
        }

        const arr = Object.entries(gstinDetails.editedItems);

        let newGst = null;
        let oldGst = null;

        arr.forEach(([key, value]) => {
          if (value.DEFAULT === true) {
            newGst = key;
          } else {
            oldGst = key;
          }
        });

        const data = {
          companyCode: 'AI',
          companyId: Cid,
          userId: Uid,
          module: 'User Profile',
          eventId: `Update - GSTIN Details`,
          finalStatus: 'S',
          finalStatusMessage: ` Updated`,
          oldValue: oldGst,
          newValue: newGst,
        };

        auditlog(db, data);
      } catch (error) {
        console.log(error);
      }
    }

    /** GSTIN Address */
    if (gstinAddress.hasOwnProperty('deletedItems')) {
      try {
        for (let i = 0; i < gstinAddress.deletedItems.length; i++) {
          const element = gstinAddress.deletedItems[i];
          const old_address = await db.exec(`SELECT * FROM COMPANYGSTINADRESSES WHERE GSTIN='${element.GSTIN}' AND SERIALNO = ${element.SERIALNO}`)[0];
          await db.exec(`DELETE FROM COMPANYGSTINADRESSES WHERE GSTIN='${element.GSTIN}' AND SERIALNO = ${element.SERIALNO}`);

          /** Audit Log - GSTIN Delete */
          const data = {
            companyCode: 'AI',
            companyId: Cid,
            userId: Uid,
            module: 'User Profile',
            eventId: 'Delete GSTIN Address',
            finalStatus: 'S',
            finalStatusMessage: 'GSTIN Address Deleted',
            oldValue: element.GSTIN,
            newValue: '',
          };

          auditlog(db, data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (gstinAddress.hasOwnProperty('editedItems')) {
      try {
        for (let i = 0; i < gstinAddress.editedItems.length; i++) {
          const element = gstinAddress.editedItems[i];

          const keys = Object.keys(element).join(',');
          const old_GSTINAddresses = await db.exec(`SELECT ${keys} FROM COMPANYGSTINADRESSES WHERE SERIALNO='${element.SERIALNO}' AND GSTIN = '${element.GSTIN}'`)[0];

          element.MODIFIEDAT = currentDate;
          element.MODIFIEDBY = user;
          let gstinSql = jsonSql.build({
            type: 'update',
            table: 'COMPANYGSTINADRESSES',
            condition: { GSTIN: element.GSTIN, SERIALNO: element.SERIALNO },
            modifier: element,
          });
          await db.exec(gstinSql.query);

          // Audit Log - Update GSTIN Address details
          for (const key in old_GSTINAddresses) {
            if (old_GSTINAddresses.hasOwnProperty(key) && element[key] !== old_GSTINAddresses[key]) {
              const data = {
                companyCode: 'AI',
                companyId: Cid,
                userId: Uid,
                module: 'User Profile',
                eventId: `Update - GSTIN Address`,
                finalStatus: 'S',
                finalStatusMessage: `${key} Updated`,
                oldValue: old_GSTINAddresses[key],
                newValue: element[key],
              };
              auditlog(db, data);
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (gstinAddress.hasOwnProperty('addedItems')) {
      try {
        for (let i = 0; i < gstinAddress.addedItems.length; i++) {
          const element = gstinAddress.addedItems[i];
          const ifGSTINExists = await db.exec(`SELECT * FROM COMPANYGSTINADRESSES WHERE GSTIN='${element.GSTIN}' AND COMPANYID='${Cid}'`);

          if (UserRole != "User") {

            element.CREATEDAT = currentDate;
            element.CREATEDBY = user;
            element.companyId = Cid;
            let gstinSql = jsonSql.build({
              type: 'insert',
              table: 'COMPANYGSTINADRESSES',
              values: element,
            });
            await db.exec(gstinSql.query);

            /** Audit Log - Create GSTIN Address */
            const data = {
              companyCode: 'AI',
              companyId: Cid,
              userId: Uid,
              module: 'User Profile',
              eventId: 'Create - GSTIN Address',
              finalStatus: 'S',
              finalStatusMessage: 'GSTIN Address Created',
              oldValue: '',
              newValue: element.GSTIN + ': ' + element.ADDRESS + ',' + element.CITY + ',' + element.STATE + ',' + element.PINCODE,
            };
            auditlog(db, data);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }

    /**User Roles */
    if (userRoleDetails) {
      if (Object.keys(userRoleDetails.editedItems).length > 0) {
        try {
          const roles = Object.keys(userRoleDetails.editedItems);
          for (let i = 0; i < roles.length; i++) {
            const aId = roles[i];
            const editObj = userRoleDetails.editedItems[aId];

            const keys = Object.keys(editObj).join(',');

            const old_companyUserRoles = await db.exec(`SELECT ${keys} FROM COMPANYUSERROLES WHERE COMPANYID='${Cid}' AND USERID = '${aId}'`)[0];
            const companyUserData = await db.exec(`SELECT LOGINEMAIL FROM COMPANYUSERS WHERE ID='${aId}'`);

            if (editObj) {
              editObj.MODIFIEDAT = currentDate;
              editObj.MODIFIEDBY = user;
              var roleSql = jsonSql.build({
                type: 'update',
                table: 'COMPANYUSERROLES',
                condition: { COMPANYID: Cid, USERID: aId },
                modifier: editObj,
              });

              await db.exec(roleSql.query);

              // Audit Log - Update GSTIN Address details
              let message = '';

              for (const key in old_companyUserRoles) {
                if (old_companyUserRoles.hasOwnProperty(key) && editObj[key] !== old_companyUserRoles[key]) {
                  if (key === 'CANEDITGST') {
                    message = 'User Role for Edit GSTIN';
                  }
                  if (key === 'CANADDGSTIN') {
                    message = 'User Role for Add GSTIN or UIN';
                  }
                  if (key === 'CANAMENDMENTAPPROVE') {
                    message = 'User Role for approve Amendement';
                  }
                  if (key === 'CANAMENDMENTREQUEST') {
                    message = 'User Role for Request Amendement';
                  }
                  const data = {
                    companyCode: 'AI',
                    companyId: Cid,
                    userId: Uid,
                    module: 'User Profile',
                    eventId: `Update - ${message}`,
                    finalStatus: 'S',
                    finalStatusMessage: `Authorization for ${companyUserData[0].LOGINEMAIL} has been updated`,
                    oldValue: old_companyUserRoles[key] ? ` Enabled` : ` Disabled`,
                    newValue: editObj[key] ? ` Enabled` : ` Disabled`,
                  };
                  auditlog(db, data);
                }
              }
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    }

    /**Attachment Details */
    if (Object.keys(attachmentDetails.editedItems).length > 0) {
      try {
        const attachments = Object.keys(attachmentDetails.editedItems);
        for (let i = 0; i < attachments.length; i++) {
          const aId = attachments[i];
          const editObj = attachmentDetails.editedItems[aId];
          if (editObj) {
            const keys = Object.keys(editObj).join(',');
            const old_documents = await db.exec(`SELECT ${keys} FROM COMPANYDOCUMENTS WHERE ID='${aId}' AND COMPANYID = '${Cid}'`)[0];
            const companyCode = await db.exec(`SELECT COMPANYDOCUMENTS.DOCUMENTTYPECODE FROM COMPANYDOCUMENTS WHERE ID='${aId}' AND COMPANYID = '${Cid}'`)[0];
            var attachmentSql = jsonSql.build({
              type: 'update',
              table: 'COMPANYDOCUMENTS',
              condition: { ID: aId, COMPANYID: Cid },
              modifier: editObj,
            });
            await db.exec(attachmentSql.query);
            const documentCode = await db.exec(`SELECT DOCUMENTCATEGORY.DOCUMENTNAME FROM DOCUMENTCATEGORY WHERE DOCUMENTTYPECODE='${companyCode.DOCUMENTTYPECODE}'
            `)[0];
            let dateMessage;
            // Audit Log - Update Documents
            for (const key in old_documents) {
              if (old_documents.hasOwnProperty(key) && editObj[key] !== old_documents[key]) {
                if (key == 'ISSUEDON') {
                  dateMessage = 'Issue Date';
                }
                if (key == 'VALIDTO') {
                  dateMessage = 'Valid To Date';
                }
                if (key == 'VALIDFROM') {
                  dateMessage = 'Valid from Date';
                }
                let data;
                if (key === 'FILE') {
                  data = {
                    companyCode: 'AI',
                    companyId: Cid,
                    userId: Uid,
                    module: 'User Profile',
                    eventId: `Update - Documents`,
                    finalStatus: 'S',
                    finalStatusMessage: `File of ${documentCode.DOCUMENTNAME} Updated/Deleted`,
                    oldValue: '',
                    newValue: '',
                  };
                }
                else if (key === 'FILENAME' || key === 'MIMETYPE') {
                  data = undefined
                }
                else {
                  data = {
                    companyCode: 'AI',
                    companyId: Cid,
                    userId: Uid,
                    module: 'User Profile',
                    eventId: `Update - Documents`,
                    finalStatus: 'S',
                    finalStatusMessage: `${documentCode.DOCUMENTNAME} ${dateMessage} Updated`,
                    oldValue: old_documents[key],
                    newValue: editObj[key],
                  };
                }
                data != undefined && auditlog(db, data);
              }
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    }

    return res.status(200).send(generateResponse('Success', 'Updated succesfully', 'B', 'S', null, false, null));
  } catch (error) {
    res.status(503).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};



const resetPassword = async (req, res) => {
  try {
    const { UserRole, Cid, Email, Uid } = req.user;
    const db = req.db;
    const { oldPassword, newPassword } = req.body;

    const companyUser = await db.exec(`SELECT STATUS,LOGINEMAIL,PASSWORD FROM COMPANYUSERS WHERE ID='${Uid}' AND COMPANYID='${Cid}'`)[0];

    //compare old password same as new password
    if (oldPassword === newPassword) {
      return res.status(401).send(generateResponse('Failed', 'Old and new passwords cannot be the same.', 'B', 'E', null, true, null));
    }

    //compare old password same or not in db
    const passMatched = await bcrypt.compare(oldPassword, companyUser.PASSWORD);
    if (!passMatched) return res.status(401).send(generateResponse('Failed', 'The password doesnt match.', 'B', 'E', null, true, null));

    //update
    const hashPassword = await bcrypt.hash(newPassword, 12);

    await db.exec(`UPDATE COMPANYUSERS
        SET 
          PASSWORD = '${hashPassword}',
          LASTPASSWORDCHANGEDON = CURRENT_TIMESTAMP,
          MODIFIEDAT = CURRENT_TIMESTAMP, 
          MODIFIEDBY = '${Email}'
        WHERE 
          ID='${Uid}' AND COMPANYID='${Cid}'`);
    const data = {
      companyCode: 'AI',
      companyId: Cid,
      userId: Uid,
      module: 'User Profile',
      eventId: ' Reset Password',
      finalStatus: 'S',
      finalStatusMessage: `  The password was changed successfully.`,
      oldValue: '',
      newValue: 'Password Changed ',
    };
    auditlog(db, data);

    return res.status(200).send(generateResponse('Success', '  The password was changed successfully.', 'B', 'S', null, false, null));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

const fetchIataCode = async (req, res) => {
  try {
    const db = req.db;
    const { Cid } = req.user;

    let newIAtaArray = []
    const iataList = await db.exec(`SELECT DISTINCT IATACODE as "IATANUMBER" FROM COMPANYIATA WHERE COMPANYID='${Cid}'`);

    iataList?.map((item) => {

      const newAddedIata = db.exec(`SELECT DISTINCT IATANUMBER  FROM AGENTMASTER WHERE CROSSREFERENCEAGENTNUM='${item.IATANUMBER}'`);

      if (newAddedIata.length != 0) {
        newIAtaArray = iataList.concat(newAddedIata)
      }
     


      newIAtaArray = _.uniqBy(newIAtaArray, 'IATANUMBER');

      return newIAtaArray
    })


    return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { IATA:  newIAtaArray.length>0?newIAtaArray:iataList }));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

fetchIATADetails = async (req, res) => {
  try {
    const db = req.db;
    const iatas = req.body;
    const iataDetails = iatas.map((iatas) => `'${iatas}'`).join(',');
    const filterediataDetails = await db.exec(
      `SELECT DISTINCT IATANUMBER , SITETYPE, LEGALNAME,TRADENAME, CITY,REGION,COUNTRYNAME,POSTALCODE FROM AGENTMASTER WHERE IATANUMBER IN  (${iataDetails})`
    );
    return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { IATADetails: filterediataDetails }));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

module.exports = {
  getProfileDetails,
  fetchGSTINsForPAN,
  fetchGSTINDetails,
  blockUser,
  unBlockUser,
  approveUser,
  editProfile,

  activateUser,
  rejectUser,
  resetPassword,
  fetchIataCode,
  fetchIATADetails,
};
