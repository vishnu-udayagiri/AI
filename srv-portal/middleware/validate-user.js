const { verifyJWT } = require('../libs/jwt');
const { generateResponse } = require('../libs/response');

/**
 * Validation function to validate external user with email and password
 */
const validateUser = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization;
    if (!bearer) return res.status(403).send(generateResponse('Failed', 'Authorization header missing', 'B', 'E', null, true, null));
    const token = bearer.split(' ')[1];
    if (!token) return res.status(403).send(generateResponse('Failed', 'Authorization token missing', 'B', 'E', null, true, null));

    const decoded = verifyJWT(token, 'LOGIN');
    const { exp, iat, ...rest } = decoded;

    if (!req.url.includes('/reset-active-session')) {
      const existingToken = await req.db.exec(
        `SELECT COUNT(*) AS COUNT from COMPANYUSERS where companyid = '${rest.Cid}' 
      AND ID = '${rest.Uid}' AND JWT = '${token}' 
      AND JWTEXPIRESON > CURRENT_TIMESTAMP`
      )[0];

      if (existingToken.COUNT == 0) return res.status(403).send(generateResponse('Failed', 'Session Expired. login again', 'B', 'E', null, true, null));
    }
    req.user = rest;
    next();
  } catch (error) {
    console.log(error);
    res.status(403).send(generateResponse('Failed', 'Token Expired login again', 'B', 'E', null, true, null));
  }
};

const validateRegistration = (req, res, next) => {
  try {
    const bearer = req.headers.authorization;
    if (!bearer) return res.status(403).send(generateResponse('Failed', 'Authorization header missing', 'B', 'E', null, true, null));
    const token = bearer.split(' ')[1];
    if (!token) return res.status(403).send(generateResponse('Failed', 'Authorization token missing', 'B', 'E', null, true, null));
    const decoded = verifyJWT(token, 'REG');
    //TODO: Additional check for session inside the token
    const { exp, iat, ...rest } = decoded;
    req.context = rest;
    next();
  } catch (error) {
    console.log(error);
    res.status(403).send(generateResponse('Failed', 'Session Expired.', 'B', 'E', null, true, null));
  }
};

module.exports = {
  validateUser,
  validateRegistration,
};
