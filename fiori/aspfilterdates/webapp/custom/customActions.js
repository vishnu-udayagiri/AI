sap.ui.define([
    "sap/ui/core/mvc/Controller", "sap/ui/core/Core", "sap/m/Dialog", "sap/m/DialogType", "sap/m/Button", "sap/m/ButtonType",
    "sap/m/Label", "sap/m/Input", "sap/m/Select", "sap/m/MultiComboBox", "sap/m/MessageToast", "sap/m/Text",
    "sap/m/TextArea", "sap/m/ComboBox", "sap/m/MessageBox", "sap/m/CheckBox", "sap/ui/model/json/JSONModel", "sap/ui/table/Table"
], function (Controller, Core, Dialog, DialogType, Button, ButtonType,
    Label, Input, Select, MultiComboBox, MessageToast, Text,
    TextArea, ComboBox, MessageBox, CheckBox, JSONModel, Table) {
    "use strict";
    return {

        Create: function (oContext, aSelectedContexts, oEvent) {
            sap.ui.core.BusyIndicator.show();
            let arrInvoices = [];
            this.documentTypeModel = new JSONModel();
            sap.ui.getCore().setModel(this.documentTypeModel, "documentTypeModel");

            const serviceUrl = this.getModel().sServiceUrl;

            var _self = this;

            // $.ajax({
            //     type: "get",
            //     async: false,
            //     url: serviceUrl + 'valueListDocumentType',
            //     success: function (data) {
            //         _self.documentTypeModel.setData(data.value);
            //         _self.documentTypeModel.setSizeLimit(data.value.length);
            //     },
            //     error: function (xhr, textStatus, errorMessage) {
            //         sap.ui.core.BusyIndicator.hide();
            //         MessageBox.error("Something went wrong. Please try again.");
            //     }
            // });

            this.extExportFilter = new sap.m.Dialog({
                type: DialogType.Message,
                title: "Create",
                contentWidth: "25%",
                content: [
                    new Label({ text: "Month", labelFor: "Month" }),
                    new sap.m.DatePicker("Month", {
                        required: true,
                        displayFormat: "MM",
                    }),
                    new Label({ text: "Year", labelFor: "Year" }),
                    new sap.m.DatePicker("Year", {
                        required: true,
                        displayFormat: "YYYY",
                    }),
                    new Label({ text: "ARA Period closing date", labelFor: "ARA Period closing date" }),
                    new sap.m.DatePicker("ARA_Period_closing_date", {
                        required: true
                    }),
                    new Label({ text: "GST App Period closing date", labelFor: "GST App Period closing date" }),
                    new sap.m.DatePicker("GST_App_Period_closing_date", {
                        required: true
                    }),
                    new Label({ text: "GST App Processing period", labelFor: "GST App Processing period" }),
                    new sap.m.Input("GST_App_Processing_period", {
                        width: "100%",
                        required: true,
                        type: "Text"
                    }),
                    // new Label({ text: "IS Closed", labelFor: "IS Closed" }),
                    // new sap.m.CheckBox("IS_Closed", {
                    //     text: 'IS Closed',
                    // }),
                    // new Label({ text: "Closed By", labelFor: "Closed By" }),
                    // new Input("Closed_By", {
                    //     width: "100%",
                    //     required: true,
                    //     type: "Text"
                    // }),

                        

                    //     select: function (oEvent) {
                    //         const selected = oEvent.getParameters().selected;
                    //         if (selected) {
                    //             Core.byId("exportRange").setVisible(true);
                    //             Core.byId("exportRangeLabel").setVisible(true);
                    //         } else {
                    //             Core.byId("exportRange").setVisible(false);
                    //             Core.byId("exportRangeLabel").setVisible(false);
                    //         }
                    //     }
                    // }),

                    // new Label("exportRangeLabel", { text: "Excel Export per Sheet", labelFor: "exportRange", visible: false }),
                    // new Input("exportRange", {
                    //     width: "100%",
                    //     required: true,
                    //     visible: false,
                    //     type: "Number",
                    //     placeholder: 'Enter a range from 1 - 100,000',
                    //     liveChange: function (oEvent) {
                    //         let selValue = oEvent.getParameters().value;
                    //         if (selValue > 100000) {
                    //             Core.byId("exportRange").setValueState("Error").setValueStateText("Entered value must be 100,000 or less");
                    //         } else {
                    //             Core.byId("exportRange").setValueState("None");
                    //         }
                    //     }
                    // }),
                ],
                beginButton: new Button("ccApproveButton", {
                    type: ButtonType.Emphasized,
                    text: "Create",
                    enabled: true,
                    press: function () {
                        const Month = Core.byId("Month").getValue(),
                         Year = Core.byId("Year").getValue(),
                         ARA_Period_closing_date = Core.byId("ARA_Period_closing_date").getValue(),
                         GST_App_Period_closing_date = Core.byId("GST_App_Period_closing_date").getValue(),
                         GST_App_Processing_period = Core.byId("GST_App_Processing_period").getValue();
                        //  IS_Closed = Core.byId("IS_Closed").getSelected();
                        //  Closed_By = Core.byId("Closed_By").getValue();
                        const dateObject = new Date(Month);
                        const month_format = dateObject.getMonth() + 1;
                        const year_format = dateObject.getFullYear();

                        Core.byId("Month").setValueState("None");
                        Core.byId("Year").setValueState("None");
                        Core.byId("ARA_Period_closing_date").setValueState("None");
                        Core.byId("GST_App_Period_closing_date").setValueState("None");
                        Core.byId("GST_App_Processing_period").setValueState("None");
                        // Core.byId("IS_Closed").setValueState("None");
                        // Core.byId("Closed_By").setValueState("None");



                        var validate = true;
                        if (!Month) { Core.byId("Month").setValueState("Error").setValueStateText("Month is required"); validate = false; };
                        if (!Year) { Core.byId("Year").setValueState("Error").setValueStateText("Year is required"); validate = false; };
                        if (!ARA_Period_closing_date) { Core.byId("ARA_Period_closing_date").setValueState("Error").setValueStateText("ARA Period closing date is required"); validate = false; };
                        if (!GST_App_Period_closing_date) { Core.byId("GST_App_Period_closing_date").setValueState("Error").setValueStateText("GST App Period closing date is required"); validate = false; };
                        if (!GST_App_Processing_period) { Core.byId("GST_App_Processing_period").setValueState("Error").setValueStateText("GST App Processing period"); validate = false; };
                        // if (!docType) { Core.byId("DocType").setValueState("Error").setValueStateText("Document Type is required"); validate = false; }
                        // if (isMultiple && !exportRange) {
                        //     Core.byId("exportRange").setValueState("Error").setValueStateText("Excel Export Range is required"); validate = false;
                        // } else if (isMultiple && exportRange > 100000) {
                        //     Core.byId("exportRange").setValueState("Error").setValueStateText("Entered value must be 100,000 or less");
                        // }



                        if (ARA_Period_closing_date && GST_App_Period_closing_date) {
                            var startDate = Core.byId("ARA_Period_closing_date").getDateValue(),
                                endDate = Core.byId("GST_App_Period_closing_date").getDateValue();
                            var formattedStartDate = sap.ui.core.format.DateFormat.getDateInstance({pattern: "yyyy-MM-dd"}).format(startDate);
                            var formattedEndDate = sap.ui.core.format.DateFormat.getDateInstance({pattern: "yyyy-MM-dd"}).format(endDate);
                        }
                        var reqData = {
                            month: month_format,
                            year : year_format,
                            prdcldate :formattedStartDate,
                            gstprdclddt :formattedEndDate,
                            gstptocprd : GST_App_Processing_period,
                            // iscld: IS_Closed
                        }

                        if (validate) {
                            const serviceUrl = this.getModel().sServiceUrl;
                            var _self = this;
                            sap.ui.core.BusyIndicator.show();

                            // let fieldsToMap = oEvent.mAggregatedQueryOptions.$select;
                            // reqData.fieldsToMap = fieldsToMap;
                            jQuery.ajax({
                                url: serviceUrl + 'getCSRFToken()',
                                type: "GET",
                                headers: {
                                    "X-CSRF-Token": "fetch"
                                },
                                success: function (data, status, xhr) {
                                    jQuery.ajax({
                                        url: serviceUrl + "Create",
                                        type: "POST",
                                        data: JSON.stringify({ fields: JSON.stringify(reqData) }),
                                        contentType: "application/json",
                                        headers: {
                                            "X-CSRF-Token": xhr.getResponseHeader("X-CSRF-Token")
                                        },
                                        success: function (response, textStatus, jqXHR) {
                                            _self.extExportFilter.destroy();
                                            sap.ui.core.BusyIndicator.hide();
                                            if(response.value == 'Duplicates found.'){
                                                MessageBox.error(response.value);
                                            }else{
                                                MessageBox.success(response.value);
                                            }
                                            
                                            const ccTableId = sap.ui.getCore().byId("ns.aspfilterdates::ASPfilterdateList--fe::table::ASPfilterdate::LineItem-innerTable");
                                            ccTableId.getModel().refresh();
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
        },
        Edit: function (oContext, aSelectedContexts) {
            
            if (aSelectedContexts.length > 1) return MessageBox.warning("Kindly use one row for Edit");
            if (aSelectedContexts.length == 1) {
                const oSelDocument = aSelectedContexts[0].getObject();
                const month = oSelDocument.MONTH;
                const year = oSelDocument.YEAR;
                const ARA_Period_closing_date = oSelDocument.ARA_PERIOD_CLOSING_DATE;
                const GST_App_Period_closing_date = oSelDocument.GST_APP_PERIOD_CLOSING_DATE;
                const GST_App_Processing_period = oSelDocument.GST_APP_PROCESSING_PERIOD;
                const  IS_Closed = oSelDocument.ISCLOSED;

                if (IS_Closed == true) return MessageBox.warning("This Document is closed");

                this.extRequestForAmendment = new sap.m.Dialog({
                    type: DialogType.Message,
                    title: "New Request",
                    contentWidth: "20%",
                    content: [
                        new Label({ text: "Month", labelFor: "month" }),
                        new Input("month", {
                            width: "100%",
                            editable: false,
                            visible: true,
                            value: month,
                            change: function (oEvent) {
                            }.bind(this)
                        }),
                        new Label({ text: "Year", labelFor: "year" }),
                        new Input("year", {
                            width: "100%",
                            editable: false,
                            visible: true,
                            value: year,
                            change: function (oEvent) {
                            }.bind(this)
                        }),
                        new Label({ text: "ARA Period closing date", labelFor: "ARA Period closing date" }),
                        new sap.m.DatePicker("ARA_Period_closing_date", {
                            editable: true,
                            visible: true,
                            value: ARA_Period_closing_date,
                            required: true,
                            change: function (oEvent) {
                            }.bind(this)
                        }),
                        new Label({ text: "GST App Period closing date", labelFor: "GST App Period closing date" }),
                        new sap.m.DatePicker("GST_App_Period_closing_date", {
                            editable: true,
                            visible: true,
                            value: GST_App_Period_closing_date,
                            required: true,
                            change: function (oEvent) {
                            }.bind(this)
                        }),
                        new Label({ text: "GST App Processing period", labelFor: "GST App Processing period" }),
                        new sap.m.Input("GST_App_Processing_period", {
                            width: "100%",
                            editable: true,
                            visible: true,
                            value: GST_App_Processing_period,
                            required: true,
                            type: "Text",
                            change: function (oEvent) {
                            }.bind(this)
                            
                        }),
                     new sap.m.CheckBox("IS_Closed", {
                        text: 'IS Closed',
                    }),

                    ],
                    beginButton: new Button("ccApproveButton", {
                        type: ButtonType.Emphasized,
                        text: "Request",
                        enabled: true,
                        press: function () {
                            /**API call to request Amendment 
                             * invNo
                             * reqType
                             * newAddress
                             * gstinNumber
                             * reason
                            */

                            const Month = Core.byId("month").getValue(),
                            Year = Core.byId("year").getValue(),
                            ARA_Period_closing_date = Core.byId("ARA_Period_closing_date").getValue(),
                            GST_App_Period_closing_date = Core.byId("GST_App_Period_closing_date").getValue(),
                            GST_App_Processing_period = Core.byId("GST_App_Processing_period").getValue(),
                            IS_Closed = Core.byId("IS_Closed").getSelected();

                            // Core.byId("Month").setValueState("None");
                            // Core.byId("Year").setValueState("None");
                            // Core.byId("ARA_Period_closing_date").setValueState("None");
                            // Core.byId("GST_App_Period_closing_date").setValueState("None");
                            // Core.byId("GST_App_Processing_period").setValueState("None");
                            // Core.byId("IS_Closed").setValueState("None");

                         var validate = true;
                        if (!Month) { Core.byId("Month").setValueState("Error").setValueStateText("Month is required"); validate = false; };
                        if (!Year) { Core.byId("Year").setValueState("Error").setValueStateText("Year is required"); validate = false; };
                        if (!ARA_Period_closing_date) { Core.byId("ARA_Period_closing_date").setValueState("Error").setValueStateText("ARA Period closing date is required"); validate = false; };
                        if (!GST_App_Period_closing_date) { Core.byId("GST_App_Period_closing_date").setValueState("Error").setValueStateText("GST App Period closing date is required"); validate = false; };
                        if (!GST_App_Processing_period) { Core.byId("GST_App_Processing_period").setValueState("Error").setValueStateText("GST App Processing period"); validate = false; };
    
                        if (ARA_Period_closing_date && GST_App_Period_closing_date) {
                            var startDate = Core.byId("ARA_Period_closing_date").getDateValue(),
                                endDate = Core.byId("GST_App_Period_closing_date").getDateValue();
                            var formattedStartDate = sap.ui.core.format.DateFormat.getDateInstance({pattern: "yyyy-MM-dd"}).format(startDate);
                            var formattedEndDate = sap.ui.core.format.DateFormat.getDateInstance({pattern: "yyyy-MM-dd"}).format(endDate);
                        }
                        var reqData = {
                            month: Month,
                            year : Year,
                            prdcldate :formattedStartDate,
                            gstprdclddt :formattedEndDate,
                            gstptocprd : GST_App_Processing_period,
                            iscld: IS_Closed
                        }

                        if (validate) {
                            const serviceUrl = this.getModel().sServiceUrl;
                            var _self = this;
                            sap.ui.core.BusyIndicator.show();

                            // let fieldsToMap = oEvent.mAggregatedQueryOptions.$select;
                            // reqData.fieldsToMap = fieldsToMap;
                            jQuery.ajax({
                                url: serviceUrl + 'getCSRFToken()',
                                type: "GET",
                                headers: {
                                    "X-CSRF-Token": "fetch"
                                },
                                success: function (data, status, xhr) {
                                    jQuery.ajax({
                                        url: serviceUrl + "Edit",
                                        type: "POST",
                                        data: JSON.stringify({ fields: JSON.stringify(reqData) }),
                                        contentType: "application/json",
                                        headers: {
                                            "X-CSRF-Token": xhr.getResponseHeader("X-CSRF-Token")
                                        },
                                        success: function (response, textStatus, jqXHR) {
                                            _self.extRequestForAmendment.destroy();
                                            sap.ui.core.BusyIndicator.hide();
                                            MessageBox.success(response.value);
                                            const ccTableId = sap.ui.getCore().byId("ns.aspfilterdates::ASPfilterdateList--fe::table::ASPfilterdate::LineItem-innerTable");
                                            ccTableId.getModel().refresh();
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
                                this.extRequestForAmendment.destroy();
                            }.bind(this)
                        }
                    )
                });
                this.extRequestForAmendment.open();
            }

        },
    }
});