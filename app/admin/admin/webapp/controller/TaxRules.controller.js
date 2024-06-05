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

    return Controller.extend("admindashboard.controller.TaxRules", {
        onInit: async function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            //AJAX send Request
            this.SendRequest = this.getOwnerComponent().SendRequest;
            //i18n Resource Bundle 
            this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            //JSON Models
            this.taxRuleListModel = new JSONModel();
            this.getView().setModel(this.taxRuleListModel, "taxRuleListModel");
            this.newTaxRuleListModel = new JSONModel({});
            this.getView().setModel(this.newTaxRuleListModel, "newTaxRuleListModel");

            this.taxCodeModel = new JSONModel({});
            this.getView().setModel(this.taxCodeModel, "taxCodeModel");

            // toggling
            this.configModel = new JSONModel();
            this.getView().setModel(this.configModel);

            this.getView().getModel().setProperty("/toggleEdit", false);

            this.oRouter.getRoute("TaxRules").attachPatternMatched(this._handleRouteMatched, this);
        },
        /* get ID of Selected from route */
        _handleRouteMatched: function (oEvent) {
            sap.ui.core.BusyIndicator.show();
            this.taxRuleListModel.setData({});
            this.newTaxRuleListModel.setData({});
            this._refreshInputValidation();
            this.SendRequest(this, "/admin-api/master/TaxCodes", "GET", {}, null, (_self, data, message) => {
                _self.taxCodeModel.setData(data);
            });
            this._getTaxRules();
        },
        _getTaxRules: function () {
            this.onRefreshScreen();
            this.SendRequest(this, "/admin-api/master/TaxRules", "GET", {}, null, (_self, data, message) => {
                _self.taxRuleListModel.setData(data);
                sap.ui.core.BusyIndicator.hide();
            });
        },
        onCreateTaxRule: function (oEvent) {
            if (this._handleInputValidation()) {
                const newTaxRuleData = this.newTaxRuleListModel.getData();
                newTaxRuleData.ruleId = newTaxRuleData.ticketClass + newTaxRuleData.eindia + newTaxRuleData.exemptedZone + newTaxRuleData.b2b + newTaxRuleData.intrastate;
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/admin-api/master/TaxRules", "POST", {}, JSON.stringify(newTaxRuleData), (_self, data, message) => {
                    _self._getTaxRules();
                    MessageToast.show("Tax Rate Created");
                });
            }
        },
        onUpdateTaxRule: function (oEvent) {
            const newTaxRuleData = this.newTaxRuleListModel.getData();
            newTaxRuleData.ruleId = newTaxRuleData.ticketClass + newTaxRuleData.eindia + newTaxRuleData.exemptedZone + newTaxRuleData.b2b + newTaxRuleData.intrastate;
            const url = `/admin-api/master/TaxRules(ticketClass='${newTaxRuleData.ticketClass}',eindia='${newTaxRuleData.eindia}',exemptedZone='${newTaxRuleData.exemptedZone}',b2b='${newTaxRuleData.b2b}',intrastate='${newTaxRuleData.intrastate}')`
            this.SendRequest(this, url, "PUT", {}, JSON.stringify(newTaxRuleData), (_self, data, message) => {
                _self._getTaxRules();
                MessageToast.show("Tax Rate Updated");
            });
        },
        _handleInputValidation: function () {
            var validate = true;
            const ticketClass_ID = this.byId("idTicketClass");
            const eIndia_ID = this.byId("idEIndia");
            const exemptedZone_ID = this.byId("idexemptedZone");
            const b2b_ID = this.byId("idB2B");
            const intrastate_ID = this.byId("idIntrastate");

            if (ticketClass_ID.getSelectedKey()) {
                ticketClass_ID.setValueState("None").setValueStateText("");
            } else {
                ticketClass_ID.setValueState("Error").setValueStateText("Ticket Class is Mandatory");
                validate = false;
            }
            if (eIndia_ID.getSelectedKey()) {
                eIndia_ID.setValueState("None").setValueStateText("");
            } else {
                eIndia_ID.setValueState("Error").setValueStateText("E-India is Mandatory");
                validate = false;
            }
            if (exemptedZone_ID.getSelectedKey()) {
                exemptedZone_ID.setValueState("None").setValueStateText("");
            } else {
                exemptedZone_ID.setValueState("Error").setValueStateText("GST Exempted Zone is Mandatory");
                validate = false;
            }
            if (b2b_ID.getSelectedKey()) {
                b2b_ID.setValueState("None").setValueStateText("");
            } else {
                b2b_ID.setValueState("Error").setValueStateText("B2B is Mandatory");
                validate = false;
            }
            if (intrastate_ID.getSelectedKey()) {
                intrastate_ID.setValueState("None").setValueStateText("");
            } else {
                intrastate_ID.setValueState("Error").setValueStateText("Intrastate is Mandatory");
                validate = false;
            }

            return validate;
        },
        onTaxRuleDeletePress: function (oEvent) {
            const oIndex = oEvent.getSource().getParent().getParent().getIndex(),
                oTable = this.byId("idTaxRuleList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            var _self = this;
            MessageBox.confirm(this.oResourceBundle.getText("msgDeleteComfirmation"), {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: "OK",
                onClose: function (sAction) {
                    if (sAction == "OK") {
                        sap.ui.core.BusyIndicator.show();
                        const url = `/admin-api/master/TaxRules(ticketClass='${oObject.ticketClass}',eindia='${oObject.eindia}',exemptedZone='${oObject.exemptedZone}',b2b='${oObject.b2b}',intrastate='${oObject.intrastate}')`
                        _self.SendRequest(_self, url, "DELETE", {}, null, (_self1, data, message) => {
                            _self1._getTaxRules();
                            MessageToast.show(`Tax Rule ${oObject.ticketClass} Deleted`);
                        });
                    }
                }
            });
        },
        onTaxRuleEditPress: function (oEvent) {
            const oIndex = oEvent.getParameter("row").getIndex(),
                oTable = this.byId("idTaxRuleList"),
                oObject = oTable.getContextByIndex(oIndex).getObject();
            this.newTaxRuleListModel.setData({ ...oObject });
            this._refreshInputValidation();

            // Toggle Visibility for edit
            this.byId("idTitle").setText("Tax Rule - Update ");
            this.getView().getModel().setProperty("/toggleEdit", true);
        },
        onCancelEditTaxRule: function (oEvent) {
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
            this.newTaxRuleListModel.setData({});
            this._refreshInputValidation();
            this.byId("idTitle").setText("Tax Rule - Create");
            this.taxRuleListModel.refresh();
            this.getView().getModel().setProperty("/toggleEdit", false);
        },
        _refreshInputValidation: function () {
            const ticketClass_ID = this.byId("idTicketClass");
            const eIndia_ID = this.byId("idEIndia");
            const exemptedZone_ID = this.byId("idexemptedZone");
            const b2b_ID = this.byId("idB2B");
            const intrastate_ID = this.byId("idIntrastate");
            ticketClass_ID.setValueState("None").setValueStateText("");
            eIndia_ID.setValueState("None").setValueStateText("");
            exemptedZone_ID.setValueState("None").setValueStateText("");
            b2b_ID.setValueState("None").setValueStateText("");
            intrastate_ID.setValueState("None").setValueStateText("");
        },
        onSetRuleId: function () {
            const ticketClass = this.byId("idTicketClass").getSelectedKey();
            const eIndia = this.byId("idEIndia").getSelectedKey();
            const exemptedZone = this.byId("idexemptedZone").getSelectedKey();
            const b2b = this.byId("idB2B").getSelectedKey();
            const intrastate = this.byId("idIntrastate").getSelectedKey();
            if (ticketClass && eIndia && exemptedZone && b2b && intrastate) {
                this.byId("idRuleId").setValue(ticketClass + eIndia + exemptedZone + b2b + intrastate);
            }
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

    });
});