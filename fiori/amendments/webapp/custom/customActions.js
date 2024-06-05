sap.ui.define([
    "sap/ui/core/mvc/Controller", "sap/ui/core/Core", "sap/m/Dialog", "sap/m/DialogType", "sap/m/Button", "sap/m/ButtonType",
    "sap/m/Label", "sap/m/Input", "sap/m/Select", "sap/m/MultiComboBox", "sap/m/MessageToast", "sap/m/Text",
    "sap/m/TextArea", "sap/m/ComboBox", "sap/m/MessageBox", "sap/m/CheckBox", "sap/ui/model/json/JSONModel", "sap/ui/table/Table"
], function (Controller, Core, Dialog, DialogType, Button, ButtonType,
    Label, Input, Select, MultiComboBox, MessageToast, Text,
    TextArea, ComboBox, MessageBox, CheckBox, JSONModel, Table) {
    "use strict";
    return {

        downloadInvoice: function (oContext, aSelectedContexts) {
            sap.ui.core.BusyIndicator.show();
            let arrInvoices = [];
            const aSelectedInvoices = aSelectedContexts;
            aSelectedInvoices.forEach(invoice => {
                const oObject = invoice.getObject();
                arrInvoices.push({ "ID": oObject.ID });
            });
            var aSelectedCount = aSelectedInvoices.length;
            let serviceUrl = this.getModel().sServiceUrl;
            jQuery.ajax({
                url: serviceUrl + 'getCSRFToken()',
                type: "GET",
                headers: {
                    "X-CSRF-Token": "fetch"
                },
                success: function (data, status, xhr) {
                    jQuery.ajax({
                        url: serviceUrl + "downloadInvoice",
                        type: "POST",
                        data: JSON.stringify({ invoices: arrInvoices }),
                        contentType: "application/json",
                        headers: {
                            "X-CSRF-Token": xhr.getResponseHeader("X-CSRF-Token")
                        },
                        success: function (response, textStatus, jqXHR) {
                            const invoices = JSON.parse(response.value);
                            if (aSelectedCount > 1) {

                                const base64Data = "data:application/zip;base64," + invoices.invoice;
                                const link = document.createElement('a');
                                link.href = base64Data;
                                link.download = `Documents`;
                                link.click();

                                if (invoices?.notGenerated?.length > 0) {
                                    const generatedString = invoices?.notGenerated.join(', ');
                                    sap.m.MessageBox.warning("List of documents pending for generating PDF.\nPlease try individual downloading for the following..", {
                                        title: "Download status",
                                        id: "messageBoxId1",
                                        details: generatedString,
                                        contentWidth: "100px"
                                    });
                                }
                            } else {
                                if (invoices.length > 0) {
                                    invoices.forEach(element => {
                                        const base64Data = "data:application/pdf;base64," + element.invoice;
                                        const link = document.createElement('a');
                                        link.href = base64Data;
                                        if (element.invoiceNumber) {
                                            link.download = `Document - ${element.invoiceNumber}`;
                                        } else {
                                            link.download = `Document`;
                                        }
                                        link.click();
                                    });
                                }
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
        },
        previewDocument: function (oContext, aSelectedContexts) {
            sap.ui.core.BusyIndicator.show();
            let arrInvoices = [];
            const aSelectedInvoices = aSelectedContexts;
            aSelectedInvoices.forEach(invoice => {
                const oObject = invoice.getObject();
                arrInvoices.push({ "ID": oObject.ID });
            });

            var aSelectedCount = aSelectedInvoices.length;
            const serviceUrl = this.getModel().sServiceUrl;
            jQuery.ajax({
                url: serviceUrl + 'getCSRFToken()',
                type: "GET",
                headers: {
                    "X-CSRF-Token": "fetch"
                },
                success: function (data, status, xhr) {
                    jQuery.ajax({
                        url: serviceUrl + "downloadInvoice",
                        type: "POST",
                        data: JSON.stringify({ invoices: arrInvoices }),
                        contentType: "application/json",
                        headers: {
                            "X-CSRF-Token": xhr.getResponseHeader("X-CSRF-Token")
                        },
                        success: function (response, textStatus, jqXHR) {
                            debugger;
                            sap.ui.core.BusyIndicator.hide();
                            const invoices = JSON.parse(response.value);
                            if (aSelectedCount > 1) {
                                debugger;

                                const base64Data = "data:application/zip;base64," + invoices.invoice;
                                const title = "Invoice - "+ invoices.invoiceNumber;
                               

                            sap.m.MessageBox.warning("Please select only one document for preview, For multiple documents you can download all invoice as a Zip file.", {
                                        title: "Warning",
                                        id: "messageBoxId1",
                                        contentWidth: "100px"
                                    });
                                
                            } else {
                                if (invoices.length > 0) {
                                    invoices.forEach(element => {
                                        const base64Data = "data:application/pdf;base64," + element.invoice;
                                        const title = "Invoice - "+ element.invoiceNumber;
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
                                            sap.m.MessageBox.warning(title + "");
                                        }
                                        // const link = document.createElement('a');
                                        // link.href = base64Data;
                                        // if (element.invoiceNumber) {
                                        //     link.download = `Document - ${element.invoiceNumber}`;
                                        // } else {
                                        //     link.download = `Document`;
                                        // }
                                        // link.click();
                                    });
                                }
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

        approveAmendment: function (oContext, aSelectedContexts) {
            sap.ui.core.BusyIndicator.show();
            let arrInvoices = [];
            const aSelectedInvoices = aSelectedContexts;
            aSelectedInvoices.forEach(invoice => {
                const oObject = invoice.getObject();
                arrInvoices.push({ "ID": oObject.ID });
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
                        url: serviceUrl + "approveAmendment",
                        type: "POST",
                        data: JSON.stringify({ invoices: arrInvoices }),
                        contentType: "application/json",
                        headers: {
                            "X-CSRF-Token": xhr.getResponseHeader("X-CSRF-Token")
                        },
                        success: function (response, textStatus, jqXHR) {
                            debugger;
                            const res = response.value;
                            if(Object.keys(res.msg).length > 0){
                                MessageBox.success(res.msg);
                            }
                            if(Object.keys(res.info).length > 0){
                                MessageBox.information(res.info);
                            }  
                            const ccTableId = sap.ui.getCore().byId("ns.amendments::InvoiceList--fe::table::Invoice::LineItem-innerTable");
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

        rejectAmendment: function (oContext, aSelectedContexts) {
            this.extRejectAmendment = new sap.m.Dialog({
                type: DialogType.Message,
                title: "Reject Amendment",
                contentWidth: "20%",
                content: [
                    new Label({ text: "Reason for Rejection", labelFor: "reason" }),
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
                    text: "Reject",
                    enabled: true,
                    press: function () {

                        const reason = Core.byId("reason").getValue();
                        const validate = true;

                        if (!reason) { Core.byId("reason").setValueState("Error").setValueStateText("Reason type is required"); validate = false; }
                        let arrInvoices = [];
                        const aSelectedInvoices = aSelectedContexts;
                        aSelectedInvoices.forEach(invoice => {
                            const oObject = invoice.getObject();
                            arrInvoices.push({ "ID": oObject.ID });
                        });

                        if (validate) {
                            var _self = this;
                            sap.ui.core.BusyIndicator.show();
                            let arrInvoices = [];
                            const aSelectedInvoices = aSelectedContexts;
                            aSelectedInvoices.forEach(invoice => {
                                const oObject = invoice.getObject();
                                arrInvoices.push({ "ID": oObject.ID });
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
                                        url: serviceUrl + "rejectAmendment",
                                        type: "POST",
                                        data: JSON.stringify({ invoices: arrInvoices, reason: reason }),
                                        contentType: "application/json",
                                        headers: {
                                            "X-CSRF-Token": xhr.getResponseHeader("X-CSRF-Token")
                                        },
                                        success: function (response, textStatus, jqXHR) {
                                            debugger;
                                            MessageBox.success(response.value);
                                            const ccTableId = sap.ui.getCore().byId("ns.amendments::InvoiceList--fe::table::Invoice::LineItem-innerTable");
                                            ccTableId.getModel().refresh();
                                            _self.extRejectAmendment.destroy();
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
                            this.extRejectAmendment.destroy();
                        }.bind(this)
                    }
                )
            });
            this.extRejectAmendment.open();

            // // sap.ui.core.BusyIndicator.show();
            // let arrInvoices = [];
            // const aSelectedInvoices = aSelectedContexts;
            // aSelectedInvoices.forEach(invoice => {
            //     const oObject = invoice.getObject();
            //     arrInvoices.push({ "ID": oObject.ID });
            // });
            // let serviceUrl = this.getModel().sServiceUrl;
            // jQuery.ajax({
            //     url: serviceUrl + 'getCSRFToken()',
            //     type: "GET",
            //     headers: {
            //         "X-CSRF-Token": "fetch"
            //     },
            //     success: function (data, status, xhr) {
            //         jQuery.ajax({
            //             url: serviceUrl + "approveAmendment",
            //             type: "POST",
            //             data: JSON.stringify({ invoices: arrInvoices }),
            //             contentType: "application/json",
            //             headers: {
            //                 "X-CSRF-Token": xhr.getResponseHeader("X-CSRF-Token")
            //             },
            //             success: function (response, textStatus, jqXHR) {
            //                 debugger;
            //                 MessageBox.success(response.value.message);
            //                 const ccTableId = sap.ui.getCore().byId("ns.amendments::InvoiceList--fe::table::Invoice::LineItem-innerTable");
            //                 ccTableId.getModel().refresh();
            //                 sap.ui.core.BusyIndicator.hide();
            //             },
            //             error: function (jqXHR, textStatus, errorThrown) {
            //                 const message = jqXHR.responseJSON?.error?.message;
            //                 if (message) {
            //                     MessageBox.error(message);
            //                 }
            //                 sap.ui.core.BusyIndicator.hide();
            //             },
            //         });
            //     },
            //     error: function (jqXHR, textStatus, errorThrown) {
            //         const message = jqXHR.responseJSON?.error?.message;
            //         if (message) {
            //             MessageBox.error(message);
            //         }
            //         sap.ui.core.BusyIndicator.hide();
            //     },
            // });
        }

    }
});