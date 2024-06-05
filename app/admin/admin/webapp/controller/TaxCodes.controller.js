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

    return Controller.extend("admindashboard.controller.TaxCodes", {
        onInit: async function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            //AJAX send Request
            this.SendRequest = this.getOwnerComponent().SendRequest;
            //i18n Resource Bundle 
            this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            //JSON Models
            this.taxCodeListModel = new JSONModel();
            this.getView().setModel(this.taxCodeListModel, "taxCodeListModel");
            this.newTaxCodeListModel = new JSONModel({});
            this.getView().setModel(this.newTaxCodeListModel, "newTaxCodeListModel");

            // toggling
            this.configModel = new JSONModel();
            this.getView().setModel(this.configModel);

            this.getView().getModel().setProperty("/toggleEdit", false);

            this.oRouter.getRoute("TaxCodes").attachPatternMatched(this._handleRouteMatched, this);
        },
        /* get ID of Selected from route */
        _handleRouteMatched: function (oEvent) {
            // sap.ui.core.BusyIndicator.show();
            this.taxCodeListModel.setData({});
            this.newTaxCodeListModel.setData({});
            this._refreshInputValidation();
            this._getTaxCodes();
        },
        _getTaxCodes: function () {
            this.onRefreshScreen();
            this.SendRequest(this, "/admin-api/master/TaxCodes", "GET", {}, null, (_self, data, message) => {
                _self.taxCodeListModel.setData(data);
                sap.ui.core.BusyIndicator.hide();
            });
        },
        onCreateTaxCode: function (oEvent) {
            if (this._handleInputValidation()) {
                const newtaxCodeData = this.newTaxCodeListModel.getData();
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/admin-api/master/TaxCodes", "POST", {}, JSON.stringify(newtaxCodeData), (_self, data, message) => {
                    _self._getTaxCodes();
                    MessageToast.show("Tax Code Created");
                });
            }
        },
        onUpdateTaxCode: function (oEvent) {
            const newtaxCodeData = this.newTaxCodeListModel.getData();
            const url = `/admin-api/master/TaxCodes(taxCode='${newtaxCodeData.taxCode}')`
            this.SendRequest(this, url, "PUT", {}, JSON.stringify(newtaxCodeData), (_self, data, message) => {
                _self._getTaxCodes();
                MessageToast.show("Tax Code Updated");
            });
        },
        _handleInputValidation: function () {
            var validate = true;
            const taxCode_ID = this.byId("idTaxCode");
            if (taxCode_ID.getValue()) {
                taxCode_ID.setValueState("None").setValueStateText("");
            } else {
                taxCode_ID.setValueState("Error").setValueStateText("Tax Code is Mandatory");
                validate = false;
            }

            return validate;
        },
        onTaxCodeDeletePress: function (oEvent) {
            const oIndex = oEvent.getSource().getParent().getParent().getIndex(),
                oTable = this.byId("idTaxCodeList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            var _self = this;
            MessageBox.confirm(this.oResourceBundle.getText("msgDeleteComfirmation"), {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: "OK",
                onClose: function (sAction) {
                    if (sAction == "OK") {
                        sap.ui.core.BusyIndicator.show();
                        const url = `/admin-api/master/TaxCodes(taxCode='${oObject.taxCode}')`
                        _self.SendRequest(_self, url, "DELETE", {}, null, (_self1, data, message) => {
                            _self1._getTaxCodes();
                            MessageToast.show(`Tax Code ${oObject.taxCode} - ${oObject.description} Deleted`);
                        });
                    }
                }
            });
        },
        onTaxCodeEditPress: function (oEvent) {
            const oIndex = oEvent.getParameter("row").getIndex(),
                oTable = this.byId("idTaxCodeList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            this.newTaxCodeListModel.setData({ ...oObject });
            this._refreshInputValidation();

            // Toggle Visibility for edit
            this.byId("idTitle").setText("Tax Code - Update ");
            this.getView().getModel().setProperty("/toggleEdit", true);
        },
        onCancelEditTaxCode: function (oEvent) {
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
            this.newTaxCodeListModel.setData({});
            this._refreshInputValidation();
            this.byId("idTitle").setText("Tax Code - Create");
            this.taxCodeListModel.refresh();
            this.getView().getModel().setProperty("/toggleEdit", false);
        },
        _refreshInputValidation: function () {
            const taxCode_ID = this.byId("idTaxCode");
            taxCode_ID.setValueState("None").setValueStateText("");
        }
    });
});