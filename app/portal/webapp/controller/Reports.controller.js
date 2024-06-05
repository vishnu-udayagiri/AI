sap.ui.define(
    ["sap/ui/core/mvc/Controller",
        "sap/m/MessageBox",
        "sap/ui/Device",
        "sap/m/PDFViewer",
        "sap/ui/model/json/JSONModel"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,
        MessageBox,
        Device,
        PDFViewer,
        JSONModel) {
        "use strict";

        return Controller.extend("airindiagst.controller.Reports", {
            onAfterRendering: function () {


            },
            onInit: function () {
                /**Check for JWT token */


                const jwt = sessionStorage.getItem("jwt");

                if (!jwt) {
                    window.location.replace('/portal/index.html')
                }

                this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("Reports").attachPatternMatched(this._routeMatched, this);
                this.SendRequest = this.getOwnerComponent().SendRequest;
                this.getOwnerComponent().getModel("shellModel").setProperty("/hinticon", false);
                this.defaultGSTN_num = "";
                this.defaultperiod = "";

            },
            _routeMatched: function () {
                sap.ui.core.BusyIndicator.show();

                this.dashboarddetails = "";
                const jwt = sessionStorage.getItem("jwt")
                var decodedData;
                if (!jwt) {

                    window.location.replace('/portal/index.html');

                }
                if (jwt) {
                    decodedData = JSON.parse(atob(jwt.split('.')[1]));
                    this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", " " + decodedData.FirstName + ' ' + decodedData.LastName);
                }
                // if(decodedData.CanAmendmentRequest){
                //     this.canAmmnedRequestFlag = true;
                // }else{
                //     this.canAmmnedRequestFlag = false;
                // }
                this.category = decodedData.category;
                if (decodedData.ISB2A == true) {
                    if (this.category === "07") {
                        this.getView().byId("tile_tcs").setVisible(false);
                        this.getView().byId("tile_ticket").setVisible(false);
                        this.getView().byId("tile_area").setVisible(false);
                        this.getView().byId("tile_gstinmaster").setVisible(false);
                        this.getView().byId("tile_gst").setVisible(false);
                    }
                    else {
                        this.getView().byId("tile_gstinmaster").setVisible(true);
                        this.getView().byId("tile_gst").setVisible(true);
                        this.getView().byId("tile_tcs").setVisible(true);
                        this.getView().byId("tile_ticket").setVisible(false);

                        this.getView().byId("tile_area").setVisible(false);
                    }
                    this.ISB2A_flag = true;
                } else {
                    this.getView().byId("tile_tcs").setVisible(false);
                    this.getView().byId("tile_ticket").setVisible(false);
                    this.getView().byId("tile_area").setVisible(false);
                    this.ISB2A_flag = false;
                }
                sap.ui.core.BusyIndicator.hide();
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "Reports");
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/userInfo", + decodedData.FIRSTNAME + ' ' + decodedData.LASTNAME);
                this.getOwnerComponent().getModel("shellModel").setProperty("/hinticon", false);
               
            },
            OnclickGO: function () {
                sap.ui.core.BusyIndicator.show();
                var filter = new Array();
                var filterval = {};
                var _self = this;
                if (this.getView().byId("fbmc-TIMELINE").getSelectedKey()) {
                    var fieldName = "invoiceFilter";
                    filterval.invoiceFilter = this.getView().byId("fbmc-TIMELINE").getSelectedKey();
                    var period = filterval.invoiceFilter;
                }
                if (this.getView().byId("fbmc-GSTIN").getSelectedKey() != "") {
                    var fieldName = "passengerGSTIN";
                    filterval.passengerGSTIN = this.getView().byId("fbmc-GSTIN").getSelectedKey();
                    var passengerGSTIN = filterval.passengerGSTIN;
                }
                this.SendRequest(this, "/portal-api/portal/v1/get-dashboard-details?period=" + period + "&passengerGSTIN=" + passengerGSTIN + "", "GET", {}, null, (_self, data, message) => {
                    _self.dashboarddetails = data;
                    _self.getView().getModel("USERModel").setData(_self.dashboarddetails);
                    _self.getView().getModel("USERModel").refresh();

                    sap.ui.core.BusyIndicator.hide();

                });
            },
            onPressDiscrepancyReports: function () {
                this.oRouter.navTo("discrepancy");
            },
            onPressExhaustiveReports: function () {
                this.oRouter.navTo("Exhaustive");
            },
            onPressTicketStatusReports: function () {
                this.oRouter.navTo("TicketStatus");
            },
            onPressInvoiceReports: function () {
                this.oRouter.navTo("InvoiceReport");
            },
            onPressGSTReports: function () {
                this.oRouter.navTo("GSTReports");
            },
            onPressAreaSummaryReports: function () {
                this.oRouter.navTo("Areasummary");
            },
            onPressProfile: function () {
                this.oRouter.navTo("userProfile");
            },
            onPressGSTInvoicesHistory: function () {
                this.oRouter.navTo("GSTInvoicesHistory");
            },
            onPressTCSSummaryReports: function () {
                this.oRouter.navTo("tcsSummary");
            },
            onPressGSTINMasterReports: function () {
                this.oRouter.navTo("gstinMasterReport");
            },
            onPressAmendmentRequest: function () {
                if (this.canAmmnedRequestFlag) {
                    this.oRouter.navTo("amendmentRequest");
                } else {
                    MessageBox.show("You are not authorised for requesting amendment.");
                }

            },
            onPressAmmendment: function () {
                this.oRouter.navTo("amendment");
            },
            onPressAuditLog: function () {
                this.oRouter.navTo("auditLog");
            },
            onPressReports: function () {
                this.oRouter.navTo("auditLog");
            }

        });
    }
);