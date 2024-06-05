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

    return Controller.extend("admindashboard.controller.AirportCodes", {
        onInit: async function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            //AJAX send Request
            this.SendRequest = this.getOwnerComponent().SendRequest;
            //i18n Resource Bundle 
            this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            //JSON Models
            this.airportCodeListModel = new JSONModel();
            this.getView().setModel(this.airportCodeListModel, "airportCodeListModel");
            this.newAirportCodeListModel = new JSONModel({});
            this.getView().setModel(this.newAirportCodeListModel, "newAirportCodeListModel");

            this.stateCodeModel = new JSONModel({});
            this.getView().setModel(this.stateCodeModel, "stateCodeModel");

            // toggling
            this.configModel = new JSONModel();
            this.getView().setModel(this.configModel);

            this.getView().getModel().setProperty("/toggleEdit", false);

            this.oRouter.getRoute("AirportCodes").attachPatternMatched(this._handleRouteMatched, this);
        },
        /* get ID of Selected from route */
        _handleRouteMatched: function (oEvent) {
            sap.ui.core.BusyIndicator.show();
            this.airportCodeListModel.setData({});
            this.newAirportCodeListModel.setData({});
            this._refreshInputValidation();
            this.SendRequest(this, "/admin-api/master/StateCodes", "GET", {}, null, (_self, data, message) => {
                _self.stateCodeModel.setData(data);
            });
            this._getAirportCodes();
        },
        _getAirportCodes: function () {
            this.onRefreshScreen();
            this.SendRequest(this, "/admin-api/master/AirportCodes", "GET", {}, null, (_self, data, message) => {
                _self.airportCodeListModel.setData(data);
                sap.ui.core.BusyIndicator.hide();
            });
        },
        onCreateAirportCode: function (oEvent) {
            if (this._handleInputValidation()) {
                const newairportCodeData = this.newAirportCodeListModel.getData();
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/admin-api/master/AirportCodes", "POST", {}, JSON.stringify(newairportCodeData), (_self, data, message) => {
                    _self._getAirportCodes();
                    MessageToast.show("Airport Code Created");
                });
            }
        },
        onUpdateAirportCode: function (oEvent) {
            const newairportCodeData = this.newAirportCodeListModel.getData();
            sap.ui.core.BusyIndicator.show();
            const url = `/admin-api/master/AirportCodes(airportCode='${newairportCodeData.airportCode}')`
            this.SendRequest(this, url, "PUT", {}, JSON.stringify(newairportCodeData), (_self, data, message) => {
                _self._getAirportCodes();
                MessageToast.show("Airport Code Updated");
            });
        },
        _handleInputValidation: function () {
            var validate = true;
            const airportCode_ID = this.byId("idAirportCode");
            if (airportCode_ID.getValue()) {
                airportCode_ID.setValueState("None").setValueStateText("");
            } else {
                airportCode_ID.setValueState("Error").setValueStateText("Airport Code is Mandatory");
                validate = false;
            }

            return validate;
        },
        onAirportCodeDeletePress: function (oEvent) {
            const oIndex = oEvent.getSource().getParent().getParent().getIndex(),
                oTable = this.byId("idAirportCodeList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            var _self = this;
            MessageBox.confirm(this.oResourceBundle.getText("msgDeleteComfirmation"), {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: "OK",
                onClose: function (sAction) {
                    if (sAction == "OK") {
                        sap.ui.core.BusyIndicator.show();
                        const url = `/admin-api/master/AirportCodes(airportCode='${oObject.airportCode}')`
                        _self.SendRequest(_self, url, "DELETE", {}, null, (_self1, data, message) => {
                            _self1._getAirportCodes();
                            MessageToast.show(`Airport Code ${oObject.airportCode} Deleted`);
                        });
                    }
                }
            });
        },
        onAirportCodeEditPress: function (oEvent) {
            const oIndex = oEvent.getParameter("row").getIndex(),
                oTable = this.byId("idAirportCodeList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            this.newAirportCodeListModel.setData({ ...oObject });
            this._refreshInputValidation();

            // Toggle Visibility for edit
            this.byId("idTitle").setText("Airport Code - Update ");
            this.getView().getModel().setProperty("/toggleEdit", true);
        },
        onCancelEditAirportCode: function (oEvent) {
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
            this.newAirportCodeListModel.setData({});
            this._refreshInputValidation();
            this.byId("idTitle").setText("Airport Code - Create");
            this.airportCodeListModel.refresh();
            this.getView().getModel().setProperty("/toggleEdit", false);
        },
        _refreshInputValidation: function () {
            const airportCode_ID = this.byId("idAirportCode");
            airportCode_ID.setValueState("None").setValueStateText("");
        },
        formatStateCode: function (sValue) {
            if (sValue) {
                const stateCodes = this.stateCodeModel.getData();
                if (Array.isArray(stateCodes)) {
                    for (const stateCode of stateCodes) {
                        if (stateCode.stateCode === sValue) {
                            return stateCode.stateName;
                        }
                    }
                }
            }
            return "";
        }
    });
});