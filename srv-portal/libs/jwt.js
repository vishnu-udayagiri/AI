const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const secret_reg = process.env.JWT_SECRET_REG;
const secret_login_otp = process.env.JWT_SECRET_LOGIN_OTP;

/**
 * Generates a JSON Web Token (JWT) with the given data.
 * @param {Object} data - The data to be included in the JWT.
 * @param {string} [expiry='1d'] - The expiry time for the JWT. Defaults to 1 days.
 * @param {string} [type='LOGIN'] - The type of JWT to generate. Defaults to 'LOGIN','REG','OTPGEN'.
 * @returns {string} - The generated JWT.
 */
const generateJWT = (data, expiry = '1d', type = 'LOGIN') => {
  //switch case for type
  switch (type) {
    case 'LOGIN':
      return jwt.sign(data, secret, { expiresIn: expiry });
    case 'REG':
      return jwt.sign(data, secret_reg, { expiresIn: expiry });
    case 'OTPGEN':
      return jwt.sign(data, secret_login_otp, { expiresIn: expiry });
    default:
      return jwt.sign(data, secret, { expiresIn: expiry });
  }
};

/**
 * Verifies a JSON Web Token (JWT) using a secret key.
 * @param {string} token - The JWT to verify.
 * @param {string} [type=LOGIN] - The type of JWT being verified.
 * @returns {object} - The decoded JWT payload.
 * @throws {Error} - If the JWT cannot be verified.
 */
const verifyJWT = (token, type = 'LOGIN') => {
  try {
    switch (type) {
      case 'LOGIN':
        return jwt.verify(token, secret);
      case 'REG':
        return jwt.verify(token, secret_reg);
      case 'OTPGEN':
        return jwt.verify(token, secret_login_otp);
      default:
        return jwt.verify(token, secret);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  generateJWT,
  verifyJWT,
};
