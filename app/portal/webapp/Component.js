/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "airindiagst/model/models",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
],
    function (UIComponent, Device, models, MessageToast, MessageBox) {
        "use strict";

        return UIComponent.extend("airindiagst.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);
                this.setModel(new sap.ui.model.json.JSONModel(), "TempDataModel");
                // enable routing
                this.getRouter().initialize();

                const shellData = sessionStorage.getItem("shellData");
                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                this.shellModel = new sap.ui.model.json.JSONModel();
                this.shellModel.setData(
                    shellData ? JSON.parse(shellData) : { show: false }
                );
                this.setModel(this.shellModel, "shellModel");
            },

            SendRequest: function (_self, url, method, headers, payload, cb) {
                const auth = sessionStorage.getItem("jwt");
                if (!headers.Authorization && auth) {
                    headers.Authorization = "Basic " + auth;
                }

                headers["Content-Type"] = "application/json";
                headers["Accept"] = ["text/plain", "application/json"];

                const options = {
                    url,
                    type: method,
                    headers: headers,
                };

                if (payload) {
                    options.data = payload;
                }

                jQuery.ajax({
                    ...options,
                    success: function (response, textStatus, jqXHR) {
                        if (response?.Message?.ShowMessage) {
                            const message = response?.Message;
                            if (message?.Type === "T") {
                                MessageToast.show(_self.oResourceBundle.getText(message.i18nCode) ?? message.Text);
                            }
                            else if (message?.Type === "B") {
                                MessageBox[_self.getOwnerComponent().MessageBoxType(message.Code)](_self.oResourceBundle.getText(message.i18nCode) ?? message.Text);
                            }
                        }
                        if (cb) {
                            const data = response?.Data ? JSON.parse(atob(response.Data)) : null;
                            cb(_self, data, response?.Message);
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        sap.ui.core.BusyIndicator.hide();

                        if (jqXHR.status === 403 && window.location.hash != "") {
                            MessageBox.error(_self.oResourceBundle.getText('msgSessionExpired'), {
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (sAction) {
                                    sessionStorage.clear();
                                    window.location.replace('/portal/index.html');
                                },
                            });
                        } else if (jqXHR.status === 403) {
                            MessageBox.error('Your session has expired', {
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (sAction) {
                                    sessionStorage.clear();
                                    window.location.replace('/portal/index.html');
                                },
                            });
                        } else {
                            const message = jqXHR.responseJSON?.Message;
                            if (message?.ShowMessage) {
                                if (message.Type === "T") {
                                    MessageToast.show(_self.oResourceBundle.getText(message.i18nCode) ?? message?.Text ?? _self.oResourceBundle.getText('msgGenericError'));
                                }
                                else if (message.Type === "B") {
                                    // MessageBox[_self.getOwnerComponent().MessageBoxType(message.Code)](_self.oResourceBundle.getText(message.i18nCode) ?? message?.Text ?? _self.oResourceBundle.getText('msgGenericError'));
                                    MessageBox[_self.getOwnerComponent().MessageBoxType(message.Code)](_self.oResourceBundle.getText(message.i18nCode) ?? message?.Text ?? _self.oResourceBundle.getText('msgGenericError'));

                                }
                            }
                        }
                    },
                });
            },
            MessageBoxType: function (type) {
                switch (type) {
                    case "S":
                        return "success";
                    case "I":
                        return "information";
                    case "W":
                        return "warning";
                    case "E":
                        return "error";
                    default:
                        return "alert";
                }
            }
        });
    }
);