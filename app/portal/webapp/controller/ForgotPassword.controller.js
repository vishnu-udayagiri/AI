sap.ui.define(
    ["sap/ui/core/mvc/Controller", "airindiagst/model/validations",
        "sap/m/MessageBox"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, validations, MessageBox) {
        "use strict";

        return Controller.extend("airindiagst.controller.ForgotPassword", {
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
                // sap.ui.core.BusyIndicator.show();
                this.token = oEvent.getParameter("arguments").token;
            },

            onValidateMandatory: function (oEvent) {
                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },

            onValidateNewPassword: function (oEvent) {
                const sValue = oEvent.getParameter("value");
                if (!validations.validatePassword(sValue)) {
                    this.byId("inp-newPass").setValueState("Information").setValueStateText(
                        `Password must contain 1 number (0-9), 1 uppercase letters, 1 lowercase letters, 1 non-alpha numeric number, 8-16 characters with no space.`);
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
                            `Password must contain 1 number (0-9), 1 uppercase letters, 1 lowercase letters, 1 non-alpha numeric number, 8-16 characters with no space.`);
                        validated = false;
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
                    this.SendRequest(this, "/portal-api/public/v1/verify-reset-password", "POST", { Authorization: "Bearer " + this.token }, JSON.stringify({ NEWPASSWORD: sNewPass }), (_self, data, message) => {
                        window.location.replace('/portal/index.html');
                        sap.ui.core.BusyIndicator.hide();
                    });
                }
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
            }
        });
    }
);
