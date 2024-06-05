sap.ui.define(
    ["sap/ui/core/mvc/Controller",
        "sap/m/MessageBox",
        "sap/ui/Device",
        "sap/m/PDFViewer",
        "sap/ui/model/json/JSONModel",
        "airindiagst/model/formatter",
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,
        MessageBox,
        Device,
        PDFViewer, JSONModel,
        formatter) {
        "use strict";

        return Controller.extend("airindiagst.controller.LandingPage", {
            formatter: formatter,
            formatInvoiceCount: function(number) {
                if(number){
                if (number >= 1e9) {
                    return Math.floor(number / 1e9) + 'B';
                } else if (number >= 1e6) {
                    return Math.floor(number / 1e6) + 'M';
                } else if (number >= 1e3) {
                    return Math.floor(number / 1e3) + 'K';
                } else {
                    return number.toString();
                }
                }
            },
            onInit: function () {
                /**Check for JWT token */
                sap.ui.core.BusyIndicator.show();
                const jwt = sessionStorage.getItem("jwt");
                if (!jwt) {
                    window.location.replace('/portal/index.html')
                }
                //this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                this.SendRequest = this.getOwnerComponent().SendRequest;
                this.defaultGSTN_num = "";
                this.defaultperiod = "";
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("LandingPage").attachPatternMatched(this._routeMatched, this);

            },
            _routeMatched: function () {
                sap.ui.core.BusyIndicator.show();

                this.dashboarddetails = "";
                const jwt = sessionStorage.getItem("jwt");
                var decodedData;
                 if (jwt) {
                     decodedData = JSON.parse(atob(jwt.split('.')[1]));
                     this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", "Welcome, " + decodedData.FirstName + ' ' + decodedData.LastName);
                 }
                 if(decodedData.category){
                    this.category = decodedData.category;
                 }
                 if(decodedData.ISB2A){
                    this.byId("b2bcard").setVisible(false);
                    this.byId("mybookingcard").setVisible(true);
                    this.byId("bookedthroughcard").setVisible(true);
                    this.byId("documentstile").setTooltip("View and download your GST invoices for the current F.Y.");
                 }else{
                    this.byId("b2bcard").setVisible(true);
                    this.byId("mybookingcard").setVisible(false);
                    this.byId("bookedthroughcard").setVisible(false);
                 }
                 if(decodedData.category == "07"){
                    this.byId("fbmc-GSTIN").setVisible(false);
                    this.byId("b2bcard").setVisible(false);
                    this.byId("mybookingcard").setVisible(false);
                    this.byId("bookedthroughcard").setVisible(true);
                 }else{
                    this.byId("fbmc-GSTIN").setVisible(true);
                 }
                this.SendRequest(this, "/portal-api/portal/v1/get-dashboard-details", "GET", {}, null, (_self, data, message) => {
                    if (data) {
                        _self.dashboarddetails = data;
                        console.log(data)
                        _self.pendingamends = data.totalAmendmentPending;
                        _self.dashboarddetails.totAmends = _self.dashboarddetails.totalAmendmentPending;
                        _self.dashboarddetails.totalInvoice = _self.formatInvoiceCount(_self.dashboarddetails.totalInvoice);
                        _self.dashboarddetails.totalAmendmentPending = _self.formatInvoiceCount(_self.dashboarddetails.totalAmendmentPending);
                        _self.dashboarddetails.iataigstAmount= _self.formatlargenumber(_self.dashboarddetails.iataigstAmount);
                        _self.dashboarddetails.iatasgstAmount= _self.formatlargenumber(_self.dashboarddetails.iatasgstAmount);
                        _self.dashboarddetails.iatacgstAmount= _self.formatlargenumber(_self.dashboarddetails.iatacgstAmount);
                        _self.dashboarddetails.igstAmount= _self.formatlargenumber(_self.dashboarddetails.igstAmount);
                        _self.dashboarddetails.cgstAmount= _self.formatlargenumber(_self.dashboarddetails.cgstAmount);
                        _self.dashboarddetails.sgstAmount= _self.formatlargenumber(_self.dashboarddetails.sgstAmount);
                        _self.dashboarddetails.iatatotalTax= _self.formatlargenumber(_self.dashboarddetails.iatatotalTax);
                        _self.dashboarddetails.totalTax= _self.formatlargenumber(_self.dashboarddetails.totalTax);
                        //_self.defaultGSTN_num =_self.GSTDetails.defaultGSTIN.GSTNO;
                        _self.oModel = new sap.ui.model.json.JSONModel([]);
                        _self.oModel.setData(_self.dashboarddetails);
                        if(_self.category !="07"){
                            if(_self.dashboarddetails.defaultGSTIN == ""){
                                _self.oRouter.navTo("userProfile", {
                                    eventfiredfrom: "LandingPage"
                                });
                            }
                        }

                        _self.getView().setModel(_self.oModel, "USERModel");
                        _self.defaultGSTN_num = _self.dashboarddetails.defaultGSTIN;
                        _self.defaultperiod = _self.dashboarddetails.defaultPeriod;
                        _self.byId("approvertile").setTooltip("Approve the requested amendments for invoices here.\nTotal amendments pending for approval: "+_self.dashboarddetails.totalAmendmentPending);
                        if((_self.category != "07") && (_self.category != "01")){
                           
                            _self.byId("documentstile").setTooltip("View and download your GST invoices for the current F.Y.\nTotal Documents: "+_self.dashboarddetails.myBooking);
                        }else{
                            _self.byId("documentstile").setTooltip("View and download your GST invoices for the current F.Y.\nTotal Documents My Bookings: "+_self.dashboarddetails.myBooking +"\nBooked For: "+_self.dashboarddetails.bookedThrough);
                        
                        }
                        if(_self.category == "07"){
                                 
                            _self.byId("documentstile").setTooltip("View and download your GST invoices for the current F.Y.\nTotal Documents: "+_self.dashboarddetails.bookedThrough);
                        }

                        this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", "Welcome, " + _self.dashboarddetails.userName);
                        this.getOwnerComponent().getModel("shellModel").setProperty("/userInfo", _self.dashboarddetails.userName);

                        if (_self.dashboarddetails.ISADMIN == true && _self.pendingamends != 0) {
                            _self.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", true);
                        } else {
                            _self.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                        }
                        if (_self.dashboarddetails.ISADMIN == true && _self.dashboarddetails.userPending != 0) {
                            _self.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", true);
                        } else {
                            _self.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);
                        }
                       if(_self.dashboarddetails.ISADMIN != true){
                        this.byId("admintile").setVisible(false);
                        this.byId("subusertile").setVisible(true);   
                        this.byId("tile-audittrail").setVisible(false);
                       }else{
                        this.byId("subusertile").setVisible(false);
                        this.byId("admintile").setVisible(true);
                        this.byId("tile-audittrail").setVisible(true);
                       }
                        // _self.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", true);
                        // _self.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", true);
                        _self.getOwnerComponent().getModel("shellModel").setProperty("/totalAmendmentPending", _self.dashboarddetails.totalAmendmentPending);
                        _self.getOwnerComponent().getModel("shellModel").setProperty("/userPending", _self.dashboarddetails.userPending);
                        _self.getOwnerComponent().getModel("shellModel").setProperty("/hinticon", true);
               


                        _self.byId("fbmc-GSTIN").setSelectedKeys(_self.defaultGSTN_num);
                        _self.byId("fbmc-TIMELINE").setSelectedKey(_self.defaultperiod);

                        if (_self.byId("fbmc-TIMELINE").getSelectedKey() == "CM" || _self.byId("fbmc-TIMELINE").getSelectedKey() == "PM" || _self.byId("fbmc-TIMELINE").getSelectedKey() == "CY") {
                            _self.byId("fbdat-financialYear").setVisible(false);
                            _self.byId("fbdat-invoiceDate").setVisible(false);
                        } else if (_self.byId("fbmc-TIMELINE").getSelectedKey() == "PY") {
                            var currentDate = new Date();
                            var currentYear = currentDate.getFullYear();
                            var previousYear = currentYear - 1;
                            var previousFinancialYearEndDate = new Date(previousYear, 2, 31);
                            _self.byId("fbdat-financialYear").setMaxDate(previousFinancialYearEndDate);
                            _self.byId("fbdat-invoiceDate").setMaxDate(previousFinancialYearEndDate);

                            _self.byId("fbdat-financialYear").setVisible(true);
                            _self.byId("fbdat-invoiceDate").setVisible(true);

                        }
                        if (data.CANAMENDMENTREQUEST) {
                            this.canAmmnedRequestFlag = true;
                        } else {
                            this.canAmmnedRequestFlag = false;
                        }
                        if (data.CANAMENDMENTAPPROVE) {
                            this.canAmmnedApproveFlag = true;
                        } else {
                            this.canAmmnedApproveFlag = false;
                        }
                        sap.ui.core.BusyIndicator.hide();
                    } else {
                        sap.ui.core.BusyIndicator.hide();
                        //formation("Some error occured,Please refresh and try again")
                    }
                });
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "Dashboard");
            },
            formatlargenumber: function (sValue) {
                if (sValue) {
                    sValue = Math.floor(parseFloat(sValue));
                    if (sValue >= 1e9) {
                        return Math.floor(sValue / 1e9) + 'B';
                    } else if (sValue >= 1e6) {
                        return Math.floor(sValue / 1e6) + 'M';
                    } else if (sValue >= 1e3) {
                        var sValue = sValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        // return Math.floor(number / 1e3) + 'K';
                    }              
                }
                return sValue;
            },
            handleSelectedPeriod: function (oEvent) {
                var selectedItemKey = oEvent.getSource().getSelectedKey();
                var invoiceDateFilter = this.getView().byId("fbdat-invoiceDate");
                var minDate, maxDate;
                if (this.byId("fbmc-TIMELINE").getSelectedKey() == "CM" || this.byId("fbmc-TIMELINE").getSelectedKey() == "PM" || this.byId("fbmc-TIMELINE").getSelectedKey() == "CY") {
                    this.byId("fbdat-financialYear").setVisible(false);
                    this.byId("fbdat-invoiceDate").setVisible(false);
                } else if (this.byId("fbmc-TIMELINE").getSelectedKey() == "PY") {
                    var currentDate = new Date();
                    var currentYear = currentDate.getFullYear();
                    var previousYear = currentYear - 1;
                    var previousFinancialYearEndDate = new Date(previousYear, 2, 31);
                    this.byId("fbdat-financialYear").setMaxDate(previousFinancialYearEndDate);
                    this.byId("fbdat-invoiceDate").setMaxDate(previousFinancialYearEndDate);
                    this.byId("fbdat-financialYear").setVisible(true);
                    this.byId("fbdat-invoiceDate").setVisible(true);

                }
                if (selectedItemKey === "CM") {
                    // Set minDate and maxDate for Current Month
                    // Calculate current month start and end dates
                    var currentDate = new Date();
                    minDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                } else if (selectedItemKey === "PM") {
                    // Set minDate and maxDate for Previous Month
                    // Calculate previous month start and end dates
                    var currentDate = new Date();
                    currentDate.setMonth(currentDate.getMonth() - 1);
                    minDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                } else if (selectedItemKey === "CY") {
                    var currentDate = new Date();
                    var fiscalYearStart = new Date(currentDate.getFullYear(), 3, 1); // April is month 3 (0-indexed)

                    var fiscalYearEnd = new Date(currentDate.getFullYear() + 1, 2, 31); // March is month 2 (0-indexed)

                    minDate = fiscalYearStart;
                    maxDate = fiscalYearEnd;
                }

                this.getView().byId("fbdat-invoiceDate").setMinDate(minDate);
                this.getView().byId("fbdat-invoiceDate").setMaxDate(maxDate);


            },
            onFinancialYearChange: function (oEvent) {
                const oDatePicker = oEvent.getSource();
                const oDateRangeSelection = this.getView().byId("fbdat-invoiceDate");

                // Get the selected year from the DatePicker
                const selectedYear = oDatePicker.getDateValue().getFullYear();

                // Calculate the start date of the fiscal year (assuming fiscal year starts on April 1st)
                const fiscalYearStartDate = new Date(selectedYear, 3, 1); // April is month 3 (0-based index)

                // Calculate the end date of the fiscal year (assuming fiscal year ends on March 31st of the following year)
                const fiscalYearEndDate = new Date(selectedYear + 1, 2, 31); // March is month 2 (0-based index)

                // Set the minDate and maxDate for the DateRangeSelection control based on the fiscal year
                this.getView().byId("fbdat-invoiceDate").setMinDate(fiscalYearStartDate);
                this.getView().byId("fbdat-invoiceDate").setMaxDate(fiscalYearEndDate);
            },
            OnclickGO: function () {
                sap.ui.core.BusyIndicator.show();
                var filter = new Array();
                var filterval = {};
                var period = "";
                var _self = this;
                var from = "";
                var to = "";
                var financialYear = "";
                var passengerGSTIN = "";
                if (this.getView().byId("fbmc-GSTIN").getSelectedKeys().length < 1) {
                    MessageBox.error("Please select atleast one GSTIN");
                    sap.ui.core.BusyIndicator.hide();
                    return false;

                }
                if (this.getView().byId("fbmc-TIMELINE").getSelectedKey()) {
                    var fieldName = "invoiceFilter";
                    filterval.invoiceFilter = this.getView().byId("fbmc-TIMELINE").getSelectedKey();
                    var period = filterval.invoiceFilter;
                }
                if (this.getView().byId("fbmc-GSTIN").getSelectedKeys() != "") {
                    //   var fieldName = "passengerGSTIN";
                    //  filterval.passengerGSTIN = this.getView().byId("fbmc-GSTIN").getSelectedKeys();
                    var passengerGSTIN = this.getView().byId("fbmc-GSTIN").getSelectedKeys();
                }
                if (this.getView().byId("fbdat-invoiceDate").getValue()) {
                    var daterange = this.getView().byId("fbdat-invoiceDate").getValue().split("to");
                    var from = daterange[0].trim();
                    var to = daterange[1].trim();
                }
                if (this.getView().byId("fbdat-financialYear").getValue()) {
                    // filterval.financialYear = this.getView().byId("fbdat-financialYear").getValue();
                    var financialYear = this.getView().byId("fbdat-financialYear")._sPreviousValue;

                }
                this.SendRequest(this, "/portal-api/portal/v1/get-dashboard-details?period=" + period + "&passengerGSTIN=" + passengerGSTIN + "&from=" + from + "&to=" + to + "&financialYear=" + financialYear + "", "GET", {}, null, (_self, data, message) => {
                    if (data) {
                        _self.dashboarddetails = data;
                        _self.dashboarddetails.totAmends = _self.dashboarddetails.totalAmendmentPending;
                        _self.dashboarddetails.totalInvoice = _self.formatInvoiceCount(_self.dashboarddetails.totalInvoice);
                        _self.dashboarddetails.totalAmendmentPending = _self.formatInvoiceCount(_self.dashboarddetails.totalAmendmentPending);
                        _self.dashboarddetails.iataigstAmount= _self.formatlargenumber(_self.dashboarddetails.iataigstAmount);
                        _self.dashboarddetails.iatasgstAmount= _self.formatlargenumber(_self.dashboarddetails.iatasgstAmount);
                        _self.dashboarddetails.iatacgstAmount= _self.formatlargenumber(_self.dashboarddetails.iatacgstAmount);
                        _self.dashboarddetails.igstAmount= _self.formatlargenumber(_self.dashboarddetails.igstAmount);
                        _self.dashboarddetails.cgstAmount= _self.formatlargenumber(_self.dashboarddetails.cgstAmount);
                        _self.dashboarddetails.sgstAmount= _self.formatlargenumber(_self.dashboarddetails.sgstAmount);
                        _self.dashboarddetails.iatatotalTax= _self.formatlargenumber(_self.dashboarddetails.iatatotalTax);
                        _self.dashboarddetails.totalTax= _self.formatlargenumber(_self.dashboarddetails.totalTax);
                        _self.getView().getModel("USERModel").setData(_self.dashboarddetails);
                        _self.getView().getModel("USERModel").refresh();

                        sap.ui.core.BusyIndicator.hide();
                    } else {
                        sap.ui.core.BusyIndicator.hide();
                        // MessageBox.information("Some error occured,Please refresh and try again");
                    }

                });
            },
            onPressGSTInvoices: function () {
                if(this.category !="07"){
                    if(this.dashboarddetails.defaultGSTIN == ""){
                        MessageBox.information("Please complete your profile registration and add a default GSTIN.");
                    }else{
                        this.oRouter.navTo("GSTInvoices");
                    }
                }else {
                this.oRouter.navTo("GSTInvoices");
                }
            },
            onPressProfile: function () {
                this.oRouter.navTo("userProfile", {
                    eventfiredfrom: " "
                });
            },
            onPressGSTInvoicesHistory: function () {
                if(this.category !="07"){
                    if(this.dashboarddetails.defaultGSTIN == ""){
                        MessageBox.information("Please complete your profile registration and add a default GSTIN.");
                    }else{
                        this.oRouter.navTo("GSTInvoicesHistory");
                    }
                }else {
                    this.oRouter.navTo("GSTInvoicesHistory");
                }
               
            },
            onpressDocumentHistoryPriorTo: function () {
                if(this.category !="07"){
                    if(this.dashboarddetails.defaultGSTIN == ""){
                        MessageBox.information("Please complete your profile registration and add a default GSTIN.");
                    }else{
                        this.oRouter.navTo("DocumentHistoryPriorTo");
                    }
                }else {
                    this.oRouter.navTo("DocumentHistoryPriorTo");
                }
               
            },
            onPressAmendmentRequest: function () {
                if (this.canAmmnedRequestFlag) {
                    this.oRouter.navTo("amendmentRequest");
                } else {
                    MessageBox.information("You are not authorised for requesting amendment.");
                }

            },
            onPressAmmendment: function () {
                if (this.canAmmnedApproveFlag) {
                    this.oRouter.navTo("amendment");
                } else {
                    MessageBox.information("You are not authorised for Approving Amendment.");
                }
               
            },
            onPressAuditLog: function () {
               if(this.dashboarddetails.ISADMIN == true){
                this.oRouter.navTo("auditLog");
               } else {
                MessageBox.information("You are not authorised for Audit Trails.");
            }
               
            },
            onPressReports: function () {
                this.oRouter.navTo("Reports");
            },
            onPressUserManual: function () {
                this.oRouter.navTo("userManual");
            }


        });
    }
);