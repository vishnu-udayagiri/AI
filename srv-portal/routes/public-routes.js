const router = require('express').Router();


const {downloadSingleB2CInvoice } = require('../libs/invoice.js');

const { fetchMasterData, verifyCaptcha, getCaptcha } = require('../controller/public-controller.js');
const {
  checkUserRole,
  generateOTPforRegistration,
  verifyOTPforRegistration,
  fetchCompanyDetails,
  fetchGSTINsForPAN,
  fetchGSTINDetails,
  fetchGSTINDetailsForPAN,
  fetchNoPanGSTINDetails,
  createUser,
  checkConsulate,
  checkUserRoleV2,
  getCategoryDetails,countryiata,fetchIataDetails,
  resendRegOTP
} = require('../controller/register-controller');

const { userLogin, verifyOTP, resendOTP, activateAccount, forgotPassword, verifyResetPassword, forceResetPassword } = require('../controller/login-controller');
const { validateRegistration } = require('../middleware/validate-user');

router.get('/test', function (req, res) {
  res.send('Public test route');
});
// Fetch Masters for public routes
router.get('/fetch-master-data', fetchMasterData);
// Step 1 - Check user role
router.get('/check-user-role', checkUserRole);
router.get('/v2/check-user-role', checkUserRoleV2);
router.get('/get-category-details', getCategoryDetails);
router.get('/check-consulate', checkConsulate);
router.get('/get-country-iata', countryiata);
// Step 2 - Generate email otp for user registration
router.get('/verify-email', validateRegistration, generateOTPforRegistration);
// Step 3 - Verify email otp for user registration
router.post('/verify-email', validateRegistration, verifyOTPforRegistration);
// Step 4 - Fetch company details if User role is "User"
router.get('/company-details', validateRegistration, fetchCompanyDetails);
// Step 5 - Fetch GSTINS associated with PAN
router.get('/pan-gstin', validateRegistration, fetchGSTINsForPAN);
// Step 6 - fetch GSTIN Details
router.post('/pan-gstin-details', validateRegistration, fetchGSTINDetailsForPAN);
router.post('/gstin-details', validateRegistration, fetchGSTINDetails);
router.post('/nopan-gstin-details', validateRegistration, fetchNoPanGSTINDetails);
router.post('/iata-details', validateRegistration, fetchIataDetails);
// Step 7 - fetch captcha
router.get('/get-captcha', getCaptcha);
// Step 8 - verify captcha
router.post('/validate-captcha', verifyCaptcha);
// Step 9 - create user
router.post('/create-user', validateRegistration, createUser);
//Login Route
router.post('/login', userLogin);
//Verify OTP
router.post('/verify-otp', verifyOTP);
//Resend OTP
router.get('/resend-otp', resendOTP);
//Resend Reg OTP
router.get('/resend-reg-otp', resendRegOTP);
// Account activation request
router.post('/activate-account', activateAccount);
// Forgot password
router.post('/forgot-password', forgotPassword);
// Reset forgot password
router.post('/verify-reset-password', verifyResetPassword);
// force reset password
router.post('/force-reset-password', forceResetPassword);

//gets B2C Invoices  without Login
router.post('/b2c-invoice-download',downloadSingleB2CInvoice)

module.exports = router;
