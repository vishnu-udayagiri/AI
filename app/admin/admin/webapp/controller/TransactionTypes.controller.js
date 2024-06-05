sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "admindashboard/model/formatter"
], function (
    Controller,
    JSONModel,
    MessageBox,
    MessageToast,
    formatter
) {
    "use strict";

    return Controller.extend("admindashboard.controller.TransactionTypes", {
        formatter: formatter,
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            //AJAX send Request
            this.SendRequest = this.getOwnerComponent().SendRequest;
            //i18n Resource Bundle 
            this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            //JSON Models
            this.transListModel = new JSONModel();
            this.getView().setModel(this.transListModel, "transListModel");
            this.newTransListModel = new JSONModel({});
            this.getView().setModel(this.newTransListModel, "newTransListModel");

            this.taxCodeModel = new JSONModel();
            this.getView().setModel(this.taxCodeModel, "taxCodeModel");

            // toggling
            this.configModel = new JSONModel();
            this.getView().setModel(this.configModel);

            this.getView().getModel().setProperty("/toggleEdit", false);

            this.oRouter.getRoute("TransactionTypes").attachPatternMatched(this._handleRouteMatched, this);
        },
        /* get ID of Selected from route */
        _handleRouteMatched: function (oEvent) {
            sap.ui.core.BusyIndicator.show();
            this.transListModel.setData({});
            this.newTransListModel.setData({});
            this._refreshInputValidation();
            this.SendRequest(this, "/admin-api/master/TaxCodes", "GET", {}, null, (_self, data, message) => {
                _self.taxCodeModel.setData(data);
            });
            this._getTransactionTypes();
        },
        _getTransactionTypes: function () {
            this.onRefreshScreen();
            this.SendRequest(this, "/admin-api/master/TransactionTypes", "GET", {}, null, (_self, data, message) => {
                _self.transListModel.setData(data);
                sap.ui.core.BusyIndicator.hide();
            });
        },
        onCreateTransType: function (oEvent) {
            if (this._handleInputValidation()) {
                const newTransTypeData = this.newTransListModel.getData();
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/admin-api/master/TransactionTypes", "POST", {}, JSON.stringify(newTransTypeData), (_self, data, message) => {
                    _self._getTransactionTypes();
                    MessageToast.show(this.oResourceBundle.getText("msgTransactionTypeCreated"));
                });
            }
        },
        onUpdateTransType: function (oEvent) {
            sap.ui.core.BusyIndicator.show();
            const newTransTypeData = this.newTransListModel.getData();
            const url = `/admin-api/master/TransactionTypes(transactionType='${newTransTypeData.transactionType}')`
            this.SendRequest(this, url, "PUT", {}, JSON.stringify(newTransTypeData), (_self, data, message) => {
                _self._getTransactionTypes();
                MessageToast.show(this.oResourceBundle.getText("msgTransactionTypeUpdated"));
            });
        },
        _handleInputValidation: function () {
            var validate = true;
            const transType_ID = this.byId("idTransType");
            if (transType_ID.getValue()) {
                transType_ID.setValueState("None").setValueStateText("");
            } else {
                transType_ID.setValueState("Error").setValueStateText(this.oResourceBundle.getText("msgTransactionTypeMandatory"));
                validate = false;
            }
            return validate;
        },
        onTransTypeDeletePress: function (oEvent) {
            const oIndex = oEvent.getSource().getParent().getParent().getIndex(),
                oTable = this.byId("idTransTypeList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            var _self = this;
            MessageBox.confirm(this.oResourceBundle.getText("msgDeleteComfirmation"), {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: "OK",
                onClose: function (sAction) {
                    if (sAction == "OK") {
                        sap.ui.core.BusyIndicator.show();
                        const url = `/admin-api/master/TransactionTypes(transactionType='${oObject.transactionType}')`
                        _self.SendRequest(_self, url, "DELETE", {}, null, (_self1, data, message) => {
                            _self1._getTransactionTypes();
                            // MessageToast.show(_self1.oResourceBundle.getText('msgTransactionTypeDeleted').replace('%d1', `${oObject.transactionType}`));
                            MessageToast.show(_self1.oResourceBundle.getText('msgTransactionTypeDeleted').replace('%d1', encodeURIComponent(`${oObject.transactionType}`)));
                        });
                    }
                }
            });
        },
        onTransTypeEditPress: function (oEvent) {
            const oIndex = oEvent.getParameter("row").getIndex(),
                oTable = this.byId("idTransTypeList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            this.newTransListModel.setData({ ...oObject });
            this._refreshInputValidation();

            // Toggle Visibility for edit
            this.byId("idTitle").setText(this.oResourceBundle.getText("msgTransactionTypeUpdate"));
            this.getView().getModel().setProperty("/toggleEdit", true);
        },
        onCancelEditTransType: function (oEvent) {
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
            this.newTransListModel.setData({});
            this._refreshInputValidation();
            this.transListModel.refresh();
            this.byId("idTitle").setText(this.oResourceBundle.getText("msgTransactionTypeCreate"));
            this.getView().getModel().setProperty("/toggleEdit", false);
        },
        _refreshInputValidation: function () {
            const TransTypeidID = this.byId("idTransType");
            TransTypeidID.setValueState("None").setValueStateText("");
        }
    });
});