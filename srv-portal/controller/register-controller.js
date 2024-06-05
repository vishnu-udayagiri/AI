const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const isEmail = require('validator/lib/isEmail');
const { auditlog } = require('../libs/auditlog');
const { generateResponse } = require('../libs/response.js');
const { generateJWT, verifyJWT } = require('../libs/jwt');
const { generateOTP, sendEMail, generatePassword } = require('../libs/otp.js');
const { CompanyUserRole, sanitizeString } = require('../utils/common-query.js');
const { getAgents } = require('../db/agent.db.js');
const { getConsulateGSTINs, getCountryCodes, getCompanyDetails, unbodies, getCountryCodesIATA, getEmbassys } = require('../db/masters.db.js');
const {
  getUserDetails,
  getCountryFromCompany,
  getIATAFromCompany,
  getGSTINFromCompany,
  getNameCompany,
  getCompanyGstinName,
  getIATACompanyName,
  getUnShortName,
} = require('../db/user.db.js');

const checkUserRole = async (req, res) => {
  try {
    const { PAN, Email } = req.query;
    const db = req.db;
    if (!PAN) return res.status(400).send(generateResponse('Failed', 'PAN is required.', 'B', 'E', null, true, null));
    if (!Email) return res.status(400).send(generateResponse('Failed', 'Email is required', 'B', 'E', null, true, null));
    if (typeof PAN !== 'string' || PAN?.length !== 10) return res.status(400).send(generateResponse('Failed', 'Invalid PAN. number', 'B', 'E', null, true, null));
    if (!isEmail(Email)) return res.status(400).send(generateResponse('Failed', 'The email address is invalid..', 'B', 'E', null, true, null));

    const registeredUser = await req.db.exec(`SELECT * FROM COMPANYUSERS WHERE LOWER(LOGINEMAIL) = LOWER('${Email}') AND STATUS != 'X' `);
    let userExists = false;
    if (registeredUser.length > 0) userExists = true;

    if (userExists) {
      return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { userExists }));
    }
    // let validPan = await fetchPANDetails(PAN);
    // if (!validPan.response.success) return res.status(500).send(generateResponse('Success', 'Invalid PAN.', 'B', 'E', null, true, null));

    const users = await req.db.exec(CompanyUserRole(null, null, null, PAN, null));

    const existingUser = users.find((user) => user.Email === Email);

    let UserRole = 'Admin';
    if (existingUser) {
      userExists = true;
    } else {
      if (users.length > 0) {
        UserRole = 'User';
      }
    }
    if (userExists) {
      return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { userExists }));
    } else {
      const jwtPayload = {
        PAN,
        Email,
        UserRole,
      };
      const token = generateJWT(jwtPayload, '10m', 'REG');
      return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { userExists, userRole: UserRole, token }));
    }
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Error', 'B', 'E', null, true, null));
  }
};

const checkConsulate = async (req, res) => {
  try {
    const db = req.db;
    const { Email, Category } = req.query;
    if (!Email) return res.status(400).send(generateResponse('Failed', 'Email is required', 'B', 'E', null, true, null));
    if (!isEmail(Email)) return res.status(400).send(generateResponse('Failed', 'The email address is invalid..', 'B', 'E', null, true, null));

    const query = "SELECT * FROM COMPANYUSERS WHERE LOWER(LOGINEMAIL) = LOWER(?) AND STATUS != ? AND STATUS != 'X'";
    const registeredUser = await db.exec(query, [Email, 'D']);
    let userExists = false;
    if (registeredUser.length > 0) userExists = true;

    if (userExists) {
      return res.status(200).send(generateResponse('Failed', 'User already exists', 'B', 'S', null, false, { userExists }));
    }

    let data = [];

    switch (Category) {
      case '05':
        break;
      case '07':
        break;
      case '08':
        break;
      default:
        break;
    }

    const jwtPayload = {
      Email,
    };
    const token = generateJWT(jwtPayload, '10m', 'REG');
    return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { userExists, token }));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Error', 'B', 'E', null, true, null));
  }
};

const getCategoryDetails = async (req, res) => {
  try {
    const db = req.db;
    const { Email, Category } = req.query;
    // if (!Email) return res.status(400).send(generateResponse('Failed', 'Email is required', 'B', 'E', null, true, null));
    if (!Category) return res.status(400).send(generateResponse('Failed', 'Category is required', 'B', 'E', null, true, null));

    let data = [];

    switch (Category) {
      case '05':
        data = await unbodies(db);
        break;
      case '07':
        data = await getCountryCodesIATA(db);
        break;
      case '08':
        data = await getEmbassys(db);
        break;
      default:
        break;
    }
    return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { data }));
  } catch (error) {
    console.log(error);
    return res.status(500).send(generateResponse('Failed', 'Error', 'B', 'E', null, true, null));
  }
};

const countryiata = async (req, res) => {
  try {
    const db = req.db;
    const { Country } = req.query;
    if (!Country) return res.status(400).send(generateResponse('Failed', 'Country is required.', 'B', 'E', null, true, null));
    let data = [];
    data = await req.db.exec(`SELECT IATANUMBER FROM AGENTMASTER WHERE COUNTRY_CODE = '${Country}' AND SITETYPE IN ('HE','GE')`);
    return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { data }));
  } catch (error) {
    console.log(error);
    return res.status(500).send(generateResponse('Failed', 'Error', 'B', 'E', null, true, null));
  }
};

