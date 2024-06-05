sap.ui.define(
    [
        'sap/ui/core/mvc/Controller',
        "airindiagst/model/formatter",
        "sap/m/MessageBox",
        'sap/m/Dialog',
        'sap/m/Button',
        'sap/m/Input',
        'sap/m/MessageToast',
        'sap/suite/ui/commons/ProcessFlowLaneHeader',
        "sap/ui/model/json/JSONModel",
    ],
    function (Controller,formatter,MessageBox, Dialog, Button, Input, MessageToast, ProcessFlowLaneHeader, JSONModel) {
        'use strict';
        return Controller.extend("airindiagst.controller.auditLog", {
            formatter: formatter,
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("auditLog").attachPatternMatched(this._routeMatched, this);

                this.SendRequest = this.getOwnerComponent().SendRequest;
                this.cardManifests = new JSONModel();
                this.getView().setModel(this.cardManifests, "processFlow");
                this.jwt = sessionStorage.getItem("jwt")
                if (!this.jwt) {
                    window.location.replace('/portal/index.html');
                }
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                const dummyAuditLog = [
                    {
                        event: "Create",
                        title: "User Created",
                        oldValue: "OldContact : 9446074859",
                        newValue: "NewContact : 8485967584",
                        labelLane: "2023-09-24"
                    },
                    {
                        event: "Update",
                        title: "Profile Updated",
                        oldValue: "",
                        newValue: "",
                        labelLane: "2023-09-25"
                    },
                    {
                        event: "Delete",
                        title: "Item Deleted",
                        oldValue: "",
                        newValue: "",
                        labelLane: "2023-09-26"
                    },
                    {
                        event: "Create",
                        title: "Item Added",
                        oldValue: "",
                        newValue: "",
                        labelLane: "2023-09-27"
                    },
                    {
                        event: "Update",
                        title: "Phone Number Changed",
                        oldValue: "9446074859",
                        newValue: "8485967584",
                        labelLane: "2023-09-28"
                    },
                    {
                        event: "Update",
                        title: "Address Changed",
                        oldValue: "BS567,kazhakuttam",
                        newValue: "BS567,Eranakulam",
                        labelLane: "2023-09-29"
                    },
                    {
                        event: "Create",
                        title: "Amendment Request",
                        oldValue: "",
                        newValue: "",
                        labelLane: "2023-09-30"
                    },
                ];
            },
            restore: function () {
                var oFilterBar = this.byId("filterbar");
                oFilterBar.getAllFilterItems().forEach(function (oFilterItem) {
                    oFilterItem.setVisibleInFilterBar(true);
                });
            },
            handleValueHelpModuleID: function (oEvent) {
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.moduleIdDialog) {
                    this.moduleIdDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.auditLogModuleID", this);
                    this.getView().addDependent(this.moduleIdDialog);
                }
                var oList = this.moduleIdDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }

                var selKeys = [];
                const prevSelected = this.byId("Audit-moduleID").getTokens();
                prevSelected.forEach(element => {
                    selKeys.push(element.getText())
                });

                oList = this.moduleIdDialog._aSelectedItems;
                this.moduleIdDialog.open();
            },
            onScroll: function (oEvent) {

                var totalPages = Math.ceil(this.GSTDetails.totalcount / 50);
                if (this.loopfilters.pageNumber <= totalPages) {
                    sap.ui.core.BusyIndicator.show();
                    this.loopfilters.pageNumber = this.loopfilters.pageNumber + 1;
                    this.SendRequest(this, "/portal-api/portal/v1/get-audit-log", "POST", {}, JSON.stringify(this.loopfilters), (_self, data, message) => {
                        if(data !== null){
                        var _self = this;
                        if (data.auditlog.length > 0) {
                            _self.GSTDetails.auditlog = [..._self.GSTDetails.auditlog, ...data.auditlog];
                            _self.getView().byId("title").setText("System Log(1 - " + _self.GSTDetails.auditlog.length + " of " + _self.GSTDetails.totalcount + ")");
                            _self.getView().getModel("AuditLogModel").refresh();
                        }
                        sap.ui.core.BusyIndicator.hide();
                    }
                    sap.ui.core.BusyIndicator.hide();
                    });
                }


            },
            handleValueHelpCloseModuleID: function (oEvent) {
                var token = [];
                this.aContexts = oEvent.getParameter("selectedContexts");
                if (this.aContexts && this.aContexts.length) {
                    this.aContexts.map(function (oContext) {
                        token.push(oContext.getObject().key);
                        return oContext.getObject().key;
                    }).join(", ");
                }
                this.byId("Audit-moduleID").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedItems"),
                    oInput = this.byId("Audit-moduleID");
                var aTitle = [];
                this.oListPlant = this.moduleIdDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getTitle();
                    aTitle.push(text);
                }
                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("Audit-moduleID").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                const sId = this.byId("Audit-moduleID");

                sId.getAggregation("tokenizer").setEditable(false);
            },
            handleValueHelpSearchModuleID: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },
            handleValueHelpEventID: function (oEvent) {
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.eventIdDialog) {
                    this.eventIdDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.auditLogEventID", this);
                    this.getView().addDependent(this.eventIdDialog);
                }
                var oList = this.eventIdDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }

                var selKeys = [];
                const prevSelected = this.byId("Audit-EventID").getTokens();
                prevSelected.forEach(element => {
                    selKeys.push(element.getText())
                });

                oList = this.eventIdDialog._aSelectedItems;
                this.eventIdDialog.open();
            },
            handleValueHelpCloseEventID: function (oEvent) {
                var token = [];
                this.aContexts = oEvent.getParameter("selectedContexts");
                if (this.aContexts && this.aContexts.length) {
                    this.aContexts.map(function (oContext) {
                        token.push(oContext.getObject().key);
                        return oContext.getObject().key;
                    }).join(", ");
                }
                this.byId("Audit-EventID").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedItems"),
                    oInput = this.byId("Audit-EventID");
                var aTitle = [];
                this.oListPlant = this.eventIdDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getTitle();
                    aTitle.push(text);
                }
                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("Audit-EventID").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                const sId = this.byId("Audit-EventID");

                sId.getAggregation("tokenizer").setEditable(false);
            },
            handleValueHelpSearchEventID: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },
            handleValueHelpUserID: function (oEvent) {
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.userIdDialog) {
                    this.userIdDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.auditLogUserID", this);
                    this.getView().addDependent(this.userIdDialog);
                }
                var oList = this.userIdDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }

                var selKeys = [];
                const prevSelected = this.byId("Audit-UserID").getTokens();
                prevSelected.forEach(element => {
                    selKeys.push(element.getText())
                });

                oList = this.userIdDialog._aSelectedItems;
                this.userIdDialog.open();
            },
            handleValueHelpCloseUserID: function (oEvent) {
                var token = [];
                this.aContexts = oEvent.getParameter("selectedContexts");
                if (this.aContexts && this.aContexts.length) {
                    this.aContexts.map(function (oContext) {
                        token.push(oContext.getObject().key);
                        return oContext.getObject().key;
                    }).join(", ");
                }
                this.byId("Audit-UserID").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedItems"),
                    oInput = this.byId("Audit-UserID");
                var aTitle = [];
                this.oListPlant = this.userIdDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getTitle();
                    aTitle.push(text);
                }
                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("Audit-UserID").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                const sId = this.byId("Audit-UserID");

                sId.getAggregation("tokenizer").setEditable(false);
            },
            handleValueHelpSearchUserID: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
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
            _routeMatched: function (oEvent) {

                const jwt = sessionStorage.getItem("jwt")
                var decodedData;
                if (jwt) {
                    decodedData = JSON.parse(atob(jwt.split('.')[1]));
                }

                var decodedData;
                this.byId("Audit-EventID").removeAllTokens();
                this.byId("Audit-moduleID").removeAllTokens();
                this.byId("Audit-UserID").removeAllTokens();
                this.getView().byId("periodDateFilter").setValue("");
                    this.getView().byId("moduleIDFilter").setVisible(true);
                    this.getView().byId("eventIDFilter").setVisible(true);
                    this.getView().byId("userIdFilter").setVisible(true);
                    this.getView().byId("periodFilter").setVisible(true);
                    this.getView().byId("invoiceNumberFilter").setVisible(false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", "" + decodedData.FirstName + ' ' + decodedData.LastName);
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "Audit Trail");
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/hinticon", true);
                var oComboBox = this.getView().byId("comboBoxTypeSelect");
                var sDefaultValue = "A";
                oComboBox.setSelectedKey(sDefaultValue);
                this.Fetch_GSTDetails();
                this.initialLoadingDataFetch();
            },
            Fetch_GSTDetails: function () {
                this.SendRequest(this, "/portal-api/portal/v1/get-invoice-number", "GET", {}, null, (_self, data, message) => {
                    this.invModel = new sap.ui.model.json.JSONModel([]);
                    this.invModel.setData(data);
                    this.getView().setModel(this.invModel, "FilterDatamodel");
                });
            },
            handleValueHelpinvoiceNum: function (oEvent) {
                var _self = this;
                this.inputId = oEvent.getSource().getId();
                if (!this.invNumberAuditDialog) {
                    this.invNumberAuditDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.invoiceNumAuditTrail", this);                   
                }
                this.getView().addDependent(this.invNumberAuditDialog);
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.invNumberAuditDialog);
                _self.getView().getModel("FilterDatamodel").refresh();
                _self.invNumberAuditDialog.open();

            },
            searchInvoiceNumber: function (oEvent) {
                var sValue = oEvent.getParameter("value").trim();
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("INVOICENUMBER", sap.ui.model.FilterOperator.Contains, sValue)
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },
            selectInvoiceNumber: function (oEvent) {
                if (oEvent.getParameter("selectedItem")) {
                    var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
                    if (oSelectedItem) {
                        var reqNoInputFrom = sap.ui.getCore().byId(this.inputId);
                        reqNoInputFrom.setValue(oSelectedItem);
                    }
                    oEvent.getSource().getBinding("items").filter([]);
                }
            },
            changeSegment: function (oEvent) {
                this.getView().byId("Audit-InvNo").setValue("");
                this.getSelectedSegment = oEvent.mParameters.value;
                if (this.getSelectedSegment == "System") {
                    this.initialLoadingDataFetch();
                    this.getView().byId("moduleIDFilter").setVisible(true);
                    this.getView().byId("eventIDFilter").setVisible(true);
                    this.getView().byId("userIdFilter").setVisible(true);
                    this.getView().byId("periodFilter").setVisible(true);
                    this.getView().byId("invoiceNumberFilter").setVisible(false);
                    this.getView().byId("auditLogFlexBox").setVisible(false);
                    this.getView().byId("tbl_auditLog").setVisible(true);
                }
                if (this.getSelectedSegment == "Invoices") {
                this.byId("Audit-EventID").removeAllTokens();
                this.byId("Audit-moduleID").removeAllTokens();
                this.byId("Audit-UserID").removeAllTokens();
                this.getView().byId("periodDateFilter").setValue("");
                    this.getView().byId("moduleIDFilter").setVisible(false);
                    this.getView().byId("eventIDFilter").setVisible(false);
                    this.getView().byId("userIdFilter").setVisible(false);
                    this.getView().byId("periodFilter").setVisible(false);
                    this.getView().byId("invoiceNumberFilter").setVisible(true);
                    this.getView().byId("auditLogFlexBox").setVisible(false);
                    this.getView().byId("tbl_auditLog").setVisible(false);
                    this.inputId = oEvent.getSource().getId();
                }
            },
            auditLogInvoiceConfirm: function () {
                var getAuditInvValue = this.getView().byId("Audit-InvNo").getValue();
                var filterval = {};
                    filterval.INVOICENUMBER = getAuditInvValue;
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/portal-api/portal/v1/get-invoice-log?INVOICENUMBER="+ getAuditInvValue, "GET", {}, null, (_self, data, message) => {
                    sap.ui.core.BusyIndicator.hide();
                    this.oModel = new sap.ui.model.json.JSONModel([]);
                    this.oModel.setData(data.invoiceLog);
                                  const nodes = [];
                const lanes = [];

                data.invoiceLog.forEach((logEntry, index, array) => {
                    const isLastNode = index === array.length - 1;
                    const children = isLastNode ? [] : [index + 2];
                    var icon, state;
                    if (logEntry.event == "Create") {
                        icon = "sap-icon://create-entry-time",
                            state = "Planned"
                    } else if (logEntry.event == "Update") {
                        icon = "sap-icon://write-new-document",
                            state = "Positive"
                    } else if (logEntry.event == "Delete") {
                        icon = "sap-icon://delete",
                            state = "Critical"
                    } else {
                        icon = "sap-icon://write-new-document",
                            state = "Neutral"
                    }
                    const node = {
                        id: (index + 1).toString(),
                        lane: index.toString(),
                        title: logEntry.title,
                        titleAbbreviation: "",
                        children: children,
                        state: "Positive",
                        texts: [logEntry.value],
                        
                    };

                    nodes.push(node);

                    const lane = {
                        id: index.toString(),
                        label: logEntry.value,
                        icon: icon,
                        position: index,
                    };

                    lanes.push(lane);
                });

                const processData = {
                    nodes,
                    lanes,
                };
                this.cardManifests.setData(processData);
                this.oProcessFlow = this.getView().byId('processflow');
                this.oProcessFlow.updateModel();
            
                    this.getView().setModel(this.oModel, "AuditLogModel");
                    this.getView().byId("moduleIDFilter").setVisible(false);
                    this.getView().byId("eventIDFilter").setVisible(false);
                    this.getView().byId("userIdFilter").setVisible(false);
                    this.getView().byId("periodFilter").setVisible(false);
                    this.getView().byId("invoiceNumberFilter").setVisible(true);
                    this.getView().byId("auditLogFlexBox").setVisible(true);
                    this.getView().byId("tbl_auditLog").setVisible(false);
                });
               
            },
            onCloseAuditLog: function () {
                    this.getView().byId("moduleIDFilter").setVisible(true);
                    this.getView().byId("eventIDFilter").setVisible(true);
                    this.getView().byId("userIdFilter").setVisible(true);
                    this.getView().byId("periodFilter").setVisible(true);
                    this.getView().byId("invoiceNumberFilter").setVisible(false);
                    this.getView().byId("auditLogFlexBox").setVisible(false);
                    this.getView().byId("tbl_auditLog").setVisible(true);
                    this.getView().byId("comboBoxTypeSelect").setSelectedKey("A");
                this.auditLogDialog.close();
            },
        initialLoadingDataFetch: function () {
                sap.ui.core.BusyIndicator.show();
                var filterval = {};
                filterval.module = [];
                filterval.event = [];
                filterval.user = [];
                filterval.from = "";
                filterval.to = "";
                filterval.pageNumber = 1;
                filterval.pageSize = 50;
                this.loopfilters = {};
                this.loopfilters = filterval
                this.SendRequest(this, "/portal-api/portal/v1/get-audit-log", "POST", {} ,JSON.stringify(filterval), (_self, data, message) => {
                    if(data !== null){
                        var _self = this;
                        _self.GSTDetails = data;
                            _self.getView().byId("title").setText("System Log(" + _self.GSTDetails.auditlog.length + ")");
                    if (data.filters) {
                        this.filterJson = data.filters;
                        var oModelData = new sap.ui.model.json.JSONModel();
                        oModelData.setData(this.filterJson);
                        this.getView().setModel(oModelData, "auditFilterDatamodel");
                    }
                    _self.getView().byId("title").setText("System Log(1 - " + _self.GSTDetails.auditlog.length + " of " + _self.GSTDetails.totalcount + ")");
                    this.oModel = new sap.ui.model.json.JSONModel([]);
                    this.oModel.setData(_self.GSTDetails);
                    this.getView().setModel(this.oModel, "AuditLogModel");
                    
                    this.getView().byId("auditLogFlexBox").setVisible(false);  
                    this.getView().byId("tbl_auditLog").setVisible(true);
                    sap.ui.core.BusyIndicator.hide();
                }else{
                    sap.ui.core.BusyIndicator.hide();
                }
                });
            
                //    }
            },
            onSearch: function () {
                sap.ui.core.BusyIndicator.show();
                if (this.getSelectedSegment == "Invoices") {
                var getAuditInvoiceNumber = this.getView().byId("Audit-InvNo").getValue();
                if(getAuditInvoiceNumber == ""){
                    MessageBox.information("Please select an invoice number to proceed");
                    sap.ui.core.BusyIndicator.hide();
                }else{
                    this.auditLogInvoiceConfirm();
                }          
            }
                else{
                    var filterval = {};
                    if (this.getView().byId("periodDateFilter").getValue()) {
                        if(this.byId("periodDateFilter").isValidValue()){
                         var daterange = this.getView().byId("periodDateFilter").getValue().split("to");
                             var formattedDates = daterange.map(date => {
                                let parts = date.trim().split('/');
                                return `${parts[2]}/${parts[1]}/${parts[0]}`;
                            });
                        filterval.from = formattedDates[0].trim();
                        filterval.to = formattedDates[1].trim();
                            }else{
                                MessageBox.error("Please choose a valid Date");
                                sap.ui.core.BusyIndicator.hide();
                                return false;
                            }
                    }   
                    if (this.getView().byId("Audit-moduleID").getTokens().length > 0) {
                        var moduleTokens = this.getView().byId("Audit-moduleID").getTokens();
                        var ticToken = moduleTokens.map(function (oToken) {
                            return oToken.mProperties.text;
                        }).join(",");
                        var ticarr = ticToken.split(',');
                        filterval.module = ticarr;
                    }
                    if (this.getView().byId("Audit-EventID").getTokens().length > 0) {
                        var eventTokens = this.getView().byId("Audit-EventID").getTokens();
                        var arnToken = eventTokens.map(function (oToken) {
                            return oToken.mProperties.text;
                        }).join(",");
                        var arnArr = arnToken.split(',');

                        filterval.event = arnArr;
                    }
                    if (this.getView().byId("Audit-UserID").getTokens().length > 0) {
                        var userTokens = this.getView().byId("Audit-UserID").getTokens();
                        var buyerToken = userTokens.map(function (oToken) {
                            return oToken.mProperties.text;
                        }).join(",");
                        var buyerarr = buyerToken.split(',');
                        for(var i=0 ; i < this.filterJson.user.length ; i++){
                            for(var j=0 ; j < buyerarr.length ; j++){
                                if(this.filterJson.user[i].USERNAME == buyerarr[j]){
                                    filterval.user = [];
                                            filterval.user.push(this.filterJson.user[i].USERID);
                                }
                            }
                            
                        }
                    }
                    filterval.pageNumber = 1;
                    filterval.pageSize = 50; 
                    this.loopfilters = {};
                    this.loopfilters = filterval              

                this.SendRequest(this, "/portal-api/portal/v1/get-audit-log", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                    if(data !== null){   
                    var _self = this;
                    _self.GSTDetails = data;
                     _self.getView().byId("title").setText("System Log(1 - " + _self.GSTDetails.auditlog.length + " of " + _self.GSTDetails.totalcount + ")");
                    this.oModel = new sap.ui.model.json.JSONModel([]);
                    this.oModel.setData(_self.GSTDetails);
                    this.getView().setModel(this.oModel, "AuditLogModel");
                    
                    this.getView().byId("auditLogFlexBox").setVisible(false);  
                    this.getView().byId("tbl_auditLog").setVisible(true);
                    sap.ui.core.BusyIndicator.hide();
                }else{
                    sap.ui.core.BusyIndicator.hide();
                }
                });
            }
                //    }
            }
        });
    }
);
