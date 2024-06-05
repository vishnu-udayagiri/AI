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

    return Controller.extend("admindashboard.controller.Company", {
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            //AJAX send Request
            this.SendRequest = this.getOwnerComponent().SendRequest;
            //i18n Resource Bundle 
            this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            //JSON Models
            this.CompanyListModel = new JSONModel();
            this.getView().setModel(this.CompanyListModel, "CompanyListModel");
            this.newCompanyListModel = new JSONModel({});
            this.getView().setModel(this.newCompanyListModel, "newCompanyListModel");

            // toggling
            this.configModel = new JSONModel();
            this.getView().setModel(this.configModel);

            this.getView().getModel().setProperty("/toggleEdit", false);

            this.oRouter.getRoute("Company").attachPatternMatched(this._handleRouteMatched, this);
        },
        _handleRouteMatched: function (oEvent) {
            // sap.ui.core.BusyIndicator.show();
            this.CompanyListModel.setData({});
            this.newCompanyListModel.setData({});
            this._refreshInputValidation();
            this._getCompany();
        },
        _getCompany: function () {
            this.onRefreshScreen();
            this.SendRequest(this, "/admin-api/master/Company", "GET", {}, null, (_self, data, message) => {
                _self.CompanyListModel.setData(data);
                sap.ui.core.BusyIndicator.hide();
            });
        },
        onCreateCompany: function (oEvent) {
            if (this._handleInputValidation()) {
                const newCompanyData = this.newCompanyListModel.getData();
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/admin-api/master/Company", "POST", {}, JSON.stringify(newCompanyData), (_self, data, message) => {
                    _self._getCompany();
                    MessageToast.show("Company Code Created");
                });
            }
        },
        onUpdateCompany: function (oEvent) {
            const newCompanyData = this.newCompanyListModel.getData();
            const url = `/admin-api/master/Company(code='${newCompanyData.code}')`
            this.SendRequest(this, url, "PUT", {}, JSON.stringify(newCompanyData), (_self, data, message) => {
                _self._getCompany();
                MessageToast.show("Company Code Updated");
            });
        },
        _handleInputValidation: function () {
            var validate = true;
            const Company_ID = this.byId("inp-company");
            if (Company_ID.getValue()) {
                Company_ID.setValueState("None").setValueStateText("");
            } else {
                Company_ID.setValueState("Error").setValueStateText("Company Code is Mandatory");
                validate = false;
            }

            return validate;
        },
        onCompanyDeletePress: function (oEvent) {
            const oIndex = oEvent.getSource().getParent().getParent().getIndex(),
                oTable = this.byId("idCompanyList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            var _self = this;
            MessageBox.confirm(this.oResourceBundle.getText("msgDeleteComfirmation"), {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: "OK",
                onClose: function (sAction) {
                    if (sAction == "OK") {
                        sap.ui.core.BusyIndicator.show();
                        const url = `/admin-api/master/Company(code='${oObject.code}')`
                        _self.SendRequest(_self, url, "DELETE", {}, null, (_self1, data, message) => {
                            _self1._getCompany();
                            MessageToast.show(`Company Code ${oObject.code} Deleted`);
                        });
                    }
                }
            });
        },
        onCompanyEditPress: function (oEvent) {
            const oIndex = oEvent.getParameter("row").getIndex(),
                oTable = this.byId("idCompanyList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            this.newCompanyListModel.setData({ ...oObject });
            this._refreshInputValidation();

            // Toggle Visibility for edit
            this.byId("idTitle").setText("Company Code -  Update ");
            this.getView().getModel().setProperty("/toggleEdit", true);
        },
        onCancelEditCompany: function (oEvent) {
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
            this.newCompanyListModel.setData({});
            this._refreshInputValidation();
            this.byId("idTitle").setText("Company Code -  Create");
            this.CompanyListModel.refresh();
            this.getView().getModel().setProperty("/toggleEdit", false);
        },
        _refreshInputValidation: function () {
            const company_ID = this.byId("inp-company");
            company_ID.setValueState("None").setValueStateText("");
        }
    });
});