const checkUserRoleV2 = async (req, res) => {
  try {
    const db = req.db;

    const { param1, param2, param3, category } = req.query;

    if (category) {
      switch (category) {
        case '05': {
          if (!param1) return res.status(400).send(generateResponse('Failed', 'Short name is required', 'B', 'E', null, true, null));
          if (!param2) return res.status(400).send(generateResponse('Failed', 'Email is required', 'B', 'E', null, true, null));
          if (!category) return res.status(400).send(generateResponse('Failed', 'Category is required', 'B', 'E', null, true, null));
          //const gstin = param1?.trim();
          const email = param2?.trim()?.toLowerCase();
          if (!isEmail(email)) return res.status(400).send(generateResponse('Failed', 'The email address is invalid..', 'B', 'E', null, true, null));
          let userExists = false;
          const registeredUser = (await getUserDetails(db, email)).data;
          if (registeredUser) {
            userExists = true;

            return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { userExists }));
          }
          const existingUser = (await getUnShortName(db, param1)).data;
          let UserRole = 'User';
          if (existingUser) {
            UserRole = 'User';
          } else {
            UserRole = 'Admin';
          }
          if (userExists) {
            return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { userExists }));
          } else {
            const jwtPayload = {
              email,
              UserRole,
              category,
              param1,
            };
            const token = generateJWT(jwtPayload, '10m', 'REG');
            return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { userExists, userRole: UserRole, token }));
          }
        }
        case '07': {
          if (!param1) return res.status(400).send(generateResponse('Failed', 'Agent code is required.', 'B', 'E', null, true, null));
          if (!param2) return res.status(400).send(generateResponse('Failed', 'Email is required', 'B', 'E', null, true, null));
          if (!param3) return res.status(400).send(generateResponse('Failed', 'Country is required.', 'B', 'E', null, true, null));
          if (!category) return res.status(400).send(generateResponse('Failed', 'Category is required', 'B', 'E', null, true, null));
          const agentCode = param1?.trim();
          const email = param2?.trim()?.toLowerCase();
          if (agentCode) {
            const agentInMaster = await req.db.exec(`SELECT * FROM AGENTMASTER WHERE SITETYPE IN ('HE', 'GE') AND IATANUMBER = ${agentCode} AND COUNTRY_CODE = '${param3}'`);
            if (agentInMaster.length) {
              if (!isEmail(email)) return res.status(400).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
              let userExists = false;
              const registeredUser = (await getUserDetails(db, email)).data;
              if (registeredUser) {
                userExists = true;
                return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { userExists }));
              }
              const existingUser = (await getIATAFromCompany(db, agentCode)).data;
              let UserRole = 'User';
              if (existingUser) {
                UserRole = 'User';
              } else {
                UserRole = 'Admin';
              }

              if (userExists) {
                return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { userExists }));
              } else {
                const jwtPayload = {
                  email,
                  UserRole,
                  category,
                  agentCode,
                };
                const token = generateJWT(jwtPayload, '10m', 'REG');
                return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { userExists, userRole: UserRole, token }));
              }
            } else {
              return res.status(500).send(generateResponse('Failed', 'IATA Number is Invalid.', 'B', 'E', null, true, null));
              //res.status(400).send(generateResponse('Failed', 'IATA Number is Invalid.', 'B', 'S', null, false, {}));
            }
          } else {
            res.status(500).send(generateResponse('Failed', 'Agent Code is Invalid.', 'B', 'S', null, false, {}));
          }
        }
        case '08': {
          if (!param1) return res.status(400).send(generateResponse('Failed', 'Country is required.', 'B', 'E', null, true, null));
          if (!param2) return res.status(400).send(generateResponse('Failed', 'Email is required', 'B', 'E', null, true, null));
          if (!category) return res.status(400).send(generateResponse('Failed', 'Category is required', 'B', 'E', null, true, null));
          const countryCode = param1?.trim()?.toUpperCase();
          const email = param2?.trim()?.toLowerCase();
          if (!isEmail(email)) return res.status(400).send(generateResponse('Failed', 'The email address is invalid..', 'B', 'E', null, true, null));

          let userExists = false;
          const registeredUser = (await getUserDetails(db, email)).data;

          if (registeredUser) {
            userExists = true;
            return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { userExists }));
          }

          const existingUser = (await getCountryFromCompany(db, countryCode)).data;

          let UserRole = 'User';
          if (existingUser) {
          } else {
            UserRole = 'Admin';
          }

          if (userExists) {
            return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { userExists }));
          } else {
            const jwtPayload = {
              email,
              UserRole,
              category,
              countryCode,
            };
            const token = generateJWT(jwtPayload, '10m', 'REG');
            return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { userExists, userRole: UserRole, token }));
          }
        }
        case 'others':
          break;
        default:
          break;
      }
    }
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Error', 'B', 'E', null, true, null));
  }
};

