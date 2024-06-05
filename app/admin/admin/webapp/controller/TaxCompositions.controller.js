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

    return Controller.extend("admindashboard.controller.TaxCompositions", {
        onInit: async function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            //AJAX send Request
            this.SendRequest = this.getOwnerComponent().SendRequest;
            //i18n Resource Bundle 
            this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            //JSON Models
            this.taxCompositionListModel = new JSONModel();
            this.getView().setModel(this.taxCompositionListModel, "taxCompositionListModel");
            this.newTaxCompositionListModel = new JSONModel({});
            this.getView().setModel(this.newTaxCompositionListModel, "newTaxCompositionListModel");

            // toggling
            this.configModel = new JSONModel();
            this.getView().setModel(this.configModel);

            this.getView().getModel().setProperty("/toggleEdit", false);

            this.oRouter.getRoute("TaxCompositions").attachPatternMatched(this._handleRouteMatched, this);
        },
        /* get ID of Selected from route */
        _handleRouteMatched: function (oEvent) {
            // sap.ui.core.BusyIndicator.show();
            this.taxCompositionListModel.setData({});
            this.newTaxCompositionListModel.setData({});
            this._refreshInputValidation();
            this._getTaxCompositions();
        },
        _getTaxCompositions: function () {
            this.onRefreshScreen();
            this.SendRequest(this, "/admin-api/master/TaxCompositions", "GET", {}, null, (_self, data, message) => {
                _self.taxCompositionListModel.setData(data);
                sap.ui.core.BusyIndicator.hide();
            });
        },
        onCreateTaxComposition: function (oEvent) {
            if (this._handleInputValidation()) {
                const newTaxCompositionData = this.newTaxCompositionListModel.getData();
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/admin-api/master/TaxCompositions", "POST", {}, JSON.stringify(newTaxCompositionData), (_self, data, message) => {
                    _self._getTaxCompositions();
                    MessageToast.show("Tax Code Created");
                });
            }
        },
        onUpdateTaxComposition: function (oEvent) {
            const newTaxCompositionData = this.newTaxCompositionListModel.getData();
            const url = `/admin-api/master/TaxCompositions(taxType='${newTaxCompositionData.taxType}')`
            this.SendRequest(this, url, "PUT", {}, JSON.stringify(newTaxCompositionData), (_self, data, message) => {
                _self._getTaxCompositions();
                MessageToast.show("Tax Composition Updated");
            });
        },
        _handleInputValidation: function () {
            var validate = true;
            const taxComposition_ID = this.byId("idTaxComposition");
            if (taxComposition_ID.getValue()) {
                taxComposition_ID.setValueState("None").setValueStateText("");
            } else {
                taxComposition_ID.setValueState("Error").setValueStateText("Tax Code is Mandatory");
                validate = false;
            }

            return validate;
        },
        onTaxCompositionDeletePress: function (oEvent) {
            const oIndex = oEvent.getSource().getParent().getParent().getIndex(),
                oTable = this.byId("idTaxCompositionList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            var _self = this;
            MessageBox.confirm(this.oResourceBundle.getText("msgDeleteComfirmation"), {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: "OK",
                onClose: function (sAction) {
                    if (sAction == "OK") {
                        sap.ui.core.BusyIndicator.show();
                        const url = `/admin-api/master/TaxCompositions(taxType='${oObject.taxType}')`
                        _self.SendRequest(_self, url, "DELETE", {}, null, (_self1, data, message) => {
                            _self1._getTaxCompositions();
                            MessageToast.show(`Tax Code ${oObject.taxType} - ${oObject.taxText ?? ""} Deleted`);
                        });
                    }
                }
            });
        },
        onTaxCompositionEditPress: function (oEvent) {
            const oIndex = oEvent.getParameter("row").getIndex(),
                oTable = this.byId("idTaxCompositionList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            this.newTaxCompositionListModel.setData({ ...oObject });
            this._refreshInputValidation();

            // Toggle Visibility for edit
            this.byId("idTitle").setText("Tax Composition - Update ");
            this.getView().getModel().setProperty("/toggleEdit", true);
        },
        onCancelEditTaxComposition: function (oEvent) {
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
            this.newTaxCompositionListModel.setData({});
            this._refreshInputValidation();
            this.byId("idTitle").setText("Tax Composition - Create");
            this.taxCompositionListModel.refresh();
            this.getView().getModel().setProperty("/toggleEdit", false);
        },
        _refreshInputValidation: function () {
            const taxComposition_ID = this.byId("idTaxComposition");
            taxComposition_ID.setValueState("None").setValueStateText("");
        }
    });
});