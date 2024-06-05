sap.ui.define(
    ["sap/ui/core/mvc/Controller",
        "airindiagst/model/formatter",
        "sap/m/MessageBox",
        "sap/ui/Device",
        "sap/m/PDFViewer",
        "sap/ui/model/json/JSONModel",
        'sap/ui/export/library',
        'sap/ui/export/Spreadsheet',
        'sap/m/p13n/Engine',
        'sap/m/p13n/SelectionController',
        'sap/m/p13n/SortController',
        'sap/m/p13n/GroupController',
        'sap/m/p13n/MetadataHelper',
        'sap/ui/model/Sorter'
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,
        formatter,
        MessageBox,
        Device,
        PDFViewer,
        JSONModel, exportLibrary, Spreadsheet, Engine, SelectionController, SortController, GroupController, MetadataHelper, Sorter) {
        "use strict";
        var EdmType = exportLibrary.EdmType;
        return Controller.extend("airindiagst.controller.InvoiceReport", {
            formatDocumentType: function (sType) {
                switch (sType) {
                    case "INVOICE":
                        return " GST Invoice";
                    case "DEBIT":
                        return "Debit Note";
                    case "CREDIT":
                        return "Credit Note";
                    case "BOS":
                        return "Bill of Supply";
                    case "BOSCN":
                        return "Bill of Supply Credit";
                    case "BOSDN":
                        return "Bill of Supply Debit";
                }
            },
            formatNewDateChange: function (sValue) {
                if (sValue) {
                    var dateStringChange = sValue;
                    var partsChanged = dateStringChange.split("-");
                    var formattedDate = partsChanged[2] + "-" + partsChanged[1] + "-" + partsChanged[0];

                    // Output the formatted date
                    return formattedDate;
                }
            },
            onAfterRendering: function () {
            },
            onInit: async function () {
                sap.ui.core.BusyIndicator.show();
                this.jwt = sessionStorage.getItem("jwt")
                if (!this.jwt) {
                    window.location.replace('/portal/index.html');
                }
                this._registerForP13n();

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("InvoiceReport").attachPatternMatched(this._routeMatched, this);
                this.SendRequest = this.getOwnerComponent().SendRequest;
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                this.IATA = {
                };


            },
            onScroll: function (oEvent) {

                var totalPages = Math.ceil(this.GSTDetails.totalInvoices / 100);
                if (this.loopfilters.pageNumber <= totalPages) {
                    sap.ui.core.BusyIndicator.show();
                    this.loopfilters.pageNumber = this.loopfilters.pageNumber + 1;
                    this.SendRequest(this, "/portal-api/portal/v1/get-reports", "POST", {}, JSON.stringify(this.loopfilters), (_self, data, message) => {
                        if (data !== null) {
                            if (data.invoices.length > 0) {
                                _self.GSTDetails.invoices = [..._self.GSTDetails.invoices, ...data.invoices];
                                _self.getView().byId("title").setText("Invoices" + " " + "(1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");
                                _self.getView().getModel("GSTDetailsModel").refresh();
                            }
                        }
                        sap.ui.core.BusyIndicator.hide();
                    });
                }
            },
            restore: function () {
                var oFilterBar = this.byId("filterbar");
                oFilterBar.getAllFilterItems().forEach(function (oFilterItem) {
                    oFilterItem.setVisibleInFilterBar(true);
                });
            },
            _routeMatched: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                this.getView().byId("fbmc-DocType").setSelectedKeys("INVOICE");
                this.byId("tbl_gstInvoices").setVisible(true);
                this.byId("panel_table").setVisible(true);
                this.getView().byId("fbmc-GSTINAI").removeAllSelectedItems();
                this.getView().byId("fbmc-DocType").setSelectedKeys("INVOICE");
                this.getView().byId("fbinp-pnrNumber").removeAllTokens();
                this.getView().byId("fbinp-iataNumber").removeAllTokens();
                this.getView().byId("fbinp-ticketNumber").removeAllTokens();
                this.getView().byId("fbinp-invoiceNumber").removeAllTokens();
                this.getView().byId("fbinp-ticketNumber").removeAllTokens();
                this.getView().byId("fbinp-GSTIN").removeAllTokens();
                this.getView().byId("fbinp-buyername").removeAllTokens();
                this.getView().byId("fbdat-invoiceDate").setValue("");
                this.getView().byId("fbmc-GSTINAI").setSelectedKeys(null);
                //    this.getView().byId("fbmc-GSTIN").setSelectedKeys(null);
                if (this.iataNumberDialog) {
                    this.iataNumberDialog.clearSelection(true);
                }
                if (this.pnrNumDialog) {
                    this.pnrNumDialog.clearSelection(true);
                }
                if (this.ticketNumberDialog) {
                    this.ticketNumberDialog.clearSelection(true);
                }
                if (this.filterInvnum) {
                    this.filterInvnum.clearSelection(true);
                }
                if (this.buyerNameDialog) {
                    this.buyerNameDialog.clearSelection(true);
                }

                const jwt = sessionStorage.getItem("jwt")

                var decodedData;
                if (jwt) {
                    decodedData = JSON.parse(atob(jwt.split('.')[1]));
                }
                this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", " " + decodedData.FirstName + ' ' + decodedData.LastName);
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "Invoice Report");
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/hinticon", true);
                this.defaultGSTN_num = "";
                this.defaultperiod = "";
                this.selectedGSTN_array = [];
                this.ISB2A_flag = false;
                if (decodedData.ISB2A == true) {

                    this.byId("fbinp-iataNumber").setEnabled(true);
                    this.byId("fbinp-company").setVisible(true);
                    this.byId("b2aSegments").setVisible(true);
                    this.byId("b2aSegments").setSelectedKey("MYBOOKINGS");
                    this.ISB2A_flag = true;
                    this.isMyBookings = "my bookings";
                    this.byId("buyergst").setVisible(true);
                    this.byId("fbinp-iataNumber").removeAllTokens();

                } else {
                    this.ISB2A_flag = false;
                    this.byId("fbinp-iataNumber").setEnabled(true);
                    this.byId("fbinp-company").setVisible(false);
                    this.byId("b2aSegments").setVisible(false);
                }
                this.GSTDetails = {
                    invoices: []
                }
                this.filtered_GSTDetails = {
                    invoices: []
                }
                this.uniqueGSTDetails = {
                    results: []
                }

                this.Fetch_GSTDetails();
            },
            Fetch_GSTDetails: function () {
                var _self = this;
                this.filterJson = {

                };
                var IATA;
                var skip = "0";
                var top = "5";
                var filterval = {

                };
                this.loopfilters = {};
                filterval.pageNumber = 1;
                filterval.pageSize = 100;
                filterval.isInitial = true;
                filterval.apiType = "Reports";
                this.loopfilters = filterval;

                this.SendRequest(this, "/portal-api/portal/v1/get-reports", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                    sap.ui.core.BusyIndicator.hide();
                    if (data !== null) {

                        _self.GSTDetails = data;
                        _self.oModel = new sap.ui.model.json.JSONModel([]);
                        _self.oModel.setData(_self.GSTDetails);
                        var oModelData = new sap.ui.model.json.JSONModel();
                        _self.filterJson = {

                        };
                        if (data.filters) {
                            _self.filterJson = _self.GSTDetails.filters;
                            _self.defaultGSTN_num = _self.GSTDetails.filters.defaultGSTIN;
                            _self.defaultperiod = _self.GSTDetails.filters.invoiceFilter;
                            oModelData.setData(_self.filterJson);
                        }
                        if (_self.GSTDetails.invoices.length == 0) {
                            _self.getView().byId("btn-excel").setVisible(false);
                            _self.getView().byId("txt-inr").setVisible(false);
                            _self.getView().byId("btn-pdf").setVisible(false);
                        } else {
                            _self.getView().byId("btn-excel").setVisible(true);
                            _self.getView().byId("txt-inr").setVisible(true);
                            _self.getView().byId("btn-pdf").setVisible(true);
                        }

                        _self.getView().setModel(oModelData, "FilterDatamodel");
                        _self.getView().setModel(_self.oModel, "GSTDetailsModel");
                        _self.uniqueGSTDetails.results = _self.GSTDetails.distinctSupplierGstin;
                        _self.oModel = new sap.ui.model.json.JSONModel([]);
                        _self.oModel.setData(_self.uniqueGSTDetails);
                        _self.getView().setModel(_self.oModel, "uniqueGSTDetailsModel");
                        this.byId("buyergst").setVisible(true);
                        if (_self.GSTDetails.invoices.length > 0) {
                            _self.getView().byId("title").setText("Invoices" + " " + "(1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");
                        } else {
                            _self.getView().byId("title").setText("Invoices(" + _self.GSTDetails.invoices.length + ")");

                        }
                        _self.byId("fbmc-TIMELINE").setSelectedKey(_self.defaultperiod);
                    } else {
                        sap.ui.core.BusyIndicator.hide();
                    }
                });

            },
            handleValueHelppassengerGstin: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.passengergstinDialog) {
                    this.passengergstinDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.passengerGstin", this);
                    this.getView().addDependent(this.passengergstinDialog);
                }
                var oList = this.passengergstinDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.passengergstinDialog._aSelectedItems;

                this.passengergstinDialog.open();

            },
            handleValueHelpSearchpassengergstin: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var psgnoSH = oEvent.getParameter("value");
                if (psgnoSH !== "") {
                    this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "passengerGSTIN": psgnoSH, "apiType": "Reports" }), (_self, data, message) => {

                        var oModelData = new sap.ui.model.json.JSONModel();
                        if (data !== null) {
                            _self.filterJson;
                            _self.filterJsonUpdated = data.filters;
                            _self.filterJson.passengerGSTIN = _self.filterJson.passengerGSTIN.concat(data.filters.passengerGSTIN.filter(function (item) {
                                return _self.filterJson.passengerGSTIN.indexOf(item) === -1; // Check for uniqueness
                            }));
                            oModelData.setData(_self.filterJson);
                            _self.getView().setModel(oModelData, "FilterDatamodel");
                            var sValue = oEvent.getParameter("value");
                            var oFilter = new sap.ui.model.Filter({
                                filters: [
                                    new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                                ],
                                and: false
                            });
                            oEvent.getSource().getBinding("items").filter([oFilter]);
                            sap.ui.core.BusyIndicator.hide();
                        } else {
                            var oModelData = new sap.ui.model.json.JSONModel();
                            oModelData.setData(null);
                            _self.getView().setModel(oModelData, "FilterDatamodel");
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                }
                else {
                    var oModelData = new sap.ui.model.json.JSONModel();
                    oModelData.setData(_self.filterJson);
                    _self.getView().setModel(oModelData, "FilterDatamodel");
                    sap.ui.core.BusyIndicator.hide();
                }
            },
            handleValueHelpClosepassengergstin: function (oEvent) {
                //remove all tokens before you close the value help
                var token = [];
                this.aContexts = oEvent.getParameter("selectedContexts");
                if (this.aContexts && this.aContexts.length) {
                    this.aContexts.map(function (oContext) {
                        token.push(oContext.getObject().key);
                        return oContext.getObject().key;
                    }).join(", ");
                }
                //  else {
                //     MessageBox.show("No new item was selected.");
                // }
                this.byId("fbinp-GSTIN").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-GSTIN");
                var aTitle = [];
                this.oListPlant = this.passengergstinDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject();
                    aTitle.push(text);
                }
                //adding the selected values to the tokens.
                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("fbinp-GSTIN").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                const sId = this.byId("fbinp-GSTIN");
                sId.getAggregation("tokenizer").setEditable(false);
            },

            onSearch: function (oEvent) {
                if (!this.getView().byId("filterbar").isDialogOpen()) {
                    sap.ui.core.BusyIndicator.show();
                    var filter = new Array();
                    var filterval = {};
                    this.loopfilters = {};
                    filterval.pageNumber = 1;
                    filterval.pageSize = 100;
                    filterval.apiType = "Reports";
                    var _self = this;
                    if (!oEvent) {
                        this.filtered_GSTDetails.invoices = this.GSTDetails.invoices.filter(function (item) {
                            return _self.selectedGSTN_array.includes(item.SUPPLIERGSTIN);
                        });
                        _self.getView().byId("title").setText("Documents(" + _self.GSTDetails.invoices.length + ")");
                        if (_self.GSTDetails.invoices.length == 0) {
                            _self.getView().byId("btn-excel").setVisible(false);
                            _self.getView().byId("txt-inr").setVisible(false);
                            _self.getView().byId("btn-pdf").setVisible(false);
                        } else {
                            _self.getView().byId("btn-excel").setVisible(true);
                            _self.getView().byId("txt-inr").setVisible(true);
                            _self.getView().byId("btn-pdf").setVisible(true);
                        }
                        _self.getView().getModel("GSTDetailsModel").setData(_self.GSTDetails);
                        _self.getView().getModel("GSTDetailsModel").refresh();
                        _self.getView().getModel("FilterDatamodel").refresh();
                        _self.byId("panel_table").setVisible(true);

                        _self.byId("tbl_gstInvoices").setVisible(true);

                        sap.ui.core.BusyIndicator.hide();
                    } else {
                        sap.ui.core.BusyIndicator.show();
                        if (this.getView().byId("fbinp-invoiceNumber").getTokens().length > 0) {
                            var invTokens = this.getView().byId("fbinp-invoiceNumber").getTokens();
                            var invToken = invTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var invarr = invToken.split(',');
                            filterval.invoiceNumber = invarr;
                        }
                        if (this.getView().byId("fbinp-ticketNumber").getTokens().length > 0) {
                            var ticTokens = this.getView().byId("fbinp-ticketNumber").getTokens();
                            var ticToken = ticTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var ticarr = ticToken.split(',');
                            filterval.ticketNumber = ticarr;
                        }
                        if (this.getView().byId("fbinp-iataNumber").getTokens().length > 0) {
                            var iataNumber = this.getView().byId("fbinp-iataNumber").getTokens();
                            var iataNumber = iataNumber.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var iata_num = iataNumber.split(',');
                            filterval.iataNumber = iata_num;
                        }
                        if (this.getView().byId("fbinp-GSTIN").getTokens().length > 0) {
                            // var fieldName = "passengerGSTIN";
                            // filterval.passengerGSTIN = this.getView().byId("fbmc-GSTIN").getSelectedKeys();
                            var passengerGstinTokens = this.getView().byId("fbinp-GSTIN").getTokens();
                            var passengerGstinToken = passengerGstinTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var passgstinarr = passengerGstinToken.split(',');

                            filterval.passengerGSTIN = passgstinarr;
                        }
                        if (this.getView().byId("fbmc-GSTINAI").getSelectedKeys() != "") {
                            var fieldName = "supplierGSTIN";
                            filterval.supplierGSTIN = this.getView().byId("fbmc-GSTINAI").getSelectedKeys();
                        }
                        if (this.getView().byId("fbdat-invoiceDate").getValue()) {
                            if (this.byId("fbdat-invoiceDate").isValidValue()) {
                                var daterange = this.getView().byId("fbdat-invoiceDate").getValue().split("to");
                                var formattedDates = daterange.map(date => {
                                    let parts = date.trim().split('/');
                                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                                });
                                filterval.from = formattedDates[0].trim();
                                filterval.to = formattedDates[1].trim();
                            } else {
                                MessageBox.error("Please choose a valid Date");
                                sap.ui.core.BusyIndicator.hide();
                                return false;
                            }
                        }
                        this.loopfilters = filterval;
                        this.SendRequest(this, "/portal-api/portal/v1/get-reports", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                            sap.ui.core.BusyIndicator.hide();
                            if (data !== null) {
                                _self.GSTDetails = data;
                                //   _self.getView().byId("title").setText("Invoices(" + _self.GSTDetails.invoices.length + ")");
                                if (_self.GSTDetails.invoices.length == 0) {
                                    _self.getView().byId("btn-excel").setVisible(false);
                                    _self.getView().byId("txt-inr").setVisible(false);
                                    _self.getView().byId("btn-pdf").setVisible(false);
                                } else {
                                    _self.getView().byId("btn-excel").setVisible(true);
                                    _self.getView().byId("txt-inr").setVisible(true);
                                    _self.getView().byId("btn-pdf").setVisible(true);
                                }
                                if (_self.GSTDetails.invoices.length > 0) {
                                    _self.getView().byId("title").setText("Invoices" + " " + "(1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");
                                } else {
                                    _self.getView().byId("title").setText("Invoices(" + _self.GSTDetails.invoices.length + ")");

                                }
                                _self.getView().getModel("GSTDetailsModel").setData(_self.GSTDetails);
                                _self.getView().getModel("GSTDetailsModel").refresh();
                                _self.byId("panel_table").setVisible(true);

                                _self.byId("tbl_gstInvoices").setVisible(true);

                            } else {
                                sap.ui.core.BusyIndicator.hide();
                            }

                        });
                    }
                }
            },
            handleSelectedPeriod: function (oEvent) {
                var selectedItemKey = oEvent.getSource().getSelectedKey();
                var invoiceDateFilter = this.getView().byId("fbdat-invoiceDate");
                var minDate, maxDate;
                if (selectedItemKey === "CM") {
                    var currentDate = new Date();
                    minDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                } else if (selectedItemKey === "PM") {
                    var currentDate = new Date();
                    currentDate.setMonth(currentDate.getMonth() - 1);
                    minDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                } else if (selectedItemKey === "CY") {
                    var currentDate = new Date();
                    var fiscalYearStart = new Date(currentDate.getFullYear(), 3, 1); // April is month 3 (0-indexed)

                    var fiscalYearEnd = new Date(currentDate.getFullYear() + 1, 2, 31); // March is month 2 (0-indexed)

                    minDate = fiscalYearStart;
                    maxDate = fiscalYearEnd;
                }

                this.getView().byId("fbdat-invoiceDate").setMinDate(minDate);
                this.getView().byId("fbdat-invoiceDate").setMaxDate(maxDate);

            },
            unique_GSTN: function (GSTDetails) {
                var uniqueorginalGstins = {};
                GSTDetails.results.forEach(function (item) {
                    uniqueorginalGstins[item.orginalGstin] = true;
                });

                var uniqueorginalGstinsArray = Object.keys(uniqueorginalGstins).map(function (orginalGstin) {
                    return { orginalGstin: orginalGstin };
                });
                var resultJSON = {
                    uniqueorginalGstins: uniqueorginalGstinsArray
                };
                this.uniqueGSTDetails.results = resultJSON.uniqueorginalGstins;
                this.uniqueGSTDetails =
                    this.oModel = new sap.ui.model.json.JSONModel([]);
                this.oModel.setData(this.uniqueGSTDetails);
                this.getView().setModel(this.oModel, "uniqueGSTDetailsModel");
            },
            handleValueHelpinvoiceNum: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.filterInvnum) {
                    this.filterInvnum = sap.ui.xmlfragment("airindiagst.view.Fragment.invoiceNumberFIlterDialog", this);
                    this.getView().addDependent(this.filterInvnum);
                }
                var oList = this.filterInvnum._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.filterInvnum._aSelectedItems;
                this.filterInvnum.open();

            },
            handlecancelinv: function (oEvent) {
                this.filterInvnum.close();

            },
            handleValueHelpCloseinvoiceNum: function (oEvent) {

                var token = [];
                this.aContexts = oEvent.getParameter("selectedContexts");
                if (this.aContexts && this.aContexts.length) {
                    this.aContexts.map(function (oContext) {
                        token.push(oContext.getObject().key);
                        return oContext.getObject().key;
                    }).join(", ");
                }

                this.byId("fbinp-invoiceNumber").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-invoiceNumber");
                var aTitle = [];
                this.oListPlant = this.filterInvnum._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject();
                    aTitle.push(text);
                }

                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("fbinp-invoiceNumber").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                const sId = this.byId("fbinp-invoiceNumber");

                sId.getAggregation("tokenizer").setEditable(false)


            },
            // handleValueHelpSearchinvoiceNum: function (oEvent) {
            //     var sValue = oEvent.getParameter("value");
            //     var oFilter = new sap.ui.model.Filter({
            //         filters: [
            //             new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
            //         ],
            //         and: false
            //     });
            //     oEvent.getSource().getBinding("items").filter([oFilter]);
            // },
            handleValueHelpSearchinvoiceNum: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var invnoSH = oEvent.getParameter("value");
                if (invnoSH !== "") {
                    this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "invoiceNumber": invnoSH, "apiType": "Reports" }), (_self, data, message) => {

                        var oModelData = new sap.ui.model.json.JSONModel();
                        if (data !== null) {
                            _self.filterJson;
                            _self.filterJsonUpdated = data.filters;
                            _self.filterJson.invoiceNumber = _self.filterJson.invoiceNumber.concat(data.filters.invoiceNumber.filter(function (item) {
                                return _self.filterJson.invoiceNumber.indexOf(item) === -1; // Check for uniqueness
                            }));
                            oModelData.setData(_self.filterJson);
                            _self.getView().setModel(oModelData, "FilterDatamodel");
                            var sValue = oEvent.getParameter("value");
                            var oFilter = new sap.ui.model.Filter({
                                filters: [
                                    new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                                ],
                                and: false
                            });
                            oEvent.getSource().getBinding("items").filter([oFilter]);
                            sap.ui.core.BusyIndicator.hide();
                        } else {
                            var oModelData = new sap.ui.model.json.JSONModel();
                            oModelData.setData(null);
                            _self.getView().setModel(oModelData, "FilterDatamodel");
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                }
                else {
                    var oModelData = new sap.ui.model.json.JSONModel();
                    oModelData.setData(_self.filterJson);
                    _self.getView().setModel(oModelData, "FilterDatamodel");
                    sap.ui.core.BusyIndicator.hide();
                }
            },
            handleValueHelpPNRNum: function (oEvent) {

                var sInputValue = oEvent.getSource().getValue();

                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.pnrNumDialog) {
                    this.pnrNumDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.PNRdetails", this);
                    this.getView().addDependent(this.pnrNumDialog);
                }

                var oList = this.pnrNumDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.pnrNumDialog._aSelectedItems;
                this.pnrNumDialog.open();


            },
            handlecancelpnr: function (oEvent) {
                this.pnrNumDialog.close();

            },
            handleValueHelpClosepnrNum: function (oEvent) {

                var token = [];
                this.aContexts = oEvent.getParameter("selectedContexts");
                if (this.aContexts && this.aContexts.length) {
                    this.aContexts.map(function (oContext) {
                        token.push(oContext.getObject().key);
                        return oContext.getObject().key;
                    }).join(", ");
                }

                this.byId("fbinp-pnrNumber").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-pnrNumber");
                var aTitle = [];
                this.oListPlant = this.pnrNumDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject();
                    aTitle.push(text);
                }

                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("fbinp-pnrNumber").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                const sId = this.byId("fbinp-pnrNumber");

                sId.getAggregation("tokenizer").setEditable(false)


            },
            handleValueHelpSearchpnrNum: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);

            },

            handleValueHelpcompany: function (oEvent) {
                var _self = this;
                var filterJson;
                this.inputId = oEvent.getSource().getId();
                if (!this.companyDialog) {
                    this.companyDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.companyFIlterDialog", this);
                }
                this.getView().addDependent(this.companyDialog);
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.companyDialog);
                _self.getView().getModel("FilterDatamodel").refresh();
                _self.companyDialog.open();

            },
            handleValueHelpClosecompany: function (oEvent) {
                var _self = this;
                var oSelectedItem = oEvent.getParameter('selectedItem').getTitle();

                if (oSelectedItem) {
                    var filterCompany = this.getView().byId(this.inputId);
                    filterCompany.setValue(oSelectedItem);
                }
            },
            handleValueHelpSearchcompany: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },

            handleValueHelpiataNum: function (oEvent) {

                var sInputValue = oEvent.getSource().getValue();


                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.iataNumberDialog) {
                    this.iataNumberDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.iataNumberFIlterDialog", this);
                    this.getView().addDependent(this.iataNumberDialog);
                }

                var oList = this.iataNumberDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.iataNumberDialog._aSelectedItems;
                this.iataNumberDialog.open();



            },
            handlecanceliata: function (oEvent) {
                this.iataNumberDialog.close();

            },
            handleValueHelpCloseiataNum: function (oEvent) {

                var token = [];
                this.aContexts = oEvent.getParameter("selectedContexts");
                if (this.aContexts && this.aContexts.length) {
                    this.aContexts.map(function (oContext) {
                        token.push(oContext.getObject().key);
                        return oContext.getObject().key;
                    }).join(", ");
                }

                this.byId("fbinp-iataNumber").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-iataNumber");
                var aTitle = [];
                this.oListPlant = this.iataNumberDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject();
                    aTitle.push(text);
                }

                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("fbinp-iataNumber").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                const sId = this.byId("fbinp-iataNumber");
                sId.getAggregation("tokenizer").setEditable(false);
            },
            handleValueHelpSearchiataNum: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },

            handleValueHelpticketNum: function (oEvent) {

                var sInputValue = oEvent.getSource().getValue();

                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.ticketNumberDialog) {
                    this.ticketNumberDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.ticketNumberFIlterDialog", this);
                    this.getView().addDependent(this.ticketNumberDialog);
                }

                var oList = this.ticketNumberDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.ticketNumberDialog._aSelectedItems;
                this.ticketNumberDialog.open();

            },
            handlecancelticket: function (oEvent) {

                this.ticketNumberDialog.close();
            },
            handleValueHelpCloseticketNum: function (oEvent) {

                var token = [];
                this.aContexts = oEvent.getParameter("selectedContexts");
                if (this.aContexts && this.aContexts.length) {
                    this.aContexts.map(function (oContext) {
                        token.push(oContext.getObject().key);
                        return oContext.getObject().key;
                    }).join(", ");
                }

                this.byId("fbinp-ticketNumber").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-ticketNumber");
                var aTitle = [];
                this.oListPlant = this.ticketNumberDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject();
                    aTitle.push(text);
                }

                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("fbinp-ticketNumber").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                const sId = this.byId("fbinp-ticketNumber");

                sId.getAggregation("tokenizer").setEditable(false)


            },

            handleValueHelpSearchticketNum: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);

            },
            handleValueHelpSearchticketNum: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var tcknoSH = oEvent.getParameter("value");
                if (tcknoSH !== "") {
                    this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "ticketNumber": tcknoSH, "apiType": "Reports" }), (_self, data, message) => {

                        var oModelData = new sap.ui.model.json.JSONModel();
                        if (data !== null) {
                            _self.filterJson;
                            _self.filterJsonUpdated = data.filters;
                            _self.filterJson.ticketNumber = _self.filterJson.ticketNumber.concat(data.filters.ticketNumber.filter(function (item) {
                                return _self.filterJson.ticketNumber.indexOf(item) === -1; // Check for uniqueness
                            }));
                            oModelData.setData(_self.filterJson);
                            _self.getView().setModel(oModelData, "FilterDatamodel");
                            var sValue = oEvent.getParameter("value");
                            var oFilter = new sap.ui.model.Filter({
                                filters: [
                                    new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                                ],
                                and: false
                            });
                            oEvent.getSource().getBinding("items").filter([oFilter]);
                            sap.ui.core.BusyIndicator.hide();
                        } else {
                            var oModelData = new sap.ui.model.json.JSONModel();
                            oModelData.setData(null);
                            _self.getView().setModel(oModelData, "FilterDatamodel");
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                }
                else {
                    var oModelData = new sap.ui.model.json.JSONModel();
                    oModelData.setData(_self.filterJson);
                    _self.getView().setModel(oModelData, "FilterDatamodel");
                    sap.ui.core.BusyIndicator.hide();
                }
            },
            onchangeB2Aview: function (oEvent) {

                var segmentkey = oEvent.getSource().getSelectedKey();
                var segmentItem = oEvent.getSource().getSelectedItem();
                var _self = this;

                if (segmentkey == "BOOKEDTHROUGH") {
                    this.byId("b2aSegments").setSelectedKey("BOOKEDTHROUGH");

                    this.getView().byId("fbmc-DocType").setSelectedKeys("INVOICE");
                    this.byId("tbl_gstInvoices").setVisible(false);
                    this.byId("panel_table").setVisible(false);
                    this.getView().byId("fbinp-pnrNumber").removeAllTokens();
                    this.getView().byId("fbinp-iataNumber").removeAllTokens();
                    this.getView().byId("fbinp-ticketNumber").removeAllTokens();
                    this.getView().byId("fbinp-invoiceNumber").removeAllTokens();
                    this.getView().byId("fbinp-buyername").removeAllTokens();
                    this.getView().byId("fbdat-invoiceDate").setValue("");
                    this.getView().byId("fbdat-invoiceDate").setValue("");
                    this.getView().byId("fbmc-GSTINAI").setSelectedKeys(null);
                    this.byId("fbmc-TIMELINE").setSelectedKey(this.defaultperiod);

                    if (this.pnrNumDialog) {
                        this.pnrNumDialog.clearSelection(true);
                    }
                    if (this.ticketNumberDialog) {
                        this.ticketNumberDialog.clearSelection(true);
                    }
                    if (this.filterInvnum) {
                        this.filterInvnum.clearSelection(true);
                    }
                    if (this.buyerNameDialog) {
                        this.buyerNameDialog.clearSelection(true);
                    }
                    _self.filterJson.iataNumber.forEach(function (token) {

                        _self.getView().byId("fbinp-iataNumber").addToken(new sap.m.Token({
                            text: token.IATANUMBER
                        }));
                    });
                    this.byId("buyergst").setVisible(false);
                    this.isMyBookings = "booked through";
                    this.onSearch(oEvent);
                }
                else {
                    this.getView().byId("fbmc-DocType").setSelectedKeys("INVOICE");
                    this.byId("tbl_gstInvoices").setVisible(false);
                    this.byId("panel_table").setVisible(false);
                    this.getView().byId("fbinp-pnrNumber").removeAllTokens();
                    this.getView().byId("fbinp-iataNumber").removeAllTokens();
                    this.getView().byId("fbinp-ticketNumber").removeAllTokens();
                    this.getView().byId("fbinp-invoiceNumber").removeAllTokens();
                    this.getView().byId("fbinp-buyername").removeAllTokens();
                    this.getView().byId("fbdat-invoiceDate").setValue("");
                    this.getView().byId("fbdat-invoiceDate").setValue("");
                    this.getView().byId("fbmc-GSTINAI").setSelectedKeys(null);
                    this.byId("buyergst").setVisible(true);
                    // this.byId("fbmc-GSTIN").setSelectedKeys(this.defaultGSTN_num);
                    this.byId("fbmc-TIMELINE").setSelectedKey(this.defaultperiod);
                    this.byId("b2aSegments").setSelectedKey("MYBOOKINGS");

                    this.isMyBookings = "my bookings";
                    this.byId("fbinp-iataNumber").removeAllTokens();
                    if (this.iataNumberDialog) {
                        this.iataNumberDialog.clearSelection(true);
                    }
                    if (this.pnrNumDialog) {
                        this.pnrNumDialog.clearSelection(true);
                    }
                    if (this.ticketNumberDialog) {
                        this.ticketNumberDialog.clearSelection(true);
                    }
                    if (this.filterInvnum) {
                        this.filterInvnum.clearSelection(true);
                    }
                    if (this.buyerNameDialog) {
                        this.buyerNameDialog.clearSelection(true);
                    }
                    this.onSearch(oEvent);

                }
            },
            onPressExportExcel: function () {
                var filterval = {

                };
                filterval.columns = {
                    "COMPANY": "Company",
                    "INVOICENUMBER": "Document Number",
                    "INVOICEDATE": "Document Date",
                    "TOTALINVOICEAMOUNT": "Total Invoice Amount",
                    "SUPPLIERGSTIN": "Supplier GSTIN",
                    "PASSENGERGSTIN": "Passenger GSTIN",
                    "BILLTOFULLADDRESS": "Bill to Address",
                    "TICKETNUMBER": "Ticket Number",
                    "TICKETISSUEDATE": "Ticket Issue Date"
                }


                sap.ui.core.BusyIndicator.show();
                var oTable = this.byId("tbl_gstInvoices");


                var aSelectedIndices = oTable.getSelectedIndices();


                var aSelectedInvoiceNumbers = [];


                aSelectedIndices.forEach(function (aSelectedIndices) {
                    var oBindingContext = oTable.getContextByIndex(aSelectedIndices);
                    var sInvoiceNumber = oBindingContext.getProperty().INVOICENUMBER;
                    aSelectedInvoiceNumbers.push(sInvoiceNumber);
                });
                if (aSelectedInvoiceNumbers.length == 0) {
                    MessageBox.information("Please select atleast one row to proceed");
                    sap.ui.core.BusyIndicator.hide();
                }
                if (aSelectedInvoiceNumbers.length > 0) {
                    filterval.invoiceNumber = aSelectedInvoiceNumbers;


                    filterval.generateExcel = true;
                    filterval.apiType = "Reports";
                    this.SendRequest(this, "/portal-api/portal/v1/get-reports", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                        if (data != null) {
                            var base64Data = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + data.excel;
                            const link = document.createElement('a');
                            link.href = base64Data;
                            link.download = "Invoices";
                            link.click();
                            sap.ui.core.BusyIndicator.hide();
                        } else {
                            MessageBox.warning("Something went wrong");
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                }

            },
            onButtonDownloadPress: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                const oTable = this.byId("tbl_gstInvoices");
                const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                const oSelIndices = oTable.getSelectedIndices();

                const aInvoices = [];
                if (oSelIndices.length) {
                    var oModel = oTable.getModel("GSTDetailsModel");
                    oSelIndices.forEach(function (iIndex) {
                        var oContext = oTable.getContextByIndex(iIndex);
                        var oData = oModel.getProperty(null, oContext);
                        const ID = oData.INVOICENUMBER;

                        aInvoices.push({ ID })
                    });
                    if (oSelIndices.length > 1) {
                        sap.ui.core.BusyIndicator.hide();

                        this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ isCancelled: true, invoices: aInvoices }), (_self, data, message) => {

                            if (data !== null) {
                                const invoices = data.invoice;
                                const base64Data = "data:application/zip;base64," + invoices;
                                const link = document.createElement('a');
                                link.href = base64Data;
                                link.download = `Invoices`;
                                link.click();
                                sap.ui.core.BusyIndicator.hide();
                                const responseData = data.invoiceNumber;
                                if (responseData.notGenerated.length > 0) {
                                    const generatedString = responseData.notGenerated.join(', ');
                                    MessageBox.warning("List of documents pending for invoice generation.", {
                                        title: "Download status",
                                        id: "messageBoxId1",
                                        details: generatedString,
                                        contentWidth: "100px"
                                    });
                                }
                            } else {
                                MessageBox.warning("Something went wrong");
                                sap.ui.core.BusyIndicator.hide();
                            }
                        });

                    } else {
                        this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ isCancelled: true, invoices: aInvoices }), (_self, data, message) => {
                            sap.ui.core.BusyIndicator.hide();
                            if (data !== null) {
                                const invoices = data.invoice;
                                const base64Data = "data:application/pdf;base64," + invoices;
                                const link = document.createElement('a');
                                link.href = base64Data;
                                link.download = `Invoice - ${data.invoiceNumber}`;
                                link.click();


                                const responseData = data.invoiceNumber;
                                if (responseData.notGenerated.length > 0) {
                                    const generatedString = responseData.notGenerated.join(', ');
                                    MessageBox.warning("List of documents pending for invoice generation.", {
                                        title: "Download status",
                                        id: "messageBoxId1",
                                        details: generatedString,
                                        contentWidth: "100px"
                                    });
                                }
                            } else {
                                MessageBox.warning("Something went wrong");
                                sap.ui.core.BusyIndicator.hide();
                            }
                        });
                    }
                } else {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.information("Please select the documents for downloading.");
                }
            },
            onButtonDownloadPresssingle: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                const oTable = this.byId("tbl_gstInvoices");
                var row = oEvent.getParameter("row").getIndex()
                var val = oEvent.getParameter("row").getBindingContext("GSTDetailsModel").getProperty("INVOICENUMBER");
                if ((val == "") || (val == null) || (val == undefined)) {
                    MessageBox.warning("Document cannot be downloaded due to missing invoice number");
                    sap.ui.core.BusyIndicator.hide();
                } else {
                    const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;

                    const aInvoices = [];
                    aInvoices.push({ ID: val });

                    this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices: aInvoices }), (_self, data, message) => {

                        if (data !== null) {
                            const invoices = data.invoice;
                            const base64Data = "data:application/pdf;base64," + invoices;
                            const link = document.createElement('a');
                            link.href = base64Data;
                            link.download = `Invoice - ${data.invoiceNumber}`;
                            link.click();
                            sap.ui.core.BusyIndicator.hide();
                        } else {
                            MessageBox.warning("Something went wrong");
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                    sap.ui.core.BusyIndicator.hide();
                    // }
                }
            },
            handleValueHelpbuyername: function (oEvent) {

                var sInputValue = oEvent.getSource().getValue();

                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.buyerNameDialogs) {
                    this.buyerNameDialogs = sap.ui.xmlfragment("airindiagst.view.Fragment.buyerFIlterDialog", this);
                    this.getView().addDependent(this.buyerNameDialogs);
                }

                var oList = this.buyerNameDialogs._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.buyerNameDialogs._aSelectedItems;
                this.buyerNameDialogs.open();


            },
            handleValueHelpSearchbuyername: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);

            },
            handlecancelbuyer: function (oEvent) {
                this.buyerNameDialogs.close();
            },
            handleValueHelpClosebuyerName: function (oEvent) {

                var token = [];
                this.aContexts = oEvent.getParameter("selectedContexts");
                if (this.aContexts && this.aContexts.length) {
                    this.aContexts.map(function (oContext) {
                        token.push(oContext.getObject().key);
                        return oContext.getObject().key;
                    }).join(", ");
                }

                this.byId("fbinp-buyername").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-buyername");
                var aTitle = [];
                this.oListPlant = this.buyerNameDialogs._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject();
                    aTitle.push(text);
                }

                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("fbinp-buyername").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                var tokens = this.byId("fbinp-invoiceNumber").getTokens();

                const sId = this.byId("fbinp-invoiceNumber");

                sId.getAggregation("tokenizer").setEditable(false)


            },
            ondocTypeComboChange: function (oEvent) {
                var oComboBox = oEvent.getSource();
                var sInput = oComboBox.getValue();
                if (oComboBox.getSelectedItem() === null) {
                    oComboBox.setValue("");
                    oComboBox.setSelectedKey("INVOICE")
                }
            },
            setDocumentType: function (sValue) {
                const DocArr = this.GSTDetailsModel.getData().DOCUMENTTYPE;
                return formatter.setDescription(sValue, DocArr);
            },
            onContainerScroll: function (oEvent) {

            },
            _registerForP13n: function () {
                var oTable = this.byId("tbl_gstInvoices");
                this.oMetadataHelper = new MetadataHelper([
                    { key: "company_InvRep", label: "Company", path: "COMPANY" },
                    { key: "invNum_InvRep", label: "Invoice Number", path: "INVOICENUMBER" },
                    { key: "invDate_InvRep", label: "Invoice Date", path: "INVOICEDATE" },
                    { key: "totInvAmt_InvRep", label: "Total Invoice Amount", path: "TOTALINVOICEAMOUNT" },
                    { key: "supplierGSTIN_InvRep", label: "GSTIN of AI", path: "SUPPLIERGSTIN" },
                    { key: "buyerGSTIN_InvRep", label: "GSTIN of entity", path: "PASSENGERGSTIN" },
                    { key: "addressOfEntity_InvRep", label: "Address of Entity", path: "BILLTOFULLADDRESS" },
                    { key: "ticketNum_InvRep", label: "Ticket Number", path: "TICKETNUMBER" },
                    { key: "ticketIssueDate_InvRep", label: "Ticket Issue Date", path: "TICKETISSUEDATE" }
                ]);

                Engine.getInstance().register(oTable, {
                    helper: this.oMetadataHelper,
                    controller: {
                        Columns: new SelectionController({
                            targetAggregation: "columns",
                            control: oTable
                        }),
                        Sorter: new SortController({
                            control: oTable
                        }),
                        Groups: new GroupController({
                            control: oTable
                        })
                    }
                });

                Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));
            },
            openPersoDialog: function (oEvt) {
                var oTable = this.byId("tbl_gstInvoices");

                Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
                    contentHeight: "35rem",
                    contentWidth: "32rem",
                    source: oEvt.getSource()
                });
            },
            onSort: function (oEvt) {
                var oTable = this.byId("tbl_gstInvoices");
                var sAffectedProperty = this._getKey(oEvt.getParameter("column"));
                var sSortOrder = oEvt.getParameter("sortOrder");


                Engine.getInstance().retrieveState(oTable).then(function (oState) {


                    oState.Sorter.forEach(function (oSorter) {
                        oSorter.sorted = false;
                    });
                    oState.Sorter.push({
                        key: sAffectedProperty,
                        descending: sSortOrder === tableLibrary.SortOrder.Descending
                    });


                    Engine.getInstance().applyState(oTable, oState);
                });
            },
            onColumnMove: function (oEvt) {
                var oTable = this.byId("tbl_gstInvoices");
                var oAffectedColumn = oEvt.getParameter("column");
                var iNewPos = oEvt.getParameter("newPos");
                var sKey = this._getKey(oAffectedColumn);
                oEvt.preventDefault();

                Engine.getInstance().retrieveState(oTable).then(function (oState) {

                    var oCol = oState.Columns.find(function (oColumn) {
                        return oColumn.key === sKey;
                    }) || { key: sKey };
                    oCol.position = iNewPos;

                    Engine.getInstance().applyState(oTable, { Columns: [oCol] });
                });
            },

            _getKey: function (oControl) {
                return this.getView().getLocalId(oControl.getId());
            },

            handleStateChange: function (oEvt) {
                var oTable = this.byId("tbl_gstInvoices");
                var oState = oEvt.getParameter("state");

                oTable.getColumns().forEach(function (oColumn) {
                    oColumn.setVisible(false);
                    oColumn.setSorted(false);
                });

                oState.Columns.forEach(function (oProp, iIndex) {
                    var oCol = this.byId(oProp.key);
                    oCol.setVisible(true);

                    oTable.removeColumn(oCol);
                    oTable.insertColumn(oCol, iIndex);
                }.bind(this));

                var aSorter = [];
                oState.Sorter.forEach(function (oSorter) {
                    var oColumn = this.byId(oSorter.key);
                    oColumn.setSorted(true);
                    oColumn.setSortOrder(oSorter.descending ? tableLibrary.SortOrder.Descending : tableLibrary.SortOrder.Ascending);
                    aSorter.push(new Sorter(this.oMetadataHelper.getProperty(oSorter.key).path, oSorter.descending));
                }.bind(this));
                oTable.getBinding("rows").sort(aSorter);
            }

        });
    }
);