const generateOTPforRegistration = async (req, res) => {
  try {
    const { db } = req;
    let { PAN, email, UserRole, category, countryCode, agentCode, gstin, Email, param1 } = req.context;

    // If 'Email' is present, use it instead of 'email'
    if (Email) {
      email = Email;
    }

    // Validation checks
    if (!email) return res.status(401).send(generateResponse('Failed', 'Email is required', 'B', 'E', null, true, null));
    if (!isEmail(email)) return res.status(401).send(generateResponse('Failed', 'The email address is invalid..', 'B', 'E', null, true, null));
    if (!UserRole) return res.status(401).send(generateResponse('Failed', 'Role is required.', 'B', 'E', null, true, null));

    var categoryCode;

    // Switch statement for category-specific codes
    switch (category) {
      case '05':
        categoryCode = param1;
        if (!param1) return res.status(401).send(generateResponse('Failed', 'Invalid Token', 'B', 'E', null, true, null));
        break;

      case '07':
        categoryCode = agentCode;
        if (!agentCode) return res.status(401).send(generateResponse('Failed', 'Agent code is required.', 'B', 'E', null, true, null));
        break;

      case '08':
        categoryCode = countryCode;
        if (!countryCode) return res.status(401).send(generateResponse('Failed', 'Country is required.', 'B', 'E', null, true, null));
        break;

      case 'others':
        // Handle 'others' case if needed
        break;

      default:
        categoryCode = PAN;
        if (!PAN) return res.status(401).send(generateResponse('Failed', 'PAN is required.', 'B', 'E', null, true, null));
        break;
    }

    // Check if OTP already sent for the countryCode within the last 10 minutes
    const existingOTP = await db.exec(
      `SELECT * FROM "AUTHOTP" WHERE (CATEGORYCODE = '${categoryCode}' OR EMAIL = '${email}') AND CREATEDAT >= ADD_SECONDS(CURRENT_TIMESTAMP, -600)`
    );

    if (existingOTP && existingOTP.length > 0 && UserRole == 'Admin') {
      return res.status(401).send(generateResponse('Failed', 'OTP already sent within the last 10 minutes.', 'B', 'E', null, true, null));
    } else {
      // Generate new OTP
      const otpId = uuidv4();
      const otp = generateOTP();
      // Insert new OTP entry into the database
      await db.exec(
        `INSERT INTO "AUTHOTP" VALUES('${otpId}', '${otp}', '${Email ?? email}', false, '', CURRENT_TIMESTAMP, ADD_SECONDS(CURRENT_TIMESTAMP, 60*2), '${categoryCode}')`
      );

      // Send email with the OTP
      //const userDetails = await db.exec(`SELECT FIRSTNAME, LASTNAME FROM COMPANYUSERS WHERE LOGINEMAIL='${Email ?? email}'`);
      const name = Email ?? email;
      sendEMail(otp, email, 'LOGIN', name);

      // Update context and generate JWT token
      req.context.id = otpId;
      req.context.Email = email;
      const token = generateJWT({ ...req.context }, '10m', 'REG');

      // Send success response with token
      return res.status(200).send(generateResponse('Success', 'OTP sent successfully.', 'T', 'S', 'null', false, { token }));
    }
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

const verifyOTPforRegistration = async (req, res) => {
  try {
    const db = req.db;
    const { id, UserRole, email, PAN, countryCode, category, agentCode, gstin, Email, param1 } = req.context;
    const { otp } = req.body;
    if (!id) return res.status(401).send(generateResponse('Failed', 'Invalid Token', 'B', 'E', null, true, null));
    if (!otp) return res.status(401).send(generateResponse('Failed', 'You must provide an OTP..', 'B', 'E', null, true, null));
    const validity = await req.db.exec(`UPDATE "AUTHOTP"
                                          SET "VERIFIED" = true
                                          WHERE "ID" = '${id}' 
                                          AND "OTP" = '${otp}' 
                                          AND "EMAIL" = '${Email}'
                                          AND "VERIFIED" = false
                                          AND "EXPIRESON" > CURRENT_TIMESTAMP`);
    if (validity === 0) return res.status(401).send(generateResponse('Failed', 'Invalid OTP', 'B', 'E', null, true, { verified: false }));

    if (category) {
      switch (category) {
        case '05': {
          if (!param1) return res.status(400).send(generateResponse('Failed', 'Short name is required', 'B', 'E', null, true, null));
          if (!email) return res.status(400).send(generateResponse('Failed', 'Email is required', 'B', 'E', null, true, null));
          if (!category) return res.status(400).send(generateResponse('Failed', 'Category is required', 'B', 'E', null, true, null));
          const Name = (await getCompanyGstinName(db, param1)).data;
          if (Name) {
            companyName = Name.LEGALNAMEOFBUSINESS;
          } else {
            companyName = '';
          }
          const token = generateJWT({ session: 'VALID', ...req.context }, '2h', 'REG');

          return res.status(200).send(
            generateResponse('Success', 'OTP Verified succesfully', 'T', 'S', 'null', false, {
              verified: true,
              token,
              userRole: UserRole,
              email: email,
              shortName: param1,
              category: category,
              companyName: companyName,
            })
          );
        }
        case '07': {
          if (!agentCode) return res.status(400).send(generateResponse('Failed', 'Agent code is required.', 'B', 'E', null, true, null));
          if (!email) return res.status(400).send(generateResponse('Failed', 'Email is required', 'B', 'E', null, true, null));
          if (!category) return res.status(400).send(generateResponse('Failed', 'Category is required', 'B', 'E', null, true, null));

          const Name = await req.db.exec(`SELECT LEGALNAME,COUNTRY_CODE, REGION, REGIONCODE,CITY,POSTALCODE FROM AGENTMASTER WHERE IATANUMBER = ${agentCode}`)[0];
          const companyName = Name.LEGALNAME ?? '';
          const countryCode = Name.COUNTRY_CODE ?? '';
          const regionName = Name.REGION ?? '';
          const regionCode = Name.REGIONCODE ?? '';
          const city = Name.CITY ?? '';
          const postalCode = Name.POSTALCODE ?? '';
          const token = generateJWT({ session: 'VALID', ...req.context }, '2h', 'REG');

          return res.status(200).send(
            generateResponse('Success', 'OTP Verified succesfully', 'T', 'S', 'null', false, {
              verified: true,
              token,
              userRole: UserRole,
              email: email,
              data: agentCode,
              category: category,
              companyName: companyName,
              countryCode: countryCode,
              regionCode: regionCode,
              city: city,
              postalCode: postalCode,
              regionName: regionName,
            })
          );
        }
        case '08': {
          if (!countryCode) return res.status(400).send(generateResponse('Failed', 'Country is required.', 'B', 'E', null, true, null));
          if (!email) return res.status(400).send(generateResponse('Failed', 'Email is required', 'B', 'E', null, true, null));
          if (!category) return res.status(400).send(generateResponse('Failed', 'Category is required', 'B', 'E', null, true, null));
          let companyName;
          const Name = (await getNameCompany(db, countryCode)).data;
          if (Name) {
            companyName = Name.LEGALNAMEOFBUSINESS ?? '';
          } else {
            companyName = '';
          }
          const token = generateJWT({ session: 'VALID', ...req.context }, '2h', 'REG');

          return res.status(200).send(
            generateResponse('Success', 'OTP Verified succesfully', 'T', 'S', 'null', false, {
              verified: true,
              token,
              userRole: UserRole,
              email: email,
              countryCode: countryCode,
              category: category,
              companyName: companyName,
            })
          );
        }
        default:
          const token = generateJWT({ session: 'VALID', ...req.context }, '2h', 'REG');

          return res.status(200).send(
            generateResponse('Success', 'OTP Verified succesfully', 'T', 'S', 'null', false, {
              verified: true,
              token,
              userRole: UserRole,
              email: email,
              pan: PAN,
              category: category,
            })
          );
      }
    } else {
      let validPan = await fetchPANDetails(PAN);
      if (validPan.data[0] == null) {
        return res.status(200).send(generateResponse('Failed', 'PAN is not registered with GSTIN.', 'B', 'E', null, false, { paninvalid: true }));
      } else {
        const token = generateJWT({ session: 'VALID', ...req.context }, '2h', 'REG');

        return res.status(200).send(
          generateResponse('Success', 'OTP Verified successfully', 'T', 'S', 'null', false, {
            verified: true,
            token,
            userRole: UserRole,
            email: Email,
            pan: PAN,
            category: category,
          })
        );
      }
    }
  } catch (error) {
    return res.status(200).send(generateResponse('Failed', 'PAN is not registered with GSTIN.', 'B', 'E', null, false, { paninvalid: true }));
  }
};

const resendRegOTP = async (req, res) => {
  const db = req.db;
  try {
    const bearer = req.headers.authorization;
    if (!bearer) return res.status(403).send(generateResponse('Failed', 'Authorization header missing', 'B', 'E', null, true, null));
    let token = bearer.split(' ')[1];
    if (!token) return res.status(403).send(generateResponse('Failed', 'Authorization token missing', 'B', 'E', null, true, null));
    try {
      var decoded = verifyJWT(token, 'REG');
    } catch (error) {
      return res.status(403).send(generateResponse('Failed', 'Session Expired.', 'B', 'E', null, true, null));
    }
    const { Uid, Cid, Email, PAN, category, countryCode, UserRole, email, param1, agentCode } = decoded;
    const otpId = uuidv4();
    const otp = generateOTP();

    const jwtPayload = {
      Cid,
      Uid,
      id: otpId,
      Email: Email ?? email,
      email: email ?? Email,
      PAN: PAN,
      category: category,
      countryCode: countryCode,
      UserRole: UserRole,
      param1: param1,
      agentCode: agentCode,
    };
    //const user = await req.db.exec(`SELECT LOGINEMAIL FROM COMPANYUSERS WHERE LOGINEMAIL = '${email}'`)[0];
    //if (!user) return res.status(401).send(generateResponse('Failed', 'Invalid User', 'B', 'E', null, true, null));
    await req.db.exec(`INSERT INTO "AUTHOTP" VALUES('${otpId}', '${otp}','${Email}', false,'', CURRENT_TIMESTAMP,ADD_SECONDS (CURRENT_TIMESTAMP, 60*2),'')`);
    const newToken = generateJWT(jwtPayload, '10m', 'REG');
    const name = Email;
    sendEMail(otp, Email, 'LOGIN', name);

    return res.status(200).send(generateResponse('Success', 'OTP is generated..', 'T', 'S', 'null', false, { token: newToken }));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Session Expired.', 'B', 'E', null, true, null));
  }
};

const fetchCompanyDetails = async (req, res) => {
  try {
    const { PAN, UserRole, category, countryCode, gstin, agentCode, param1 } = req.context;
    if (UserRole !== 'User') return res.status(401).send(generateResponse('Failed', 'Access Denied', 'B', 'E', null, false, null));
    //if (!PAN) return res.status(401).send(generateResponse('Failed', 'Invalid Token', 'B', 'E', null, false, null));
    // if (PAN.length !== 10) return res.status(401).send(generateResponse('Failed', 'Invalid PAN.', 'B', 'E', null, false, null));
    let companyDetails;
    if (category === '05') {
      companyDetails = await req.db.exec(` SELECT *
    FROM "COMPANYMASTER" WHERE "UNSHORTCODE" =  '${param1}'  `);
    } else if (category === '07') {
      companyDetails = await req.db.exec(`
        SELECT *
        FROM "COMPANYMASTER"
        WHERE "AGENTCODE" = '${agentCode}'
      `);
    } else if (category === '08') {
      companyDetails = await req.db.exec(`
        SELECT
          "CATEGORY","AGENTCODE","COMPANYNAME",
          "COMPANYREGISTRATIONNUMBER","COMPANYPAN",
          "COMPANYTAN","WEBSITE","CONTACTNUMBER",
          "ADDRESS","COUNTRY_CODE","STATE","CITY",
          "PINCODE","ISECOMMERCEOPERATOR"
        FROM "COMPANYMASTER"
        WHERE "CONSULATEEMBASSYCOUNTRY_CODE" = '${countryCode}'
      `);
    } else {
      // Handle the default case here
      companyDetails = await req.db.exec(`
        SELECT
          "CATEGORY","AGENTCODE","COMPANYNAME",
          "COMPANYREGISTRATIONNUMBER","COMPANYPAN",
          "COMPANYTAN","WEBSITE","CONTACTNUMBER",
          "ADDRESS","COUNTRY_CODE","STATE","CITY",
          "PINCODE","ISECOMMERCEOPERATOR"
        FROM "COMPANYMASTER"
        WHERE "COMPANYPAN" = '${PAN}'
      `);
    }

    if (companyDetails.length === 0) return res.status(401).send(generateResponse('Failed', 'Invalid Data', 'B', 'E', null, true, null));
    const company = companyDetails[0];

    return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { company }));
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
      console.log(error);
      console.error('Error in fetching data:', error);
      throw new Error('Failed to fetch PAN details');
    });
}

