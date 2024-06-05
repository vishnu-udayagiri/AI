sap.ui.define(
    ["sap/ui/core/mvc/Controller",
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
        MessageBox,
        Device,
        PDFViewer,
        JSONModel, exportLibrary, Spreadsheet) {
        "use strict";
        var EdmType = exportLibrary.EdmType;
        return Controller.extend("airindiagst.controller.discrepancy", {
            onAfterRendering: function () {
            },
            onInit: async function () {
               // sap.ui.core.BusyIndicator.show();
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("discrepancy").attachPatternMatched(this._routeMatched, this);
                this.SendRequest = this.getOwnerComponent().SendRequest;
            },
            _routeMatched: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                this.byId("tbl_gstInvoices").setVisible(false);
                this.byId("panel_table").setVisible(false);
                
                const jwt = sessionStorage.getItem("jwt")
                
                var decodedData;
                if (jwt) {
                    decodedData = JSON.parse(atob(jwt.split('.')[1]));
                }
                this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", " " + decodedData.FirstName + ' ' + decodedData.LastName);
                //this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage",decodedData.Email.split("@")[0]);
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "Discrepancy Report");
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", true);
                this.defaultGSTN_num = "";
                this.defaultperiod ="";
                this.selectedGSTN_array = [];
                this.ISB2A_flag= false;
                if(decodedData.ISB2A == true){
                    
                    this.byId("fbinp-iataNumber").setEnabled(false);
                    this.ISB2A_flag = true;
                }else{
                    this.ISB2A_flag= false;
                    this.byId("fbinp-iataNumber").setEnabled(true);
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
                var filterJson;
                var skip = "0";
                var top= "5";
                var filterval = {
                    
                };
                // this.SendRequest(this, "/portal-api/portal/v1/get-user-invoices", "POST", {}, JSON.stringify(filterval) , (_self, data, message) => {
                //     _self.GSTDetails = data;
                //     console.log(data)
                    
                //     _self.oModel = new sap.ui.model.json.JSONModel([]);
                //     _self.oModel.setData(_self.GSTDetails.invoices);
                //     var oModelData = new sap.ui.model.json.JSONModel();
                //     filterJson = {
                //     };
                //     filterJson = _self.GSTDetails.filters;
                //     _self.defaultGSTN_num =_self.GSTDetails.filters.defaultGSTIN;
                //     _self.defaultperiod = _self.GSTDetails.filters.invoiceFilter;
                //     oModelData.setData(filterJson);
                //     _self.getView().setModel(oModelData, "FilterDatamodel");
                //     _self.getView().setModel(_self.oModel, "GSTDetailsModel");
                //     _self.uniqueGSTDetails.results = _self.GSTDetails.distinctSupplierGstin;
                //     _self.oModel = new sap.ui.model.json.JSONModel([]);
                //     _self.oModel.setData(_self.uniqueGSTDetails);
                //     _self.getView().setModel(_self.oModel, "uniqueGSTDetailsModel");
                //     // _self.selectedGSTN_array.push(_self.defaultGSTN_num,);
                //     _self.byId("fbmc-GSTIN").setSelectedKeys(_self.defaultGSTN_num);
                //     _self.byId("fbmc-TIMELINE").setSelectedKey(_self.defaultperiod);
                //     if(this.ISB2A_flag){
                //     _self.getView().byId("fbinp-iataNumber").setValue(_self.GSTDetails.filters.agentName[0]);
                //     }
                //     //_self.getView().byId("container-airindiagst---GSTInvoices--fbmc-GSTIN").setSelectedKeys(_self.selectedGSTN_array);
                //     //_self.getView().byId("fbmc-GSTIN").setSelectedItems(_self.selectedGSTN_array);

                //     _self.onSearch();

                //     sap.ui.core.BusyIndicator.hide();
                // });
                sap.ui.core.BusyIndicator.hide();
                this.byId("tbl_gstInvoices").setVisible(true);
              

            },
            onSearch: function (oEvent) {
                if (!this.getView().byId("filterbar").isDialogOpen()) {
                    sap.ui.core.BusyIndicator.show();
                    var filter = new Array();
                    var filterval = {};
                    var _self = this;
                    if(!oEvent){
                    this.filtered_GSTDetails.invoices = this.GSTDetails.invoices.filter(function (item) {
                        return _self.selectedGSTN_array.includes(item.SUPPLIERGSTIN);
                    });
                    // _self.getView().byId("fbmc-GSTIN").setSelectedKeys(_self.selectedGSTN_array[0]);
                    _self.getView().byId("title").setText("Invoices(" + _self.GSTDetails.invoices.length + ")");
                    _self.getView().getModel("GSTDetailsModel").setData(_self.GSTDetails);
                    _self.getView().getModel("GSTDetailsModel").refresh();
                    // _self.getView().getModel("uniqueGSTDetailsModel").refresh();
                    _self.getView().getModel("FilterDatamodel").refresh();
                    _self.byId("panel_table").setVisible(true);
                
                    _self.byId("tbl_gstInvoices").setVisible(true);

                    sap.ui.core.BusyIndicator.hide();    
                    }else{
                    sap.ui.core.BusyIndicator.show();
                    if (this.getView().byId("fbinp-invoiceNumber").getValue()) {
                        var selectedinvNum = [];
                        selectedinvNum = this.getView().byId("fbinp-invoiceNumber").getValue();
                        filterval.invoiceNumber = selectedinvNum;
                    }
                    if (this.getView().byId("fbmc-DocType").getValue()) {
                        filterval.documentType = this.getView().byId("fbmc-DocType").getSelectedKey();
                       
                    }
                    if (this.getView().byId("fbinp-ticketNumber").getValue()) {
                        var fieldName = "ticketNumber";
                        filterval.ticketNumber = this.getView().byId("fbinp-ticketNumber").getValue();
                        var tkt_num= filterval.ticketNumber;
                    }
                    if (this.getView().byId("fbinp-iataNumber").getValue()) {
                        var fieldName = "iataNumber";
                        filterval.iataNumber = this.getView().byId("fbinp-iataNumber").getValue();
                        var iata_num= filterval.iataNumber;
                    }
                    if (this.getView().byId("fbmc-TIMELINE").getSelectedKey()) {
                        var fieldName = "invoiceFilter";
                        filterval.invoiceFilter = this.getView().byId("fbmc-TIMELINE").getSelectedKey();
                        var TIMELINE_num= filterval.invoiceFilter;
                    }
                    if (this.getView().byId("fbmc-GSTIN").getSelectedKeys() != "") {
                        var fieldName = "passengerGSTIN";
                        filterval.passengerGSTIN = this.getView().byId("fbmc-GSTIN").getSelectedKeys();
                        var TIMELINE_num= filterval.passengerGSTIN;
                    }
                    if (this.getView().byId("fbmc-GSTINAI").getSelectedKeys() != "") {
                        var fieldName = "supplierGSTIN";
                        filterval.supplierGSTIN = this.getView().byId("fbmc-GSTINAI").getSelectedKeys();
                        var TIMELINE_num= filterval.supplierGSTIN;
                    }
                    if(this.getView().byId("fbdat-DateofIssue").getValue()){
                        var daterange = this.getView().byId("fbdat-DateofIssue").getValue().split("to");
                        filterval.issuanceFrom = daterange[0].trim();
                        filterval.issuanceTo = daterange[1].trim();
                    }
                    if(this.getView().byId("fbdat-invoiceDate").getValue()){
                        var daterange = this.getView().byId("fbdat-invoiceDate").getValue().split("to");
                        filterval.from = daterange[0].trim();
                        filterval.to = daterange[1].trim();
                    }
                  //  filterval.isAmended = false;
                    // this.SendRequest(this, "/portal-api/portal/v1/get-user-invoices?invoiceFilter=" + TIMELINE_num +"&invoiceNumber=" + inv_num +"&iataNumber=" + iata_num +"&ticketNumber=" + tkt_num, "GET", {}, JSON.stringify(filterval) , (_self, data, message) => {
                        this.SendRequest(this, "/portal-api/portal/v1/get-user-invoices", "POST", {}, JSON.stringify(filterval) , (_self, data, message) => {   
                        _self.GSTDetails = data;
                        _self.getView().byId("title").setText("Invoices(" + _self.GSTDetails.invoices.length + ")");
                        if(_self.GSTDetails.invoices.length == 0){
                            _self.getView().byId("btn-excel").setVisible(false);
                            _self.getView().byId("txt-inr").setVisible(false);
                            _self.getView().byId("btn-pdf").setVisible(false);
                        }else{
                            _self.getView().byId("btn-excel").setVisible(true);
                            _self.getView().byId("txt-inr").setVisible(true);
                            _self.getView().byId("btn-pdf").setVisible(true);
                        }
                        _self.getView().getModel("GSTDetailsModel").setData(_self.GSTDetails);   
                        _self.getView().getModel("GSTDetailsModel").refresh(); 
                        _self.byId("panel_table").setVisible(true);
                 
                        _self.byId("tbl_gstInvoices").setVisible(true);
                        sap.ui.core.BusyIndicator.hide();
                         
                  });
                    }                  
                }
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
                var _self = this;
                var filterJson;
                this.inputId = oEvent.getSource().getId();
                if (!this.invNumberDialog) {
                    this.invNumberDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.invoiceNumberFIlterDialog", this);
                }
                this.getView().addDependent(this.invNumberDialog);
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.invNumberDialog);
                _self.getView().getModel("FilterDatamodel").refresh();
                _self.invNumberDialog.open();

            },
            handleValueHelpCloseinvoiceNum: function (oEvent) {
                var _self = this;
                var oSelectedItem = oEvent.getParameter('selectedItem').getTitle();
                //oEvent.getParameter("selectedContexts");
                if (oSelectedItem) {
                    var filterInvnum = this.getView().byId(this.inputId);
                    filterInvnum.setValue(oSelectedItem);
                }
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
            //for iata number filter
            handleValueHelpiataNum: function (oEvent) {
                var _self = this;
                this.inputId = oEvent.getSource().getId();
                if (!this.iataNumberDialog) {
                    this.iataNumberDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.iataNumberFIlterDialog", this);
                }
                this.getView().addDependent(this.iataNumberDialog);
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.iataNumberDialog);
                _self.iataNumberDialog.open();

            },
            handleValueHelpCloseiataNum: function (oEvent) {
                var _self = this;
                var oSelectedItem = oEvent.getParameter('selectedItem').getTitle();
                //oEvent.getParameter("selectedContexts");
                if (oSelectedItem) {
                    var filterIatanum = this.getView().byId(this.inputId);
                    filterIatanum.setValue(oSelectedItem);
                }
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
            //for ticket number filter
            handleValueHelpticketNum: function (oEvent) {
                var _self = this;
                this.inputId = oEvent.getSource().getId();
                if (!this.ticketNumberDialog) {
                    this.ticketNumberDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.ticketNumberFIlterDialog", this);
                }
                this.getView().addDependent(this.ticketNumberDialog);
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.ticketNumberDialog);
                _self.ticketNumberDialog.open();

            },
            handleValueHelpCloseticketNum: function (oEvent) {
                var _self = this;
                var oSelectedItem = oEvent.getParameter('selectedItem').getTitle();
                //oEvent.getParameter("selectedContexts");
                if (oSelectedItem) {
                    var filterTicketnum = this.getView().byId(this.inputId);
                    filterTicketnum.setValue(oSelectedItem);
                }
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
            
            onPressExportExcel: function () {
                var filterval={

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
                if(aSelectedInvoiceNumbers.length>0){
                    filterval.invoiceNumber = aSelectedInvoiceNumbers;
                }else{

                    if (this.getView().byId("fbinp-invoiceNumber").getValue()) {
                        var selectedinvNum = [];
                        selectedinvNum = this.getView().byId("fbinp-invoiceNumber").getValue();
                        filterval.invoiceNumber = selectedinvNum;
                    }
                    if (this.getView().byId("fbmc-DocType").getValue()) {
                        filterval.documentType = this.getView().byId("fbmc-DocType").getSelectedKey();
                       
                    }
                    if (this.getView().byId("fbinp-ticketNumber").getValue()) {
                        var fieldName = "ticketNumber";
                        filterval.ticketNumber = this.getView().byId("fbinp-ticketNumber").getValue();
                        var tkt_num= filterval.ticketNumber;
                    }
                    if (this.getView().byId("fbinp-iataNumber").getValue()) {
                        var fieldName = "iataNumber";
                        filterval.iataNumber = this.getView().byId("fbinp-iataNumber").getValue();
                        var iata_num= filterval.iataNumber;
                    }
                    if (this.getView().byId("fbmc-TIMELINE").getSelectedKey()) {
                        var fieldName = "invoiceFilter";
                        filterval.invoiceFilter = this.getView().byId("fbmc-TIMELINE").getSelectedKey();
                        var TIMELINE_num= filterval.invoiceFilter;
                    }
                    if (this.getView().byId("fbmc-GSTIN").getSelectedKeys() != "") {
                        var fieldName = "passengerGSTIN";
                        filterval.passengerGSTIN = this.getView().byId("fbmc-GSTIN").getSelectedKeys();
                        var TIMELINE_num= filterval.passengerGSTIN;
                    }
                    if (this.getView().byId("fbmc-GSTINAI").getSelectedKeys() != "") {
                        var fieldName = "supplierGSTIN";
                        filterval.supplierGSTIN = this.getView().byId("fbmc-GSTINAI").getSelectedKeys();
                        var TIMELINE_num= filterval.supplierGSTIN;
                    }
                    if(this.getView().byId("fbdat-DateofIssue").getValue()){
                        var daterange = this.getView().byId("fbdat-DateofIssue").getValue().split("to");
                        filterval.issuanceFrom = daterange[0].trim();
                        filterval.issuanceTo = daterange[1].trim();
                    }
                    if(this.getView().byId("fbdat-invoiceDate").getValue()){
                        var daterange = this.getView().byId("fbdat-invoiceDate").getValue().split("to");
                        filterval.from = daterange[0].trim();
                        filterval.to = daterange[1].trim();
                    }
                }
                filterval.generateExcel = true;
                // Now, aSelectedInvoiceNumbers contains the INVOICENUMBER of all selected rows
                console.log("Selected Invoice Numbers: ", aSelectedInvoiceNumbers);

                    this.SendRequest(this, "/portal-api/portal/v1/get-user-invoices", "POST", {}, JSON.stringify(filterval) , (_self, data, message) => {   
                    var base64Data = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,"+data.excel;
                    console.log(base64Data);
                    const link = document.createElement('a');
 
                            link.href = base64Data;

                            link.download = "GST Invoices";

                            link.click();
                    

                    sap.ui.core.BusyIndicator.hide();
                });

            },
            onButtonDownloadPress: function () {
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/portal-api/portal/v1/sample-download-pdf", "GET", {}, null , (_self, data, message) => {   
                    var base64Data = data.file;
                   // var base64DataNew = data;
                    console.log(base64Data);

                    const link = document.createElement('a');
 
                            link.href = base64Data;

                            link.download = "GST Invoices";

                            link.click();
                    

                    sap.ui.core.BusyIndicator.hide();
                });

            }
        });
    }
);