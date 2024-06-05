sap.ui.define(
    ["sap/ui/core/mvc/Controller",
        "sap/m/MessageBox",
        "sap/ui/Device",
        "sap/ui/model/json/JSONModel",
        'sap/ui/export/Spreadsheet',
        "airindiagst/model/validations",
        "airindiagst/model/formatter",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/layout/HorizontalLayout",
        "sap/ui/layout/VerticalLayout",
        "sap/m/Dialog",
        "sap/m/Button",
        "sap/m/Label",
        "sap/m/library",
        "sap/m/Popover",
        "sap/m/MessageToast",
        "sap/m/Text",
        "sap/m/TextArea", 
        "sap/ui/core/Core"
       
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,
        MessageBox,
        Device,
        JSONModel, Spreadsheet, validations, formatter, Filter, FilterOperator, HorizontalLayout, VerticalLayout, Dialog, Button, Label, mobileLibrary, Popover, MessageToast, Text, TextArea, Core) {
        "use strict";
        var DialogType = mobileLibrary.DialogType;
        
        //var EdmType = exportLibrary.EdmType;
        var ButtonType = mobileLibrary.ButtonType,
        PlacementType = mobileLibrary.PlacementType;
        return Controller.extend("airindiagst.controller.userProfile", {
            validations: validations,
            formatter: formatter,
            onAfterRendering: function () {
            },

            onInit: function () {
                this.iataaddflag = true;
                this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                this.SendRequest = this.getOwnerComponent().SendRequest;
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("userProfile").attachPatternMatched(this._routeMatched, this);

                this.attachmentModel = new JSONModel();
                this.getView().setModel(this.attachmentModel, "attachmentModel");

                this.masterDataModel = new JSONModel();
                this.masterDataModel.setSizeLimit(2000);
                this.getView().setModel(this.masterDataModel, "masterDataModel");

                this.regionModel = new JSONModel();
                this.regionModel.setSizeLimit(2000);
                this.getView().setModel(this.regionModel, "regionModel");

                this.companyDetailModel = new JSONModel();
                this.getView().setModel(this.companyDetailModel, "companyDetailModel");

                this.TCSDetailModel = new JSONModel();
                this.getView().setModel(this.TCSDetailModel, "TCSDetailModel");

                this.rolesModel = new JSONModel({});
                this.getView().setModel(this.rolesModel, "rolesModel");

                this.userDetailModel = new JSONModel();
                this.getView().setModel(this.userDetailModel, "userDetailModel");

                this.GSTDetailModel = new JSONModel([]);
                this.getView().setModel(this.GSTDetailModel, "GSTDetailModel");

                this.userApprovalModel = new JSONModel([]);
                this.getView().setModel(this.userApprovalModel, "userApprovalModel");

                this.attachmentModel = new JSONModel([]);
                this.getView().setModel(this.attachmentModel, "attachmentModel");

                this.userModel = new JSONModel([]);
                this.getView().setModel(this.userModel, "userModel");

                this.userRequestModel = new JSONModel([]);
                this.getView().setModel(this.userRequestModel, "userRequestModel");

                this.GSTINPastAddressModel = new JSONModel();
                this.getView().setModel(this.GSTINPastAddressModel, "GSTINPastAddressModel");

                this.GSTINAddressModel = new JSONModel();
                this.getView().setModel(this.GSTINAddressModel, "GSTINAddressModel");

                this.gstinListModel = new JSONModel();
                this.getView().setModel(this.gstinListModel, "gstinListModel");

                this.agentCodeDialogModel = new JSONModel([]);
                this.getView().setModel(this.agentCodeDialogModel, "agentCodeDialogModel");

                this.IATADetailModel = new JSONModel([]);
                this.getView().setModel(this.IATADetailModel, "IATADetailModel");

                this.iataListModel = new JSONModel();
                this.getView().setModel(this.iataListModel, "iataListModel");

                // toggling
                this.configModel = new JSONModel();
                this.getView().setModel(this.configModel);

                this.getView().getModel().setProperty("/toggleEdit", true);
                this.jwt = sessionStorage.getItem("jwt") 
                if (!this.jwt) {
                    window.location.replace('/portal/index.html');
                }
            },
            validateSpecialCharacters: function (oEvent) {
                var _oInput = oEvent.getSource();
                var val = _oInput.getValue();
                val = val.replace(/[!@#$%^&*(),.?":{}|<>]/, '');
                _oInput.setValue(val);
            },
            onLiveValidateForInputTAN: function (oEvent) {
                var _oInput = oEvent.getSource();
                var fileuplod = this.getView().byId("inp-companyTAN");
                var val = _oInput.getValue();
                var specialCharachters = /[&-.!@#$₹%^;,`'~*()?":{}|<>+=_\[\]\/\\]/;
                var flag = specialCharachters.test(val);
                var newVal = '';
                if (flag == true) {
                    for (var i = 0; i < val.length; i++) {
                        if (!specialCharachters.test(val[i])) {
                            newVal += val[i];
                        }
                    }
                    _oInput.setValue(newVal);
                }

                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },
            onLiveValidateForInputCRN: function (oEvent) {
                var _oInput = oEvent.getSource();
                var val = _oInput.getValue();
                var specialCharachters = /[&-.!@#$₹%^;,`'~*()?":{}|<>+=_\[\]\/\\]/;
                var flag = specialCharachters.test(val);
                var newVal = '';
                if (flag == true) {
                    for (var i = 0; i < val.length; i++) {
                        if (!specialCharachters.test(val[i])) {
                            newVal += val[i];
                        }
                    }
                    _oInput.setValue(newVal);
                }

                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },
            onLiveValidateForInputCC: function (oEvent) {     //latest change
                var _oInput = oEvent.getSource();
                var val = _oInput.getValue();
                var specialCharachters = /[!@#$₹%^;`~*()?":{}|<>+=_\[\]\/\\]/;
                var flag = specialCharachters.test(val);
                var newVal = '';
                if (flag == true) {
                    for (var i = 0; i < val.length; i++) {
                        if (!specialCharachters.test(val[i])) {
                            newVal += val[i];
                        }
                    }
                    _oInput.setValue(newVal);
                }

                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },
            onLiveValidateForInputCity: function (oEvent) {
                var _oInput = oEvent.getSource();
             //   var fileuplod = this.getView().byId("inp-city");
                var val = _oInput.getValue();
                var specialCharachters = /[&-.!@#$₹%^;,`'~*()?":{}|<>+=_\[\]\/\\0123456789]/;
                var flag = specialCharachters.test(val);
                var newVal = '';
                if (flag == true) {
                    for (var i = 0; i < val.length; i++) {
                        if (!specialCharachters.test(val[i])) {
                            newVal += val[i];
                        }
                    }
                    _oInput.setValue(newVal);
                }
                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },
            onLiveValidateForInputCityFrag: function (oEvent) {
                var _oInput = oEvent.getSource();
                var val = _oInput.getValue();
                val = val.replace(/[&-.!@#$₹%^;,`'~*()?":{}|<>+=_\[\]\/\\0123456789]/, '');
                _oInput.setValue(val);
                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },
            onLiveValidateForInputRegion: function (oEvent) {
                var _oInput = oEvent.getSource();
                var fileuplod = this.getView().byId("inp-region");
                var val = _oInput.getValue();
                var specialCharachters = /[&-.!@#$₹%^;,`'~*()?":{}|<>+=_\[\]\/\\0123456789]/;
                var flag = specialCharachters.test(val);
                var newVal = '';
                if (flag == true) {
                    for (var i = 0; i < val.length; i++) {
                        if (!specialCharachters.test(val[i])) {
                            newVal += val[i];
                        }
                    }
                    _oInput.setValue(newVal);
                }
                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },
            onLiveValidateForInputfirstName: function (oEvent) {
                var _oInput = oEvent.getSource();
                var fileuplod = this.getView().byId("inp-firstName");
                var val = _oInput.getValue();
                var specialCharachters = /[&-.!@#$₹%^;,`'~*()?":{}|<>+=_\[\]\/\\0123456789]/;
                var flag = specialCharachters.test(val);
                var newVal = '';
                if (flag == true) {
                    for (var i = 0; i < val.length; i++) {
                        if (!specialCharachters.test(val[i])) {
                            newVal += val[i];
                        }
                    }
                    _oInput.setValue(newVal);
                }
                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },
            onLiveValidateForInputLastName: function (oEvent) {
                var _oInput = oEvent.getSource();
                var fileuplod = this.getView().byId("inp-lastName");
                var val = _oInput.getValue();
                var specialCharachters = /[&-.!@#$₹%^;,`'~*()?":{}|<>+=_\[\]\/\\0123456789]/;
                var flag = specialCharachters.test(val);
                var newVal = '';
                if (flag == true) {
                    for (var i = 0; i < val.length; i++) {
                        if (!specialCharachters.test(val[i])) {
                            newVal += val[i];
                        }
                    }
                    _oInput.setValue(newVal);
                }
                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },
            onLiveValidateForInput: function (oEvent) {
                const sValue = oEvent.getParameter("value"),
                    oId = oEvent.getParameter("id");
                if (sValue) {
                    this.byId(oId).setValueState("None");
                }
            },

            _routeMatched: function (oEvent) {
                this.iataaddflag = true;
                var decodedData;
                if (this.jwt) {
                    decodedData = JSON.parse(atob(this.jwt.split('.')[1]));
                    this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", "Welcome, " + decodedData.FirstName + ' ' + decodedData.LastName);    
                }
                this.category = decodedData.category;
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "Profile");
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/hinticon", false);
                
                this.companyProfileModel = new JSONModel();

                /** Make MultiInput as Non editable */
                const sId = this.byId("inp-iataCode");
                sId.setEditable(false);
                //sId.getAggregation("tokenizer").setEditable(false)
                //this.byId("inp-region").setEditable(false);
                sap.ui.core.BusyIndicator.show();
                this.byId("_IDGenLabel51").setText("Add GSTIN / UIN");
                this.byId("_IDGenColumn29").setTooltip("Add GSTIN / UIN");
                   
                if(this.category == "08"){
                    this.byId("_IDGenOverflowToolbar1").setVisible(false);
                    this.byId("idGSTDetailsTable").setRowActionCount(0);
                    this.byId("ttl-IATADetails").setVisible(false);
                    this.byId("obj-page1").setTitle("Consulate / Embassy Details");
                    this.byId("lbl-companyName").setText("Consulate / Embassy Name");
                    this.byId("lbl-consltCountry").setVisible(true);
                    this.byId("sel-consltCountry").setVisible(true);
                    this.byId("ttl-GSTINDetails").setVisible(true);
                    this.byId("ttl-IATADetails").setVisible(false);
                    this.byId("inp-iataCode").setVisible(false);
                    this.byId("inp-companyName").setVisible(true);
                    this.byId("inp-CompRegNo").setVisible(false);
                    this.byId("lbl-CompRegNo").setVisible(false);
                    this.byId("lbl-companyPAN").setVisible(false);
                    this.byId("inp-companyPAN").setVisible(false);
                    this.byId("lbl-companyTAN").setVisible(false);
                    this.byId("inp-companyTAN").setVisible(false);
                    this.byId("inp-website").setVisible(true);
                    this.byId("inp-companyPhone").setVisible(true);
                    this.byId("lbl-companyPhone").setRequired(true);
                    this.byId("_IDGenLabel10").setRequired(true);
                    this.byId("_IDGenLabel11").setRequired(true);
                    this.byId("_IDGenLabel13").setRequired(true);
                    this.byId("_IDGenLabel14").setRequired(true);
                    this.byId("sel-state").setRequired(true);
                     this.byId("inp-address").setVisible(true);
                    this.byId("sel-country").setVisible(true);
                    this.byId("sel-state").setVisible(true);
                    this.byId("inp-region").setVisible(false);
                    this.byId("lbl-region").setVisible(false);
                    this.byId("inp-city").setVisible(true);
                    this.byId("inp-pinCode").setVisible(true);
                    this.byId("inp-pinCode").setMaxLength(6);          
                    this.byId("cb-ecomOperator").setVisible(false);
                    this.byId("ttl-Attachments").setVisible(false);
                    this.byId("_IDGenColumn9").setVisible(false);
                    this.byId("_IDGenColumn4").setVisible(false);
                    this.byId("_IDGenColumn2").setVisible(false);
                    this.byId("_IDGenColumn5").setVisible(false);
                    this.byId("_IDGenColumn6").setVisible(false);
                    this.byId("_IDGenColumn8").setVisible(false);
                    this.byId("_IDGenColumn28").setVisible(false);
                    this.byId("_IDGenColumn29").setVisible(false);
                    this.byId("_IDGenColumn9").setVisible(false);
                    this.byId("_IDGenFileUploader1").setVisible(false);
                    this.byId("_IDGenButton3").setVisible(false);
                    this.byId("_IDGenButton4").setVisible(false);
                    this.byId("ttl-GSTINDetails").setTitle("UIN Details");
                    this.byId("_IDGenLabel23").setText("UIN");
                }else if(this.category == "05"){
                    this.byId("ttl-GSTINDetails").setTitle("UIN Details");
                    this.byId("_IDGenLabel23").setText("UIN");
                    this.byId("obj-page1").setTitle("UN Body Details");
                    this.byId("lbl-companyName").setText("UN Body Name");                   
                    this.byId("idGSTDetailsTable").setRowActionCount(0);
                    this.byId("_IDGenOverflowToolbar1").setVisible(false);
                    this.byId("lbl-consltCountry").setVisible(false);
                    this.byId("sel-consltCountry").setVisible(false);
                    this.byId("ttl-GSTINDetails").setVisible(true);
                    this.byId("ttl-IATADetails").setVisible(false);
                    this.byId("inp-iataCode").setVisible(false);
                    this.byId("inp-companyName").setVisible(true);
                    this.byId("inp-CompRegNo").setVisible(false);
                    this.byId("lbl-CompRegNo").setVisible(false);
                    this.byId("lbl-companyPAN").setVisible(false);
                    this.byId("inp-companyPAN").setVisible(false);
                    this.byId("lbl-companyTAN").setVisible(false);
                    this.byId("inp-companyTAN").setVisible(false);
                    this.byId("inp-website").setVisible(true);
                    this.byId("inp-companyPhone").setVisible(true);
                    this.byId("lbl-companyPhone").setRequired(true);
                    this.byId("_IDGenLabel10").setRequired(true);
                    this.byId("_IDGenLabel11").setRequired(true);
                    this.byId("_IDGenLabel13").setRequired(true);
                    this.byId("_IDGenLabel14").setRequired(true);
                    this.byId("sel-state").setRequired(true);
                     this.byId("inp-address").setVisible(true);
                    this.byId("sel-country").setVisible(true);
                    this.byId("sel-state").setVisible(true);
                    this.byId("inp-region").setVisible(false);
                    this.byId("lbl-region").setVisible(false);
                    this.byId("inp-city").setVisible(true);
                    this.byId("inp-pinCode").setVisible(true);
                    this.byId("inp-pinCode").setMaxLength(6);
                            
                    this.byId("cb-ecomOperator").setVisible(false);
                    this.byId("ttl-Attachments").setVisible(false);
                    this.byId("_IDGenColumn9").setVisible(false);
                    this.byId("_IDGenColumn4").setVisible(false);
                    this.byId("_IDGenColumn2").setVisible(false);
                    this.byId("_IDGenColumn5").setVisible(false);
                    this.byId("_IDGenColumn6").setVisible(false);
                    this.byId("_IDGenColumn8").setVisible(false);
                    this.byId("_IDGenColumn28").setVisible(false);
                    this.byId("_IDGenColumn29").setVisible(false);
                    this.byId("_IDGenColumn9").setVisible(false);
                    this.byId("_IDGenFileUploader1").setVisible(false);
                    this.byId("_IDGenButton3").setVisible(false);
                    this.byId("_IDGenButton4").setVisible(false);
                    
                }else if(this.category == "07"){
                    this.byId("sel-category").setSelectedKey("07");
                    this.byId("sel-category").setEditable(false);
                    this.byId("obj-page1").setTitle("Overseas Agent Details");
                    this.byId("lbl-companyName").setText("Overseas Agent Name");
                    this.byId("ttl-GSTINDetails").setVisible(false);
                    this.byId("ttl-IATADetails").setVisible(true);
                    this.byId("lbl-consltCountry").setVisible(false);
                    this.byId("sel-consltCountry").setVisible(false);
                    this.byId("inp-iataCode").setVisible(true);
                 //   this.byId("inp-AgentiataCode").setVisible(true);
                 //   this.byId("inp-AgentiataCode").setEditable(false);
                    this.byId("inp-companyName").setVisible(true);
                    this.byId("inp-CompRegNo").setVisible(false);
                    this.byId("lbl-CompRegNo").setVisible(false);
                    this.byId("lbl-companyPAN").setVisible(false);
                    this.byId("inp-companyPAN").setVisible(false);
                    this.byId("lbl-companyTAN").setVisible(false);
                    this.byId("inp-companyTAN").setVisible(false);
                    this.byId("inp-website").setVisible(true);
                    this.byId("inp-companyPhone").setVisible(true);
                    this.byId("lbl-companyPhone").setRequired(true);
                    this.byId("_IDGenLabel10").setRequired(true);
                    this.byId("_IDGenLabel11").setRequired(true);
                    this.byId("_IDGenLabel13").setRequired(true);
                    this.byId("_IDGenLabel14").setRequired(true);
                    this.byId("sel-state").setRequired(false);
                    this.byId("inp-pinCode").setMaxLength(10);
                            
                    this.byId("inp-address").setVisible(true);
                    this.byId("sel-country").setVisible(true);
                    this.byId("sel-state").setVisible(false);
                    this.byId("lbl-region").setVisible(true);
                    this.byId("inp-region").setVisible(true);
                   
                    
                    this.byId("inp-city").setVisible(true);
                    this.byId("inp-pinCode").setVisible(true);
                    this.byId("cb-ecomOperator").setVisible(false);
                    this.byId("ttl-Attachments").setVisible(false);
                    this.byId("_IDGenColumn28").setVisible(false);
                    this.byId("_IDGenColumn29").setVisible(true);
                    this.byId("_IDGenLabel51").setText("ADD IATA");
                    this.byId("_IDGenColumn29").setTooltip("ADD IATA");
                    this.byId("_IDGenColumn9").setVisible(false);
                    this.byId("_IDGenFileUploader1").setVisible(false);
                    this.byId("_IDGenButton3").setVisible(false);
                    this.byId("_IDGenButton4").setVisible(false);
                    
                    
                }else{
                    this.byId("ttl-GSTINDetails").setTitle("GSTIN Details");
                    this.byId("_IDGenLabel23").setText("GSTIN");
                    this.byId("obj-page1").setTitle("Company Details");
                    this.byId("lbl-companyName").setText("Company Name");
                    this.byId("lbl-companyPhone").setRequired(true);
                    this.byId("_IDGenLabel10").setRequired(true);
                    this.byId("_IDGenLabel11").setRequired(true);
                    this.byId("_IDGenLabel13").setRequired(true);
                    this.byId("_IDGenLabel14").setRequired(true);
                    this.byId("inp-region").setVisible(false);
                    this.byId("inp-pinCode").setMaxLength(6);
                            
                    this.byId("sel-state").setRequired(true);    
                }
                this.SendRequest(this, "/portal-api/public/v1/fetch-master-data", "GET", {}, null, (_self, data, message) => {
                    _self.getView().getModel("masterDataModel").setData(data);
                    _self.getView().getModel("attachmentModel").setData(data.attachment);
                    _self.attachmentMasterData = data.attachment;
                    _self._profileData();

                    jQuery.sap.require("sap.ui.model.json.JSONModel");
                    var oViewModel = new sap.ui.model.json.JSONModel({
                        maxDate: new Date(),
                        minDate: new Date()
                    });

                    this.getView().setModel(oViewModel, "viewModel");
                    var argsList = oEvent.getParameter("arguments");
                    if (Object.keys(argsList).length) {
                        _self.eventfiredfrom = argsList.eventfiredfrom;
                        if (_self.eventfiredfrom == "Amend") {
                            _self.byId("objs-companyDet").focus();

                        } else if (_self.eventfiredfrom == "UserApprove") {
                            _self.byId("objs-approvalDet").focus();

                        }
                    }

                });

                this.addressUpdated = false;
            },

            onPressEdit: function () {
                this.getView().getModel().setProperty("/toggleEdit", false);
                if((this.category == "08") || (this.category == "05") || (this.category == "07")){
                    this.byId("_IDGenColumn9").setVisible(false);
                    this.byId("_IDGenFileUploader1").setVisible(false);
                    this.byId("_IDGenButton3").setVisible(false);
                    this.byId("_IDGenButton4").setVisible(false);
                 }
                /** Make MultiInput as Non editable */
                const sId = this.byId("inp-iataCode");
                sId.setEditable(false);
                if(this.category == "07"){
                    this.byId("sel-country").setEditable(false);
               // this.byId("inp-region").setEditable(true);
                 }
               // sId.getAggregation("tokenizer").setEditable(false)
            },

            onPressCancel: function () {
                var _self = this;
                // Show a confirmation message box
                sap.m.MessageBox.confirm("Are you sure you want to cancel?", {
                    title: "Confirm",
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            const orginalCompanyDetails = JSON.parse(sessionStorage.getItem("orginalCompanyDetails"));
                            const orginalUserDetails = JSON.parse(sessionStorage.getItem("orginalUserDetails"));
                            const orginalGSTINDetails = JSON.parse(sessionStorage.getItem("orginalGSTINDetails"));
                            // const orginalTCSDetails = JSON.parse(sessionStorage.getItem("orginalTCSDetails"));
                            const orginalUsers = JSON.parse(sessionStorage.getItem("orginalUsers"));
                            const orginalRequestsDetails = JSON.parse(sessionStorage.getItem("orginalRequestsDetails"));
                            const orginalApprovalDetails = JSON.parse(sessionStorage.getItem("orginalApprovalDetails"));
                            const orginalAttachmentDetails = JSON.parse(sessionStorage.getItem("orginalAttachmentDetails"));
                            const orginalAgentCodeDetails = JSON.parse(sessionStorage.getItem("orginalAgentCodeDetails"));


                            _self.companyDetailModel.setData(orginalCompanyDetails);
                            _self.userDetailModel.setData(orginalUserDetails);
                            _self.GSTDetailModel.setData(orginalGSTINDetails);
                            // _self.TCSDetailModel.setData(orginalTCSDetails);
                            _self.userModel.setData(orginalUsers);
                            _self.userRequestModel.setData(orginalRequestsDetails);
                            _self.userApprovalModel.setData(orginalApprovalDetails);
                            _self.attachmentModel.setData(orginalAttachmentDetails);
                            _self.agentCodeDialogModel.setData(orginalAgentCodeDetails);

                            _self.companyDetailModel.refresh();
                            _self.userDetailModel.refresh();
                            _self.GSTDetailModel.refresh();
                            // _self.TCSDetailModel.refresh();
                            _self.userModel.refresh();
                            _self.userRequestModel.refresh();
                            _self.userApprovalModel.refresh();
                            _self.attachmentModel.refresh();
                            _self.agentCodeDialogModel.refresh();

                            _self.getView().getModel().setProperty("/toggleEdit", true);
                        }
                    }
                });
            },

            _profileData: function () {
                this.SendRequest(this, "/portal-api/portal/v1/get-profile-details", "GET", {}, null, (_self, data, message) => {

                    this.companyDetailModel.setData(data.companyDetails);
                    sessionStorage.setItem("orginalCompanyDetails", JSON.stringify(data.companyDetails));

                    if (data.companyDetails.ISECOMMERCEOPERATOR) {
                      //  _self.byId("objs-tcsDet").setVisible(true);
                    }

                    this.userDetailModel.setData(data.userDetails);
                    sessionStorage.setItem("orginalUserDetails", JSON.stringify(data.userDetails));

                    this.GSTDetailModel.setData(data.GSTDetails);
                    sessionStorage.setItem("orginalGSTINDetails", JSON.stringify(data.GSTDetails));

                    this.TCSDetailModel.setData(data.TCSDetails);
                    sessionStorage.setItem("orginalTCSDetails", JSON.stringify(data.tcsDetails));

                    this.userModel.setData(data.users);
                    sessionStorage.setItem("orginalUsers", JSON.stringify(data.users ?? []));

                    this.userRequestModel.setData(data.userRequest);
                    sessionStorage.setItem("orginalRequestsDetails", JSON.stringify(data.userRequest ?? []));

                    this.userApprovalModel.setData(data.userApprovals);
                    sessionStorage.setItem("orginalApprovalDetails", JSON.stringify(data.userApprovals ?? []));

                    if(data.attachments.length == 0){
                    this.attachmentModel.setData(_self.attachmentMasterData);
                    sessionStorage.setItem("orginalAttachmentDetails", JSON.stringify(_self.attachmentMasterData ?? []));
                    } else{
                    this.attachmentModel.setData(data.attachments);
                    sessionStorage.setItem("orginalAttachmentDetails", JSON.stringify(data.attachments ?? []));
                    }

                    sessionStorage.setItem("orginalIataDetails", JSON.stringify(data.IataDetails ?? []));
                       
                    this.rolesModel.setData(data.roles);
                    this.iataaddflag = true;
                    if(data.IataDetails){
                    if (data.IataDetails.length > 0) {
                     
                        this.IATADetailModel.setData(data.IataDetails);
                        this.IATADetailModel.refresh();
                        this.byId("ttl-IATADetails").setTitle("IATA Details (" + data.IataDetails.length + ")");
                    }
                     }

                    this.byId("ObjectPageLayout").setVisible(true);

                    //Set UserName
                    this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", "Welcome, " + data.userDetails.FIRSTNAME + ' ' + data.userDetails.LASTNAME);

                    sap.ui.core.BusyIndicator.hide();
                });
            },

            // onSelectEcomOperator: function (oEvent) {
                // const isSelected = oEvent.getParameter("selected");
                // if (isSelected) {
                //     this.byId("objs-tcsDet").setVisible(true);
                // } else {
                //     this.byId("objs-tcsDet").setVisible(false);
                // }
            // },

            onButtonShowPanPress: function (oEvent) {
                const companyProfileData = this.companyProfileModel.getData();
                const companyPanAttachment = companyProfileData.COMPANYPANATTACHMENT;
                this.openPdfOrImageInNewWindow("Company - PAN", companyPanAttachment);
            },

            onButtonShowTANPress: function (oEvent) {
                const companyProfileData = this.companyProfileModel.getData();
                const companyTanAttachment = companyProfileData.COMPANYTANATTACHMENT;
                this.openPdfOrImageInNewWindow("Company - TAN", companyTanAttachment);
            },

            openPdfOrImageInNewWindow: function (title, base64Data) {
                if (base64Data) {
                    var typeBase64 = base64Data.split(',')[0];
                    var type = "";

                    if (typeBase64.match(/pdf/i)) {
                        type = "pdf";
                    } else if (typeBase64.match(/jpeg|jpg|png/i)) {
                        type = "image";
                    }

                    if (type === "pdf" || type === "image") {
                        var newWindow = window.open();
                        newWindow.document.title = title;
                        var heading = document.createElement('h5');
                        heading.textContent = title;
                        var iframe = document.createElement('iframe');
                        iframe.src = base64Data;
                        iframe.width = "100%";
                        iframe.height = "100%";
                        newWindow.document.body.appendChild(heading);
                        newWindow.document.body.appendChild(iframe);
                    } else {
                        const link = document.createElement('a');
                        link.href = base64Data;
                        link.download = title;
                        link.click();
                    }
                } else {
                    sap.m.MessageBox.warning(title + "");
                }
            },

            createColumnConfig: function () {
                return [
                    {
                        "label": "GSTIN",
                        "property": "GSTIN",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "GST Type",
                        "property": "GSTTYPE",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "Date of Issue",
                        "property": "DATEOFISSUEGST",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "Status",
                        "property": "STATUS",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "Legal Name",
                        "property": "LEGALNAME",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "Trade Name",
                        "property": "TRADENAME",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "Last Validation",
                        "property": "LASTVALIDATEDON",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "Address",
                        "property": "ADDRESS",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "State",
                        "property": "STATE",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "City",
                        "property": "CITY",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "Pincode",
                        "property": "PINCODE",
                        "type": "EdmType.String"
                    }
                ];
            },
            createColumnConfigUIN: function () {
                return [
                    {
                        "label": "UIN",
                        "property": "GSTIN",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "Default",
                        "property": "DEFAULT",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "Status",
                        "property": "STATUS",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "Address",
                        "property": "ADDRESS",
                        "type": "EdmType.String"
                    }
                ];
            },
            createColumnConfigIATA: function () {
                return [
                    {
                        "label": "IATA Number",
                        "property": "IATANUMBER",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "Type",
                        "property": "SITETYPE",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "Legal Name",
                        "property": "LEGALNAME",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "Trade Name",
                        "property": "TRADENAME",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "City",
                        "property": "CITY",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "Region",
                        "property": "REGION",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "Country",
                        "property": "COUNTRYNAME",
                        "type": "EdmType.String"
                    },
                    {
                        "label": "Postal Code",
                        "property": "POSTALCODE",
                        "type": "EdmType.String"
                    }
                ];
            },

            onExportGstin: function (oEvent) {
                var data = this.GSTDetailModel.getData();
                if (data.length > 0) {
                    var aCols, oBinding, oSettings, oSheet, oTable;
                    oTable = this.byId('idGSTDetailsTable');
                    oBinding = oTable.getBinding('rows');
                    if((this.category == "08") || (this.category == "05")){
                    aCols = this.createColumnConfigUIN();
                    }else{
                        aCols = this.createColumnConfig();
                    }

                    // Check if any rows are selected
                    var aSelectedIndices = oTable.getSelectedIndices();

                    // Determine whether to export selected data or all data
                    if (aSelectedIndices.length > 0) {
                        // Export selected data
                        var aSelectedData = [];
                        for (var i = 0; i < aSelectedIndices.length; i++) {
                            var iIndex = aSelectedIndices[i];
                            var oSelectedRow = oBinding.getModel().getProperty(oBinding.getContexts()[iIndex].getPath());
                            aSelectedData.push(oSelectedRow);
                        }
                        oSettings = {
                            workbook: { columns: aCols },
                            dataSource: aSelectedData
                        };
                    } else {
                        // Export all data
                        oSettings = {
                            workbook: { columns: aCols },
                            dataSource: oBinding
                        };
                    }

                    oSheet = new Spreadsheet(oSettings);
                    oSheet.build()
                        .then(function () {
                            // Handle success
                        })
                        .finally(function () {
                            oSheet.destroy();
                        });
                } else {
                    MessageBox.warning("No data to export.");
                }
            },
            onExportIATA: function (oEvent) {
                var data = this.IATADetailModel.getData();
                if (data.length > 0) {
                    var aCols, oBinding, oSettings, oSheet, oTable;
                    oTable = this.byId('idIATADetailsTable');
                    oBinding = oTable.getBinding('rows');
                   
                        aCols = this.createColumnConfigIATA();
                    

                    // Check if any rows are selected
                    var aSelectedIndices = oTable.getSelectedIndices();

                    // Determine whether to export selected data or all data
                    if (aSelectedIndices.length > 0) {
                        // Export selected data
                        var aSelectedData = [];
                        for (var i = 0; i < aSelectedIndices.length; i++) {
                            var iIndex = aSelectedIndices[i];
                            var oSelectedRow = oBinding.getModel().getProperty(oBinding.getContexts()[iIndex].getPath());
                            aSelectedData.push(oSelectedRow);
                        }
                        oSettings = {
                            workbook: { columns: aCols },
                            dataSource: aSelectedData
                        };
                    } else {
                        // Export all data
                        oSettings = {
                            workbook: { columns: aCols },
                            dataSource: oBinding
                        };
                    }

                    oSheet = new Spreadsheet(oSettings);
                    oSheet.build()
                        .then(function () {
                            // Handle success
                        })
                        .finally(function () {
                            oSheet.destroy();
                        });
                } else {
                    MessageBox.warning("No data to export.");
                }
            },

            /**Add GSTIN Based on Inputted PAN */
            onPressAddGstin: function () {
                const selPan = this.byId("inp-companyPAN").getValue();
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/portal-api/portal/v1/pan-gstin", "GET", {}, null, (_self, data, message) => {
                    if (data) {
                        if (data.GSTINS) {
                            data = data.GSTINS;
                            var GSTINList = this.GSTDetailModel.getData();
                            if (GSTINList.length > 0) {
                                const uniqueGSTNumbers = new Set(GSTINList.map(item => item.GSTIN));
                                // Filter and remove duplicates in gstinarr
                                const filteredGstinarr = data.filter(item => !uniqueGSTNumbers.has(item.GSTIN));
                                _self.gstinListModel.setData(filteredGstinarr);
                            } else {
                                _self.gstinListModel.setData(data);
                            }
                            if (!this.gstinListDialog) {
                                this.gstinListDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.gstinList", this);
                            }
                            this.getView().addDependent(this.gstinListDialog);
                            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.gstinListDialog);
                            _self.gstinListDialog.open();
                        }
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
            },

            /** After selecting GSTIN */
            onSelectGSTINList: function (oEvent) {
                const selGSTINs = oEvent.getParameter("selectedItems");
                if (selGSTINs) {
                    sap.ui.core.BusyIndicator.show();
                    var arrGSTIN = [];
                    if (selGSTINs.length > 0) {
                        for (let i = 0; i < selGSTINs.length; i++) {
                            arrGSTIN.push(selGSTINs[i].getTitle());
                        }
                        this.SendRequest(this, "/portal-api/portal/v1/gstin-details", "POST", {}, JSON.stringify(arrGSTIN), (_self, data, message) => {
                            if (data) {
                                if (data.GSTINDetails) {

                                    data = data.GSTINDetails;

                                    const currentDate = new Date();
                                    const year = currentDate.getFullYear();
                                    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based, so we add 1
                                    const day = currentDate.getDate().toString().padStart(2, '0');

                                    const formattedDate = `${year}-${month}-${day}`;
                                    data.forEach(element => {
                                        element.address = [{
                                            TYPE: "Principal",
                                            GSTIN: element.GSTIN,
                                            USEFORINVOICEPRINTING: true,
                                            STATE: element.STATE,
                                            CITY: element.CITY,
                                            PINCODE: element.PINCODE,
                                            EFFECTIVEFROM: formattedDate,
                                            SERIALNO: 1
                                        }]
                                    });
                                    const gstinList = _self.GSTDetailModel.getData();
                                    if (gstinList.length > 0) {
                                        _self.GSTDetailModel.getData().push(...data);
                                    } else {
                                        _self.GSTDetailModel.setData(data);
                                    }

                                    _self._hideMessageStrip(`msgStripGSTDetails`);

                                    _self.GSTDetailModel.refresh();
                                }
                            }
                            sap.ui.core.BusyIndicator.hide();
                        });
                    }
                }
            },

            onSearchGSTINPress: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("GSTIN", FilterOperator.Contains, sValue);
                var oBinding = oEvent.getParameter("itemsBinding");
                oBinding.filter([oFilter]);
            },

            onDeleteGSTPress: function (oEvent) {
                const oIndex = oEvent.getParameter("row").getIndex(),
                    oTable = this.byId("idGSTDetailsTable"),
                    oObject = oTable.getContextByIndex(oIndex).getObject();
                var _self = this;
                MessageBox.confirm("Are you sure you want to delete this item?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            // Delete the item from the model
                            _self.GSTDetailModel.getData().splice(oIndex, 1);
                            _self._hideMessageStrip(`msgStrip${oObject.GSTIN}`);
                            _self.GSTDetailModel.refresh();
                        }
                    }
                });
            },
            onDeleteIATAPress: function (oEvent) {
                const oIndex = oEvent.getParameter("row").getIndex(),
                    oTable = this.byId("idIATADetailsTable"),
                    oObject = oTable.getContextByIndex(oIndex).getObject();
                var _self = this;
                MessageBox.confirm("Are you sure you want to delete this item?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            // Delete the item from the model
                            _self.IATADetailModel.getData().splice(oIndex, 1);
                            _self._hideMessageStrip(`msgStrip${oObject.IATANUMBER}`);
                            _self.IATADetailModel.refresh();
                        }
                    }
                });
            },

            onChangeIncoicePrinting: function (oEvent) {
                var oTable = sap.ui.getCore().byId("tbl-GSTINaddress");
                var idx = oEvent.getSource().getParent().getIndex();
                var model = oTable.getModel("GSTINAddressModel");
                var arrGSTIN = model.getData();
                arrGSTIN.forEach((x, index) => {
                    if (index === idx) {
                        x.USEFORINVOICEPRINTING = true
                    } else {
                        x.USEFORINVOICEPRINTING = false
                    }
                });
                this._hideMessageStrip(`msgStripGSTDetails`);
                model.setData(arrGSTIN);
            },

            onEditGSTPress: function (oEvent) {
                const oIndex = oEvent.getParameter("row").getIndex(),
                    oTable = this.byId("idGSTDetailsTable"),
                    oObject = oTable.getContextByIndex(oIndex).getObject();

                sessionStorage.setItem('originalGSTINDetails', JSON.stringify(oObject));

                this.GSTINPastAddressModel.setData(oObject.addressHistory);
                this.GSTINAddressModel.setData(oObject.address);

                this.oGSTUpdateDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.GSTDetailsDialog", this);
                this.gstinDialogModel = new sap.ui.model.json.JSONModel();
                this.gstinDialogModel.setData(oObject);
                this.getView().setModel(this.gstinDialogModel, "gstinDialogModel");
                this.getView().addDependent(this.oGSTUpdateDialog);
                this.oGSTUpdateDialog.open();

                sap.ui.getCore().byId("dp-effectiveDate").setMinDate(new Date());
            },

            onAddNewAddress: function (oEvent) {
                var editedAddressData = this.GSTINAddressModel.getData();

                var oPastAddressData = this.GSTINPastAddressModel.getData();
                var allMandatoryFieldsFilled = true;

                // Check if mandatory fields are filled for each element in the array
                var validateDate = true,
                    validateMandatory = true,
                    validatePincode = true;
                for (let i = 0; i < editedAddressData.length; i++) {
                    const item = editedAddressData[i];
                    if (item.TYPE != "Principal"){
                     if (
                         !item.ADDRESS ||
                         !item.PINCODE ||
                         !item.EFFECTIVEFROM
                     ) {
                         // If any element doesn't have all mandatory fields filled, set the flag to false
                         validateMandatory = false;
                     } else {
                        this._hideMessageStrip(`msgStripAddressGSTIN`);
                        if (item.EFFECTIVEFROM && !validations.validateDate(item.EFFECTIVEFROM)) {
                            validateDate = false;
                        } else {
                            this._hideMessageStrip(`msgStripDateFormat`);
                        }
                        if (item.PINCODE && !validations.validatePincode(item.PINCODE)) {
                            validatePincode = false;
                        } else {
                            this._hideMessageStrip(`msgStripPincodeFromat`);
                        }
                    }
                    }else{
                        this._hideMessageStrip(`msgStripAddressGSTIN`);
                        if (item.EFFECTIVEFROM && !validations.validateDate(item.EFFECTIVEFROM)) {
                            validateDate = false;
                        } else {
                            this._hideMessageStrip(`msgStripDateFormat`);
                        }
                        if (item.PINCODE && !validations.validatePincode(item.PINCODE)) {
                            validatePincode = false;
                        } else {
                            this._hideMessageStrip(`msgStripPincodeFromat`);
                        }
                    }
                };

                // If all mandatory fields are filled for all elements, add a new address
                if (validateDate && validateMandatory && validatePincode) {
                    editedAddressData.push({
                        TYPE: "Additional",
                        GSTIN: editedAddressData[0].GSTIN,
                        USEFORINVOICEPRINTING: false,
                        ADDRESS: "",
                        STATE: editedAddressData[0].STATE,
                        PINCODE: "",
                        EFFECTIVEFROM: '',
                        SERIALNO: editedAddressData.length + (oPastAddressData ? oPastAddressData.length : 0) + 1
                    });
                    this.GSTINAddressModel.refresh();
                } else if (!validateMandatory) {
                    this._showMessageStrip('oVCGSTINAddr', 'msgStripAddressGSTIN', "Please fill in all mandatory fields for all addresses", 'E');
                } else if (!validateDate) {
                    this._showMessageStrip('oVCGSTINAddr', 'msgStripDateFormat', "Invalid Date format", 'E');
                }
            },

            onDeleteGSTINAddress: function (oEvent) {
                const oIndex = oEvent.getParameter("row").getIndex();
                const oObject = oEvent.getSource().getBindingContext("GSTINAddressModel").getObject();
                const GSTINTblDetais = this.GSTDetailModel.getData();
                var _self = this;
                MessageBox.confirm("Are you sure you want to delete this item?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            GSTINTblDetais.forEach(element => {
                                if (element.GSTIN === oObject.GSTIN) {
                                    if (element.deletedItems) {
                                        element.deletedItems.push({ GSTIN: oObject.GSTIN, SERIALNO: oObject.SERIALNO })
                                    } else {
                                        element.deletedItems = [{ GSTIN: oObject.GSTIN, SERIALNO: oObject.SERIALNO }]
                                    }
                                }
                            });
                            // Delete the item from the model
                            _self.GSTINAddressModel.getData().splice(oIndex, 1);
                            _self.GSTINAddressModel.refresh();
                        }
                    }
                });
            },

            onCloseGSTNDetails: function (oEvent) {
                var editedAddressData = this.GSTINAddressModel.getData();
                var allMandatoryFieldsFilled = true;
                // Check if mandatory fields are filled for each element in the array 
                var validateDate = true,
                    validateMandatory = true,
                    validatePincode = true;
                for (let i = 0; i < editedAddressData.length; i++) {
                     const item = editedAddressData[i];
                     if (item.TYPE != "Principal"){
                     if (
                         !item.ADDRESS ||
                         !item.PINCODE ||
                         !item.EFFECTIVEFROM
                     ) {
                         // If any element doesn't have all mandatory fields filled, set the flag to false
                         validateMandatory = false;
                     } else {
                        this._hideMessageStrip(`msgStripAddressGSTIN`);
                        if (item.EFFECTIVEFROM && !validations.validateDate(item.EFFECTIVEFROM)) {
                            validateDate = false;
                        } else {
                            this._hideMessageStrip(`msgStripDateFormat`);
                        }
                        if (item.PINCODE && !validations.validatePincode(item.PINCODE)) {
                            validatePincode = false;
                        } else {
                            this._hideMessageStrip(`msgStripPincodeFromat`);
                        }
                    }
                     }else{

                        this._hideMessageStrip(`msgStripAddressGSTIN`);
                        if (item.EFFECTIVEFROM && !validations.validateDate(item.EFFECTIVEFROM)) {
                            validateDate = false;
                        } else {
                            this._hideMessageStrip(`msgStripDateFormat`);
                        }
                        if (item.PINCODE && !validations.validatePincode(item.PINCODE)) {
                            validatePincode = false;
                        } else {
                            this._hideMessageStrip(`msgStripPincodeFromat`);
                        }

                     }
                };

                if (validateDate && validateMandatory && validatePincode) {
                    this.oGSTUpdateDialog.destroy();
                } else if (!validateMandatory) {
                    this._showMessageStrip('oVCGSTINAddr', 'msgStripAddressGSTIN', "Please fill in all mandatory fields for all addresses", 'E');
                } else if (!validateDate) {
                    this._showMessageStrip('oVCGSTINAddr', 'msgStripDateFormat', "Invalid Date format", 'E');
                } else if (!validatePincode) {
                    this._showMessageStrip('oVCGSTINAddr', 'msgStripPincodeFromat', "Invalid Pincode", 'E');
                }
            },

            onDefaultGSTINSelect: function (oEvent) {
                var oTable = this.byId("idGSTDetailsTable");
                var idx = oEvent.getSource().getParent().getIndex();
                var model = oTable.getModel("GSTDetailModel");
                var arrGSTIN = model.getData();
                arrGSTIN.forEach((x, index) => {
                    if (index === idx) {
                        x.DEFAULT = true
                    } else {
                        x.DEFAULT = false
                    }
                });
                this._hideMessageStrip(`msgStripGSTDetails`);
                model.setData(arrGSTIN);
            },

            onDeleteGSTINAttachment: function (oEvent) {
                const oBinding = oEvent.getSource().getBindingContext("GSTDetailModel");
                const oPath = oBinding.getPath();
                const oIndex = oPath.split('/')[1];
                const oObject = oBinding.getObject();
                const arrGSTIN = this.GSTDetailModel.getData();
                oObject.GSTCERTIFICATE = "";
                arrGSTIN.splice(oIndex, 1, oObject);
                this.GSTDetailModel.setData(arrGSTIN);
                this.GSTDetailModel.refresh();
                sap.ui.core.BusyIndicator.hide();
            },

            handleUploadGSTINFile: async function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                this.validfileflag = true;
                await this.change(oEvent,);
                const oIndex = oEvent.getSource().getParent().getParent().getIndex();
                const oObject = oEvent.getSource().getBindingContext("GSTDetailModel").getObject();
                const arrAttachment = this.GSTDetailModel.getData();
                const selFile = oEvent.getSource().FUEl.files[0] ?? null;
                if ((selFile) && (this.validfileflag)) {
                    var base64 = await this.convertFileToBase64WithType(selFile, selFile ? selFile.type : "");
                    oObject.GSTCERTIFICATE = base64;
                    arrAttachment.splice(oIndex, 1, oObject);
                    this.GSTDetailModel.setData(arrAttachment);
                    this.GSTDetailModel.refresh();
                    this._hideMessageStrip(`msgStrip${oObject.GSTIN}`);
                    sap.ui.core.BusyIndicator.hide();
                }
            },

            onDownloadGSTINAttachment: function (oEvent) {
                const selObj = oEvent.getSource().getBindingContext("GSTDetailModel").getObject(),
                    GSTIN = selObj.GSTIN,
                    ATTACHMENT = selObj.GSTCERTIFICATE;
                this.openPdfOrImageInNewWindow("GSTIN - Certificate( " + GSTIN + " )", ATTACHMENT);
            },

            onFileSizeExceeded: function (oEvent) {
                sap.m.MessageToast.show(this.oResourceBundle.getText('fileLimitExceed'));
            },

            handleUploadFile: async function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                this.validfileflag = true;
                const oIndex = oEvent.getSource().getParent().getParent().getIndex();
                const oObject = oEvent.getSource().getBindingContext("attachmentModel").getObject();
                const arrAttachment = this.attachmentModel.getData();
                const selFile = oEvent.getSource().FUEl.files[0] ?? null;
                await this.change(oEvent);
                
                if ((selFile) && (this.validfileflag)) {
                    var base64 = await this.convertFileToBase64WithType(selFile, selFile ? selFile.type : "");
                    oObject.FILE = base64;
                    oObject.FILENAME = selFile.name;
                    oObject.MIMETYPE = selFile.type;
                    arrAttachment.splice(oIndex, 1, oObject);
                    this.attachmentModel.setData(arrAttachment);
                    this.attachmentModel.refresh();

                    if (oObject.ISMANDATORY) {
                        this._hideMessageStrip(`msgStrip${oObject.DOCUMENTTYPECODE}`);
                    }
                    sap.ui.core.BusyIndicator.hide();
                }
            },

            change: async function (oEvent) {
                return new Promise((resolve, reject) => {
                    // Check if the file is of considered type
                    var _self = this;
                    if ((oEvent.getSource().getId().split("--")[2].slice(0, 19)) == "_IDGenFileUploader1") {
                        var fileUpload = this.byId("_IDGenFileUploader1");
                        var oIndex = oEvent.getSource().getParent().getParent().getIndex();
                        var oObject = oEvent.getSource().getBindingContext("GSTDetailModel").getObject();
                        var arrAttachment = this.GSTDetailModel.getData();
                        var selFile = oEvent.getSource().FUEl.files[0] ?? null;
                    } else {
                        var fileUpload = this.byId("_IDGenFileUploader2");
                        var oIndex = oEvent.getSource().getParent().getParent().getIndex();
                        var oObject = oEvent.getSource().getBindingContext("attachmentModel").getObject();
                        var arrAttachment = this.attachmentModel.getData();
                        var selFile = oEvent.getSource().FUEl.files[0] ?? null;
                    }
                    isImage(selFile, function (isImage) {
                        if (!isImage) {
                            MessageBox.error("Invalid file format. Please upload an image of format: JPEG, JPG, PNG , DOC , PDF");
                            _self.validfileflag = false;
                            // Clear the File Name and File Type fields
                            arrAttachment[oIndex].FILENAME = ""; // Assuming FILENAME is the property binding for the File Name field
                            arrAttachment[oIndex].MIMETYPE = ""; // Assuming MIMETYPE is the property binding for the File Type field
 
                            // Update the model
                            _self.attachmentModel.setData(arrAttachment);
                            _self.attachmentModel.refresh();
                            sap.ui.core.BusyIndicator.hide();
                            resolve(_self.validfileflag);
                        } else {
                            _self.validfileflag = true;
                            resolve(_self.validfileflag);
                        }
                    });
 
                    // Function to check if a file is an image based on its content
                    function isImage(file, callback) {
                    
                        const reader = new FileReader();
 
                        reader.onloadend = function () {
                            // Get the first few bytes of the file (usually enough to determine the file type)
                            const arr = new Uint8Array(reader.result).subarray(0, 4);
                            let header = "";
                            for (let i = 0; i < arr.length; i++) {
                                header += arr[i].toString(16);
                            }
 
                            // Check if the file matches common image file signatures
                            if (header.startsWith("89504e47") || // PNG
                                header.startsWith("ffd8ffe0") || header.startsWith("25504446") || header.startsWith("504b34") || header.startsWith("d0cf11e0") // JPEG/JPG
                            ) {
                                callback(true);
                            } else {
                                callback(false);
                            }
                        };
 
                        // Read the file content
                        reader.readAsArrayBuffer(file);
                    }
                });
 
            },

            convertFileToBase64WithType: async function (file, fileType) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = () => {
                        // Read the file as a data URL and resolve with the result
                        resolve(reader.result);
                    };

                    reader.onerror = (error) => {
                        // Reject with the error if there is a problem reading the file
                        reject(error);
                    };

                    if (fileType && fileType !== "") {
                        // If a specific fileType is provided, set the file type explicitly
                        reader.readAsDataURL(new Blob([file], { type: fileType }));
                    } else {
                        // Otherwise, let the browser determine the file type
                        reader.readAsDataURL(file);
                    }
                });

            },

            onDeleteAttachment: function (oEvent) {
                var _self = this;
                MessageBox.confirm("Are you sure you want to delete this attachment?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            const oIndex = oEvent.getParameter("row").getIndex();
                            const oTable = _self.byId("tbl-attachment");
                            const oObject = oTable.getContextByIndex(oIndex).getObject();
                            const arrAttachment = _self.attachmentModel.getData();
                            oObject.FILE = "";
                            oObject.FILENAME = "";
                            oObject.MIMETYPE = "";
                            oObject.VALIDFROM = "";
                            oObject.VALIDTO = "";
                            oObject.ISSUEDON = "";
                            arrAttachment.splice(oIndex, 1, oObject);
                            _self.attachmentModel.setData(arrAttachment);
                            _self.attachmentModel.refresh();
                            sap.ui.core.BusyIndicator.hide();
                        }
                    }
                });
            },

            onDownloadAttachment: function (oEvent) {
                const selObj = oEvent.getSource().getBindingContext("attachmentModel").getObject(),
                    DOCUMENTNAME = selObj.DOCUMENTNAME,
                    ATTACHMENT = selObj.FILE;
                this.openPdfOrImageInNewWindow("Attachment - " + DOCUMENTNAME, ATTACHMENT);
            },

            openPdfOrImageInNewWindow: function (title, base64Data) {
                if (base64Data) {
                    var typeBase64 = base64Data.split(',')[0];
                    var type = "";

                    if (typeBase64.match(/pdf/i)) {
                        type = "pdf";
                    } else if (typeBase64.match(/jpeg|jpg|png/i)) {
                        type = "image";
                    }

                    if (type === "pdf" || type === "image") {
                        var newWindow = window.open();
                        newWindow.document.title = title;
                        var heading = document.createElement('h5');
                        heading.textContent = title;
                        var iframe = document.createElement('iframe');
                        iframe.src = base64Data;
                        iframe.width = "100%";
                        iframe.height = "100%";
                        newWindow.document.body.appendChild(heading);
                        newWindow.document.body.appendChild(iframe);
                    } else {
                        const link = document.createElement('a');
                        link.href = base64Data;
                        link.download = title;
                        link.click();
                    }
                } else {
                    sap.m.MessageBox.warning(title + " attachment is missing. Please upload an attachment.");
                }
            },

            /** Block / Approve / Activate Users  */

            onBlockUser: function (oEvent) {
                const oObject = oEvent.getSource().getBindingContext("userModel").getObject();
                const userEmail = oObject.LOGINEMAIL,
                    userId = oObject.ID;
                // if (!this.oBlockUserDialog) {
                this.oBlockUserDialog = new sap.m.Dialog({
                    type: DialogType.Message,
                    title: "Confirm Block",
                    content: [
                        new Label({
                            text: "Are you sure you want to block this user?",
                            labelFor: "blockReason"
                        }),
                        new TextArea("blockReason", {
                            width: "100%",
                            placeholder: "Add a reason (required)",
                            liveChange: function (oEvent) {
                                var sText = oEvent.getParameter("value");
                                this.oBlockUserDialog.getBeginButton().setEnabled(sText.length > 0);
                            }.bind(this)
                        })
                    ],
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: "Block",
                        enabled: false,
                        press: function () {
                            sap.ui.core.BusyIndicator.show();
                            var blockReason = Core.byId("blockReason").getValue();
                            this.handleUserBlock(userId, userEmail, blockReason);
                            this.oBlockUserDialog.close();
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this.oBlockUserDialog.destroy();
                        }.bind(this)
                    })
                });
                // }
                Core.byId("blockReason").setValue("");
                this.oBlockUserDialog.open();
            },

            handleUserBlock: function (userId, userEmail, blockReason) {
                // Send a request to block the user with the provided blockReason.
                // Handle the result or display a message as needed.
                // Example: You can show a success message using MessageToast.
                const reqData = { ID: userId, user: userEmail, blockReason: blockReason }
                this.SendRequest(this, "/portal-api/portal/v1/block-user", "POST", {}, JSON.stringify({ ...reqData }), (_self, data, message) => {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageBox.success(message.Text, {
                        onClose: function () {
                            _self.userModel.setData(data.users);
                            sessionStorage.setItem("orginalUsers", JSON.stringify(data.users));
                            _self.userApprovalModel.refresh();
                            _self.oBlockUserDialog.destroy();
                        }
                    });
                });
            },

            onUnBlockUser: function (oEvent) {
                const oObject = oEvent.getSource().getBindingContext("userModel").getObject();
                const userEmail = oObject.LOGINEMAIL,
                    userId = oObject.ID;

                // if (!this.oUnBlockUserDialog) {
                this.oUnBlockUserDialog = new sap.m.Dialog({
                    type: DialogType.Message,
                    title: "Confirm Unblock",
                    content: [
                        new Label({
                            text: "Are you sure you want to unblock this user?",
                            labelFor: "unblockUser"
                        })
                    ],
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: "Unblock",
                        press: function () {
                            sap.ui.core.BusyIndicator.show();
                            this.handleUnblockUser(userId, userEmail);
                            this.oUnBlockUserDialog.close();
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this.oUnBlockUserDialog.destroy();
                        }.bind(this)
                    })
                });
                // }

                this.oUnBlockUserDialog.open();
            },

            handleUnblockUser: function (userId, userEmail) {
                // Send a request to unblock the user.
                // Handle the result or display a message as needed.
                // Example: You can show a success message using MessageToast. 
                const reqData = { ID: userId }
                this.SendRequest(this, "/portal-api/portal/v1/unblock-user", "POST", {}, JSON.stringify({ ...reqData }), (_self, data, message) => {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageBox.success(message.Text, {
                        onClose: function () {
                            _self.userModel.setData(data.users);
                            sessionStorage.setItem("orginalUsers", JSON.stringify(data.users));
                            _self.userApprovalModel.refresh();
                            _self.oUnBlockUserDialog.destroy();
                        }
                    });
                });
            },

            onActivateUser: function (oEvent) {
                const oObject = oEvent.getSource().getBindingContext("userModel").getObject();
                const userEmail = oObject.LOGINEMAIL,
                    userId = oObject.ID;

                // if (!this.oActivateUserDialog) {
                this.oActivateUserDialog = new sap.m.Dialog({
                    type: DialogType.Message,
                    title: "Confirm Activate",
                    content: [
                        new Label({
                            text: "Are you sure you want to Activate this user?",
                            labelFor: "activateUser"
                        })
                    ],
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: "Activate",
                        press: function () {
                            sap.ui.core.BusyIndicator.show();
                            this.handleActivateUser(userId, userEmail);
                            this.oActivateUserDialog.close();
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this.oActivateUserDialog.destroy();
                        }.bind(this)
                    })
                });
                // }

                this.oActivateUserDialog.open();
            },

            handleActivateUser: function (userId, userEmail) {
                // Send a request to Activate the user.
                // Handle the result or display a message as needed.
                // Example: You can show a success message using MessageToast. 
                const reqData = { ID: userId }
                this.SendRequest(this, "/portal-api/portal/v1/activate-user", "POST", {}, JSON.stringify({ ...reqData }), (_self, data, message) => {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageBox.success(message.Text, {
                        onClose: function () {
                            _self.userModel.setData(data.users);
                            sessionStorage.setItem("orginalUsers", JSON.stringify(data.users));
                            _self.userApprovalModel.refresh();
                            _self.oActivateUserDialog.destroy();
                        }
                    });
                });
            },

            /** Approve / Reject Users */
            onApproveUser: function (oEvent) {
                const oObject = oEvent.getSource().getBindingContext("userApprovalModel").getObject();
                const userEmail = oObject.LOGINEMAIL,
                    userId = oObject.ID;

                // if (!this.oApproveUserDialog) {
                this.oApproveUserDialog = new sap.m.Dialog({
                    type: DialogType.Message,
                    title: "Confirm Approve",
                    content: [
                        new Label({
                            text: "Are you sure you want to Approve this user?",
                            labelFor: "approveUser"
                        })
                    ],
                    beginButton: new Button("approveUser", {
                        type: ButtonType.Emphasized,
                        text: "Approve",
                        press: function () {
                            sap.ui.core.BusyIndicator.show();
                            this.handleApproveUser(userId, userEmail);
                            this.oApproveUserDialog.close();
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this.oApproveUserDialog.destroy();
                        }.bind(this)
                    })
                });
                // }

                this.oApproveUserDialog.open();
            },

            handleApproveUser: function (userId, userEmail) {
                // Send a request to approve the user.
                // Handle the result or display a message as needed.
                // Example: You can show a success message using MessageToast. 
                const reqData = { ID: userId }
                this.SendRequest(this, "/portal-api/portal/v1/approve-user", "POST", {}, JSON.stringify({ ...reqData }), (_self, data, message) => {
                    sap.ui.core.BusyIndicator.hide();
                    _self.oApproveUserDialog.destroy();
                    sap.m.MessageBox.success(message.Text, {
                        onClose: function () {

                            _self.userApprovalModel.setData(data.userApprovals);
                            sessionStorage.setItem("orginalApprovalDetails", JSON.stringify(data.userApprovals));
                            _self.userApprovalModel.refresh();

                            _self.userModel.setData(data.userDetails);
                            sessionStorage.setItem("orginalUsers", JSON.stringify(data.userDetails));
                            _self.userModel.refresh();
                        }
                    });

                });
            },

            onRejectUser: function (oEvent) {
                const oObject = oEvent.getSource().getBindingContext("userApprovalModel").getObject();
                const userEmail = oObject.LOGINEMAIL,
                    userId = oObject.ID;

                // if (!this.onRejectUserDialog) {
                this.onRejectUserDialog = new sap.m.Dialog({
                    type: DialogType.Message,
                    title: "Confirm Reject",
                    content: [
                        new Label({
                            text: "Are you sure you want to reject this user?",
                            labelFor: "rejectUser"
                        }),
                        new TextArea("blockReason", {
                            width: "100%",
                            placeholder: "Add a reason (required)",
                            liveChange: function (oEvent) {
                                var sText = oEvent.getParameter("value");
                                this.oBlockUserDialog.getBeginButton().setEnabled(sText.length > 0);
                            }.bind(this)
                        })
                    ],
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: "Reject",
                        press: function () {
                            sap.ui.core.BusyIndicator.show();
                            const reason = Core.byId("blockReason").getValue();
                            this.handleRejectUser(userId, userEmail, reason);
                            this.onRejectUserDialog.close();
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this.onRejectUserDialog.destroy();
                        }.bind(this)
                    })
                });
                // }

                this.onRejectUserDialog.open();
            },

            handleRejectUser: function (userId, userEmail, reason) {
                // Send a request to reject the user.
                // Handle the result or display a message as needed.
                // Example: You can show a success message using MessageToast. 
                const reqData = { ID: userId, rejectionReason: reason }
                this.SendRequest(this, "/portal-api/portal/v1/reject-user", "POST", {}, JSON.stringify({ ...reqData }), (_self, data, message) => {
                    sap.ui.core.BusyIndicator.hide();
                    _self.onRejectUserDialog.destroy();
                    sap.m.MessageBox.success(message.Text, {
                        onClose: function () {
                            _self.userApprovalModel.setData(data.userApprovals);
                            sessionStorage.setItem("orginalApprovalDetails", JSON.stringify(data.userApprovals));
                            _self.userApprovalModel.refresh();

                            _self.userModel.setData(data.userDetails);
                            sessionStorage.setItem("orginalUsers", JSON.stringify(data.userDetails));
                            _self.userModel.refresh();
                        }
                    });
                });
            },

            onPressSave: function (oEvent) {
                if (this._handleValidation()) {
                    sap.ui.core.BusyIndicator.show(0);
                    const roles = this.rolesModel.getData();

                    const companyDetails = JSON.parse(JSON.stringify(this.companyDetailModel.getData()));
                    const userDetails = JSON.parse(JSON.stringify(this.userDetailModel.getData()));
                    const gstDetails = JSON.parse(JSON.stringify(this.GSTDetailModel.getData() ?? []));
                    const users = JSON.parse(JSON.stringify(this.userModel.getData() ?? []));
                    const attachmentDetails = JSON.parse(JSON.stringify(this.attachmentModel.getData()));
                    const gstinAddressDetails = JSON.parse(JSON.stringify(this.GSTDetailModel.getData()));
                    //const agentDetails = JSON.parse(JSON.stringify(this.agentCodeDialogModel.getData()));
                    var iataDetails = JSON.parse(JSON.stringify(this.IATADetailModel.getData()));

                    const orginalCompanyDetails = JSON.parse(sessionStorage.getItem("orginalCompanyDetails"));
                    const OrginalUserDetails = JSON.parse(sessionStorage.getItem("orginalUserDetails"));
                    const orginalGSTINDetails = JSON.parse(sessionStorage.getItem("orginalGSTINDetails"));
                    const orginalUsers = JSON.parse(sessionStorage.getItem("orginalUsers"));
                    const orginalAttachmentDetails = JSON.parse(sessionStorage.getItem("orginalAttachmentDetails"));
                    const orginalGSTINAddressDetails = JSON.parse(sessionStorage.getItem("orginalGSTINDetails"));
                   // const orginalAgentCodeDetails = JSON.parse(sessionStorage.getItem("orginalAgentCodeDetails"));
                    const orginalIataDetails = JSON.parse(sessionStorage.getItem("orginalIataDetails"));

                    var companyDiff = this._objectDifference(orginalCompanyDetails, companyDetails);
                    var userDetailsDiff = this._objectDifference(OrginalUserDetails, userDetails);
                    var gstinDiff = this._findDifferenceInGSTIN(orginalGSTINDetails, gstDetails);
                    var gstinAddressDiff = this._findDifferenceInGSTINAddress(orginalGSTINAddressDetails, gstinAddressDetails);
                   // var agentCodeDiff = this._findDifferenceInAgentCode(orginalAgentCodeDetails, agentDetails);
                    var userDiff = this._findDifferenceInUser(orginalUsers, users);
                    var attachmentDiff = this._findDifferenceInAttachment(orginalAttachmentDetails, attachmentDetails);
                    var iataDetailsDiff = this._findDifferenceInIATA(orginalIataDetails, iataDetails);

                    var modifiedData;
                    if (Object.keys(companyDiff).length === 0 && companyDiff.constructor === Object &&
                        Object.keys(userDetailsDiff).length === 0 && userDetailsDiff.constructor === Object &&
                        Object.keys(gstinDiff.deletedItems).length === 0 &&
                        Object.keys(gstinDiff.editedItems).length === 0 &&
                        Object.keys(gstinDiff.addedItems).length === 0 &&
                        Object.keys(iataDetailsDiff.addedItems).length === 0 &&
                        Object.keys(iataDetailsDiff.editedItems).length === 0 &&
                        Object.keys(iataDetailsDiff.deletedItems).length === 0 &&
                        Object.keys(userDiff.editedItems).length === 0 &&
                        Object.keys(attachmentDiff.editedItems).length === 0 &&
                        gstinAddressDiff.editedItems.length === 0 &&
                        gstinAddressDiff.deletedItems.length === 0 &&
                        gstinAddressDiff.addedItems.length === 0) {
                            sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageBox.information(this.oResourceBundle.getText('noChangesToUpdate'));
                    } else {

                        sap.ui.core.BusyIndicator.show(0);

                        gstinAddressDetails.forEach(element => {
                            delete element.addressHistory;
                        });

                        var defaultDetails = {};
                        if (Object.keys(userDetailsDiff).length > 0) {
                            if (userDetailsDiff.hasOwnProperty("DEFAULTPERIOD")) {
                                defaultDetails.DEFAULTPERIOD = userDetailsDiff.DEFAULTPERIOD;
                                delete userDetailsDiff.DEFAULTPERIOD;
                            }
                        }
                        if (roles.ISADMIN) {
                            modifiedData = {
                                companyDetails: companyDiff,
                                userDetails: userDetailsDiff,
                                defaultDetails: defaultDetails,
                                gstinDetails: gstinDiff,
                                gstinAddress: gstinAddressDiff,
                                userRoleDetails: userDiff,
                                attachmentDetails: attachmentDiff,
                                iataDetails: iataDetailsDiff
                            }
                        } else {
                            modifiedData = {
                                userDetails: userDetailsDiff,
                                gstinDetails: gstinDiff,
                                defaultDetails: defaultDetails,
                                gstinAddress: gstinAddressDiff,
                                attachmentDetails: attachmentDiff,
                                iataDetails: iataDetailsDiff
                            }
                        }

                        this.SendRequest(this, "/portal-api/portal/v1/edit-profile", "POST", {}, JSON.stringify(modifiedData), (_self, data, message) => {
                            _self._profileData();
                            sap.ui.core.BusyIndicator.hide();
                            MessageBox.success("Profile updated")
                            _self.getView().getModel().setProperty("/toggleEdit", true);
                        });
                    }
                }
            },

            _objectDifference: function (original, edit) {
                return Object.keys(edit).reduce((diff, key) => {
                    if (original[key] === edit[key]) return diff
                    return {
                        ...diff,
                        [key]: edit[key]
                    }
                }, {})
            },

            _findDifferenceInGSTINAddress: function (originalObj, editedObj) {
                const diff = {};
                var orginalAddresses = [], editedAddresses = [];
                for (var i = 0; i < originalObj.length; i++) {
                    var node = originalObj[i];
                    var addresses = node.address;
                    orginalAddresses = orginalAddresses.concat(addresses);
                }
                for (var i = 0; i < editedObj.length; i++) {
                    var node = editedObj[i];
                    var addresses = node.address;
                    editedAddresses = editedAddresses.concat(addresses);
                }

                const deletedItems = orginalAddresses.filter((originalItem) => {
                    return !editedAddresses.some((editedItem) => editedItem.GSTIN === originalItem.GSTIN && editedItem.SERIALNO === originalItem.SERIALNO);
                });

                const addedItems = editedAddresses.filter((editedItem) => {
                    return !orginalAddresses.some((originalItem) => originalItem.GSTIN === editedItem.GSTIN && originalItem.SERIALNO === editedItem.SERIALNO);
                });

                const editedItems = editedAddresses.filter((editedItem) => {
                    const originalItem = orginalAddresses.find((originalItem) => originalItem.GSTIN === editedItem.GSTIN && originalItem.SERIALNO === editedItem.SERIALNO);
                    return originalItem && !isEqual(originalItem, editedItem);
                });


                function isEqual(objA, objB) {
                    const keysA = Object.keys(objA);
                    const keysB = Object.keys(objB);

                    if (keysA.length !== keysB.length) {
                        return false;
                    }

                    for (const key of keysA) {
                        if (objA[key] !== objB[key]) {
                            return false;
                        }
                    }

                    return true;
                }
                diff.deletedItems = deletedItems;
                diff.editedItems = editedItems;
                diff.addedItems = addedItems;
                return diff;
            },

            _findDifferenceInGSTIN: function (originalObj, editedObj) {
                const diff = {};
                var addedItems = [];
                const deletedItems = [];
                const editedItems = {};

                originalObj.forEach(element => {
                    delete element.PAN;
                    delete element.address;
                    delete element.addressHistory;
                    delete element.deletedItems;
                });

                editedObj.forEach(element => {
                    delete element.PAN;
                    delete element.address;
                    delete element.addressHistory;
                    delete element.deletedItems;
                });

                const originalGSTINs = originalObj.map(item => item.GSTIN);
                const editedGSTINs = editedObj.map(item => item.GSTIN);

                // Find the newly added GSTINs by comparing the arrays
                const addedGSTINs = editedGSTINs.filter(gstin => !originalGSTINs.includes(gstin));
                // Filter objects in editedObj that have newly added GSTIN values
                addedItems = editedObj.filter(item => addedGSTINs.includes(item.GSTIN));

                addedItems.forEach(item => {
                    if (item.PAN) {
                        delete item.PAN;
                    }
                });

                originalObj.forEach((existingItems) => {
                    const ifExists = editedObj.find(
                        (editedObject) => editedObject.GSTIN == existingItems.GSTIN
                    );
                    if (!ifExists) {
                        deletedItems.push(existingItems.GSTIN);
                    } else {
                        const difference = this._objectDifference(existingItems, ifExists);
                        if (Object.keys(difference).length > 0) {
                            editedItems[existingItems.GSTIN] = difference;
                        }
                    }
                });

                diff.deletedItems = deletedItems;
                diff.editedItems = editedItems;
                diff.addedItems = addedItems;
                return diff;
            },
            _findDifferenceInIATA: function (originalObj, editedObj) {
                const diff = {};
                var addedItems = [];
                const deletedItems = [];
                const editedItems = {};

                const originalIATAs = originalObj.map(item => item.IATANUMBER);
                const editedIATAs = editedObj.map(item => item.IATANUMBER);

                // Find the newly added GSTINs by comparing the arrays
                const addedIATAs = editedIATAs.filter(IATANUMBER => !originalIATAs.includes(IATANUMBER));
                // Filter objects in editedObj that have newly added GSTIN values
                addedItems = editedObj.filter(item => addedIATAs.includes(item.IATANUMBER));

                originalObj.forEach((existingItems) => {
                    const ifExists = editedObj.find(
                        (editedObject) => editedObject.IATANUMBER == existingItems.IATANUMBER
                    );
                    if (!ifExists) {
                        deletedItems.push(existingItems.IATANUMBER);
                    } else {
                        const difference = this._objectDifference(existingItems, ifExists);
                        if (Object.keys(difference).length > 0) {
                            editedItems[existingItems.IATANUMBER] = difference;
                        }
                    }
                });

                diff.deletedItems = deletedItems;
                diff.editedItems = editedItems;
                diff.addedItems = addedItems;
                return diff;
            },

            _findDifferenceInUser: function (originalObj, editedObj) {
                const diff = {};
                const editedItems = {};

                originalObj.forEach((existingItems) => {
                    const ifExists = editedObj.find(
                        (editedObject) => editedObject.ID == existingItems.ID
                    );
                    if (ifExists) {
                        const difference = this._objectDifference(existingItems, ifExists);
                        if (Object.keys(difference).length > 0) {
                            editedItems[existingItems.ID] = difference;
                        }
                    }
                });
                diff.editedItems = editedItems;
                return diff;
            },

            _findDifferenceInAttachment: function (originalObj, editedObj) {
                const diff = {};
                const editedItems = {};

                originalObj.forEach((existingItems) => {
                    const ifExists = editedObj.find(
                        (editedObject) => editedObject.ID == existingItems.ID
                    );
                    if (ifExists) {
                        const difference = this._objectDifference(existingItems, ifExists);
                        if (Object.keys(difference).length > 0) {
                            editedItems[existingItems.ID] = difference;
                        }
                    }
                });
                diff.editedItems = editedItems;
                return diff;
            },

            _findDifferenceInAgentCode: function (originalObj, editedObj) {
                
                //Find difference in IATA Code
                const diff = {};

                const deletedItems = originalObj.filter(orgItem => !editedObj.some(editedItem =>
                    orgItem.COMPANYID === editedItem.COMPANYID && orgItem.IATACODE === editedItem.IATACODE
                ));

                const addedItems = [];

                editedObj.forEach(editedItem => {
                    const matchingOrgItem = originalObj.find(orgItem =>
                        orgItem.COMPANYID === editedItem.COMPANYID && orgItem.IATACODE === editedItem.IATACODE
                    );

                    if (!matchingOrgItem) {
                        addedItems.push(editedItem);
                    }
                });

                diff.deletedItems = deletedItems;
                diff.editedItems = [];
                diff.addedItems = addedItems;
                return diff;
            },

            _handleValidation: function () {
                sap.ui.core.BusyIndicator.show(0);
                const roles = this.rolesModel.getData();
                let validate = true;
                var companyValidate = true;
                var UserValidate = true;
                var gstinValidate = true;
                var attachmentValidate = true;
                var IATAValidate = true;
                if((this.category == "08") || (this.category == "05")){
                    if (roles.ISADMIN) {
                        companyValidate = this._validateCompanyDetails(validate);
                        UserValidate = this._validateUserDetails(validate);
                        gstinValidate = this._validateGSTINDetails(validate);
                        validate = companyValidate && UserValidate && gstinValidate;
                    } else{
                        if (roles.CANEDITGST || roles.CANADDGSTIN) {
                            gstinValidate = this._validateGSTINDetails(validate);
                            validate = gstinValidate;
                            // }
                        }else{
                            return validate;
                        }
                    }
                }else if(this.category == "07"){
                    companyValidate = this._validateCompanyDetails(validate);
                    UserValidate = this._validateUserDetails(validate);
                    IATAValidate = this._validateIATADetails(validate);
                    validate = companyValidate && UserValidate && IATAValidate;
                } else{
                if (roles.ISADMIN) {
                    companyValidate = this._validateCompanyDetails(validate);
                    UserValidate = this._validateUserDetails(validate);
                    gstinValidate = this._validateGSTINDetails(validate);
                    attachmentValidate = this._validateAttachmentDetails(validate);
                    if(this.category == "01"){
                        IATAValidate = this._validateIATADetails(validate);
                        validate = companyValidate && UserValidate && gstinValidate && attachmentValidate && IATAValidate;
                   
                    }else{
                    validate = companyValidate && UserValidate && gstinValidate && attachmentValidate;
                    }
                } else {
                    UserValidate = this._validateUserDetails(validate);
                    attachmentValidate = this._validateAttachmentDetails(validate);
                    validate = UserValidate && attachmentValidate;
                    // if (validate) {
                    if (roles.CANEDITGST || roles.CANADDGSTIN) {
                        gstinValidate = this._validateGSTINDetails(validate);
                        if(this.category == "01"){
                        IATAValidate = this._validateIATADetails(validate);
                        validate = gstinValidate && IATAValidate;;
                        }else{
                            validate = gstinValidate;
                        }
                        // }
                    }
                }
                sap.ui.core.BusyIndicator.hide();
                return validate;
                }
                sap.ui.core.BusyIndicator.hide();
                return validate;
            },

            _validateInput: function (sId, sValue, errorMessage, validationFunction, validationErrorMessage) {
                if (!sValue || sValue.trim().length === 0) {
                    sId.setValueState("Error").setValueStateText(errorMessage);
                    return false;
                } else if (validationFunction && !validationFunction(sValue)) {
                    sId.setValueState("Error").setValueStateText(validationErrorMessage);
                    return false;
                }
                sId.setValueState("None");
                return true;
            },

            _validateCompanyDetails: function (validate) {
                if(this.category == "07"){
                var companyDetails = [
                    { id: "inp-address", message: this.oResourceBundle.getText('addressRequired') },
                    { id: "sel-country", message: this.oResourceBundle.getText('countryRequired') },
                    { id: "inp-city", message: this.oResourceBundle.getText('cityRequired') },
                    {
                        id: "inp-pinCode",
                        message: this.oResourceBundle.getText('pinCodeRequired'),
                        // validationFunction: validations.validatePincode,
                        // validationErrorMessage: this.oResourceBundle.getText('invalidPANFormat')
                    },
                    {
                        id: "inp-companyPhone",
                        message: this.oResourceBundle.getText('mobileRequired'),
                        validationFunction: validations.validatePhone,
                        validationErrorMessage: this.oResourceBundle.getText('invalidMobileFormat')
                    }
                ];
                }else{
                    var companyDetails = [
                        { id: "inp-address", message: this.oResourceBundle.getText('addressRequired') },
                        { id: "sel-country", message: this.oResourceBundle.getText('countryRequired') },
                        { id: "inp-city", message: this.oResourceBundle.getText('cityRequired') },
                        {
                            id: "inp-pinCode",
                            message: this.oResourceBundle.getText('pinCodeRequired'),
                             validationFunction: validations.validatePincode,
                             validationErrorMessage: this.oResourceBundle.getText('invalidPINFormat')
                        },
                        {
                            id: "inp-companyPhone",
                            message: this.oResourceBundle.getText('mobileRequired'),
                            validationFunction: validations.validatePhone,
                            validationErrorMessage: this.oResourceBundle.getText('invalidMobileFormat')
                        }
                    ];
                }

                for (const item of companyDetails) {
                    var value;
                    if (item.id === "sel-country") {
                        value = this.byId(item.id).getSelectedKey();
                    } else if (item.id === "inp-pinCode" || item.id === "inp-companyPhone") {
                        value = this.byId(item.id).getDOMValue() ?? this.byId(item.id).getValue();
                    } else {
                        value = this.byId(item.id).getValue()
                    }
                    validate = this._validateInput(this.byId(item.id), value, item.message, item.validationFunction, item.validationErrorMessage) && validate;
                }
                if (validate) {
                    return true;
                } else {
                    // this.byId("objs-companyDet").focus();
                    return false
                }
            },

            _validateUserDetails: function (validate) {
            

                const userDetails = [
                    { id: "sel-title", message: this.oResourceBundle.getText('titleRequired') },
                    { id: "inp-firstName", message: this.oResourceBundle.getText('firstNameRequired') },
                    { id: "inp-lastName", message: this.oResourceBundle.getText('lastNameRequired') },
                    {
                        id: "inp-userMobile",
                        message: this.oResourceBundle.getText('mobileRequired'),
                        validationFunction: validations.validatePhone,
                        validationErrorMessage: this.oResourceBundle.getText('invalidMobileFormat')
                    }
                ];

                for (const item of userDetails) {
                    var value;
                    if (item.id === "sel-title") {
                        value = this.byId(item.id).getSelectedKey();
                    } else if (item.id === "inp-userMobile") {
                        value = this.byId(item.id).getDOMValue() ?? this.byId(item.id).getValue();
                    } else {
                        value = this.byId(item.id).getValue()
                    }
                    validate = this._validateInput(this.byId(item.id), value, item.message, item.validationFunction, item.validationErrorMessage) && validate;
                }

                if (validate) {
                    return true;
                } else {
                    // this.byId("objs-companyDet").focus();
                    return false
                }
            },

            _validateGSTINDetails: function (validate) {
                const GSTINList = this.GSTDetailModel.getData();

                if (GSTINList.length === 0) {
                    this._showMessageStrip('oVerticalContentGSTIN', 'msgStripGSTDetails', this.oResourceBundle.getText('GSTINRequired'), 'E');
                    validate = false;
                } else {
                    this._hideMessageStrip(`msgStripGSTDetails`);

                    if (!GSTINList.some(doc => doc.DEFAULT)) {
                        if((this.category == "08") || (this.category == "05")){
                        this._showMessageStrip('oVerticalContentGSTIN', 'msgStripGSTDetails', this.oResourceBundle.getText('defaultUINRequired'), 'E');
                        }else{
                        this._showMessageStrip('oVerticalContentGSTIN', 'msgStripGSTDetails', this.oResourceBundle.getText('defaultGSTINRequired'), 'E');
                        }
                        validate = false;
                    } else {
                        this._hideMessageStrip(`msgStripGSTDetails`);
                    }
                }

                if (validate) {
                    return true;
                } else {
                    return false
                }
            },

            _validateIATADetails: function (validate) {
                const IATAList = this.IATADetailModel.getData();

                if (IATAList.length === 0) {
                    this._showMessageStrip('oVerticalContentIATA', 'msgStripIATADetails', this.oResourceBundle.getText('oneIATARequired'), 'E');
                    validate = false;
                } else {
                    this._hideMessageStrip(`msgStripIATADetails`);
                }

                if (validate) {
                    return true;
                } else {
                    return false
                }
            },

            _validateAttachmentDetails: function (validate) {
                const attachmentTableData = this.attachmentModel.getData();

                for (let i = 0; i < attachmentTableData.length; i++) {
                    const doc = attachmentTableData[i];
                    const currentDate = new Date();
                    if (doc.ISMANDATORY === true && (doc.FILE === "" || doc.FILE === null)) {
                        let msgText = this.oResourceBundle.getText('msgUploadMandatoryDoc').replace('%s', `${doc.DOCUMENTTYPECODE} - ${doc.DOCUMENTNAME}`);
                        this._showMessageStrip('oVerticalContent', `msgStrip${doc.DOCUMENTTYPECODE}`, msgText, 'E');
                        validate = false;
                    } else {
                        this._hideMessageStrip(`msgStrip${doc.DOCUMENTTYPECODE}`);
                    }

                    if (doc.ISSUEDON && !validations.validateDate(doc.ISSUEDON)) {
                        let msgText = this.oResourceBundle.getText('msgInvalidDateFormat').replace('%s', `${doc.DOCUMENTTYPECODE} - ${doc.DOCUMENTNAME}`);
                        this._showMessageStrip('oVerticalContent', `msgStripDate${doc.DOCUMENTTYPECODE}`, msgText, 'E');
                        validate = false;
                    } else {
                        var issueDate = new Date(doc.ISSUEDON);

                        if (issueDate > currentDate) {
                            validate = false;
                            let msgText = this.oResourceBundle.getText('msgIsuueDateValidation').replace('%s', `${doc.DOCUMENTTYPECODE} - ${doc.DOCUMENTNAME}`);
                            this._showMessageStrip('oVerticalContent', `msgStroIssuedOn${doc.DOCUMENTTYPECODE}`, msgText, 'E');
                        } else {
                            this._hideMessageStrip(`msgStroIssuedOn${doc.DOCUMENTTYPECODE}`);
                        }
                    }

                    if (doc.VALIDFROM && !validations.validateDate(doc.VALIDFROM)) {
                        let msgText = this.oResourceBundle.getText('msgInvalidDateFormat').replace('%s', `${doc.DOCUMENTTYPECODE} - ${doc.DOCUMENTNAME}`);
                        this._showMessageStrip('oVerticalContent', `msgStripDate${doc.DOCUMENTTYPECODE}`, msgText, 'E');
                        validate = false;
                    } else {
                        this._hideMessageStrip(`msgStripDate${doc.DOCUMENTTYPECODE}`);
                    }

                    if (doc.VALIDTO && !validations.validateDate(doc.VALIDTO)) {
                        let msgText = this.oResourceBundle.getText('msgInvalidDateFormat').replace('%s', `${doc.DOCUMENTTYPECODE} - ${doc.DOCUMENTNAME}`);
                        this._showMessageStrip('oVerticalContent', `msgStripDate${doc.DOCUMENTTYPECODE}`, msgText, 'E');
                        validate = false;
                    } else {
                        this._hideMessageStrip(`msgStripDate${doc.DOCUMENTTYPECODE}`);
                    }

                    if (doc.VALIDTO && doc.VALIDFROM) {
                        var validFromDate = new Date(doc.VALIDFROM);
                        var validToDate = new Date(doc.VALIDTO);

                        if (validFromDate < validToDate) {
                        } else if (validFromDate > validToDate) {
                            validate = false;
                            let msgText = this.oResourceBundle.getText('msgValidFromToDate').replace('%s', `${doc.DOCUMENTTYPECODE} - ${doc.DOCUMENTNAME}`);
                            this._showMessageStrip('oVerticalContent', `msgStripDate${doc.DOCUMENTTYPECODE}`, msgText, 'E');
                        } else {
                            validate = false;
                            let msgText = this.oResourceBundle.getText('msgValidFromToDateSame').replace('%s', `${doc.DOCUMENTTYPECODE} - ${doc.DOCUMENTNAME}`);
                            this._showMessageStrip('oVerticalContent', `msgStripDate${doc.DOCUMENTTYPECODE}`, msgText, 'E');
                        }
                    }
                }

                if (validate) {
                    return true;
                } else {
                    // this.byId("objs-attachmentDet").focus();
                    return false
                }
            },

            _showMessageStrip: function (oVCId, msgStripId, msgStripText, msgType) {
                let oVC = this.byId(oVCId) ?? sap.ui.getCore().byId(oVCId);
                let messageType;
                switch (msgType) {
                    case 'E':
                        messageType = "Error";
                        break;
                    case 'W':
                        messageType = "Warning";
                        break;
                    case 'I':
                    default:
                        messageType = "Information";
                        break;
                }
                let oMsgStrip = sap.ui.getCore().byId(`${msgStripId}`);
                if (oMsgStrip) {
                    oMsgStrip.destroy();
                }
                oMsgStrip = new sap.m.MessageStrip(`${msgStripId}`, {
                    text: `${msgStripText}`,
                    showCloseButton: true,
                    showIcon: true,
                    type: `${messageType}`
                });
                oVC.addContent(oMsgStrip);
            },

            _hideMessageStrip: function (msgStripId) {
                let oMsgStrip = sap.ui.getCore().byId(`${msgStripId}`);
                if (oMsgStrip) {
                    oMsgStrip.destroy();
                }
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

            setCountryDesc: function (sValue) {
                const countryArr = this.masterDataModel.getData().country;
                return formatter.setDescription(sValue, countryArr);
            },

            setStateDesc: function (sValue) {
                const stateArr = this.masterDataModel.getData().states;
                return formatter.setDescription(sValue, stateArr);
            },

            onAddIataCodes: function (oEvent) {
                this.oAgentCodeDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.agentCodeDialog", this);
                this.getView().addDependent(this.oAgentCodeDialog);
                this.oAgentCodeDialog.open();
            },

            onAddNewIATACode: function () {
                const toAgentCodes = this.getView().getModel("agentCodeDialogModel").getProperty('/');
                let isValidated = true;
                if (toAgentCodes.length > 0) {
                    isValidated = toAgentCodes.every(element => element.IATACODE)
                }
                if (isValidated) {
                    if (!toAgentCodes) {
                        this.getView().getModel("agentCodeDialogModel").setProperty('/', [{
                            IATACODE: ""
                        }]);
                    } else {
                        this.getView().getModel("agentCodeDialogModel").getProperty('/').push({
                            IATACODE: ""
                        });
                    }
                    let count = this.getView().getModel("agentCodeDialogModel").getProperty('/').length;
                    sap.ui.getCore().byId("tbl-agentCode").setVisibleRowCount(count);
                    sap.ui.getCore().byId("lbl-agentCodeDialog").setText(`IATA Code (${count})`);
                    this.getView().getModel("agentCodeDialogModel").refresh();
                } else {
                    MessageToast.show("Please fill in the Agent Code and add another");
                }
            },

            onDeleteIATACode: function (oEvent) {
                var row = oEvent.getSource();
                var idx = oEvent.getSource().getBindingContext("agentCodeDialogModel").getPath()
                idx = idx.split("/")[1];
                if (idx !== -1) {
                    var model = this.getView().getModel("agentCodeDialogModel");
                    var data = model.getData();
                    data.splice(idx, 1);
                    model.setData(data);
                }
                let count = this.getView().getModel("agentCodeDialogModel").getProperty('/').length;
                sap.ui.getCore().byId("tbl-agentCode").setVisibleRowCount(count);
                sap.ui.getCore().byId("lbl-agentCodeDialog").setText(`IATA Code (${count})`);
            },

            onCloseAgentCodeDialog: function (oEvent) {
                const toAgentCodes = this.getView().getModel("agentCodeDialogModel").getProperty('/');
                let isValidated = true;
                if (toAgentCodes.length > 0) {
                    isValidated = toAgentCodes.every(element => element.IATACODE);
                    var valueArr = toAgentCodes.map(function (item) { return item.IATACODE });
                    var isDuplicate = valueArr.some(function (item, idx) {
                        return valueArr.indexOf(item) != idx
                    });
                    if (isValidated) {
                        if (!isDuplicate) {
                            const iataCode = this.byId("inp-iataCode");
                            if (iataCode.getValue() != "") {
                                iataCode.setValueState("None");
                            }
                            this.oAgentCodeDialog.destroy();
                        } else {
                            MessageToast.show("Duplicate Agent Code Found");
                        }
                    } else {
                        MessageToast.show("Please fill in the Agent Code");
                    }
                } else {
                    this.oAgentCodeDialog.destroy();
                }
                /** Make MultiInput as Non editable */
                const sId = this.byId("inp-iataCode");
                sId.setEditable(false);
               // sId.getAggregation("tokenizer").setEditable(false)
            },
             /**Add IATA Based on Inputted IATA */
             onPressAddIATA: function () {
                const iata = this.byId("inp-iataCode").getValue();
                sap.ui.core.BusyIndicator.show();
                this.SendRequest(this, "/portal-api/portal/v1/get-iata-list", "GET", {}, null, (_self, data, message) => {
                    if (data) {
                        if (data.IATA) {
                            data = data.IATA;
                            var IATAList = this.IATADetailModel.getData();
                            if (IATAList.length > 0) {
                                const uniqueIATANumbers = new Set(IATAList.map(item => item.IATANUMBER));
                                // Filter and remove duplicates in gstinarr
                                const filteredIataarr = data.filter(item => !uniqueIATANumbers.has(item.IATANUMBER));
                                _self.iataListModel.setData(filteredIataarr);
                            } else {
                                _self.iataListModel.setData(data);
                            }
                            if (!this.iataListDialog) {
                                this.iataListDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.iataList", this);
                            }
                            this.getView().addDependent(this.iataListDialog);
                            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.iataListDialog);
                            _self.iataListDialog.open();
                        }
                    }
                    sap.ui.core.BusyIndicator.hide();
                });
            },

            /** After selecting IATA */
            onSelectIATAList: function (oEvent) {
                const selIATAs = oEvent.getParameter("selectedItems");
                this.iataaddflag = false;
                if (selIATAs) {
                    sap.ui.core.BusyIndicator.show();
                    var arrIATA = [];
                    if (selIATAs.length > 0) {
                        for (let i = 0; i < selIATAs.length; i++) {
                            arrIATA.push(selIATAs[i].getTitle());
                        }
                        this.SendRequest(this, "/portal-api/portal/v1/iata-details", "POST", {}, JSON.stringify(arrIATA), (_self, data, message) => {
                            if (data) {
                                if (data.IATADetails) {

                                    data = data.IATADetails;

                                    // const currentDate = new Date();
                                    // const year = currentDate.getFullYear();
                                    // const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based, so we add 1
                                    // const day = currentDate.getDate().toString().padStart(2, '0');

                                    // const formattedDate = `${year}-${month}-${day}`;
                                    // data.forEach(element => {
                                    //     element.address = [{
                                    //         TYPE: "Principal",
                                    //         GSTIN: element.GSTIN,
                                    //         USEFORINVOICEPRINTING: true,
                                    //         STATE: element.STATE,
                                    //         CITY: element.CITY,
                                    //         PINCODE: element.PINCODE,
                                    //         EFFECTIVEFROM: formattedDate,
                                    //         SERIALNO: 1
                                    //     }]
                                    // });

                                    const iataList = _self.IATADetailModel.getData();
                                    if (iataList.length > 0) {
                                        _self.IATADetailModel.getData().push(...data);
                                    } else {
                                        _self.IATADetailModel.setData(data);
                                    }

                                    _self._hideMessageStrip(`msgStripIATADetails`);

                                    _self.IATADetailModel.refresh();
                                }
                            }
                            sap.ui.core.BusyIndicator.hide();
                        });
                    }
                }
            },

            onSearchIATAPress: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("IATANUMBER", FilterOperator.Contains, sValue);
                var oBinding = oEvent.getParameter("itemsBinding");
                oBinding.filter([oFilter]);
            },

            onDeleteIATAPress: function (oEvent) {
                const oIndex = oEvent.getParameter("row").getIndex(),
                    oTable = this.byId("idIATADetailsTable"),
                    oObject = oTable.getContextByIndex(oIndex).getObject();
                var _self = this;
                MessageBox.confirm("Are you sure you want to delete this item?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            // Delete the item from the model
                            _self.IATADetailModel.getData().splice(oIndex, 1);
                            _self._hideMessageStrip(`msgStrip${oObject.IATANUMBER}`);
                            _self.IATADetailModel.refresh();
                        }
                    }
                });
            },
            onpresshintcompany: function (oEvent) {
                var _self = this;
                if(this.oRouter.oHashChanger.hash == "userProfile/ "){
                var oPopover = new sap.m.Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "Users are granted access to review all provisions and make edits to company details, excluding the following fields: category, company PAN, and country. \n\n Functionality \n View - Comprehensive visibility into all provisions related to the company. \n Edit - Modification privileges for various company details, excluding category, company PAN, and country.\n\n Note - Editing of category, company PAN, and country is restricted in this section to maintain data integrity.",
                        }),   
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
               //this.getView().addContent(oEvent.getSource());
            }
            },
            onpresshintuserinfo: function (oEvent) {
                var _self = this;
                if(this.oRouter.oHashChanger.hash == "userProfile/ "){
                var oPopover = new sap.m.Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "Within this section, users can seamlessly view all provisions and edit their user information, excluding the Login Email Address. Additionally, details such as the Last Logged On and Last Failed Login Date are accessible for reference.\n\n Functionality \n View - Access to all provisions related to user information.\n Edit - Modification capabilities for user information, excluding the Login Email Address.\n Details - Real-time tracking of Last Logged On and Last Failed Login Date.\n\n Note - The Login Email Address remains secure from edits to ensure authentication integrity.",
                        }),   
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            }
            },
            onpresshintgstdetails: function (oEvent) {
                var _self = this;
                if(this.oRouter.oHashChanger.hash == "userProfile/ "){
                var oPopover = new sap.m.Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "This section allows direct manipulation of GSTIN details associated with the Company PAN. Exercise caution while using the following functionalities-\n View - Delve into intricate details of the linked GSTIN.\n Edit - Modify GSTIN details directly – proceed with care.\n Delete - A powerful option; be certain before eliminating GSTIN entries.\n Export - Extract GSTIN details in Excel format; handle with discretion. ",
                        }),   
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            }
            },
            onpresshintiatadetails: function (oEvent) {
                var _self = this;
                if(this.oRouter.oHashChanger.hash == "userProfile/ "){
                var oPopover = new sap.m.Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "This section allows users to access and manage IATA details, including the ability to add, delete, and export information in Excel format.\n\n Functionality \n View - Users can review IATA details for reference.\n Delete - Users have the option to remove specific IATA entries.\n Export - Data export feature in Excel format for convenient external use.\n\n Note - Effective control over IATA details is provided, allowing users to maintain and organize information as needed.",
                        }),   
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            }
            },
            onpresshinttcsdetails: function (oEvent) {
                var _self = this;
                if(this.oRouter.oHashChanger.hash == "userProfile/ "){
                var oPopover = new sap.m.Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "User can view TCS details.\n\n You can export all your TCS details as a CSV file. ",
                        }),   
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            }
            },
            onpresshintsubusers: function (oEvent) {
                var _self = this;
                if(this.oRouter.oHashChanger.hash == "userProfile/ "){
                var oPopover = new sap.m.Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "This section facilitates users to access details about sub-users and grant necessary approvals. The admin user holds the authority to block sub-users.\n\n Functionality \n View - Comprehensive details about sub-users are accessible. \n Approvals - Grant required approvals to sub-users as needed.\n Block - Admin user exclusive function to block specific sub-users.\n\n Note - Admin users possess the power to manage sub-user activities, including approval grants and user blocks for enhanced control. ",
                        }),   
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            }
            },
            onpresshintapprovals: function (oEvent) {
                var _self = this;
                if(this.oRouter.oHashChanger.hash == "userProfile/ "){
                var oPopover = new sap.m.Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "In this section, the admin user has the ability to either approve or reject user requests.\n\n Functionality \n Approve - Admin can green-light requested users based on validation.\n Reject - Admin holds the authority to decline user requests.\n\n Note - Admin users play a crucial role in ensuring the approval or rejection of requested users, contributing to streamlined user management. ",
                        }),   
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            }
            },
            onpresshintattachments: function (oEvent) {
                var _self = this;
                if(this.oRouter.oHashChanger.hash == "userProfile/ "){
                var oPopover = new sap.m.Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "This section empowers users to effortlessly view and upload necessary documents in formats such as JPG, JPEG, PNG, DOCX, or PDF, with a file size limit of 400 KB. The option to delete documents is also provided.\n\n Functionality \n View - Conveniently review uploaded documents.\n Upload - Add essential documents in supported formats (JPG, JPEG, PNG, DOCX, PDF) with a file size limit of 400 KB.\n Delete - Remove documents as needed.\n\n Note - Ensure compliance with file formats and size limits for seamless document management.",
                        }),   
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            }
            }           


        });
    }
);