//@deprecated
const fetchGSTINsForPAN = async (req, res) => {
  try {
    const { PAN } = req.context;

    let gstins = await fetchPANDetails(PAN);
    let DbDatfilter = await fetchPANDetails(PAN);
    gstins = gstins.response.data.map((x) => ({ GSTIN: x.gstin }));

    const filteredGSTINS = gstins.filter((gstin) => gstin.GSTIN.substring(2, 12) === PAN);
    let gstTableData = await req.db.exec(
      `SELECT  GSTIN.ADDRESS AS ADDRESS,GSTIN.TAXPAYERTYPE AS GSTTYPE,GSTIN.LEGALNAME AS LEGALNAME,GSTIN.GSTIN AS GSTIN,GSTIN.DTREG AS DATEOFISSUEGST,
      GSTIN.TRADENAME AS TRADENAME,GSTIN.STATUS AS STATUS,GSTIN.POSTALCODE AS PINCODE,GSTIN.STATECODE AS STATE FROM GSTIN
       WHERE SUBSTRING(GSTIN, 3, 10) = '${PAN}' AND STATUS='A'`
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




    const newData = gstTableData.map(item => ({ ...item, PAN: `${PAN}`, STATUS: "Active", GSTTYPE: convertGSTType(item.GSTTYPE) }));




    const concatenatedArray = [...filteredGSTINS];

    newData.forEach(item => {
      const existingItem = filteredGSTINS.find(i => i.GSTIN === item.GSTIN);
      if (!existingItem) {
        concatenatedArray.push(item);
      }
    });


    try {
      function getStateCode(stateName) {
        let stateCode = req.db.exec(`SELECT STATECODES.STATECODE AS STATECODE FROM STATECODES WHERE STATENAME = ?`, [stateName]);


        return stateCode[0] && stateCode[0].STATECODE


      }

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
    console.log(error);
    return res.status(500).send(generateResponse('Failed', 'Error in fetching data', 'B', 'E', null, true, null));
  }
};
//@deprecated
const fetchGSTINDetails = async (req, res) => {
  try {
    const gstins = req.body;
    let response = await fetchPANDetails(gstins.substr(2, 10));
    response = gstins.response.data.filter((x) => x.gstin == gstins)[0];

    // const apiUrl = 'https://api.optieinvoice.com/dev/optiapi/gstindetails?gstin=' + gstins; // Replace with your API URL
    // const customHeader = {
    //   'x-api-key': 'FUWh96wGeMH8tcbR4Wt3AQ/2LXROqbJDGPwAJ9fF', // Replace with your custom header and its value
    // };

    // const response = await axios.get(apiUrl, {
    //   headers: customHeader,
    // });

    // Access the response data
    let gstinDetail = response.data.Data;
    const filteredGstins = gstinDetail.filter((item) => Array.isArray(gstins) && gstins.includes(item.GSTIN));
    return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { GSTINDetails: filteredGstins }));
  } catch (error) {
    console.log(error);
    return res.status(500).send(generateResponse('Failed', 'Error in fetching data', 'B', 'E', null, true, null));
  }
};

