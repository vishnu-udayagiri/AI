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
        JSONModel, exportLibrary, Spreadsheet,Engine, SelectionController, SortController, GroupController, MetadataHelper, Sorter) {
        "use strict";
        var EdmType = exportLibrary.EdmType;
        return Controller.extend("airindiagst.controller.TicketStatus", {
            formatter: formatter,
            onAfterRendering: function () {
            },
            onInit: function () {

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("TicketStatus").attachPatternMatched(this._routeMatched, this);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);

                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
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
            formatTimeStamp : function (sValue) {

                if (sValue) {
                    var dateString = sValue;
                    var parts = dateString.split(" ");
                    var formattedDate = parts[0];
                    var updatedDate = formattedDate.split("-");
                var formattedDateupdated = updatedDate[2] + "-" + updatedDate[1] + "-" + updatedDate[0] ;

                    return formattedDateupdated;
                }
            },
            
            _registerForP13n: function () {
                var oTable = this.byId("tbl_gstInvoices");
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
                var oTable = this.byId("tbl_gstInvoices");

                Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
                    contentHeight: "35rem",
                    contentWidth: "32rem",
                    source: oEvt.getSource()
                });
            },
            onScroll: function (oEvent) {

                var totalPages = Math.ceil(this.GSTDetails.totalInvoices / 100);
                if (this.loopfilters.pageNumber <= totalPages) {
                    sap.ui.core.BusyIndicator.show();
                    this.loopfilters.pageNumber = this.loopfilters.pageNumber + 1;

                    this.SendRequest(this, "/portal-api/portal/v1/get-ticket-status-report", "POST", {}, JSON.stringify(this.loopfilters), (_self, data, message) => {
                        if(data !== null){
                        if (data.ticketStatusReport.length > 0) {
                            _self.GSTDetails.ticketStatusReport = [..._self.GSTDetails.ticketStatusReport, ...data.ticketStatusReport];
                            
                            _self.getView().byId("title").setText("Ticket Status" + " " + "(1 - " + _self.GSTDetails.ticketStatusReport.length + " of " + _self.GSTDetails.totalInvoices + ")");

                            _self.getView().getModel("GSTDetailsModel").refresh();
                        }
                        
                    }
                    sap.ui.core.BusyIndicator.hide();
                    });
                }
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
               
                    this.loadMoreData();
                }
            },
            loadMoreData: function () {
                var oTable = this.getView().byId("tbl_gstInvoices");
                var oModel = oTable.getModel();
                var aData = oModel.getProperty("/data"); 

                
                var aNewData = []; 

               
                aData = aData.concat(aNewData);
                oModel.setProperty("/data", aData); 

                
                oTable.invalidate();
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
                this.byId("fbinp-pnr").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedItems"),
                    oInput = this.byId("fbinp-pnr");
                var aTitle = [];
                this.oListPlant = this.pnrNumDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getTitle();
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
                // var tokens = this.byId("fbinp-ticketNumber").getTokens();
                // tokens.forEach(function(token) {
                //     token.setEditable(false);
                // });
                /*var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
                if (oSelectedItem) {
                    this.getView().byId(this.inputId).setValue(oSelectedItem);
                }
                oEvent.getSource().getBinding("items").filter([]);*/
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

            handleValueHelpSearchticketNum: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
                //oEvent.getSource().getBinding("items").Contains(sValue);
            },
            fetchInvoices: function (oEvent) {


                var filterval = {
                    pageNumber:1,
                    pageSize:100

                };
                this.loopfilters = {};
                this.loopfilters = filterval;
                this.SendRequest(this, "/portal-api/portal/v1/get-ticket-status-report", "POST", {}, JSON.stringify(filterval) , (_self, data, message) => {
                    if(data !== null){
                        _self.GSTDetails = data;
                    sap.ui.core.BusyIndicator.hide();
                    _self.GSTDetails = data;
                    _self.oModel = new sap.ui.model.json.JSONModel([]);
                    _self.oModel.setData(_self.GSTDetails);

                    var oModelData = new sap.ui.model.json.JSONModel([]);
                    // filterJson = {

                    // };
                    if (data.filters) {
                        _self.filterJson = data.filters;
                        oModelData.setData(_self.filterJson);
                        _self.getView().setModel(oModelData, "FilterDatamodel");
                    //    _self.byId("fbmc-TIMELINE").setSelectedKey(_self.filterJson.invoiceFilter);

                        // _self.getView().byId("fbmc-GSTIN").setSelectedKeys(this.filterJson.defaultGSTIN);
                        // if (_self.ISB2A_flag) {
                        //     // _self.getView().byId("fbinp-iataNumber").setValue(data.filters.iataNumber[0]);
                        //     var tokensToSelect = [];
                        //     _self.filterJson.iataNumber = data.filters.agentName;
                        //     // data.filters.agentName.forEach(function (token) {
                        //     //     // tokensToSelect.push(new sap.m.Token({ text: token }));
                        //     //     _self.getView().byId("fbinp-iataNumber").addToken(new sap.m.Token({
                        //     //         text: token
                        //     //     }));
                        //     // });
                        //     // const sId = this.byId("fbinp-iataNumber");

                        //     // sId.getAggregation("tokenizer").setEditable(false);

                        // }
                        // _self.getView().byId("title").setText("Documents (" + data.invoices.length + ")");
                    }
                    if (data.ticketStatusReport.length > 0) {

                        _self.getView().byId("btn-excel").setVisible(true);
                         _self.getView().byId("txt-inr").setVisible(true);
                       // _self.getView().byId("btn-pdf").setVisible(true);


                    } else {
                        _self.getView().byId("btn-excel").setVisible(false);
                         _self.getView().byId("txt-inr").setVisible(false);
                       // _self.getView().byId("btn-pdf").setVisible(false);

                    }

                    // _self.getView().byId("count").setText("Total Invoices: " + data.invoices.length);

                    // this.oModel = new sap.ui.model.json.JSONModel([]);
                //   _self.getView().byId("title").setText("Ticket Status(" + _self.GSTDetails.ticketStatusReport.length + ")");
                //   _self.getView().byId("title").setText("Ticket Status(" + _self.GSTDetails.ticketStatusReport.length + " / " + _self.GSTDetails.totalInvoices +")");
                   if (_self.GSTDetails.ticketStatusReport.length > 0) {
                    _self.getView().byId("title").setText("Ticket Status" + " " + "(1 - "+ _self.GSTDetails.ticketStatusReport.length + " of " + _self.GSTDetails.totalInvoices + ")");
                } else {
                    _self.getView().byId("title").setText("Ticket Status(" + _self.GSTDetails.ticketStatusReport.length + ")");

                }
                
                    _self.oModel.setData(_self.GSTDetails);
                    _self.getView().setModel(_self.oModel, "GSTDetailsModel");
                    _self.byId("tbl_gstInvoices").setVisible(true);
                 //   _self.onSearch();

                    // this.byId("tbl_amendment").setVisible(true);

                }else{
                    sap.ui.core.BusyIndicator.hide();
                }
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

                sId.getAggregation("tokenizer").setEditable(false)
                // var tokens = this.byId("fbinp-iataNumber").getTokens();
                // tokens.forEach(function(token) {
                //     token.setEditable(false);
                // });
                /*var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
                if (oSelectedItem) {
                    this.getView().byId(this.inputId).setValue(oSelectedItem);
                }
                oEvent.getSource().getBinding("items").filter([]);*/
            },
            handleValueHelpbuyername: function (oEvent) {
                // this.setValuesToSearchHelp(oEvent);
                var sInputValue = oEvent.getSource().getValue();
                //this.InputId = oEvent.getSource().getId();
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.buyerNameDialog) {
                    this.buyerNameDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.buyerFIlterDialog", this);
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
            handleValueHelpSearchbuyername: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
                //oEvent.getSource().getBinding("items").Contains(sValue);
            },
            handlecancelbuyer: function (oEvent) {
                this.buyerNameDialog.close();
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

            //    this.getView().byId("fbinp-pnr").removeAllTokens();
                this.getView().byId("fbinp-iataNumber").removeAllTokens();
                this.getView().byId("fbinp-ticketNumber").removeAllTokens();
                this.getView().byId("fbinp-invoiceNumber").removeAllTokens();
                this.getView().byId("fbinp-buyername").removeAllTokens();
                this.getView().byId("fbinp-GSTIN").removeAllTokens();
           //     this.getView().byId("fbdat-invoiceDate").setValue("");
                this.getView().byId("fbdat-ticketIssueDate").setValue("");
                this.getView().byId("fbmc-GSTINAI").setSelectedKeys(null);
                this.fetchInvoices();
                this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", "" + decodedData.FirstName + ' ' + decodedData.LastName);
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "Ticket Status");
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/hinticon", true);
                // this.ISB2A_flag = false;
               

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
                    oSelIndices.forEach(function(iIndex) {
                    var oContext = oTable.getContextByIndex(iIndex);
                    var oData = oModel.getProperty(null, oContext);
                    const ID = oData.ID;
                    // oSelIndices.forEach(index => {
                    //     const ID = oTableData[index].ID
                        aInvoices.push({ ID })
                    });
                    if (oSelIndices.length > 100) {
                        sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageBox.warning('You have selected more than 100 invoices for downloading.It will Take some time to download.\n Do you want to continue ?', {
                        actions: ["Yes", MessageBox.Action.NO],
                        emphasizedAction: "Yes",
                        onClose: function (oAction) {
                            if (oAction === "Yes") {
                                sap.ui.core.BusyIndicator.show();
                    this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices : aInvoices}), (_self, data, message) => {
                        const invoices = data.invoicePDFs;
                        if (invoices.length > 0) {
                            invoices.forEach(element => {
                                const base64Data = "data:application/pdf;base64," + element.invoice;
                                const link = document.createElement('a');
                                link.href = base64Data;
                                link.download = `Invoice - ${element.invoiceNumber}`;
                                link.click();
                            });
                        }
                        sap.ui.core.BusyIndicator.hide();
                        
                    }); 
                    } else {
                        sap.ui.core.BusyIndicator.hide();
                    }
                }.bind(this)
            });
            }else{
                this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices : aInvoices}), (_self, data, message) => {
                    const invoices = data.invoicePDFs;
                    if (invoices.length > 0) {
                        invoices.forEach(element => {
                            const base64Data = "data:application/pdf;base64," + element.invoice;
                            const link = document.createElement('a');
                            link.href = base64Data;
                            link.download = `Invoice - ${element.invoiceNumber}`;
                            link.click();
                        });
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
            }
                }else{
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
                if(aSelectedIndices.length == 0){
                    MessageBox.information("Please select at least one row to proceed");
                    sap.ui.core.BusyIndicator.hide();
                }else{
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
                    // Now, aSelectedInvoiceNumbers contains the INVOICENUMBER of all selected rows
    
                    this.SendRequest(this, "/portal-api/portal/v1/get-ticket-status-report", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                        var base64Data = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + data.ticketStatusReport;
                        const link = document.createElement('a');
    
                        link.href = base64Data;
    
                        link.download = "Ticket status";
    
                        link.click();
    
    
                        sap.ui.core.BusyIndicator.hide();
                    });
                }else{
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.information("Please select the documents for exporting excel.");
                }
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
                    var filterval = {
                        pageNumber:1,
                        pageSize:100
    
                    };
                    this.loopfilters = {};
                
                    // filterval.isAmended = "false";
                    // this._OpenBusyDialog("");
                    var _self = this;


                    // if (this.ISB2A_flag == true) {
                    //     filterval.isMyBookings = this.isMyBookings;


                    // }
                    if (!oEvent) {
                        this.filtered_GSTDetails.invoices = this.GSTDetails.invoices.filter(function (item) {
                            return _self.selectedGSTN_array.includes(item.SUPPLIERGSTIN);
                        });
                        // _self.getView().byId("fbmc-GSTIN").setSelectedKeys(_self.selectedGSTN_array[0]);
                        _self.getView().byId("title").setText("Invoices(" + _self.GSTDetails.ticketStatusReport.length + ")");
                        _self.getView().getModel("GSTDetailsModel").setData(_self.GSTDetails);
                        _self.getView().getModel("GSTDetailsModel").refresh();
                        // _self.getView().getModel("uniqueGSTDetailsModel").refresh();
                        _self.getView().getModel("FilterDatamodel").refresh();
                        _self.byId("panel_table").setVisible(true);

                        _self.byId("tbl_gstInvoices").setVisible(true);

                        sap.ui.core.BusyIndicator.hide();
                    } else {

                        // if (filterval.isMyBookings === "my bookings") {
                        //     if (this.getView().byId("fbmc-GSTIN").getSelectedKeys().length < 1) {
                        //         MessageBox.error("Please select atleast one Buyer GSTIN");
                        //         sap.ui.core.BusyIndicator.hide();
                        //         return false;

                        //     }

                        // }
                        if (this.getView().byId("fbinp-invoiceNumber").getTokens().length > 0) {
                            // var fieldName = "invoiceNumber";
                            var invTokens = this.getView().byId("fbinp-invoiceNumber").getTokens();
                            var invToken = invTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var invarr = invToken.split(',');
                            // var arr = [];
                            // invTokens.forEach(function (item) {
                            //     arr[item] = item.mProperties.text;
                            // });

                            filterval.invoiceNumber = invarr;
                        }
                        // if (this.getView().byId("fbinp-pnr").getTokens().length > 0) {
                        //     // var fieldName = "pnr";
                        //     var pnrTokens = this.getView().byId("fbinp-pnr").getTokens();
                        //     var pnrToken = pnrTokens.map(function (oToken) {
                        //         return oToken.mProperties.text;
                        //     }).join(",");
                        //     var pnrarr = pnrToken.split(',');

                        //     filterval.pnr = pnrarr;
                        // }
                        if (this.getView().byId("fbmc-GSTINAI").getSelectedKeys() != "") {
                            // var fieldName = "supplierGSTIN";
                            filterval.supplierGSTIN = this.getView().byId("fbmc-GSTINAI").getSelectedKeys();
                        }
                        if (this.getView().byId("fbinp-GSTIN").getTokens().length > 0) {
                            // var fieldName = "passengerGSTIN";
                            // filterval.buyerGSTIN = this.getView().byId("fbmc-GSTIN").getSelectedKeys();
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

                            filterval.billToName = buyerarr;
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
                        
                        // if (this.getView().byId("fbdat-invoiceDate").getValue()) {
                        //     var daterange = this.getView().byId("fbdat-invoiceDate").getValue().split("to");
                        //     filterval.from = daterange[0].trim();
                        //     filterval.to = daterange[1].trim();
                        // }
                        // if (this.getView().byId("fbmc-TIMELINE").getSelectedKey()) {
                        //     var fieldName = "invoiceFilter";
                        //     filterval.invoiceFilter = this.getView().byId("fbmc-TIMELINE").getSelectedKey();
                        //     var TIMELINE_num = filterval.invoiceFilter;
                        // }
                        // if (this.getView().byId("fbdat-ticketIssueDate").getValue()) {
                        //     var daterange = this.getView().byId("fbdat-ticketIssueDate").getValue().split("to");
                        //     filterval.ticketIssueDateFrom = daterange[0].trim();
                        //     filterval.ticketIssueDateTo = daterange[1].trim();
                        // }
                        this.loopfilters = filterval;
                        this.SendRequest(this, "/portal-api/portal/v1/get-ticket-status-report", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {


                            sap.ui.core.BusyIndicator.hide();
                            if (data !== null) {
                                _self.GSTDetails = data;
                                if (data.ticketStatusReport.length > 0) {                                   
                                    _self.getView().byId("btn-excel").setVisible(true);
                                     _self.getView().byId("txt-inr").setVisible(true);
                                //    _self.getView().byId("btn-pdf").setVisible(true);
                                } else {
                                    _self.getView().byId("btn-excel").setVisible(false);
                                     _self.getView().byId("txt-inr").setVisible(false);
                                  //  _self.getView().byId("btn-pdf").setVisible(false);
                                }
                            //    _self.getView().byId("title").setText("Ticket Status(" + _self.GSTDetails.ticketStatusReport.length + " / " + _self.GSTDetails.totalInvoices +")");
                            if (_self.GSTDetails.ticketStatusReport.length > 0) {
                                _self.getView().byId("title").setText("Ticket Status" + " " + "(1 - "+ _self.GSTDetails.ticketStatusReport.length + " of " + _self.GSTDetails.totalInvoices + ")");
                            } else {
                                _self.getView().byId("title").setText("Ticket Status(" + _self.GSTDetails.ticketStatusReport.length + ")");
                            //    _self.getView().byId("title").setText("Ticket Status" + " " +"(" + _self.GSTDetails.ticketStatusReport.length + ")");
            
                            }
                             //   _self.getView().byId("title").setText("Ticket Status(" + _self.GSTDetails.ticketStatusReport.length + ")");


                                this.oModel = new sap.ui.model.json.JSONModel([]);

                                this.oModel.setData(data);

                                _self.getView().setModel(this.oModel, "GSTDetailsModel");
                            }else{
                                sap.ui.core.BusyIndicator.hide();
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
                //this._OpenBusyDialogNoDelay();

            },
            handlecancelinv: function (oEvent) {
                this.invNumberDialog.close();

            },
            onButtonDownloadPresssingle: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
              //  const oTable = this.byId("tbl_amendment");
               var row =  oEvent.getParameter("row").getIndex()
                
               // const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                const aInvoices = [];
                aInvoices.push({ID: oEvent.getParameter("row").getBindingContext("GSTDetailsModel").getProperty("ID")});
                //  aInvoices.push({ID:oTableData[row].ID});
                // if (oTableData.length) {
                //     oTableData.forEach(index => {
                //         const ID = index.ID
                //         aInvoices.push({ ID })
                //     });
                    this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices : aInvoices}), (_self, data, message) => {
                        const invoices = data.invoicePDFs;
                        if (invoices.length > 0) {
                            invoices.forEach(element => {
                                const base64Data = "data:application/pdf;base64," + element.invoice;
                                const link = document.createElement('a');
                                link.href = base64Data;
                                link.download = `Invoice - ${element.invoiceNumber}`;
                                link.click();
                            });
                        }
                        sap.ui.core.BusyIndicator.hide();
                    });
                // }
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
            onAmendmentRequest: function (oEvent) {
                if (this._handleInputValidation()) {
                    sap.ui.core.BusyIndicator.show();
                    var invnum = sap.ui.getCore().byId("inp-invnum").getText();
                    var oldgstin = sap.ui.getCore().byId("inp-gstin").getText();
                    if (sap.ui.getCore().byId("combo-act").getVisible()) {
                        var action = sap.ui.getCore().byId("combo-act").getSelectedKey();
                        if (action == "CG") {


                            var newgstin = sap.ui.getCore().byId("inp-newgstin").getSelectedKey();
                            if (newgstin === oldgstin) {
                                MessageBox.error("New GSTIN and existing GSTIN are same!")
                                sap.ui.core.BusyIndicator.hide();
                                return false;

                            }
                            else {

                                const reqData = {
                                    amendmentRequests: [{
                                        gstin: newgstin,
                                        invoiceNumber: invnum
                                    }]
                                }
                                this.SendRequest(this, "/portal-api/portal/v1/make-gstin-amendment", "POST", {}, JSON.stringify(reqData), (_self, data, message) => {

                                    _self.getView().byId("tbl_amendment").clearSelection();
                                    //   sap.ui.core.BusyIndicator.hide();
                                    if (data) {

                                        MessageBox.success(data[0].message);
                                        _self.onCloseAmendmet();

                                    }
                                    else {

                                        MessageBox.error("Something went wrong!");
                                        _self.onCloseAmendmet();
                                        sap.ui.core.BusyIndicator.hide();

                                    }
                                    this.onSearch(oEvent);
                                });
                            }
                        } else {
                            const reqData = {
                                amendmentRequests: [{
                                    address: sap.ui.getCore().byId("inp-address").getValue(),
                                    invoiceNumber: sap.ui.getCore().byId("inp-invnum").getText()
                                }]
                            }
                            this.SendRequest(this, "/portal-api/portal/v1/make-address-amendment", "POST", {}, JSON.stringify(reqData), (_self, data, message) => {

                                // sap.ui.core.BusyIndicator.hide();
                                // if (data.status === "SUCCESS") {
                                //     MessageBox.success(message.Text);
                                //     _self.onCloseAmendmet();

                                // }
                                // else {
                                //     MessageBox.error(message.Text);
                                //     _self.onCloseAmendmet();

                                // }
                                // this.onSearch(oEvent);
                                _self.getView().byId("tbl_amendment").clearSelection();
                                //   sap.ui.core.BusyIndicator.hide();
                                if (data) {

                                    MessageBox.success(data[0].message);
                                    _self.onCloseAmendmet();


                                }
                                else {

                                    MessageBox.error("Something went wrong!");
                                    _self.onCloseAmendmet();
                                    sap.ui.core.BusyIndicator.hide();

                                }
                                this.onSearch(oEvent);

                            });
                        }
                    }
                    else {
                        const reqData = {
                            amendmentRequests: [
                                {
                                    gstin: sap.ui.getCore().byId("inp-newgstinb2a").getValue(),
                                    invoiceNumber: invnum
                                }]
                        }
                        this.SendRequest(this, "/portal-api/portal/v1/make-gstin-amendment", "POST", {}, JSON.stringify(reqData), (_self, data, message) => {

                            _self.getView().byId("tbl_amendment").clearSelection();
                            //   sap.ui.core.BusyIndicator.hide();
                            if (data) {

                                MessageBox.success(data[0].message);
                                _self.onCloseAmendmet();


                            }
                            else {

                                MessageBox.error("Something went wrong!");
                                _self.onCloseAmendmet();
                                sap.ui.core.BusyIndicator.hide();

                            }
                            this.onSearch(oEvent);
                        });

                    }

                }
            },
            _handleInputValidation: function () {
                var validate = true;
                if (sap.ui.getCore().byId("combo-act").getVisible()) {
                    var combo = sap.ui.getCore().byId("combo-act").getSelectedKey();
                    var id;
                    if (combo === "RG") {
                        id = sap.ui.getCore().byId("inp-address");
                        if (id.getValue()) {
                            id.setValueState("None").setValueStateText("");
                        } else {
                            id.setValueState("Error").setValueStateText("Address is Mandatory");
                            validate = false;
                        }
                    }
                    else {
                        id = sap.ui.getCore().byId("inp-newgstin");
                        if (id.getSelectedKey()) {
                            id.setValueState("None").setValueStateText("");
                        } else {
                            id.setValueState("Error").setValueStateText("GSTIN is Mandatory");
                            validate = false;
                        }
                    }
                }
                else {
                    var new_gst = sap.ui.getCore().byId("inp-newgstinb2a");
                    if (new_gst.getValue()) {
                        new_gst.setValueState("None").setValueStateText("");
                    } else {
                        new_gst.setValueState("Error").setValueStateText("GSTIN is Mandatory");
                        validate = false;
                    }
                    return validate;
                }

                return validate;
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

            onCloseAmendmet: function () {
                sap.ui.getCore().byId("inp-address").setValue("");
                sap.ui.getCore().byId("inp-newgstin").setSelectedItem(null);
                sap.ui.getCore().byId("inp-newgstinb2a").setValue("");


                this.amendmentDialog.close();
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

            }
        });
    }
);