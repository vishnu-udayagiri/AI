// const isEmail = require('validator/lib/isEmail');
const { generateResponse } = require('../libs/response.js');
const { generateJWT } = require('../libs/jwt');
const { generateOTP, sendEMail } = require('../libs/otp.js');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const { generateCaptcha, validateCaptcha } = require('../common-functions/modules/captcha/captcha.js');

const fetchMasterData = async (req, res) => {
  try {
    const country = await req.db.exec(`SELECT CODE AS "code", DESCR AS "description", NAME as "country" from SAP_COMMON_COUNTRIES ORDER BY CODE ASC`);
    const states = await req.db.exec(`SELECT STATECODE AS "code", STATENAME AS "description",'IN' as "country" from STATECODES ORDER BY STATENAME ASC`);
    const category = await req.db.exec(`SELECT CODE AS "key", DESCRIPTION AS "text" from CATEGORYMASTER ORDER BY CODE ASC`);
    const attachments = await req.db.exec(`SELECT DOCUMENTTYPECODE,DOCUMENTNAME,ISMANDATORY,'' AS FILE,'' AS ISSUEDON FROM DOCUMENTCATEGORY ORDER BY DOCUMENTNAME`);
    return res.status(200).send(
      generateResponse('Success', 'User created successfully.', 'T', 'S', 'null', false, {
        country,
        states,
        category,
        attachment: attachments,
      })
    );
  } catch (error) {
    return res.status(500).send(generateResponse('Failed', error.message, 'B', 'E', null, true, null));
  }
};

const getCaptcha = (req, res) => {
  const captcha = generateCaptcha();
  req.session.captcha = captcha.text;
  const response = generateResponse('Success', 'Captcha generated successfully', 'T', 'S', 'null', false, captcha.data);
  res.json(response);
};

const verifyCaptcha = (req, res) => {
  if (!req.body.captcha || req.body.captcha == '') {
    const response = generateResponse('Failed', 'Captcha is required.', 'T', 'S', 'null', false, {});
    return res.json(response);
  }

  const _captcha = req.body.captcha;
  const isCaptchaValid = validateCaptcha(req.session, _captcha);
  const response = generateResponse(isCaptchaValid.success ? 'Success' : 'Failed', isCaptchaValid.message, 'T', isCaptchaValid.success ? 'S' : 'E', 'null', false, {});
  res.json(response);
};

function formatDate(date) {
  return moment(date).format('YYYY-MM-DD');
}
module.exports = {
  fetchMasterData,
  getCaptcha,
  verifyCaptcha,
};
