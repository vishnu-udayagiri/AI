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
        return Controller.extend("admindashboard.controller.amendments", {
            onAfterRendering: function () {
            },
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("amendments").attachPatternMatched(this._routeMatched, this);
                this.SendRequest = this.getOwnerComponent().SendRequest;

                var filterJson;
                this.GSTDetails = {
                    results: []
                }
                this.filtered_GSTDetails = {
                    results: []
                }
                this.uniqueGSTDetails = {
                    results: []
                }
             //   this.Fetch_GSTDetails();
                // this.handleSelectedGSTIN(); // temporarly for loading data initialy with default gstn
              //  this.onSearch(); // temporarly for loading data initialy with default gstn
                var oModelData = new sap.ui.model.json.JSONModel();
                filterJson = {
                    results: []
                };
                this.getView().setModel(oModelData, "FilterDatamodel");

            },
            onButtonDownloadPress: function () {
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/portal-api/portal/v1/sample-download-pdf", "GET", {}, null , (_self, data, message) => {   
                    var base64Data = data.file;
                   // var base64DataNew = data;
                    console.log(base64Data);

                    const link = document.createElement('a');
 
                            link.href = base64Data;

                            link.download = "Amendments";

                            link.click();
                    

                    sap.ui.core.BusyIndicator.hide();
                });

            },
            readInvoicesFromAmendment: function(oEvent){
                var filterval = {

                };
                var oModelData = new sap.ui.model.json.JSONModel();
                filterval.isAmended = "true";
                filterval.generateExcel = false;
                filterval.status = "approved";
            //    filterval.status = "approved";
                this.SendRequest(this, "/portal-api/portal/v1/get-invoices-from-amendment", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                    debugger;
                    sap.ui.core.BusyIndicator.hide();
                    this.oModel = new sap.ui.model.json.JSONModel([]);
                    this.oModel.setData(data);
                    this.getView().setModel(this.oModel, "GSTDetailsModel");
                    this.getView().byId("title").setText("Amendments ("+data.invoices.length+")");
                    this.getView().byId("fbmc-GSTIN").setSelectedKeys(data.filters.defaultGSTIN);
                    this.getView().byId("fbmc-SupGSTIN").setSelectedKeys(data.filters.supplierGSTIN);
                    if(this.flag == true){
                        this.getView().byId("fbinp-iataNumber").setValue(data.filters.iataNumber[0]);
                    }
                    if(data.filters){

                       var filterJson = data.filters;
    
                        oModelData.setData(filterJson);
    
                        this.getView().setModel(oModelData, "FilterDatamodel");
    
                        }
                });
            },
            _routeMatched: function (oEvent) {
                this.getView().byId("fbinp-invoiceNumber").setValue("");
                this.getView().byId("fbinp-pnr").setValue("");
             //   this.getView().byId("fbinp-iataNumber").setValue("");
                this.getView().byId("fbinp-ARN").setValue("");
                this.getView().byId("fbdat-InvoiceDate").setValue("");
                this.getView().byId("fbdat-InvoiceDateApproved").setValue("");
                sap.ui.core.BusyIndicator.show();
                const jwt = sessionStorage.getItem("jwt")
                var decodedData;
                if (jwt) {
                    decodedData = JSON.parse(atob(jwt.split('.')[1]));
                    //Visibilty of agent field during B2A 
                    if(decodedData.ISB2A == true){
                        this.flag = true;
                        this.getView().byId("fbinp-iataNumber").setEnabled(false);
                    }
                    if(decodedData.ISB2A == false){
                        this.flag = false;
                        this.getView().byId("fbinp-iataNumber").setEnabled(true);
                    }
                }
                this.readInvoicesFromAmendment();
                var decodedData;

                // this.SendRequest(this, "/portal-api/portal/v1/get-invoices-from-amendment?isAmended="+true, "GET", {}, null, (_self, data, message) => {
                //     debugger;
                //     this.oModel = new sap.ui.model.json.JSONModel([]);
                // this.oModel.setData(data);
                // this.getView().setModel(this.oModel, "GSTDetailsModel");
                // });
                this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", "Welcome, " + decodedData.FirstName + ' ' + decodedData.LastName);
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "Amendments");
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", true);
                // this.Fetch_GSTDetails();
            },
            Fetch_GSTDetails: function () {
                this.defaultGSTN_num = ["05KHGPG2501F1ZK"];

                var oJSONData = {
                    data: [
                        {
                            "orginalGstin": "05KHGPG2501F1ZK",
                            "invoiceNumber": "1817220KH01BP1997",
                            "invoiceDate": "2023-07-18",
                            "cityPOS": "Leh",
                            "Destination": "Cochin",
                            "TravelDate": "2023-07-20",
                            "dateOfIssuance": "2023-07-20",
                            "PAN": "KHGPG2501F",
                            "Type": "2",
                            "iataNumber": "BB 07 10 22 666666 2",
                            "ticketNumber": "1817220KH01",
                            "ticketIssueDate": "2023-07-20",
                            "PNR": "PNR12345",
                            "Status": "Approved"
                        },
                        {
                            "orginalGstin": "05KHGPG2501F1ZK",
                            "invoiceNumber": "2718120BP01AA1787",
                            "invoiceDate": "2023-06-20",
                            "cityPOS": "Cochin",
                            "Destination": "Leh",
                            "TravelDate": "2023-08-21",
                            "dateOfIssuance": "2023-07-20",
                            "PAN": "KHGPG2501F",
                            "Type": "2",
                            "iataNumber": "DD 07 10 22 666666 2",
                            "ticketNumber": "1817220KH07",
                            "ticketIssueDate": "2023-07-20",
                            "PNR": "PNR23456",
                            "Status": "Approved"
                        },
                        {
                            "orginalGstin": "06AAACG1376N1ZG",
                            "invoiceNumber": "2718120BP01AA1787",
                            "invoiceDate": "2023-08-21",
                            "cityPOS": "Cochin",
                            "Destination": "Mumbai",
                            "TravelDate": "2023-08-21",
                            "dateOfIssuance": "2023-07-20",
                            "PAN": "AAACG1376N",
                            "Type": "2",
                            "iataNumber": "CC 07 10 22 666666 2",
                            "ticketNumber": "1817220KH02",
                            "ticketIssueDate": "2023-07-20",
                            "PNR": "PNR34567",
                            "Status": "Approved"
                        },
                        {
                            "orginalGstin": "06AAACG1376N1ZG",
                            "invoiceNumber": "2308200TR01PN2208",
                            "invoiceDate": "2023-08-20",
                            "cityPOS": "Trivandrum",
                            "Destination": "Pune",
                            "TravelDate": "2023-08-22",
                            "dateOfIssuance": "2023-07-20",
                            "PAN": "AAACG1376N",
                            "Type": "2",
                            "iataNumber": "JJ 07 10 22 666666 2",
                            "ticketNumber": "1817220KH03",
                            "ticketIssueDate": "2023-07-20",
                            "PNR": "PNR45678",
                            "Status": "Approved"
                        },
                        {
                            "orginalGstin": "06AAACG1376N1ZG",
                            "invoiceNumber": "2308230DL01TR2508",
                            "invoiceDate": "2023-08-23",
                            "cityPOS": "Delhi",
                            "Destination": "Trivandrum",
                            "TravelDate": "2023-08-25",
                            "dateOfIssuance": "2023-07-20",
                            "PAN": "AAACG1376N",
                            "Type": "1",
                            "iataNumber": "AA 08 15 25 999999 3",
                            "ticketNumber": "1817220KH04",
                            "ticketIssueDate": "2023-07-20",
                            "PNR": "PNR56789",
                            "Status": "Approved"
                        }
                    ]

                };
                // this.GSTDetails.results = oJSONData.data.filter(a => a.orginalGstin == selectedGSTN_num);
            //     this.GSTDetails.results = oJSONData.data;
            //     this.oModel = new sap.ui.model.json.JSONModel([]);
            //  //   this.oModel.setData(this.GSTDetails);
            //     this.getView().setModel(this.oModel, "GSTDetailsModel");
            //     this.unique_GSTN(this.GSTDetails);
                this.getView().byId("fbmc-GSTIN").setSelectedKeys(this.defaultGSTN_num);

            },
            onSearch: function () {
                this.getView().byId("tbl_amendment").clearSelection();
                if (!this.getView().byId("filterbar").isDialogOpen()) {
                    sap.ui.core.BusyIndicator.show();

                this.getView().byId("tbl_amendment").setVisible(true);
                    var filterval = {

                    };
                    filterval.isAmended = "true";
                    filterval.generateExcel = false;
                    filterval.status = "approved";
                    
                    // this._OpenBusyDialog("");
                    var _self = this;
                    this.filtered_GSTDetails.results = this.GSTDetails.results.filter(function (item) {
                        return _self.selectedGSTN_array.includes(item.orginalGstin);
                    });
                    if (this.getView().byId("fbinp-invoiceNumber").getValue()) {
                        var fieldName = "invoiceNumber";
                        filterval[fieldName] = this.getView().byId("fbinp-invoiceNumber").getValue();
                    }
                    if (this.getView().byId("fbmc-GSTIN").getSelectedKeys() != "") {
                        var fieldName = "passengerGSTIN";
                        filterval[fieldName] = this.getView().byId("fbmc-GSTIN").getSelectedKeys();
                    }
                    if (this.getView().byId("fbmc-SupGSTIN").getSelectedKeys() != "") {
                        var fieldName = "supplierGSTIN";
                        filterval[fieldName] = this.getView().byId("fbmc-SupGSTIN").getSelectedKeys();
                    }
                    if (this.getView().byId("fbinp-ARN").getValue()) {
                        var fieldName = "amendmentRequestNo";
                        filterval[fieldName] = this.getView().byId("fbinp-ARN").getValue();
                    }
                    if(this.getView().byId("fbdat-InvoiceDateApproved").getValue()){
                        var daterange = this.getView().byId("fbdat-InvoiceDateApproved").getValue().split("to");
                        filterval.amendmentApprovedOnFrom = daterange[0].trim();
                        filterval.amendmentApprovedOnTo = daterange[1].trim();
                    }
                    if(this.getView().byId("fbdat-InvoiceDate").getValue()){
                        var daterange = this.getView().byId("fbdat-InvoiceDate").getValue().split("to");
                        filterval.amendmentRequestedOnFrom = daterange[0].trim();
                        filterval.amendmentRequestedOnTo = daterange[1].trim();
                    }
                    if (this.getView().byId("fbinp-pnr").getValue()) {
                        var fieldName = "pnr";
                        filterval[fieldName] = this.getView().byId("fbinp-pnr").getValue();
                    }


                    filterval;
                    // if (this.getView().byId("fbmc-GSTIN").getValue()) {
                    //     var fieldName = "ticketNumber";
                    //     filterval[fieldName] = this.getView().byId("fbinp-ticketNumber").getValue();
                    // }
                    //**********************************************************************************************888 */
                    // this.filtered_GSTDetails.results = this.filtered_GSTDetails.results.filter(function (item) {
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
                    //****************************************************************************************************8 */
                    this.SendRequest(this, "/portal-api/portal/v1/get-invoices-from-amendment", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                        debugger;
                        sap.ui.core.BusyIndicator.hide();
                        _self.getView().byId("title").setText("Amendments ("+data.invoices.length+")");
                        this.oModel = new sap.ui.model.json.JSONModel([]);
                        this.oModel.setData(data);
                        this.getView().setModel(this.oModel, "GSTDetailsModel");
                    });
                 //   _self.getView().getModel("GSTDetailsModel").setData(_self.filtered_GSTDetails);
                 //   _self.getView().getModel("GSTDetailsModel").refresh();

                    // }                         

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
            handleSelectedGSTIN  : function () {
                debugger;
                this.selectedGSTN_array = [];
                var selectedGSTN = this.getView().byId("fbmc-GSTIN").getSelectedItems();
                this.selectedGSTN_array = selectedGSTN.map(function (oToken) {
                    return oToken.mProperties.key;
                });
            },
            handleSelectedSupGSTIN  : function () {
                debugger;
                this.selectedSupGSTN_array = [];
                var selectedGSTN = this.getView().byId("fbmc-SupGSTIN").getSelectedItems();
                this.selectedSupGSTN_array = selectedGSTN.map(function (oToken) {
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
            //search help for amendment request number 
            handleValueHelpAmendmentNum: function (oEvent) {
                var _self = this;
                var filterJson;
                this.inputId = oEvent.getSource().getId();
                if (!this.amReqNumberDialog) {
                    this.amReqNumberDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.amendmentRequestNumber", this);
                }
                this.getView().addDependent(this.amReqNumberDialog);
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.amReqNumberDialog);
                _self.getView().getModel("FilterDatamodel").refresh();
                _self.amReqNumberDialog.open();

            },
            handleValueHelpCloseAmReqNum: function (oEvent) {
                var _self = this;
                var oSelectedItem = oEvent.getParameter('selectedItem').getTitle();
                //oEvent.getParameter("selectedContexts");
                if (oSelectedItem) {
                    var filterInvnum = this.getView().byId(this.inputId);
                    filterInvnum.setValue(oSelectedItem);
                }
            },
            handleValueHelpSearchAmReqNum: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },
            //************************************************************************************** */
            //for iata number filter
           handleValueHelpiataNum : function (oEvent) {
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
            },
            //search help for PNR details
            handleValueHelpPNRNum: function (oEvent) {
                var _self = this;
                var filterJson;
                this.inputId = oEvent.getSource().getId();
                if (!this.pnrNumDialog) {
                    this.pnrNumDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.PNRdetails", this);
                }
                this.getView().addDependent(this.pnrNumDialog);
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.pnrNumDialog);
                _self.getView().getModel("FilterDatamodel").refresh();
                _self.pnrNumDialog.open();

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
            //************************************************************************************ */
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
            onPressExportExcel: function(){
                var filterval = {

                };
                filterval.isAmended = "true";
                filterval.generateExcel = true;
                filterval.status = "approved"
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
        });
    }
);