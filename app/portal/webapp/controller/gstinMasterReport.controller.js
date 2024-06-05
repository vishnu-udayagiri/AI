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
        return Controller.extend("airindiagst.controller.gstinMasterReport", {
            formatDocumentType: function(sType) {
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
                    var formattedDate = partsChanged[2] + "-" + partsChanged[1] + "-" + partsChanged[0] ;
    
                    // Output the formatted date
                    return formattedDate;
                }
            },
            onAfterRendering: function () {
            },
            restore: function () {
                var oFilterBar = this.byId("filterbar");
                oFilterBar.getAllFilterItems().forEach(function (oFilterItem) {
                    oFilterItem.setVisibleInFilterBar(true);
                });
            },
            onInit: async function () {
                sap.ui.core.BusyIndicator.show();
                this.jwt = sessionStorage.getItem("jwt")
                if (!this.jwt) {
                    window.location.replace('/portal/index.html');
                }
                this._registerForP13n();
               
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("gstinMasterReport").attachPatternMatched(this._routeMatched, this);
                this.SendRequest = this.getOwnerComponent().SendRequest;
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user",false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend",false);
                this.IATA = {
                };


            },
            onScroll: function (oEvent) {

                var totalPages = Math.ceil(this.GSTDetails.totalInvoices / 10);
                if (this.loopfilters.pageNumber <= totalPages) {
                    sap.ui.core.BusyIndicator.show();
                    this.loopfilters.pageNumber = this.loopfilters.pageNumber + 1;
                    this.SendRequest(this, "/portal-api/portal/v1/get-gstin-reports", "POST", {}, JSON.stringify(this.loopfilters), (_self, data, message) => {
                        if(data !== null){
                        if (data.GSTINDATA.length > 0) {
                            _self.GSTDetails.GSTINDATA = [..._self.GSTDetails.GSTINDATA, ...data.GSTINDATA];
                            _self.getView().byId("title").setText("GSTIN Master" + " " + "(1 - " + _self.GSTDetails.GSTINDATA.length + " of " + _self.GSTDetails.totalInvoices + ")");
                            _self.getView().getModel("GSTDetailsModel").refresh();
                        }
                    }
                    sap.ui.core.BusyIndicator.hide();
                    });
                }
            },
            _routeMatched: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                this.getView().byId("fbmc-DocType").setSelectedKeys("INVOICE");
                this.byId("panel_table").setVisible(true);
                this.getView().byId("fbmc-GSTINAI").removeAllSelectedItems();
                this.getView().byId("fbmc-DocType").setSelectedKeys("INVOICE");
                this.getView().byId("fbinp-pnrNumber").removeAllTokens();
                this.getView().byId("fbinp-iataNumber").removeAllTokens();
                this.getView().byId("fbinp-ticketNumber").removeAllTokens();
                this.getView().byId("fbinp-gstinData").removeAllTokens();
                this.getView().byId("fbinp-gstType").removeAllTokens();
                this.getView().byId("fbdat-invoiceDate").setValue("");
                this.getView().byId("fbmc-GSTINAI").setSelectedKeys(null);
                if(this.iataNumberDialog){
                    this.iataNumberDialog.clearSelection(true);
                    }
                    if(this.pnrNumDialog){
                    this.pnrNumDialog.clearSelection(true);
                    }
                    if(this.ticketNumberDialog){
                    this.ticketNumberDialog.clearSelection(true);
                    }
                    if(this.filterInvnum){
                    this.filterInvnum.clearSelection(true);
                    }
                    if(this.buyerNameDialog){
                    this.buyerNameDialog.clearSelection(true);
                    }

                const jwt = sessionStorage.getItem("jwt")

                var decodedData;
                if (jwt) {
                    decodedData = JSON.parse(atob(jwt.split('.')[1]));
                }
                this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", " " + decodedData.FirstName + ' ' + decodedData.LastName);
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "GSTIN Master Report");
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user",false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend",false);
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
                    this.byId("fbinp-gstinStatus").setSelectedKeys(this.defaultGSTN_num);
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
                filterval.pageNumber = 1;
                filterval.pageSize = 10;
                this.loopfilters = {};
                this.loopfilters = filterval;

                this.SendRequest(this, "/portal-api/portal/v1/get-gstin-reports", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                    if(data !== null){
                        sap.ui.core.BusyIndicator.hide();
                        _self.GSTDetails = data;
                        _self.oModel = new sap.ui.model.json.JSONModel([]);
                        _self.oModel.setData(_self.GSTDetails);
    
                        var oModelData = new sap.ui.model.json.JSONModel([]);
                        if (data.filters) {
                            _self.filterJson = data.filters;
                            oModelData.setData(_self.filterJson);
                            _self.getView().setModel(oModelData, "FilterDatamodel");
    
                            _self.getView().byId("fbinp-gstinStatus").setSelectedKeys(this.filterJson.defaultGSTIN);
                          
                        }
                        if (data.GSTINDATA.length > 0) {
    
                            _self.getView().byId("btn-excel").setVisible(true);

                        } else {
                            _self.getView().byId("btn-excel").setVisible(false);
    
                        }
                        if (_self.GSTDetails.GSTINDATA.length > 0) {
                            _self.getView().byId("title").setText("GSTIN Master" + " " + "(1 - " + _self.GSTDetails.GSTINDATA.length + " of " + _self.GSTDetails.totalInvoices + ")");
                        } else {
                            _self.getView().byId("title").setText("GSTIN Master(" + _self.GSTDetails.GSTINDATA.length + ")");
    
                        }
                        _self.oModel.setData(_self.GSTDetails);
    
    
                        _self.getView().setModel(_self.oModel, "GSTDetailsModel");
                        _self.byId("tbl_gstInvoices").setVisible(true);
                        _self.byId("panel_table").setVisible(true);
    
                }else{
                    sap.ui.core.BusyIndicator.hide();
                }
                });

            },
            onSearch: function (oEvent) {
                if (!this.getView().byId("filterbar").isDialogOpen()) {
                    sap.ui.core.BusyIndicator.show();
                    var filter = new Array();
                    var filterval = {};
                    filterval.pageNumber = 1;
                filterval.pageSize = 10;
                    var _self = this;
                        if (this.getView().byId("fbinp-gstinData").getTokens().length > 0) {
                            var invTokens = this.getView().byId("fbinp-gstinData").getTokens();
                            var invToken = invTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var invarr  = invToken.split(',');
                            filterval.GSTIN = invarr;
                        }
                        if (this.getView().byId("fbinp-gstType").getTokens().length > 0) {
                            // var fieldName = "billToName";
                            var buyerTokens = this.getView().byId("fbinp-gstType").getTokens();
                            var buyerToken = buyerTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var buyerarr  = buyerToken.split(',');

                            filterval.Type = buyerarr;
                            // var iata_num = filterval.iataNumber;
                        }
                        if (this.getView().byId("fbinp-gstinStatus").getSelectedKeys() != "") {
                            filterval.Status = this.getView().byId("fbinp-gstinStatus").getSelectedKeys();
                        }
                        this.loopfilters = {};
                        this.loopfilters = filterval;
                        this.SendRequest(this, "/portal-api/portal/v1/get-gstin-reports", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                           if(data !== null){
                            _self.GSTDetails = data;
                        
                            if (_self.GSTDetails.GSTINDATA.length == 0) {
                                _self.getView().byId("btn-excel").setVisible(false);
                            } else {
                                _self.getView().byId("btn-excel").setVisible(true);
                            }
                            if (_self.GSTDetails.GSTINDATA.length > 0) {
                                _self.getView().byId("title").setText("GSTIN Master" + " " + "(1 - " + _self.GSTDetails.GSTINDATA.length + " of " + _self.GSTDetails.totalInvoices + ")");
                            } else {
                                _self.getView().byId("title").setText("GSTIN Master(" + _self.GSTDetails.GSTINDATA.length + ")");
        
                            }
                            _self.getView().getModel("GSTDetailsModel").setData(_self.GSTDetails);
                            _self.getView().getModel("GSTDetailsModel").refresh();
                            _self.byId("panel_table").setVisible(true);

                            _self.byId("tbl_gstInvoices").setVisible(true);
                            sap.ui.core.BusyIndicator.hide();
                        }else{
                            sap.ui.core.BusyIndicator.hide();
                        }

                        });
                
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
            handleSelectedGSTIN: function () {
                this.selectedGSTN_array = [];
                var selectedGSTN = this.getView().byId("fbinp-gstinStatus").getSelectedItems();
                this.selectedGSTN_array = selectedGSTN.map(function (oToken) {
                    return oToken.mProperties.key;
                });
            },
        
            handleValueHelpinvoiceNum: function (oEvent) {
                
                var sInputValue = oEvent.getSource().getValue();
               
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.filterInvnum) {
                    this.filterInvnum = sap.ui.xmlfragment("airindiagst.view.Fragment.gstinMasterGstinValue", this);
                    this.getView().addDependent(this.filterInvnum);
                }

                var oList = this.filterInvnum._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.filterInvnum._aSelectedItems;
                this.filterInvnum.open();
          

            },
            handlecancelinv: function(oEvent){
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
                
                this.byId("fbinp-gstinData").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-gstinData");
                var aTitle = [];
                this.oListPlant = this.filterInvnum._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject();
                    aTitle.push(text);
                }
                
                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("fbinp-gstinData").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                const sId = this.byId("fbinp-gstinData");

                sId.getAggregation("tokenizer").setEditable(false)
               
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
            handlecancelpnr: function(oEvent){
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
                var oSelectedItems = oEvent.getParameter("selectedItems"),
                    oInput = this.byId("fbinp-pnrNumber");
                var aTitle = [];
                this.oListPlant = this.pnrNumDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getTitle();
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
                var oSelectedItems = oEvent.getParameter("selectedItems"),
                    oInput = this.byId("fbinp-iataNumber");
                var aTitle = [];
                this.oListPlant = this.iataNumberDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getTitle();
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
            handlecancelticket: function(oEvent){

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
                var oSelectedItems = oEvent.getParameter("selectedItems"),
                    oInput = this.byId("fbinp-ticketNumber");
                var aTitle = [];
                this.oListPlant = this.ticketNumberDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getTitle();
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
           
            onPressExportExcel: function () {
                var filterval = {

                };
                sap.ui.core.BusyIndicator.show();
               
                var oTable = this.byId("tbl_gstInvoices");

              
                var aSelectedIndices = oTable.getSelectedIndices();
                if(aSelectedIndices.length == 0){
                    MessageBox.information("Please select at least one row to proceed");
                    sap.ui.core.BusyIndicator.hide();
                }else{

               
                var aSelectedInvoiceNumbers = [];
                var oModel = oTable.getModel("GSTDetailsModel");
              
                aSelectedIndices.forEach(function (aSelectedIndices) {
                    var oContext = oTable.getContextByIndex(aSelectedIndices);
                    var oData = oModel.getProperty(null, oContext);
                    const sInvoiceNumber = oData.GSTIN;
                    aSelectedInvoiceNumbers.push(sInvoiceNumber);
                });
                if (aSelectedInvoiceNumbers.length > 0) {
                    filterval.GSTIN = aSelectedInvoiceNumbers;
                filterval.generateExcel = true;
                this.SendRequest(this, "/portal-api/portal/v1/get-gstin-reports", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                    var base64Data = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + data.GSTINDATA;
                    const link = document.createElement('a');

                    link.href = base64Data;

                    link.download = "GSTIN Master";

                    link.click();


                    sap.ui.core.BusyIndicator.hide();
                });
              }else{
                sap.ui.core.BusyIndicator.hide();
                MessageBox.information("Please select the documents for exporting as excel.");
            }
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
                    oSelIndices.forEach(function(iIndex) {
                    var oContext = oTable.getContextByIndex(iIndex);
                    var oData = oModel.getProperty(null, oContext);
                    const ID = oData.ID;
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
            onButtonDownloadPresssingle: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
               var row =  oEvent.getParameter("row").getIndex()
                const aInvoices = [];
                aInvoices.push({ID: oEvent.getParameter("row").getBindingContext("GSTDetailsModel").getProperty("ID")});
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
           
            handleValueHelpbuyername: function (oEvent) {
               
                var sInputValue = oEvent.getSource().getValue();
             
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.buyerNameDialogs) {
                    this.buyerNameDialogs = sap.ui.xmlfragment("airindiagst.view.Fragment.gstinMasterGstType", this);
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
            handlecancelbuyer: function(oEvent){
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
                
                this.byId("fbinp-gstType").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-gstType");
                var aTitle = [];
                this.oListPlant = this.buyerNameDialogs._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject();
                    aTitle.push(text);
                }
               
                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("fbinp-gstType").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                var tokens = this.byId("fbinp-gstinData").getTokens();

                const sId = this.byId("fbinp-gstinData");

                sId.getAggregation("tokenizer").setEditable(false)
               
                
            },
            ondocTypeComboChange: function(oEvent){
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
            onContainerScroll: function(oEvent){
            },
            _registerForP13n: function () {
                var oTable = this.byId("tbl_gstInvoices");
                this.oMetadataHelper = new MetadataHelper([
                    { key: "col_doctype", label: "Document Type", path: "DOCUMENTTYPE" },
                    { key: "col_invnum", label: "Invoice Number", path: "INVOICENUMBER" },
                    { key: "col_docdate", label: "Invoice Date", path: "INVOICEDATE" },
                    { key: "col_ticketnum", label: "Ticket Number", path: "TICKETNUMBER" },
                    { key: "col_ticketdate", label: "Ticket Issue Date", path: "TICKETISSUEDATE" },
                    { key: "col_pnrnum", label: "PNR Number", path: "PNR" },
                    { key: "col_billtoname", label: "Buyer Name", path: "BILLTONAME" },
                    { key: "col_passengergstin", label: "Buyer GSTIN", path: "PASSENGERGSTIN" },
                    { key: "col_suppliergstin", label: "Supplier GSTIN", path: "SUPPLIERGSTIN" },
                    { key: "col_nettax", label: "Net Taxable Value", path: "NETTAXABLEVALUE" },
                    { key: "col_cominedtax", label: "Combined Tax Rate", path: "TAXRATE" },
                    { key: "col_totaltax", label: "Total Tax", path: "TOTALTAX" },
                    { key: "col_totalinvoice", label: "Total Invoice Amount", path: "TOTALINVOICEAMOUNT" },
                    { key: "col_cgstrate", label: "CGST Rate", path: "CGSTRATE" },
                    { key: "col_cgstamount", label: "CGST Amount", path: "COLLECTEDCGST" },
                    { key: "col_sgstrate", label: "SGST Rate", path: "SGSTRATE" },
                    { key: "col_sgstamount", label: "SGST Amount", path: "COLLECTEDSGST" },
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