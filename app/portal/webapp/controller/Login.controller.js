sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "airindiagst/model/validations",
        "sap/m/MessageBox"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, validations, MessageBox) {
        "use strict";

        return Controller.extend("airindiagst.controller.Login", {
            validations: validations,
            onInit: function () {
                //i18n Resource Bundle 
                this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                //AJAX send Request
                this.SendRequest = this.getOwnerComponent().SendRequest;
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.attachRoutePatternMatched(this._handleRouteMatched, this);
            },

            _handleRouteMatched: function (oEvent) {
                if (oEvent.getParameters().name === "RouteLogin") {
                    this._refreshPage();
                    this.getOwnerComponent().getModel("shellModel").setProperty("/show", false);
                    this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", true);
                    this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", "");
                    this.masterDataModel = new JSONModel();
                    this.masterDataModel.setSizeLimit(500);
                    this.getView().setModel(this.masterDataModel, "masterDataModel");
                    this.iataDataModel = new JSONModel();
                    this.iataDataModel.setSizeLimit(2000);
                    this.getView().setModel(this.iataDataModel, "iataDataModel");
                    const isRegEnabled = JSON.parse(sessionStorage.getItem("toggling"));
                    this.byId("inp-loginEmail").setValueState("None");
                    this.byId("inp-loginPass").setValueState("None");
                    this.byId("inp-verifyOtp").setValueState("None");
                    this.byId("inp-pan").setValueState("None");
                    this.byId("inp-newEmail").setValueState("None");
                    this.byId("inp-regVerifyOtp").setValueState("None");
                    this.byId("inp-newPass").setValueState("None");
                    this.byId("inp-confirmPass").setValueState("None");
                    this.byId("inp-newPass").setValueState("None");
                    this.byId("sel-logcountry").setValueState("None");
                    this.byId("inp-consulateEmail").setValueState("None");
                    this.byId("sel-unBodies").setValueState("None");
                    this.byId("inp-consulateEmail").setValueState("None");
                    this.byId("inp-unBodiesEmail").setValueState("None");
                    this.byId("sel-Agentcountry").setValueState("None");
                    this.byId("sel-AgentIata").setValueState("None");
                    this.byId("inp-overSeasAgentEmail").setValueState("None");

                    if (isRegEnabled && isRegEnabled.isRegEnabled) {
                        this.byId("sf-login").setVisible(false);
                        this.byId("sf-setPassword").setVisible(false);
                        this.byId("sf-otpLogin").setVisible(false);
                        this.byId("sf-NewUserRegister").setVisible(false);
                        this.byId("sf-ConsulateUser").setVisible(false);
                        this.byId("sf-unBodies").setVisible(false);
                        this.byId("sf-overseasAgentUser").setVisible(false);
                        this.byId("sf-NewUserType").setVisible(true);
                    }
                } else {
                    this.byId("sf-login").setVisible(true);
                    this.byId("sf-setPassword").setVisible(false);
                    this.byId("sf-otpLogin").setVisible(false);
                    this.byId("sf-NewUserRegister").setVisible(false);
                    this.byId("sf-ConsulateUser").setVisible(false);
                    this.byId("sf-unBodies").setVisible(false);
                    this.byId("sf-overseasAgentUser").setVisible(false);
                    this.byId("sf-NewUserType").setVisible(false);
                    this.byId("sf-newRegOTP").setVisible(false);
                }
            },
            fetchMasterData: async function (category) {
                //var categoryval = category.toString();
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/portal-api/public/v1/get-category-details?Category=" + category, "GET", {}, null, (_self, data, message) => {
                    _self.getView().getModel("masterDataModel").setData(data.data);
                    sap.ui.core.BusyIndicator.hide();
                });
            },

            onValidateMandatory: function (oEvent) {
                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },
            onValidateMandatoryPAN: function (oEvent) {
                var _oInput = oEvent.getSource();
                //   var fileuplod = this.getView().byId("inp-city");
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
            onValidateTicketNum: function(oEvent) {
                var _oInput = oEvent.getSource();
                var val = _oInput.getValue();
                var newVal = val.replace(/[^0-9]/g, ''); // Replace any character that is not a number with an empty string
                _oInput.setValue(newVal);
                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },
            onLiveValidateForInput: function (oEvent) {
                var _oInput = oEvent.getSource();
                var val = _oInput.getValue();
                var specialCharachters = /[!#$&₹%^;`~*'()?":{}|<>=,\[\]\/\\]/;
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
            onNewUserRegisterNowLinkPress: function (oEvent) {
                this.byId("signin").setText("Sign Up");

                this.byId("inp-loginEmail").setValueState("None");
                this.byId("inp-loginPass").setValueState("None");
                this.byId("inp-verifyOtp").setValueState("None");
                this.byId("inp-pan").setValueState("None");
                this.byId("inp-newEmail").setValueState("None");

                this.byId("inp-regVerifyOtp").setValueState("None");
                this.byId("inp-newPass").setValueState("None");
                this.byId("inp-confirmPass").setValueState("None");
                this.byId("inp-newPass").setValueState("None");
                this.byId("sel-logcountry").setValueState("None");
                this.byId("inp-consulateEmail").setValueState("None");
                this.byId("sel-unBodies").setValueState("None");
                this.byId("inp-consulateEmail").setValueState("None");
                this.byId("inp-unBodiesEmail").setValueState("None");
                this.byId("sel-Agentcountry").setValueState("None");
                this.byId("sel-AgentIata").setValueState("None");
                this.byId("inp-overSeasAgentEmail").setValueState("None");
                this.byId("sf-login").setVisible(false);
                this.byId("sf-otpLogin").setVisible(false);
                this.byId("sf-setPassword").setVisible(false);
                this.byId("sf-ConsulateUser").setVisible(false);
                this.byId("sf-unBodies").setVisible(false);
                this.byId("sf-overseasAgentUser").setVisible(false);
                this.byId("sf-NewUserRegister").setVisible(false);
                this.byId("sf-NewUserType").setVisible(true);
                this._refreshPage();
                sessionStorage.setItem("toggling", JSON.stringify({ isRegEnabled: true }));
            },
            onclickOthers: function (oEvent) {
                this.byId("sf-login").setVisible(false);
                this.byId("sf-newRegOTP").setVisible(false);
                this.byId("sf-otpLogin").setVisible(false);
                this.byId("sf-setPassword").setVisible(false);
                this.byId("sf-ConsulateUser").setVisible(false);
                this.byId("sf-unBodies").setVisible(false);
                this.byId("sf-overseasAgentUser").setVisible(false);
                this.byId("sf-NewUserRegister").setVisible(true);
                this.byId("sf-NewUserType").setVisible(false);
                this._refreshPage();
                sessionStorage.setItem("toggling", JSON.stringify({ isRegEnabled: true }));
            },
            onclickConsulates: function (oEvent) {
                var category = "08";
                this.fetchMasterData(category);
                this.byId("sf-login").setVisible(false);
                this.byId("sf-otpLogin").setVisible(false);
                this.byId("sf-setPassword").setVisible(false);
                this.byId("sf-NewUserRegister").setVisible(false);
                this.byId("sf-NewUserType").setVisible(false);
                this.byId("sf-unBodies").setVisible(false);
                this.byId("sf-overseasAgentUser").setVisible(false);
                this.byId("sf-ConsulateUser").setVisible(true);
                this._refreshPage();
                sessionStorage.setItem("toggling", JSON.stringify({ isRegEnabled: true }));
            },
            onclickUnbodies: function (oEvent) {
                var category = "05";
                this.fetchMasterData(category);
                this.byId("sf-login").setVisible(false);
                this.byId("sf-otpLogin").setVisible(false);
                this.byId("sf-setPassword").setVisible(false);
                this.byId("sf-NewUserRegister").setVisible(false);
                this.byId("sf-NewUserType").setVisible(false);
                this.byId("sf-ConsulateUser").setVisible(false);
                this.byId("sf-overseasAgentUser").setVisible(false);
                this.byId("sf-unBodies").setVisible(true);
                this._refreshPage();
                sessionStorage.setItem("toggling", JSON.stringify({ isRegEnabled: true }));
            },
            onclickOverseasAgents: function (oEvent) {
                var category = "07";
                this.fetchMasterData(category);
                this.byId("sf-login").setVisible(false);
                this.byId("sf-otpLogin").setVisible(false);
                this.byId("sf-setPassword").setVisible(false);
                this.byId("sf-NewUserRegister").setVisible(false);
                this.byId("sf-NewUserType").setVisible(false);
                this.byId("sf-unBodies").setVisible(false);
                this.byId("sf-ConsulateUser").setVisible(false);
                this.byId("sf-overseasAgentUser").setVisible(true);
                this._refreshPage();
                sessionStorage.setItem("toggling", JSON.stringify({ isRegEnabled: true }));
            },
            onConsulateContinuePress: function () {
                var inpcountry = this.byId("sel-logcountry").getSelectedKey();
                var inpEmail = this.byId("inp-consulateEmail").getValue();
                inpEmail = inpEmail.toLowerCase();
                var category = "08";
                var validate = true;
                if (!inpcountry) {
                    this.handleInputError("sel-logcountry", "countryRequired");
                    validate = false;
                }

                if (!inpEmail) {
                    this.handleInputError("inp-consulateEmail", "emailRequired");
                    validate = false;
                } else if (!validations.validateEmail(inpEmail)) {
                    this.handleInputError("inp-consulateEmail", "invalidEmailFormat");
                    validate = false;
                }

                if (validate) {
                    sap.ui.core.BusyIndicator.show();
                    //inpPan = inpPan.toUpperCase();
                    const url = `/portal-api/public/v1/v2/check-user-role?param1=${inpcountry}&param2=${inpEmail}&category=${category}`;
                    this.SendRequest(this, url, "GET", {}, null, (_self, data, message) => {
                        if (data.userExists) {
                            sap.m.MessageBox.information("This email id has already been registered");
                            sap.ui.core.BusyIndicator.hide();
                        } else {
                            this.email = inpEmail;
                            sessionStorage.setItem("regToken", data.token);
                            const userRole = data.userRole;
                            if (userRole === "User") {
                                sap.ui.core.BusyIndicator.hide();
                                this.showUserRoleConfirmationDialog(category);
                            } else {
                                this.SendRequest(this, "/portal-api/public/v1/verify-email", "GET", { Authorization: "Bearer " + sessionStorage.getItem("regToken") }, null, (_self, data, message) => {
                                    sessionStorage.setItem("regToken", data.token);
                                    _self.byId("txt-regLoginEmail").setText(_self.email);
                                    _self.byId("sf-login").setVisible(false);
                                    _self.byId("sf-otpLogin").setVisible(false);
                                    _self.byId("sf-setPassword").setVisible(false);

                                    _self.byId("sf-NewUserRegister").setVisible(false);
                                    _self.byId("sf-ConsulateUser").setVisible(false);
                                    _self.byId("sf-unBodies").setVisible(false);
                                    _self.byId("sf-overseasAgentUser").setVisible(false);
                                    _self.byId("sf-NewUserType").setVisible(false);
                                    _self.byId("sf-newRegOTP").setVisible(true);
                                    _self._handleRegOtp();
                                    sap.ui.core.BusyIndicator.hide();
                                });
                            }
                        }
                    });
                }
            },
            onunBodiesContinuePress: function () {
                var inpunbody = this.byId("sel-unBodies").getSelectedKey().toString();
                var inpEmail = this.byId("inp-unBodiesEmail").getValue();
                inpEmail = inpEmail.toLowerCase();
                var category = "05";
                var validate = true;
                if (!inpunbody) {
                    this.handleInputError("sel-unBodies", "unbodyRequired");
                    validate = false;
                }

                if (!inpEmail) {
                    this.handleInputError("inp-unBodiesEmail", "emailRequired");
                    validate = false;
                } else if (!validations.validateEmail(inpEmail)) {
                    this.handleInputError("inp-unBodiesEmail", "invalidEmailFormat");
                    validate = false;
                }

                if (validate) {
                    sap.ui.core.BusyIndicator.show();
                    //inpPan = inpPan.toUpperCase();
                    const url = `/portal-api/public/v1/v2/check-user-role?param1=${inpunbody}&param2=${inpEmail}&category=${category}`;
                    this.SendRequest(this, url, "GET", {}, null, (_self, data, message) => {
                        if (data.userExists) {
                            sap.m.MessageBox.information("This email id has already been registered");
                            sap.ui.core.BusyIndicator.hide();
                        } else {
                            this.email = inpEmail;
                            sessionStorage.setItem("regToken", data.token);
                            const userRole = data.userRole;
                            if (userRole === "User") {
                                sap.ui.core.BusyIndicator.hide();
                                this.showUserRoleConfirmationDialog(category);
                            } else {
                                this.SendRequest(this, "/portal-api/public/v1/verify-email", "GET", { Authorization: "Bearer " + sessionStorage.getItem("regToken") }, null, (_self, data, message) => {
                                    sessionStorage.setItem("regToken", data.token);
                                    _self.byId("txt-regLoginEmail").setText(_self.email);
                                    _self.byId("sf-login").setVisible(false);
                                    _self.byId("sf-otpLogin").setVisible(false);
                                    _self.byId("sf-setPassword").setVisible(false);

                                    _self.byId("sf-NewUserRegister").setVisible(false);
                                    _self.byId("sf-ConsulateUser").setVisible(false);
                                    _self.byId("sf-unBodies").setVisible(false);
                                    _self.byId("sf-overseasAgentUser").setVisible(false);
                                    _self.byId("sf-NewUserType").setVisible(false);
                                    _self.byId("sf-newRegOTP").setVisible(true);
                                    _self._handleRegOtp();
                                    sap.ui.core.BusyIndicator.hide();
                                });
                            }
                        }
                    });
                }
            },
            onoverSeasAgentContinuePress: function () {
                var AgentCountry = this.byId("sel-Agentcountry").getSelectedKey();
                var inpIATAcode = this.byId("sel-AgentIata").getValue();
                var inpEmail = this.byId("inp-overSeasAgentEmail").getValue();
                inpEmail = inpEmail.toLowerCase();
                var category = "07";
                var validate = true;
                if (!inpIATAcode) {
                    this.handleInputError("sel-AgentIata", "iataRequired");
                    validate = false;
                }
                if (!AgentCountry) {
                    this.handleInputError("sel-Agentcountry", "countryRequired");
                    validate = false;
                }
                if (!inpEmail) {
                    this.handleInputError("inp-overSeasAgentEmail", "emailRequired");
                    validate = false;
                } else if (!validations.validateEmail(inpEmail)) {
                    this.handleInputError("inp-overSeasAgentEmail", "invalidEmailFormat");
                    validate = false;
                }

                if (validate) {
                    sap.ui.core.BusyIndicator.show();
                    //inpPan = inpPan.toUpperCase();c
                    const url = `/portal-api/public/v1/v2/check-user-role?param1=${inpIATAcode}&param2=${inpEmail}&param3=${AgentCountry}&category=${category}`;
                    this.SendRequest(this, url, "GET", {}, null, (_self, data, message) => {
                        if (data.userExists) {
                            sap.m.MessageBox.information("This email id has already been registered");
                            sap.ui.core.BusyIndicator.hide();
                        } else {
                            this.email = inpEmail;
                            sessionStorage.setItem("regToken", data.token);
                            const userRole = data.userRole;
                            if (userRole === "User") {
                                sap.ui.core.BusyIndicator.hide();
                                this.showUserRoleConfirmationDialog(category);
                            } else {
                                this.SendRequest(this, "/portal-api/public/v1/verify-email", "GET", { Authorization: "Bearer " + sessionStorage.getItem("regToken") }, null, (_self, data, message) => {
                                    sessionStorage.setItem("regToken", data.token);
                                    _self.byId("txt-regLoginEmail").setText(_self.email);
                                    _self.byId("sf-login").setVisible(false);
                                    _self.byId("sf-otpLogin").setVisible(false);
                                    _self.byId("sf-setPassword").setVisible(false);

                                    _self.byId("sf-NewUserRegister").setVisible(false);
                                    _self.byId("sf-ConsulateUser").setVisible(false);
                                    _self.byId("sf-unBodies").setVisible(false);
                                    _self.byId("sf-overseasAgentUser").setVisible(false);
                                    _self.byId("sf-NewUserType").setVisible(false);
                                    _self.byId("sf-newRegOTP").setVisible(true);
                                    _self._handleRegOtp();
                                    sap.ui.core.BusyIndicator.hide();
                                });
                            }
                        }
                    });
                }
            },
            onSelectedAgentCountry: function () {
                this.byId("sel-AgentIata").setEditable(true);
                // this.byId("sel-AgentIata").setSelectedKey("");
                sap.ui.core.BusyIndicator.show();
                var AgentCountry = this.byId("sel-Agentcountry").getSelectedKey();
                const url = `/portal-api/public/v1/get-country-iata?Country=${AgentCountry}`;
                this.SendRequest(this, url, "GET", {}, null, (_self, data, message) => {
                    if (data) {
                        _self.getView().getModel("iataDataModel").setData(data.data);
                        sap.ui.core.BusyIndicator.hide();
                    }
                });

            },
            onRegisteredButtonPress: function () {
                this.byId("signin").setText("Sign In");
                this.byId("sf-login").setVisible(true);
                this.byId("sf-setPassword").setVisible(false);

                this.byId("sf-otpLogin").setVisible(false);
                this.byId("sf-NewUserRegister").setVisible(false);
                this.byId("sf-NewUserType").setVisible(false);
                this.byId("sf-ConsulateUser").setVisible(false);
                this.byId("sf-unBodies").setVisible(false);
                this.byId("sf-newRegOTP").setVisible(false);
                this.byId("sf-overseasAgentUser").setVisible(false);

                this._refreshPage();
                sessionStorage.setItem("toggling", JSON.stringify({ isRegEnabled: false }));
            },

            onContinuePress: function () {
                var inpPan = this.byId("inp-pan").getValue();
                var inpEmail = this.byId("inp-newEmail").getValue();
                inpEmail = inpEmail.toLowerCase();
                var category = "01";
                var validate = true;
                if (!inpPan) {
                    this.handleInputError("inp-pan", "PANRequired");
                    validate = false;
                } else if (!validations.validatePAN(inpPan)) {
                    this.handleInputError("inp-pan", "invalidPANFormat");
                    validate = false;
                }

                if (!inpEmail) {
                    this.handleInputError("inp-newEmail", "emailRequired");
                    validate = false;
                } else if (!validations.validateEmail(inpEmail)) {
                    this.handleInputError("inp-newEmail", "invalidEmailFormat");
                    validate = false;
                }

                if (validate) {
                    sap.ui.core.BusyIndicator.show();
                    inpPan = inpPan.toUpperCase();
                    const url = `/portal-api/public/v1/check-user-role?PAN=${inpPan}&Email=${inpEmail}`;
                    this.SendRequest(this, url, "GET", {}, null, (_self, data, message) => {
                        if (data.userExists) {
                            sap.m.MessageBox.information("This email id has already been registered");
                            sap.ui.core.BusyIndicator.hide();
                        } else {
                            this.email = inpEmail;
                            sessionStorage.setItem("regToken", data.token);
                            const userRole = data.userRole;
                            if (userRole === "User") {
                                sap.ui.core.BusyIndicator.hide();
                                this.showUserRoleConfirmationDialog(category);
                            } else {
                                this.SendRequest(this, "/portal-api/public/v1/verify-email", "GET", { Authorization: "Bearer " + sessionStorage.getItem("regToken") }, null, (_self, data, message) => {
                                    sessionStorage.setItem("regToken", data.token);
                                    _self.byId("txt-regLoginEmail").setText(_self.email);
                                    _self.byId("sf-login").setVisible(false);
                                    _self.byId("sf-otpLogin").setVisible(false);
                                    _self.byId("sf-setPassword").setVisible(false);
                                    _self.byId("sf-NewUserRegister").setVisible(false);
                                    _self.byId("sf-ConsulateUser").setVisible(false);
                                    _self.byId("sf-unBodies").setVisible(false);
                                    _self.byId("sf-overseasAgentUser").setVisible(false);
                                    _self.byId("sf-NewUserType").setVisible(false);
                                    _self.byId("sf-newRegOTP").setVisible(true);
                                    _self._handleRegOtp();
                                    sap.ui.core.BusyIndicator.hide();
                                });
                            }
                        }
                    });
                }
            },

            handleInputError: function (inputId, errorMessageKey) {
                const inputField = this.byId(inputId);
                inputField.setValueState("Error").setValueStateText(this.oResourceBundle.getText(errorMessageKey));
            },

            showUserRoleConfirmationDialog: function (category) {
                if (category == "08") {
                    var mesageval = "Consulate is already registered.\n Do you want to register as a sub-user ?";
                } else if (category == "07") {
                    var mesageval = "Overseas agent is already registered.\n Do you want to register as a sub-user ?";
                } else if (category == "05") {
                    var mesageval = "UN Body is already registered.\n Do you want to register as a sub-user ?";
                } else {
                    var mesageval = "Company is already registered.\n Do you want to register as a sub-user ?";
                }
                sap.m.MessageBox.warning(mesageval, {
                    actions: ["Yes", MessageBox.Action.NO],
                    emphasizedAction: "Yes",
                    onClose: function (oAction) {
                        if (oAction === "Yes") {
                            this.SendRequest(this, "/portal-api/public/v1/verify-email", "GET", { Authorization: "Bearer " + sessionStorage.getItem("regToken") }, null, (_self, data, message) => {
                                sessionStorage.setItem("regToken", data.token);
                                _self.byId("txt-regLoginEmail").setText(_self.email);
                                _self.byId("sf-login").setVisible(false);
                                _self.byId("sf-setPassword").setVisible(false);

                                _self.byId("sf-otpLogin").setVisible(false);
                                _self.byId("sf-NewUserRegister").setVisible(false);
                                _self.byId("sf-ConsulateUser").setVisible(false);
                                _self.byId("sf-unBodies").setVisible(false);
                                _self.byId("sf-overseasAgentUser").setVisible(false);
                                _self.byId("sf-NewUserType").setVisible(false);
                                _self.byId("sf-newRegOTP").setVisible(true);
                                _self._handleRegOtp();
                                sap.ui.core.BusyIndicator.hide();
                            });
                        } else {
                            sap.ui.core.BusyIndicator.hide();
                        }
                    }.bind(this)
                });
            },

            onVerifyRegOTP: function () {
                const verificationCode = this.byId("inp-regVerifyOtp").getValue();
                this.byId("inp-regVerifyOtp").setValueState("None");
                if (!verificationCode) {
                    this.byId("inp-regVerifyOtp").setValueState("Error").setValueStateText(this.oResourceBundle.getText('verificationCodeRequired'));
                } else {
                    sap.ui.core.BusyIndicator.show();
                    const reqData = {
                        "otp": verificationCode
                    };
                    /**AJAX call to validate User  */
                    this.SendRequest(this, "/portal-api/public/v1/verify-email", "POST", { Authorization: "Bearer " + sessionStorage.getItem("regToken") }, JSON.stringify(reqData), (_self, data, message) => {
                        if (data.verified) {
                            // Verification succeeded
                            sessionStorage.setItem("regToken", data.token);
                            if (data.category == "08") {
                                sessionStorage.setItem("userDetails", JSON.stringify({ userRole: data.userRole, userEmail: data.email, userCountry: data.countryCode, userCategory: data.category, userName: data.companyName }));
                            } else if (data.category == "05") {
                                sessionStorage.setItem("userDetails", JSON.stringify({ userRole: data.userRole, userEmail: data.email, userGSTIN: data.shortName, userCategory: data.category, userName: data.companyName }));
                            } else if (data.category == "07") {
                                sessionStorage.setItem("userDetails", JSON.stringify({ userRole: data.userRole, userEmail: data.email, userIATA: data.data, userCountry: data.countryCode, userCategory: data.category, userName: data.companyName, userCity: data.city, userRegion: data.regionName, userpostalCode: data.postalCode }));
                            } else {
                                data.pan = data.pan.toUpperCase();
                                sessionStorage.setItem("userDetails", JSON.stringify({ userRole: data.userRole, userEmail: data.email, userPan: data.pan }));
                            }
                            _self.oRouter.navTo("Registration");
                            sap.ui.core.BusyIndicator.hide();
                            sessionStorage.setItem("toggling", JSON.stringify({ isRegEnabled: false }));
                        } else if (data.paninvalid) {

                            sap.m.MessageBox.error("PAN is not registered with GSTIN.", {
                                title: "PAN Verification status",
                                actions: [sap.m.MessageBox.Action.OK],
                                onClose: function (oAction) {
                                    sap.ui.core.BusyIndicator.hide();
                                    _self.onclickOthers();
                                }
                            });

                        } else {
                            // Verification failed, handle the error message
                            sap.m.MessageBox.error("Invalid OTP. Please check the OTP you entered");
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });

                }
            },

            onPressRegResendOtp: function () {
                // clearInterval(this.timer); // Clear the existing timer
                // this._handleRegOtp();
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/portal-api/public/v1/resend-reg-otp", "GET", { Authorization: "Bearer " + sessionStorage.getItem("regToken") }, null, (_self, data, message) => {
                    sessionStorage.setItem("regToken", data.token);
                    clearInterval(_self.timer); // Clear the existing timer
                    _self._handleRegOtp();
                    _self.byId("inp-regVerifyOtp").setValue("");
                    sap.ui.core.BusyIndicator.hide();
                });
            },

            onLoginButtonPress: function (oEvent) {
                var loginEmail = this.byId("inp-loginEmail").getValue(),
                loginEmail = loginEmail.toLowerCase();
            const loginPass = this.byId("inp-loginPass").getValue();
                var validated = true;
                /**Clear value states */
                this.byId("inp-loginEmail").setValueState("None");
                this.byId("inp-loginPass").setValueState("None");
                /**Mandatory checks */

                if (!loginEmail) {
                    this.byId("inp-loginEmail").setValueState("Error").setValueStateText(this.oResourceBundle.getText('emailRequired'));
                    validated = false;
                }

                if (!loginPass) {
                    this.byId("inp-loginPass").setValueState("Error").setValueStateText(this.oResourceBundle.getText('passwordRequired'));
                    validated = false;
                }

                /**AJAX call to validate User  */
                if (validated) {
                    sap.ui.core.BusyIndicator.show();
                    const cred = btoa(loginEmail + ":" + loginPass);
                    this.SendRequest(this, "/portal-api/public/v1/login", "POST", { Authorization: "Basic " + cred }, null, (_self, data, message) => {
                        sessionStorage.setItem("loginToken", data.token);
                        sap.ui.core.BusyIndicator.hide();
                        if (data.STATUS === "D") {
                            sap.m.MessageBox.confirm("Your account is deactivated. Do you want to activate it?", {
                                title: "Account Deactivated",
                                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                                emphasizedAction: sap.m.MessageBox.Action.YES,
                                onClose: function (oAction) {
                                    sap.ui.core.BusyIndicator.hide();
                                    if (oAction === sap.m.MessageBox.Action.YES) {
                                        _self.SendRequest(_self, "/portal-api/public/v1/activate-account", "POST", {}, JSON.stringify({ LOGINEMAIL: loginEmail }), (_self, data, message) => {
                                            MessageBox.success(message.Text);
                                            _self._refreshPage();
                                        });
                                    }
                                }
                            });
                        } else if (data.STATUS === "B") {
                            // Handle message box to show that the account is blocked.
                            sap.ui.core.BusyIndicator.hide();
                            sap.m.MessageBox.alert(message.Text, {
                                title: "Account Blocked",
                                onClose: function () {
                                }
                            });
                        } else if (data.STATUS === "I") {
                            // Handle message box to show that the account is blocked.
                            sap.ui.core.BusyIndicator.hide();
                            sap.m.MessageBox.alert(message.Text, {
                                title: "Account Initiated",
                                onClose: function () {
                                }
                            });
                        } else {
                            // If neither "D" nor "B", proceed with your other logic.
                            clearInterval(_self.timer);
                            _self._handleOtp();
                            _self.byId("sf-otpLogin").setVisible(true);
                            _self.byId("sf-login").setVisible(false);
                            _self.byId("sf-setPassword").setVisible(false);
                            if(data.loginEmail){
                            _self.byId("txt-loginEmail").setText(data.loginEmail);
                            }else{
                                _self.byId("txt-loginEmail").setText(loginEmail);
                              
                            }
                            sap.ui.core.BusyIndicator.hide();
                        }

                    });
                }
            },

            _handleRegOtp: function () {
                const oTextId = this.byId("txt-regExpireOtp");
                const oInputId = this.byId("inp-regVerifyOtp");
                const oButtonId = this.byId("btn-regVerifyOtp");
                this._startCountDown(oTextId, 119, 1000, oButtonId, oInputId);
            },

            _handleOtp: function () {
                const oTextId = this.byId("txt-expireOtp");
                const oInputId = this.byId("inp-verifyOtp");
                const oButtonId = this.byId("btn-verifyOtp");
                this._startCountDown(oTextId, 119, 1000, oButtonId, oInputId);
            },

            onVerifyOTP: function () {
                const verificationCode = this.byId("inp-verifyOtp").getValue();
                this.byId("inp-verifyOtp").setValueState("None");
                this.token = "";
                if (!verificationCode) {
                    this.byId("inp-verifyOtp").setValueState("Error").setValueStateText(this.oResourceBundle.getText('verificationCodeRequired'));
                } else {
                    sap.ui.core.BusyIndicator.show();
                    const reqData = {
                        "otp": verificationCode
                    };
                    /**AJAX call to validate User  */
                    this.SendRequest(this, "/portal-api/public/v1/verify-otp", "POST", { Authorization: "Bearer " + sessionStorage.getItem("loginToken") }, JSON.stringify(reqData), (_self, data, message) => {
                        if (data.ACTIVESESSIONPRESENT) {
                            sessionStorage.clear();
                            sessionStorage.setItem("loginToken", data.token);
                            var ISINTIALLOGIN = data.ISINTIALLOGIN;
                            sap.ui.core.BusyIndicator.hide();
                            sap.m.MessageBox.confirm("You are already logged in on a different device.\n Do you wish to terminate all other sessions and continue.", {
                                title: "Already Logged in",
                                actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
                                emphasizedAction: sap.m.MessageBox.Action.YES,
                                onClose: function (oAction) {
                                    if (oAction === sap.m.MessageBox.Action.YES) {
                                        _self.SendRequest(_self, "/portal-api/portal/v1/reset-active-session", "GET", { Authorization: "Bearer " + sessionStorage.getItem("loginToken") }, null, (_self, data, message) => {

                                            sessionStorage.setItem("jwt", sessionStorage.getItem("loginToken"));
                                            _self.token = sessionStorage.getItem("loginToken");
                                            if (ISINTIALLOGIN == "" || ISINTIALLOGIN == null) {
                                                _self.byId("sf-otpLogin").setVisible(false);
                                                _self.byId("sf-setPassword").setVisible(false);
                                                _self.byId("sf-login").setVisible(false);
                                                clearInterval(_self.timer); // Clear the existing timer
                                                _self.byId("txt-expireOtp").setText("");
                                                sap.ui.core.BusyIndicator.hide();
                                                _self.oRouter.navTo("LandingPage", {}, true);
                                            } else {
                                                _self.byId("sf-otpLogin").setVisible(false);
                                                _self.byId("sf-login").setVisible(false);
                                                _self.byId("sf-setPassword").setVisible(true);
                                                clearInterval(_self.timer); // Clear the existing timer
                                                _self.byId("txt-expireOtp").setText("");
                                                sap.ui.core.BusyIndicator.hide();
                                            }
                                        });
                                    } else if (oAction === sap.m.MessageBox.Action.NO) {
                                        sessionStorage.clear();
                                        clearInterval(_self.timer);
                                        _self.byId("sf-otpLogin").setVisible(false);
                                        _self.byId("sf-setPassword").setVisible(false);
                                        _self.byId("sf-login").setVisible(false);
                                        _self.byId("txt-expireOtp").setText("");
                                        sap.ui.core.BusyIndicator.hide();
                                        _self.onRegisteredButtonPress();
                                    }
                                }
                            });
                        } else {
                            sessionStorage.clear();
                            sessionStorage.setItem("jwt", data.token);
                            _self.token = data.token;
                            if (data.ISINTIALLOGIN == "" || data.ISINTIALLOGIN == null) {
                                _self.byId("sf-otpLogin").setVisible(false);
                                _self.byId("sf-setPassword").setVisible(false);
                                _self.byId("sf-login").setVisible(false);
                                clearInterval(_self.timer); // Clear the existing timer
                                _self.byId("txt-expireOtp").setText("");
                                sap.ui.core.BusyIndicator.hide();
                                _self.oRouter.navTo("LandingPage", {}, true);
                            } else {
                                _self.byId("sf-otpLogin").setVisible(false);
                                _self.byId("sf-login").setVisible(false);
                                _self.byId("sf-setPassword").setVisible(true);
                                clearInterval(_self.timer); // Clear the existing timer
                                _self.byId("txt-expireOtp").setText("");
                                sap.ui.core.BusyIndicator.hide();
                            }
                        }
                    });
                }
            },

            onValidateNewPassword: function (oEvent) {
                const sValue = oEvent.getParameter("value");
                if (!validations.validatePassword(sValue)) {
                    this.byId("inp-newPass").setValueState("Information").setValueStateText(
                        `Password must contain 1 number (0-9), 1 uppercase letter, 1 lowercase letter, 1 non-alpha numeric number and it should be 8-16 characters with no space.`);
                    this.validate = false;
                } else {
                    this.byId("inp-newPass").setValueState("None");
                    this.validate = true;
                }
            },

            onValidateConfirmPassword: function (oEvent) {
                const sValue = oEvent.getParameter("value"),
                    sNewPass = this.byId("inp-newPass").getValue();
                if (sValue === sNewPass) {
                    this.byId("inp-confirmPass").setValueState("Success");
                    this.validate = true;
                } else {
                    this.byId("inp-confirmPass").setValueState("Information").setValueStateText("Re-enter your password to verify it matches");
                    this.validate = false;
                }
            },

            onConfirmButtonPress: function (oEvent) {
                const sNewPass = this.byId("inp-newPass").getValue(),
                    loginPass = this.byId("inp-confirmPass").getValue();
                var validated = true;
                var patternCriteria = true;
                /**Clear value states */
                this.byId("inp-newPass").setValueState("None");
                this.byId("inp-confirmPass").setValueState("None");
                /**Mandatory checks */

                if (!sNewPass) {
                    this.byId("inp-newPass").setValueState("Error").setValueStateText(this.oResourceBundle.getText('passwordRequired'));
                    validated = false;
                } else {
                    if (!validations.validatePassword(sNewPass)) {
                        this.byId("inp-newPass").setValueState("Information").setValueStateText(
                            `Password must contain 1 number (0-9), 1 uppercase letter, 1 lowercase letter, 1 non-alpha numeric number and it should be 8-16 characters with no space.`);
                        validated = false;
                        patternCriteria = false;
                    } else {
                        this.byId("inp-newPass").setValueState("None");
                    }
                }

                if (!loginPass) {
                    this.byId("inp-confirmPass").setValueState("Error").setValueStateText(this.oResourceBundle.getText('passwordRequired'));
                    validated = false;
                } else {
                    if (loginPass === sNewPass) {
                        this.byId("inp-confirmPass").setValueState("Success");
                    } else {
                        this.byId("inp-confirmPass").setValueState("Information").setValueStateText("Re-enter your password to verify it matches");
                        validated = false;
                    }
                }
                /**AJAX call to validate User  */
                if (validated && this.validate) {
                    sap.ui.core.BusyIndicator.show();
                    this.SendRequest(this, "/portal-api/public/v1/force-reset-password", "POST", { Authorization: "Bearer " + this.token }, JSON.stringify({ NEWPASSWORD: sNewPass }), (_self, data, message) => {
                        window.location.replace('/portal/index.html');
                        sap.ui.core.BusyIndicator.hide();
                    });
                } else {
                    if (patternCriteria == false) {
                        sap.m.MessageBox.warning("Password is not strong. Please try another password satisfying all criteria");
                        sap.ui.core.BusyIndicator.hide();
                        this.byId("inp-newPass").setValueState("Information").setValueStateText(
                            `Password must contain 1 number (0-9), 1 uppercase letter, 1 lowercase letter, 1 non-alpha numeric number and it should be 8-16 characters with no space.`);
                    } else {
                        sap.m.MessageBox.warning("Password does not match");
                        sap.ui.core.BusyIndicator.hide();
                    }
                }
            },

            onPressResendOtp: function () {
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/portal-api/public/v1/resend-otp", "GET", { Authorization: "Basic " + sessionStorage.getItem("loginToken") }, null, (_self, data, message) => {
                    sessionStorage.setItem("loginToken", data.token);
                    clearInterval(_self.timer);
                    _self._handleOtp();
                    _self.byId("btn-verifyOtp").setEnabled(true);
                    sap.ui.core.BusyIndicator.hide();
                });
            },

            _startCountDown: function (oTextId, totalTime, interval, oButtonId, oInputId) {
                var timer = window.setInterval(startCountDown, interval);
                this.timer = timer;
                oButtonId.setEnabled(true);
                function startCountDown() {
                    var minutes = Math.floor(totalTime / 60);
                    var seconds = totalTime % 60;
                    var formattedMinutes = minutes.toString().padStart(2, "0");
                    var formattedSeconds = seconds.toString().padStart(2, "0");

                    if (totalTime >= 0) {
                        //Update current time left
                        oTextId.setText("OTP Expires in " + formattedMinutes + ":" + formattedSeconds);
                        totalTime--;
                    } else {
                        //Stop timer after 2 minutes
                        oTextId.setText("OTP Expired");
                        oInputId.setValueState("None");
                        clearInterval(timer);
                        oButtonId.setEnabled(false);
                    }
                }
            },

            _refreshPage: function () {

                this.byId("inp-loginPass").setValueState("None");
                this.byId("inp-loginPass").setValue("");
                this.byId("inp-loginEmail").setValue("");
                this.byId("inp-loginEmail").setValueState("None");
                this.byId("inp-verifyOtp").setValue("");
                this.byId("inp-verifyOtp").setValueState("None");
                this.byId("inp-pan").setValue("");
                this.byId("inp-pan").setValueState("None");
                this.byId("inp-newEmail").setValue("");
                this.byId("inp-newEmail").setValueState("None");
                this.byId("inp-regVerifyOtp").setValue("");
                this.byId("inp-regVerifyOtp").setValueState("None");
                this.byId("inp-consulateEmail").setValue("");
                this.byId("sel-logcountry").setSelectedKey(null);
                this.byId("sel-Agentcountry").setSelectedKey(null);
                this.byId("inp-unBodiesEmail").setValue("");
                this.byId("sel-unBodies").setSelectedKey(null);
                this.byId("inp-overSeasAgentEmail").setValue("");
                this.byId("sel-AgentIata").setValue("");
                clearInterval(this.timer);


            },

            onPressActivateUser: function () {
                if (!this.oValidateDialog) {
                    this.oValidateDialog = new sap.m.Dialog({
                        type: sap.m.DialogType.Message,
                        title: "Activate User",
                        content: [
                            new sap.m.Label({
                                text: this.oResourceBundle.getText('email'),
                                labelFor: "email"
                            }),
                            new sap.m.Input("email", {
                                width: "100%",
                                liveChange: function (oEvent) {
                                    var sText = oEvent.getParameter("value");
                                    this.oValidateDialog.getBeginButton().setEnabled(sText.length > 0);
                                }.bind(this)
                            })
                        ],
                        beginButton: new sap.m.Button({
                            type: sap.m.ButtonType.Emphasized,
                            text: "Send",
                            enabled: false,
                            press: function () {
                                const email = sap.ui.getCore().getElementById("email").getValue();
                                sap.ui.getCore().getElementById("email").setValueState("None")
                                if (email) {
                                    if (validations.validateEmail(email)) {
                                        /** TODO :Test */
                                        this.SendRequest(this, "/portal-api/public/v1/activate-user?Email=" + email, "GET", {}, null, (_self, data, message) => {
                                            // show message
                                        });
                                        this.oValidateDialog.close();
                                    } else {
                                        sap.ui.getCore().getElementById("email").setValueState("Error").setValueStateText(this.oResourceBundle.getText('invalidEmailFormat'));
                                    }
                                } else {
                                    sap.ui.getCore().getElementById("email").setValueState("Error").setValueStateText(this.oResourceBundle.getText('emailRequired'));
                                }
                            }.bind(this)
                        }),
                        endButton: new sap.m.Button({
                            text: "Cancel",
                            press: function () {
                                this.oValidateDialog.close();
                            }.bind(this)
                        })
                    });
                }
                this.oValidateDialog.open();
            },

            onForgotPassword: function () {
                if (!this.oForgotPasswordDialog) {
                    this.oForgotPasswordDialog = new sap.m.Dialog({
                        type: sap.m.DialogType.Message,
                        title: "Forgot Password",
                        content: [
                            new sap.m.Label({
                                text: this.oResourceBundle.getText('email'),
                                labelFor: "email"
                            }),
                            new sap.m.Input("loginEmail", {
                                width: "100%",
                                liveChange: function (oEvent) {
                                    var sText = oEvent.getParameter("value");
                                    var _oInput = oEvent.getSource();
                                    var val = _oInput.getValue();
                                    var specialCharachters = /[!#$&₹%^;`~*'()?":{}|<>=,\[\]\/\\]/;
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
                                    this.oForgotPasswordDialog.getBeginButton().setEnabled(sText.length > 0);
                                }.bind(this)
                            })
                        ],
                        beginButton: new sap.m.Button({
                            type: sap.m.ButtonType.Emphasized,
                            text: "Send",
                            enabled: false,
                            press: function () {
                                var email = sap.ui.getCore().getElementById("loginEmail").getValue();
                                email= email.toLowerCase();
                                sap.ui.getCore().getElementById("loginEmail").setValue("");
                                sap.ui.getCore().getElementById("loginEmail").setValueState("None");
                                if (email) {
                                    if (validations.validateEmail(email)) {
                                        /** TODO :Test */
                                        var reqEmail = {
                                            "LOGINEMAIL": email
                                        };
                                        this.SendRequest(this, "/portal-api/public/v1/forgot-password", "POST", {}, JSON.stringify(reqEmail), (_self, data, message) => {
                                            // show message
                                            if (message.Code != "E") {
                                                sap.m.MessageBox.information(message.Text, {
                                                    title: "Reset Password",
                                                    onClose: function () {
                                                        sap.ui.core.BusyIndicator.hide();
                                                    }
                                                });
                                            }
                                        });
                                        this.oForgotPasswordDialog.close();
                                    } else {
                                        sap.ui.getCore().getElementById("loginEmail").setValueState("Error").setValueStateText(this.oResourceBundle.getText('invalidEmailFormat'));
                                    }
                                } else {
                                    sap.ui.getCore().getElementById("loginEmail").setValueState("Error").setValueStateText(this.oResourceBundle.getText('emailRequired'));
                                }
                            }.bind(this)
                        }),
                        endButton: new sap.m.Button({
                            text: "Cancel",
                            press: function () {
                                this.oForgotPasswordDialog.close();
                            }.bind(this)
                        })
                    });
                }
                this.oForgotPasswordDialog.open();
            },
            onShowHidePassword: function (oEvent) {
                const id = oEvent.getSource(),
                    type = id.getType();
                if (type == "Text") {
                    id.setType("Password");
                    id.setValueHelpIconSrc("sap-icon://show");
                } else {
                    id.setType("Text");
                    id.setValueHelpIconSrc("sap-icon://hide");
                }
            },
            onfaqpress: function (oEvent) {
                this.oRouter.navTo("faq");
            },
            onNewUserRegisterNowLinkPresshelp: function (oEvent) {
                this.oRouter.navTo("registerfaq");
            },
            onclickpdfdownload: function (oEvent) {
                var pdfUrl = "css/images/AI_GSTIN_DETAILS.pdf"; // Relative URL to your PDF file

            // Open the PDF file in a new browser tab/window
            window.open(pdfUrl, "_blank");
            },
            
            openPdfOrImageInNewWindow: function (title, base64Data) {
                if (base64Data) {
                    var type = "pdf";
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
                    sap.m.MessageBox.warning("File Missing");
                }
            },
            onpressunregisteredcus: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var filterJson;
                this.inputId = oEvent.getSource().getId();
                if (!this.nongstdialog) {
                    this.nongstdialog = sap.ui.xmlfragment("airindiagst.view.Fragment.nonGstustomerDialog", this);
                }
                this.getView().addDependent(this.nongstdialog);
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.nongstdialog);
                sap.ui.getCore().byId("inp-tktnum").setValue("");
                sap.ui.getCore().byId("inp-pnrnumb").setValue("");
                _self.nongstdialog.open();
                sap.ui.core.BusyIndicator.hide();
            },
            onpresscanceldownload: function (oEvent) {
                this.nongstdialog.close();
            },
            onDownloadnonGST: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var pnr = sap.ui.getCore().byId("inp-pnrnumb").getValue();
                var tktnum = sap.ui.getCore().byId("inp-tktnum").getValue();
                var issuedate = sap.ui.getCore().byId("dp-issueDatenongst").getValue();
                if(pnr == ""){
                    pnr = null;
                }
                if (issuedate == "") {
                    sap.m.MessageBox.information("Please fill date of issuance");
                    sap.ui.core.BusyIndicator.hide();
                } else {
                    if (tktnum == "") {
                        sap.m.MessageBox.information("Please fill ticket number");
                        sap.ui.core.BusyIndicator.hide();
                    } else {
                        this.SendRequest(this, "/portal-api/public/v1/b2c-invoice-download", "POST", {}, JSON.stringify({ PNR: pnr,TICKETNUMBER: tktnum,TICKETISSUEDATE: issuedate }), (_self, data, message) => {
                            const invoices = data.invoice;
                            if (data.invoice) {
                                const base64Data = "data:application/pdf;base64," + data.invoice;
                                const link = document.createElement('a');
                                link.href = base64Data;
                                link.download = `Invoice - ${data.invoiceNumber}`;
                                link.click();
                                sap.ui.core.BusyIndicator.hide();
                            }
                            sap.ui.core.BusyIndicator.hide();
                        });
                    }
                }
            }

        });
    }
);
