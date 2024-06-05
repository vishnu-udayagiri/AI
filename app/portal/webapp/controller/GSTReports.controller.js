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
        JSONModel, exportLibrary, formatter, Spreadsheet, Engine, SelectionController, SortController, GroupController, MetadataHelper, Sorter) {
        "use strict";
        var EdmType = exportLibrary.EdmType;
        return Controller.extend("airindiagst.controller.GSTReports", {
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

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("GSTReports").attachPatternMatched(this._routeMatched, this);
                //*******************************
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);

                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/hinticon", true);
                this.configModel = new JSONModel();
                this.getView().setModel(this.configModel);
                this.getView().getModel().setProperty("/toggleVisible", true);
                this.filterGstinModel = new JSONModel();
                this.getView().setModel(this.filterGstinModel, "filterGstinModel");
                this.invoiceModel = new JSONModel({});
                this.getView().setModel(this.invoiceModel, "FilterDatamodel");
                this.requestModel = new JSONModel({});
                this.getView().setModel(this.requestModel, "RequestModel");
                this.SendRequest = this.getOwnerComponent().SendRequest;
                this.filterJson;
                this.requestDetails = {
                    results: []
                }
                // this._registerForP13n();
                this.GSTDetails = {
                    invoices: []
                }
                this.filtered_GSTDetails = {
                    results: []
                }
                this.uniqueGSTDetails = {
                    results: []
                }
                this.selectedGSTN_array = [];

                var oModelData = new sap.ui.model.json.JSONModel();
                this.filterJson = {

                };


            },
            handleSearcherror: function (oEvent) {

                var sValue = oEvent.getParameter("value").trim();
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("msg", sap.ui.model.FilterOperator.Contains, sValue)
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },

            handleSearchInv: function (oEvent) {

                var sValue = oEvent.getParameter("value").trim();
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("invoiceNumber", sap.ui.model.FilterOperator.Contains, sValue)
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },

            handleTableScroll: function (oEvent) {
                var oTable = this.getView().byId("tbl_amendment");
                var iVisibleRowCount = oTable.getVisibleRowCount();
                var iFirstVisibleRow = oTable.getFirstVisibleRow();
                var iTotalRowCount = oTable.getBinding().getLength();

                if (iFirstVisibleRow + iVisibleRowCount >= iTotalRowCount) {
                    // Load more data here and append it to the model
                    this.loadMoreData();
                }
            },
            loadMoreData: function () {
                var oTable = this.getView().byId("tbl_gstInvoices");
                var oModel = oTable.getModel();
                var aData = oModel.getProperty("/data"); // Get the current data

                // Simulate loading more data (replace this with your data retrieval logic)
                var aNewData = []; // New data to append

                // Append the new data to the existing data
                aData = aData.concat(aNewData);
                oModel.setProperty("/data", aData); // Update the model data

                // Ensure the table is aware of the updated data
                oTable.invalidate();
            },

            extractPANFromGSTIN: function (gstin) {
                // Define a regular expression pattern to match GSTIN format
                const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

                // Check if the provided GSTIN matches the pattern
                if (!gstinPattern.test(gstin)) {
                    return null; // Invalid GSTIN
                }

                // Extract the PAN (first 10 characters) from the GSTIN
                var pan = gstin.substring(2, 12);
                return pan;
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
            // handleValueHelpSearchpassengergstin: function (oEvent) {
            //     var sValue = oEvent.getParameter("value").trim();
            //     var oFilter = new sap.ui.model.Filter({
            //         filters: [
            //             new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
            //         ],
            //         and: false
            //     });
            //     oEvent.getSource().getBinding("items").filter([oFilter]);

            // },
            handleValueHelpSearchpassengergstin: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var val = oEvent.getParameter("value").trim();
                if(val !== ""){
                this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "passengerGSTIN": val, "apiType": "Reports" }), (_self, data, message) => {
 
                    var oModelData = new sap.ui.model.json.JSONModel();
                    if (data !== null) {
                        _self.filterJson;
                        _self.filterJsonUpdated = data.filters;
                        _self.filterJson.passengerGSTIN = _self.filterJson.passengerGSTIN.concat(data.filters.passengerGSTIN.filter(function (item) {
                            return _self.filterJson.passengerGSTIN.indexOf(item) === -1; // Check for uniqueness
                        }));
                        oModelData.setData(_self.filterJson);
                        _self.getView().setModel(oModelData, "FilterDatamodel");
                        var sValue = oEvent.getParameter("value").trim();
                        var oFilter = new sap.ui.model.Filter({
                            filters: [
                                new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                            ],
                            and: false
                        });
                        oEvent.getSource().getBinding("items").filter([oFilter]);
                        sap.ui.core.BusyIndicator.hide();
                    }else {
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
            handleValueHelpSearchticketNum: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var val = oEvent.getParameter("value").trim();
                if(val !== ""){
                this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "ticketNumber": val, "apiType": "Reports" }), (_self, data, message) => {
 
                    var oModelData = new sap.ui.model.json.JSONModel();
                    if (data !== null) {
                        _self.filterJson;
                        _self.filterJsonUpdated = data.filters;
                        _self.filterJson.ticketNumber = _self.filterJson.ticketNumber.concat(data.filters.ticketNumber.filter(function (item) {
                            return _self.filterJson.ticketNumber.indexOf(item) === -1; // Check for uniqueness
                        }));
                        oModelData.setData(_self.filterJson);
                        _self.getView().setModel(oModelData, "FilterDatamodel");
                        var sValue = oEvent.getParameter("value").trim();
                        var oFilter = new sap.ui.model.Filter({
                            filters: [
                                new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                            ],
                            and: false
                        });
                        oEvent.getSource().getBinding("items").filter([oFilter]);
                        sap.ui.core.BusyIndicator.hide();
                    }else {
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

                this.byId("fbinp-pnr").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-pnr");
                var aTitle = [];
                this.oListPlant = this.pnrNumDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject();
                    aTitle.push(text);
                }
                //adding the selected values to the tokens.
                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("fbinp-pnr").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                const sId = this.byId("fbinp-pnr");

                sId.getAggregation("tokenizer").setEditable(false)

            },


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

                sId.getAggregation("tokenizer").setEditable(false)

            },


            // handleValueHelpSearchticketNum: function (oEvent) {
            //     var sValue = oEvent.getParameter("value");
            //     var oFilter = new sap.ui.model.Filter({
            //         filters: [
            //             new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
            //         ],
            //         and: false
            //     });
            //     oEvent.getSource().getBinding("items").filter([oFilter]);
            //     //oEvent.getSource().getBinding("items").Contains(sValue);
            // },
            fetchInvoices: function (oEvent) {
                var filterval = {};
                this.loopfilters = {};
                filterval.apiType = "Reports";

                filterval.pageNumber = 1;
                filterval.pageSize = 500;
                filterval.isInitial = true;
                this.loopfilters = filterval;


                this.SendRequest(this, "/portal-api/portal/v1/get-reports", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {


                    sap.ui.core.BusyIndicator.hide();
                    _self.GSTDetails = data;

                    if (data) {
                        _self.totalinvoiceslength = data.invoices.length;

                        _self.oModel = new sap.ui.model.json.JSONModel([]);
                        _self.oModel.setData(_self.GSTDetails.invoices);

                        var oModelData = new sap.ui.model.json.JSONModel([]);
                        // filterJson = {

                        // };
                        if (data.filters) {
                            _self.filterJson = data.filters;
                            oModelData.setData(_self.filterJson);
                            _self.getView().setModel(oModelData, "FilterDatamodel");
                            _self.byId("fbmc-TIMELINE").setSelectedKey(_self.filterJson.invoiceFilter);

                            // _self.getView().byId("fbmc-GSTIN").setSelectedKeys(this.filterJson.defaultGSTIN);

                        }
                        if (data.invoices.length > 0) {

                            _self.getView().byId("btn-excel").setVisible(true);
                            // _self.getView().byId("txt-inr").setVisible(true);
                            _self.getView().byId("btn-pdf").setVisible(true);


                        } else {
                            _self.getView().byId("btn-excel").setVisible(false);
                            // _self.getView().byId("txt-inr").setVisible(false);
                            _self.getView().byId("btn-pdf").setVisible(false);


                        }
                    }
                    else if (data === null) {



                        this.oModel.setData(null);


                    }

                    _self.oModel.setData(_self.GSTDetails);


                    _self.getView().setModel(_self.oModel, "GSTDetailsModel");
                    _self.onSearch();


                });

            },

            handleValueHelpiataNum: function (oEvent) {
                // this.setValuesToSearchHelp(oEvent);
                var sInputValue = oEvent.getSource().getValue();

                //this.InputId = oEvent.getSource().getId();
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
                //remove all tokens before you close the value help
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

                sId.getAggregation("tokenizer").setEditable(false)

            },
            handleValueHelpbuyername: function (oEvent) {
                // this.setValuesToSearchHelp(oEvent);
                var sInputValue = oEvent.getSource().getValue();
                //this.InputId = oEvent.getSource().getId();
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.buyerNameDialog) {
                    this.buyerNameDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.passengerFIlterDialog", this);
                    this.getView().addDependent(this.buyerNameDialog);
                }
                // var oListItem = sap.ui.getCore().byId("FrgmtIDPlantExcel");
                var oList = this.buyerNameDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.buyerNameDialog._aSelectedItems;
                this.buyerNameDialog.open();
                //this._OpenBusyDialogNoDelay();

            },
            // handleValueHelpSearchpassengername: function (oEvent) {
            //     var sValue = oEvent.getParameter("value");
            //     var oFilter = new sap.ui.model.Filter({
            //         filters: [
            //             new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
            //         ],
            //         and: false
            //     });
            //     oEvent.getSource().getBinding("items").filter([oFilter]);
            //     //oEvent.getSource().getBinding("items").Contains(sValue);
            // },
            handleValueHelpSearchpassengername: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var val = oEvent.getParameter("value").trim();
                if(val !== ""){
                this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "passengerName": val, "apiType": "Reports" }), (_self, data, message) => {
 
                    var oModelData = new sap.ui.model.json.JSONModel();
                    if (data !== null) {
                        _self.filterJson;
                        _self.filterJsonUpdated = data.filters;
                        _self.filterJson.passengerName = _self.filterJson.passengerName.concat(data.filters.passengerName.filter(function (item) {
                            return _self.filterJson.passengerName.indexOf(item) === -1; // Check for uniqueness
                        }));
                        oModelData.setData(_self.filterJson);
                        _self.getView().setModel(oModelData, "FilterDatamodel");
                        var sValue = oEvent.getParameter("value").trim();
                        var oFilter = new sap.ui.model.Filter({
                            filters: [
                                new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                            ],
                            and: false
                        });
                        oEvent.getSource().getBinding("items").filter([oFilter]);
                        sap.ui.core.BusyIndicator.hide();
                    }else {
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
       
          
            handlecancelbuyer: function (oEvent) {
                this.buyerNameDialog.close();
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
                this.byId("fbinp-buyername").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-buyername");
                var aTitle = [];
                this.oListPlant = this.buyerNameDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject();
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
                const sId = this.byId("fbinp-buyername");

                sId.getAggregation("tokenizer").setEditable(false)

            },


            _routeMatched: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                const jwt = sessionStorage.getItem("jwt")
                var decodedData;
                if (!jwt) {

                    window.location.replace('/portal/index.html');

                }
                if (jwt) {
                    decodedData = JSON.parse(atob(jwt.split('.')[1]));

                }

                this.getView().byId("fbinp-pnr").removeAllTokens();
                this.getView().byId("fbinp-iataNumber").removeAllTokens();
                this.getView().byId("fbinp-ticketNumber").removeAllTokens();
                this.getView().byId("fbinp-invoiceNumber").removeAllTokens();
                this.getView().byId("fbinp-GSTIN").removeAllTokens();
                this.getView().byId("fbinp-buyername").removeAllTokens();
                this.getView().byId("fbdat-invoiceDate").setValue("");
                this.getView().byId("fbdat-ticketIssueDate").setValue("");
                this.getView().byId("fbmc-GSTINAI").setSelectedKeys(null);

                this.fetchInvoices();


                this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", " " + decodedData.FirstName + ' ' + decodedData.LastName);
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "GST Report");
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", true);



            },

            handleDateChange: function (oEvent) {
                var oDP = oEvent.getSource(),
                    bValid = oEvent.getParameter("valid");
                if (bValid) {
                    oDP.setValueState("None");
                } else {
                    oDP.setValueState("Error");
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
                    if (oSelIndices.length > 1) {
                        sap.ui.core.BusyIndicator.hide();

                        this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices: aInvoices }), (_self, data, message) => {
                            //   const invoices = data.invoicePDFs;
                            const invoices = data.invoice;
                            const base64Data = "data:application/zip;base64," + invoices;
                            const link = document.createElement('a');
                            link.href = base64Data;
                            link.download = `GST Report Documents`;
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
                        });

                    } else {
                        this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices: aInvoices }), (_self, data, message) => {
                            const invoices = data.invoice;
                            const base64Data = "data:application/pdf;base64," + invoices;
                            const link = document.createElement('a');
                            link.href = base64Data;
                            link.download = `Invoice - ${data.invoiceNumber}`;
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
                        });
                    }
                } else {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.information("Please select the documents for downloading.");
                }
            },
            onPressExportExcel: function () {
                var filterval = {

                };
                sap.ui.core.BusyIndicator.show();
                // Assuming you have a reference to the table
                var oTable = this.byId("tbl_gstInvoices");

                // Get the selected indices
                var aSelectedIndices = oTable.getSelectedIndices();

                // Create an array to store the selected invoice numbers
                var aSelectedInvoiceNumbers = [];

                // Loop through the selected indices and retrieve the INVOICENUMBER
                aSelectedIndices.forEach(function (aSelectedIndices) {
                    var oBindingContext = oTable.getContextByIndex(aSelectedIndices);
                    var sInvoiceNumber = oBindingContext.getProperty().INVOICENUMBER;
                    aSelectedInvoiceNumbers.push(sInvoiceNumber);
                });
                if (aSelectedInvoiceNumbers.length > 0) {


                    filterval.invoiceNumber = aSelectedInvoiceNumbers;
                    filterval.apiType = "Reports";


                    filterval.generateExcel = true;
                    filterval.columns = {
                        "DOCUMENTTYPE": "Document Type",
                        "INVOICENUMBER": "Invoice Number",
                        "INVOICEDATE": "Invoice Date",
                        "IATANUMBER": "IATA Code",
                        "PNR": "PNR",
                        "GSTR1PERIOD": "Period Covered",
                        "SUPPLIERGSTIN": "Supplier GSTIN",
                        "PASSENGERGSTIN": "Passenger GSTIN",
                        "BILLTOFULLADDRESS": "Passenger GSTIN/Address",
                        "PASSANGERNAME": "Passenger Name",
                        "TICKETNUMBER": "Ticket No.",
                        "TICKETISSUEDATE": "Ticket Issue Date",
                        "PLACEOFSUPPLY": "Place of Supply",
                        "HSNCODE": "HSN Code",
                        "VALUEOFSERVICE": "Value of Service",
                        "TAXABLE": "Taxable Value",
                        "NONTAXABLE": "Non Taxable Value",
                        "TOTALTAXABLEVALUE": "Total Taxable Value",
                        "DISCOUNT": "Discount",
                        "NETTAXABLEVALUE": "Net Taxable Value",
                        "CGSTRATE": "CGST Rate (%)",
                        "COLLECTEDCGST": "CGST Amount",
                        "SGSTRATE": "SGST Rate (%)",
                        "COLLECTEDSGST": "SGST Amount",
                        "UTGSTRATE": "UTGST Rate (%)",
                        "COLLECTEDUTGST": "UTGST Amount",
                        "IGSTRATE": "IGST Rate (%)",
                        "COLLECTEDIGST": "IGST Amount",
                        "TOTALINVOICEAMOUNT": "Total Invoice Amount"
                    };
                    // filterval.columns = columns;

                    // Now, aSelectedInvoiceNumbers contains the INVOICENUMBER of all selected rows


                    this.SendRequest(this, "/portal-api/portal/v1/get-reports", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                        sap.ui.core.BusyIndicator.hide();
                        if (data) {
                            var base64Data = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + data.excel;

                            const link = document.createElement('a');

                            link.href = base64Data;

                            link.download = "GST Report Documents";

                            link.click();
                        }
                        else {
                            MessageBox.error("Something went wrong!");

                        }



                    });
                }
                else {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.information("Please select the documents for exporting excel.");


                }

            },
            restore: function () {
                var oFilterBar = this.byId("filterbar");
                oFilterBar.getAllFilterItems().forEach(function (oFilterItem) {
                    oFilterItem.setVisibleInFilterBar(true);
                });
            },

            onSearch: function (oEvent) {
                this.getView().byId("tbl_gstInvoices").clearSelection();
                if (!this.getView().byId("filterbar").isDialogOpen()) {
                    sap.ui.core.BusyIndicator.show();

                    var filter = new Array();
                    var filterval = {};
                    // filterval.isAmended = "false";
                    // this._OpenBusyDialog("");
                    var _self = this;


                    // if (this.ISB2A_flag == true) {
                    filterval.apiType = "Reports";


                    // }
                    if (!oEvent) {
                        this.filtered_GSTDetails.invoices = this.GSTDetails.invoices.filter(function (item) {
                            return _self.selectedGSTN_array.includes(item.SUPPLIERGSTIN);
                        });
                        if (_self.GSTDetails.invoices.length > 0) {
                            _self.getView().byId("morelink").setVisible(true);
                            _self.getView().byId("title").setText("Documents (1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");
                            // _self.getView().byId("morelink").setText("(1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ") More..");
                        } else {
                            _self.getView().byId("title").setText("Documents (" + _self.GSTDetails.invoices.length + ")");
                            _self.getView().byId("morelink").setVisible(false);

                        }

                        _self.getView().getModel("GSTDetailsModel").setData(_self.GSTDetails);
                        _self.getView().getModel("GSTDetailsModel").refresh();
                        // _self.getView().getModel("uniqueGSTDetailsModel").refresh();
                        _self.getView().getModel("FilterDatamodel").refresh();
                        _self.byId("panel_table").setVisible(true);

                        _self.byId("tbl_gstInvoices").setVisible(true);

                        sap.ui.core.BusyIndicator.hide();
                    } else {

                        this.loopfilters = {};
                        if (this.getView().byId("fbmc-DocType").getSelectedKeys()) {
                            filterval.documentType = this.getView().byId("fbmc-DocType").getSelectedKeys();

                        }
                        if (this.getView().byId("fbinp-invoiceNumber").getTokens().length > 0) {
                            // var fieldName = "invoiceNumber";
                            var invTokens = this.getView().byId("fbinp-invoiceNumber").getTokens();
                            var invToken = invTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var invarr = invToken.split(',');


                            filterval.invoiceNumber = invarr;
                        }
                        if (this.getView().byId("fbinp-pnr").getTokens().length > 0) {
                            // var fieldName = "pnr";
                            var pnrTokens = this.getView().byId("fbinp-pnr").getTokens();
                            var pnrToken = pnrTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var pnrarr = pnrToken.split(',');

                            filterval.pnr = pnrarr;
                        }
                        if (this.getView().byId("fbmc-GSTINAI").getSelectedKeys() != "") {
                            // var fieldName = "supplierGSTIN";
                            filterval.supplierGSTIN = this.getView().byId("fbmc-GSTINAI").getSelectedKeys();
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
                        if (this.getView().byId("fbinp-buyername").getTokens().length > 0) {
                            // var fieldName = "billToName";
                            var buyerTokens = this.getView().byId("fbinp-buyername").getTokens();
                            var buyerToken = buyerTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var buyerarr = buyerToken.split(',');

                            filterval.passengerName = buyerarr;
                            // var iata_num = filterval.iataNumber;
                        }
                        if (this.getView().byId("fbinp-iataNumber").getTokens().length > 0) {
                            // var fieldName = "iataNumber";
                            var iataTokens = this.getView().byId("fbinp-iataNumber").getTokens();
                            var iataToken = iataTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var iataarr = iataToken.split(',');

                            filterval.iataNumber = iataarr;
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
                        if (this.getView().byId("fbdat-invoiceDate").getValue()) {
                            if (this.byId("fbdat-invoiceDate").isValidValue()) {
                                var daterange = this.getView().byId("fbdat-invoiceDate").getValue().split("to");
                                var formattedDates = daterange.map(date => {
                                    let parts = date.trim().split('/');
                                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                                });
                                filterval.from = formattedDates[0].trim();
                                filterval.to = formattedDates[1].trim();
                            }
                            else {
                                MessageBox.error("Please choose a valid Date");
                                sap.ui.core.BusyIndicator.hide();
                                return false;
                            }
                        }
                        if (this.getView().byId("fbmc-TIMELINE").getSelectedKey()) {
                            var fieldName = "invoiceFilter";
                            filterval.invoiceFilter = this.getView().byId("fbmc-TIMELINE").getSelectedKey();
                            var TIMELINE_num = filterval.invoiceFilter;
                        }
                        if (this.getView().byId("fbdat-ticketIssueDate").getValue()) {
                            if (this.byId("fbdat-ticketIssueDate").isValidValue()) {
                                var daterange = this.getView().byId("fbdat-ticketIssueDate").getValue().split("to");
                                var formattedDates = daterange.map(date => {
                                    let parts = date.trim().split('/');
                                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                                });
                                filterval.ticketIssueDateFrom = formattedDates[0].trim();
                                filterval.ticketIssueDateTo = formattedDates[1].trim();
                            }
                            else {
                                MessageBox.error("Please choose a valid Date");
                                sap.ui.core.BusyIndicator.hide();
                                return false;
                            }
                        }
                        filterval.pageNumber = 1;
                        filterval.pageSize = 500;
                        this.loopfilters = filterval;

                        this.SendRequest(this, "/portal-api/portal/v1/get-reports", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {


                            sap.ui.core.BusyIndicator.hide();
                            if (data) {
                                _self.GSTDetails = data;
                                if (data.invoices.length > 0) {


                                    _self.getView().byId("btn-excel").setVisible(true);
                                    // _self.getView().byId("txt-inr").setVisible(true);
                                    _self.getView().byId("btn-pdf").setVisible(true);


                                } else {
                                    _self.getView().byId("btn-excel").setVisible(false);
                                    // _self.getView().byId("txt-inr").setVisible(false);
                                    _self.getView().byId("btn-pdf").setVisible(false);

                                }
                                if (_self.GSTDetails.invoices.length > 0) {
                                    _self.getView().byId("morelink").setVisible(true);
                                    _self.getView().byId("title").setText("Documents (1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");
                                    // _self.getView().byId("morelink").setText("(1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ") More..");
                                } else {
                                    _self.getView().byId("title").setText("Documents (" + _self.GSTDetails.invoices.length + ")");
                                    _self.getView().byId("morelink").setVisible(false);

                                }
                                // _self.getView().byId("title").setText("Invoices(" + data.invoices.length + ")");
                                _self.totalinvoiceslength = data.invoices.length;


                                this.oModel = new sap.ui.model.json.JSONModel([]);

                                this.oModel.setData(_self.GSTDetails);

                                _self.getView().setModel(this.oModel, "GSTDetailsModel");

                            }
                            else if (data === null) {

                                this.oModel = new sap.ui.model.json.JSONModel([]);

                                this.oModel.setData(null);

                                _self.getView().setModel(this.oModel, "GSTDetailsModel");
                            }


                        });
                    }

                }
            },

            unique_GSTN: function (GSTDetails) {

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
            handleSelectedGSTIN_AI: function () {
                this.selectedGSTN_array = [];
                var selectedGSTN = this.getView().byId("fbmc-GSTINAI").getSelectedItems();
                this.selectedGSTN_array = selectedGSTN.map(function (oToken) {
                    return oToken.mProperties.key;
                });
            },
            onTokenUpdate: function (evt) {
                var removedType = evt.mParameters.removedTokens[0].mProperties.text;
                for (var type = 0; type < this.aContexts.length; type++) {
                    //if (removedType === this.getView().getModel().getProperty(this.aContexts[type].getPath()).key) {
                    var index = this.aContexts.indexOf(this.aContexts[type].getPath());
                    this.aContexts.splice(index, 1);

                }
            },
            handleValueHelpinvoiceNum: function (oEvent) {
                // this.setValuesToSearchHelp(oEvent);
                var sInputValue = oEvent.getSource().getValue();
                //this.InputId = oEvent.getSource().getId();
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.invNumberDialog) {
                    this.invNumberDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.invoiceNumberFIlterDialog", this);
                    this.getView().addDependent(this.invNumberDialog);
                }
                // var oListItem = sap.ui.getCore().byId("FrgmtIDPlantExcel");
                var oList = this.invNumberDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.invNumberDialog._aSelectedItems;
                this.invNumberDialog.open();
                //this._OpenBusyDialogNoDelay();

            },
            handlecancelinv: function (oEvent) {
                this.invNumberDialog.close();

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
                // this.oListPlant = this.invNumberDialog._aSelectedItems;
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

            },

            onButtonDownloadPresssingle: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                const oTable = this.byId("tbl_gstInvoices");
                var row = oEvent.getParameter("row").getIndex()
                var val = oEvent.getParameter("row").getBindingContext("GSTDetailsModel").getProperty("ID");
                const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;

                const aInvoices = [];
                aInvoices.push({ ID: val });

                this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices: aInvoices }), (_self, data, message) => {
                    sap.ui.core.BusyIndicator.hide();
                    const invoices = data.invoice;
                    const base64Data = "data:application/pdf;base64," + invoices;
                    const link = document.createElement('a');
                    link.href = base64Data;
                    link.download = `Invoice - ${data.invoiceNumber}`;
                    link.click();

                });

            },
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
                } else if (selectedItemKey === "PY") {
                    var currentDate = new Date();
                    var currentYear = currentDate.getFullYear();
                    var startOfPreviousFinancialYear = new Date(currentYear - 1, 3, 1); // Assuming your financial year starts on April 1st

                    // Calculate the end date of the previous financial year
                    var endOfPreviousFinancialYear = new Date(currentYear, 2, 31); // Assuming your financial year ends on March 31st
                    minDate = startOfPreviousFinancialYear;
                    maxDate = endOfPreviousFinancialYear;

                }

                this.getView().byId("fbdat-invoiceDate").setMinDate(minDate);
                this.getView().byId("fbdat-invoiceDate").setMaxDate(maxDate);

            },

            // handleValueHelpSearchpnrNum: function (oEvent) {
            //     var sValue = oEvent.getParameter("value");
            //     var oFilter = new sap.ui.model.Filter({
            //         filters: [
            //             new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
            //         ],
            //         and: false
            //     });
            //     oEvent.getSource().getBinding("items").filter([oFilter]);
            // },
            handleValueHelpSearchpnrNum: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var val = oEvent.getParameter("value").trim();
                if(val !== ""){
                this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "pnr": val, "apiType": "Reports" }), (_self, data, message) => {
 
                    var oModelData = new sap.ui.model.json.JSONModel();
                    if (data !== null) {
                        _self.filterJson;
                        _self.filterJsonUpdated = data.filters;
                        _self.filterJson.pnr = _self.filterJson.pnr.concat(data.filters.pnr.filter(function (item) {
                            return _self.filterJson.pnr.indexOf(item) === -1; // Check for uniqueness
                        }));
                        oModelData.setData(_self.filterJson);
                        _self.getView().setModel(oModelData, "FilterDatamodel");
                        var sValue = oEvent.getParameter("value").trim();
                        var oFilter = new sap.ui.model.Filter({
                            filters: [
                                new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                            ],
                            and: false
                        });
                        oEvent.getSource().getBinding("items").filter([oFilter]);
                        sap.ui.core.BusyIndicator.hide();
                    }else {
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
                var val = oEvent.getParameter("value").trim();
                if(val !== ""){
                this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "invoiceNumber": val, "apiType": "Reports" }), (_self, data, message) => {
 
                    var oModelData = new sap.ui.model.json.JSONModel();
                    if (data !== null) {
                        _self.filterJson;
                        _self.filterJsonUpdated = data.filters;
                        _self.filterJson.invoiceNumber = _self.filterJson.invoiceNumber.concat(data.filters.invoiceNumber.filter(function (item) {
                            return _self.filterJson.invoiceNumber.indexOf(item) === -1; // Check for uniqueness
                        }));
                        oModelData.setData(_self.filterJson);
                        _self.getView().setModel(oModelData, "FilterDatamodel");
                        var sValue = oEvent.getParameter("value").trim();
                        var oFilter = new sap.ui.model.Filter({
                            filters: [
                                new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                            ],
                            and: false
                        });
                        oEvent.getSource().getBinding("items").filter([oFilter]);
                        sap.ui.core.BusyIndicator.hide();
                    }else {
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
          
           
            onScroll: function (oEvent) {
                var totalPages = Math.ceil(this.GSTDetails.totalInvoices / 500);
                if (this.loopfilters.pageNumber <= totalPages) {
                    this.loopfilters.pageNumber = this.loopfilters.pageNumber + 1;


                    this.SendRequest(this, "/portal-api/portal/v1/get-reports", "POST", {}, JSON.stringify(this.loopfilters), (_self, data, message) => {
                        if (data.invoices.length > 0) {
                            _self.GSTDetails.invoices = [..._self.GSTDetails.invoices, ...data.invoices];

                            _self.getView().byId("title").setText("Documents (1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");

                            _self.getView().getModel("GSTDetailsModel").refresh();
                        }
                    });
                }
            },
          
            // handleValueHelpSearchiataNum: function (oEvent) {
            //     sap.ui.core.BusyIndicator.show();
            //     var _self = this;
            //     var val = oEvent.getParameter("value").trim();
            //     if(val !== ""){
            //     this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "iataNumber": val, "apiType": "Reports" }), (_self, data, message) => {
 
            //         var oModelData = new sap.ui.model.json.JSONModel();
            //         if (data !== null) {
            //             _self.filterJson;
            //             _self.filterJsonUpdated = data.filters;
            //             _self.filterJson.iataNumber = _self.filterJson.iataNumber.concat(data.filters.iataNumber.filter(function (item) {
            //                 return _self.filterJson.iataNumber.indexOf(item) === -1; // Check for uniqueness
            //             }));
            //             oModelData.setData(_self.filterJson);
            //             _self.getView().setModel(oModelData, "FilterDatamodel");
            //             var sValue = oEvent.getParameter("value").trim();
            //             var oFilter = new sap.ui.model.Filter({
            //                 filters: [
            //                     new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
            //                 ],
            //                 and: false
            //             });
            //             oEvent.getSource().getBinding("items").filter([oFilter]);
            //             sap.ui.core.BusyIndicator.hide();
            //         }else {
            //             var oModelData = new sap.ui.model.json.JSONModel();
            //     oModelData.setData(null);
            //     _self.getView().setModel(oModelData, "FilterDatamodel");
            //             sap.ui.core.BusyIndicator.hide();
            //         }
            //     });
            // }
            // else {
            //     var oModelData = new sap.ui.model.json.JSONModel();
            //     oModelData.setData(_self.filterJson);
            //     _self.getView().setModel(oModelData, "FilterDatamodel");
            //     sap.ui.core.BusyIndicator.hide();
            // }
            // }
            handleValueHelpSearchiataNum: function (oEvent) {
                var sValue = oEvent.getParameter("value").trim();
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },
          



        });
    }
);