const fetchGSTINDetailsForPAN = async (req, res) => {
  try {

    const pan = req.body?.pan;
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

    const gstDetails = gstD.data ?? gstD.response.data;
    gstDetails.forEach((gstDetail) => {
      let outGstDetail = {
        PAN: pan,
      };
      if (gstDetail?.pradr) {
        Object.keys(gstDetail.pradr.addr).forEach((addressVariable) => {
          gstDetail[addressVariable] = gstDetail.pradr.addr[addressVariable];
        });
        outGstDetail.ADDRESS = Object.values(gstDetail.pradr.addr)
          .map(String)
          .join(', ')
          .replace(/(,\s){2,}/g, ',');
      }
      gstDetail && Object.keys(gstDetail).forEach((detail) => {
        Object.keys(predefinedValues).forEach((value) => {
          if (detail == predefinedValues[value]) outGstDetail[value] = gstDetail[detail];
        });
      });
      if (outGstDetail.DATEOFISSUEGST) outGstDetail.DATEOFISSUEGST = outGstDetail.DATEOFISSUEGST.split('/').reverse().join('-');
      outGstDetails.push(outGstDetail);
    });
    const filteredGstins = outGstDetails.filter((item) => item.PAN === pan);
    let gstTableData = await req.db.exec(
      `SELECT  GSTIN.ADDRESS AS ADDRESS,GSTIN.TAXPAYERTYPE AS GSTTYPE,GSTIN.LEGALNAME AS LEGALNAME,GSTIN.GSTIN AS GSTIN,GSTIN.DTREG AS DATEOFISSUEGST,
      GSTIN.TRADENAME AS TRADENAME,GSTIN.STATUS AS STATUS,GSTIN.POSTALCODE AS PINCODE,GSTIN.STATECODE AS STATE FROM GSTIN
       WHERE SUBSTRING(GSTIN, 3, 10) = '${pan}' AND STATUS='A'`
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

    const newData = gstTableData.map(item => ({ ...item, PAN: `${pan}`, STATUS: "Active", GSTTYPE: convertGSTType(item.GSTTYPE) }));




    const concatenatedArray = [...filteredGstins];

    newData.forEach(item => {
      const existingItem = filteredGstins.find(i => i.GSTIN === item.GSTIN);
      if (!existingItem) {
        concatenatedArray.push(item);
      }
    });
    try {
      function getStateCode(stateName) {
        let stateCode = req.db.exec(`SELECT STATECODES.STATECODE AS STATECODE FROM STATECODES WHERE STATENAME = ?`, [stateName]);


        return stateCode[0] && stateCode[0].STATECODE


      }

      const missingElements = gstD.data.filter(item => !newData.some(i => i.GSTIN === item?.gstin));
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

    return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { GSTINDetails: concatenatedArray }));
  } catch (error) {
    console.log(error);
    return res.status(500).send(generateResponse('Failed', 'Error in fetching data', 'B', 'E', null, true, null));
  }
};

const fetchNoPanGSTINDetails = async (req, res) => {
  try {
    const { param1, param2 } = req.body;
    if (param1) {
      switch (param1) {
        case '05': {
          if (!param2) return res.status(400).send(generateResponse('Failed', 'Short name is required', 'B', 'E', null, true, null));
          let gstinDetails = await req.db.exec(`SELECT GSTINUIN as GSTIN, LEGALNAMEOFBUSINESS as ADDRESS, GSTINSTATUS AS STATUS  FROM UNBODYMASTER WHERE SHORTNAME = '${param2}'`);
          return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { GSTINDetails: gstinDetails }));
        }
        case '08': {
          if (!param2) return res.status(400).send(generateResponse('Failed', 'Country is required.', 'B', 'E', null, true, null));
          let gstinDetails = await req.db.exec(
            `SELECT COUNTRY_CODE as COUNTRY_CODE, GSTINUIN as GSTIN, LEGALNAMEOFBUSINESS as ADDRESS, GSTINSTATUS AS STATUS  FROM CONSULATEEMBASSYMASTER WHERE COUNTRY_CODE = '${param2}'`
          );
          return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { GSTINDetails: gstinDetails }));
        }
        default:
          break;
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(generateResponse('Failed', 'Error in fetching data', 'B', 'E', null, true, null));
  }
};

