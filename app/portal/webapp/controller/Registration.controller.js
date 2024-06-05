sap.ui.define(
    ["sap/ui/core/mvc/Controller",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/Device",
        "sap/m/PDFViewer",
        "sap/ui/model/json/JSONModel",
        "airindiagst/model/validations",
        "airindiagst/model/formatter",
        "sap/m/MessageStrip",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/layout/HorizontalLayout",
        "sap/ui/layout/VerticalLayout",
        "sap/m/Dialog",
        "sap/m/Button",
        "sap/m/Label",
        "sap/m/Popover",
        "sap/m/library",
        "sap/m/Text",
        "sap/m/TextArea",
        "sap/ui/core/Core",
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,
        MessageBox, MessageToast,
        Device,
        PDFViewer,
        JSONModel, validations, formatter, MessageStrip, Filter, FilterOperator, Popover, HorizontalLayout, VerticalLayout, Dialog, Button, Label, mobileLibrary) {
        "use strict";
        var PlacementType = mobileLibrary.PlacementType;
        return Controller.extend("airindiagst.controller.Registration", {
            validations: validations,
            formatter: formatter,
            onAfterRendering: function () {
            },

            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("Registration").attachPatternMatched(this._routeMatched, this);
                //i18n Resource Bundle 
                this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

                //AJAX send Request
                this.SendRequest = this.getOwnerComponent().SendRequest;

                const companyDetailsData = {
                    "COUNTRY_CODE": "IN",
                    "ISECOMMERCEOPERATOR": false
                }

                const userDetailsData = {
                    "DEFAULTPERIOD": "CM"
                }

                const TCSDetailsData = {
                    "TCSCOUNTRY": "IN"
                }

                this.companyDetailModel = new JSONModel(companyDetailsData);
                this.getView().setModel(this.companyDetailModel, "companyDetailModel");

                this.TCSDetailModel = new JSONModel(TCSDetailsData);
                this.getView().setModel(this.TCSDetailModel, "TCSDetailModel");

                this.userDetailModel = new JSONModel(userDetailsData);
                this.getView().setModel(this.userDetailModel, "userDetailModel");

                this.GSTDetailModel = new JSONModel([]);
                this.getView().setModel(this.GSTDetailModel, "GSTDetailModel");

                this.IATADetailModel = new JSONModel([]);
                this.getView().setModel(this.IATADetailModel, "IATADetailModel");
                this.IATADetailModel.setData([]);

                this.attachmentModel = new JSONModel();
                this.getView().setModel(this.attachmentModel, "attachmentModel");

                this.masterDataModel = new JSONModel();
                this.masterDataModel.setSizeLimit(2000);
                this.getView().setModel(this.masterDataModel, "masterDataModel");

                this.gstinListModel = new JSONModel();
                this.getView().setModel(this.gstinListModel, "gstinListModel");

                this.agentCodeDialogModel = new JSONModel([]);
                this.getView().setModel(this.agentCodeDialogModel, "agentCodeDialogModel");

                // toggling
                this.configModel = new JSONModel();
                this.getView().setModel(this.configModel);
                var oInput = this.getView().byId("inp-pinCode");
                oInput.attachLiveChange(this.onLiveChange, this);



            },

            validateSpecialCharacters: function (oEvent) {
                var _oInput = oEvent.getSource();
                var val = _oInput.getValue();
                val = val.replace(/[!@#$%^&*(),.?":{}|<>]/, '');
                _oInput.setValue(val);
            },
            // onLiveValidateForInput: function (oEvent) {
            //     var _oInput = oEvent.getSource();
            //     var val = _oInput.getValue();
            //     val = val.replace(/[&-.!@#$₹%^;,`'~*()?":{}|<>+=_\[\]\/\\]/, '');
            //     _oInput.setValue(val);
            //     const sValue = oEvent.getParameter("value"),
            //         oId = oEvent.getParameter("id");
            //     if (sValue) {
            //         this.byId(oId).setValueState("None");
            //     }
            // },
            onLiveValidateForInputTAN: function (oEvent) {
                var _oInput = oEvent.getSource();
                var val = _oInput.getValue();
                var specialCharachters = /[&-.!@#$₹%^;,`'~*()?":{}|<>+=_\[\]\/\\]/;
                var flag = specialCharachters.test(val);
                var newVal = '';
                if (flag == true) {
                    for (var i = 0; i < val.length; i++) {
                        if (!specialCharachters.test(val[i])) {
                            newVal += val[i];
                        }
                    }
                    _oInput.setValue(newVal);
                }

                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },
            onLiveValidateForInputCRN: function (oEvent) {
                var _oInput = oEvent.getSource();
              
                var val = _oInput.getValue();
                var specialCharachters = /[&-.!@#$₹%^;,`'~*()?":{}|<>+=_\[\]\/\\]/;
                var flag = specialCharachters.test(val);
                var newVal = '';
                if (flag == true) {
                    for (var i = 0; i < val.length; i++) {
                        if (!specialCharachters.test(val[i])) {
                            newVal += val[i];
                        }
                    }
                    _oInput.setValue(newVal);
                }

                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },
            onLiveValidateForInputCC: function (oEvent) {     //latest change
                var _oInput = oEvent.getSource();
                var val = _oInput.getValue();
                var specialCharachters = /[!@#$₹%^;`~*()?":{}|<>+=_\[\]\/\\]/;
                var flag = specialCharachters.test(val);
                var newVal = '';
                if (flag == true) {
                    for (var i = 0; i < val.length; i++) {
                        if (!specialCharachters.test(val[i])) {
                            newVal += val[i];
                        }
                    }
                    _oInput.setValue(newVal);
                }
                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },
            onLiveValidateForInputCity: function (oEvent) {
                var _oInput = oEvent.getSource();
                var fileuplod = this.getView().byId("inp-city");
                var val = _oInput.getValue();
                var specialCharachters = /[&-.!@#$₹%^;,`'~*()?":{}|<>+=_\[\]\/\\0123456789]/;
                var flag = specialCharachters.test(val);
                var newVal = '';
                if (flag == true) {
                    for (var i = 0; i < val.length; i++) {
                        if (!specialCharachters.test(val[i])) {
                            newVal += val[i];
                        }
                    }
                    _oInput.setValue(newVal);
                }
                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },
            onLiveValidateForInputfirstName: function (oEvent) {
                var _oInput = oEvent.getSource();
                var val = _oInput.getValue();
                var specialCharachters = /[&-.!@#$₹%^;,`'~*()?":{}|<>+=_\[\]\/\\0123456789]/;
                var flag = specialCharachters.test(val);
                var newVal = '';
                if (flag == true) {
                    for (var i = 0; i < val.length; i++) {
                        if (!specialCharachters.test(val[i])) {
                            newVal += val[i];
                        }
                    }
                    _oInput.setValue(newVal);
                }
                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },
            onLiveValidateForInputLastName: function (oEvent) {
                var _oInput = oEvent.getSource();
                var val = _oInput.getValue();
                var specialCharachters = /[&-.!@#$₹%^;,`'~*()?":{}|<>+=_\[\]\/\\0123456789]/;
                var flag = specialCharachters.test(val);
                var newVal = '';
                if (flag == true) {
                    for (var i = 0; i < val.length; i++) {
                        if (!specialCharachters.test(val[i])) {
                            newVal += val[i];
                        }
                    }
                    _oInput.setValue(newVal);
                }
                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },
            onLiveValidateForInputRegion: function (oEvent) {
                var _oInput = oEvent.getSource();
                var val = _oInput.getValue();
                var specialCharachters = /[&-.!@#$₹%^;,`'~*()?":{}|<>+=_\[\]\/\\0123456789]/;
                var flag = specialCharachters.test(val);
                var newVal = '';
                if (flag == true) {
                    for (var i = 0; i < val.length; i++) {
                        if (!specialCharachters.test(val[i])) {
                            newVal += val[i];
                        }
                    }
                    _oInput.setValue(newVal);
                }
                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },
            onLiveValidateForInput: function (oEvent) {
                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },

            onLiveChange: function (oEvent) {
                var oInput = oEvent.getSource();
                var sValue = oInput.getValue();

                // Use a regular expression to allow only alphanumeric characters
                var alphanumericRegex = /^[a-zA-Z0-9]+$/;

                if (!alphanumericRegex.test(sValue)) {
                    // If the input does not match the regex, remove the invalid characters
                    var sFilteredValue = sValue.replace(/[^a-zA-Z0-9]+/g, '');
                    oInput.setValue(sFilteredValue);
                }
            },
            _routeMatched: async function (oEvent) {
                this.byId("sel-category").setValueState("None");
                this.byId("inp-AgentiataCode").setValueState("None");
                this.byId("inp-companyName").setValueState("None");
                this.byId("sel-consltCountry").setValueState("None");
                this.byId("inp-CompRegNo").setValueState("None");
                this.byId("inp-companyPAN").setValueState("None");
                this.byId("inp-companyTAN").setValueState("None");
                this.byId("inp-website").setValueState("None");
                this.byId("inp-companyPhone").setValueState("None");
                this.byId("inp-address").setValueState("None");
                this.byId("sel-country").setValueState("None");
                this.byId("sel-state").setValueState("None");
                this.byId("inp-region").setValueState("None");
                this.byId("inp-city").setValueState("None");
                this.byId("inp-pinCode").setValueState("None");
                this.byId("sel-title").setValueState("None");
                this.byId("inp-firstName").setValueState("None");
                this.byId("inp-lastName").setValueState("None");
                this.byId("inp-loginEmail").setValueState("None");
                this.byId("inp-userMobile").setValueState("None");
                this.byId("inp-captcha").setValueState("None");
                this._hideMessageStrip(`msgStripAddressGSTIN`);
                this._hideMessageStrip(`msgStripGSTDetails`);
                sap.ui.core.BusyIndicator.show();

                this.companyDetailModel.setData({});
                this.TCSDetailModel.setData({});
                this.userDetailModel.setData({});
                this.GSTDetailModel.setData([]);
                this.attachmentModel.setData({});
                this.GSTDetailModel.refresh();

                jQuery.sap.require("sap.ui.model.json.JSONModel");
                var oViewModel = new sap.ui.model.json.JSONModel({
                    maxDate: new Date(),
                    minDate: new Date()
                });

                this.getView().setModel(oViewModel, "viewModel");

                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "Registration");
                this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", "");
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/hinticon", false);
                if (sessionStorage) {
                    if (sessionStorage.userDetails) {
                        const userDetails = JSON.parse(sessionStorage.userDetails);
                        this.userRole = userDetails.userRole;
                        this.userEmail = userDetails.userEmail;
                        this.category = userDetails.userCategory;
                        this.byId("sel-country").setSelectedKey("IN");
                        //***********NEW USER CATEGORIES*/
                        if (this.category == "08") {
                            this.userCountry = userDetails.userCountry;
                            this.byId("sel-category").setSelectedKey("08");
                            this.byId("sel-category").setEditable(false);
                            this.byId("inp-AgentiataCode").setVisible(false);
                            this.byId("idGSTDetailsTable").setRowActionCount(0);
                            this.byId("ttl-IATADetails").setVisible(false);
                            this.byId("obj-page1").setTitle("Consulate / Embassy Details");
                            this.byId("lbl-companyName").setText("Consulate / Embassy Name");
                            this.byId("inp-companyName").setValue(userDetails.userName);
                            this.byId("lbl-consltCountry").setVisible(true);
                            this.byId("sel-consltCountry").setVisible(true);
                            this.byId("sel-consltCountry").setSelectedKey(userDetails.userCountry);
                            this.byId("ttl-GSTINDetails").setTitle("UIN Details");
                            this.byId("lbl-gstin").setText("UIN");

                            this.byId("ttl-GSTINDetails").setVisible(true);
                            this.byId("ttl-IATADetails").setVisible(false);

                            // this.byId("inp-iataCode").setVisible(false);
                            this.byId("inp-companyName").setVisible(true);
                            this.byId("inp-CompRegNo").setVisible(false);
                            this.byId("inp-companyPAN").setVisible(false);
                            this.byId("inp-companyTAN").setVisible(false);
                            this.byId("inp-website").setVisible(true);
                            this.byId("inp-companyPhone").setVisible(true);
                            this.byId("inp-companyPhone").setRequired(true);
                            this.byId("inp-address").setRequired(true);
                            this.byId("sel-country").setRequired(true);
                            this.byId("sel-state").setRequired(true);
                            this.byId("inp-city").setRequired(true);

                            this.byId("inp-pinCode").setRequired(true);
                            this.byId("inp-pinCode").setMaxLength(6);
                            this.byId("inp-address").setVisible(true);
                            this.byId("sel-country").setVisible(true);
                            this.byId("sel-state").setVisible(true);
                            this.byId("inp-city").setVisible(true);
                            this.byId("inp-pinCode").setVisible(true);
                            this.byId("cb-ecomOperator").setVisible(false);
                            this.byId("ttl-Attachments").setVisible(false);

                            this.byId("certificate").setVisible(false);
                            this.byId("dateofIssue").setVisible(false);
                            this.byId("type").setVisible(false);
                            this.byId("arnnumber").setVisible(false);
                            this.byId("dateofIssueArn").setVisible(false);
                            this.byId("lastvalidated").setVisible(false);
                        } else if (this.category == "05") {
                            this.userGSTIN = userDetails.userGSTIN;
                            this.byId("ttl-GSTINDetails").setTitle("UIN Details");
                            this.byId("lbl-gstin").setText("UIN");
                            this.byId("ttl-GSTINDetails").setVisible(true);
                            this.byId("ttl-IATADetails").setVisible(false);
                            this.byId("inp-AgentiataCode").setVisible(false);
                            this.byId("idGSTDetailsTable").setRowActionCount(0);
                            this.byId("ttl-IATADetails").setVisible(false);
                            this.byId("sel-category").setSelectedKey("05");
                            this.byId("sel-category").setEditable(false);
                            this.byId("obj-page1").setTitle("UN Body Details");
                            this.byId("lbl-companyName").setText("UN Body Name");
                            this.byId("inp-companyName").setValue(userDetails.userName);
                            this.byId("lbl-consltCountry").setVisible(false);
                            this.byId("sel-consltCountry").setVisible(false);
                            //  this.byId("sel-consltCountry").setSelectedKey(userDetails.userCountry);                          
                            // this.byId("inp-iataCode").setVisible(false);
                            this.byId("inp-companyName").setVisible(true);
                            this.byId("inp-CompRegNo").setVisible(false);
                            this.byId("inp-companyPAN").setVisible(false);
                            this.byId("inp-companyTAN").setVisible(false);
                            this.byId("inp-website").setVisible(true);
                            this.byId("inp-companyPhone").setVisible(true);
                            this.byId("inp-companyPhone").setRequired(true);
                            this.byId("inp-address").setRequired(true);
                            this.byId("sel-country").setRequired(true);
                            this.byId("sel-state").setRequired(true);
                            this.byId("inp-city").setRequired(true);
                            this.byId("inp-pinCode").setRequired(true);
                            this.byId("inp-pinCode").setMaxLength(6);
                            this.byId("inp-address").setVisible(true);
                            this.byId("sel-country").setVisible(true);
                            this.byId("sel-state").setVisible(true);
                            this.byId("inp-city").setVisible(true);
                            this.byId("inp-pinCode").setVisible(true);
                            this.byId("cb-ecomOperator").setVisible(false);
                            this.byId("ttl-Attachments").setVisible(false);
                            this.byId("certificate").setVisible(false);
                            this.byId("dateofIssue").setVisible(false);
                            this.byId("type").setVisible(false);
                            this.byId("arnnumber").setVisible(false);
                            this.byId("dateofIssueArn").setVisible(false);
                            this.byId("lastvalidated").setVisible(false);
                        } else if (this.category == "07") {
                            this.userIATA = userDetails.userIATA;
                            this.byId("sel-country").setSelectedKey(userDetails.userCountry);
                            this.byId("inp-region").setValue(userDetails.userRegion);
                            this.byId("inp-city").setValue(userDetails.userCity);
                            this.byId("inp-pinCode").setValue(userDetails.userpostalCode);
                            this.byId("inp-pinCode").setMaxLength(10);
                            this.byId("sel-category").setSelectedKey("07");
                            this.byId("sel-category").setEditable(false);
                            this.byId("obj-page1").setTitle("Overseas Agent Details");
                            this.byId("lbl-companyName").setText("Overseas Agent Name");
                            this.byId("ttl-GSTINDetails").setVisible(false);
                            this.byId("ttl-IATADetails").setVisible(true);
                            this.byId("lbl-consltCountry").setVisible(false);
                            this.byId("sel-consltCountry").setVisible(false);
                            //   this.byId("inp-iataCode").setVisible(false);
                            this.byId("inp-AgentiataCode").setVisible(true);
                            this.byId("inp-AgentiataCode").setEditable(false);
                            this.byId("inp-companyName").setValue(userDetails.userName);
                            this.byId("inp-AgentiataCode").setValue(userDetails.userIATA);
                            this.byId("inp-companyName").setVisible(true);
                            this.byId("inp-CompRegNo").setVisible(false);
                            this.byId("inp-companyPAN").setVisible(false);
                            this.byId("inp-companyTAN").setVisible(false);
                            this.byId("inp-website").setVisible(true);
                            this.byId("inp-companyPhone").setVisible(true);
                            this.byId("inp-companyPhone").setRequired(true);
                            this.byId("inp-address").setRequired(true);
                            this.byId("sel-country").setRequired(true);
                            this.byId("sel-state").setRequired(false);
                            this.byId("inp-city").setRequired(true);
                            this.byId("inp-pinCode").setRequired(true);
                            this.byId("inp-address").setVisible(true);
                            this.byId("sel-country").setVisible(true);
                            this.byId("sel-state").setVisible(false);
                            this.byId("inp-city").setVisible(true);
                            this.byId("inp-pinCode").setVisible(true);
                            this.byId("cb-ecomOperator").setVisible(false);
                            this.byId("ttl-Attachments").setVisible(false);
                            this.byId("ttl-IATADetails").setVisible(true);
                        } else {
                            this.userPan = userDetails.userPan;
                            this.byId("inp-companyPAN").setValue(this.userPan);
                            this.byId("ttl-GSTINDetails").setTitle("GSTIN Details");
                            this.byId("lbl-gstin").setText("GSTIN");
                            this.byId("inp-companyName").setVisible(true);
                            this.byId("inp-CompRegNo").setVisible(true);
                            this.byId("inp-companyPAN").setVisible(true);
                            this.byId("inp-companyTAN").setVisible(true);
                            this.byId("inp-companyPhone").setRequired(true);
                            this.byId("inp-address").setRequired(true);
                            this.byId("sel-country").setRequired(true);
                            this.byId("sel-state").setRequired(true);
                            this.byId("inp-city").setRequired(true);
                            this.byId("inp-pinCode").setRequired(true);
                            this.byId("inp-pinCode").setMaxLength(6);
                            this.byId("obj-page1").setTitle("Company Details");
                            this.byId("lbl-companyName").setText("Company Name");

                        }
                    }
                }


                this.byId("inp-loginEmail").setValue(this.userEmail);

                if (this.userRole === "Admin") {
                    this.getView().getModel().setProperty("/toggleAdmin", true);
                    this.byId("sel-state").setVisible(true);
                    this.byId("inp-region").setVisible(false);
                    this.byId("lbl_region").setVisible(false);
                    if ((this.category == "08") || (this.category == "07") || (this.category == "05")) {
                        this.byId("sel-category").setEditable(false);
                    }
                    if (this.category == "07") {
                        this.byId("inp-AgentiataCode").setEditable(false);
                        this.byId("sel-state").setVisible(false);
                        this.byId("inp-region").setVisible(true);
                        this.byId("lbl_region").setVisible(true);
                    }
                } else {
                    this.getView().getModel().setProperty("/toggleAdmin", false);
                    this.byId("sel-state").setVisible(true);
                    this.byId("inp-region").setVisible(false);
                    this.byId("lbl_region").setVisible(false);
                    if (this.category == "07") {
                        this.byId("inp-AgentiataCode").setEditable(false);
                        this.byId("sel-state").setVisible(false);
                        this.byId("inp-region").setVisible(true);
                        this.byId("lbl_region").setVisible(true);
                    }
                    await this.fetchCompanyDetails();
                }
                await this.fetchMasterData();

                // sap.ui.core.BusyIndicator.hide();
            },

            fetchMasterData: async function () {
                return new Promise((resolve, reject) => {
                    this.SendRequest(this, "/portal-api/public/v1/fetch-master-data", "GET", {}, null, (_self, data, message) => {
                        if ((_self.category != "08") && (_self.category != "07") && (_self.category != "05")) {
                            const codesToRemove = ["05", "07", "08"];
                            data.category = data.category.filter(item => !codesToRemove.includes(item.key));
                        }
                        _self.getView().getModel("masterDataModel").setData(data);
                        _self.getView().getModel("attachmentModel").setData(data.attachment);
                        _self.onFetchOrRefreshCaptcha();
                        if (this.category == "08" || this.category == "05") {
                            _self.getNoPanGstinDetails();
                        } else if (this.category == "07") {
                            _self.getIATADetails();
                        } else {
                            _self.getGSTINDetails();
                        }
                        resolve();
                    });
                });
            },
            onChangeIATA: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var userIATA = this.byId("inp-AgentiataCode").getValue();
                var userCountry = "IN";
                this.IATADetailModel.setData([]);
                this.SendRequest(this, "/portal-api/public/v1/iata-details", "POST", {
                    Authorization: "Bearer " + sessionStorage.getItem("regToken")
                }, JSON.stringify({ param1: userIATA, param2: userCountry }), (_self, data, message) => {
                    if (data.IataDetails.length > 0) {

                        _self.IATADetailModel.setData(data.IataDetails);
                        _self.IATADetailModel.refresh();
                        _self.byId("ttl-IATADetails").setTitle("IATA Details (" + data.IataDetails.length + ")");
                    }
                    _self.IATADetailModel.refresh();
                    sap.ui.core.BusyIndicator.hide();

                });
            },

            /** IATA */
            getIATADetails: function () {

                this.SendRequest(this, "/portal-api/public/v1/iata-details", "POST", {
                    Authorization: "Bearer " + sessionStorage.getItem("regToken")
                }, JSON.stringify({ param1: this.userIATA, param2: this.userCountry }), (_self, data, message) => {
                    if (data.IataDetails.length > 0) {

                        _self.IATADetailModel.setData(data.IataDetails);
                        _self.IATADetailModel.refresh();
                        _self.byId("ttl-IATADetails").setTitle("IATA Details (" + data.IataDetails.length + ")")
                    }
                    sap.ui.core.BusyIndicator.hide();

                });
            },

            /** GSTIN */
            getGSTINDetails: function () {
                const currentDate = new Date();
                const year = currentDate.getFullYear();
                const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based, so we add 1
                const day = currentDate.getDate().toString().padStart(2, '0');

                const formattedDate = `${year}-${month}-${day}`;
                this.SendRequest(this, "/portal-api/public/v1/pan-gstin-details", "POST", {
                    Authorization: "Bearer " + sessionStorage.getItem("regToken")
                }, JSON.stringify({ pan: this.userPan }), (_self, data, message) => {
                    if (data.GSTINDetails.length > 0) {
                        data.GSTINDetails.forEach((item) => {
                            item.addresses = [{
                                TYPE: "Principal",
                                GSTIN: item.GSTIN,
                                USEFORINVOICEPRINTING: true,
                                ADDRESS: item.ADDRESS,

                                STATE: item.STATE,

                                PINCODE: item.PINCODE,
                                EFFECTIVEFROM: formattedDate,
                                editable: false
                            }];
                        });
                        _self.GSTDetailModel.setData(data.GSTINDetails);
                        _self.GSTDetailModel.refresh();
                        _self.byId("ttl-GSTINDetails").setTitle("GSTIN Details (" + data.GSTINDetails.length + ")")
                    }
                    sap.ui.core.BusyIndicator.hide();

                });
            },

            /**NO PAN GSTIN */
            getNoPanGstinDetails: function () {
                const currentDate = new Date();
                const year = currentDate.getFullYear();
                const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based, so we add 1
                const day = currentDate.getDate().toString().padStart(2, '0');

                const formattedDate = `${year}-${month}-${day}`;
                if (this.category == "08") {
                    this.SendRequest(this, "/portal-api/public/v1/nopan-gstin-details", "POST", {
                        Authorization: "Bearer " + sessionStorage.getItem("regToken")
                    }, JSON.stringify({ param1: this.category, param2: this.userCountry }), (_self, data, message) => {
                        if (data.GSTINDetails.length > 0) {
                            data.GSTINDetails.forEach((item) => {
                                item.addresses = [{
                                    TYPE: "Principal",
                                    GSTIN: item.GSTIN,
                                    USEFORINVOICEPRINTING: true,
                                    ADDRESS: item.ADDRESS,
                                    COUNTRY_CODE: item.COUNTRY_CODE ? item.COUNTRY_CODE : " ",
                                    EFFECTIVEFROM: formattedDate,
                                    editable: false
                                }];
                            });
                            _self.GSTDetailModel.setData(data.GSTINDetails);
                            _self.GSTDetailModel.refresh();
                            _self.byId("ttl-GSTINDetails").setTitle("UIN Details (" + data.GSTINDetails.length + ")")
                        }
                        sap.ui.core.BusyIndicator.hide();

                    });
                }
                if (this.category == "05") {
                    this.SendRequest(this, "/portal-api/public/v1/nopan-gstin-details", "POST", {
                        Authorization: "Bearer " + sessionStorage.getItem("regToken")
                    }, JSON.stringify({ param1: this.category, param2: this.userGSTIN }), (_self, data, message) => {
                        if (data.GSTINDetails.length > 0) {
                            data.GSTINDetails.forEach((item) => {
                                var country = item.COUNTRY_CODE ? item.COUNTRY_CODE : " ";
                                item.addresses = [{
                                    TYPE: "Principal",
                                    GSTIN: item.GSTIN,
                                    USEFORINVOICEPRINTING: true,
                                    ADDRESS: item.ADDRESS,
                                    COUNTRY_CODE: country,
                                    EFFECTIVEFROM: formattedDate,
                                    editable: false
                                }];
                            });
                            _self.GSTDetailModel.setData(data.GSTINDetails);
                            _self.GSTDetailModel.refresh();
                            _self.byId("ttl-GSTINDetails").setTitle("UIN Details (" + data.GSTINDetails.length + ")")
                        }
                        sap.ui.core.BusyIndicator.hide();

                    });
                }
            },

            onAddGSTINAddress: function (oEvent) {
                let oData = oEvent.getSource().getBindingContext("GSTDetailModel").getObject();
                this.oGSTUpdateDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.GSTINAddressDialog", this);
                this.gstinDialogModel = new sap.ui.model.json.JSONModel();
                this.gstinDialogModel.setData(oData);
                this.getView().setModel(this.gstinDialogModel, "gstinDialogModel");
                this.getView().addDependent(this.oGSTUpdateDialog);
                this.oGSTUpdateDialog.open();

                sap.ui.getCore().byId("dp-effectiveDate").setMinDate(new Date());
            },

            onAddNewAddress: function (oEvent) {
                var oData = this.gstinDialogModel.getData();
                var oDataAddresses = this.gstinDialogModel.getData().addresses;

                // Define a flag to track if all mandatory fields are filled for all elements
                var validateDate = true,
                    validateMandatory = true,
                    validatePincode = true;
                for (let i = 0; i < oDataAddresses.length; i++) {
                    const item = oDataAddresses[i];
                    if (item.TYPE != "Principal") {
                        if (
                            !item.ADDRESS ||
                            !item.PINCODE ||
                            !item.EFFECTIVEFROM
                        ) {
                            // If any element doesn't have all mandatory fields filled, set the flag to false
                            validateMandatory = false;
                        } else {
                            this._hideMessageStrip(`msgStripAddressGSTIN`);
                            if (item.EFFECTIVEFROM && !validations.validateDate(item.EFFECTIVEFROM)) {
                                validateDate = false;
                            } else {
                                this._hideMessageStrip(`msgStripDateFromat`);
                            }
                            if (item.PINCODE && !validations.validatePincode(item.PINCODE)) {
                                validatePincode = false;
                            } else {
                                this._hideMessageStrip(`msgStripPincodeFromat`);
                            }
                        }
                    } else {
                        this._hideMessageStrip(`msgStripAddressGSTIN`);
                        if (item.EFFECTIVEFROM && !validations.validateDate(item.EFFECTIVEFROM)) {
                            validateDate = false;
                        } else {
                            this._hideMessageStrip(`msgStripDateFromat`);
                        }
                        if (item.PINCODE && !validations.validatePincode(item.PINCODE)) {
                            validatePincode = false;
                        } else {
                            this._hideMessageStrip(`msgStripPincodeFromat`);
                        }
                    }
                };

                // If all mandatory fields are filled for all elements, add a new address
                if (validateDate && validateMandatory && validatePincode) {
                    oDataAddresses.push({
                        TYPE: "Additional",
                        GSTIN: oData.GSTIN,
                        USEFORINVOICEPRINTING: false,
                        ADDRESS: "",
                        COUNTRY_CODE: oData.COUNTRY_CODE,
                        STATE: oData.STATE,
                        PINCODE: "",
                        EFFECTIVEFROM: ""
                    });
                    this.gstinDialogModel.refresh();
                } else if (!validateMandatory) {
                    this._showMessageStrip('oVCGSTINDialog', 'msgStripAddressGSTIN', "Please fill in all mandatory fields for all addresses", 'E');
                } else if (!validateDate) {
                    this._showMessageStrip('oVCGSTINDialog', 'msgStripDateFromat', "Invalid Date format", 'E');
                } else if (!validatePincode) {
                    this._showMessageStrip('oVCGSTINDialog', 'msgStripPincodeFromat', "Invalid Pincode", 'E');
                }
            },

            onChangeIncoicePrinting: function (oEvent) {
                var oTable = sap.ui.getCore().byId("tbl-GSTINaddress");
                var idx = oEvent.getSource().getParent().getIndex();
                var model = oTable.getModel("gstinDialogModel");
                var arrGSTIN = model.getData()?.addresses ?? [];
                arrGSTIN.forEach((x, index) => {
                    if (index === idx) {
                        x.USEFORINVOICEPRINTING = true
                    } else {
                        x.USEFORINVOICEPRINTING = false
                    }
                });
                this._hideMessageStrip(`msgStripGSTDetails`);
            },

            onDeleteGSTINAddress: function (oEvent) {
                const oIndex = oEvent.getParameter("row").getIndex();
                var _self = this;
                MessageBox.confirm("Are you sure you want to delete this item?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            // Delete the item from the model
                            _self.gstinDialogModel.getData().addresses.splice(oIndex, 1);
                            _self.gstinDialogModel.refresh();
                        }
                    }
                });
            },

            onCloseAddNewGSTINAddress: function (oEvent) {
                var oDataAddresses = this.gstinDialogModel.getData().addresses;
                // Define a flag to track if all mandatory fields are filled for all elements
                var validateDate = true,
                    validateMandatory = true,
                    validatePincode = true;
                // Define a flag to track if all mandatory fields are filled for all elements
                for (let i = 0; i < oDataAddresses.length; i++) {
                    const item = oDataAddresses[i];
                    if (item.TYPE != "Principal") {
                        if (
                            !item.ADDRESS ||
                            !item.PINCODE ||
                            !item.EFFECTIVEFROM
                        ) {
                            // If any element doesn't have all mandatory fields filled, set the flag to false
                            validateMandatory = false;
                        } else {
                            this._hideMessageStrip(`msgStripAddressGSTIN`);
                            if (item.EFFECTIVEFROM && !validations.validateDate(item.EFFECTIVEFROM)) {
                                validateDate = false;
                            } else {
                                this._hideMessageStrip(`msgStripDateFromat`);
                            }
                            if (item.PINCODE && !validations.validatePincode(item.PINCODE)) {
                                validatePincode = false;
                            } else {
                                this._hideMessageStrip(`msgStripPincodeFromat`);
                            }
                        }
                    } else {
                        this._hideMessageStrip(`msgStripAddressGSTIN`);
                        if (item.EFFECTIVEFROM && !validations.validateDate(item.EFFECTIVEFROM)) {
                            validateDate = false;
                        } else {
                            this._hideMessageStrip(`msgStripDateFromat`);
                        }
                        if (item.PINCODE && !validations.validatePincode(item.PINCODE)) {
                            validatePincode = false;
                        } else {
                            this._hideMessageStrip(`msgStripPincodeFromat`);
                        }

                    }
                };

                // If all mandatory fields are filled for all elements, add a new address
                if (validateDate && validateMandatory && validatePincode) {
                    this._hideMessageStrip(`msgStripAddressGSTIN`);
                    this.oGSTUpdateDialog.destroy();
                } else if (!validateMandatory) {
                    this._showMessageStrip('oVCGSTINDialog', 'msgStripAddressGSTIN', "Please fill in all mandatory fields for all addresses", 'E');
                } else if (!validateDate) {
                    this._showMessageStrip('oVCGSTINDialog', 'msgStripDateFromat', "Invalid Date format", 'E');
                } else if (!validatePincode) {
                    this._showMessageStrip('oVCGSTINDialog', 'msgStripPincodeFromat', "Invalid Pincode", 'E');
                }
            },

            setCountryDesc: function (sValue) {
                const countryArr = this.masterDataModel.getData().country;
                return formatter.setDescription(sValue, countryArr);
            },

            setStateDesc: function (sValue) {
                const stateArr = this.masterDataModel.getData().states;
                return formatter.setDescription(sValue, stateArr);
            },

            fetchCompanyDetails: async function () {
                return new Promise((resolve, reject) => {
                    this.SendRequest(this, "/portal-api/public/v1/company-details", "GET", {
                        Authorization: "Bearer " + sessionStorage.getItem("regToken")
                    }, null, (_self, data, message) => {
                        _self.companyDetailModel.setData(data.company);
                        _self.category = data.company.CATEGORY;
                        if ((data.company.CATEGORY == "01") || (data.company.CATEGORY == "02") || (data.company.CATEGORY == "07")) {
                            _self.byId("inp-AgentiataCode").setVisible(true);
                        } else {
                            _self.byId("inp-AgentiataCode").setVisible(false);
                        }
                        resolve();
                    });
                });
            },

            /**CAPTCHA */
            onFetchOrRefreshCaptcha: function () {
                sap.ui.core.BusyIndicator.show();
                return new Promise((resolve, reject) => {
                    this.SendRequest(this, "/portal-api/public/v1/get-captcha", "GET", {}, null, (_self, data, message) => {
                        _self.byId("img-captcha").setSrc(data);
                        _self.byId("inp-captcha").setValue("");
                        resolve();
                        sap.ui.core.BusyIndicator.hide();
                    });
                });
            },

            /**Validate CAPTCHA */
            onVerifyCaptcha: function (oEvent) {
                const sValue = oEvent.getParameter("value");
                if (sValue.length >= 6) {
                    sap.ui.core.BusyIndicator.show();
                    this.SendRequest(this, "/portal-api/public/v1/validate-captcha", "POST", {}, JSON.stringify({ captcha: sValue }), (_self, data, message) => {
                        if (message.Code === "E") {
                            //Captcha doesnot match
                            _self.byId("inp-captcha").setValueState("Error").setValueStateText("CAPTCHA does not match. Please try again");
                            _self.captchaValidate = false;
                            _self.onFetchOrRefreshCaptcha();
                        } else if (message.Code === "S") {
                            _self.byId("inp-captcha").setValueState("Success");
                            _self.captchaValidate = true;
                        }
                        sap.ui.core.BusyIndicator.hide();
                    });
                } else {
                    this.byId("inp-captcha").setValueState("Error").setValueStateText("CAPTCHA does not match. Please try again");
                    this.captchaValidate = false;
                }
            },

            /**Toggling based on category chnage B2B / B2A */
            onChangeCategory: function () {
                const selCategory = this.byId("sel-category").getSelectedKey();
                this.byId("sel-category").setValueState("None");
                this.byId("inp-AgentiataCode").setValue("");
                this.byId("cb-ecomOperator").setSelected(false);
                if (selCategory === "01" || selCategory === "02") {
                    this.byId("inp-AgentiataCode").setVisible(true);
                    this.byId("ttl-IATADetails").setVisible(true);
                    //this.byId("cb-ecomOperator").setVisible(true);
                } else {
                    this.byId("inp-AgentiataCode").setVisible(false);
                    this.byId("ttl-IATADetails").setVisible(false);
                   // this.byId("cb-ecomOperator").setVisible(false);
                }
            },

            /**Search GSTIN */
            onSearchGSTINPress: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("GSTIN", FilterOperator.Contains, sValue);
                var oBinding = oEvent.getParameter("itemsBinding");
                oBinding.filter([oFilter]);
            },

            onDefaultGSTINSelect: function (oEvent) {
                var oTable = this.byId("idGSTDetailsTable");
                var idx = oEvent.getSource().getParent().getIndex();
                var model = oTable.getModel("GSTDetailModel");
                var arrGSTIN = model.getData();
                arrGSTIN.forEach((x, index) => {
                    if (index === idx) {
                        x.DEFAULT = true
                    } else {
                        x.DEFAULT = false
                    }
                });
                this._hideMessageStrip(`msgStripGSTDetails`);
                model.setData(arrGSTIN);
            },

            onChangeGSTRow: function (oEvent) {
                const selGSTINs = this.byId("idGSTDetailsTable").getSelectedIndices();
                if (selGSTINs.length > 0) {
                    this._hideMessageStrip(`msgStripSelectGSTIN`);
                }
            },

            /**Upload GSTIN Certificate */
            handleUploadGSTINFile: async function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                this.validfileflag = true;
                await this.change(oEvent,);
                const oIndex = oEvent.getSource().getParent().getParent().getIndex();
                const oObject = oEvent.getSource().getBindingContext("GSTDetailModel").getObject();
                const arrAttachment = this.GSTDetailModel.getData();
                const selFile = oEvent.getSource().FUEl.files[0] ?? null;
                if ((selFile) && (this.validfileflag)) {
                    var base64 = await this.convertFileToBase64WithType(selFile, selFile ? selFile.type : "");
                    oObject.GSTCERTIFICATE = base64;
                    arrAttachment.splice(oIndex, 1, oObject);
                    this.GSTDetailModel.setData(arrAttachment);
                    this.GSTDetailModel.refresh();
                    this._hideMessageStrip(`msgStrip${oObject.GSTIN}`);
                    sap.ui.core.BusyIndicator.hide();
                }
            },

            /** Attachments */
            /**File size validation -- 400kb */
            onFileSizeExceeded: function (oEvent) {
                sap.m.MessageToast.show(this.oResourceBundle.getText('fileLimitExceed'));
            },

            /**Upload File*/
            handleUploadFile: async function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                this.validfileflag = true;
                const oIndex = oEvent.getSource().getParent().getParent().getIndex();
                const oObject = oEvent.getSource().getBindingContext("attachmentModel").getObject();
                const arrAttachment = this.attachmentModel.getData();
                const selFile = oEvent.getSource().FUEl.files[0] ?? null;
                await this.change(oEvent);

                if ((selFile) && (this.validfileflag)) {
                    var base64 = await this.convertFileToBase64WithType(selFile, selFile ? selFile.type : "");
                    oObject.FILE = base64;
                    oObject.FILENAME = selFile.name;
                    oObject.MIMETYPE = selFile.type;
                    arrAttachment.splice(oIndex, 1, oObject);
                    this.attachmentModel.setData(arrAttachment);
                    this.attachmentModel.refresh();

                    if (oObject.ISMANDATORY) {
                        this._hideMessageStrip(`msgStrip${oObject.DOCUMENTTYPECODE}`);
                    }
                    sap.ui.core.BusyIndicator.hide();
                }
            },

            change: async function (oEvent) {
                return new Promise((resolve, reject) => {
                    // Check if the file is of considered type
                    var _self = this;
                    if ((oEvent.getSource().getId().split("--")[2].slice(0, 19)) == "_IDGenFileUploader1") {
                        var fileUpload = this.byId("_IDGenFileUploader1");
                        var oIndex = oEvent.getSource().getParent().getParent().getIndex();
                        var oObject = oEvent.getSource().getBindingContext("GSTDetailModel").getObject();
                        var arrAttachment = this.GSTDetailModel.getData();
                        var selFile = oEvent.getSource().FUEl.files[0] ?? null;
                    } else {
                        var fileUpload = this.byId("_IDGenFileUploader2");
                        var oIndex = oEvent.getSource().getParent().getParent().getIndex();
                        var oObject = oEvent.getSource().getBindingContext("attachmentModel").getObject();
                        var arrAttachment = this.attachmentModel.getData();
                        var selFile = oEvent.getSource().FUEl.files[0] ?? null;
                    }
                    isImage(selFile, function (isImage) {
                        if (!isImage) {
                            MessageBox.error("Invalid file format. Please upload an image of format: JPEG, JPG, PNG, DOC, PDF");
                            _self.validfileflag = false;
                            // Clear the File Name and File Type fields
                            arrAttachment[oIndex].FILENAME = ""; // Assuming FILENAME is the property binding for the File Name field
                            arrAttachment[oIndex].MIMETYPE = ""; // Assuming MIMETYPE is the property binding for the File Type field

                            // Update the model
                            _self.attachmentModel.setData(arrAttachment);
                            _self.attachmentModel.refresh();
                            sap.ui.core.BusyIndicator.hide();
                            resolve(_self.validfileflag);
                        } else {
                            _self.validfileflag = true;
                            resolve(_self.validfileflag);
                        }
                    });

                    // Function to check if a file is an image based on its content
                    function isImage(file, callback) {
                        const reader = new FileReader();

                        reader.onloadend = function () {
                            // Get the first few bytes of the file (usually enough to determine the file type)
                            const arr = new Uint8Array(reader.result).subarray(0, 4);
                            let header = "";
                            for (let i = 0; i < arr.length; i++) {
                                header += arr[i].toString(16);
                            }

                            // Check if the file matches common image file signatures
                            if (header.startsWith("89504e47") || // PNG
                                header.startsWith("ffd8ffe0") || header.startsWith("25504446") || header.startsWith("504b34") || header.startsWith("d0cf11e0") // JPEG/JPG
                            ) {
                                callback(true);
                            } else {
                                callback(false);
                            }
                        };

                        // Read the file content
                        reader.readAsArrayBuffer(file);
                    }
                });

            },

            convertFileToBase64WithType: async function (file, fileType) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = () => {
                        // Read the file as a data URL and resolve with the result
                        resolve(reader.result);
                    };

                    reader.onerror = (error) => {
                        // Reject with the error if there is a problem reading the file
                        reject(error);
                    };

                    if (fileType && fileType !== "") {
                        // If a specific fileType is provided, set the file type explicitly
                        reader.readAsDataURL(new Blob([file], { type: fileType }));
                    } else {
                        // Otherwise, let the browser determine the file type
                        reader.readAsDataURL(file);
                    }
                });

            },

            /**Convert file to base64*/
            convertFileToBase64WithType: async function (file, fileType) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = () => {
                        // Read the file as a data URL and resolve with the result
                        resolve(reader.result);
                    };

                    reader.onerror = (error) => {
                        // Reject with the error if there is a problem reading the file
                        reject(error);
                    };

                    if (fileType && fileType !== "") {
                        // If a specific fileType is provided, set the file type explicitly
                        reader.readAsDataURL(new Blob([file], { type: fileType }));
                    } else {
                        // Otherwise, let the browser determine the file type
                        reader.readAsDataURL(file);
                    }
                });

            },

            onDownloadGSTINAttachment: function (oEvent) {
                const selObj = oEvent.getSource().getBindingContext("GSTDetailModel").getObject(),
                    GSTIN = selObj.GSTIN,
                    ATTACHMENT = selObj.GSTCERTIFICATE;
                this.openPdfOrImageInNewWindow("GSTIN - Certificate( " + GSTIN + " )", ATTACHMENT);
            },

            onDownloadAttachment: function (oEvent) {
                const selObj = oEvent.getSource().getBindingContext("attachmentModel").getObject(),
                    DOCUMENTNAME = selObj.DOCUMENTNAME,
                    ATTACHMENT = selObj.FILE;
                this.openPdfOrImageInNewWindow("Attachment - " + DOCUMENTNAME, ATTACHMENT);
            },

            onDeleteGSTINAttachment: function (oEvent) {
                const oBinding = oEvent.getSource().getBindingContext("GSTDetailModel");
                const oPath = oBinding.getPath();
                const oIndex = oPath.split('/')[1];
                const oObject = oBinding.getObject();
                const arrGSTIN = this.GSTDetailModel.getData();
                oObject.GSTCERTIFICATE = "";
                arrGSTIN.splice(oIndex, 1, oObject);
                this.GSTDetailModel.setData(arrGSTIN);
                this.GSTDetailModel.refresh();
                sap.ui.core.BusyIndicator.hide();
            },

            openPdfOrImageInNewWindow: function (title, base64Data) {
                if (base64Data) {
                    var typeBase64 = base64Data.split(',')[0];
                    var type = "";

                    if (typeBase64.match(/pdf/i)) {
                        type = "pdf";
                    } else if (typeBase64.match(/jpeg|jpg|png/i)) {
                        type = "image";
                    }

                    if (type === "pdf" || type === "image") {
                        var newWindow = window.open();
                        newWindow.document.title = title;
                        var heading = document.createElement('h5');
                        heading.textContent = title;
                        var iframe = document.createElement('iframe');
                        iframe.src = base64Data;
                        iframe.width = "100%";
                        iframe.height = "100%";
                        newWindow.document.body.appendChild(heading);
                        newWindow.document.body.appendChild(iframe);
                    } else {
                        const link = document.createElement('a');
                        link.href = base64Data;
                        link.download = title;
                        link.click();
                    }
                } else {
                    sap.m.MessageBox.warning(title + " attachment is missing. Please upload an attachment.");
                }
            },
            /**Delete Attachment */
            onDeleteAttachment: function (oEvent) {
                var _self = this;
                MessageBox.confirm("Are you sure you want to delete this attachment?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            const oIndex = oEvent.getParameter("row").getIndex();
                            const oTable = _self.byId("tbl-attachment");
                            const oObject = oTable.getContextByIndex(oIndex).getObject();
                            const arrAttachment = _self.attachmentModel.getData();
                            oObject.FILE = "";
                            oObject.FILENAME = "";
                            oObject.MIMETYPE = "";
                            oObject.VALIDFROM = "";
                            oObject.VALIDTO = "";
                            oObject.ISSUEDON = "";
                            arrAttachment.splice(oIndex, 1, oObject);
                            _self.attachmentModel.setData(arrAttachment);
                            _self.attachmentModel.refresh();
                            sap.ui.core.BusyIndicator.hide();
                        }
                    }
                });
            },
            /** Submit New user registration */
            onPressSubmit: function () {
                if (this.onValidateRegistration() && this.captchaValidate) {
                    sap.ui.core.BusyIndicator.show(0);
                    var companyDetails = this.companyDetailModel.getData();
                    companyDetails.user = this.user;
                    var reqData = {};
                    if (this.userRole === "Admin") {
                        if (this.category == "07") {
                            reqData = {
                                companyDetails: companyDetails,
                                userDetails: this.userDetailModel.getData(),
                                GSTDetails: this.GSTDetailModel.getData(),
                                attachments: this.attachmentModel.getData(),
                                agentCodes: this.IATADetailModel.getData()
                            }

                        } else {
                            reqData = {
                                companyDetails: companyDetails,
                                userDetails: this.userDetailModel.getData(),
                                GSTDetails: this.GSTDetailModel.getData(),
                                attachments: this.attachmentModel.getData(),
                                agentCodes: this.IATADetailModel.getData()
                            }
                        }
                    } else {
                        if (this.category == "08") {
                            var consulateCountry = this.byId("sel-consltCountry").getSelectedKey();
                            reqData = {
                                param2: consulateCountry,
                                userDetails: this.userDetailModel.getData()
                            }
                        } else if (this.category == "07") {
                            var agentIATA = this.byId("inp-AgentiataCode").getValue();
                            reqData = {
                                param2: agentIATA,
                                userDetails: this.userDetailModel.getData()
                            }
                        } else if (this.category == "05") {
                            // agentIATA = this.byId("inp-AgentiataCode").getValue();
                            reqData = {
                                param2: this.userGSTIN,
                                userDetails: this.userDetailModel.getData()
                            }
                        } else {
                            reqData = {
                                companyDetails: { COMPANYPAN: companyDetails.COMPANYPAN },
                                userDetails: this.userDetailModel.getData()
                            }
                        }
                    }
                    this.SendRequest(this, "/portal-api/public/v1/create-user", "POST", { Authorization: "Bearer " + sessionStorage.getItem("regToken") }, JSON.stringify({ ...reqData }), (_self, data, message) => {
                        sap.ui.core.BusyIndicator.hide();
                        _self.companyDetailModel.setData({});
                        _self.TCSDetailModel.setData({});
                        _self.userDetailModel.setData({});
                        _self.GSTDetailModel.setData([]);
                        _self.attachmentModel.setData([]);
                        _self.agentCodeDialogModel.setData([]);
                        _self.IATADetailModel.setData([]);
                        if (!_self.oSuccessMessageDialog) {
                            _self.oSuccessMessageDialog = new sap.m.Dialog({
                                type: "Message",
                                title: "Success",
                                state: "Success",
                                content: new sap.m.Text({ text: message.Text }),
                                beginButton: new sap.m.Button({
                                    type: "Emphasized",
                                    text: "OK",
                                    press: function () {
                                        window.location.replace('/portal/index.html');
                                        this.oSuccessMessageDialog.close();
                                    }.bind(_self)
                                })
                            });
                        }

                        _self.oSuccessMessageDialog.open();
                    });
                }
            },

            onValidateRegistration: function () {
                function validateInput(sId, sValue, errorMessage, validationFunction, validationErrorMessage) {
                    if (!sValue || sValue.trim().length === 0) {
                        sId.setValueState("Error").setValueStateText(errorMessage);
                        return false;
                    } else {
                        if (validationFunction && !validationFunction(sValue)) {
                            sId.setValueState("Error").setValueStateText(validationErrorMessage);
                            return false;
                        }
                        sId.setValueState("None");
                        return true;
                    }
                }

                /** Company Details */
                const companyName = this.byId("inp-companyName");
                const companyPAN = this.byId("inp-companyPAN");
                const companyTAN = this.byId("inp-companyTAN");
                const addressLine = this.byId("inp-address");
                const country = this.byId("sel-country");
                const city = this.byId("inp-city");
                const pinCode = this.byId("inp-pinCode");
                const phone = this.byId("inp-companyPhone");
                const category = this.byId("sel-category");
                const state = this.byId("sel-state");

                /** User Details*/
                const title = this.byId("sel-title");
                const firstName = this.byId("inp-firstName");
                const lastName = this.byId("inp-lastName");
                const loginEmail = this.byId("inp-loginEmail");
                const mobile = this.byId("inp-userMobile");
                const captcha = this.byId("inp-captcha");

                var validate = true;

                if (this.userRole === "Admin") {
                    if ((this.category == "08") || (this.category == "05")) {
                        validate = validateInput(companyName, companyName.getValue(), this.oResourceBundle.getText('companyNameRequired')) && validate;
                        validate = this._handleGSTINValidation(validate);
                        validate = validateInput(state, state.getSelectedKey(), this.oResourceBundle.getText('stateRequired')) && validate;
                        validate = validateInput(addressLine, addressLine.getValue(), this.oResourceBundle.getText('addressRequired')) && validate;
                        validate = validateInput(country, country.getSelectedKey(), this.oResourceBundle.getText('countryRequired')) && validate;
                        validate = validateInput(city, city.getValue(), this.oResourceBundle.getText('cityRequired')) && validate;
                        validate = validateInput(pinCode, pinCode.getDOMValue() ?? pinCode.getValue(), this.oResourceBundle.getText('pinCodeRequired'), validations.validatePincode, this.oResourceBundle.getText('invalidPANFormat')) && validate;
                        validate = validateInput(phone, phone.getDOMValue() ?? phone.getValue(), this.oResourceBundle.getText('mobileRequired'), validations.validatePhone, this.oResourceBundle.getText('invalidMobileFormat')) && validate;


                    } else if ((this.category == "07")) {
                        validate = validateInput(companyName, companyName.getValue(), this.oResourceBundle.getText('companyNameRequired')) && validate;
                        validate = validateInput(addressLine, addressLine.getValue(), this.oResourceBundle.getText('addressRequired')) && validate;
                        validate = validateInput(country, country.getSelectedKey(), this.oResourceBundle.getText('countryRequired')) && validate;
                        validate = validateInput(city, city.getValue(), this.oResourceBundle.getText('cityRequired')) && validate;
                        validate = validateInput(phone, phone.getDOMValue() ?? phone.getValue(), this.oResourceBundle.getText('mobileRequired'), validations.validatePhone, this.oResourceBundle.getText('invalidMobileFormat')) && validate;

                    } else {

                        validate = this._handleAttachmentValidation(validate);
                        validate = this._handleGSTINValidation(validate);
                        /**
                         * ID, sValue, errorMessage, validations,  validation message
                         */
                        validate = validateInput(state, state.getSelectedKey(), this.oResourceBundle.getText('stateRequired')) && validate;
                        validate = validateInput(companyName, companyName.getValue(), this.oResourceBundle.getText('companyNameRequired')) && validate;
                        validate = validateInput(companyTAN, companyTAN.getValue(), this.oResourceBundle.getText('companyTANRequired')) && validate;
                        validate = validateInput(companyPAN, companyPAN.getValue(), this.oResourceBundle.getText('companyPANRequired'), validations.validatePAN, this.oResourceBundle.getText('invalidPANFormat')) && validate;
                        validate = validateInput(addressLine, addressLine.getValue(), this.oResourceBundle.getText('addressRequired')) && validate;
                        validate = validateInput(country, country.getSelectedKey(), this.oResourceBundle.getText('countryRequired')) && validate;
                        validate = validateInput(city, city.getValue(), this.oResourceBundle.getText('cityRequired')) && validate;
                        validate = validateInput(pinCode, pinCode.getDOMValue() ?? pinCode.getValue(), this.oResourceBundle.getText('pinCodeRequired'), validations.validatePincode, this.oResourceBundle.getText('invalidPANFormat')) && validate;
                        validate = validateInput(phone, phone.getDOMValue() ?? phone.getValue(), this.oResourceBundle.getText('mobileRequired'), validations.validatePhone, this.oResourceBundle.getText('invalidMobileFormat')) && validate;
                        validate = validateInput(category, category.getSelectedKey(), this.oResourceBundle.getText('categoryRequired')) && validate;

                        if (category.getSelectedKey() === "01" || category.getSelectedKey() === "02") {
                            const iataCode = this.byId("inp-AgentiataCode");
                            if (iataCode.getValue == "") {
                                iataCode.setValueState("Error").setValueStateText("Agent code is required.");
                                validate = false;
                            } else {
                                iataCode.setValueState("None");
                            }
                            if (this.getView().getModel("IATADetailModel").getData().length == 0) {
                                MessageBox.information("Please give a valid Global/Head Entity IATA Code.")
                                // iataCode.setValueState("Error").setValueStateText("Agent code is required.");
                                validate = false;
                            }
                        }
                    }
                }

                validate = validateInput(title, title.getSelectedKey(), this.oResourceBundle.getText('titleRequired')) && validate;
                validate = validateInput(firstName, firstName.getValue(), this.oResourceBundle.getText('firstNameRequired')) && validate;
                validate = validateInput(lastName, lastName.getValue(), this.oResourceBundle.getText('lastNameRequired')) && validate;
                validate = validateInput(loginEmail, loginEmail.getValue(), this.oResourceBundle.getText('emailRequired'), validations.validateEmail, this.oResourceBundle.getText('invalidEmailFormat')) && validate;
                validate = validateInput(mobile, mobile.getDOMValue() ?? mobile.getValue(), this.oResourceBundle.getText('mobileRequired'), validations.validatePhone, this.oResourceBundle.getText('invalidMobileFormat')) && validate;

                validate = validateInput(captcha, captcha.getValue(), this.oResourceBundle.getText('verificationCodeRequired')) && validate;

                if (!this.captchaValidate) {
                    this.byId("inp-captcha").setValueState("Error").setValueStateText("CAPTCHA does not match. Please try again");
                }
                if (!validate) {
                    return false;
                } else {
                    return true;
                }
            },

            _handleGSTINValidation: function (validate) {
                const GSTINList = this.GSTDetailModel.getData();
                if (GSTINList.length === 0) {
                    this._showMessageStrip('oVerticalContentGSTIN', `msgStripGSTDetails`, this.oResourceBundle.getText('GSTINRequired'), 'E');
                    validate = false;
                } else {
                    this._hideMessageStrip(`msgStripGSTDetails`);
                    const selGSTINs = this.byId("idGSTDetailsTable").getSelectedIndices();
                    const selectedGSTINsList = selGSTINs.map(index => GSTINList[index]);
                    // if (selGSTINs.length === 0) {
                    //     this._showMessageStrip('oVerticalContentGSTIN', 'msgStripSelectGSTIN', this.oResourceBundle.getText('selectGSTINValidation'), 'E');
                    // } else {
                    //     this._hideMessageStrip(`msgStripSelectGSTIN`);
                    // }

                    if (!GSTINList.some(doc => doc.DEFAULT)) {
                        if ((this.category == "08") || (this.category == "05")) {
                            this._showMessageStrip('oVerticalContentGSTIN', 'msgStripGSTDetails', this.oResourceBundle.getText('defaultUINRequired'), 'E');
                        } else {
                            this._showMessageStrip('oVerticalContentGSTIN', 'msgStripGSTDetails', this.oResourceBundle.getText('defaultGSTINRequired'), 'E');
                        }
                        validate = false;
                    } else {
                        this._hideMessageStrip(`msgStripGSTDetails`);
                    }
                }
                return validate;
            },

            _handleAttachmentValidation: function (validate) {
                const attachmentTableData = this.attachmentModel.getData();
                for (let i = 0; i < attachmentTableData.length; i++) {
                    const doc = attachmentTableData[i];
                    const currentDate = new Date();
                    if (doc.ISMANDATORY === true && doc.FILE === "") {
                        let msgText = this.oResourceBundle.getText('msgUploadMandatoryDoc').replace('%s', `${doc.DOCUMENTTYPECODE} - ${doc.DOCUMENTNAME}`);
                        this._showMessageStrip('oVerticalContent', `msgStrip${doc.DOCUMENTTYPECODE}`, msgText, 'E');
                        validate = false;
                    } else {
                        this._hideMessageStrip(`msgStrip${doc.DOCUMENTTYPECODE}`);
                    }

                    if (doc.ISSUEDON) {
                        if (!validations.validateDate(doc.ISSUEDON)) {
                            let msgText = this.oResourceBundle.getText('msgInvalidDateFormat').replace('%s', `${doc.DOCUMENTTYPECODE} - ${doc.DOCUMENTNAME}`);
                            this._showMessageStrip('oVerticalContent', `msgStripDate${doc.DOCUMENTTYPECODE}`, msgText, 'E');
                            validate = false;
                        } else {
                            var issueDate = new Date(doc.ISSUEDON);

                            if (issueDate > currentDate) {
                                validate = false;
                                let msgText = this.oResourceBundle.getText('msgIsuueDateValidation').replace('%s', `${doc.DOCUMENTTYPECODE} - ${doc.DOCUMENTNAME}`);
                                this._showMessageStrip('oVerticalContent', `msgStroIssuedOn${doc.DOCUMENTTYPECODE}`, msgText, 'E');
                            } else {
                                this._hideMessageStrip(`msgStroIssuedOn${doc.DOCUMENTTYPECODE}`);
                            }
                        }
                    }

                    if (doc.VALIDFROM && !validations.validateDate(doc.VALIDFROM)) {
                        let msgText = this.oResourceBundle.getText('msgInvalidDateFormat').replace('%s', `${doc.DOCUMENTTYPECODE} - ${doc.DOCUMENTNAME}`);
                        this._showMessageStrip('oVerticalContent', `msgStripDate${doc.DOCUMENTTYPECODE}`, msgText, 'E');
                        validate = false;
                    } else {
                        this._hideMessageStrip(`msgStripDate${doc.DOCUMENTTYPECODE}`);
                    }

                    if (doc.VALIDTO && !validations.validateDate(doc.VALIDTO)) {
                        let msgText = this.oResourceBundle.getText('msgInvalidDateFormat').replace('%s', `${doc.DOCUMENTTYPECODE} - ${doc.DOCUMENTNAME}`);
                        this._showMessageStrip('oVerticalContent', `msgStripDate${doc.DOCUMENTTYPECODE}`, msgText, 'E');
                        validate = false;
                    } else {
                        this._hideMessageStrip(`msgStripDate${doc.DOCUMENTTYPECODE}`);
                    }

                    if (doc.VALIDTO && doc.VALIDFROM) {
                        var validFromDate = new Date(doc.VALIDFROM);
                        var validToDate = new Date(doc.VALIDTO);

                        if (validFromDate < validToDate) {
                        } else if (validFromDate > validToDate) {
                            validate = false;
                            let msgText = this.oResourceBundle.getText('msgValidFromToDate').replace('%s', `${doc.DOCUMENTTYPECODE} - ${doc.DOCUMENTNAME}`);
                            this._showMessageStrip('oVerticalContent', `msgStripDate${doc.DOCUMENTTYPECODE}`, msgText, 'E');
                        } else {
                            validate = false;
                            let msgText = this.oResourceBundle.getText('msgValidFromToDateSame').replace('%s', `${doc.DOCUMENTTYPECODE} - ${doc.DOCUMENTNAME}`);
                            this._showMessageStrip('oVerticalContent', `msgStripDate${doc.DOCUMENTTYPECODE}`, msgText, 'E');
                        }
                    }
                }
                return validate;
            },
            onLiveValidateForSelect: function (oEvent) {
                const sValue = oEvent.getParameter("selectedItem").getKey(),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },

            _showMessageStrip: function (oVCId, msgStripId, msgStripText, msgType) {
                let oVC = this.byId(oVCId) ?? sap.ui.getCore().byId(oVCId);
                let messageType;
                switch (msgType) {
                    case 'E':
                        messageType = "Error";
                        break;
                    case 'W':
                        messageType = "Warning";
                        break;
                    case 'I':
                    default:
                        messageType = "Information";
                        break;
                }
                let oMsgStrip = sap.ui.getCore().byId(`${msgStripId}`);
                if (oMsgStrip) {
                    oMsgStrip.destroy();
                }
                oMsgStrip = new MessageStrip(`${msgStripId}`, {
                    text: `${msgStripText}`,
                    showCloseButton: true,
                    showIcon: true,
                    type: `${messageType}`
                });
                oVC.addContent(oMsgStrip);
            },

            _hideMessageStrip: function (msgStripId) {
                let oMsgStrip = sap.ui.getCore().byId(`${msgStripId}`);
                if (oMsgStrip) {
                    oMsgStrip.destroy();
                }
            },

            handleDateChange: function (oEvent) {
                var oDP = oEvent.getSource(),
                    bValid = oEvent.getParameter("valid");
                if (bValid) {
                    oDP.setValueState("None");
                } else {
                    oDP.setValueState("Error");
                }
            },

            onAddIataCodes: function (oEvent) {
                this.oAgentCodeDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.agentCodeDialog", this);
                this.getView().addDependent(this.oAgentCodeDialog);
                this.oAgentCodeDialog.open();
            },

            onAddNewIATACode: function () {
                const toAgentCodes = this.getView().getModel("agentCodeDialogModel").getProperty('/');
                let isValidated = true;
                if (toAgentCodes.length > 0) {
                    isValidated = toAgentCodes.every(element => element.IATACODE)
                }
                if (isValidated) {
                    if (!toAgentCodes) {
                        this.getView().getModel("agentCodeDialogModel").setProperty('/', [{
                            IATACODE: ""
                        }]);
                    } else {
                        this.getView().getModel("agentCodeDialogModel").getProperty('/').push({
                            IATACODE: ""
                        });
                    }
                    let count = this.getView().getModel("agentCodeDialogModel").getProperty('/').length;
                    sap.ui.getCore().byId("tbl-agentCode").setVisibleRowCount(count);
                    sap.ui.getCore().byId("lbl-agentCodeDialog").setText(`IATA Code (${count})`);
                    this.getView().getModel("agentCodeDialogModel").refresh();
                } else {
                    MessageToast.show("Please fill in the Agent Code and add another");
                }
            },

            onDeleteIATACode: function (oEvent) {
                var row = oEvent.getSource();
                var idx = oEvent.getSource().getBindingContext("agentCodeDialogModel").getPath()
                idx = idx.split("/")[1];
                if (idx !== -1) {
                    var model = this.getView().getModel("agentCodeDialogModel");
                    var data = model.getData();
                    data.splice(idx, 1);
                    model.setData(data);
                }
                let count = this.getView().getModel("agentCodeDialogModel").getProperty('/').length;
                sap.ui.getCore().byId("tbl-agentCode").setVisibleRowCount(count);
                sap.ui.getCore().byId("lbl-agentCodeDialog").setText(`IATA Code (${count})`);
            },

            onCloseAgentCodeDialog: function (oEvent) {
                const toAgentCodes = this.getView().getModel("agentCodeDialogModel").getProperty('/');
                let isValidated = true;
                if (toAgentCodes.length > 0) {
                    isValidated = toAgentCodes.every(element => element.IATACODE);
                    var valueArr = toAgentCodes.map(function (item) { return item.IATACODE });
                    var isDuplicate = valueArr.some(function (item, idx) {
                        return valueArr.indexOf(item) != idx
                    });
                    if (isValidated) {
                        if (!isDuplicate) {
                            const iataCode = this.byId("inp-AgentiataCode");
                            if (iataCode.getValue() != "") {
                                iataCode.setValueState("None");
                            }
                            this.oAgentCodeDialog.destroy();
                        } else {
                            MessageToast.show("Duplicate Agent Code Found");
                        }
                    } else {
                        MessageToast.show("Please fill in the Agent Code");
                    }
                } else {
                    this.oAgentCodeDialog.destroy();
                }

                /** Make MultiInput as Non editable */
                const sId = this.byId("inp-iataCode");
                //  sId.getAggregation("tokenizer").setEditable(false)
                sId.setEditable(false);
            },

            onpresshintcompany: function (oEvent) {
                var _self = this;
                if (this.oRouter.oHashChanger.hash == "Registration") {
                    var oPopover = new sap.m.Popover({
                        showHeader: false,
                        placement: PlacementType.Bottom,
                        content: [
                            new sap.m.Text({
                                text: "Select Category \n Choose the appropriate category from the dropdown menu. Options include Agent or Corporate/Company.\n\n Fill Mandatory Fields \n Fill in all the required information in the designated fields. Mandatory fields typically include\n Company Name: Enter the full legal name of the company.\n Address: Provide the physical address of the company, including street, city, state, and pin code. \n Contact Information: Include phone number, email address, and any other relevant contact details.\n\n Review and Submit \n Before submitting the form, review all the entered information for accuracy and completeness.\n Make any necessary corrections or updates. \n Once satisfied, click the Submit or Save button to finalize the company details.",
                            }),
                        ]
                    }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                    oPopover.openBy(oEvent.getSource());
                    //this.getView().addContent(oEvent.getSource());
                }
            },
            onpresshintgstdetails: function (oEvent) {
                var _self = this;
                if (this.oRouter.oHashChanger.hash == "Registration") {
                    var oPopover = new sap.m.Popover({
                        showHeader: false,
                        placement: PlacementType.Bottom,
                        content: [
                            new sap.m.Text({
                                text: "View GSTIN Details \n\n Upon accessing the GSTIN section, the user will be presented with a list of GSTIN details associated with the provided PAN (Permanent Account Number).\n Each GSTIN entry will display relevant information such as \n GSTIN Number: Unique Goods and Services Tax Identification Number.\n Legal Name: Full legal name of the entity registered under the GSTIN. \n Address: Corresponding address registered with the GSTIN. \n Status: Current status of the GSTIN registration (active, inactive, pending, etc.). \n Registration Date: Date of registration for the respective GSTIN.\n\n Select Default GSTIN \n The user can select a default GSTIN from the list for convenience in future transactions. \n To set a default GSTIN, the user can: \n Click on the Set Default or similar option adjacent to the desired GSTIN entry. \n A confirmation prompt may appear to confirm the selection \n Once confirmed, the selected GSTIN will be designated as the default for subsequent transactions.",
                            }),
                        ]
                    }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                    oPopover.openBy(oEvent.getSource());
                }
            },
            onpresshintiatadetails: function (oEvent) {
                var _self = this;
                if (this.oRouter.oHashChanger.hash == "Registration") {
                    var oPopover = new sap.m.Popover({
                        showHeader: false,
                        placement: PlacementType.Bottom,
                        content: [
                            new sap.m.Text({
                                text: "Upon accessing the IATA Details section, users will be presented with information related to their International Air Transport Association (IATA) accreditation or membership.\n\n Key information provided may include: \n IATA Number: The unique identification number assigned by the International Air Transport Association. \n Legal Name: Full legal name of the entity associated with the IATA accreditation or membership.\n Address: Corresponding business address registered with IATA.",
                            }),
                        ]
                    }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                    oPopover.openBy(oEvent.getSource());
                }
            },
            onpresshintattachments: function (oEvent) {
                var _self = this;
                if (this.oRouter.oHashChanger.hash == "Registration") {
                    var oPopover = new sap.m.Popover({
                        showHeader: false,
                        placement: PlacementType.Bottom,
                        content: [
                            new sap.m.Text({
                                text: "Ensure that the documents to be attached are in the supported formats specified by the platform \n Commonly supported formats include JPG,JPEG,PNG,DOCX,PDF.\n\n Checking Document Size Limits \n Verify the maximum allowable size for individual documents as specified by the platform.\n Ensure that the size of each document does not exceed the specified limit.\n\n Selecting Documents for Attachment.\n Click on the Attach or similar button to initiate the document selection process.\n Navigate to the location of the desired document(s) on your device.",
                            }),
                        ]
                    }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                    oPopover.openBy(oEvent.getSource());
                }
            },
            onpresshintuserinfo: function (oEvent) {
                var _self = this;
                if (this.oRouter.oHashChanger.hash == "Registration") {
                    var oPopover = new sap.m.Popover({
                        showHeader: false,
                        placement: PlacementType.Bottom,
                        content: [
                            new sap.m.Text({
                                text: "The user should be able to enter all the relevant Personal Information. All the field-level validations should be there for the user.\n\n Check Captcha before Submit \n Enter the Captcha showing on the screen.\n System should validate the Captcha and be ready for submission.",
                            }),
                        ]
                    }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                    oPopover.openBy(oEvent.getSource());
                }
            },

        });
    }
);
