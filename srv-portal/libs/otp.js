const nodemailer = require('nodemailer');
const {
  userLoginMailTemplate,
  userRegisterMailTemplate,
  userWelcomeMailTemplate,
  newUserRegistration,
  blockUser,
  unBlockUser,
  activateUser,
  rejectUser,
  accountActivationRequest,
  forgotPassword,
  iniatedMail,
  newCompanyReg
} = require('../utils/email-templates');
const { getSMTPMailCredentials } = require('../helpers/mail.helper');

/**
 * Generates a random OTP (One-Time Password) of specified length.
 * @param {number} [length=6] - The length of the OTP to be generated.
 * @returns {string} The generated OTP.
 */
const generateOTP = (length = 6) => {
  const chars = '0123456789';
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

/**
 * Sends an OTP email to the specified email address.
 * @param {string} otp - The OTP code to send.
 * @param {string} email - The email address to send the OTP to.
 * @param {string} type - The type of OTP email to send (LOGIN or REG).
 */
const sendEMail = (data, email, type, name,region) => {


  try {
    let mailContent;
    let subject;
    if (type === 'LOGIN') {
      mailContent = userLoginMailTemplate(data, email, name);
      subject = 'OTP for Air India Portal Login';
    } else if (type === 'REG') {
      mailContent = userRegisterMailTemplate(data, email, name);
      subject = 'OTP for Air India Portal Registration';
    } else if (type === 'WELCOME') {
      mailContent = userWelcomeMailTemplate(data, email, name);
      subject = 'Welcome to Air India Portal';
    } else if (type === 'NEWUSERREG') {
      mailContent = newUserRegistration(email, name);
      subject = 'New user registration request';
    } else if (type === 'BLOCKUSER') {
      mailContent = blockUser(data, email, name);
      subject = 'Air India Portal account blocked';
    } else if (type === 'UNBLOCKUSER') {
      mailContent = unBlockUser(data, email, name);
      subject = 'Air India Portal account Un-Blocked';
    } else if (type === 'ACTIVATEUSER') {
      mailContent = activateUser(data, email, name);
      subject = 'Air India Portal account Activated';
    } else if (type === 'REJECTUSER') {
      mailContent = rejectUser(data, email, name);
      subject = 'Air India Portal Registration Rejected';
    } else if (type === 'ACCACTUNB'){
      mailContent = accountActivationRequest(email, data, name);
      subject = 'Account Activation Request';
    } else if(type === 'FORGOT'){
      mailContent = forgotPassword(email, data, name);
      subject = 'Air India Portal reset Password';
    } else if(type === 'INIATED'){
      mailContent = iniatedMail(email, name);
      subject = 'Welcome to Air India';
    } else if(type === 'NEWCOMPREG'){
      mailContent = newCompanyReg(email, name,region);
      subject = 'New Company registration request';
    }
    const configData = getSMTPMailCredentials()

    // const transporter = nodemailer.createTransport({
    //   host: configData.host,
    //   port: configData.port,
    //   secure: false,

    //   auth: {
    //     user: configData.username,
    //     pass: configData.password,
    //   },
    // });

    const mailOptions = {
      from: 'noreply@airindia.com',
      to: email,
      subject: subject,
      html: mailContent,
    };

  //  transporter.sendMail(mailOptions, function (error, info) {
  //     if (error) {
  //       console.log(error);
  //     }
  //   });
  } catch (error) {
    console.log(error);
  }
};

const generatePassword = (length = 8) => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ#@!&%';
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

module.exports = {
  generateOTP,
  sendEMail,
  generatePassword,
};
