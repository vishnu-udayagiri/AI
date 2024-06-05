/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "admindashboard/model/models",
    "sap/m/MessageBox"
],
    function (UIComponent,
        Device,
        models,
        MessageBox) {
        "use strict";

        return UIComponent.extend("admindashboard.Component", {
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

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
            },
            SendRequest: async function (_self, url, method, headers, payload, cb) {

                const options = {
                    url,
                    type: method,
                    headers: {
                        "Content-Type": "application/json"
                    },
                };

                if (payload) {
                    options.data = payload;
                }

                jQuery.ajax({
                    ...options,
                    success: function (response, textStatus, jqXHR) {
                        if (cb) {
                            const data = response?.value ? response.value : null;
                            cb(_self, data, "");
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        const message = jqXHR.responseJSON?.error?.message;
                        if (message) {
                            MessageBox.error(message);
                        }
                        sap.ui.core.BusyIndicator.hide();
                    },
                });

            }
        });
    }
);