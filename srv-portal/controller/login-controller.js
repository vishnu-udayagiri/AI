const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const isEmail = require('validator/lib/isEmail');
const { generateResponse } = require('../libs/response.js');
const { generateJWT, verifyJWT } = require('../libs/jwt');
const { generateOTP, sendEMail, generatePassword } = require('../libs/otp.js');
const { CompanyUserRole } = require('../utils/common-query.js');
const { validatemail } = require('../validations/get.invoice.req.validation.js');
const { auditlog } = require('../libs/auditlog.js');

const userLogin = async (req, res) => {
  try {
    let auth = req.headers.authorization.split(' ')[1];
    if (!(auth.length > 0)) return res.status(401).send(generateResponse('Failed', 'Missing authorization object', 'B', 'E', null, true, null));
    auth = Buffer.from(auth, 'base64').toString('ascii');
    const [email, password] = auth.split(':');
    if (!email) return res.status(401).send(generateResponse('Failed', 'Email must be provided', 'B', 'E', null, true, null));
    if (!isEmail(email)) return res.status(504).send(generateResponse('Failed', 'The email address is invalid..', 'B', 'E', null, true, null));
    if (!password) return res.status(401).send(generateResponse('Failed', 'Password must be provided', 'B', 'E', null, true, null));

    const db = req.db;
    const data = { email, password }
    const { error } = await validatemail(data)

    if (error) {
      const response = generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null);
      return res.json(response);
    }

    const companyUserData = await db.exec(CompanyUserRole(null, null, email, null, null))[0];
    if (!companyUserData) return res.status(401).send(generateResponse('Failed', 'Invalid password / Username', 'B', 'E', null, true, null));

    const { ID, FAILEDATTEMPTS, STATUS, LASTLOGGEDON } = companyUserData;
    if (STATUS === 'B' || STATUS === 'D')
      return res.status(200).send(
        generateResponse(
          'Failed',
          "Your account is currently blocked/inactive. Please contact the administrator for assistance with account reinstatement.",
          'B',
          'E',
          null,
          false,
          {
            STATUS,
          }
        )
      );
    if (STATUS === 'I')
      return res.status(200).send(
        generateResponse('Failed', 'Your profile has been submitted for approval.', 'B', 'E', null, false, {
          STATUS,
        })
      );

    if (LASTLOGGEDON) {
      const lastLoginDate = moment(LASTLOGGEDON);
      const today = moment();
      const diff = today.diff(lastLoginDate, 'days');
      if (diff > 180) {
        await db.exec(`UPDATE COMPANYUSERS SET STATUS = 'D', REASONFORDEACTIVATION = 'Account is Deactivated due to inactivity for more than 180 days' WHERE ID = '${ID}'`);
        return res.status(200).send(generateResponse('Failed', 'Account is deactivated due to inactivity for more than 180 days', 'B', 'E', null, true, { STATUS: 'D' }));
      } else if (diff > 90) {
        await db.exec(`UPDATE COMPANYUSERS SET STATUS = 'B', REASONFORDEACTIVATION = 'Account is blocked due to inactivity for more than 90 days' WHERE ID = '${ID}'`);
        return res.status(200).send(generateResponse('Failed', 'Account is blocked due to inactivity for more than 90 days', 'B', 'E', null, true, { STATUS: 'B' }));
      }
    }
    const passMatched = await bcrypt.compare(password, companyUserData.PASSWORD);

    if (!passMatched) {
      await db.exec(`UPDATE COMPANYUSERS SET FAILEDATTEMPTS = COALESCE(FAILEDATTEMPTS,0) +1, LASTFAILEDLOGINDATE=CURRENT_TIMESTAMP WHERE ID = '${ID}'`);
      if (FAILEDATTEMPTS >= 4) {
        if (STATUS == 'A') {
          try {
            if (!email) return res.status(401).send(generateResponse('Failed', 'Email must be provided', 'B', 'E', null, true, null));
            if (!isEmail(email)) return res.status(504).send(generateResponse('Failed', 'The email address is invalid..', 'B', 'E', null, true, null));
            const db = req.db;
            const user = await db.exec(`SELECT COMPANYUSERS.ID,COMPANYUSERS.COMPANYID,COMPANYUSERS.LOGINEMAIL,
                                            COMPANYUSERS.STATUS,COMPANYUSERROLES.ISADMIN
                                          FROM
                                            COMPANYUSERS COMPANYUSERS
                                          INNER JOIN
                                            COMPANYUSERROLES COMPANYUSERROLES
                                          ON
                                            COMPANYUSERS.ID = COMPANYUSERROLES.USERID AND
                                            COMPANYUSERS.COMPANYID = COMPANYUSERROLES.COMPANYID
                                          WHERE LOWER(LOGINEMAIL) = LOWER('${email}') AND STATUS != 'X'`)[0];
            if (!user) return res.status(401).send(generateResponse('Failed', 'The email address is invalid..', 'B', 'E', null, true, null));
            if (user.STATUS != 'A') return res.status(200).send(generateResponse('Failed', 'Account is blocked/inactive.', 'B', 'E', null, true, null));
            const userDetails = await db.exec(`SELECT FIRSTNAME, LASTNAME FROM COMPANYUSERS WHERE LOGINEMAIL= LOWER('${email}')`);
            const name = userDetails[0].FIRSTNAME;
            const { ID, COMPANYID } = user;
            const token = Buffer.from(`${Buffer.from(ID).toString('base64')}:${Buffer.from(COMPANYID).toString('base64')}`).toString('base64');
            const jwtPayload = {
              id: token,
            };
            const newToken = generateJWT(jwtPayload, '1d', 'OTPGEN');
            sendEMail(newToken, email, 'FORGOT', name);
            return res
              .status(500)
              .send(generateResponse('Failed', 'No further attempts are allowed. A password reset link has been sent to the registered email address.', 'B', 'I', null, true, null));
            // return res.status(200).send(generateResponse('Success', 'OTP is generated..', 'T', 'S', 'null', false, { token }));
          } catch (error) {
            return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
          }
        }
      }
      let remainingAttempts = 5 - (FAILEDATTEMPTS + 1);
      //const responceMessage ='Invalid password / Username. Remaining attempts: ${remainingAttempts}'
      return res.status(401).send(generateResponse('Failed', `Invalid password / Username. Remaining attempts: (${remainingAttempts})`, 'B', 'E', null, true, null));
    }

    //if LASTLOGGEDON is more than 90 days, update the status with 'B' and return with message 'Account is blocked due to inactivity for more than 90 days'

    if (companyUserData.STATUS != 'A') {
      return res
        .status(401)
        .send(
          generateResponse(
            'Failed',
            'Your account is currently blocked/inactive. Please contact the administrator for assistance with account reinstatement.',
            'B',
            'E',
            null,
            true,
            null
          )
        );
    }
    const otpId = uuidv4();
    const otp = generateOTP();

    console.log(otp);

    const jwtPayload = {
      Cid: companyUserData.COMPANYID,
      Uid: companyUserData.ID,
      id: otpId,
    };
    await req.db.exec(`INSERT INTO "AUTHOTP" VALUES('${otpId}', '${otp}','${email}', false,'', CURRENT_TIMESTAMP,ADD_SECONDS (CURRENT_TIMESTAMP, 60*2),'')`);
    await req.db.exec(`UPDATE COMPANYUSERS SET FAILEDATTEMPTS=0 WHERE ID = '${ID}'`);
    const userDetails = await db.exec(`SELECT FIRSTNAME, LASTNAME FROM COMPANYUSERS WHERE LOGINEMAIL= LOWER('${email}')`);
    const name = userDetails[0].FIRSTNAME;
    const token = generateJWT(jwtPayload, '5m', 'OTPGEN');
    sendEMail(otp, email, 'LOGIN', name);
    return res.status(200).send(generateResponse('Success', 'OTP is generated..', 'T', 'S', 'null', false, { token }));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

const verifyOTP = async (req, res) => {
  try {
    const bearer = req.headers.authorization;
    if (!bearer) return res.status(403).send(generateResponse('Failed', 'Authorization header missing', 'B', 'E', null, true, null));
    let token = bearer.split(' ')[1];
    if (!token) return res.status(403).send(generateResponse('Failed', 'Authorization token missing', 'B', 'E', null, true, null));
    const decoded = verifyJWT(token, 'OTPGEN');

    const { id, Uid, Cid } = decoded;
    const { otp } = req.body;
    const userQuery = 'SELECT LOGINEMAIL FROM COMPANYUSERS WHERE ID = ?'
    const user = await req.db.exec(userQuery, [Uid])

    if (user?.length == 0) {
      return res.status(401).send(generateResponse('Failed', 'Unauthorized', 'B', 'E', null, true, null));
    }

    const email = user[0]?.LOGINEMAIL ?? ''

    if (!id) return res.status(401).send(generateResponse('Failed', 'Id must be provided', 'B', 'E', null, true, null));
    if (!otp) return res.status(401).send(generateResponse('Failed', 'You must provide an OTP..', 'B', 'E', null, true, null));

    const auth = await req.db.exec(`SELECT * FROM "AUTHOTP" WHERE "ID" = '${id}' AND "OTP" = '${otp}' AND "EMAIL" = '${email}' AND "EXPIRESON" > CURRENT_TIMESTAMP`);
    if (auth.length === 0) return res.status(401).send(generateResponse('Failed', 'Invalid OTP', 'B', 'E', null, true, null));

    const userDetails = await req.db.exec(CompanyUserRole(Cid, `='${Uid}'`, null, null, null))[0];
    if (userDetails.STATUS != 'A') {
      return res
        .status(401)
        .send(
          generateResponse(
            'Failed',
            'Your account is currently blocked/inactive.Please contact the administrator for assistance with account reinstatement.',
            'B',
            'E',
            null,
            true,
            null
          )
        );
    }

    let CanAddGSTIN = userDetails.CANADDGSTIN;
    let CanEditGSTINAddress = userDetails.CANEDITGSTINADDRESS;
    let CanAmendmentRequest = userDetails.CANAMENDMENTREQUEST;
    let CanAmendmentApprove = userDetails.CANAMENDMENTAPPROVE;
    let CanEditGst = userDetails.CANEDITGST;

    const jwtPayload = {
      Uid,
      Cid,
      Email: userDetails.LOGINEMAIL,
      PAN: userDetails.COMPANYPAN,
      UserRole: userDetails.USERROLE,
      FirstName: userDetails.FIRSTNAME,
      LastName: userDetails.LASTNAME,
      CanAddGSTIN,
      CanEditGSTINAddress,
      CanAmendmentRequest,
      CanAmendmentApprove,
      CanEditGst,
      ISB2A: userDetails.ISB2A,
      category: userDetails.CATEGORY,
    };

    token = generateJWT(jwtPayload, '1d', 'LOGIN');
    const exp = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('ascii')).exp;
    const expUTC = moment.utc(exp * 1000);

    const existingSession = await req.db.exec(`SELECT COUNT(*) AS COUNT FROM COMPANYUSERS WHERE ID = '${Uid}' AND COMPANYID = '${Cid}' AND JWT IS NOT NULL AND CURRENT_TIMESTAMP < JWTEXPIRESON`)[0];
    let activeSessionPresent = false;
    if (existingSession.COUNT > 0) {
      activeSessionPresent = true;
    } else {
      await req.db.exec(`UPDATE COMPANYUSERS SET JWT = '${token}', JWTEXPIRESON = '${expUTC.format('YYYY-MM-DD HH:mm:ss.SSSS')}' WHERE ID = '${Uid}' AND COMPANYID = '${Cid}'`);
    }

    await req.db.exec(`UPDATE COMPANYUSERS SET LOGINATTEMPTS = COALESCE(LOGINATTEMPTS,0) +1, LASTLOGGEDON = CURRENT_TIMESTAMP,FAILEDATTEMPTS=0 WHERE ID = '${Uid}'`);
    const defaults = await req.db.exec(`SELECT DEFAULTPERIOD as "PERIOD" FROM USERDEFAULT WHERE USERID = '${Uid}'`)[0];
    const isIntialLogin = await req.db.exec(`SELECT ISINTIALLOGIN as "ISINTIAL" FROM COMPANYUSERS WHERE ID = '${Uid}'`)[0];
    const data = {
      companyCode: 'AI',
      companyId: Cid,
      userId: Uid,
      module: 'User Profile',
      eventId: ' Login',
      finalStatus: 'S',
      finalStatusMessage: `Logged in successfully.`,
      oldValue: '',
      newValue: "Log in ",
    };
    auditlog(req.db, data);
    return res.status(200).send(
      generateResponse('Success', 'Logged in successfully.', 'T', 'S', 'null', false, {
        token,
        CANAMENDMENTREQUEST: userDetails.CANAMENDMENTREQUEST,
        DEFAULTPERIOD: defaults?.PERIOD ?? '',
        ISINTIALLOGIN: isIntialLogin?.ISINTIAL ?? '',
        ACTIVESESSIONPRESENT: activeSessionPresent,
      })
    );
  } catch (error) {
    res.status(403).send(generateResponse('Failed', 'Invalid token', 'B', 'E', null, true, null));
  }
};

