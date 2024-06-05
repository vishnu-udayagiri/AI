const router = require('express').Router();

const {
  getInvoicesFromAmendment,
  makeGSTINAmendmentInInvoice,
  makeAddressAmendmentInInvoice,
  rejectGSTINAmendmentInInvoice,
  approveGSTINAmendmentInInvoice,
  approveAddressAmendmentInInvoice,
  rejectAddressAmendmentInInvoice,
  makeChangeAddressAmendmentInInvoice,
  approveChangeAddressAmendmentInInvoice,
  rejectChangeAddressAmendmentInInvoice,
  amendmentRequestBulkUpload,
  getExcelTemplate,
} = require('../controller/amendment-controller.js');
const { getInvoiceData, getInvoicesForUser, getDashboardDetails, getInvoicesForUserV2, logout, resetActiveSession } = require('../controller/portal-controller.js');
const {
  getProfileDetails,
  fetchGSTINsForPAN,
  fetchGSTINDetails,
  blockUser,
  unBlockUser,
  approveUser,
  activateUser,
  rejectUser,
  editProfile,
  resetPassword,
  fetchIataCode,
  fetchIATADetails,
} = require('../controller/profile-controller.js');
const { getAuditLog, getInvoiceLog, getInvoiceNumber } = require('../controller/auditlog-controller.js');
const { downloadInvoice,archivedInvoiceDownload} = require('../libs/invoice.js');
const { generateResponse } = require('../libs/response.js');
const { getTicketStatusReport, getGstinReports, getExhaustiveReport, getReports, getFilterData, getFilterDataNew } = require('../controller/report.controller.js');

router.get('/get-profile-details', getProfileDetails);
router.get('/get-invoices', getInvoiceData);
router.post('/get-user-invoices', getInvoicesForUserV2);
router.post('/get-invoices-from-amendment', getInvoicesFromAmendment);
router.post('/make-gstin-amendment', makeGSTINAmendmentInInvoice);
router.post('/make-address-amendment', makeAddressAmendmentInInvoice);
router.post('/make-change-address-amendment', makeChangeAddressAmendmentInInvoice);
router.post('/approve-amendment-request', approveGSTINAmendmentInInvoice);
router.post('/reject-amendment-request', rejectGSTINAmendmentInInvoice);
router.post('/approve-address-amendment-request', approveAddressAmendmentInInvoice);
router.post('/reject-address-amendment-request', rejectAddressAmendmentInInvoice);
router.post('/approve-change-address-amendment-request', approveChangeAddressAmendmentInInvoice);
router.post('/reject-change-address-amendment-request', rejectChangeAddressAmendmentInInvoice);
router.post('/excelUpload/amendment-request', amendmentRequestBulkUpload);
router.get('/excelUpload/get-amendment-excel-template', getExcelTemplate);

router.post('/get-audit-log', getAuditLog);
router.get('/get-invoice-log', getInvoiceLog);
router.get('/get-invoice-number', getInvoiceNumber);

router.get('/get-dashboard-details', getDashboardDetails);
router.get('/pan-gstin', fetchGSTINsForPAN);
router.post('/gstin-details', fetchGSTINDetails);
router.post('/block-user', blockUser);
router.post('/unblock-user', unBlockUser);
router.post('/approve-user', approveUser);
router.post('/edit-profile', editProfile);
router.post('/activate-user', activateUser);
router.post('/reject-user', rejectUser);
router.post('/reset-password', resetPassword);
router.get('/get-iata-list', fetchIataCode);
router.post('/iata-details', fetchIATADetails);

router.post('/download-invoice-pdf', downloadInvoice);
router.post('/archived-invoice-download',archivedInvoiceDownload)
// router.post('/b2c-invoice-download',downloadSingleB2CInvoice)

router.post('/get-reports', getReports);
router.post('/get-gstin-reports', getGstinReports);
router.post('/get-ticket-status-report', getTicketStatusReport);
router.post('/get-exhaustive-report', getExhaustiveReport);
router.post('/get-filter-data', getFilterDataNew);


//logout route
router.get('/logout', logout);
router.get('/reset-active-session', resetActiveSession);

const sampleJSON = require('./SampleJson.json');
router.get('/sample-download-pdf', (req, res) => {
  return res.status(200).send(
    generateResponse('Success', 'Succesfully fetched', 'T', 'S', 'null', false, {
      file: sampleJSON.pdfFile,
    })
  );
});

module.exports = router;
