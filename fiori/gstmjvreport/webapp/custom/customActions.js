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
                url: serviceUrl + 'GSTMJVReport',
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

                    new Label({ text: "Date Range", labelFor: "dateRange" }),
                    new sap.m.DateRangeSelection("dateRange", {
                        
                        required: true,
                    }),

                    new Label("jobNameLabel", { text: "Job Name", labelFor: "JobName" }),
                    new Input("JobName", {
                        width: "100%",
                        required: true,
                        type: "Text"
                    }),


                    new Label("exportRangeLabel", { text: "Excel Export per Sheet", labelFor: "exportRange", visible: false }),
                    new Input("exportRange", {
                        width: "100%",
                        required: true,
                        visible: false,
                        type: "Number",
                        placeholder: 'Enter a range from 1 - 100,000',
                        liveChange: function (oEvent) {
                            let selValue = oEvent.getParameters().value;
                            if (selValue > 100000) {
                                Core.byId("exportRange").setValueState("Error").setValueStateText("Entered value must be 100,000 or less");
                            } else {
                                Core.byId("exportRange").setValueState("None");
                            }
                        }
                    }),
                ],
                beginButton: new Button("ccApproveButton", {
                    type: ButtonType.Emphasized,
                    text: "Request",
                    enabled: true,
                    press: function () {
                        const dateRange = Core.byId("dateRange").getValue(),
                            JobName = Core.byId("JobName").getValue();

                        Core.byId("dateRange").setValueState("None");
                        Core.byId("JobName").setValueState("None");

                        var validate = true;
                        if (!dateRange) { Core.byId("dateRange").setValueState("Error").setValueStateText("Date Range is required"); validate = false; };
                        if (!JobName) { Core.byId("JobName").setValueState("Error").setValueStateText("Job Name is required"); validate = false; };




                        if (dateRange) {
                            var startDate = Core.byId("dateRange").getDateValue(),
                                endDate = Core.byId("dateRange").getSecondDateValue();
                        }
                        var reqData = {
                            from: startDate,
                            to: endDate,
                            JobName: JobName

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