sap.ui.define(
    ["sap/ui/core/mvc/Controller",
    "airindiagst/model/formatter",
        "sap/m/MessageBox",
        "sap/ui/Device",
        "sap/m/PDFViewer",
        "sap/ui/model/json/JSONModel",
        'sap/ui/export/library',
        'sap/ui/export/Spreadsheet'
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,
        formatter,
        MessageBox,
        Device,
        PDFViewer,
        JSONModel, exportLibrary, Spreadsheet) {
        "use strict";
        var EdmType = exportLibrary.EdmType;
        return Controller.extend("airindiagst.controller.Areasummary", {
            formatter: formatter,
            onAfterRendering: function () {
            },
            onInit: function () {

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("Areasummary").attachPatternMatched(this._routeMatched, this);
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
            
            _registerForP13n: function () {
                var oTable = this.byId("tbl_amendment");
                this.oMetadataHelper = new MetadataHelper([
                    { key: "col_invnum", label: "invoice Number", path: "INVOICENUMBER" },
                    { key: "col_pnr", label: "PNR", path: "PNR" },
                    { key: "col_ticnum", label: "Ticket Number", path: "TICKETNUMBER" },
                    { key: "col_invdat", label: "Invoice Date", path: "INVOICEDATE" },
                    { key: "col_buygstin", label: "Buyer GSTIN", path: "PASSENGERGSTIN" },
                    { key: "col_suppgstin", label: "Supplier GSTIN", path: "SUPPLIERGSTIN" },
                    { key: "col_ticisdat", label: "Ticket Issue Date", path: "TICKETISSUEDATE" },
                    { key: "col_fop", label: "FOP", path: "FOP" },
                    { key: "col_totinvamt", label: "Total Invoice Amount", path: "TOTALINVOICEAMOUNT" }
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
                var oTable = this.byId("tbl_areasummary");

                Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
                    contentHeight: "35rem",
                    contentWidth: "32rem",
                    source: oEvt.getSource()
                });
            },

            onSort: function (oEvt) {
                var oTable = this.byId("tbl_areasummary");
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
                var oTable = this.byId("tbl_areasummary");
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
            restore: function () {
                var oFilterBar = this.byId("filterbar");
                oFilterBar.getAllFilterItems().forEach(function (oFilterItem) {
                    oFilterItem.setVisibleInFilterBar(true);
                });
            },

            handleStateChange: function (oEvt) {
                var oTable = this.byId("tbl_areasummary");
                var oState = oEvt.getParameter("state");
                if (!oState || !oState.Columns || !Array.isArray(oState.Columns)) {
                 
                    return; // Exit the function or handle the error appropriately
                }else{

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
                var oTable = this.getView().byId("tbl_areasummary");
                var iVisibleRowCount = oTable.getVisibleRowCount();
                var iFirstVisibleRow = oTable.getFirstVisibleRow();
                var iTotalRowCount = oTable.getBinding().getLength();

                if (iFirstVisibleRow + iVisibleRowCount >= iTotalRowCount) {
                    // Load more data here and append it to the model
                    this.loadMoreData();
                }
            },
            loadMoreData: function () {
                var oTable = this.getView().byId("tbl_areasummary");
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

            handleValueHelpPNRNum: function (oEvent) {
               
                var sInputValue = oEvent.getSource().getValue();
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
                //remove all tokens before you close the value help
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
            readInvoicesFromAmendment: function (oEvent) {
                var filterval = {};
                this.loopfilters = {};
                filterval.apiType = "AreaSummary";
                filterval.pageNumber = 1;
                filterval.pageSize = 500;
                filterval.isInitial = true;
                this.loopfilters = filterval;

                this.SendRequest(this, "/portal-api/portal/v1/get-reports", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {

                    sap.ui.core.BusyIndicator.hide();
                    _self.GSTDetails = data;
                 
                    if(data){

                    _self.oModel = new sap.ui.model.json.JSONModel([]);
                    _self.oModel.setData(_self.GSTDetails.invoices);

                    var oModelData = new sap.ui.model.json.JSONModel([]);
                    
                    if (data.filters) {
                        _self.filterJson = data.filters;
                        oModelData.setData(_self.filterJson);
                        _self.getView().setModel(oModelData, "FilterDatamodel");
                        _self.byId("fbmc-TIMELINE").setSelectedKey(_self.filterJson.invoiceFilter);

                        // _self.getView().byId("fbmc-GSTIN").setSelectedKeys(this.filterJson.defaultGSTIN);
                       
                    }
                    if (data.invoices.length > 0) {

                        _self.getView().byId("btn-excel").setVisible(true);
                     
                        _self.getView().byId("btn-pdf").setVisible(true);


                    } else {
                        _self.getView().byId("btn-excel").setVisible(false);
                   
                        _self.getView().byId("btn-pdf").setVisible(false);

                    }
                }
                else if(data === null){

                 

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
                sId.getAggregation("tokenizer").setEditable(false);
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
            handleValueHelpSearchpassengername: function (oEvent) {
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
               onchangeB2Aview:function(oEvent){
                var segmentkey = oEvent.getSource().getSelectedKey();
                var segmentItem = oEvent.getSource().getSelectedItem();
                if (segmentkey == "AREASUMMARY"){
                    this.getView().getModel().setProperty("/togglevisiblesummary", true);
                    this.getView().getModel().setProperty("/togglevisiblesummarydetails", false);
                } else if (segmentkey == "AREASUMMARYDETAILS") {
                    this.getView().getModel().setProperty("/togglevisiblesummarydetails", true);
                    this.getView().getModel().setProperty("/togglevisiblesummary", false);
                }
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
                this.getView().byId("fbinp-pos").removeAllTokens();
                this.getView().byId("fbinp-buyername").removeAllTokens();
                this.getView().byId("fbdat-invoiceDate").setValue("");
                this.getView().byId("fbmc-GSTINAI").setSelectedKeys(null);
               
           
                this.readInvoicesFromAmendment();


                this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", " " + decodedData.FirstName + ' ' + decodedData.LastName);
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "Area Summary Report");
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", true);

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
                var sValue = oEvent.getParameter("value");
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
               
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

    
            onPressExportExcel: function () {
                var filterval = {

                };
                sap.ui.core.BusyIndicator.show();
                // Assuming you have a reference to the table
                var oTable = this.byId("tbl_areasummary");

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
                    filterval.apiType = "AreaSummary";
                 

               
                    filterval.generateExcel = true;
                    filterval.columns = {
                      
                        "INVOICENUMBER": "Invoice Number",
                        "INVOICEDATE": "Invoice Date",
                        "IATANUMBER": "IATA Code",
                        "TICKETNUMBER": "Ticket No.",
                        "Passenger GSTIN":"PASSENGERGSTIN",
                        "PASSANGERNAME":"Passenger Name",
                        "SUPPLIERGSTIN": "Supplier GSTIN",
                        "PNR":"PNR",
                        "TCSGSTIN": "GSTN of OTA used for TCS",           
                        "INVOICEDATE": "Invoice Date",
                        "STATION": "Station",
                        "REGION": "Region",            
                        "STATENAME": "State of Deposit of GST",
                        "SALESRETURN": "Sales Return",
                        "TRANSACTIONTYPE": "Sale/Refund",
                        "TICKETISSUEDATE": "Date of Issue/Refund",
                        "IATANUMBER": "IATA Code",
                        "K3TAX": "K3",
                        "TICKETISSUEDATE": "Date of Original Issue/refund",
                        "PLACEOFSUPPLY": "Place of supply",
                        "DOCUMENTTYPE": "TAX INVOICE OR CR/DR",    
                        "TAXABLE": "Taxable Value",
                        "NONTAXABLEVALUE": "Non-taxable Value",
                        "TOTALINVOICEAMOUNT": "Total Invoice Amount",
                        "TCSGSTVALUE": "TCS GST Value",
                        "TCS_CGST": "TCS-CGST",                       
                        "TCS_SGST_SGST": "TCS-SGST",
                        "TCS_IGST": "TCS-IGST",
                        "TCS_UGST": "TCS-UGST",
                    };
                   

                    // Now, aSelectedInvoiceNumbers contains the INVOICENUMBER of all selected rows
                

                    this.SendRequest(this, "/portal-api/portal/v1/get-reports", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                        sap.ui.core.BusyIndicator.hide();
                        if(data){
                        var base64Data = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + data.excel;
                    
                        const link = document.createElement('a');

                        link.href = base64Data;

                        link.download = "AreaSummary Documents";

                        link.click();
                        }
                        else
                        {
                            MessageBox.error("Something went wrong!");

                        }
                       
                    });
                }
                else {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.information("Please select the documents for exporting excel.");


                }

            },

          
            onButtonDownloadPress: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                const oTable = this.byId("tbl_areasummary");
                const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                const oSelIndices = oTable.getSelectedIndices();
               // const oSelIndices = oTable.getBinding().aIndices;
                const aInvoices = [];
                if (oSelIndices.length) {
                    var oModel = oTable.getModel("GSTDetailsModel");
                    oSelIndices.forEach(function(iIndex) {
                    var oContext = oTable.getContextByIndex(iIndex);
                    var oData = oModel.getProperty(null, oContext);
                    const ID = oData.ID;
                        aInvoices.push({ ID })
                    });
                    if (oSelIndices.length > 1) {
                        sap.ui.core.BusyIndicator.hide();
                    this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices : aInvoices}), (_self, data, message) => {
                     //   const invoices = data.invoicePDFs;
                        const invoices = data.invoice;
                        const base64Data = "data:application/zip;base64," + invoices;
                                const link = document.createElement('a');
                                link.href = base64Data;
                                link.download = `AreaSummary Documents`;
                                link.click();
                        sap.ui.core.BusyIndicator.hide();
                        const responseData = data.invoiceNumber;
                        if(responseData.notGenerated.length > 0){
                        const generatedString = responseData.notGenerated.join(', ');
                        MessageBox.warning("List of documents pending for invoice generation.", {
                            title: "Download status",
                            id: "messageBoxId1",
                            details: generatedString,
                            contentWidth: "100px"
                        });
                    }
                    }); 
            
            }else{
                this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices : aInvoices}), (_self, data, message) => {
                    const invoices = data.invoice;
                    const base64Data = "data:application/pdf;base64," + invoices;
                            const link = document.createElement('a');
                            link.href = base64Data;
                            link.download =`Invoice - ${data.invoiceNumber}`;
                            link.click();
                  
                    sap.ui.core.BusyIndicator.hide();
                    const responseData = data.invoiceNumber;
                    if(responseData.notGenerated.length > 0){
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
                }else{
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.information("Please select the documents for downloading.");
                }
            },
            onScroll: function (oEvent){
                var totalPages = Math.ceil(this.GSTDetails.totalInvoices / 500);
                if(this.loopfilters.pageNumber <= totalPages){
                    this.loopfilters.pageNumber = this.loopfilters.pageNumber + 1;
                
              
                this.SendRequest(this, "/portal-api/portal/v1/get-reports", "POST", {}, JSON.stringify(this.loopfilters), (_self, data, message) => {
                    if(data.invoices.length > 0){ 
                        _self.GSTDetails.invoices = [..._self.GSTDetails.invoices, ...data.invoices];
                       
                    _self.getView().byId("title").setText("Documents (1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices +")");
                   
                    
                     _self.getView().getModel("GSTDetailsModel").refresh();
                    }
                 });
                }
            },
            onSearch: function (oEvent) {
                this.getView().byId("tbl_areasummary").clearSelection();
                if (!this.getView().byId("filterbar").isDialogOpen()) {
                    sap.ui.core.BusyIndicator.show();

                    var filter = new Array();
                    var filterval = {};
                  
                    var _self = this;

                    filterval.apiType = "AreaSummary";
                  
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

                        _self.byId("tbl_areasummary").setVisible(true);

                        sap.ui.core.BusyIndicator.hide();
                    } else {
                       
                        this.loopfilters = {};
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
                        if (this.getView().byId("fbinp-pos").getTokens().length > 0) {
                            // var fieldName = "iataNumber";
                            var posTokens = this.getView().byId("fbinp-pos").getTokens();
                            var posToken = posTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var posarr = posToken.split(',');

                            filterval.placeOfSupply = posarr;
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
                            if(this.byId("fbdat-invoiceDate").isValidValue()){
                            var daterange = this.getView().byId("fbdat-invoiceDate").getValue().split("to");
                            var formattedDates = daterange.map(date => {
                                let parts = date.trim().split('/');
                                return `${parts[2]}/${parts[1]}/${parts[0]}`;
                            });
                            filterval.from = formattedDates[0].trim();
                            filterval.to = formattedDates[1].trim();
                            }
                            else{
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
                       
                        filterval.pageNumber = 1;
                        filterval.pageSize = 500;
                        this.loopfilters = filterval;

                        this.SendRequest(this, "/portal-api/portal/v1/get-reports", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {


                            sap.ui.core.BusyIndicator.hide();
                            if (data) {
                                _self.GSTDetails = data;
                                if (data.invoices.length > 0) {

                                    _self.getView().byId("btn-excel").setVisible(true);
                                   
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
                             


                                this.oModel = new sap.ui.model.json.JSONModel([]);

                                this.oModel.setData(_self.GSTDetails);

                                _self.getView().setModel(this.oModel, "GSTDetailsModel");
                            }
                            else if(data === null){

                                this.oModel = new sap.ui.model.json.JSONModel([]);

                                this.oModel.setData(null);

                                _self.getView().setModel(this.oModel, "GSTDetailsModel");
                            }



                        });
                    }




                }
            },
           
            onButtonDownloadPresssingle: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                const oTable = this.byId("tbl_areasummary");
                var row = oEvent.getParameter("row").getIndex()
                var val = oEvent.getParameter("row").getBindingContext("GSTDetailsModel").getProperty("ID");
                const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                // var row = this.getView().byId("tbl_amendment").mProperties.selectedIndex;
                // const oSelIndices = oTable.getSelectedIndices();
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
                // }
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
                    //}
                    // this.byId("fbinp-pnr").removedTokens(new sap.m.Token({
                    //     text: removedType
                    // }));
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
            actionchange: function (oEvent) {
                var combo = oEvent.oSource.mProperties.selectedKey;
                if (combo === "RG") {
                    sap.ui.getCore().byId("inp-address").setVisible(true);
                    sap.ui.getCore().byId("inp-newgstin").setVisible(false);

                }
                if (combo === "CG") {
                    sap.ui.getCore().byId("inp-address").setVisible(false);
                    sap.ui.getCore().byId("inp-newgstin").setVisible(true);

                }
            },
           
            onGstinInputChange: function (oEvent) {
                var validate = true;
                var oInput = oEvent.getSource();
                var sPan = oInput.getValue();

                if (this.validateGSTIN(sPan)) {
                    oInput.setValueState("None");
                    oInput.setValueStateText("");
                } else {
                    oInput.setValueState("Error");
                    oInput.setValueStateText("Invalid GSTIN format");
                    validate = false;
                }
                return validate;
            },

            validateGSTIN: function (sValue) {
                sValue = sValue.toUpperCase();
                const validGstinRegex = /\d{2}[A-Z]{5}\d{4}[A-Z]\d\w{2}/gm
                return validGstinRegex.test(sValue);
            },
            formatmonth: function(val) {
                var monthString = "";
               if(val){
                var a = new Date(val);
                b = a.getMonth();
                var monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
                monthString = monthNames[b];
               }
               return monthString;
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

            handleValueHelpSearchinvoiceNum: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
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
                onchangeview:function(oEvent){
                var segmentkey = oEvent.getSource().getSelectedKey();
                var segmentItem = oEvent.getSource().getSelectedItem();
                if(segmentkey === "tcssumd")
                {
                    this.getView().getModel().setProperty("/toggleVisible", false);
                    this.getView().byId("cGSTRMonth").setVisible(true);
                }else{
                    this.getView().getModel().setProperty("/toggleVisible", true);
                    this.getView().byId("cGSTRMonth").setVisible(false);
                }

            },
            handleValueHelpSearchpos: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("STATENAME", sap.ui.model.FilterOperator.Contains, sValue),
                        new sap.ui.model.Filter("STATECODE", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },
            handleValueHelppos: function (oEvent) {
                // this.setValuesToSearchHelp(oEvent);
                var sInputValue = oEvent.getSource().getValue();

                //this.InputId = oEvent.getSource().getId();
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.posDialog) {
                    this.posDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.placeofSupplyDialog", this);
                    this.getView().addDependent(this.posDialog);
                }
                // var oListItem = sap.ui.getCore().byId("FrgmtIDPlantExcel");
                var oList = this.posDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.posDialog._aSelectedItems;
                // if(this.isMyBookings === "my bookings"){

                // }
                // sap.ui.getCore().byId("iatafrag").setSelected(true);
                this.posDialog.open();


                //this._OpenBusyDialogNoDelay();

            },
            handleValueHelpClosepos: function (oEvent) {
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
                this.byId("fbinp-pos").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-pos");
                var aTitle = [];
                this.oListPlant = this.posDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject().STATECODE;
                    aTitle.push(text);
                }
                //adding the selected values to the tokens.
                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("fbinp-pos").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                const sId = this.byId("fbinp-pos");

                sId.getAggregation("tokenizer").setEditable(false)
              
            }
          
        });
    }
);