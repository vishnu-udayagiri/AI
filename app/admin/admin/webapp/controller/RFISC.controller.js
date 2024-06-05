sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (
    Controller,
    JSONModel,
    MessageBox,
    MessageToast
) {
    "use strict";

    return Controller.extend("admindashboard.controller.RFISC", {
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            //AJAX send Request
            this.SendRequest = this.getOwnerComponent().SendRequest;
            //i18n Resource Bundle 
            this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            //JSON Models
            this.rfiscListModel = new JSONModel();
            this.getView().setModel(this.rfiscListModel, "rfiscListModel");
            this.newRfiscListModel = new JSONModel({});
            this.getView().setModel(this.newRfiscListModel, "newRfiscListModel");

            // toggling
            this.configModel = new JSONModel();
            this.getView().setModel(this.configModel);

            this.getView().getModel().setProperty("/toggleEdit", false);

            this.oRouter.getRoute("RFISC").attachPatternMatched(this._handleRouteMatched, this);
        },
        /* get ID of Selected from route */
        _handleRouteMatched: function (oEvent) {
            // sap.ui.core.BusyIndicator.show();
            this.rfiscListModel.setData({});
            this.newRfiscListModel.setData({});
            this._refreshInputValidation();
            this._getRfisc();
        },
        _getRfisc: function () {
            this.onRefreshScreen();
            this.SendRequest(this, "/admin-api/master/RFISC", "GET", {}, null, (_self, data, message) => {
                _self.rfiscListModel.setData(data);
                sap.ui.core.BusyIndicator.hide();
            });
        },
        onCreateRfisc: function (oEvent) {
            if (this._handleInputValidation()) {
                const newrfiscData = this.newRfiscListModel.getData();
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/admin-api/master/RFISC", "POST", {}, JSON.stringify(newrfiscData), (_self, data, message) => {
                    _self._getRfisc();
                    MessageToast.show("RFISC Created");
                });
            }
        },
        onUpdateRfisc: function (oEvent) {
            const newrfiscData = this.newRfiscListModel.getData();
            const url = `/admin-api/master/RFISC(RFISC='${newrfiscData.RFISC}')`
            this.SendRequest(this, url, "PUT", {}, JSON.stringify(newrfiscData), (_self, data, message) => {
                _self._getRfisc();
                MessageToast.show("RFISC Updated");
            });
        },
        _handleInputValidation: function () {
            var validate = true;
            const rfisc_ID = this.byId("idRfisc");
            if (rfisc_ID.getValue()) {
                rfisc_ID.setValueState("None").setValueStateText("");
            } else {
                rfisc_ID.setValueState("Error").setValueStateText("RFISC is Mandatory");
                validate = false;
            }

            return validate;
        },
        onRfiscDeletePress: function (oEvent) {
            const oIndex = oEvent.getSource().getParent().getParent().getIndex(),
                oTable = this.byId("idRfiscList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            var _self = this;
            MessageBox.confirm(this.oResourceBundle.getText("msgDeleteComfirmation"), {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: "OK",
                onClose: function (sAction) {
                    if (sAction == "OK") {
                        sap.ui.core.BusyIndicator.show();
                        const url = `/admin-api/master/RFISC(RFISC='${oObject.RFISC}')`
                        _self.SendRequest(_self, url, "DELETE", {}, null, (_self1, data, message) => {
                            _self1._getRfisc();
                            MessageToast.show(`RFISC ${oObject.RFISC} Deleted`);
                        });
                    }
                }
            });
        },
        onRfiscEditPress: function (oEvent) {
            const oIndex = oEvent.getParameter("row").getIndex(),
                oTable = this.byId("idRfiscList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            this.newRfiscListModel.setData({ ...oObject });
            this._refreshInputValidation();

            // Toggle Visibility for edit
            this.byId("idTitle").setText("Reason for Issuance Sub-Code -  Update ");
            this.getView().getModel().setProperty("/toggleEdit", true);
        },
        onCancelEditRfisc: function (oEvent) {
            var _self = this;
            MessageBox.confirm(this.oResourceBundle.getText("msgEditCancelComfirmation"), {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: "OK",
                onClose: function (sAction) {
                    if (sAction == "OK") {
                        _self.onRefreshScreen();
                    }
                }
            });
        },
        onRefreshScreen: function () {
            this.newRfiscListModel.setData({});
            this._refreshInputValidation();
            this.byId("idTitle").setText("Reason for Issuance Sub-Code -  Create");
            this.rfiscListModel.refresh();
            this.getView().getModel().setProperty("/toggleEdit", false);
        },
        _refreshInputValidation: function () {
            const rfisc_ID = this.byId("idRfisc");
            rfisc_ID.setValueState("None").setValueStateText("");
        }
    });
});