const resendOTP = async (req, res) => {
  try {
    const db = req.db;
    const bearer = req.headers.authorization;
    if (!bearer) return res.status(403).send(generateResponse('Failed', 'Authorization header missing', 'B', 'E', null, true, null));
    let token = bearer.split(' ')[1];
    if (!token) return res.status(403).send(generateResponse('Failed', 'Authorization token missing', 'B', 'E', null, true, null));
    const decoded = verifyJWT(token, 'OTPGEN');
    const { Uid, Cid } = decoded;
    const otpId = uuidv4();
    const otp = generateOTP();

    const jwtPayload = {
      Cid,
      Uid,
      id: otpId,
    };
    const user = await req.db.exec(`SELECT LOGINEMAIL FROM COMPANYUSERS WHERE ID = '${Uid}' AND COMPANYID = '${Cid}'`)[0];
    if (!user) return res.status(401).send(generateResponse('Failed', 'Invalid User', 'B', 'E', null, true, null));
    await req.db.exec(`INSERT INTO "AUTHOTP" VALUES('${otpId}', '${otp}','${user.LOGINEMAIL}', false,'', CURRENT_TIMESTAMP,ADD_SECONDS (CURRENT_TIMESTAMP, 60*2),'')`);
    const userDetails = await db.exec(`SELECT FIRSTNAME, LASTNAME,LOGINEMAIL FROM COMPANYUSERS WHERE ID = '${Uid}'`);
    const name = userDetails[0].FIRSTNAME;
    const email = userDetails[0].LOGINEMAIL;
    const newToken = generateJWT(jwtPayload, '5m', 'OTPGEN');
    sendEMail(otp, email, 'LOGIN', name);
    return res.status(200).send(generateResponse('Success', 'OTP is generated..', 'T', 'S', 'null', false, { token: newToken }));
  } catch (error) {
    return res.status(403).send(generateResponse('Failed', 'Session Expired.', 'B', 'E', null, true, null));
  }
};

