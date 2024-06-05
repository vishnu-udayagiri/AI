sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/ui/model/json/JSONModel",
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/Text",
    "sap/m/MessageBox"
], function (Controller, Dialog, Button, JSONModel, Table, Column, ColumnListItem, Text, MessageBox) {
    "use strict";

    return {

        Coupon: function (oContext, aSelectedContexts) {
            if (aSelectedContexts.length !== 1) {
                MessageBox.warning("Kindly Select one row");
                return;
            }

            const oSelDocument = aSelectedContexts[0].getObject();
            const docno = oSelDocument.PrimaryDocumentNbr;
            const serviceUrl = this.getModel().sServiceUrl;
            var _self = this;
            jQuery.ajax({
                url: serviceUrl + 'getCSRFToken()',
                type: "GET",
                headers: {
                    "X-CSRF-Token": "fetch"
                },
                success: (data, status, xhr) => {
                    jQuery.ajax({
                        url: serviceUrl + "Coupon",
                        type: "POST",
                        data: JSON.stringify({ fields: docno }),
                        contentType: "application/json",
                        headers: {
                            "X-CSRF-Token": xhr.getResponseHeader("X-CSRF-Token")
                        },
                        success: (response, textStatus, jqXHR) => {
                            var couponData = response.value.data;
                            // Open dialog
                            _self.oDialog = new Dialog({
                                title: "Please select the starting point of your Inward Journey",
                                contentWidth: "50%",
                                beginButton: new Button({
                                    text: "Submit",
                                    press: function () {
                                        var oTable = sap.ui.getCore().byId("tableSelect");
                                        var oSelectedItem = oTable.getSelectedItem();
                                        if (oSelectedItem) {
                                            sap.ui.core.BusyIndicator.show();
                                            
                                            var oBindingContext = oSelectedItem.getBindingContext();
                                            var selectedNumber = oBindingContext.getProperty("NUMBER");
                                            var selectedNumber = selectedNumber.toString();

                                            // Check if the selected number is 1
                                            if (selectedNumber === "1") {
                                                sap.ui.core.BusyIndicator.hide();
                                            
                                                MessageBox.warning("You cannot mark journey 1 as your inward journey starting point");
                                                return;
                                            }

                                            sap.ui.core.BusyIndicator.show();
                                            var selectedPrimaryDocNumber = oBindingContext.getProperty("PRIMARYDOCUMENTNBR");
                                            var _self = this;
                                            // Process selected values
                                            console.log("Selected Number:", selectedNumber);
                                            console.log("Selected Primary Document Number:", selectedPrimaryDocNumber);
                                            jQuery.ajax({
                                                url: serviceUrl + "InwardIndicator",
                                                type: "POST",
                                                data: JSON.stringify({ Number: selectedNumber, PrimaryDocumentNbr: selectedPrimaryDocNumber }),
                                                contentType: "application/json",
                                                headers: {
                                                    "X-CSRF-Token": xhr.getResponseHeader("X-CSRF-Token")
                                                },
                                                success: (response, textStatus, jqXHR) => {
                                                    if (response.value.status == 400) {
                                                        MessageBox.error(response.value.message);
                                                        sap.ui.core.BusyIndicator.hide();
                                                    } else {
                                                        _self.oDialog.destroy();
                                                        MessageBox.success(response.value.message);
                                                        sap.ui.core.BusyIndicator.hide();

                                                        const ccTableId = sap.ui.getCore().byId("ns.sectorfare::SectorFareList--fe::table::SectorFare::LineItem-innerTable");
                                                        ccTableId.getModel().refresh();
                                                    }
                                                },
                                                error: (jqXHR, textStatus, errorThrown) => {
                                                    const message = jqXHR.responseJSON?.error?.message;
                                                    if (message) {
                                                        MessageBox.error(message);
                                                    }
                                                    sap.ui.core.BusyIndicator.hide();
                                                },
                                            });

                                            // Close dialog
                                            var oDialog = sap.ui.getCore().byId("tableSelectDialog");
                                            if (oDialog) {
                                                oDialog.destroy();
                                            }
                                        } else {
                                            MessageBox.warning("Please select your inward journey starting point");
                                        }
                                    }.bind(_self)
                                }),
                                endButton: new Button({
                                    text: "Cancel",
                                    press: function () {
                                        _self.oDialog.destroy();
                                    }.bind(_self)
                                })
                            });

                            var oTable = new Table("tableSelect", { // Assigning ID "tableSelect" to the table
                                mode: "SingleSelectMaster",
                                columns: [
                                    new Column({ header: new Text({ text: "Primary Document Number" }) }),
                                    new Column({ header: new Text({ text: "Number" }) }),
                                    new Column({ header: new Text({ text: "Original Airport" }) }),
                                    new Column({ header: new Text({ text: "Destination Airport" }) })
                                ]
                            });

                            var oModel = new JSONModel({
                                data: couponData
                            });
                            oTable.setModel(oModel);
                            oTable.bindItems("/data", new ColumnListItem({
                                cells: [
                                    new Text({ text: "{PRIMARYDOCUMENTNBR}" }),
                                    new Text({ text: "{NUMBER}" }),
                                    new Text({ text: "{ORIGINAIRPORT}" }),
                                    new Text({ text: "{DESTINATIONAIRPORT}" })
                                ]
                            }));

                            _self.oDialog.addContent(oTable);
                            _self.oDialog.open();
                        },
                        error: (jqXHR, textStatus, errorThrown) => {
                            const message = jqXHR.responseJSON?.error?.message;
                            if (message) {
                                MessageBox.error(message);
                            }
                            sap.ui.core.BusyIndicator.hide();
                        },
                    });
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    const message = jqXHR.responseJSON?.error?.message;
                    if (message) {
                        MessageBox.error(message);
                    }
                    sap.ui.core.BusyIndicator.hide();
                },
            });
        },
    };
});
