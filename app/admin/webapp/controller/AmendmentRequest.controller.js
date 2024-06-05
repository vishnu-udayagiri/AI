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
        return Controller.extend("admindashboard.controller.AmendmentRequest", {
            onAfterRendering: function () {
            },
            onInit: function () {

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("AmendmentRequest").attachPatternMatched(this._routeMatched, this);
                //*******************************
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
                    results: []
                }
                this.filtered_GSTDetails = {
                    results: []
                }
                this.uniqueGSTDetails = {
                    results: []
                }
                this.selectedGSTN_array = [];
        //        this.Fetch_GSTDetails();
                // this.handleSelectedGSTIN(); // temporarly for loading data initialy with default gstn
         //       this.onSearch(); // temporarly for loading data initialy with default gstn
                var oModelData = new sap.ui.model.json.JSONModel();
                this.filterJson = {
                   
                };
                this.filterJson.results = this.GSTDetails.results;
                oModelData.setData(this.filterJson);
                this.getView().setModel(oModelData, "FilterDatamodel");
//                 var oTable = this.getView().byId("tbl_amendment");
// oTable.attachBrowseEvent("scroll", this.handleTableScroll, this);

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
                var oTable = this.getView().byId("tbl_amendment");
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
            handleValueHelpClosePNR: function (oEvent) {
                var _self = this;
                var oSelectedItem = oEvent.getParameter('selectedItem').getTitle();
                //oEvent.getParameter("selectedContexts");
                if (oSelectedItem) {
                    var filterInvnum = this.getView().byId(this.inputId);
                    filterInvnum.setValue(oSelectedItem);
                }
            },
            extractPANFromGSTIN:function (gstin) {
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
                var _self = this;
               
                this.inputId = oEvent.getSource().getId();
                if (!this.pnrNumDialog) {
                    this.pnrNumDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.PNRdetails", this);
                }
                this.getView().addDependent(this.pnrNumDialog);
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.pnrNumDialog);
                _self.getView().getModel("FilterDatamodel").refresh();
                _self.pnrNumDialog.open();

            },
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
              readInvoicesFromAmendment: function(oEvent){

               
                var filterval = {

                };

                filterval.isAmended = "false";
                // sap.ui.getCore().byId("fbinp-invoiceNumber").setValue("");
                // sap.ui.getCore().byId("fbinp-pnr").setValue("");

              

                this.SendRequest(this, "/portal-api/portal/v1/get-invoices-from-amendment", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {

                    debugger;
                    sap.ui.core.BusyIndicator.hide();
                    var oModelData = new sap.ui.model.json.JSONModel([]);
                    // filterJson = {
                            
                    // };
                    if(data.filters){
                    this.filterJson = data.filters;
                    oModelData.setData(this.filterJson);
                    this.getView().setModel(oModelData, "FilterDatamodel");
                    this.getView().byId("fbmc-GSTIN").setSelectedKeys(this.filterJson.defaultGSTIN);
                    if(this.ISB2A_flag){
                        _self.getView().byId("fbinp-iataNumber").setValue(data.filters.iataNumber[0]);
                        }
                        _self.getView().byId("title").setText("Documents ("+data.invoices.length+")");
                    }
                   
                    // _self.getView().byId("count").setText("Total Invoices: " + data.invoices.length);

                    this.oModel = new sap.ui.model.json.JSONModel([]);

                    this.oModel.setData(data);
                  

                    this.getView().setModel(this.oModel, "GSTDetailsModel");
                   
                    // this.byId("tbl_amendment").setVisible(true);
                   

                });

            },
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
           
            _routeMatched: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                const jwt = sessionStorage.getItem("jwt")
                var decodedData;
                if (jwt) {
                    decodedData = JSON.parse(atob(jwt.split('.')[1]));
                    // if(decodedData.ISB2A == true){
                    //     this.getView().byId("fbinp-iataNumber").setEnabled(false);
                    // }


                }
                this.getView().byId("fbinp-invoiceNumber").setValue("");
                this.getView().byId("fbinp-pnr").setValue("");
                this.getView().byId("fbinp-iataNumber").setValue("");

                //  this.byId("tbl_amendment").setVisible(false);
                this.readInvoicesFromAmendment();
             
                // this.SendRequest(this, "/portal-api/portal/v1/get-invoices-from-amendment?isAmended="+false+"&pnr=123459", "GET", {}, null, (_self, data, message) => {
                //     debugger;

                //     this.oModel = new sap.ui.model.json.JSONModel([]);

                // this.oModel.setData(data);

                // this.getView().setModel(this.oModel, "GSTDetailsModel");

                // });
                
                this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", "Welcome, " + decodedData.FirstName + ' ' + decodedData.LastName);
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "Amendment Request");
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", true);
                this.ISB2A_flag= false;
                if(decodedData.ISB2A == true){
                    
                    this.byId("fbinp-iataNumber").setEnabled(false);
                    this.ISB2A_flag = true;
                }else{
                    this.ISB2A_flag= false;
                    this.byId("fbinp-iataNumber").setEnabled(true);
                }
                // this.SendRequest(this, "/admin-api/master/StateCodes", "GET", {}, null, (_self, data, message) => {
                //     _self.invoiceModel.setData(data);
                // });
                // this._getAirportCodes();
                // this.Fetch_GSTDetails();
            },
            Fetch_GSTDetails: function () {
                this.defaultGSTN_num = ["05KHGPG2501F1ZK"];

              
                // this.GSTDetails.results = oJSONData.data.filter(a => a.orginalGstin == selectedGSTN_num);
              
                this.GSTDetails.results = oJSONData.data;
        //         this.oModel = new sap.ui.model.json.JSONModel([]);
        //         this.oModel.setData(this.GSTDetails);
        //       this.getView().setModel(this.oModel, "GSTDetailsModel");
                this.unique_GSTN(this.GSTDetails);
              

            },
            onPressExportExcel: function(){

                var filterval = {

                };

                filterval.isAmended = "false";

                filterval.generateExcel = true;

                // filterval.status = "approved"

            //    filterval.status = "approved";

                this.SendRequest(this, "/portal-api/portal/v1/get-invoices-from-amendment", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {

                    const getExcelData = data.excel;

                    const base64Data = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + getExcelData

                    const link = document.createElement('a');

                            link.href = base64Data;

                            link.download = "title";

                            link.click();

                });

            //     const link = document.createElement('a');

            //                 link.href = base64Data;

            //                 link.download = "title";

            //                 link.click();

            },
            onSearch: function () {
                this.getView().byId("tbl_amendment").clearSelection();
                if (!this.getView().byId("filterbar").isDialogOpen()) {
                    sap.ui.core.BusyIndicator.show();

                    var filter = new Array();
                    var filterval = {};
                    filterval.isAmended = "false";
                    // this._OpenBusyDialog("");
                    var _self = this;
                    // this.filtered_GSTDetails.results = this.GSTDetails.results.filter(function (item) {
                    //     return _self.selectedGSTN_array.includes(item.orginalGstin);
                    // });
                    if (this.getView().byId("fbinp-invoiceNumber").getValue()) {
                        var fieldName = "invoiceNumber";
                        filterval[fieldName] = this.getView().byId("fbinp-invoiceNumber").getValue();
                    }
                    if (this.getView().byId("fbinp-pnr").getValue()) {
                        var fieldName = "pnr";
                        filterval[fieldName] = this.getView().byId("fbinp-pnr").getValue();
                    }
                    if (this.getView().byId("fbmc-GSTINAI").getSelectedKeys() != "") {
                        var fieldName = "supplierGSTIN";
                        filterval[fieldName] = this.getView().byId("fbmc-GSTINAI").getSelectedKeys();
                    }
                    if (this.getView().byId("fbmc-GSTIN").getSelectedKeys() != "") {
                        var fieldName = "passengerGSTIN";
                        filterval[fieldName] = this.getView().byId("fbmc-GSTIN").getSelectedKeys();
                    }
                    if (this.getView().byId("fbinp-iataNumber").getValue()) {
                        var fieldName = "iataNumber";
                        filterval.iataNumber = this.getView().byId("fbinp-iataNumber").getValue();
                        var iata_num= filterval.iataNumber;
                    }
                    if (this.getView().byId("fbinp-ticketNumber").getValue()) {
                        var fieldName = "ticketNumber";
                        filterval.ticketNumber = this.getView().byId("fbinp-ticketNumber").getValue();
                        var tkt_num= filterval.ticketNumber;
                    }
                    if(this.getView().byId("fbdat-invoiceDate").getValue()){
                        var daterange = this.getView().byId("fbdat-invoiceDate").getValue().split("to");
                        filterval.from = daterange[0].trim();
                        filterval.to = daterange[1].trim();
                    }
                    if(this.getView().byId("fbdat-financialYear").getValue()){
                        // filterval.financialYear = this.getView().byId("fbdat-financialYear").getValue();
                        filterval.financialYear = this.getView().byId("fbdat-financialYear")._sPreviousValue;
                        
                    }
                    if(this.getView().byId("fbdat-ticketIssueDate").getValue()){
                        var daterange = this.getView().byId("fbdat-ticketIssueDate").getValue().split("to");
                        filterval.ticketIssuefrom = daterange[0].trim();
                        filterval.ticketIssueto = daterange[1].trim();
                    }
                 
                    this.SendRequest(this, "/portal-api/portal/v1/get-invoices-from-amendment", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {

                        debugger;
                        sap.ui.core.BusyIndicator.hide();
                        _self.getView().byId("title").setText("Documents ("+data.invoices.length+")");
                        // filterJson = {
                            
                        // };
                        // filterJson = _self.GSTDetails.filters;
                        // oModelData.setData(filterJson);
                        // this.getView().setModel(oModelData, "FilterDatamodel");
    
                        this.oModel = new sap.ui.model.json.JSONModel([]);
    
                        this.oModel.setData(data);
    
                        _self.getView().setModel(this.oModel, "GSTDetailsModel");
                      
    
                    });

                    // this.readInvoicesFromAmendment();
                 //*****************************************
                    //                  this.filtered_GSTDetails.results = this.filtered_GSTDetails.results.filter(function (item) {
                    //     // Initialize a flag to check if all filter conditions are met
                    //     var allConditionsMet = true;

                    //     // Iterate through each filter condition
                    //     for (var prop in filterval) {
                    //         if (filterval.hasOwnProperty(prop)) {
                    //             // Check if the property exists and the value matches
                    //             if (item[prop] !== filterval[prop]) {
                    //                 allConditionsMet = false;
                    //                 break; // No need to check further, one condition not met
                    //             }
                    //         }
                    //     }

                    //     // Return true if all conditions are met, otherwise false
                    //     return allConditionsMet;
                    // });
                   
                    // _self.getView().getModel("GSTDetailsModel").setData(_self.filtered_GSTDetails);
                    // _self.getView().getModel("GSTDetailsModel").refresh();

                    // // }     
                     //*******************************************************                    

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
            
            handleValueHelpinvoiceNum: function (oEvent) {
                var _self = this;
                
                this.inputId = oEvent.getSource().getId();
                if (!this.invNumberDialog) {
                    this.invNumberDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.invoiceNumberFIlterDialog", this);
                }
                this.getView().addDependent(this.invNumberDialog);
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.invNumberDialog);
                _self.getView().getModel("FilterDatamodel").refresh();
                _self.invNumberDialog.open();

            },
            // onSelectionChange: function (oEvent) {
            //     debugger;
            // this.invNum = oEvent.mParameters.rowContext.getObject().invoiceNumber;
            //  this.Gstin = oEvent.mParameters.rowContext.getObject().orginalGstin;

            // },

            handleValueHelpAmendment: function (oEvent) {
                var _self = this;
              
                var row = this.getView().byId("tbl_amendment").mProperties.selectedIndex;
                if (row !== -1){
                    sap.ui.core.BusyIndicator.show();

                var filterJson;
                this.inputId = oEvent.getSource().getId();
                if (!this.amendmentDialog) {
                    this.amendmentDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.amendmentRequestDialog", this);
                }
                this.getView().addDependent(this.amendmentDialog);
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.amendmentDialog);
             
                var invNum = this.getView().byId("tbl_amendment").getBinding().oList[row].INVOICENUMBER;
                var gstin = this.getView().byId("tbl_amendment").getBinding().oList[row].PASSENGERGSTIN;
                sap.ui.getCore().byId("inp-invnum").setText(invNum);
                sap.ui.getCore().byId("inp-gstin").setText(gstin);
                // sap.ui.getCore().byId("inp-address").setValue(gstin);
                // this.extractPANFromGSTIN(gstin);
                var pan = gstin.substring(2, 12);
                // this.SendRequest(this, "/portal-api/portal/v1/pan-gstin?PAN=" + pan, "GET", {}, null, (_self, data, message) => {    
                   debugger;
                   var newarr = [];
                  
                
                   var newArray = this.filterJson.passengerGSTIN.filter(item => item !== gstin);
                    _self.getView().getModel("filterGstinModel").setData(newArray);
                    _self.amendmentDialog.open();
                    sap.ui.core.BusyIndicator.hide();
                    _self.getView().getModel("FilterDatamodel").refresh();
                  

                // });
                // this.requestDetails.results = data.results;
                // this.requestModel.setData(this.requestDetails);
                // this.getView().setModel(this.requestModel, "RequestModel");
              
               
                // var oModel1 = new sap.ui.model.json.JSONModel({
                //     GSTDetailsModel1: this.GSTDetails.results
                // });
                // this.getView().setModel(oModel1);
                
             
               
            }
            else{
                MessageBox.error("Please select an invoice!")
            }

            },
            actionchange: function(oEvent){
                var combo = oEvent.oSource.mProperties.selectedKey;
                if (combo ==="RG"){
                    sap.ui.getCore().byId("inp-address").setVisible(true);
                    sap.ui.getCore().byId("inp-newgstin").setVisible(false);

                }
                if (combo ==="CG"){
                    sap.ui.getCore().byId("inp-address").setVisible(false);
                    sap.ui.getCore().byId("inp-newgstin").setVisible(true);

                }
            },
            onAmendmentRequest : function (oEvent) {
                if (this._handleInputValidation()) {
                    sap.ui.core.BusyIndicator.show();
                    var action = sap.ui.getCore().byId("combo-act").getSelectedKey();
                    if (action == "CG") {
                        var invnum = sap.ui.getCore().byId("inp-invnum").getText();
                        var oldgstin = sap.ui.getCore().byId("inp-gstin").getText(); 
                        var newgstin = sap.ui.getCore().byId("inp-newgstin").getSelectedKey();
                        if(newgstin === oldgstin){
                            MessageBox.error("New GSTIN and existing GSTIN are same!")
                            sap.ui.core.BusyIndicator.hide();
                            return false;

                        }
                        else{
                        const reqData = {
                            gstin: newgstin,
                            invoiceNumber: invnum
                                  }
                         this.SendRequest(this, "/portal-api/portal/v1/make-gstin-amendment", "POST", { }, JSON.stringify({ ...reqData }), (_self, data, message) => {
                                  debugger;
                                  _self.getView().byId("tbl_amendment").clearSelection();
                                //   sap.ui.core.BusyIndicator.hide();
                                if(data){
                                  if(data.status === "SUCCESS"){
                                  MessageBox.success(message.Text);
                                  _self.onCloseAmendmet();
                                  
                                }
                                else{
                                    MessageBox.error(message.Text);
                                    _self.onCloseAmendmet();
                                    
                                }
                                this.readInvoicesFromAmendment();
                            }
                            else{

                                MessageBox.error(message.Text);
                                _self.onCloseAmendmet();
                                   sap.ui.core.BusyIndicator.hide();
                                   
                            }
                         });
                        }
                      } else {
                        const reqData = {
                                  address: sap.ui.getCore().byId("inp-address").getValue(),
                                  invoiceNumber: sap.ui.getCore().byId("inp-invnum").getText()
                                  }
                         this.SendRequest(this, "/portal-api/portal/v1/make-address-amendment", "POST", { }, JSON.stringify({ ...reqData }), (_self, data, message) => {
                                  debugger;
                                  sap.ui.core.BusyIndicator.hide();
                                  if(data.status === "SUCCESS"){
                                  MessageBox.success(message.Text);
                                  _self.onCloseAmendmet();
                                  this.onSearch();
                                }
                                else{
                                    MessageBox.error(message.Text);
                                    _self.onCloseAmendmet();
                                    this.onSearch();
                                }

                         });
                      }

                    // const newairportCodeData = this.newAirportCodeListModel.getData();
                    // sap.ui.core.BusyIndicator.show();
                    // this.SendRequest(this, "/admin-api/master/AirportCodes", "POST", {}, JSON.stringify(newairportCodeData), (_self, data, message) => {
                    //     _self._getAirportCodes();
                    //     MessageToast.show("Airport Code Created");
                    // });

                }
            },
            _handleInputValidation: function () {
                var validate = true;
                var combo = sap.ui.getCore().byId("combo-act").getSelectedKey();
                var id;
                if(combo === "RG"){
                     id =  sap.ui.getCore().byId("inp-address");  
                     if (id.getValue()) {
                        id.setValueState("None").setValueStateText("");
                    } else {
                        id.setValueState("Error").setValueStateText("Address is Mandatory");
                        validate = false;
                    }
                }
                else{
                    id =  sap.ui.getCore().byId("inp-newgstin");  
                    if (id.getSelectedKey()) {
                        id.setValueState("None").setValueStateText("");
                    } else {
                        id.setValueState("Error").setValueStateText("GSTIN is Mandatory");
                        validate = false;
                    }
                }

              
              
    
                return validate;
            },
            onCloseAmendmet: function () {
                sap.ui.getCore().byId("inp-address").setValue("");
                sap.ui.getCore().byId("inp-newgstin").setSelectedItem(null);

                this.amendmentDialog.close();
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
            handleValueHelpSearchPNR: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },
            // handleValueHelpSearchinvoiceNum: function (oEvent) {
            //     debugger;
            //     var sValue = oEvent.getParameter("value");
            //     var oFilter = new sap.ui.model.Filter(
            //         "invoiceNumber",
            //         sap.ui.model.FilterOperator.Contains, sValue
            //     );
            //     oEvent.getSource().getBinding("items").filter([oFilter]);
            // },
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
                        new sap.ui.model.Filter("ticketNumber", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },
            createColumnConfig: function () {
                return [
                    {
                        label: 'Invoice Number',
                        property: 'invoiceNumber',
                        type: EdmType.String
                    },
                    {
                        label: 'Invoice Date',
                        property: 'invoiceDate',
                        type: EdmType.String
                    },
                    {
                        label: 'Date of Issuance',
                        property: 'dateOfIssuance',
                        type: EdmType.StringString
                    },
                    {
                        label: 'GST Number',
                        property: 'orginalGstin',
                        type: EdmType.String
                    },
                    {
                        label: 'Type',
                        property: 'Type',
                        type: EdmType.String
                    },
                    {
                        label: 'City POS',
                        property: 'cityPOS',
                        type: EdmType.String
                    },
                    {
                        label: 'Travel Date',
                        property: 'TravelDate',
                        type: EdmType.String
                    },
                    {
                        label: 'Ticket Number',
                        property: 'ticketNumber',
                        type: EdmType.String
                    },
                    {
                        label: 'Ticket Issue Date',
                        property: 'ticketIssueDate',
                        type: EdmType.String
                    },
                    {
                        label: 'IATA Number',
                        property: 'iataNumber',
                        type: EdmType.String
                    }
                ];
            },
            // onPressExportExcel: function () {
            //     var aCols, oBinding, oSettings, oSheet, oTable;

            //     oTable = this.byId('tbl_gstInvoices');
            //     oBinding = oTable.getBinding('rows');
            //     aCols = this.createColumnConfig();

            //     oSettings = {
            //         workbook: { columns: aCols },
            //         dataSource: oBinding
            //     };

            //     oSheet = new Spreadsheet(oSettings);
            //     oSheet.build()
            //         .then(function () {
            //         }).finally(function () {
            //             oSheet.destroy();
            //         });
            // },
            onButtonDownloadPress: function () {

            }
        });
    }
);