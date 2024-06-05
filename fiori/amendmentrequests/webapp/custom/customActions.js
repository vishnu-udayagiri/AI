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
        /** Request Single Amendment */
        requestAmendment: function (oContext, aSelectedContexts) {
            if (aSelectedContexts.length == 0) return MessageBox.warning("Select an invoice for amendment");
            if (aSelectedContexts.length > 1) return MessageBox.warning("Kindly use Excel Upload option for the amendment of more than one invoice!");
            if (aSelectedContexts.length == 1) {
                const oSelDocument = aSelectedContexts[0].getObject();
                const invoiceNumber = oSelDocument.invoiceNumber;
                const documentType = oSelDocument.documentType;
                const invoiceId = oSelDocument.ID;
                const passengerGSTIN = oSelDocument.passengerGSTIN;
                var removeGSTINItem;
                var addGSTIN;
   
                if (!invoiceNumber) return MessageBox.warning("Select an invoice with invoice number");
                let canAddressAmendment = false;
                if (documentType == 'INVOICE') {
                    canAddressAmendment = true;
                } else {
                    canAddressAmendment = false;
                }
                if (documentType == 'INVOICE') {
                    addGSTIN = new sap.ui.core.ListItem({ key: 'CHANGE GSTIN', text: 'Change / Add GSTIN', additionalText: '', enabled: canAddressAmendment })
                }
                if (passengerGSTIN && documentType == 'INVOICE') {
                    removeGSTINItem = new sap.ui.core.ListItem({ key: 'REMOVE GSTIN', text: 'Remove GSTIN', additionalText: '', enabled: true })
                   } 
                this.extRequestForAmendment = new sap.m.Dialog({
                    type: DialogType.Message,
                    title: "New Request",
                    contentWidth: "20%",
                    content: [
                        new Label({ text: "Invoice Number", labelFor: "invNo" }),
                        new Input("invNo", {
                            width: "100%",
                            editable: false,
                            visible: true,
                            value: invoiceNumber,
                            change: function (oEvent) {
                            }.bind(this)
                        }),
                        new Label({ text: "Request Type", labelFor: "reqType" }),
                        new Select("reqType", {
                            width: "100%",
                            showSecondaryValues: true,
                            forceSelection: false,
                            visible: true,
                            required: true,
                            items: [
                                removeGSTINItem,
                                addGSTIN,
                                new sap.ui.core.ListItem({ key: 'CHANGE ADDRESS', text: 'Change Address', additionalText: '' })
                            ],
                            change: function (oEvent) {

                                Core.byId("newAddress").setValue("");
                                Core.byId("gstinNumber").setValue("");

                                /**toggle fields Based on Request Type */
                                if (oEvent.getSource().getSelectedKey() == 'REMOVE GSTIN') {
                                    Core.byId("lblNewAddress").setVisible(true);
                                    Core.byId("newAddress").setVisible(true);
                                    Core.byId("lblGSTINNo").setVisible(false);
                                    Core.byId("gstinNumber").setVisible(false);
                                } else if (oEvent.getSource().getSelectedKey() == 'CHANGE GSTIN') {
                                    Core.byId("lblNewAddress").setVisible(false);
                                    Core.byId("newAddress").setVisible(false);
                                    Core.byId("gstinNumber").setVisible(true);
                                    Core.byId("lblGSTINNo").setVisible(true);
                                } else {
                                    Core.byId("lblNewAddress").setVisible(true);
                                    Core.byId("newAddress").setVisible(true);
                                    Core.byId("gstinNumber").setVisible(false);
                                    Core.byId("lblGSTINNo").setVisible(false);
                                }
                                Core.byId("lblReason").setVisible(true);
                                Core.byId("reason").setVisible(true);
                            }
                        }),
                        new Label("lblNewAddress", { text: "New address", labelFor: "newAddress", visible: false }),
                        new TextArea("newAddress", {
                            width: "100%",
                            maxLength: 255,
                            visible: false
                        }),
                        new Label("lblGSTINNo", { text: "New GSTIN", labelFor: "gstinNumber", visible: false, required: true }),
                        new Input("gstinNumber", {
                            width: "100%",
                            maxLength: 15,
                            placeholder: "Enter GSTIN..",
                            visible: false,
                            change: function (oEvent) {
                                /**GSTIN Format validation */
                            }.bind(this)
                        }),
                        new Label("lblReason", { text: "Reason", labelFor: "reason", visible: false, required: true }),
                        new Input("reason", {
                            width: "100%",
                            editable: true,
                            visible: false,
                            placeholder: 'Reason for requesting Amendment',
                            change: function (oEvent) {
                            }.bind(this)
                        })
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
                            const invNo = Core.byId("invNo").getValue(),
                                reqType = Core.byId("reqType").getSelectedKey(false),
                                newAddress = Core.byId("newAddress").getValue(false),
                                gstinNumber = Core.byId("gstinNumber").getValue(false),
                                reason = Core.byId("reason").getValue(false);

                            Core.byId("reqType").setValueState("None");
                            Core.byId("invNo").setValueState("None");
                            Core.byId("newAddress").setValueState("None");
                            Core.byId("gstinNumber").setValueState("None");
                            Core.byId("reason").setValueState("None");

                            var validate = true;
                            if (!reqType) { Core.byId("reqType").setValueState("Error").setValueStateText("Request type is required"); validate = false; }
                            if (!invNo) { Core.byId("invNo").setValueState("Error").setValueStateText("Invoice Number is required"); validate = false; }
                            if (!reason) { Core.byId("reason").setValueState("Error").setValueStateText("Reason is required"); validate = false; }

                            var reqData = {
                                reqType: reqType,
                                invNo: invNo,
                                invoiceId: invoiceId,
                                reason: reason,
                                newAddress: newAddress
                            }

                            if (reqType == 'REMOVE GSTIN') {
                                // if (!newAddress) {
                                //     Core.byId("newAddress").setValueState("Error").setValueStateText("New Address is required");
                                //     validate = false;
                                // } else {
                                //     reqData.newAddress = newAddress;
                                // }
                            } else if (reqType == 'CHANGE GSTIN') {
                                if (!gstinNumber) {
                                    Core.byId("gstinNumber").setValueState("Error").setValueStateText("GSTIN number is required"); validate = false;
                                } else {
                                    if (gstinNumber.length != 15) {
                                        Core.byId("gstinNumber").setValueState("Error").setValueStateText("Invalid GSTIN number");
                                        validate = false
                                    } else {
                                        reqData.gstinNumber = gstinNumber;
                                    }
                                }
                            } else {
                                // if (!newAddress) {
                                //     Core.byId("newAddress").setValueState("Error").setValueStateText("New Address is required");
                                //     validate = false
                                // } else {
                                //     reqData.gstinNumber = gstinNumber;
                                // }
                            }
                            if (validate) {
                                const serviceUrl = this.getModel().sServiceUrl;
                                var _self = this;
                                sap.ui.core.BusyIndicator.show();
                                jQuery.ajax({
                                    url: serviceUrl + 'getCSRFToken()',
                                    type: "GET",
                                    headers: {
                                        "X-CSRF-Token": "fetch"
                                    },
                                    success: function (data, status, xhr) {
                                        jQuery.ajax({
                                            url: serviceUrl + "requestAmendment",
                                            type: "POST",
                                            data: JSON.stringify({ ...reqData }),
                                            contentType: "application/json",
                                            headers: {
                                                "X-CSRF-Token": xhr.getResponseHeader("X-CSRF-Token")
                                            },
                                            success: function (response, textStatus, jqXHR) {
                                                if (response.value.status == 400) {
                                                    MessageBox.error(response.value.message);
                                                } else {
                                                    MessageBox.success(response.value.message);
                                                    _self.extRequestForAmendment.destroy();
                                                    const ccTableId = sap.ui.getCore().byId("ns.amendmentrequests::InvoiceList--fe::table::Invoice::LineItem-innerTable");
                                                    ccTableId.getModel().refresh();
                                                }
                                                sap.ui.core.BusyIndicator.hide();
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
        /** Request Bulk Amendment ==> Excel Upload */
        requestBulkAmendment: function (oContext, aSelectedContexts) {
            this.extRequestForBulkAmendment = new sap.m.Dialog({
                type: DialogType.Message,
                title: "New Request",
                contentWidth: "20%",
                content: [
                    new sap.ui.unified.FileUploader("fileUploader", {
                        tooltip: "Browse...",
                        fileType: "xls,xlsx",
                        width: "100%",
                        iconOnly: true,
                        sameFilenameAllowed: true,
                        icon: "sap-icon://attachment"
                    })
                ],
                buttons: [
                    new Button("downloadExcel", {
                        type: ButtonType.Emphasized,
                        enabled: true,
                        iconOnly: true,
                        tooltip: 'Download Excel..',
                        icon: 'sap-icon://download',
                        press: function () {
                            sap.ui.core.BusyIndicator.show();
                            const serviceUrl = this.getModel().sServiceUrl;
                            jQuery.ajax({
                                url: serviceUrl + 'downloadExcel()',
                                type: "GET",
                                success: function (data, status, xhr) {
                                    const base64Data = data.value;
                                    const base64Excel = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + base64Data;
                                    const link = document.createElement('a');
                                    link.href = base64Excel;
                                    link.download = "Request for amendments";
                                    link.click();
                                    sap.ui.core.BusyIndicator.hide();
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    const message = jqXHR.responseJSON?.error?.message;
                                    if (message) {
                                        MessageBox.error(message);
                                    }
                                    sap.ui.core.BusyIndicator.hide();
                                },
                            });
                        }.bind(this)
                    }),

                    new Button("uploadExcel", {
                        type: ButtonType.Emphasized,
                        text: "Upload",
                        icon: 'sap-icon://upload',
                        enabled: true,
                        press: function () {

                            const fileUpload = Core.byId("fileUploader");
                            const file = fileUpload.getDomRef("fu").files[0];

                            if (file == 'undefined' || file == null || file == "") {
                                sap.ui.core.BusyIndicator.hide();
                                return MessageBox.error("Please Browse an excel file and try again");
                            } else {
                                const serviceUrl = this.getModel().sServiceUrl;
                                var _self = this;
                                sap.ui.core.BusyIndicator.show();
                                jQuery.ajax({
                                    url: serviceUrl + 'getCSRFToken()',
                                    type: "GET",
                                    headers: {
                                        "X-CSRF-Token": "fetch"
                                    },
                                    success: function (data, status, xhr) {
                                        create_blob(file, function (blob_string) {
                                            jQuery.ajax({
                                                url: serviceUrl + "requestBulkAmendment",
                                                type: "POST",
                                                data: JSON.stringify({ reqFile: blob_string }),
                                                contentType: "application/json",
                                                headers: {
                                                    "X-CSRF-Token": xhr.getResponseHeader("X-CSRF-Token")
                                                },
                                                success: function (data, textStatus, jqXHR) {
                                                    const base64Data = data.value;
                                                    const base64Excel = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + base64Data;
                                                    const link = document.createElement('a');
                                                    link.href = base64Excel;
                                                    link.download = "Requested Amendments report";
                                                    link.click();

                                                    _self.extRequestForBulkAmendment.destroy();

                                                    const ccTableId = sap.ui.getCore().byId("ns.amendmentrequests::InvoiceList--fe::table::Invoice::LineItem-innerTable");
                                                    ccTableId.getModel().refresh();
                                                    sap.ui.core.BusyIndicator.hide();
                                                },
                                                error: function (jqXHR, textStatus, errorThrown) {
                                                    const message = jqXHR.responseJSON?.error?.message;
                                                    if (message) {
                                                        MessageBox.error(message);
                                                    }
                                                    sap.ui.core.BusyIndicator.hide();
                                                },
                                            });
                                        });

                                        function create_blob(file, callback) {
                                            var reader = new FileReader();
                                            reader.onload = function () { callback(reader.result) };
                                            reader.readAsDataURL(file);
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
                        }.bind(this)
                    }),

                    new Button({
                        text: "Cancel",
                        press: function () {
                            this.extRequestForBulkAmendment.destroy();
                        }.bind(this)
                    })
                ],
                Button: new Button(
                    {
                        text: "Cancel",
                        press: function () {
                            this.extRequestForBulkAmendment.destroy();
                        }.bind(this)
                    }
                )
            });
            this.extRequestForBulkAmendment.open();
        },


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
                url: serviceUrl + 'valueListDocumentType',
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

                    new Label({ text: "Document Type", labelFor: "DocType" }),
                    new MultiComboBox("DocType", {
                        width: "100%",
                        forceSelection: false,
                        items: {
                            path: "documentTypeModel>/",
                            template: new sap.ui.core.ListItem(
                                { key: '{documentTypeModel>documentType}', text: '{documentTypeModel>documentType}' }
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

                    // new sap.m.CheckBox("isMultiple", {
                    //     text: 'Export as Multiple Sheets',
                    //     required: true,
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
                        debugger;
                        const dateRange = Core.byId("dateRange").getValue(),
                            docType = Core.byId("DocType").getSelectedKeys(),
                            // isMultiple = Core.byId("isMultiple").getSelected(),
                            exportRange = Core.byId("exportRange").getValue(),
                            JobName = Core.byId("JobName").getValue();

                        Core.byId("dateRange").setValueState("None");
                        Core.byId("DocType").setValueState("None");
                        // Core.byId("isMultiple").setValueState("None");
                        Core.byId("exportRange").setValueState("None");
                        Core.byId("JobName").setValueState("None");

                        var validate = true;
                        if (!dateRange) { Core.byId("dateRange").setValueState("Error").setValueStateText("Date Range is required"); validate = false; };
                        if (!JobName) { Core.byId("JobName").setValueState("Error").setValueStateText("Job Name is required"); validate = false; };

                        // if (!docType) { Core.byId("DocType").setValueState("Error").setValueStateText("Document Type is required"); validate = false; }
                        // if (isMultiple && !exportRange) {
                        //     Core.byId("exportRange").setValueState("Error").setValueStateText("Excel Export Range is required"); validate = false;
                        // } else if (isMultiple && exportRange > 100000) {
                        //     Core.byId("exportRange").setValueState("Error").setValueStateText("Entered value must be 100,000 or less");
                        // }



                        if (dateRange) {
                            var startDate = Core.byId("dateRange").getDateValue(),
                                endDate = Core.byId("dateRange").getSecondDateValue();
                        }
                        var reqData = {
                            from: startDate,
                            to: endDate,
                            documentType: docType,
                            JobName: JobName,
                            isMultiple: false,
                            range: exportRange
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