const fetchIataDetails = async (req, res) => {
  try {
    const { param1, param2 } = req.body;
    if (!param1) return res.status(400).send(generateResponse('Failed', 'IATA is required', 'B', 'E', null, true, null));
    const verifyIata = await req.db.exec(`SELECT * FROM AGENTMASTER WHERE SITETYPE IN ('HE', 'GE') AND IATANUMBER = ${param1}`);
    if (verifyIata.length) {
      let iata = await req.db.exec(`SELECT * FROM AGENTMASTER WHERE CROSSREFERENCEAGENTNUM = ${param1} OR IATANUMBER = ${param1}`);
      return res.status(200).send(generateResponse('Success', 'Data fetch success', 'B', 'S', null, false, { IataDetails: iata }));
    } else {
      res.status(500).send(generateResponse('Failed', 'Please Enter your HE/GE code.', 'B', 'E', null, true, {}));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(generateResponse('Failed', 'Error in fetching data', 'B', 'E', null, true, null));
  }
};

const createUser = async (req, res) => {
  try {
    let db = req.db;
    db.setAutoCommit(false);
    var { companyDetails, userDetails, GSTDetails, attachments, agentCodes, param2 } = req.body;
    let { PAN, email, UserRole, category, countryCode, agentCode, Email, param1 } = req.context;
    if (Email) {
      email = Email;
    }
    // if (!PAN) return res.status(401).send(generateResponse('Failed', 'Invalid Token', 'B', 'E', null, true, null));

    // if (PAN.length !== 10) return res.status(401).send(generateResponse('Failed', 'Invalid Token', 'B', 'E', null, false, null));
    if (!isEmail(email)) return res.status(401).send(generateResponse('Failed', 'Invalid Token', 'B', 'E', null, true, null));

    //  if (PAN != companyDetails.COMPANYPAN) return res.status(401).send(generateResponse('Failed', 'PAN mismatch with session', 'B', 'E', null, true, null));
    if (email != userDetails.LOGINEMAIL) return res.status(401).send(generateResponse('Failed', 'Email mismatch with session', 'B', 'E', null, true, null));

    let userID = uuidv4(),
      companyID;
    let hashPassword = '';
    let password = '';
    let adminEmail;
    let Status;
    let UNSHORTCODE = '';
    let duplicateAdminExist = await req.db.exec(`SELECT * FROM COMPANYMASTER WHERE COMPANYPAN = '${PAN}' AND STATUS != 'X'`);
    let duplicateUserExist = await req.db.exec(`SELECT * FROM COMPANYUSERS WHERE LOGINEMAIL = '${email}' AND STATUS != 'X'`);

    if (UserRole === 'Admin' && duplicateAdminExist.length === 0) {



      companyID = uuidv4();
      const config = await req.db.exec(`SELECT * FROM APPCONFIG WHERE COMPANY = 'AI'`);
      if (config[0]?.ISADMINAPPROVAL) {
        Status = 'I';
      } else {
        Status = 'A';
      }
      if (category === '05') {
        UNSHORTCODE = param1;
      }
      const {
        COUNTRY_CODE,
        ISECOMMERCEOPERATOR = false,
        COMPANYPAN = '',
        CATEGORY,
        AGENTCODE = '',
        COMPANYNAME,
        COMPANYREGISTRATIONNUMBER = '',
        COMPANYTAN = '',
        WEBSITE = '',
        CONTACTNUMBER = '',
        ADDRESS = '',
        CITY = '',
        PINCODE = '',
        STATE,
        REGION,
      } = companyDetails;
      const companyCreateSQL = `INSERT INTO COMPANYMASTER (ID, CREATEDAT, CREATEDBY, AGENTCODE, 
                                      COMPANYNAME, COMPANYREGISTRATIONNUMBER, COMPANYPAN, COMPANYTAN, 
                                      ADDRESS, COUNTRY_CODE, STATE,REGION, CITY, PINCODE, CONTACTNUMBER, WEBSITE, CATEGORY, 
                                      ISECOMMERCEOPERATOR, CONSULATEEMBASSYCOUNTRY_CODE,UNSHORTCODE,STATUS) VALUES (
                                        '${companyID}',CURRENT_TIMESTAMP,'${email}', '${AGENTCODE ? AGENTCODE : ''}', 
                                        '${sanitizeString(COMPANYNAME)}', '${COMPANYREGISTRATIONNUMBER}', '${COMPANYPAN}', 
                                        '${COMPANYTAN}', '${sanitizeString(ADDRESS)}', '${COUNTRY_CODE}','${STATE ? STATE : ''}',
                                        '${sanitizeString(REGION) ? sanitizeString(REGION) : ''}','${sanitizeString(CITY)}',
                                        '${PINCODE}', '${CONTACTNUMBER}', '${WEBSITE}', '${CATEGORY}', ${ISECOMMERCEOPERATOR},
                                        '${countryCode ? countryCode : ''}', '${UNSHORTCODE ? UNSHORTCODE : ''}','${Status}')`;

      for (let j = 0; j < agentCodes.length; j++) {
        const element = agentCodes[j];

        await db.exec(`
     INSERT INTO COMPANYIATA (COMPANYID, IATACODE, LEGALNAME, TRADENAME, CITY, REGION, COUNTRYNAME, POSTALCODE, ISECOMMERCEOPERATOR)
     VALUES (
         '${companyID}',
         ${element.IATANUMBER},
         '${sanitizeString(element.LEGALNAME)}',
         '${sanitizeString(element.TRADENAME)}',
         '${sanitizeString(element.CITY)}',
         '${sanitizeString(element.REGION)}',
         '${sanitizeString(element.COUNTRYNAME)}',
         '${element.POSTALCODE}',
         ${element.ISECOMMERCEOPERATOR ? true : false}
     )
 `);
        try {
          await db.exec(`
  UPDATE AGENTMASTER
  SET ISECOMMERCEOPERATOR = ${element.ISECOMMERCEOPERATOR ? true : false}
  WHERE  IATANUMBER='${element.IATANUMBER}'
  `);
        }
        catch (e) {
          console.log(e);
        }

        await db.exec(`
    INSERT INTO USERIATA (
        COMPANYID,
        USERID,
        IATACODE,
        SITETYPE,
        LEGALNAME,
        TRADENAME,
        CITY,
        REGION,
        COUNTRYNAME,
        POSTALCODE,
        ISECOMMERCEOPERATOR
    ) VALUES (
        '${companyID}',
        '${userID}',
        ${element.IATANUMBER},
        '${element.SITETYPE}',
        '${sanitizeString(element.LEGALNAME)}',
        '${sanitizeString(element.TRADENAME)}',
        '${sanitizeString(element.CITY)}',
        '${sanitizeString(element.REGION)}',
        '${sanitizeString(element.COUNTRYNAME)}',
        '${element.POSTALCODE}',
        ${element.ISECOMMERCEOPERATOR ? true : false}
    )
 `);
      }

      await db.exec(companyCreateSQL);

      for (let i = 0; i < GSTDetails.length; i++) {
        const element = GSTDetails[i];
        const {
          GSTIN,
          GSTTYPE = '',
          DEFAULT = false,
          DATEOFISSUEGST = '',
          ARNNO = '',
          DATEOFISSUEARN = '',
          ADDRESS = '',
          COUNTRY_CODE = '',
          STATE = '',
          CITY = '',
          PINCODE = '',
          STATUS = '',
          ARNCERTIFICATE = '',
          GSTCERTIFICATE = '',
          LEGALNAME = '',
          TRADENAME = '',
        } = element;

        try {

          GSTIN && await db.exec(`INSERT INTO COMPANYGSTIN (CREATEDAT, CREATEDBY, COMPANYID, GSTIN, 
                                         GSTTYPE, DATEOFISSUEGST, GSTCERTIFICATE, DEFAULT, 
                                         ARNNO, DATEOFISSUEARN, ARNCERTIFICATE, ADDRESS, COUNTRY_CODE, 
                                         STATE, CITY, PINCODE, STATUS,LEGALNAME,TRADENAME, LASTVALIDATEDON) VALUES (
                                         CURRENT_TIMESTAMP, '${email}', '${companyID}', '${GSTIN}', '${GSTTYPE}', '${DATEOFISSUEGST}',
                                          '${GSTCERTIFICATE}', ${DEFAULT}, '${ARNNO}', '${DATEOFISSUEARN}', '${ARNCERTIFICATE}', 
                                          '${sanitizeString(ADDRESS)}', '${COUNTRY_CODE}', '${STATE}', '${CITY}', '${PINCODE}', '${STATUS}', 
                                          '${sanitizeString(LEGALNAME)}','${sanitizeString(TRADENAME)}',CURRENT_TIMESTAMP)`);

          /**Add GSTIN to Default GSTIN */

          GSTIN && await db.exec(`INSERT INTO USERDEFAULTGSTIN (CREATEDAT, CREATEDBY, 
                                                        COMPANYID, USERID, GSTIN, ISDEFAULT) VALUES (
                                                        CURRENT_TIMESTAMP, '${email}', 
                                                        '${companyID}', '${userID}', '${GSTIN}', ${DEFAULT})`);
        }

        catch (e) {
          console.log(e, "error");

        }

        if (element.addresses.length > 0) {
          for (let j = 0; j < element.addresses.length; j++) {
            var slNo = j + 1;
            const address = element.addresses[j];
            address.EFFECTIVEFROM = address.EFFECTIVEFROM ? address.EFFECTIVEFROM : '';
            address.EFFECTIVETILL = address.EFFECTIVETILL ? address.EFFECTIVETILL : '';
            address.STATE = address.STATE ? address.STATE : '';
            address.CITY = address.CITY ? address.CITY : '';
            address.PINCODE = address.PINCODE ? address.PINCODE : '';
            try {
              address.GSTIN && await db.exec(`INSERT INTO COMPANYGSTINADRESSES (CREATEDAT, CREATEDBY,  COMPANYID,
                                                GSTIN, SERIALNO, TYPE, USEFORINVOICEPRINTING,
                                                EFFECTIVEFROM, EFFECTIVETILL, ADDRESS, STATE, CITY, PINCODE) 
                                                VALUES (CURRENT_TIMESTAMP, '${email}', '${companyID}',
                                                        '${address.GSTIN}', '${slNo}', '${address.TYPE}', ${address.USEFORINVOICEPRINTING},
                                                        '${address.EFFECTIVEFROM}', '${address.EFFECTIVETILL}', '${sanitizeString(address.ADDRESS)}', '${address.STATE}',
                                                        '${address.CITY}', '${address.PINCODE}')`);
            }
            catch (e) {
              console.log(e);
            }
          }
        }
      }

      for (let i = 0; i < attachments.length; i++) {
        const element = attachments[i];
        const { DOCUMENTTYPECODE, FILENAME = '', MIMETYPE = '', FILEID = '', ISSUEDON = '', VALIDFROM = '', VALIDTO = '', FILE = '' } = element;
        await db.exec(`INSERT INTO COMPANYDOCUMENTS (ID, COMPANYID, DOCUMENTTYPECODE, 
                              FILENAME, FILEID, MIMETYPE, ISSUEDON, VALIDFROM, VALIDTO, FILE) VALUES ('${uuidv4()}', '${companyID}', 
                              '${sanitizeString(DOCUMENTTYPECODE)}', '${sanitizeString(FILENAME)}','${sanitizeString(FILEID)}','${sanitizeString(MIMETYPE)}', '${sanitizeString(
          ISSUEDON
        )}', '${sanitizeString(VALIDFROM)}','${sanitizeString(VALIDTO)}',
                              '${sanitizeString(FILE)}')`);
      }
      password = generatePassword();
      hashPassword = await bcrypt.hash(password, 12);
    } else if (UserRole === 'User' && duplicateUserExist.length === 0) {
      let company;
      Status = 'P';
      if (category === '05') {
        company = await db.exec(`SELECT ID FROM COMPANYMASTER WHERE UNSHORTCODE = '${param2}'`);
        companyID = company[0].ID;
        adminUser = await db.exec(`SELECT
         COMPANYMASTER.ID,           
         COMPANYUSERS.LOGINEMAIL,
         COMPANYUSERROLES.ISADMIN
       FROM
         COMPANYMASTER AS COMPANYMASTER
           INNER JOIN
           COMPANYUSERS AS COMPANYUSERS
           ON
           COMPANYMASTER.ID = COMPANYUSERS.COMPANYID
           INNER JOIN
           COMPANYUSERROLES AS COMPANYUSERROLES
           ON
           COMPANYUSERS.ID = COMPANYUSERROLES.USERID AND
         COMPANYUSERS.COMPANYID = COMPANYUSERROLES.COMPANYID AND
         COMPANYMASTER.UNSHORTCODE = '${param2}' AND COMPANYUSERROLES.ISADMIN = true`)[0];
      } else if (category === '08') {
        company = await db.exec(`SELECT ID FROM COMPANYMASTER WHERE CONSULATEEMBASSYCOUNTRY_CODE = '${param2}'`);
        companyID = company[0].ID;
        adminUser = await db.exec(`SELECT
        COMPANYMASTER.ID,           
        COMPANYUSERS.LOGINEMAIL,
        COMPANYUSERROLES.ISADMIN
      FROM
        COMPANYMASTER AS COMPANYMASTER
          INNER JOIN
          COMPANYUSERS AS COMPANYUSERS
          ON
          COMPANYMASTER.ID = COMPANYUSERS.COMPANYID
          INNER JOIN
          COMPANYUSERROLES AS COMPANYUSERROLES
          ON
          COMPANYUSERS.ID = COMPANYUSERROLES.USERID AND
        COMPANYUSERS.COMPANYID = COMPANYUSERROLES.COMPANYID AND
        COMPANYMASTER.CONSULATEEMBASSYCOUNTRY_CODE = '${param2}' AND COMPANYUSERROLES.ISADMIN = true`)[0];
      } else if (category === '07') {
        company = await db.exec(`SELECT ID FROM COMPANYMASTER WHERE AGENTCODE = '${param2}'`);
        companyID = company[0].ID;
        adminUser = await db.exec(`SELECT
        COMPANYMASTER.ID,           
        COMPANYUSERS.LOGINEMAIL,
        COMPANYUSERROLES.ISADMIN
      FROM
        COMPANYMASTER AS COMPANYMASTER
          INNER JOIN
          COMPANYUSERS AS COMPANYUSERS
          ON
          COMPANYMASTER.ID = COMPANYUSERS.COMPANYID
          INNER JOIN
          COMPANYUSERROLES AS COMPANYUSERROLES
          ON
          COMPANYUSERS.ID = COMPANYUSERROLES.USERID AND
        COMPANYUSERS.COMPANYID = COMPANYUSERROLES.COMPANYID AND
        COMPANYMASTER.AGENTCODE = '${param2}' AND COMPANYUSERROLES.ISADMIN = true`)[0];
      } else {
        company = await db.exec(`SELECT ID FROM COMPANYMASTER WHERE COMPANYPAN = '${PAN}'`);
        if (company.length === 0) return res.status(401).send(generateResponse('Failed', 'Invalid PAN.', 'B', 'E', null, true, null));
        companyID = company[0].ID;

        adminUser = await db.exec(`SELECT
                                        COMPANYMASTER.ID,
                                        COMPANYMASTER.COMPANYPAN,
                                        COMPANYUSERS.LOGINEMAIL,
                                        COMPANYUSERROLES.ISADMIN
                                      FROM
                                        COMPANYMASTER AS COMPANYMASTER
                                          INNER JOIN
                                          COMPANYUSERS AS COMPANYUSERS
                                          ON
                                          COMPANYMASTER.ID = COMPANYUSERS.COMPANYID
                                          INNER JOIN
                                          COMPANYUSERROLES AS COMPANYUSERROLES
                                          ON
                                          COMPANYUSERS.ID = COMPANYUSERROLES.USERID AND
                                        COMPANYUSERS.COMPANYID = COMPANYUSERROLES.COMPANYID AND
                                        COMPANYMASTER.COMPANYPAN = '${PAN}' AND COMPANYUSERROLES.ISADMIN = true`)[0];
      }
      if (adminUser) {
        adminEmail = adminUser.LOGINEMAIL;
      }
    }
    const { LOGINEMAIL, FIRSTNAME = '', LASTNAME = '', MOBILE = '', TITLE = '', DEFAULTPERIOD = 'CY', ISINTIALLOGIN = true } = userDetails;

    await db.exec(`INSERT INTO COMPANYUSERS (ID, CREATEDAT, CREATEDBY, COMPANYID, LOGINEMAIL, 
        PASSWORD, TITLE, FIRSTNAME, LASTNAME, MOBILE, STATUS ,ISINTIALLOGIN) VALUES (
        '${userID}',CURRENT_TIMESTAMP , '${email}', '${companyID}', 
        '${LOGINEMAIL.toLowerCase()}', '${hashPassword}', '${TITLE}', '${sanitizeString(FIRSTNAME)}',
        '${LASTNAME}', '${MOBILE}', '${Status}', ${ISINTIALLOGIN})`);

    await db.exec(`INSERT INTO COMPANYUSERROLES (CREATEDAT, CREATEDBY, 
                              COMPANYID, USERID, VALIDFROM, VALIDTILL, ISADMIN, 
                              CANADDGSTIN, CANEDITGSTINADDRESS, CANAMENDMENTREQUEST, 
                              CANAMENDMENTAPPROVE, CANEDITGST) VALUES (CURRENT_TIMESTAMP, '${email}', 
                              '${companyID}', '${userID}', CURRENT_DATE, '9999-12-31', 
                              ${UserRole === 'Admin' ? true : false}, ${UserRole === 'Admin' ? true : false}, 
                              ${UserRole === 'Admin' ? true : false}, ${UserRole === 'Admin' ? true : false}, 
                              ${UserRole === 'Admin' ? true : false}, ${UserRole === 'Admin' ? true : false})`);

    await db.exec(`INSERT INTO USERDEFAULT (USERID, DEFAULTPERIOD) VALUES ('${userID}', '${DEFAULTPERIOD}')`);
    const data = {
      companyCode: 'AI',
      companyId: companyID,
      userId: userID,
      module: 'User Profile',
      eventId: 'User approval',
      finalStatus: 'S',
      finalStatusMessage: `user ${email} registered ,awaiting for approval`,
      oldValue: "",
      newValue: "User registered",
    };

    auditlog(db, data);
    if (Status == 'I') {
      db.commit(async function (err) {
        if (err) throw err;
        console.log('Transaction commited.');
        const userDetails = await db.exec(`SELECT FIRSTNAME, LASTNAME FROM COMPANYUSERS WHERE LOGINEMAIL='${email}'`);
        const name = userDetails[0].FIRSTNAME;
        sendEMail('', email, 'INIATED', name);
        const admins = await db.exec(`SELECT EMAIL FROM COMPANYADMIN WHERE ROLE = 'Super Admin'`);
        if (admins.length) {
          for (let i = 0; i < admins.length; i++) {
            const email = admins[i].EMAIL;
            const userDetails = await db.exec(`SELECT NAME FROM COMPANYADMIN WHERE EMAIL='${email}'`);
            const regionDetails = await db.exec(`SELECT REGION FROM AIGSTINS WHERE STATECODE='${companyDetails.STATE}'`);
            const region = regionDetails[0].REGION;

            const name = userDetails[0].NAME;

            sendEMail('', email, 'NEWCOMPREG', name, region);
          }
        }


        return res.status(201).send(generateResponse('Success', 'Profile submitted for approval.', 'T', 'S', 'null', false, {}));
      });
    } else {
      db.commit(async function (err) {
        let name;
        if (err) throw err;
        console.log('Transaction commited.');
        const userDetails = await db.exec(`SELECT FIRSTNAME, LASTNAME FROM COMPANYUSERS WHERE LOGINEMAIL='${email}'`);
        name = userDetails[0].FIRSTNAME;
        sendEMail(password, email, 'WELCOME', name);
        if (adminEmail) {
          const userDetails = await db.exec(`SELECT FIRSTNAME, LASTNAME FROM COMPANYUSERS WHERE LOGINEMAIL='${adminEmail}'`);
          name = userDetails[0].FIRSTNAME;
          sendEMail('', adminEmail, 'NEWUSERREG', name);
        }
        if (UserRole === 'User') {

          return res.status(201).send(generateResponse('Success', 'Profile submitted for approval.', 'T', 'S', 'null', false, {}));
        } else {
          return res.status(201).send(generateResponse('Success', 'User created successfully.', 'T', 'S', 'null', false, {}));
        }
      });
    }
  } catch (error) {
    console.log(error);
    req.db.rollback(function (err) {
      if (err) throw err;
      console.log('Transaction rolled back.');
      return res.status(500).send(generateResponse('Failed', 'Error in submitting the profile.', 'B', 'E', null, true, null));
    });
  }
};

function formatDate(date) {
  return moment(date).format('YYYY-MM-DD');
}

module.exports = {
  checkUserRole,
  generateOTPforRegistration,
  verifyOTPforRegistration,
  fetchCompanyDetails,
  fetchGSTINsForPAN,
  fetchGSTINDetails,
  createUser,
  fetchGSTINDetailsForPAN,
  fetchNoPanGSTINDetails,
  checkConsulate,
  checkUserRoleV2,
  getCategoryDetails,
  countryiata,
  fetchIataDetails,
  resendRegOTP,
};