const activateAccount = async (req, res) => {
  try {
    const { LOGINEMAIL } = req.body;
    if (!LOGINEMAIL) return res.status(401).send(generateResponse('Failed', 'Email must be provided', 'B', 'E', null, true, null));
    if (!isEmail(LOGINEMAIL)) return res.status(504).send(generateResponse('Failed', 'The email address is invalid..', 'B', 'E', null, true, null));
    const db = req.db;
    const user = await db.exec(`SELECT COMPANYUSERS.ID,COMPANYUSERS.COMPANYID,COMPANYUSERS.LOGINEMAIL,
                                    COMPANYUSERS.STATUS,COMPANYUSERROLES.ISADMIN
                                  FROM
                                    COMPANYUSERS COMPANYUSERS
                                  INNER JOIN
                                    COMPANYUSERROLES COMPANYUSERROLES
                                  ON
                                    COMPANYUSERS.ID = COMPANYUSERROLES.USERID AND
                                    COMPANYUSERS.COMPANYID = COMPANYUSERROLES.COMPANYID
                                  WHERE LOWER(LOGINEMAIL) = LOWER('${LOGINEMAIL}')`)[0];
    if (!user) return res.status(401).send(generateResponse('Failed', 'The email address is invalid..', 'B', 'E', null, true, null));
    if (user.STATUS === 'A') return res.status(200).send(generateResponse('Failed', 'Account is already active', 'B', 'E', null, true, null));

    if (!user.ISADMIN) {
      const admin = await db.exec(`SELECT COMPANYUSERS.LOGINEMAIL,COMPANYUSERROLES.ISADMIN
                                          FROM
                                            COMPANYUSERS COMPANYUSERS
                                          INNER JOIN
                                            COMPANYUSERROLES COMPANYUSERROLES
                                          ON
                                            COMPANYUSERS.ID = COMPANYUSERROLES.USERID AND
                                            COMPANYUSERS.COMPANYID = '${user.COMPANYID}'`)[0];
      const userDetails = await db.exec(`SELECT FIRSTNAME, LASTNAME FROM COMPANYUSERS WHERE LOGINEMAIL='${admin.LOGINEMAIL}'`);
      const name = userDetails[0].FIRSTNAME;
      sendEMail(user.LOGINEMAIL, admin.LOGINEMAIL, 'ACCACTUNB', name);
    } else {
      const userDetails = await db.exec(`SELECT FIRSTNAME, LASTNAME FROM COMPANYUSERS WHERE LOGINEMAIL='${user.LOGINEMAIL}'`);
      const name = userDetails[0].FIRSTNAME;
      sendEMail(user.LOGINEMAIL, user.LOGINEMAIL, 'ACCACTUNB', name);
    }
    return res.status(200).send(generateResponse('Success', 'An account activation request was sent to your registered email address.', 'T', 'S', null, false, null));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { LOGINEMAIL } = req.body;
    if (!LOGINEMAIL) return res.status(401).send(generateResponse('Failed', 'Email must be provided', 'B', 'E', null, true, null));
    if (!isEmail(LOGINEMAIL)) return res.status(504).send(generateResponse('Failed', 'The email address is invalid..', 'B', 'E', null, true, null));
    const db = req.db;
    const user = await db.exec(`SELECT COMPANYUSERS.ID,COMPANYUSERS.COMPANYID,COMPANYUSERS.LOGINEMAIL,
                                    COMPANYUSERS.STATUS,COMPANYUSERROLES.ISADMIN
                                  FROM
                                    COMPANYUSERS COMPANYUSERS
                                  INNER JOIN
                                    COMPANYUSERROLES COMPANYUSERROLES
                                  ON
                                    COMPANYUSERS.ID = COMPANYUSERROLES.USERID AND
                                    COMPANYUSERS.COMPANYID = COMPANYUSERROLES.COMPANYID
                                  WHERE LOWER(LOGINEMAIL) = LOWER('${LOGINEMAIL}') AND STATUS != 'X'`)[0];
    if (!user) return res.status(401).send(generateResponse('Failed', 'The email address is invalid..', 'B', 'E', null, true, null));
    if (user.STATUS != 'A')
      return res
        .status(401)
        .send(
          generateResponse(
            'Failed',
            'Your account is currently blocked/inactive. \n Please contact the administrator for assistance with account reinstatement',
            'B',
            'I',
            null,
            true,
            null
          )
        );

    const { ID, COMPANYID } = user;
    const token = Buffer.from(`${Buffer.from(ID).toString('base64')}:${Buffer.from(COMPANYID).toString('base64')}`).toString('base64');
    const jwtPayload = {
      id: token,
    };
    const newToken = generateJWT(jwtPayload, '1d', 'OTPGEN');
    const userDetails = await db.exec(`SELECT FIRSTNAME, LASTNAME FROM COMPANYUSERS WHERE LOGINEMAIL='${LOGINEMAIL}'`);
    const name = userDetails[0].FIRSTNAME;
    sendEMail(newToken, LOGINEMAIL, 'FORGOT', name);
    return res.status(200).send(generateResponse('Success', 'A password reset link has been sent to your registered email address.', 'T', 'S', null, false, null));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

const verifyResetPassword = async (req, res) => {
  try {
    // decode the token and get the user id and company id
    const bearer = req.headers.authorization;
    if (!bearer) return res.status(403).send(generateResponse('Failed', 'Authorization header missing', 'B', 'E', null, true, null));
    let token = bearer.split(' ')[1];
    if (!token) return res.status(403).send(generateResponse('Failed', 'Authorization token missing', 'B', 'E', null, true, null));
    const { NEWPASSWORD } = req.body;
    if (!NEWPASSWORD) return res.status(401).send(generateResponse('Failed', 'Password must be provided', 'B', 'E', null, true, null));
    //decode token
    const decoded = verifyJWT(token, 'OTPGEN');
    const { id, iat } = decoded;
    const issueTime = moment(new Date(iat * 1000));
    // decode base64 string
    const decodedToken = Buffer.from(id, 'base64').toString('ascii');
    let [userId, companyId] = decodedToken.split(':');
    userId = Buffer.from(userId, 'base64').toString('ascii');
    companyId = Buffer.from(companyId, 'base64').toString('ascii');
    // check if user exists
    const user = req.db.exec(`SELECT STATUS,LOGINEMAIL,LASTPASSWORDCHANGEDON FROM COMPANYUSERS WHERE ID = '${userId}' AND COMPANYID = '${companyId}'`)[0];
    if (!user) return res.status(401).send(generateResponse('Failed', 'Invalid User', 'B', 'E', null, true, null));
    // check if user is active
    if (user.STATUS != 'A') return res.status(200).send(generateResponse('Failed', 'The account is inactive.', 'B', 'E', null, true, null));
    if (user.LASTPASSWORDCHANGEDON) {
      const lastPasswordChangedOn = moment(user.LASTPASSWORDCHANGEDON);
      //check if lastPasswordChangedOn is greater than issueTime
      const diff = issueTime.diff(lastPasswordChangedOn, 'seconds');
      if (diff < 0) return res.status(401).send(generateResponse('Failed', 'Invalid Token', 'B', 'E', null, true, null));
    }
    password = generatePassword();
    hashPassword = await bcrypt.hash(NEWPASSWORD, 12);
    // update password in COMPANYUSERS Table
    await req.db.exec(`UPDATE COMPANYUSERS
                        SET PASSWORD = '${hashPassword}',LASTPASSWORDCHANGEDON = CURRENT_TIMESTAMP,
                        MODIFIEDAT = CURRENT_TIMESTAMP,
                        MODIFIEDBY = '${user.LOGINEMAIL}'
                        WHERE ID='${userId}' AND COMPANYID='${companyId}'`);
    const data = {
      companyCode: 'AI',
      companyId: companyId,
      userId: userId,
      module: 'User Profile',
      eventId: ' Reset Password',
      finalStatus: 'S',
      finalStatusMessage: `  The password was changed successfully.`,
      oldValue: '',
      newValue: "Password Changed ",
    };
    auditlog(req.db, data);

    return res.status(200).send(generateResponse('Success', '  The password was changed successfully.', 'B', 'S', null, false, null));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

const forceResetPassword = async (req, res) => {
  try {
    // decode the token and get the user id and company id
    const bearer = req.headers.authorization;
    if (!bearer) return res.status(403).send(generateResponse('Failed', 'Authorization header missing', 'B', 'E', null, true, null));
    let token = bearer.split(' ')[1];
    if (!token) return res.status(403).send(generateResponse('Failed', 'Authorization token missing', 'B', 'E', null, true, null));
    const { NEWPASSWORD } = req.body;
    if (!NEWPASSWORD) return res.status(401).send(generateResponse('Failed', 'Password must be provided', 'B', 'E', null, true, null));
    //decode token
    const decoded = verifyJWT(token, 'LOGIN');
    const { iat, Uid, Cid } = decoded;
    const user = req.db.exec(`SELECT STATUS,LOGINEMAIL,LASTPASSWORDCHANGEDON FROM COMPANYUSERS WHERE ID = '${Uid}' AND COMPANYID = '${Cid}'`)[0];
    if (!user) return res.status(401).send(generateResponse('Failed', 'Invalid User', 'B', 'E', null, true, null));
    // check if user is active
    if (user.STATUS != 'A') return res.status(200).send(generateResponse('Failed', 'The account is inactive.', 'B', 'E', null, true, null));
    hashPassword = await bcrypt.hash(NEWPASSWORD, 12);
    // update password in COMPANYUSERS Table
    await req.db.exec(`UPDATE COMPANYUSERS
                        SET PASSWORD = '${hashPassword}',LASTPASSWORDCHANGEDON = CURRENT_TIMESTAMP,
                        MODIFIEDAT = CURRENT_TIMESTAMP, ISINTIALLOGIN = FALSE,JWT = NULL , JWTEXPIRESON = NULL,
                        MODIFIEDBY = '${user.LOGINEMAIL}'
                        WHERE ID='${Uid}' AND COMPANYID='${Cid}'`);

    const data = {
      companyCode: 'AI',
      companyId: Cid,
      userId: Uid,
      module: 'User Profile',
      eventId: ' Reset Password',
      finalStatus: 'S',
      finalStatusMessage: `  The password was changed successfully.`,
      oldValue: '',
      newValue: "Password Changed ",
    };
    auditlog(req.db, data);

    return res.status(200).send(generateResponse('Success', '  The password was changed successfully.', 'B', 'S', null, false, null));
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', 'Something went wrong. Please try again after some time.', 'B', 'E', null, true, null));
  }
};

module.exports = {
  userLogin,
  verifyOTP,
  resendOTP,
  activateAccount,
  forgotPassword,
  verifyResetPassword,
  forceResetPassword
};
