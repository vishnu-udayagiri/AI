sap.ui.define([
    "sap/ui/core/mvc/Controller", "sap/ui/core/Core", "sap/m/Dialog", "sap/m/DialogType", "sap/m/Button", "sap/m/ButtonType",
    "sap/m/Label", "sap/m/Input", "sap/m/Select", "sap/m/MultiComboBox", "sap/m/MessageToast", "sap/m/Text",
    "sap/m/TextArea", "sap/m/ComboBox", "sap/m/MessageBox", "sap/m/CheckBox", "sap/ui/model/json/JSONModel", "sap/ui/table/Table"
], function (Controller, Core, Dialog, DialogType, Button, ButtonType,
    Label, Input, Select, MultiComboBox, MessageToast, Text,
    TextArea, ComboBox, MessageBox, CheckBox, JSONModel, Table) {
    "use strict";

    var sResponsivePaddingClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";

    return {

        assignAsAdmin: function (oContext, aSelectedContexts) {
            const url = oContext.getPath();

            // Extracting IsActiveEntity value from the URL
            const params = url.split(',');
            let isActiveEntityValue;

            for (const param of params) {
                if (param.includes('IsActiveEntity')) {
                    const keyValue = param.split('=');
                    if (keyValue.length === 2) {
                        isActiveEntityValue = keyValue[1];
                        break;
                    }
                }
            }

            isActiveEntityValue = isActiveEntityValue?.split(')')[0] == 'true' ? true : false;
            if (!isActiveEntityValue) {
                sap.m.MessageBox.warning("Editing is active. Please proceed after completing the edit");
            } else {
                sap.ui.core.BusyIndicator.show();
                if (aSelectedContexts.length === 1) {
                    let arrUsers = [];
                    const oSelUsers = aSelectedContexts[0];
                    const oObject = oSelUsers.getObject();
                    if (oObject.assignAsAdmin) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.warning("User is already assigned as Admin");
                    } else {
                        arrUsers.push({
                            "userId": oObject.ID,
                            "companyId": oObject.companyId
                        });

                        const serviceUrl = this.getModel().sServiceUrl;

                        jQuery.ajax({
                            url: serviceUrl + 'getCSRFToken()',
                            type: "GET",
                            headers: {
                                "X-CSRF-Token": "fetch"
                            },
                            success: function (data, status, xhr) {
                                jQuery.ajax({
                                    url: serviceUrl + "assignAsAdmin",
                                    type: "POST",
                                    data: JSON.stringify({ users: arrUsers }),
                                    contentType: "application/json",
                                    headers: {
                                        "X-CSRF-Token": xhr.getResponseHeader("X-CSRF-Token")
                                    },
                                    success: function (response, textStatus, jqXHR) {
                                        sap.ui.core.BusyIndicator.hide();
                                        oContext.getBinding().refresh();
                                        MessageBox.success(response.value.message);
                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {
                                        const message = jqXHR.responseJSON?.error?.message;
                                        if (message) {
                                            MessageBox.error(message);
                                        }
                                        sap.ui.core.BusyIndicator.hide();
                                    },
                                });
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
                } else {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.warning("Select only one record to assign as admin");
                }
            }

        },

        activateAdmin: function (oContext, aSelectedContexts) {
            const url = oContext.getPath();

            // Extracting IsActiveEntity value from the URL
            const params = url.split(',');
            let isActiveEntityValue;

            for (const param of params) {
                if (param.includes('IsActiveEntity')) {
                    const keyValue = param.split('=');
                    if (keyValue.length === 2) {
                        isActiveEntityValue = keyValue[1];
                        break;
                    }
                }
            }

            isActiveEntityValue = isActiveEntityValue?.split(')')[0] == 'true' ? true : false;
            if (!isActiveEntityValue) {
                sap.m.MessageBox.warning("Editing is active. Please proceed after completing the edit");
            } else {
                sap.ui.core.BusyIndicator.show();
                if (aSelectedContexts.length > 0) {
                    const arrUsers = aSelectedContexts.map(oContext => ({
                        "userId": oContext.getObject().ID,
                        "companyId": oContext.getObject().companyId
                    }));

                    const serviceUrl = this.getModel().sServiceUrl;

                    jQuery.ajax({
                        url: serviceUrl + 'getCSRFToken()',
                        type: "GET",
                        headers: {
                            "X-CSRF-Token": "fetch"
                        },
                        success: function (data, status, xhr) {
                            const csrfToken = xhr.getResponseHeader("X-CSRF-Token");

                            jQuery.ajax({
                                url: serviceUrl + "activateUser",
                                type: "POST",
                                data: JSON.stringify({ users: arrUsers }),
                                contentType: "application/json",
                                headers: {
                                    "X-CSRF-Token": csrfToken
                                },
                                success: function (response, textStatus, jqXHR) {
                                    sap.ui.core.BusyIndicator.hide();
                                    oContext.getBinding().refresh();
                                    MessageBox.success(response.value.message);
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    const message = jqXHR.responseJSON?.error?.message || errorThrown;
                                    if (message) {
                                        MessageBox.error(message);
                                    }
                                    sap.ui.core.BusyIndicator.hide();
                                },
                            });
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            const message = jqXHR.responseJSON?.error?.message || errorThrown;
                            if (message) {
                                MessageBox.error(message);
                            }
                            sap.ui.core.BusyIndicator.hide();
                        },
                    });
                } else {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.warning("Please select at least one record to activate user");
                }
            }

        },

        deactivateAdmin: function (oContext, aSelectedContexts) {
            const url = oContext.getPath();

            // Extracting IsActiveEntity value from the URL
            const params = url.split(',');
            let isActiveEntityValue;

            for (const param of params) {
                if (param.includes('IsActiveEntity')) {
                    const keyValue = param.split('=');
                    if (keyValue.length === 2) {
                        isActiveEntityValue = keyValue[1];
                        break;
                    }
                }
            }

            isActiveEntityValue = isActiveEntityValue?.split(')')[0] == 'true' ? true : false;
            if (!isActiveEntityValue) {
                sap.m.MessageBox.warning("Editing is active. Please proceed after completing the edit");
            } else {
                this.extRejectAmendment = new sap.m.Dialog({
                    type: DialogType.Message,
                    title: "Deactivate",
                    contentWidth: "20%",
                    content: [
                        new Label({ text: "Reason for Deactivation", labelFor: "reason" }),
                        new Input("reason", {
                            width: "100%",
                            editable: true,
                            visible: true,
                            change: function (oEvent) {
                            }.bind(this)
                        })
                    ],

                    beginButton: new Button("ccApproveButton", {
                        type: ButtonType.Emphasized,
                        text: "Deactivate",
                        enabled: true,
                        press: function () {

                            const reason = Core.byId("reason").getValue();
                            const validate = true;

                            if (!reason) {
                                Core.byId("reason").setValueState("Error").setValueStateText("Reason type is required");
                                validate = false;
                            }


                            if (validate) {
                                var _self = this;
                                sap.ui.core.BusyIndicator.show();
                                let arrUsers = [];
                                const aSelectedInvoices = aSelectedContexts;
                                aSelectedInvoices.forEach(invoice => {
                                    const oObject = invoice.getObject();
                                    arrUsers.push({
                                        "userId": oObject.ID,
                                        "companyId": oObject.companyId
                                    });
                                });
                                let serviceUrl = this.getModel().sServiceUrl;
                                jQuery.ajax({
                                    url: serviceUrl + 'getCSRFToken()',
                                    type: "GET",
                                    headers: {
                                        "X-CSRF-Token": "fetch"
                                    },
                                    success: function (data, status, xhr) {
                                        jQuery.ajax({
                                            url: serviceUrl + "deactivateUser",
                                            type: "POST",
                                            data: JSON.stringify({ users: arrUsers, reason: reason }),
                                            contentType: "application/json",
                                            headers: {
                                                "X-CSRF-Token": xhr.getResponseHeader("X-CSRF-Token")
                                            },
                                            success: function (response, textStatus, jqXHR) {
                                                sap.ui.core.BusyIndicator.hide();
                                                oContext.getBinding().refresh();
                                                MessageBox.success(response.value.message);
                                                _self.extRejectAmendment.destroy();
                                            },
                                            error: function (jqXHR, textStatus, errorThrown) {
                                                const message = jqXHR.responseJSON?.error?.message;
                                                if (message) {
                                                    MessageBox.error(message);
                                                }
                                                sap.ui.core.BusyIndicator.hide();
                                            },
                                        });
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

                        }.bind(this)
                    }),
                    endButton: new Button(
                        {
                            text: "Cancel",
                            press: function () {
                                this.extRejectAmendment.destroy();
                            }.bind(this)
                        }
                    )
                });
                this.extRejectAmendment.open();
            }
        },

        exportAll: function (oContext, aSelectedContexts) {
            sap.ui.core.BusyIndicator.show();
            if (aSelectedContexts.length > 0) {
                const arrUsers = aSelectedContexts.map(oContext => ({
                    "companyId": oContext.getObject().ID,
                    "userId": oContext.getObject().companyId
                }));

                const serviceUrl = this.getModel().sServiceUrl;

                jQuery.ajax({
                    url: serviceUrl + 'getCSRFToken()',
                    type: "GET",
                    headers: {
                        "X-CSRF-Token": "fetch"
                    },
                    success: function (data, status, xhr) {
                        const csrfToken = xhr.getResponseHeader("X-CSRF-Token");

                        jQuery.ajax({
                            url: serviceUrl + "exportAll",
                            type: "POST",
                            data: JSON.stringify({ users: arrUsers }),
                            contentType: "application/json",
                            headers: {
                                "X-CSRF-Token": csrfToken
                            },
                            success: function (response, textStatus, jqXHR) {
                                if (response.value.status == 400) {
                                    MessageBox.error(response.value.message);
                                } else {
                                    const getExcelData = response.value;
                                    const base64Data = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + getExcelData
                                    const link = document.createElement('a');
                                    link.href = base64Data;
                                    link.download = "Customer Master";
                                    link.click();
                                }
                                sap.ui.core.BusyIndicator.hide();
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                const message = jqXHR.responseJSON?.error?.message || errorThrown;
                                if (message) {
                                    MessageBox.error(message);
                                }
                                sap.ui.core.BusyIndicator.hide();
                            },
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        const message = jqXHR.responseJSON?.error?.message || errorThrown;
                        if (message) {
                            MessageBox.error(message);
                        }
                        sap.ui.core.BusyIndicator.hide();
                    },
                });
            } else {
                sap.ui.core.BusyIndicator.hide();
                MessageBox.warning("Please select at least one record for export");
            }
        },

        viewDocument: function (oContext, aSelectedContexts) {
            // if (aSelectedContexts.length == 0) return MessageBox.warning("Select one attachment");
            for (let i = 0; i < aSelectedContexts.length; i++) {
                const oSelAttachment = aSelectedContexts[i];
                const oSelDocument = oSelAttachment.getObject();
                const file = oSelDocument.file;
                const fileName = oSelDocument.fileName;
                if (file && fileName) {
                    const base64Data = file;
                    const link = document.createElement('a');
                    link.href = base64Data;
                    link.download = fileName;
                    link.click();
                }
            }
        }
    }
});