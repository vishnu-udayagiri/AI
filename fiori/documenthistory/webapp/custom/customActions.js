sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (MessageToast, MessageBox) {
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
        }
    }
});