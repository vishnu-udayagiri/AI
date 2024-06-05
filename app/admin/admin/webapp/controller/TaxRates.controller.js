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

    return Controller.extend("admindashboard.controller.TaxRates", {
        onInit: async function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            //AJAX send Request
            this.SendRequest = this.getOwnerComponent().SendRequest;
            //i18n Resource Bundle 
            this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            //JSON Models
            this.taxRateListModel = new JSONModel();
            this.getView().setModel(this.taxRateListModel, "taxRateListModel");
            this.newTaxRateListModel = new JSONModel({});
            this.getView().setModel(this.newTaxRateListModel, "newTaxRateListModel");

            this.taxCodeModel = new JSONModel({});
            this.getView().setModel(this.taxCodeModel, "taxCodeModel");
            this.taxTypeModel = new JSONModel({});
            this.getView().setModel(this.taxTypeModel, "taxTypeModel");

            // toggling
            this.configModel = new JSONModel();
            this.getView().setModel(this.configModel);

            this.getView().getModel().setProperty("/toggleEdit", false);

            this.oRouter.getRoute("TaxRates").attachPatternMatched(this._handleRouteMatched, this);
        },
        /* get ID of Selected from route */
        _handleRouteMatched: function (oEvent) {
            sap.ui.core.BusyIndicator.show();
            this.taxRateListModel.setData({});
            this.newTaxRateListModel.setData({});
            this._refreshInputValidation();
            this.SendRequest(this, "/admin-api/master/TaxCodes", "GET", {}, null, (_self, data, message) => {
                _self.taxCodeModel.setData(data);
            });
            this.SendRequest(this, "/admin-api/master/TaxCompositions", "GET", {}, null, (_self, data, message) => {
                _self.taxTypeModel.setData(data);
            });
            this._getTaxRates();
        },
        _getTaxRates: function () {
            this.onRefreshScreen();
            this.SendRequest(this, "/admin-api/master/TaxRates", "GET", {}, null, (_self, data, message) => {
                _self.taxRateListModel.setData(data);
                sap.ui.core.BusyIndicator.hide();
            });
        },
        onCreateTaxRate: function (oEvent) {
            if (this._handleInputValidation()) {
                const newTaxRateData = this.newTaxRateListModel.getData();
                newTaxRateData.validTo = newTaxRateData.validTo ?? "9999-12-31";
                newTaxRateData.rate = this._formatDecimal(newTaxRateData.rate);
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/admin-api/master/TaxRates", "POST", {}, JSON.stringify(newTaxRateData), (_self, data, message) => {
                    _self._getTaxRates();
                    MessageToast.show("Tax Rate Created");
                });
            }
        },
        onUpdateTaxRate: function (oEvent) {
            if (this._handleInputValidation()) {
                const newTaxRateData = this.newTaxRateListModel.getData();
                newTaxRateData.validTo = newTaxRateData.validTo ?? "9999-12-31";
                newTaxRateData.rate = this._formatDecimal(newTaxRateData.rate);
                const url = `/admin-api/master/TaxRates(taxCode='${newTaxRateData.taxCode}',taxType='${newTaxRateData.taxType}',validFrom=${newTaxRateData.validFrom})`
                this.SendRequest(this, url, "PUT", {}, JSON.stringify(newTaxRateData), (_self, data, message) => {
                    _self._getTaxRates();
                    MessageToast.show("Tax Rate Updated");
                });
            }
        },
        _handleInputValidation: function () {
            var validate = true;
            const taxCode_ID = this.byId("idTaxCode");
            const taxType_ID = this.byId("idTaxType");
            const validFrom_ID = this.byId("idValidFrom");
            const validTo_ID = this.byId("idValidTo");
            const taxRate_ID = this.byId("idTaxRate");
            if (taxCode_ID.getSelectedKey()) {
                taxCode_ID.setValueState("None").setValueStateText("");
            } else {
                taxCode_ID.setValueState("Error").setValueStateText("Tax Rate is Mandatory");
                validate = false;
            }
            if (taxType_ID.getSelectedKey()) {
                taxType_ID.setValueState("None").setValueStateText("");
            } else {
                taxType_ID.setValueState("Error").setValueStateText("Tax Type is Mandatory");
                validate = false;
            }
            if (validFrom_ID.getValue()) {
                validFrom_ID.setValueState("None").setValueStateText("");
            } else {
                validFrom_ID.setValueState("Error").setValueStateText("Valid From is Mandatory");
                validate = false;
            }
            if (validTo_ID.getValue()) {
                if (new Date(validTo_ID.getValue()) < new Date(validFrom_ID.getValue())) {
                    validTo_ID.setValueState("Error").setValueStateText("Valid To must be greater than Valid From");
                    validate = false;
                } else {
                    validTo_ID.setValueState("None")
                }
            }
            if (taxRate_ID.getValue()) {
                const taxRate = taxRate_ID.getValue();
                if (!isNaN(taxRate) && taxRate <= 100.00) {
                    taxRate_ID.setValueState("None");
                } else {
                    taxRate_ID.setValueState("Error").setValueStateText("Tax rate must be a number less than 100.00");
                    validate = false;
                }
            }

            return validate;
        },
        onTaxRateDeletePress: function (oEvent) {
            const oIndex = oEvent.getSource().getParent().getParent().getIndex(),
                oTable = this.byId("idTaxRateList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            var _self = this;
            MessageBox.confirm(this.oResourceBundle.getText("msgDeleteComfirmation"), {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: "OK",
                onClose: function (sAction) {
                    if (sAction == "OK") {
                        sap.ui.core.BusyIndicator.show();
                        const url = `/admin-api/master/TaxRates(taxCode='${oObject.taxCode}',taxType='${oObject.taxType}',validFrom=${oObject.validFrom})`
                        _self.SendRequest(_self, url, "DELETE", {}, null, (_self1, data, message) => {
                            _self1._getTaxRates();
                            MessageToast.show(`Tax Rate ${oObject.taxCode} - ${oObject.taxType} Deleted`);
                        });
                    }
                }
            });
        },
        onTaxRateEditPress: function (oEvent) {
            const oIndex = oEvent.getParameter("row").getIndex(),
                oTable = this.byId("idTaxRateList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            this.newTaxRateListModel.setData({ ...oObject });
            this._refreshInputValidation();

            // Toggle Visibility for edit
            this.byId("idTitle").setText("Tax Rate - Update ");
            this.getView().getModel().setProperty("/toggleEdit", true);
        },
        onCancelEditTaxRate: function (oEvent) {
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
            this.newTaxRateListModel.setData({});
            this._refreshInputValidation();
            this.byId("idTitle").setText("Tax Rate - Create");
            this.taxRateListModel.refresh();
            this.getView().getModel().setProperty("/toggleEdit", false);
        },
        _refreshInputValidation: function () {
            const taxCode_ID = this.byId("idTaxCode");
            const taxType_ID = this.byId("idTaxType");
            const validFrom_ID = this.byId("idValidFrom");
            const validTo_ID = this.byId("idValidTo");
            taxCode_ID.setValueState("None").setValueStateText("");
            taxType_ID.setValueState("None").setValueStateText("");
            validFrom_ID.setValueState("None").setValueStateText("");
            validTo_ID.setValueState("None").setValueStateText("");
        },
        formatTaxCode: function (sValue) {
            if (sValue) {
                const taxCodes = this.taxCodeModel.getData();
                if (Array.isArray(taxCodes)) {
                    for (const taxCode of taxCodes) {
                        if (taxCode.taxCode === sValue) {
                            return taxCode.description;
                        }
                    }
                }
            }
            return "";
        },
        onChangeValidFrom: function (oEvent) {
            const selDate = oEvent.getParameter("value");
            this.byId("idValidTo").setEditable(true);
            this.byId("idValidTo").setMinDate(new Date(selDate));
        },
        onChangeValidTo: function (oEvent) {
            const selDate = oEvent.getParameter("value");
            const validFrom = this.byId("idValidFrom").getValue();
            if (new Date(selDate) < new Date(validFrom)) {
                oEvent.getSource().setValueState("Error").setValueStateText("Valid To must be greater than Valid From");
            } else {
                oEvent.getSource().setValueState("None")
            }
        },
        _formatDecimal: function (oValue) {
            if (oValue) {
                const decimalPart = oValue % 1;
                if (decimalPart === 0) {
                    return parseInt(oValue).toFixed(2); // Display as .00 if it's not a decimal
                } else {
                    return oValue.toString(); // Otherwise, display the number as is
                }
            } else {
                return 0;
            }
        }
    });
});