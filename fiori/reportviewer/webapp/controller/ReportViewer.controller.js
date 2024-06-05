sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Core",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/Select",
    "sap/m/MultiComboBox",
    "sap/m/MessageToast",
    "sap/m/Text",
    "sap/ui/core/format/DateFormat",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Core, MessageBox, Dialog, DialogType, Button, ButtonType, Label, Input, Select, MultiComboBox, MessageToast, Text, DateFormat, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("ns.reportviewer.controller.ReportViewer", {
            onInit: function () {
                this.SendRequest = this.getOwnerComponent().SendRequest;

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("RouteReportViewer").attachPatternMatched(this._routeMatched, this);

                this.oModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(this.oModel);

                this.reportViewer = new sap.ui.model.json.JSONModel();
                this.getView().setModel(this.reportViewer, "reportViewer");

                this.filterModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(this.filterModel, "filterModel");

            },

            _routeMatched: function () {
                // sap.ui.core.BusyIndicator.show();
                /** get Service URL */
                const mObj = this.getOwnerComponent().getManifestObject();
                if (mObj._oBaseUri._string.includes("port4004")) {
                    this.sURL = mObj._oBaseUri._string.split('/reportviewer')[0] + '/'
                } else {
                    this.sURL = mObj._oBaseUri._parts.path
                }

                this._getConfigData();
            },

            /** Get Config Data */

            _getConfigData: function () {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                this.getView().getModel().setProperty("/toggleEdit", true);
                jQuery.ajax({
                    url: _self.sURL + "fileViewer/getReportDetails()",
                    type: "GET",
                    contentType: "application/json",
                    success: function (response, textStatus, jqXHR) {
                        if (response) {
                            if (response?.value) {
                                const resData = response.value.data;
                                _self.reportViewer.setData(resData.reportDetails);
                                _self.filterModel.setData(resData.filters);
                                _self.filterModel.setSizeLimit(10000);
                                _self.byId("tbl_reportViewer").setVisible(true);
                                sap.ui.core.BusyIndicator.hide();
                            }
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error("Something went wrong. Please try again");
                    },
                });
            },

            onSearch: function (oEvent) {

                this.oFilterBar = this.getView().byId("filterbar");

                var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                    var oControl = oFilterGroupItem.getControl(),
                        aSelectedKey,
                        aFilters;

                    if (oControl.sId.includes("dp_reqDateTime")) {
                        aSelectedKey = oControl.getValue();
                    } else {
                        aSelectedKey = oControl?.getSelectedKey();
                    }

                    aFilters =
                        new Filter({
                            path: oFilterGroupItem.getName(),
                            operator: FilterOperator.Contains,
                            value1: aSelectedKey
                        });

                    aResult.push(new Filter({
                        filters: [aFilters],
                        and: false
                    }));

                    return aResult;
                }, []);


                this.byId("tbl_reportViewer").getBinding("rows").filter(aTableFilters);
                this.byId("tbl_reportViewer").setShowOverlay(false);
            },

            onClear: function () {
                this.byId("sel_jobName").setSelectedKey("");
                this.byId("sel_fileName").setSelectedKey("");
                this.byId("sel_status").setSelectedKey("");
                this.byId("dp_reqDateTime").setValue("");
                // this.byId("tbl_reportViewer").setShowOverlay(true);
            },

            onChangeFilter: function () {
                this.byId("tbl_reportViewer").setShowOverlay(true);
            },

            onDownloadReport: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                const oRow = oEvent.getParameters().row;
                const oBindingContext = oRow.getBindingContext("reportViewer");
                const selObject = oBindingContext.getObject();
                const ID = selObject.ID;

                var _self = this;
                const reqPayload = {
                    ID: ID
                }

                jQuery.ajax({
                    url: _self.sURL + `fileViewer/ReportDownloader(ID='${ID}')`,
                    type: "GET",
                    contentType: "application/json",
                    success: function (response, textStatus, jqXHR) {
                        if (response) {
                            let data = response?.value?.data;
                            if (data) {
                                // const base64Data = "data:application/zip;base64," + data.file;
                                const link = document.createElement('a');
                                link.href = data.endpoint;
                                link.download = 'Exhaustive Report';
                                link.click();
                                _self._getConfigData();
                            }
                        }
                        sap.ui.core.BusyIndicator.hide();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        MessageBox.error("Something went wrong. Please try again");
                        sap.ui.core.BusyIndicator.hide();
                    },
                });

            },

            onPressDeleteSignatory: function (oEvent) {
                var index = oEvent.getParameter("row").getIndex();
                var oTable = this.getView().byId("tbl_invoiceSignatory");
                var _self = this;
                MessageBox.confirm("Are you sure you want to delete this item?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            var model = oTable.getModel("signatoryModel");
                            var data = model.getData();
                            data.splice(index, 1);
                            model.setData(data);
                            _self.signatoryModel.refresh();
                        }
                    }
                });
            },

            formatDate: function (oDateStr) {
                if (oDateStr) {
                    // Convert the string to a Date object
                    var oDate = new Date(oDateStr);

                    // Convert to IST (UTC+5:30)
                    var istOffset = 5 * 60 + 30; // Offset in minutes
                    oDate.setMinutes(oDate.getMinutes() + istOffset);

                    // Format the date in the desired pattern
                    var oDateFormat = DateFormat.getDateTimeInstance({
                        pattern: "dd-MM-yyyy HH:mm:ss"
                    });

                    return oDateFormat.format(oDate);
                } else {
                    return "";
                }
            },


            setStatusState: function (sValue) {
                if (sValue) {
                    if (sValue === "Completed") {
                        return "Success";
                    } else if (sValue === "Error") {
                        return "Error";
                    } else if (sValue === "In-Progress") {
                        return "Information"
                    } else if (sValue === "Pending") {
                        return "Warning"
                    }
                }
            },

            setStatusIcon: function (sValue) {
                if (sValue) {
                    if (sValue === "Completed") {
                        return "sap-icon://sys-enter-2";
                    } else if (sValue === "Information") {
                        return "sap-icon://sys-enter-2"
                    } else if (sValue === "Pending") {
                        return "sap-icon://sys-enter-2"
                    } else if (sValue === "Error") {
                        return "sap-icon://sys-cancel"
                    }
                }
            }
        });
    });

function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}
