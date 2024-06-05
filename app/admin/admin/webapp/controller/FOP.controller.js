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

    return Controller.extend("admindashboard.controller.FOP", {
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            //AJAX send Request
            this.SendRequest = this.getOwnerComponent().SendRequest;
            //i18n Resource Bundle 
            this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            //JSON Models
            this.fopListModel = new JSONModel();
            this.getView().setModel(this.fopListModel, "fopListModel");
            this.newFopListModel = new JSONModel({});
            this.getView().setModel(this.newFopListModel, "newFopListModel");

            // toggling
            this.configModel = new JSONModel();
            this.getView().setModel(this.configModel);

            this.getView().getModel().setProperty("/toggleEdit", false);

            this.oRouter.getRoute("FOP").attachPatternMatched(this._handleRouteMatched, this);
        },
        /* get ID of Selected from route */
        _handleRouteMatched: function (oEvent) {
            sap.ui.core.BusyIndicator.show();
            this.fopListModel.setData({});
            this.newFopListModel.setData({});
            this._refreshInputValidation();
            this._getFop();
        },
        _getFop: function () {
            this.onRefreshScreen();
            this.SendRequest(this, "/admin-api/master/FOP", "GET", {}, null, (_self, data, message) => {
                _self.fopListModel.setData(data);
                sap.ui.core.BusyIndicator.hide();
            });
        },
        onCreateFop: function (oEvent) {
            if (this._handleInputValidation()) {
                const newfopData = this.newFopListModel.getData();
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/admin-api/master/FOP", "POST", {}, JSON.stringify(newfopData), (_self, data, message) => {
                    _self._getFop();
                    MessageToast.show("FOP Created");
                });
            }
        },
        onUpdateFop: function (oEvent) {
            const newfopData = this.newFopListModel.getData();
            const url = `/admin-api/master/FOP(FOP='${newfopData.FOP}')`
            this.SendRequest(this, url, "PUT", {}, JSON.stringify(newfopData), (_self, data, message) => {
                _self._getFop();
                MessageToast.show("FOP Updated");
            });
        },
        _handleInputValidation: function () {
            var validate = true;
            const fop_ID = this.byId("idFop");
            if (fop_ID.getValue()) {
                fop_ID.setValueState("None").setValueStateText("");
            } else {
                fop_ID.setValueState("Error").setValueStateText("FOP is Mandatory");
                validate = false;
            }

            return validate;
        },
        onFopDeletePress: function (oEvent) {
            const oIndex = oEvent.getSource().getParent().getParent().getIndex(),
                oTable = this.byId("idFopList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            var _self = this;
            MessageBox.confirm(this.oResourceBundle.getText("msgDeleteComfirmation"), {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: "OK",
                onClose: function (sAction) {
                    if (sAction == "OK") {
                        sap.ui.core.BusyIndicator.show();
                        const url = `/admin-api/master/FOP(FOP='${oObject.FOP}')`
                        _self.SendRequest(_self, url, "DELETE", {}, null, (_self1, data, message) => {
                            _self1._getFop();
                            MessageToast.show(`FOP ${oObject.FOP} Deleted`);
                        });
                    }
                }
            });
        },
        onFopEditPress: function (oEvent) {
            const oIndex = oEvent.getParameter("row").getIndex(),
                oTable = this.byId("idFopList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            this.newFopListModel.setData({ ...oObject });
            this._refreshInputValidation();

            // Toggle Visibility for edit
            this.byId("idTitle").setText("Form of payment -  Update ");
            this.getView().getModel().setProperty("/toggleEdit", true);
        },
        onCancelEditFop: function (oEvent) {
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
            this.newFopListModel.setData({});
            this._refreshInputValidation();
            this.byId("idTitle").setText("Form of payment -  Create");
            this.fopListModel.refresh();
            this.getView().getModel().setProperty("/toggleEdit", false);
        },
        _refreshInputValidation: function () {
            const fop_ID = this.byId("idFop");
            fop_ID.setValueState("None").setValueStateText("");
        }
    });
});