sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/format/DateFormat"
], function (
    Controller,
    JSONModel,
    MessageBox,
    MessageToast, DateFormat
) {
    "use strict";

    return Controller.extend("admindashboard.controller.StateCodes", {
        onInit: async function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            //AJAX send Request
            this.SendRequest = this.getOwnerComponent().SendRequest;
            //i18n Resource Bundle 
            this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            //JSON Models
            this.stateCodeListModel = new JSONModel();
            this.getView().setModel(this.stateCodeListModel, "stateCodeListModel");
            this.newStateCodeListModel = new JSONModel({});
            this.getView().setModel(this.newStateCodeListModel, "newStateCodeListModel");

            // toggling
            this.configModel = new JSONModel();
            this.getView().setModel(this.configModel);

            this.getView().getModel().setProperty("/toggleEdit", false);

            this.oRouter.getRoute("StateCodes").attachPatternMatched(this._handleRouteMatched, this);
        },
        /* get ID of Selected from route */
        _handleRouteMatched: function (oEvent) {
            // sap.ui.core.BusyIndicator.show();
            this.stateCodeListModel.setData({});
            this.newStateCodeListModel.setData({});
            this._refreshInputValidation();
            this._getStateCodes();
        },
        _getStateCodes: function () {
            this.onRefreshScreen();
            this.SendRequest(this, "/admin-api/master/StateCodes", "GET", {}, null, (_self, data, message) => {
                _self.stateCodeListModel.setData(data);
                sap.ui.core.BusyIndicator.hide();
            });
        },
        onCreateStateCode: function (oEvent) {
            if (this._handleInputValidation()) {
                const newstateCodeData = this.newStateCodeListModel.getData();
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/admin-api/master/StateCodes", "POST", {}, JSON.stringify(newstateCodeData), (_self, data, message) => {
                    _self._getStateCodes();
                    MessageToast.show("State Code Created");
                });
            }
        },
        onUpdateStateCode: function (oEvent) {
            const newstateCodeData = this.newStateCodeListModel.getData();
            const url = `/admin-api/master/StateCodes(stateCode='${newstateCodeData.stateCode}')`
            this.SendRequest(this, url, "PUT", {}, JSON.stringify(newstateCodeData), (_self, data, message) => {
                _self._getStateCodes();
                MessageToast.show("State Code Updated");
            });
        },
        _handleInputValidation: function () {
            var validate = true;
            const stateCode_ID = this.byId("idStateCode");
            if (stateCode_ID.getValue()) {
                stateCode_ID.setValueState("None").setValueStateText("");
            } else {
                stateCode_ID.setValueState("Error").setValueStateText("State Code is Mandatory");
                validate = false;
            }

            return validate;
        },
        onStateCodeDeletePress: function (oEvent) {
            const oIndex = oEvent.getSource().getParent().getParent().getIndex(),
                oTable = this.byId("idStateCodeList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            var _self = this;
            MessageBox.confirm(this.oResourceBundle.getText("msgDeleteComfirmation"), {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: "OK",
                onClose: function (sAction) {
                    if (sAction == "OK") {
                        sap.ui.core.BusyIndicator.show();
                        const url = `/admin-api/master/StateCodes(stateCode='${oObject.stateCode}')`
                        _self.SendRequest(_self, url, "DELETE", {}, null, (_self1, data, message) => {
                            _self1._getStateCodes();
                            MessageToast.show(`State Code ${oObject.stateCode} - ${oObject.description} Deleted`);
                        });
                    }
                }
            });
        },
        onStateCodeEditPress: function (oEvent) {
            const oIndex = oEvent.getParameter("row").getIndex(),
                oTable = this.byId("idStateCodeList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            this.newStateCodeListModel.setData({ ...oObject });
            this._refreshInputValidation();

            // Toggle Visibility for edit
            this.byId("idTitle").setText("State Code - Update ");
            this.getView().getModel().setProperty("/toggleEdit", true);
        },
        onCancelEditStateCode: function (oEvent) {
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
            this.newStateCodeListModel.setData({});
            this._refreshInputValidation();
            this.byId("idTitle").setText("State Code - Create");
            this.stateCodeListModel.refresh();
            this.getView().getModel().setProperty("/toggleEdit", false);
        },
        _refreshInputValidation: function () {
            const stateCode_ID = this.byId("idStateCode");
            stateCode_ID.setValueState("None").setValueStateText("");
        }
    });
});