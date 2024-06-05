sap.ui.define([
    "sap/ui/core/mvc/Controller", "sap/ui/core/Core", "sap/m/Dialog", "sap/m/DialogType", "sap/m/Button", "sap/m/ButtonType",
    "sap/m/Label", "sap/m/Input", "sap/m/Select", "sap/m/MultiComboBox", "sap/m/MessageToast", "sap/m/Text",
    "sap/m/TextArea", "sap/m/ComboBox", "sap/m/MessageBox", "sap/m/CheckBox", "sap/ui/model/json/JSONModel", "sap/ui/table/Table"
], function (Controller, Core, Dialog, DialogType, Button, ButtonType,
    Label, Input, Select, MultiComboBox, MessageToast, Text,
    TextArea, ComboBox, MessageBox, CheckBox, JSONModel, Table) {
    "use strict";
    return {

        exportAll: function (oContext, aSelectedContexts, oEvent) {
            sap.ui.core.BusyIndicator.show();
            let arrInvoices = [];
            this.documentTypeModel = new JSONModel();
            sap.ui.getCore().setModel(this.documentTypeModel, "documentTypeModel");

            const serviceUrl = this.getModel().sServiceUrl;

            var _self = this;

            $.ajax({
                type: "get",
                async: false,
                url: serviceUrl + 'valueListMonth',
                success: function (data) {
                    _self.documentTypeModel.setData(data.value);
                    _self.documentTypeModel.setSizeLimit(data.value.length);
                },
                error: function (xhr, textStatus, errorMessage) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error("Something went wrong. Please try again.");
                }
            });

            this.extExportFilter = new sap.m.Dialog({
                type: DialogType.Message,
                title: "Export All",
                contentWidth: "20%",
                content: [

                    new Label({ text: "GSTR1 Period", labelFor: "gstr1period" }),
                    new ComboBox("gstr1period", {
                        width: "100%",
                        forceSelection: false,
                        items: {
                            path: "documentTypeModel>/",
                            template: new sap.ui.core.ListItem(
                                { key: '{documentTypeModel>GSTR_MONTH}', text: '{documentTypeModel>GSTR_MONTH}' }
                            ),
                            templateShareable: true
                        },
                        change: function (oEvent) { }
                    }),

                    new Label("jobNameLabel", { text: "Job Name", labelFor: "JobName" }),
                    new Input("JobName", {
                        width: "100%",
                        required: true,
                        type: "Text"
                    }),

                ],
                beginButton: new Button("ccApproveButton", {
                    type: ButtonType.Emphasized,
                    text: "Request",
                    enabled: true,
                    press: function () {
                            const  gstr1period = Core.byId("gstr1period").getValue(),
                                   JobName = Core.byId("JobName").getValue();

                        Core.byId("gstr1period").setValueState("None");
                        Core.byId("JobName").setValueState("None");

                        var validate = true;
                        if (!gstr1period) { Core.byId("gstr1period").setValueState("Error").setValueStateText("GSTR1 period is required"); validate = false; };
                        if (!JobName) { Core.byId("JobName").setValueState("Error").setValueStateText("Job Name is required"); validate = false; };
                        var reqData = {
                            JobName: JobName,
                            gstr1period : gstr1period,
                        }

                        if (validate) {
                            const serviceUrl = this.getModel().sServiceUrl;
                            var _self = this;
                            sap.ui.core.BusyIndicator.show();

                            let fieldsToMap = oEvent.mAggregatedQueryOptions.$select;
                            reqData.fieldsToMap = fieldsToMap;
                            jQuery.ajax({
                                url: serviceUrl + 'getCSRFToken()',
                                type: "GET",
                                headers: {
                                    "X-CSRF-Token": "fetch"
                                },
                                success: function (data, status, xhr) {
                                    jQuery.ajax({
                                        url: serviceUrl + "exportAll",
                                        type: "POST",
                                        data: JSON.stringify({ fields: JSON.stringify(reqData) }),
                                        contentType: "application/json",
                                        headers: {
                                            "X-CSRF-Token": xhr.getResponseHeader("X-CSRF-Token")
                                        },
                                        success: function (response, textStatus, jqXHR) {
                                            _self.extExportFilter.destroy();
                                            sap.ui.core.BusyIndicator.hide();
                                            MessageBox.success(response.value);
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
                            this.extExportFilter.destroy();
                        }.bind(this)
                    }
                )
            });
            this.extExportFilter.open();
            sap.ui.core.BusyIndicator.hide();
        }
    }
});