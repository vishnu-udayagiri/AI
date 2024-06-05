sap.ui.define(
    ["sap/ui/core/mvc/Controller",
        "sap/m/MessageBox",
        "sap/ui/Device",
        "sap/m/PDFViewer",
        "sap/ui/model/json/JSONModel",
        'sap/ui/export/library',
        'sap/ui/export/Spreadsheet',
        "airindiagst/model/formatter",
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
        MessageBox,
        Device,
        PDFViewer,
        JSONModel, exportLibrary, Spreadsheet, formatter, Engine, SelectionController, SortController, GroupController, MetadataHelper, Sorter) {
        "use strict";
        var EdmType = exportLibrary.EdmType;
        return Controller.extend("airindiagst.controller.GSTInvoices", {
            formatDocumentType: function (sType) {
                switch (sType) {
                    case "INVOICE":
                        return "GST Invoice";
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
            setinvoiceState: function (sValue) {
                if (sValue) {
                    if (sValue === "Cancelled") {
                        return "Error";
                    } else {
                        return "None"
                    }
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
                this.jwt = sessionStorage.getItem("jwt");
                if (!this.jwt) {
                    window.location.replace('/portal/index.html');
                }
                this._registerForP13n();

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("GSTInvoices").attachPatternMatched(this._routeMatched, this);
                this.SendRequest = this.getOwnerComponent().SendRequest;
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                this.IATA = {
                };


            },
            _routeMatched: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                this.getView().byId("fbmc-DocType").setSelectedKeys("INVOICE");
                this.byId("tbl_gstInvoices").setVisible(false);
                this.byId("panel_table").setVisible(false);
                this.getView().byId("fbmc-GSTINAI").removeAllSelectedItems();
                this.getView().byId("fbmc-DocType").setSelectedKeys("INVOICE");
                this.getView().byId("fbinp-pnrNumber").removeAllTokens();
                this.getView().byId("fbinp-iataNumber").removeAllTokens();
                this.getView().byId("fbinp-ticketNumber").removeAllTokens();
                this.getView().byId("fbinp-invoiceNumber").removeAllTokens();
                this.getView().byId("fbinp-buyername").removeAllTokens();
                this.getView().byId("fbinp-GSTIN").removeAllTokens();


                this.getView().byId("fbinp-passengername").removeAllTokens();
                this.getView().byId("fbdat-invoiceDate").setValue("");
                this.getView().byId("fbmc-GSTINAI").setSelectedKeys(null);
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
                if (this.buyerNameDialogs) {
                    this.buyerNameDialogs.clearSelection(true);
                }
                if (this.passengerNameDialogs) {
                    this.passengerNameDialogs.clearSelection(true);
                }

                const jwt = sessionStorage.getItem("jwt")

                var decodedData;
                if (jwt) {
                    decodedData = JSON.parse(atob(jwt.split('.')[1]));
                }
                this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", " " + decodedData.FirstName + ' ' + decodedData.LastName);
                //this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage",decodedData.Email.split("@")[0]);
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "Documents");
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/hinticon", true);

                this.defaultGSTN_num = "";
                this.defaultperiod = "";
                this.selectedGSTN_array = [];
                this.ISB2A_flag = false;
                this.category = decodedData.category;
                if (decodedData.category == "07") {
                    decodedData.ISB2A = true
                }
                if (decodedData.ISB2A == true) {

                    this.byId("fbinp-iataNumber").setEnabled(true);
                    this.byId("fbinp-company").setVisible(true);
                    if (decodedData.category == "07") {
                        this.byId("b2aSegments").setVisible(false);
                        this.byId("b2aSegments").setSelectedKey("BOOKEDTHROUGH");
                        this.ISB2A_flag = true;
                        this.bookingType = "booked through";
                        this.getView().byId("fbinp-GSTIN").removeAllTokens();

                        // this.byId("fbmc-GSTIN").setSelectedKeys("");
                        this.getView().byId("fbmc-DocType").setSelectedKeys("INVOICE");
                        this.byId("tbl_gstInvoices").setVisible(false);
                        this.byId("panel_table").setVisible(false);
                        //  this.changeB2AViewFlag = true;  
                        this.byId("buyergst").setVisible(false);
                        // this.byId("fbmc-GSTIN").setSelectedKeys(this.defaultGSTN_num);
                        // this.byId("fbinp-iataNumber").removeAllTokens();
                    } else {
                        this.byId("b2aSegments").setVisible(true);
                        this.byId("b2aSegments").setSelectedKey("MYBOOKINGS");
                        this.ISB2A_flag = true;
                        this.bookingType = "my bookings";
                        // this.changeB2AViewFlag = true;  
                        this.byId("buyergst").setVisible(true);
                        // this.byId("fbmc-GSTIN").setSelectedKeys(this.defaultGSTN_num);
                        this.byId("fbinp-iataNumber").removeAllTokens();
                    }

                } else {
                    this.ISB2A_flag = false;
                    this.bookingType = "my bookings";
                    this.changeB2AViewFlag = false;
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
                // this.byId("fbmc-GSTIN").setSelectedKeys(this.selectedGSTN_array);

                this.Fetch_GSTDetails();
            },
            Fetch_GSTDetails: function () {
                var _self = this;
                this.filterJson = {

                };
                this.loopfilters = {};
                var IATA;
                var skip = "0";
                var top = "5";
                var filterval = {

                };
                if (this.ISB2A_flag == true) {
                    filterval.bookingType = this.bookingType;
                } else {
                    filterval.bookingType = "my bookings";
                }
                //filterval.pageNumber = 1;
                // filterval.pageSize = 5000;
                filterval.apiType = "Documents";
                filterval.isInitial = true;
                //  filterval.enableDefaultGSTIN = true;
                filterval.pageNumber = 1;
                filterval.pageSize = 500;
                this.loopfilters = filterval;

                this.SendRequest(this, "/portal-api/portal/v1/get-user-invoices", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                    if (data) {
                        _self.GSTDetails = data;
                        console.log(data)

                        _self.oModel = new sap.ui.model.json.JSONModel([]);
                        _self.oModel.setData(_self.GSTDetails.invoices);
                        var oModelData = new sap.ui.model.json.JSONModel();
                        _self.filterJson = {

                        };
                        _self.filterJson = _self.GSTDetails.filters;
                        _self.defaultGSTN_num = _self.GSTDetails.filters.defaultGSTIN;
                        _self.defaultperiod = _self.GSTDetails.filters.invoiceFilter;
                        oModelData.setData(_self.filterJson);
                        // if (_self.ISB2A_flag) {
                        //     _self.filterJson.iataNumber = data.filters.agentName;     
                        // }
                        _self.getView().setModel(oModelData, "FilterDatamodel");
                        _self.getView().setModel(_self.oModel, "GSTDetailsModel");
                        _self.uniqueGSTDetails.results = _self.GSTDetails.distinctSupplierGstin;
                        _self.oModel = new sap.ui.model.json.JSONModel([]);
                        _self.oModel.setData(_self.uniqueGSTDetails);
                        _self.getView().setModel(_self.oModel, "uniqueGSTDetailsModel");
                        // _self.selectedGSTN_array.push(_self.defaultGSTN_num,);
                        _self.byId("buyergst").setVisible(true);
                        //  _self.byId("fbmc-GSTIN").setSelectedKeys(_self.defaultGSTN_num);
                        _self.byId("fbmc-TIMELINE").setSelectedKey(_self.defaultperiod);

                        //_self.getView().byId("container-airindiagst---GSTInvoices--fbmc-GSTIN").setSelectedKeys(_self.selectedGSTN_array);
                        //_self.getView().byId("fbmc-GSTIN").setSelectedItems(_self.selectedGSTN_array);

                        _self.onSearch();

                        sap.ui.core.BusyIndicator.hide();
                    } else {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error("Something went wrong.\n Please refresh and try again.");
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
                    var invnoSH = oEvent.getParameter("value");
                    if (invnoSH != "") {
                        this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "passengerGSTIN": invnoSH, "apiType": "Documents" }), (_self, data, message) => {
    
                            var oModelData = new sap.ui.model.json.JSONModel();
                            if ((data != null)) {
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
                            }else{
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
                    var _self = this;
                    if (this.ISB2A_flag == true) {
                        filterval.bookingType = this.bookingType;
                    } else {
                        filterval.bookingType = "my bookings";
                    }
                    if (!oEvent) {
                        this.filtered_GSTDetails.invoices = this.GSTDetails.invoices.filter(function (item) {
                            return _self.selectedGSTN_array.includes(item.SUPPLIERGSTIN);
                        });
                        // _self.getView().byId("fbmc-GSTIN").setSelectedKeys(_self.selectedGSTN_array[0]);
                        // _self.getView().byId("title").setText("Documents(" + _self.GSTDetails.invoices.length + ")");
                        if (_self.GSTDetails.invoices.length > 0) {
                            _self.getView().byId("morelink").setVisible(true);
                            _self.getView().byId("title").setText("Documents(1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");
                            //  _self.getView().byId("morelink").setText("(1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ") More..");

                        } else {
                            _self.getView().byId("title").setText("Documents(" + _self.GSTDetails.invoices.length + ")");
                            _self.getView().byId("morelink").setVisible(false);

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
                        _self.getView().getModel("GSTDetailsModel").setData(_self.GSTDetails);
                        _self.getView().getModel("GSTDetailsModel").refresh();
                        // _self.getView().getModel("uniqueGSTDetailsModel").refresh();
                        _self.getView().getModel("FilterDatamodel").refresh();
                        if (_self.bookingType == "booked through") {
                            if (!_self.iataNumberDialog) {
                                _self.iataNumberDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.iataNumberFIlterDialog", _self);
                                _self.getView().addDependent(_self.iataNumberDialog);
                            }
                            if (_self.iataNumberDialog) {
                                _self.iataNumberDialog.clearSelection(true);
                            }
                        }
                        _self.byId("panel_table").setVisible(true);

                        _self.byId("tbl_gstInvoices").setVisible(true);

                        sap.ui.core.BusyIndicator.hide();
                        // if(_self.GSTDetails.totalInvoices > 5000){
                        //     var len = _self.GSTDetails.totalInvoices/5000;
                        //     for(var i = 0;i<len; i++){

                        //     }
                        // }

                    } else {
                        sap.ui.core.BusyIndicator.show();
                        this.loopfilters = {};
                        // if (filterval.bookingType == "my bookings") {
                        //     if (this.getView().byId("fbmc-GSTIN").getSelectedKeys().length < 1) {
                        //         MessageBox.error("Please select atleast one Passenger GSTIN");
                        //         sap.ui.core.BusyIndicator.hide();
                        //         return false;

                        //     }

                        // }
                        if (this.getView().byId("fbmc-DocType").getSelectedKeys()) {
                            filterval.documentType = this.getView().byId("fbmc-DocType").getSelectedKeys();

                        }
                        if (this.getView().byId("fbinp-pnrNumber").getTokens().length > 0) {
                            // var fieldName = "pnr";
                            var pnrTokens = this.getView().byId("fbinp-pnrNumber").getTokens();
                            var pnrToken = pnrTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var pnrarr = pnrToken.split(',');
                            filterval.pnr = pnrarr;
                        }

                        if (this.getView().byId("fbinp-invoiceNumber").getTokens().length > 0) {
                            var invTokens = this.getView().byId("fbinp-invoiceNumber").getTokens();
                            var invToken = invTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var invarr = invToken.split(',');
                            filterval.invoiceNumber = invarr;
                        }
                        if (this.getView().byId("fbinp-buyername").getTokens().length > 0) {
                            // var fieldName = "billToName";
                            var buyerTokens = this.getView().byId("fbinp-buyername").getTokens();
                            var buyerToken = buyerTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var buyerarr = buyerToken.split(',');

                            filterval.billToName = buyerarr;
                            // var iata_num = filterval.iataNumber;
                        }
                        if (this.getView().byId("fbinp-passengername").getTokens().length > 0) {
                            // var fieldName = "billToName";
                            var passengerTokens = this.getView().byId("fbinp-passengername").getTokens();
                            var passengerToken = passengerTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var passengerarr = passengerToken.split(',');

                            filterval.passengerName = passengerarr;
                            // var iata_num = filterval.iataNumber;
                        }
                        if (this.getView().byId("fbinp-ticketNumber").getTokens().length > 0) {
                            // var fieldName = "ticketNumber";
                            var ticTokens = this.getView().byId("fbinp-ticketNumber").getTokens();
                            var ticToken = ticTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var ticarr = ticToken.split(',');
                            filterval.ticketNumber = ticarr;
                            // var tkt_num = filterval.ticketNumber;
                        }
                        if (this.getView().byId("fbinp-iataNumber").getTokens().length > 0) {
                            var iataNumber = this.getView().byId("fbinp-iataNumber").getTokens();
                            var iataNumber = iataNumber.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var iata_num = iataNumber.split(',');
                            filterval.iataNumber = iata_num;
                        }
                        if (this.getView().byId("fbmc-TIMELINE").getSelectedKey()) {
                            var fieldName = "invoiceFilter";
                            filterval.invoiceFilter = this.getView().byId("fbmc-TIMELINE").getSelectedKey();
                            var TIMELINE_num = filterval.invoiceFilter;
                        }
                        if (this.getView().byId("fbinp-GSTIN").getTokens().length > 0) {
                            // var fieldName = "passengerGSTIN";
                            // filterval.passengerGSTIN = this.getView().byId("fbmc-GSTIN").getSelectedKeys();
                            // var TIMELINE_num = filterval.passengerGSTIN;
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
                            var TIMELINE_num = filterval.supplierGSTIN;
                        }
                        if (this.getView().byId("fbdat-DateofIssue").getValue()) {
                            if (this.byId("fbdat-DateofIssue").isValidValue()) {
                                var daterange = this.getView().byId("fbdat-DateofIssue").getValue().split("to");
                                filterval.issuanceFrom = daterange[0].trim();
                                filterval.issuanceTo = daterange[1].trim();
                            } else {
                                MessageBox.error("Please choose a valid Date of issue");
                                sap.ui.core.BusyIndicator.hide();
                                return false;
                            }

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
                                MessageBox.error("Please choose a valid Document date");
                                sap.ui.core.BusyIndicator.hide();
                                return false;
                            }
                        }
                        filterval.apiType = "Documents";
                        // if(this.category == "07"){
                        //     this.filterJson.iataNumber.forEach(function (token) {
                        //         // tokensToSelect.push(new sap.m.Token({ text: token }));
                        //         _self.getView().byId("fbinp-iataNumber").addToken(new sap.m.Token({
                        //             text: token.IATANUMBER
                        //         }));
                        //     });
                        // }
                        if (this.changeB2AViewFlag) {
                            filterval.isInitial = true;
                            //    filterval.enableDefaultGSTIN = true;
                            filterval.documentType = [];
                            filterval.passengerGSTIN = [];
                        } else {
                            filterval.isInitial = false;
                            // filterval.enableDefaultGSTIN = false;
                        }
                        //  filterval.isAmended = false;
                        // this.SendRequest(this, "/portal-api/portal/v1/get-user-invoices?invoiceFilter=" + TIMELINE_num +"&invoiceNumber=" + inv_num +"&iataNumber=" + iata_num +"&ticketNumber=" + tkt_num, "GET", {}, JSON.stringify(filterval) , (_self, data, message) => {
                        filterval.pageNumber = 1;
                        filterval.pageSize = 500;
                        this.loopfilters = filterval;
                        this.SendRequest(this, "/portal-api/portal/v1/get-user-invoices", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                            if (data) {
                                _self.changeB2AViewFlag = false;
                                _self.GSTDetails = data;
                                //_self.getView().byId("title").setText("Documents(" + _self.GSTDetails.invoices.length + ")");
                                if (_self.GSTDetails.invoices.length > 0) {
                                    _self.getView().byId("morelink").setVisible(true);
                                    _self.getView().byId("title").setText("Documents(1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");
                                    //  _self.getView().byId("morelink").setText("(1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ") More..");

                                } else {
                                    _self.getView().byId("title").setText("Documents(" + _self.GSTDetails.invoices.length + ")");
                                    _self.getView().byId("morelink").setVisible(false);

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
                                if (filterval.isInitial == true) {
                                    _self.getView().getModel("FilterDatamodel").setData(_self.GSTDetails.filters);
                                    _self.getView().getModel("FilterDatamodel").refresh();
                                }
                                _self.getView().getModel("GSTDetailsModel").setData(_self.GSTDetails);
                                _self.getView().getModel("GSTDetailsModel").refresh();
                                _self.byId("panel_table").setVisible(true);

                                _self.byId("tbl_gstInvoices").setVisible(true);
                                sap.ui.core.BusyIndicator.hide();
                            } else {
                                sap.ui.core.BusyIndicator.hide();
                                MessageBox.error("Something went wrong.\n Please refresh and try again.");
                            }

                        });
                    }
                }
            },
            onUpdateFinished: function () {
                debugger;
            },
            onScroll: function (oEvent) {

                var totalPages = Math.ceil(this.GSTDetails.totalInvoices / 500);
                // if(this.loopfilters.isInitial == true){
                //     if (this.getView().byId("fbmc-DocType").getSelectedKeys()) {
                //         this.loopfilters.documentType = this.getView().byId("fbmc-DocType").getSelectedKeys();

                //     }
                //     if(this.bookingType){
                //     if(this.bookingType == "my bookings"){
                //     if (this.getView().byId("fbmc-GSTIN").getSelectedKeys() != "") {
                //         var fieldName = "passengerGSTIN";
                //         this.loopfilters.passengerGSTIN = this.getView().byId("fbmc-GSTIN").getSelectedKeys();
                //       //  var TIMELINE_num = filterval.passengerGSTIN;
                //     }
                //     }
                //     }

                // }
                if (this.loopfilters.pageNumber <= totalPages) {
                    sap.ui.core.BusyIndicator.show();
                    this.loopfilters.pageNumber = this.loopfilters.pageNumber + 1;

                    // this.loopfilters.isInitial = false;
                    //this.loopfilters.enableDefaultGSTIN = false;

                    this.SendRequest(this, "/portal-api/portal/v1/get-user-invoices", "POST", {}, JSON.stringify(this.loopfilters), (_self, data, message) => {
                        if (data.invoices.length > 0) {
                            _self.GSTDetails.invoices = [..._self.GSTDetails.invoices, ...data.invoices];
                            // _self.GSTDetails.invoices.concat(data.invoices);
                            _self.getView().byId("title").setText("Documents(1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");

                            //    _self.getView().byId("morelink").setText("(1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ") More..");

                            _self.getView().getModel("GSTDetailsModel").refresh();
                        }
                        sap.ui.core.BusyIndicator.hide();
                    });
                }

            },
            //For handling changes in date range with respect to selecting period
            handleSelectedPeriod: function (oEvent) {
                var selectedItemKey = oEvent.getSource().getSelectedKey();
                var invoiceDateFilter = this.getView().byId("fbdat-invoiceDate");
                var minDate, maxDate;
                if (selectedItemKey === "CM") {
                    // Set minDate and maxDate for Current Month
                    // Calculate current month start and end dates
                    var currentDate = new Date();
                    minDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                } else if (selectedItemKey === "PM") {
                    // Set minDate and maxDate for Previous Month
                    // Calculate previous month start and end dates
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
            //for identfying unique gstn numbers to populate in multicombobox
            unique_GSTN: function (GSTDetails) {
                debugger;
                var uniqueorginalGstins = {};
                GSTDetails.results.forEach(function (item) {
                    uniqueorginalGstins[item.orginalGstin] = true;
                });

                var uniqueorginalGstinsArray = Object.keys(uniqueorginalGstins).map(function (orginalGstin) {
                    return { orginalGstin: orginalGstin };
                });

                // Create a new JSON object to hold the unique orginalGstins array
                var resultJSON = {
                    uniqueorginalGstins: uniqueorginalGstinsArray
                };
                this.uniqueGSTDetails.results = resultJSON.uniqueorginalGstins;
                this.uniqueGSTDetails =
                    this.oModel = new sap.ui.model.json.JSONModel([]);
                this.oModel.setData(this.uniqueGSTDetails);
                this.getView().setModel(this.oModel, "uniqueGSTDetailsModel");
            },
            // for identifying the selected gstin to a new array
            handleSelectedGSTIN: function () {
                this.selectedGSTN_array = [];
                var selectedGSTN = this.getView().byId("fbmc-GSTIN").getSelectedItems();
                this.selectedGSTN_array = selectedGSTN.map(function (oToken) {
                    return oToken.mProperties.key;
                });
            },
            // for invoice number filter
            handleValueHelpinvoiceNum: function (oEvent) {
                // this.setValuesToSearchHelp(oEvent);
                var sInputValue = oEvent.getSource().getValue();
                //this.InputId = oEvent.getSource().getId();
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.filterInvnum) {
                    this.filterInvnum = sap.ui.xmlfragment("airindiagst.view.Fragment.invoiceNumberFIlterDialog", this);
                    this.getView().addDependent(this.filterInvnum);
                }
                // var oListItem = sap.ui.getCore().byId("FrgmtIDPlantExcel");
                var oList = this.filterInvnum._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.filterInvnum._aSelectedItems;
                this.filterInvnum.open();
                //this._OpenBusyDialogNoDelay();

            },
            handlecancelinv: function (oEvent) {
                this.filterInvnum.close();

            },
            handleValueHelpCloseinvoiceNum: function (oEvent) {
                //remove all tokens before you close the value help
                var token = [];
                this.aContexts = oEvent.getParameter("selectedContexts");
                if (this.aContexts && this.aContexts.length) {
                    this.aContexts.map(function (oContext) {
                        token.push(oContext.getObject().key);
                        return oContext.getObject().key;
                    }).join(", ");
                }
                // else {
                //     MessageBox.show("No new item was selected.");
                // }
                this.byId("fbinp-invoiceNumber").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-invoiceNumber");
                var aTitle = [];
                //  this.oListPlant = this.filterInvnum._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject();
                    aTitle.push(text);
                }
                //adding the selected values to the tokens.
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

                /*var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
                if (oSelectedItem) {
                    this.getView().byId(this.inputId).setValue(oSelectedItem);
                }
                oEvent.getSource().getBinding("items").filter([]);*/
            },
            handleValueHelpSearchinvoiceNum: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var invnoSH = oEvent.getParameter("value");
                if (invnoSH != "") {
                    this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "invoiceNumber": invnoSH, "apiType": "Documents" }), (_self, data, message) => {

                        var oModelData = new sap.ui.model.json.JSONModel();
                        if ((data != null)) {
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
                        }else{
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
            //for pnr number
            handleValueHelpPNRNum: function (oEvent) {
                // this.setValuesToSearchHelp(oEvent);
                var sInputValue = oEvent.getSource().getValue();
                //this.InputId = oEvent.getSource().getId();
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.pnrNumDialog) {
                    this.pnrNumDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.PNRdetails", this);
                    this.getView().addDependent(this.pnrNumDialog);
                }
                // var oListItem = sap.ui.getCore().byId("FrgmtIDPlantExcel");
                var oList = this.pnrNumDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.pnrNumDialog._aSelectedItems;
                this.pnrNumDialog.open();
                //this._OpenBusyDialogNoDelay();

            },
            handlecancelpnr: function (oEvent) {
                this.pnrNumDialog.close();

            },
            handleValueHelpClosepnrNum: function (oEvent) {
                //remove all tokens before you close the value help
                var token = [];
                this.aContexts = oEvent.getParameter("selectedContexts");
                if (this.aContexts && this.aContexts.length) {
                    this.aContexts.map(function (oContext) {
                        token.push(oContext.getObject().key);
                        return oContext.getObject().key;
                    }).join(", ");
                }
                // else {
                //     MessageBox.show("No new item was selected.");
                // }
                this.byId("fbinp-pnrNumber").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-pnrNumber");
                var aTitle = [];
                this.oListPlant = this.pnrNumDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject();
                    aTitle.push(text);
                }
                //adding the selected values to the tokens.
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

                /*var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
                if (oSelectedItem) {
                    this.getView().byId(this.inputId).setValue(oSelectedItem);
                }
                oEvent.getSource().getBinding("items").filter([]);*/
            },
            handleValueHelpSearchpnrNum: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var invnoSH = oEvent.getParameter("value");
                if (invnoSH != "") {
                    this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "pnr": invnoSH, "apiType": "Documents" }), (_self, data, message) => {

                        var oModelData = new sap.ui.model.json.JSONModel();
                        if ((data != null)) {
                            _self.filterJson;
                            _self.filterJsonUpdated = data.filters;
                            _self.filterJson.pnr = _self.filterJson.pnr.concat(data.filters.pnr.filter(function (item) {
                                return _self.filterJson.pnr.indexOf(item) === -1; // Check for uniqueness
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
                        }else{
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
            //for company filter
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
                //oEvent.getParameter("selectedContexts");
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
            //for iata number filter
            handleValueHelpiataNum: function (oEvent) {
                // this.setValuesToSearchHelp(oEvent);
                var sInputValue = oEvent.getSource().getValue();

                //this.InputId = oEvent.getSource().getId();
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.iataNumberDialog) {
                    this.iataNumberDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.iataNumberFIlterDialog", this);
                    this.getView().addDependent(this.iataNumberDialog);
                }
                // var oListItem = sap.ui.getCore().byId("FrgmtIDPlantExcel");
                var oList = this.iataNumberDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.iataNumberDialog._aSelectedItems;
                this.iataNumberDialog.open();

                //this._OpenBusyDialogNoDelay();

            },
            handlecanceliata: function (oEvent) {
                this.iataNumberDialog.close();

            },
            handleValueHelpCloseiataNum: function (oEvent) {
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
                this.byId("fbinp-iataNumber").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-iataNumber");
                var aTitle = [];
                this.oListPlant = this.iataNumberDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject().IATANUMBER;
                    aTitle.push(text);
                }
                //adding the selected values to the tokens.
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
                        new sap.ui.model.Filter("IATANUMBER", sap.ui.model.FilterOperator.Contains, sValue),
                        new sap.ui.model.Filter("LEGALNAME", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },
            //for ticket number filter
            handleValueHelpticketNum: function (oEvent) {
                // this.setValuesToSearchHelp(oEvent);
                var sInputValue = oEvent.getSource().getValue();
                //this.InputId = oEvent.getSource().getId();
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.ticketNumberDialog) {
                    this.ticketNumberDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.ticketNumberFIlterDialog", this);
                    this.getView().addDependent(this.ticketNumberDialog);
                }
                // var oListItem = sap.ui.getCore().byId("FrgmtIDPlantExcel");
                var oList = this.ticketNumberDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.ticketNumberDialog._aSelectedItems;
                this.ticketNumberDialog.open();
                //this._OpenBusyDialogNoDelay();

            },
            handlecancelticket: function (oEvent) {

                this.ticketNumberDialog.close();
            },
            handleValueHelpCloseticketNum: function (oEvent) {
                //remove all tokens before you close the value help
                var token = [];
                this.aContexts = oEvent.getParameter("selectedContexts");
                if (this.aContexts && this.aContexts.length) {
                    this.aContexts.map(function (oContext) {
                        token.push(oContext.getObject().key);
                        return oContext.getObject().key;
                    }).join(", ");
                }
                // else {
                //     MessageBox.show("No new item was selected.");
                // }
                this.byId("fbinp-ticketNumber").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-ticketNumber");
                var aTitle = [];
                this.oListPlant = this.ticketNumberDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject();
                    aTitle.push(text);
                }
                //adding the selected values to the tokens.
                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("fbinp-ticketNumber").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                const sId = this.byId("fbinp-ticketNumber");

                sId.getAggregation("tokenizer").setEditable(false);

                /*var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
                if (oSelectedItem) {
                    this.getView().byId(this.inputId).setValue(oSelectedItem);
                }
                oEvent.getSource().getBinding("items").filter([]);*/
            },

            handleValueHelpSearchticketNum: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var invnoSH = oEvent.getParameter("value");
                if (invnoSH != "") {
                    this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "ticketNumber": invnoSH, "apiType": "Documents" }), (_self, data, message) => {

                        var oModelData = new sap.ui.model.json.JSONModel();
                        if ((data != null)) {
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
                        }else{
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
            //for handling the segment view of B2A
            onchangeB2Aview: function (oEvent) {

                var segmentkey = oEvent.getSource().getSelectedKey();
                var segmentItem = oEvent.getSource().getSelectedItem();
                var _self = this;
                this.changeB2AViewFlag = true;
                if (segmentkey == "BOOKEDTHROUGH") {
                    this.byId("b2aSegments").setSelectedKey("BOOKEDTHROUGH");
                    // this.byId("fbmc-GSTIN").setSelectedKeys("");
                    //this.byId("fbinp-iataNumber").removeAllTokens();
                    this.getView().byId("fbmc-DocType").setSelectedKeys("INVOICE");
                    this.byId("tbl_gstInvoices").setVisible(false);
                    this.byId("panel_table").setVisible(false);
                    this.getView().byId("fbinp-pnrNumber").removeAllTokens();
                    this.getView().byId("fbinp-iataNumber").removeAllTokens();
                    this.getView().byId("fbinp-ticketNumber").removeAllTokens();
                    this.getView().byId("fbinp-invoiceNumber").removeAllTokens();
                    this.getView().byId("fbinp-buyername").removeAllTokens();
                    this.getView().byId("fbinp-passengername").removeAllTokens();
                    this.getView().byId("fbinp-GSTIN").removeAllTokens();

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
                    if (this.buyerNameDialogs) {
                        this.buyerNameDialogs.clearSelection(true);
                    }
                    if (this.passengerNameDialogs) {
                        this.passengerNameDialogs.clearSelection(true);
                    }
                    // _self.filterJson.iataNumber.forEach(function (token) {
                    //     // tokensToSelect.push(new sap.m.Token({ text: token }));
                    //     _self.getView().byId("fbinp-iataNumber").addToken(new sap.m.Token({
                    //         text: token.IATANUMBER
                    //     }));
                    // });

                    //this.byId("fbinp-iataNumber").setSelectedKeys(this.byId("fbinp-iataNumber").getKeys());
                    this.byId("buyergst").setVisible(false);
                    this.bookingType = "booked through";
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
                    this.getView().byId("fbinp-passengername").removeAllTokens();
                    this.getView().byId("fbdat-invoiceDate").setValue("");
                    this.getView().byId("fbdat-invoiceDate").setValue("");
                    this.getView().byId("fbmc-GSTINAI").setSelectedKeys(null);
                    this.byId("buyergst").setVisible(true);
                    // this.byId("fbmc-GSTIN").setSelectedKeys(this.defaultGSTN_num);
                    this.byId("fbmc-TIMELINE").setSelectedKey(this.defaultperiod);
                    this.byId("b2aSegments").setSelectedKey("MYBOOKINGS");

                    this.bookingType = "my bookings";
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
                    if (this.buyerNameDialogs) {
                        this.buyerNameDialogs.clearSelection(true);
                    }
                    if (this.passengerNameDialogs) {
                        this.passengerNameDialogs.clearSelection(true);
                    }
                    this.onSearch(oEvent);

                }
            },
            onPressExportExcel: function () {
                var filterval = {

                };
                var columns = {

                };
                columns = {
                    "DOCUMENTTYPE": "Document Type",
                    "INVOICENUMBER": "Invoice Number",
                    "INVOICEDATE": "Invoice Date",
                    "TICKETNUMBER": "Ticket No.",
                    "TICKETISSUEDATE": "Ticket Issue Date",
                    "PNR": "PNR",
                    "IATANUMBER": "IATA Code",
                    "BILLTONAME": "Buyer Name",
                    "PASSANGERNAME": "Passenger Name",
                    "PASSENGERGSTIN": "Passenger GSTIN",
                    "SUPPLIERGSTIN": "Supplier GSTIN",
                    "NETTAXABLEVALUE": "Net Taxable Value",
                    "COMBINEDTAXRATE": "Combined Tax Rate",
                    "TOTALTAX": "Total Tax Amount",
                    "TOTALINVOICEAMOUNT": "Total Invoice Amount",
                    "CGSTRATE": "CGST Rate (%)",
                    "COLLECTEDCGST": "CGST Amount",
                    "SGSTRATE": "SGST Rate (%)",
                    "COLLECTEDSGST": "SGST Amount",
                    "UTGSTRATE": "UTGST Rate (%)",
                    "COLLECTEDUTGST": "UTGST Amount",
                    "IGSTRATE": "IGST Rate (%)",
                    "COLLECTEDIGST": "IGST Amount",
                    "TRANSACTIONTYPE": "Transaction Type",
                    "ISSUEINDICATOR": "Issue Indicator",
                    "INVOICESTATUS": "Invoice Status"
                };
                sap.ui.core.BusyIndicator.show();
                // Assuming you have a reference to the table
                var oTable = this.byId("tbl_gstInvoices");

                // Get the selected indices
                var aSelectedIndices = oTable.getSelectedIndices();

                // Create an array to store the selected invoice numbers
                var aSelectedInvoiceNumbers = [];
                var oModel = oTable.getModel("GSTDetailsModel");
                // Loop through the selected indices and retrieve the INVOICENUMBER
                aSelectedIndices.forEach(function (aSelectedIndices) {
                    var oContext = oTable.getContextByIndex(aSelectedIndices);
                    var oData = oModel.getProperty(null, oContext);
                    const sInvoiceNumber = oData.INVOICENUMBER;
                    // var oBindingContext = oTable.getContextByIndex(aSelectedIndices);
                    // var sInvoiceNumber = oBindingContext.getProperty().INVOICENUMBER;
                    aSelectedInvoiceNumbers.push(sInvoiceNumber);
                });
                if (aSelectedInvoiceNumbers.length > 0) {
                    filterval.invoiceNumber = aSelectedInvoiceNumbers;
                    filterval.generateExcel = true;
                    if (this.ISB2A_flag == true) {
                        filterval.bookingType = this.bookingType;
                    }
                    filterval.apiType = "Documents";
                    filterval.columns = columns;
                    // Now, aSelectedInvoiceNumbers contains the INVOICENUMBER of all selected rows
                    console.log("Selected Invoice Numbers: ", aSelectedInvoiceNumbers);

                    this.SendRequest(this, "/portal-api/portal/v1/get-user-invoices", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                        if (data) {
                            var base64Data = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + data.excel;
                            console.log(base64Data);
                            const link = document.createElement('a');

                            link.href = base64Data;

                            link.download = "GST Invoices";

                            link.click();
                        } else {
                            MessageBox.error("Something went wrong.\nPlease refresh and try again");

                        }


                        sap.ui.core.BusyIndicator.hide();
                    });
                } else {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.information("Please select the documents for exporting as excel.");
                }

            },
            onButtonDownloadPress: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                const oTable = this.byId("tbl_gstInvoices");
                const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                const oSelIndices = oTable.getSelectedIndices();
                // const oSelIndices = oTable.getBinding().aIndices;
                const aInvoices = [];
                if (oSelIndices.length) {
                    var oModel = oTable.getModel("GSTDetailsModel");
                    oSelIndices.forEach(function (iIndex) {
                        var oContext = oTable.getContextByIndex(iIndex);
                        var oData = oModel.getProperty(null, oContext);
                        const ID = oData.ID;
                        // oSelIndices.forEach(index => {
                        //     const ID = oTableData[index].ID
                        aInvoices.push({ ID })
                    });
                    if (oSelIndices.length > 20000) {
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageBox.warning("Downloading PDF is restricted to only 20000 Documents.Please select lesser documents.")
                    } else {
                        if (oSelIndices.length > 100) {
                            sap.ui.core.BusyIndicator.hide();
                            sap.m.MessageBox.warning('You have selected more than 100 invoices for downloading.It will Take some time to download.\n Do you want to continue ?', {
                                actions: ["Yes", MessageBox.Action.NO],
                                emphasizedAction: "Yes",
                                onClose: function (oAction) {
                                    if (oAction === "Yes") {
                                        sap.ui.core.BusyIndicator.show();
                                        this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices: aInvoices }), (_self, data, message) => {
                                            //   const invoices = data.invoicePDFs;
                                            const invoices = data.invoice;
                                            if (oSelIndices.length == 1) {

                                                const base64Data = "data:application/pdf;base64," + data.invoice;
                                                const link = document.createElement('a');
                                                link.href = base64Data;
                                                link.download = `Invoice - ${data.invoiceNumber}`;
                                                link.click();

                                            } else {
                                                const base64Data = "data:application/zip;base64," + invoices;
                                                const link = document.createElement('a');
                                                link.href = base64Data;
                                                link.download = `Documents`;
                                                link.click();
                                            }
                                            sap.ui.core.BusyIndicator.hide();
                                            const responseData = data.invoiceNumber;
                                            if (responseData.notGenerated.length > 0) {
                                                const generatedString = responseData.notGenerated.join(', ');
                                                MessageBox.warning("List of documents pending for generating PDF.\nPlease try individual downloading for the following..", {
                                                    title: "Download status",
                                                    id: "messageBoxId1",
                                                    details: generatedString,
                                                    contentWidth: "100px"
                                                });
                                            }
                                        });
                                    } else {
                                        sap.ui.core.BusyIndicator.hide();
                                    }
                                }.bind(this)
                            });
                        } else {
                            this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices: aInvoices }), (_self, data, message) => {
                                const invoices = data.invoice;
                                if (oSelIndices.length == 1) {

                                    const base64Data = "data:application/pdf;base64," + data.invoice;
                                    const link = document.createElement('a');
                                    link.href = base64Data;
                                    link.download = `Invoice - ${data.invoiceNumber}`;
                                    link.click();

                                } else {
                                    const base64Data = "data:application/zip;base64," + invoices;
                                    const link = document.createElement('a');
                                    link.href = base64Data;
                                    link.download = `Documents`;
                                    link.click();
                                }
                                // if (invoices.length > 0) {
                                //     invoices.forEach(element => {
                                //         const base64Data = "data:application/zip;base64," + element.invoice;
                                //         const link = document.createElement('a');
                                //         link.href = base64Data;
                                //         link.download = `Invoice - ${element.invoiceNumber}`;
                                //         link.click();
                                //     });
                                // }
                                sap.ui.core.BusyIndicator.hide();
                                const responseData = data.invoiceNumber;
                                if (responseData.notGenerated.length > 0) {
                                    const generatedString = responseData.notGenerated.join(', ');
                                    MessageBox.warning("List of documents pending for generating PDF.\nPlease try individual downloading for the following..", {
                                        title: "Download status",
                                        id: "messageBoxId1",
                                        details: generatedString,
                                        contentWidth: "100px"
                                    });
                                }
                            });
                        }
                    }
                } else {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.information("Please select the documents for downloading.");
                }
            },
            onButtonDownloadPresssingle: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                //  const oTable = this.byId("tbl_amendment");
                var row = oEvent.getParameter("row").getIndex()

                // const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                const aInvoices = [];
                aInvoices.push({ ID: oEvent.getParameter("row").getBindingContext("GSTDetailsModel").getProperty("ID") });
                //  aInvoices.push({ID:oTableData[row].ID});
                // if (oTableData.length) {
                //     oTableData.forEach(index => {
                //         const ID = index.ID
                //         aInvoices.push({ ID })
                //     });
                this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices: aInvoices }), (_self, data, message) => {
                    const invoices = data.invoice;
                    if (invoices.length > 0) {

                        const base64Data = "data:application/pdf;base64," + data.invoice;
                        const link = document.createElement('a');
                        link.href = base64Data;
                        link.download = `Invoice - ${data.invoiceNumber}`;
                        link.click();

                    }
                    sap.ui.core.BusyIndicator.hide();
                });
                // }
            },
            // onButtonDownloadPress: function () {
            //     sap.ui.core.BusyIndicator.show();
            //     this.SendRequest(this, "/portal-api/portal/v1/sample-download-pdf", "GET", {}, null, (_self, data, message) => {
            //         var base64Data = data.file;
            //         // var base64DataNew = data;
            //         console.log(base64Data);

            //         const link = document.createElement('a');

            //         link.href = base64Data;

            //         link.download = "GST Invoices";

            //         link.click();


            //         sap.ui.core.BusyIndicator.hide();
            //     });

            // },
            handleValueHelpbuyername: function (oEvent) {
                // this.setValuesToSearchHelp(oEvent);
                var sInputValue = oEvent.getSource().getValue();
                //this.InputId = oEvent.getSource().getId();
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.buyerNameDialogs) {
                    this.buyerNameDialogs = sap.ui.xmlfragment("airindiagst.view.Fragment.buyerFIlterDialog", this);
                    this.getView().addDependent(this.buyerNameDialogs);
                }
                // var oListItem = sap.ui.getCore().byId("FrgmtIDPlantExcel");
                var oList = this.buyerNameDialogs._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.buyerNameDialogs._aSelectedItems;
                this.buyerNameDialogs.open();
                //this._OpenBusyDialogNoDelay();

            },
            handleValueHelpSearchbuyername: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var invnoSH = oEvent.getParameter("value");
                if (invnoSH != "") {
                    this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "billToName": invnoSH, "apiType": "Documents" }), (_self, data, message) => {

                        var oModelData = new sap.ui.model.json.JSONModel();
                        if ((data != null)) {
                            _self.filterJson;
                            _self.filterJsonUpdated = data.filters;
                            _self.filterJson.billToName = _self.filterJson.billToName.concat(data.filters.billToName.filter(function (item) {
                                return _self.filterJson.billToName.indexOf(item) === -1; // Check for uniqueness
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
                        }else{
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
            handlecancelbuyer: function (oEvent) {
                this.buyerNameDialogs.close();
            },
            handleValueHelpClosebuyerName: function (oEvent) {
                //remove all tokens before you close the value help
                var token = [];
                this.aContexts = oEvent.getParameter("selectedContexts");
                if (this.aContexts && this.aContexts.length) {
                    this.aContexts.map(function (oContext) {
                        token.push(oContext.getObject().key);
                        return oContext.getObject().key;
                    }).join(", ");
                }
                // else {
                //     MessageBox.show("No new item was selected.");
                // }
                this.byId("fbinp-buyername").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedItems"),
                    oInput = this.byId("fbinp-buyername");
                var aTitle = [];
                this.oListPlant = this.buyerNameDialogs._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getTitle();
                    aTitle.push(text);
                }
                //adding the selected values to the tokens.
                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("fbinp-buyername").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                var tokens = this.byId("fbinp-buyername").getTokens();

                const sId = this.byId("fbinp-buyername");

                sId.getAggregation("tokenizer").setEditable(false)

                /*var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
                if (oSelectedItem) {
                    this.getView().byId(this.inputId).setValue(oSelectedItem);
                }
                oEvent.getSource().getBinding("items").filter([]);*/
            },
            handleValueHelppassengername: function (oEvent) {
                // this.setValuesToSearchHelp(oEvent);
                var sInputValue = oEvent.getSource().getValue();
                //this.InputId = oEvent.getSource().getId();
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.passengerNameDialogs) {
                    this.passengerNameDialogs = sap.ui.xmlfragment("airindiagst.view.Fragment.passengerFIlterDialog", this);
                    this.getView().addDependent(this.passengerNameDialogs);
                }
                // var oListItem = sap.ui.getCore().byId("FrgmtIDPlantExcel");
                var oList = this.passengerNameDialogs._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.passengerNameDialogs._aSelectedItems;
                this.passengerNameDialogs.open();
                //this._OpenBusyDialogNoDelay();

            },
            handleValueHelpSearchpassengername: function (oEvent) {
                    sap.ui.core.BusyIndicator.show();
                    var _self = this;
                    var invnoSH = oEvent.getParameter("value");
                    if (invnoSH != "") {
                        this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "passengerName": invnoSH, "apiType": "Documents" }), (_self, data, message) => {
    
                            var oModelData = new sap.ui.model.json.JSONModel();
                            if ((data != null)) {
                                _self.filterJson;
                                _self.filterJsonUpdated = data.filters;
                                _self.filterJson.passengerName = _self.filterJson.passengerName.concat(data.filters.passengerName.filter(function (item) {
                                    return _self.filterJson.passengerName.indexOf(item) === -1; // Check for uniqueness
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
                            }else{
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
            handlecancelpassenger: function (oEvent) {
                this.passengerNameDialogs.close();
            },
            handleValueHelpClosepassengerName: function (oEvent) {
                //remove all tokens before you close the value help
                var token = [];
                this.aContexts = oEvent.getParameter("selectedContexts");
                if (this.aContexts && this.aContexts.length) {
                    this.aContexts.map(function (oContext) {
                        token.push(oContext.getObject().key);
                        return oContext.getObject().key;
                    }).join(", ");
                }
                // else {
                //     MessageBox.show("No new item was selected.");
                // }
                this.byId("fbinp-passengername").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedItems"),
                    oInput = this.byId("fbinp-passengername");
                var aTitle = [];
                this.oListPlant = this.passengerNameDialogs._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getTitle();
                    aTitle.push(text);
                }
                //adding the selected values to the tokens.
                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("fbinp-passengername").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                var tokens = this.byId("fbinp-passengername").getTokens();

                const sId = this.byId("fbinp-passengername");

                sId.getAggregation("tokenizer").setEditable(false)

                /*var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
                if (oSelectedItem) {
                    this.getView().byId(this.inputId).setValue(oSelectedItem);
                }
                oEvent.getSource().getBinding("items").filter([]);*/
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
                debugger;
            },
            _registerForP13n: function () {
                var oTable = this.byId("tbl_gstInvoices");
                this.oMetadataHelper = new MetadataHelper([
                    { key: "col_doctype", label: "Document Type", path: "DOCUMENTTYPE" },
                    { key: "col_invnum", label: "Document Number", path: "INVOICENUMBER" },
                    { key: "col_docdate", label: "Document Date", path: "INVOICEDATE" },
                    { key: "col_ticketnum", label: "Ticket Number", path: "TICKETNUMBER" },
                    { key: "col_ticketdate", label: "Ticket Issue Date", path: "TICKETISSUEDATE" },
                    { key: "col_pnrnum", label: "PNR Number", path: "PNR" },
                    { key: "col_iatanumber", label: "IATA Code", path: "IATANUMBER" },
                    { key: "col_billToName", label: "Buyer Name", path: "BILLTONAME" },
                    { key: "col_passengerName", label: "Passenger Name", path: "PASSANGERNAME" },
                    { key: "col_passengergstin", label: "Buyer GSTIN", path: "PASSENGERGSTIN" },
                    { key: "col_suppliergstin", label: "Supplier GSTIN", path: "SUPPLIERGSTIN" },
                    { key: "col_nettax", label: "Net Taxable Value", path: "NETTAXABLEVALUE" },
                    { key: "col_cominedtax", label: "Combined Tax Rate", path: "COMBINEDTAXRATE" },
                    { key: "col_totaltax", label: "Total Tax", path: "TOTALTAX" },
                    { key: "col_totalinvoice", label: "Total Invoice Amount", path: "TOTALINVOICEAMOUNT" },
                    { key: "col_cgstrate", label: "CGST Rate", path: "CGSTRATE" },
                    { key: "col_cgstamount", label: "CGST Amount", path: "COLLECTEDCGST" },
                    { key: "col_sgstrate", label: "SGST Rate", path: "SGSTRATE" },
                    { key: "col_sgstamount", label: "SGST Amount", path: "COLLECTEDSGST" },
                    { key: "col_utgstrate", label: "UTGST Rate", path: "UTGSTRATE" },
                    { key: "col_utgstamount", label: "UTGST Amount", path: "COLLECTEDUTGST" },
                    { key: "col_igstrate", label: "IGST Rate", path: "IGSTRATE" },
                    { key: "col_igstamount", label: "IGST Amount", path: "COLLECTEDIGST" },
                    { key: "col_transactionType", label: "Transaction Type", path: "TRANSACTIONTYPE" },
                    { key: "col_issueindicator", label: "Issue Indicator", path: "ISSUEINDICATOR" },
                    { key: "col_invstatus", label: "Invoice Status", path: "INVOICESTATUS" }
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

                //Apply the state programatically on sorting through the column menu
                //1) Retrieve the current personalization state
                Engine.getInstance().retrieveState(oTable).then(function (oState) {

                    //2) Modify the existing personalization state --> clear all sorters before
                    oState.Sorter.forEach(function (oSorter) {
                        oSorter.sorted = false;
                    });
                    oState.Sorter.push({
                        key: sAffectedProperty,
                        descending: sSortOrder === tableLibrary.SortOrder.Descending
                    });

                    //3) Apply the modified personalization state to persist it in the VariantManagement
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
                if (!oState || !oState.Columns || !Array.isArray(oState.Columns)) {
                    console.log("Invalid state object or missing Columns property.");
                    return; // Exit the function or handle the error appropriately
                } else {
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
            },
            restore: function () {
                var oFilterBar = this.byId("filterbar");
                oFilterBar.getAllFilterItems().forEach(function (oFilterItem) {
                    oFilterItem.setVisibleInFilterBar(true);
                });
            }

        });
    }
);