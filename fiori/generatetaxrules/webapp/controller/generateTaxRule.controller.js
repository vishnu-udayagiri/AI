sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    'sap/ui/core/Fragment',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, DateFormat, Fragment, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("ns.generatetaxrules.controller.generateTaxRule", {
            onInit: function () {
                this.SendRequest = this.getOwnerComponent().SendRequest;

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("RoutegenerateTaxRule").attachPatternMatched(this._routeMatched, this);

                this.filterDatamodel = new JSONModel([]);
                this.getView().setModel(this.filterDatamodel, "FilterDatamodel");
                this.filterDatamodel.setSizeLimit(30000);

                this.airportMasterModel = new JSONModel([]);
                this.getView().setModel(this.airportMasterModel, "airportMasterModel");

                this.taxRuleModel = new JSONModel([]);
                this.getView().setModel(this.taxRuleModel, "taxRuleModel");
            },
            _routeMatched: function () {
                sap.ui.core.BusyIndicator.show();
                this.onReset();
                /** get Service URL */
                const mObj = this.getOwnerComponent().getManifestObject();
                if (mObj._oBaseUri._string.includes("port")) {
                    this.sURL = mObj._oBaseUri._string.split('/generatetaxrules')[0] + '/'
                } else {
                    this.sURL = mObj._oBaseUri._parts.path
                }
                this._getConfigData();
            },
            /** Get Config Data */

            _getConfigData: function () {
                var _self = this;
                jQuery.ajax({
                    url: _self.sURL + "taxRule/getFilterDetails()",
                    type: "GET",
                    contentType: "application/json",
                    success: function (response, textStatus, jqXHR) {
                        if (response) {
                            if (response?.value?.status == 200) {
                                const filterData = response.value.data;
                                _self.filterDatamodel.setData(filterData);

                                _self.airportMasterModel.setData(filterData.airportCodes);
                                _self.airportMasterModel.setSizeLimit(filterData.airportCodes.length);

                                sessionStorage.setItem("airportCodes", JSON.stringify(filterData.airportCodes));

                                sap.ui.core.BusyIndicator.hide();
                            }
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error("Something went wrong. Please try again");
                    },
                });
            },

            onReset: function () {
                this.byId("sel_TransactionCode").setSelectedKey();
                this.byId("sel_TcktIssueDate").setValue("");
                this.byId("sel_OrginAirport").setSelectedKey();
                this.byId("sel_DestinationAirport").setSelectedKey();
                this.byId("sel_TicketClass").setSelectedKey();
                // this.byId("sel_RoutingType").setSelectedKey();
                this.byId("cb_isSEZ").setSelected(false);
                this.byId("cb_isB2B").setSelected(false);
                this.byId("sel_statePassengerGSTIN").setSelectedKey();
                this.byId("sel_RFISC").setSelectedKey();

                this.byId("sel_TransactionCode").setValueState("None");
                this.byId("sel_TcktIssueDate").setValueState("None");
                this.byId("sel_OrginAirport").setValueState("None");
                this.byId("sel_DestinationAirport").setValueState("None");
                this.byId("sel_TicketClass").setValueState("None");
                // this.byId("sel_RoutingType").setValueState("None");
                this.byId("cb_isSEZ").setValueState("None");
                this.byId("cb_isB2B").setValueState("None");
                this.byId("sel_statePassengerGSTIN").setValueState("None");
                this.byId("sel_RFISC").setValueState("None");


                this.byId("sel_statePassengerGSTIN").setVisible(false);
                this.byId("sel_RFISC").setVisible(false);
            },

            onProcessRule: function (oEvent) {

                const transactionCode = this.byId("sel_TransactionCode").getSelectedKey();
                const tcktIssueDate = this.byId("sel_TcktIssueDate").getValue();
                const orginAirport = this.byId("sel_OrginAirport").getValue();
                const destinationAirport = this.byId("sel_DestinationAirport").getValue();
                const ticketClass = this.byId("sel_TicketClass").getSelectedKey();
                // const routingType = this.byId("sel_RoutingType").getSelectedKey();
                const isSEZ = this.byId("cb_isSEZ").getSelected();
                const isB2B = this.byId("cb_isB2B").getSelected();
                const passengerState = this.byId("sel_statePassengerGSTIN").getSelectedKey();
                const RFISC = this.byId("sel_RFISC").getSelectedKey();

                this.byId("sel_TransactionCode").setValueState("None");
                this.byId("sel_TcktIssueDate").setValueState("None");
                this.byId("sel_OrginAirport").setValueState("None");
                this.byId("sel_DestinationAirport").setValueState("None");
                this.byId("sel_TicketClass").setValueState("None");
                // this.byId("sel_RoutingType").setValueState("None");
                this.byId("cb_isSEZ").setValueState("None");
                this.byId("cb_isB2B").setValueState("None");
                this.byId("sel_statePassengerGSTIN").setValueState("None");
                this.byId("sel_RFISC").setValueState("None");

                var validate = true;

                if (!transactionCode) {
                    this.byId("sel_TransactionCode").setValueState("Error").setValueStateText("Transaction Code is required");
                    validate = false;
                }
                if (!tcktIssueDate) {
                    this.byId("sel_TcktIssueDate").setValueState("Error").setValueStateText("Ticket Issue date is required");
                    validate = false;
                } else {
                    const isValid = this.byId("sel_TcktIssueDate").isValidValue();
                    if (!isValid) {
                        this.byId("sel_TcktIssueDate").setValueState("Error").setValueStateText("Invalid date format");
                        validate = false;
                    }
                }
                if (!orginAirport) {
                    this.byId("sel_OrginAirport").setValueState("Error").setValueStateText("Origin Airport is required");
                    validate = false;
                }
                if (!destinationAirport) {
                    this.byId("sel_DestinationAirport").setValueState("Error").setValueStateText("Destination Airport is required");
                    validate = false;
                }
                if (transactionCode == 'TKTT' && !ticketClass) {
                    this.byId("sel_TicketClass").setValueState("Error").setValueStateText("Ticket class is required");
                    validate = false;
                }
                // if (!routingType) {
                //     this.byId("sel_RoutingType").setValueState("Error").setValueStateText("Routing type is required");
                //     validate = false;
                // }
                if (isB2B && !passengerState) {
                    this.byId("sel_statePassengerGSTIN").setValueState("Error").setValueStateText("State of passenger GSTIN is required");
                    validate = false;
                }
                if (transactionCode == 'EMD' && !RFISC) {
                    this.byId("sel_RFISC").setValueState("Error").setValueStateText("RFISC is required");
                    validate = false;
                }

                if (validate) {
                    sap.ui.core.BusyIndicator.show();

                    const reqPayload = {
                        "transactionCode": transactionCode,
                        "tcktIssueDate": tcktIssueDate,
                        "orginAirport": orginAirport,
                        "destinationAirport": destinationAirport,
                        "ticketClass": ticketClass,
                        "SEZ": isSEZ,
                        "B2B": isB2B,
                        "passengerState": passengerState,
                        "RFISC": RFISC
                    }

                    var _self = this;
                    jQuery.ajax({
                        url: _self.sURL + "taxRule/getTaxRule",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(
                            { Data: JSON.stringify(reqPayload) }
                        ),
                        success: function (response, textStatus, jqXHR) {
                            if (response) {
                                if (response?.value?.status == 200) {
                                    const taxRuleData = response.value.data;
                                    if (taxRuleData.length > 0) {
                                        if (taxRuleData[0].B2B == '1') {
                                            _self.byId("col_placeOfSupply").setVisible(true);
                                        } else {
                                            _self.byId("col_placeOfSupply").setVisible(false);
                                        }
                                    }
                                    _self.byId("panel_table").setVisible(true);
                                    _self.taxRuleModel.setData(taxRuleData);
                                }
                            }
                            sap.ui.core.BusyIndicator.hide();
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            MessageBox.error("Something went wrong. Please try again");
                            sap.ui.core.BusyIndicator.hide();
                        },
                    });
                }
            },

            onLiveChange: function (oEvent) {
                const sId = oEvent.getParameter("id");
                this.byId(sId).setValueState("None");
            },

            onSelectB2B: function (oEvent) {
                const selected = oEvent.getParameter("selected");
                this.byId("sel_statePassengerGSTIN").setSelectedKey();
                if (selected) {
                    this.byId("sel_statePassengerGSTIN").setVisible(true);
                } else {
                    this.byId("sel_statePassengerGSTIN").setVisible(false);
                }
            },

            onChangeTransactionCode: function (oEvent) {
                const sId = oEvent.getParameter("id");
                this.byId(sId).setValueState("None");
                const oSel = oEvent.getSource().getSelectedKey();
                this.taxRuleModel.setData({});
                if (oSel == 'TKTT') {
                    this.byId("sel_RFISC").setVisible(false);
                    this.byId("sel_TicketClass").setVisible(true);
                    this.byId("sel_RFISC").setVisible(false);
                    this.byId("col_ticketClass").setVisible(true);
                    this.byId("col_RFISC").setVisible(false);
                    this.byId("col_eIndia").setVisible(true);
                    this.byId("col_exemptedZone").setVisible(true);
                } else {
                    this.byId("sel_RFISC").setVisible(true);
                    this.byId("sel_TicketClass").setVisible(false);
                    this.byId("sel_RFISC").setVisible(true);
                    this.byId("col_ticketClass").setVisible(false);
                    this.byId("col_RFISC").setVisible(true);
                    this.byId("col_eIndia").setVisible(false);
                    this.byId("col_exemptedZone").setVisible(false);
                }
            },

            formatDate: function (sDate) {
                if (!sDate) {
                    return "";
                }

                var oDateFormat = DateFormat.getDateInstance({
                    pattern: "dd-MM-yyyy"
                });

                return oDateFormat.format(new Date(sDate));
            },

            handleValueHelp: function (oEvent) {
                var oView = this.getView();
                this._sInputId = oEvent.getSource().getId();
                // const airportCodes = JSON.stringify(sessionStorage.getItem("airportCodes"));
                var bindAirportCode = JSON.parse(sessionStorage.getItem("airportCodes"));
                if (this._sInputId.includes("sel_OrginAirport")) {
                    bindAirportCode = bindAirportCode.filter(airport => airport.countryCode == 'IN');
                }

                this.airportMasterModel.setData(bindAirportCode);
                this.airportMasterModel.setSizeLimit(bindAirportCode.length);

                // create value help dialog
                if (!this._pValueHelpDialog) {
                    this._pValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "ns.generatetaxrules.view.fragments.airportCode",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                }

                // open value help dialog
                this._pValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.open();
                });
            },

            _handleValueHelpSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");

                // Define filters for different properties
                var oFilterAirportName = new Filter("airportName", FilterOperator.Contains, sValue);
                var oFilterAirportCode = new Filter("airportCode", FilterOperator.Contains, sValue);
                var oFilterCountryCode = new Filter("countryCode", FilterOperator.Contains, sValue);

                // Combine filters using OR operator
                var aFilters = new Filter({
                    filters: [oFilterAirportName, oFilterAirportCode, oFilterCountryCode],
                    and: false // Set to true if you want to apply AND logic
                });

                // Apply filters to the binding
                oEvent.getSource().getBinding("items").filter(aFilters);
            },

            _handleValueHelpClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    var sInput = this.byId(this._sInputId);
                    sInput.setValue(oSelectedItem.getDescription());
                    if (this._sInputId.includes("sel_DestinationAirport")) {
                        if (oSelectedItem.getInfo() === 'IN') {
                            this.byId("sel_TicketClass").setValueState("None");
                        } else {
                            this.byId("sel_TicketClass").setValueState("Information").setValueStateText("Please choose the cabin class when departing from India");
                        }
                    } else {
                        this.byId("sel_TicketClass").setValueState("None");
                    }
                }
                oEvent.getSource().getBinding("items").filter([]);
            }
        });
    });

