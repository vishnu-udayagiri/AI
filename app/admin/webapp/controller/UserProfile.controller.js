sap.ui.define(
    ["sap/ui/core/mvc/Controller",
        "sap/m/MessageBox",
        "sap/ui/Device",
        "admindashboard/model/validations",
        "admindashboard/model/formatter",
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,
        MessageBox,
        Device, validations, formatter
       ) {
        "use strict";
     
      
        return Controller.extend("admindashboard.controller.UserProfile", {
            validations: validations,
            formatter: formatter,
            
            onAfterRendering: function () {
            },
            onInit: function () {
                this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                this.SendRequest = this.getOwnerComponent().SendRequest;
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("UserProfile").attachPatternMatched(this._routeMatched, this);

                // this.attachmentModel = new JSONModel();
                // this.getView().setModel(this.attachmentModel, "attachmentModel");

                // this.masterDataModel = new JSONModel();
                // this.getView().setModel(this.masterDataModel, "masterDataModel");

                // this.companyDetailModel = new JSONModel();
                // this.getView().setModel(this.companyDetailModel, "companyDetailModel");

                // this.TCSDetailModel = new JSONModel();
                // this.getView().setModel(this.TCSDetailModel, "TCSDetailModel");

                // this.rolesModel = new JSONModel({});
                // this.getView().setModel(this.rolesModel, "rolesModel");

                // this.userDetailModel = new JSONModel();
                // this.getView().setModel(this.userDetailModel, "userDetailModel");

                // this.GSTDetailModel = new JSONModel([]);
                // this.getView().setModel(this.GSTDetailModel, "GSTDetailModel");

                // this.userApprovalModel = new JSONModel([]);
                // this.getView().setModel(this.userApprovalModel, "userApprovalModel");

                // this.attachmentModel = new JSONModel([]);
                // this.getView().setModel(this.attachmentModel, "attachmentModel");

                // this.userModel = new JSONModel([]);
                // this.getView().setModel(this.userModel, "userModel");

                // this.userRequestModel = new JSONModel([]);
                // this.getView().setModel(this.userRequestModel, "userRequestModel");

                // this.masterDataModel = new JSONModel();
                // this.getView().setModel(this.masterDataModel, "masterDataModel");

                // this.gstinListModel = new JSONModel();
                // this.getView().setModel(this.gstinListModel, "gstinListModel");

                // // toggling
                // this.configModel = new JSONModel();
                // this.getView().setModel(this.configModel);

                // this.getView().getModel().setProperty("/toggleEdit", true);
                // this.jwt = sessionStorage.getItem("jwt")

                // if (!this.jwt) {
                //     window.location.replace('/portal/index.html');
                // }
            },
            _routeMatched: function (oEvent) {
                // var decodedData;
                // if (this.jwt) {
                //     decodedData = JSON.parse(atob(this.jwt.split('.')[1]));
                //     this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", "Welcome, " + decodedData.FirstName + ' ' + decodedData.LastName);
                // }
                // // this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                // // this.getOwnerComponent().getModel("shellModel").setProperty("/title", "Profile");
                // this.companyProfileModel = new JSONModel();

                // sap.ui.core.BusyIndicator.show();
                // this.SendRequest(this, "/portal-api/public/v1/fetch-master-data", "GET", {}, null, (_self, data, message) => {
                //     _self.getView().getModel("masterDataModel").setData(data);
                //     _self.getView().getModel("attachmentModel").setData(data.attachment);
                //     _self._profileData();
                //     // sap.ui.core.BusyIndicator.hide();

                //     jQuery.sap.require("sap.ui.model.json.JSONModel");
                //     var oViewModel = new sap.ui.model.json.JSONModel({
                //         maxDate: new Date()
                //     });

                //     this.getView().setModel(oViewModel, "viewModel");

                // });
            }
//             onPressEdit: function () {
//                 this.getView().getModel().setProperty("/toggleEdit", false);
//             },
//             onPressCancel: function () {
//                 var _self = this;

//                 // Show a confirmation message box
//                 sap.m.MessageBox.confirm("Are you sure you want to cancel?", {
//                     title: "Confirm",
//                     actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
//                     onClose: function (oAction) {
//                         if (oAction === sap.m.MessageBox.Action.OK) {
//                             // User clicked OK, perform the cancel operation
//                             _self.getView().getModel().setProperty("/toggleEdit", true);
//                             const orginalCompanyDetails = JSON.parse(sessionStorage.getItem("orginalCompanyDetails"));
//                             const orginalUserDetails = JSON.parse(sessionStorage.getItem("orginalUserDetails"));
//                             const orginalGSTINDetails = JSON.parse(sessionStorage.getItem("orginalGSTINDetails"));
//                             const orginalTCSDetails = JSON.parse(sessionStorage.getItem("orginalTCSDetails"));
//                             const orginalUsers = JSON.parse(sessionStorage.getItem("orginalUsers"));
//                             const orginalRequestsDetails = JSON.parse(sessionStorage.getItem("orginalRequestsDetails"));
//                             const orginalApprovalDetails = JSON.parse(sessionStorage.getItem("orginalApprovalDetails"));
//                             const orginalAttachmentDetails = JSON.parse(sessionStorage.getItem("orginalAttachmentDetails"));

//                             _self.companyDetailModel.setData(orginalCompanyDetails);
//                             _self.userDetailModel.setData(orginalUserDetails);
//                             _self.GSTDetailModel.setData(orginalGSTINDetails);
//                             _self.TCSDetailModel.setData(orginalTCSDetails);
//                             _self.userModel.setData(orginalUsers);
//                             _self.userRequestModel.setData(orginalRequestsDetails);
//                             _self.userApprovalModel.setData(orginalApprovalDetails);
//                             _self.attachmentModel.setData(orginalAttachmentDetails);
//                         }
//                     }
//                 });
//             },
//             _profileData: function () {

//                 this.SendRequest(this, "/portal-api/portal/v1/get-profile-details", "GET", {}, null, (_self, data, message) => {

//                     this.companyDetailModel.setData(data.companyDetails);
//                     sessionStorage.setItem("orginalCompanyDetails", JSON.stringify(data.companyDetails));

//                     this.userDetailModel.setData(data.userDetails);
//                     sessionStorage.setItem("orginalUserDetails", JSON.stringify(data.userDetails));

//                     this.GSTDetailModel.setData(data.GSTDetails);
//                     sessionStorage.setItem("orginalGSTINDetails", JSON.stringify(data.GSTDetails));

//                     this.TCSDetailModel.setData(data.TCSDetails);
//                     sessionStorage.setItem("orginalTCSDetails", JSON.stringify(data.tcsDetails));

//                     this.userModel.setData(data.users);
//                     sessionStorage.setItem("orginalUsers", JSON.stringify(data.users ?? []));

//                     this.userRequestModel.setData(data.userRequest);
//                     sessionStorage.setItem("orginalRequestsDetails", JSON.stringify(data.userRequest ?? []));

//                     this.userApprovalModel.setData(data.userApprovals);
//                     sessionStorage.setItem("orginalApprovalDetails", JSON.stringify(data.userApprovals ?? []));

//                     this.attachmentModel.setData(data.attachments);
//                     sessionStorage.setItem("orginalAttachmentDetails", JSON.stringify(data.attachments ?? []));

//                     this.rolesModel.setData(data.roles);

//                     this.byId("ObjectPageLayout").setVisible(true);

//                     sap.ui.core.BusyIndicator.hide();
//                 });

//             },
//             onButtonShowPanPress: function (oEvent) {
//                 const companyProfileData = this.companyProfileModel.getData();
//                 const companyPanAttachment = companyProfileData.COMPANYPANATTACHMENT;
//                 this.openPdfOrImageInNewWindow("Company - PAN", companyPanAttachment);
//             },
//             onButtonShowTANPress: function (oEvent) {
//                 const companyProfileData = this.companyProfileModel.getData();
//                 const companyTanAttachment = companyProfileData.COMPANYTANATTACHMENT;
//                 this.openPdfOrImageInNewWindow("Company - TAN", companyTanAttachment);
//             },
//             openPdfOrImageInNewWindow: function (title, base64Data) {
//                 if (base64Data) {
//                     var typeBase64 = base64Data.split(',')[0];
//                     var type = "";

//                     if (typeBase64.match(/pdf/i)) {
//                         type = "pdf";
//                     } else if (typeBase64.match(/jpeg|jpg|png/i)) {
//                         type = "image";
//                     }

//                     if (type === "pdf" || type === "image") {
//                         var newWindow = window.open();
//                         newWindow.document.title = title;
//                         var heading = document.createElement('h5');
//                         heading.textContent = title;
//                         var iframe = document.createElement('iframe');
//                         iframe.src = base64Data;
//                         iframe.width = "100%";
//                         iframe.height = "100%";
//                         newWindow.document.body.appendChild(heading);
//                         newWindow.document.body.appendChild(iframe);
//                     } else {
//                         const link = document.createElement('a');
//                         link.href = base64Data;
//                         link.download = title;
//                         link.click();
//                     }
//                 } else {
//                     sap.m.MessageBox.warning(title + "");
//                 }
//             },
//             createColumnConfig: function () {
//                 return [
//                     {
//                         "label": "GSTIN",
//                         "property": "GSTIN",
//                         "type": "EdmType.String"
//                     },
//                     {
//                         "label": "GSTTYPE",
//                         "property": "GSTTYPE",
//                         "type": "EdmType.String"
//                     },
//                     // {
//                     //     "label": "ISECOMMERCEOPERATOR",
//                     //     "property": "ISECOMMERCEOPERATOR",
//                     //     "type": "EdmType.String"
//                     // },
//                     // {
//                     //     "label": "ISREGISTEREDFORGSTASSEZUNIT",
//                     //     "property": "ISREGISTEREDFORGSTASSEZUNIT",
//                     //     "type": "EdmType.String"
//                     // },
//                     // {
//                     //     "label": "ISREGISTEREDFORGSTASPSUUNIT",
//                     //     "property": "ISREGISTEREDFORGSTASPSUUNIT",
//                     //     "type": "EdmType.String"
//                     // },
//                     {
//                         "label": "DATEOFISSUEGST",
//                         "property": "DATEOFISSUEGST",
//                         "type": "EdmType.String"
//                     },
//                     // {
//                     //     "label": "GSTCERTIFICATE",
//                     //     "property": "GSTCERTIFICATE",
//                     //     "type": "EdmType.String"
//                     // },
//                     {
//                         "label": "DEFAULT",
//                         "property": "DEFAULT",
//                         "type": "EdmType.String"
//                     },
//                     {
//                         "label": "ARNNO",
//                         "property": "ARNNO",
//                         "type": "EdmType.String"
//                     },
//                     {
//                         "label": "DATEOFISSUEARN",
//                         "property": "DATEOFISSUEARN",
//                         "type": "EdmType.String"
//                     },
//                     // {
//                     //     "label": "ARNCERTIFICATE",
//                     //     "property": "ARNCERTIFICATE",
//                     //     "type": "EdmType.String"
//                     // },
//                     {
//                         "label": "ADDRESS",
//                         "property": "ADDRESS",
//                         "type": "EdmType.String"
//                     },
//                     {
//                         "label": "STATE",
//                         "property": "STATE",
//                         "type": "EdmType.String"
//                     },
//                     {
//                         "label": "CITY",
//                         "property": "CITY",
//                         "type": "EdmType.String"
//                     },
//                     {
//                         "label": "PINCODE",
//                         "property": "PINCODE",
//                         "type": "EdmType.String"
//                     },
//                     {
//                         "label": "STATUS",
//                         "property": "STATUS",
//                         "type": "EdmType.String"
//                     }
//                 ];
//             },

//             onExportGstin: function () {
//                 var aCols, oBinding, oSettings, oSheet, oTable;

//                 oTable = this.byId('idGSTDetailsTable');
//                 oBinding = oTable.getBinding('rows');
//                 aCols = this.createColumnConfig();

//                 oSettings = {
//                     workbook: { columns: aCols },
//                     dataSource: oBinding
//                 };

//                 oSheet = new Spreadsheet(oSettings);
//                 oSheet.build()
//                     .then(function () {
//                     }).finally(function () {
//                         oSheet.destroy();
//                     });
//             },

//             /**Add GSTIN Based on Inputted PAN */
//             onPressAddGstin: function () {
//                 const selPan = this.byId("inp-companyPAN").getValue();
//                 sap.ui.core.BusyIndicator.show();
//                 this.SendRequest(this, "/portal-api/portal/v1/pan-gstin", "GET", {}, null, (_self, data, message) => {
//                     if (data) {
//                         if (data.GSTINS) {
//                             data = data.GSTINS;
//                             var GSTINList = this.GSTDetailModel.getData();
//                             if (GSTINList.length > 0) {
//                                 const uniqueGSTNumbers = new Set(GSTINList.map(item => item.GSTIN));
//                                 // Filter and remove duplicates in gstinarr
//                                 const filteredGstinarr = data.filter(item => !uniqueGSTNumbers.has(item.GSTIN));
//                                 _self.gstinListModel.setData(filteredGstinarr);
//                             } else {
//                                 _self.gstinListModel.setData(data);
//                             }
//                             if (!this.gstinListDialog) {
//                                 this.gstinListDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.gstinList", this);
//                             }
//                             this.getView().addDependent(this.gstinListDialog);
//                             jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.gstinListDialog);
//                             _self.gstinListDialog.open();
//                         }
//                     }
//                     sap.ui.core.BusyIndicator.hide();
//                 });
//             },

//             /** After selecting GSTIN */
//             onSelectGSTINList: function (oEvent) {
//                 const selGSTINs = oEvent.getParameter("selectedItems");
//                 if (selGSTINs) {
//                     sap.ui.core.BusyIndicator.show();
//                     var arrGSTIN = [];
//                     if (selGSTINs.length > 0) {
//                         for (let i = 0; i < selGSTINs.length; i++) {
//                             arrGSTIN.push(selGSTINs[i].getTitle());
//                         }
//                         this.SendRequest(this, "/portal-api/portal/v1/gstin-details", "POST", {}, JSON.stringify(arrGSTIN), (_self, data, message) => {
//                             if (data) {
//                                 if (data.GSTINDetails) {
//                                     data = data.GSTINDetails;
//                                     const gstinList = _self.GSTDetailModel.getData();
//                                     if (gstinList.length > 0) {
//                                         _self.GSTDetailModel.getData().push(...data);
//                                     } else {
//                                         _self.GSTDetailModel.setData(data);
//                                     }
//                                     _self._hideMessageStrip(`msgStripGSTDetails`);


//                                     _self.GSTDetailModel.refresh();
//                                 }
//                             }
//                             sap.ui.core.BusyIndicator.hide();
//                         });
//                     }
//                 }
//             },

//             onSearchGSTINPress: function (oEvent) {
//                 var sValue = oEvent.getParameter("value");
//                 var oFilter = new Filter("GSTIN", FilterOperator.Contains, sValue);
//                 var oBinding = oEvent.getParameter("itemsBinding");
//                 oBinding.filter([oFilter]);
//             },

//             onDeleteGSTPress: function (oEvent) {
//                 const oIndex = oEvent.getParameter("row").getIndex(),
//                     oTable = this.byId("idGSTDetailsTable"),
//                     oObject = oTable.getContextByIndex(oIndex).getObject();
//                 // this.GSTDetailModel.getData().splice(oIndex, 1);
//                 // this.GSTDetailModel.refresh()
//                 var _self = this;
//                 MessageBox.confirm("Are you sure you want to delete this item?", {
//                     actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
//                     emphasizedAction: MessageBox.Action.OK,
//                     onClose: function (sAction) {
//                         if (sAction === MessageBox.Action.OK) {
//                             // Delete the item from the model
//                             _self.GSTDetailModel.getData().splice(oIndex, 1);
//                             _self._hideMessageStrip(`msgStrip${oObject.GSTIN}`);
//                             _self.GSTDetailModel.refresh();

//                             MessageToast.show(`GSTIN ${oObject.GSTIN} deleted.`);
//                         }
//                     }
//                 });
//             },

//             onEditGSTPress: function (oEvent) {
//                 const oIndex = oEvent.getParameter("row").getIndex(),
//                     oTable = this.byId("idGSTDetailsTable"),
//                     oObject = oTable.getContextByIndex(oIndex).getObject();

//                 sessionStorage.setItem('originalGSTINDetails', JSON.stringify(oObject));

//                 this.oGSTUpdateDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.GSTDetailsDialog", this);
//                 this.gstinDialogModel = new sap.ui.model.json.JSONModel();
//                 this.gstinDialogModel.setData(oObject);
//                 this.getView().setModel(this.gstinDialogModel, "gstinDialogModel");
//                 this.getView().addDependent(this.oGSTUpdateDialog);
//                 this.oGSTUpdateDialog.open();

//                 sap.ui.getCore().byId("dp-effectiveDate").setMinDate(new Date());
//                 this.byId("dp-issueDate").setMaxDate(new Date());

//             },

//             updateGSTNDetails: function (oEvent) {
//                 var filteredData = this.getView().getModel("gstinDialogModel").getData();
//                 var validated = this._handleValidationGSTIN(filteredData);
//                 if (validated) {
//                     var originalGSTINDetails = JSON.parse(sessionStorage.getItem("originalGSTINDetails"));
//                     var GSTINDiff = this._objectDifference(originalGSTINDetails, filteredData);
//                     if (Object.keys(GSTINDiff).length === 0 && GSTINDiff.constructor === Object) {
//                         MessageBox.success(this.oResourceBundle.getText('noChangesToUpdate'));
//                     } else {
//                         sap.ui.getCore().byId("dp-effectiveDate").setValueState("None");
//                         const effectiveFromDate = sap.ui.getCore().byId("dp-effectiveDate").getValue();
//                         if (effectiveFromDate) {
//                             var oselGST = filteredData.GSTIN;
//                             var updatedEntry = this.GSTDetailModel.getData().find(function (entry) {
//                                 return entry.GSTIN === oselGST;
//                             });
//                             if (updatedEntry) {
//                                 updatedEntry.NEWADDRESS = filteredData.NEWADDRESS ? filteredData.NEWADDRESS : filteredData.ADDRESS;
//                                 updatedEntry.NEWCOUNTRY = filteredData.NEWCOUNTRY ? filteredData.NEWCOUNTRY : filteredData.COUNTRY_CODE;
//                                 updatedEntry.NEWSTATE = filteredData.NEWSTATE ? filteredData.NEWSTATE : filteredData.STATE;
//                                 updatedEntry.NEWCITY = filteredData.NEWCITY ? filteredData.NEWCITY : filteredData.CITY;
//                                 updatedEntry.NEWPINCODE = filteredData.NEWPINCODE ? filteredData.NEWPINCODE : filteredData.PINCODE;
//                                 updatedEntry.NEWEFFECTIVEDATE = filteredData.NEWEFFECTIVEDATE ? filteredData.NEWEFFECTIVEDATE : filteredData.EFFECTIVEDATE;
//                             }
//                             // Update the model to reflect the changes
//                             this.getView().getModel("GSTDetailModel").refresh();
//                             this.oGSTUpdateDialog.destroy();
//                         } else {
//                             sap.ui.getCore().byId("dp-effectiveDate").setValueState("Error").setValueStateText("Effective date is required")
//                         }
//                     }
//                 }
//             },

//             onCloseGSTNDetails: function (oEvent) {
//                 this.oGSTUpdateDialog.destroy();
//             },

//             onDefaultGSTINSelect: function (oEvent) {
//                 var oTable = this.byId("idGSTDetailsTable");
//                 var idx = oEvent.getSource().getParent().getIndex();
//                 var model = oTable.getModel("GSTDetailModel");
//                 var arrGSTIN = model.getData();
//                 arrGSTIN.forEach((x, index) => {
//                     if (index === idx) {
//                         x.DEFAULT = true
//                     } else {
//                         x.DEFAULT = false
//                     }
//                 });
//                 this._hideMessageStrip(`msgStripGSTDetails`);
//                 model.setData(arrGSTIN);
//             },

//             _handleValidationGSTIN: function (filteredData) {
//                 var validate = true;
//                 sap.ui.getCore().byId("inp-pincodeGSTIN").setValueState("None");
//                 if (filteredData.PINCODE) {
//                     if (!validations.validatePincode(filteredData.PINCODE)) {
//                         sap.ui.getCore().byId("inp-pincodeGSTIN").setValueState("Error").setValueStateText(this.oResourceBundle.getText('invalidPANFormat'));
//                         validate = false;
//                     }
//                 }
//                 if (filteredData.EFFECTIVEDATE && !validations.validateDate(filteredData.EFFECTIVEDATE)) {
//                     sap.ui.getCore().byId("dp-effectiveDate").setValueState("Error").setValueStateText("Invalid Date format");
//                     validate = false;
//                 } else {
//                     sap.ui.getCore().byId("dp-effectiveDate").setValueState("None");
//                 }

//                 if (validate) {
//                     return true;
//                 } else {
//                     return false;
//                 }
//             },

//             onDeleteGSTINAttachment: function (oEvent) {
//                 const oBinding = oEvent.getSource().getBindingContext("GSTDetailModel");
//                 const oPath = oBinding.getPath();
//                 const oIndex = oPath.split('/')[1];
//                 const oObject = oBinding.getObject();
//                 const arrGSTIN = this.GSTDetailModel.getData();
//                 oObject.GSTCERTIFICATE = "";
//                 arrGSTIN.splice(oIndex, 1, oObject);
//                 this.GSTDetailModel.setData(arrGSTIN);
//                 this.GSTDetailModel.refresh();
//                 sap.ui.core.BusyIndicator.hide();
//             },

//             handleUploadGSTINFile: async function (oEvent) {
//                 sap.ui.core.BusyIndicator.show();
//                 const oIndex = oEvent.getSource().getParent().getParent().getIndex();
//                 const oObject = oEvent.getSource().getBindingContext("GSTDetailModel").getObject();
//                 const arrAttachment = this.GSTDetailModel.getData();
//                 const selFile = oEvent.getSource().FUEl.files[0] ?? null;
//                 if (selFile) {
//                     var base64 = await this.convertFileToBase64WithType(selFile, selFile ? selFile.type : "");
//                     oObject.GSTCERTIFICATE = base64;
//                     arrAttachment.splice(oIndex, 1, oObject);
//                     this.GSTDetailModel.setData(arrAttachment);
//                     this.GSTDetailModel.refresh();
//                     this._hideMessageStrip(`msgStrip${oObject.GSTIN}`);
//                     sap.ui.core.BusyIndicator.hide();
//                 }
//             },

//             onDownloadGSTINAttachment: function (oEvent) {
//                 const selObj = oEvent.getSource().getBindingContext("GSTDetailModel").getObject(),
//                     GSTIN = selObj.GSTIN,
//                     ATTACHMENT = selObj.GSTCERTIFICATE;
//                 this.openPdfOrImageInNewWindow("GSTIN - Certificate( " + GSTIN + " )", ATTACHMENT);
//             },

//             onFileSizeExceeded: function (oEvent) {
//                 sap.m.MessageToast.show(this.oResourceBundle.getText('fileLimitExceed'));
//             },

//             handleUploadFile: async function (oEvent) {
//                 sap.ui.core.BusyIndicator.show();
//                 const oIndex = oEvent.getSource().getParent().getParent().getIndex();
//                 const oObject = oEvent.getSource().getBindingContext("attachmentModel").getObject();
//                 const arrAttachment = this.attachmentModel.getData();
//                 const selFile = oEvent.getSource().FUEl.files[0] ?? null;
//                 if (selFile) {
//                     var base64 = await this.convertFileToBase64WithType(selFile, selFile ? selFile.type : "");
//                     oObject.FILE = base64;
//                     oObject.FILENAME = selFile.name;
//                     oObject.MIMETYPE = selFile.type;
//                     arrAttachment.splice(oIndex, 1, oObject);
//                     this.attachmentModel.setData(arrAttachment);
//                     this.attachmentModel.refresh();

//                     if (oObject.ISMANDATORY) {
//                         this._hideMessageStrip(`msgStrip${oObject.DOCUMENTTYPECODE}`);
//                     }
//                     sap.ui.core.BusyIndicator.hide();
//                 }
//             },

//             convertFileToBase64WithType: async function (file, fileType) {
//                 return new Promise((resolve, reject) => {
//                     const reader = new FileReader();

//                     reader.onload = () => {
//                         // Read the file as a data URL and resolve with the result
//                         resolve(reader.result);
//                     };

//                     reader.onerror = (error) => {
//                         // Reject with the error if there is a problem reading the file
//                         reject(error);
//                     };

//                     if (fileType && fileType !== "") {
//                         // If a specific fileType is provided, set the file type explicitly
//                         reader.readAsDataURL(new Blob([file], { type: fileType }));
//                     } else {
//                         // Otherwise, let the browser determine the file type
//                         reader.readAsDataURL(file);
//                     }
//                 });

//             },

//             onDeleteAttachment: function (oEvent) {
//                 const oIndex = oEvent.getParameter("row").getIndex();
//                 const oTable = this.byId("tbl-attachment");
//                 const oObject = oTable.getContextByIndex(oIndex).getObject();
//                 const arrAttachment = this.attachmentModel.getData();
//                 oObject.FILE = "";
//                 oObject.FILENAME = "";
//                 oObject.MIMETYPE = "";
//                 arrAttachment.splice(oIndex, 1, oObject);
//                 this.attachmentModel.setData(arrAttachment);
//                 this.attachmentModel.refresh();
//                 sap.ui.core.BusyIndicator.hide();
//             },

//             onDownloadAttachment: function (oEvent) {
//                 const selObj = oEvent.getSource().getBindingContext("attachmentModel").getObject(),
//                     DOCUMENTNAME = selObj.DOCUMENTNAME,
//                     ATTACHMENT = selObj.FILE;
//                 this.openPdfOrImageInNewWindow("Attachment - " + DOCUMENTNAME, ATTACHMENT);
//             },

//             openPdfOrImageInNewWindow: function (title, base64Data) {
//                 if (base64Data) {
//                     var typeBase64 = base64Data.split(',')[0];
//                     var type = "";

//                     if (typeBase64.match(/pdf/i)) {
//                         type = "pdf";
//                     } else if (typeBase64.match(/jpeg|jpg|png/i)) {
//                         type = "image";
//                     }

//                     if (type === "pdf" || type === "image") {
//                         var newWindow = window.open();
//                         newWindow.document.title = title;
//                         var heading = document.createElement('h5');
//                         heading.textContent = title;
//                         var iframe = document.createElement('iframe');
//                         iframe.src = base64Data;
//                         iframe.width = "100%";
//                         iframe.height = "100%";
//                         newWindow.document.body.appendChild(heading);
//                         newWindow.document.body.appendChild(iframe);
//                     } else {
//                         const link = document.createElement('a');
//                         link.href = base64Data;
//                         link.download = title;
//                         link.click();
//                     }
//                 } else {
//                     sap.m.MessageBox.warning(title + " attachment is missing. Please upload an attachment.");
//                 }
//             },

//             /** Block / Approve / Activate Users  */

//             onBlockUser: function (oEvent) {
//                 const oObject = oEvent.getSource().getBindingContext("userModel").getObject();
//                 const userEmail = oObject.LOGINEMAIL,
//                     userId = oObject.ID;
//                 if (!this.oBlockUserDialog) {
//                     this.oBlockUserDialog = new Dialog({
//                         type: DialogType.Message,
//                         title: "Confirm Block",
//                         content: [
//                             new Label({
//                                 text: "Are you sure you want to block this user?",
//                                 labelFor: "blockReason"
//                             }),
//                             new TextArea("blockReason", {
//                                 width: "100%",
//                                 placeholder: "Add a reason (required)",
//                                 liveChange: function (oEvent) {
//                                     var sText = oEvent.getParameter("value");
//                                     this.oBlockUserDialog.getBeginButton().setEnabled(sText.length > 0);
//                                 }.bind(this)
//                             })
//                         ],
//                         beginButton: new Button({
//                             type: ButtonType.Emphasized,
//                             text: "Block",
//                             enabled: false,
//                             press: function () {
//                                 sap.ui.core.BusyIndicator.show();
//                                 var blockReason = Core.byId("blockReason").getValue();
//                                 this.handleUserBlock(userId, userEmail, blockReason);
//                                 this.oBlockUserDialog.close();
//                             }.bind(this)
//                         }),
//                         endButton: new Button({
//                             text: "Cancel",
//                             press: function () {
//                                 this.oBlockUserDialog.close();
//                             }.bind(this)
//                         })
//                     });
//                 }
//                 Core.byId("blockReason").setValue("");
//                 this.oBlockUserDialog.open();
//             },

//             handleUserBlock: function (userId, userEmail, blockReason) {
//                 // Send a request to block the user with the provided blockReason.
//                 // Handle the result or display a message as needed.
//                 // Example: You can show a success message using MessageToast.
//                 const reqData = { ID: userId, user: userEmail, blockReason: blockReason }
//                 this.SendRequest(this, "/portal-api/portal/v1/block-user", "POST", {}, JSON.stringify({ ...reqData }), (_self, data, message) => {
//                     _self.userModel.setData(data.users);
//                     sessionStorage.setItem("orginalUsers", JSON.stringify(data));
//                     _self.userApprovalModel.refresh();
//                     sap.ui.core.BusyIndicator.hide();
//                 });
//             },

//             onUnBlockUser: function (oEvent) {
//                 const oObject = oEvent.getSource().getBindingContext("userModel").getObject();
//                 const userEmail = oObject.LOGINEMAIL,
//                     userId = oObject.ID;

//                 if (!this.oUnBlockUserDialog) {
//                     this.oUnBlockUserDialog = new Dialog({
//                         type: DialogType.Message,
//                         title: "Confirm Unblock",
//                         content: [
//                             new Label({
//                                 text: "Are you sure you want to unblock this user?",
//                                 labelFor: "unblockUser"
//                             })
//                         ],
//                         beginButton: new Button({
//                             type: ButtonType.Emphasized,
//                             text: "Unblock",
//                             press: function () {
//                                 sap.ui.core.BusyIndicator.show();
//                                 this.handleUnblockUser(userId, userEmail);
//                                 this.oUnBlockUserDialog.close();
//                             }.bind(this)
//                         }),
//                         endButton: new Button({
//                             text: "Cancel",
//                             press: function () {
//                                 this.oUnBlockUserDialog.close();
//                             }.bind(this)
//                         })
//                     });
//                 }

//                 this.oUnBlockUserDialog.open();
//             },

//             handleUnblockUser: function (userId, userEmail) {
//                 // Send a request to unblock the user.
//                 // Handle the result or display a message as needed.
//                 // Example: You can show a success message using MessageToast. 
//                 const reqData = { ID: userId }
//                 this.SendRequest(this, "/portal-api/portal/v1/unblock-user", "POST", {}, JSON.stringify({ ...reqData }), (_self, data, message) => {
//                     _self.userModel.setData(data.users);
//                     sessionStorage.setItem("orginalUsers", JSON.stringify(data));
//                     _self.userApprovalModel.refresh();
//                     sap.ui.core.BusyIndicator.hide();
//                 });
//             },

//             onActivateUser: function (oEvent) {
//                 const oObject = oEvent.getSource().getBindingContext("userModel").getObject();
//                 const userEmail = oObject.LOGINEMAIL,
//                     userId = oObject.ID;

//                 if (!this.oActivateUserDialog) {
//                     this.oActivateUserDialog = new Dialog({
//                         type: DialogType.Message,
//                         title: "Confirm Activate",
//                         content: [
//                             new Label({
//                                 text: "Are you sure you want to Activate this user?",
//                                 labelFor: "activateUser"
//                             })
//                         ],
//                         beginButton: new Button({
//                             type: ButtonType.Emphasized,
//                             text: "Activate",
//                             press: function () {
//                                 sap.ui.core.BusyIndicator.show();
//                                 this.handleActivateUser(userId, userEmail);
//                                 this.oActivateUserDialog.close();
//                             }.bind(this)
//                         }),
//                         endButton: new Button({
//                             text: "Cancel",
//                             press: function () {
//                                 this.oActivateUserDialog.close();
//                             }.bind(this)
//                         })
//                     });
//                 }

//                 this.oActivateUserDialog.open();
//             },

//             handleActivateUser: function (userId, userEmail) {
//                 // Send a request to Activate the user.
//                 // Handle the result or display a message as needed.
//                 // Example: You can show a success message using MessageToast. 
//                 const reqData = { ID: userId }
//                 this.SendRequest(this, "/portal-api/portal/v1/activate-user", "POST", {}, JSON.stringify({ ...reqData }), (_self, data, message) => {
//                     _self.userModel.setData(data.users);
//                     sessionStorage.setItem("orginalUsers", JSON.stringify(data));
//                     _self.userApprovalModel.refresh();
//                     sap.ui.core.BusyIndicator.hide();
//                 });
//             },

//             /** Approve / Reject Users */
//             onApproveUser: function (oEvent) {
//                 const oObject = oEvent.getSource().getBindingContext("userApprovalModel").getObject();
//                 const userEmail = oObject.LOGINEMAIL,
//                     userId = oObject.ID;

//                 if (!this.oApproveUserDialog) {
//                     this.oApproveUserDialog = new Dialog({
//                         type: DialogType.Message,
//                         title: "Confirm Approve",
//                         content: [
//                             new Label({
//                                 text: "Are you sure you want to Approve this user?",
//                                 labelFor: "approveUser"
//                             })
//                         ],
//                         beginButton: new Button("approveUser", {
//                             type: ButtonType.Emphasized,
//                             text: "Approve",
//                             press: function () {
//                                 sap.ui.core.BusyIndicator.show();
//                                 this.handleApproveUser(userId, userEmail);
//                                 this.oApproveUserDialog.close();
//                             }.bind(this)
//                         }),
//                         endButton: new Button({
//                             text: "Cancel",
//                             press: function () {
//                                 this.oApproveUserDialog.close();
//                             }.bind(this)
//                         })
//                     });
//                 }

//                 this.oApproveUserDialog.open();
//             },

//             handleApproveUser: function (userId, userEmail) {
//                 // Send a request to approve the user.
//                 // Handle the result or display a message as needed.
//                 // Example: You can show a success message using MessageToast. 
//                 const reqData = { ID: userId }
//                 this.SendRequest(this, "/portal-api/portal/v1/approve-user", "POST", {}, JSON.stringify({ ...reqData }), (_self, data, message) => {

//                     _self.userApprovalModel.setData(data.userApprovals);
//                     sessionStorage.setItem("orginalApprovalDetails", JSON.stringify(data.userApprovals));
//                     _self.userApprovalModel.refresh();

//                     _self.userModel.setData(data.userDetails);
//                     sessionStorage.setItem("orginalUsers", JSON.stringify(data.userDetails));
//                     _self.userModel.refresh();

//                     sap.ui.core.BusyIndicator.hide();

//                 });
//             },

//             onRejectUser: function (oEvent) {
//                 const oObject = oEvent.getSource().getBindingContext("userApprovalModel").getObject();
//                 const userEmail = oObject.LOGINEMAIL,
//                     userId = oObject.ID;

//                 if (!this.onRejectUserDialog) {
//                     this.onRejectUserDialog = new Dialog({
//                         type: DialogType.Message,
//                         title: "Confirm Reject",
//                         content: [
//                             new Label({
//                                 text: "Are you sure you want to reject this user?",
//                                 labelFor: "rejectUser"
//                             })
//                         ],
//                         beginButton: new Button({
//                             type: ButtonType.Emphasized,
//                             text: "Reject",
//                             press: function () {
//                                 sap.ui.core.BusyIndicator.show();
//                                 this.handleRejectUser(userId, userEmail);
//                                 this.onRejectUserDialog.close();
//                             }.bind(this)
//                         }),
//                         endButton: new Button({
//                             text: "Cancel",
//                             press: function () {
//                                 this.onRejectUserDialog.close();
//                             }.bind(this)
//                         })
//                     });
//                 }

//                 this.onRejectUserDialog.open();
//             },

//             handleRejectUser: function (userId, userEmail) {
//                 // Send a request to reject the user.
//                 // Handle the result or display a message as needed.
//                 // Example: You can show a success message using MessageToast. 
//                 const reqData = { ID: userId }
//                 this.SendRequest(this, "/portal-api/portal/v1/reject-user", "POST", {}, JSON.stringify({ ...reqData }), (_self, data, message) => {
//                     _self.userApprovalModel.setData(data.userApprovals);
//                     sessionStorage.setItem("orginalApprovalDetails", JSON.stringify(data.userApprovals));
//                     _self.userApprovalModel.refresh();

//                     _self.userModel.setData(data.userDetails);
//                     sessionStorage.setItem("orginalUsers", JSON.stringify(data.userDetails));
//                     _self.userModel.refresh();

//                     sap.ui.core.BusyIndicator.hide();
//                 });
//             },

//             /** Approve / Reject Amendments */
//             onApproveAmndReq: function (oEvent) {
//                 const oObject = oEvent.getSource().getBindingContext("userRequestModel").getObject();
//                 const invoiceNumber = oObject.ID,
//                     amendedAddress = oObject.AMENDENTEDADDRESS;

//                 if (!this.oApproveAmendmentDialog) {
//                     this.oApproveAmendmentDialog = new Dialog({
//                         type: DialogType.Message,
//                         title: "Confirm Approve",
//                         content: [
//                             new Label({
//                                 text: "Are you sure you want to Approve this Amendment?"
//                             })
//                         ],
//                         beginButton: new Button({
//                             type: ButtonType.Emphasized,
//                             text: "Approve",
//                             press: function () {
//                                 sap.ui.core.BusyIndicator.show();
//                                 this.handleApproveAmndReq(invoiceNumber, amendedAddress);
//                                 this.oApproveAmendmentDialog.close();
//                             }.bind(this)
//                         }),
//                         endButton: new Button({
//                             text: "Cancel",
//                             press: function () {
//                                 this.oApproveAmendmentDialog.close();
//                             }.bind(this)
//                         })
//                     });
//                 }

//                 this.oApproveAmendmentDialog.open();
//             },

//             handleApproveAmndReq: function (invoiceNumber, amendedAddress) {
//                 // Send a request to approve the amended request.
//                 // Handle the result or display a message as needed.
//                 // Example: You can show a success message using MessageToast. 
//                 var url;
//                 if (amendedAddress) {
//                     url = "/portal-api/portal/v1/approve-address-amendment-request";
//                 } else {
//                     url = "/portal-api/portal/v1/approve-amendment-request";
//                 }
//                 const reqData = { ID: invoiceNumber }
//                 this.SendRequest(this, url, "POST", {}, JSON.stringify({ ...reqData }), (_self, data, message) => {
//                     // _self.userRequestModel.setData(data.userRequest);
//                     // sessionStorage.setItem("orginalRequestsDetails", JSON.stringify(data));
//                     // _self.userRequestModel.refresh();
//                     MessageToast.show(`Document ${invoiceNumber} Amended`)
//                     _self._profileData();
//                     // sap.ui.core.BusyIndicator.hide();
//                 });
//             },

//             onRejectAmndReq: function (oEvent) {
//                 const oObject = oEvent.getSource().getBindingContext("userRequestModel").getObject();
//                 const invoiceNumber = oObject.ID,
//                     amendedAddress = oObject.AMENDENTEDADDRESS;

//                 if (!this.onRejectUserDialog) {
//                     this.onRejectUserDialog = new Dialog({
//                         type: DialogType.Message,
//                         title: "Confirm Reject",
//                         content: [
//                             new Label({
//                                 text: "Are you sure you want to reject this Amendment?",
//                                 labelFor: "rejectUser"
//                             })
//                         ],
//                         beginButton: new Button({
//                             type: ButtonType.Emphasized,
//                             text: "Reject",
//                             press: function () {
//                                 sap.ui.core.BusyIndicator.show();
//                                 this.handleRejectAmndReq(invoiceNumber, amendedAddress);
//                                 this.onRejectUserDialog.close();
//                             }.bind(this)
//                         }),
//                         endButton: new Button({
//                             text: "Cancel",
//                             press: function () {
//                                 this.onRejectUserDialog.close();
//                             }.bind(this)
//                         })
//                     });
//                 }

//                 this.onRejectUserDialog.open();
//             },

//             handleRejectAmndReq: function (invoiceNumber, amendedAddress) {
//                 // Send a request to reject the amended request.
//                 // Handle the result or display a message as needed.
//                 // Example: You can show a success message using MessageToast. 
//                 var url;
//                 if (amendedAddress) {
//                     url = "/portal-api/portal/v1/reject-address-amendment-request";
//                 } else {
//                     url = "/portal-api/portal/v1/reject-amendment-request";
//                 }
//                 const reqData = { ID: invoiceNumber }
//                 this.SendRequest(this, url, "POST", {}, JSON.stringify({ ...reqData }), (_self, data, message) => {
//                     // _self.userRequestModel.setData(data.userRequest);
//                     // sessionStorage.setItem("orginalRequestsDetails", JSON.stringify(data));
//                     // _self.userRequestModel.refresh();
//                     MessageToast.show(`Amendment request rejected.`)
//                     _self._profileData();
//                     // sap.ui.core.BusyIndicator.hide();
//                 });
//             },

//             onPressSave: function (oEvent) {
//                 if (this._handleValidation()) {
//                     const roles = this.rolesModel.getData();

//                     const companyDetails = this.companyDetailModel.getData();
//                     const userDetails = this.userDetailModel.getData();
//                     const gstDetails = this.GSTDetailModel.getData();
//                     const users = this.userModel.getData();
//                     const attachmentDetails = this.attachmentModel.getData();

//                     const orginalCompanyDetails = JSON.parse(sessionStorage.getItem("orginalCompanyDetails"));
//                     const OrginalUserDetails = JSON.parse(sessionStorage.getItem("orginalUserDetails"));
//                     const orginalGSTINDetails = JSON.parse(sessionStorage.getItem("orginalGSTINDetails"));
//                     const orginalUsers = JSON.parse(sessionStorage.getItem("orginalUsers"));
//                     const orginalAttachmentDetails = JSON.parse(sessionStorage.getItem("orginalAttachmentDetails"));

//                     var companyDiff = this._objectDifference(orginalCompanyDetails, companyDetails);
//                     var userDetailsDiff = this._objectDifference(OrginalUserDetails, userDetails);
//                     var gstinDiff = this._findDifferenceInGSTIN(orginalGSTINDetails, gstDetails);
//                     var userDiff = this._findDifferenceInUser(orginalUsers, users);
//                     var attachmentDiff = this._findDifferenceInAttachment(orginalAttachmentDetails, attachmentDetails);

//                     var modifiedData;
//                     if (Object.keys(companyDiff).length === 0 && companyDiff.constructor === Object &&
//                         Object.keys(userDetailsDiff).length === 0 && userDetailsDiff.constructor === Object &&
//                         Object.keys(gstinDiff.deletedItems).length === 0 &&
//                         Object.keys(gstinDiff.editedItems).length === 0 &&
//                         Object.keys(gstinDiff.addedItems).length === 0 &&
//                         Object.keys(userDiff.editedItems).length === 0 &&
//                         Object.keys(attachmentDiff.editedItems).length === 0) {
//                         MessageBox.success(this.oResourceBundle.getText('noChangesToUpdate'));
//                     } else {
//                         sap.ui.core.BusyIndicator.show();
//                         if (roles.ISADMIN) {
//                             modifiedData = {
//                                 companyDetails: companyDiff,
//                                 userDetails: userDetailsDiff,
//                                 gstinDetails: gstinDiff,
//                                 users: userDiff,
//                                 attachments: attachmentDiff
//                             }
//                         } else {
//                             modifiedData = {
//                                 userDetails: userDetailsDiff,
//                                 gstinDetails: gstinDiff,
//                                 attachments: attachmentDiff
//                             }
//                         }

//                         this.SendRequest(this, "/portal-api/portal/v1/edit-profile", "POST", {}, JSON.stringify(modifiedData), (_self, data, message) => {
//                             _self._profileData();
//                             _self.getView().getModel().setProperty("/toggleEdit", true);
//                             sap.ui.core.BusyIndicator.hide();
//                         });
//                     }
//                 }
//             },

//             _objectDifference: function (original, edit) {
//                 return Object.keys(edit).reduce((diff, key) => {
//                     if (original[key] === edit[key]) return diff
//                     return {
//                         ...diff,
//                         [key]: edit[key]
//                     }
//                 }, {})
//             },

//             _findDifferenceInGSTIN: function (originalObj, editedObj) {
//                 const diff = {};
//                 const addedItems = [];
//                 const deletedItems = [];
//                 const editedItems = {};

//                 editedObj.forEach((object) => {
//                     if (!object.COMPANYID) {
//                         delete object.PAN;
//                         addedItems.push(object);
//                     }
//                 });

//                 originalObj.forEach((existingItems) => {
//                     const ifExists = editedObj.find(
//                         (editedObject) => editedObject.GSTIN == existingItems.GSTIN
//                     );
//                     if (!ifExists) {
//                         deletedItems.push(existingItems.GSTIN);
//                     } else {
//                         const difference = this._objectDifference(existingItems, ifExists);
//                         if (Object.keys(difference).length > 0) {
//                             editedItems[existingItems.GSTIN] = difference;
//                         }
//                     }
//                 });

//                 diff.deletedItems = deletedItems;
//                 diff.editedItems = editedItems;
//                 diff.addedItems = addedItems;
//                 return diff;
//             },

//             _findDifferenceInUser: function (originalObj, editedObj) {
//                 const diff = {};
//                 const editedItems = {};

//                 originalObj.forEach((existingItems) => {
//                     const ifExists = editedObj.find(
//                         (editedObject) => editedObject.ID == existingItems.ID
//                     );
//                     if (ifExists) {
//                         const difference = this._objectDifference(existingItems, ifExists);
//                         if (Object.keys(difference).length > 0) {
//                             editedItems[existingItems.ID] = difference;
//                         }
//                     }
//                 });
//                 diff.editedItems = editedItems;
//                 return diff;
//             },

//             _findDifferenceInAttachment: function (originalObj, editedObj) {
//                 const diff = {};
//                 const editedItems = {};

//                 originalObj.forEach((existingItems) => {
//                     const ifExists = editedObj.find(
//                         (editedObject) => editedObject.ID == existingItems.ID
//                     );
//                     if (ifExists) {
//                         const difference = this._objectDifference(existingItems, ifExists);
//                         if (Object.keys(difference).length > 0) {
//                             editedItems[existingItems.ID] = difference;
//                         }
//                     }
//                 });
//                 diff.editedItems = editedItems;
//                 return diff;
//             },

//             _handleValidation: function () {
//                 const roles = this.rolesModel.getData();
//                 let validate = true;
//                 var companyValidate = true;
//                 var UserValidate = true;
//                 var gstinValidate = true;
//                 var attachmentValidate = true;
//                 if (roles.ISADMIN) {
//                     companyValidate = this._validateCompanyDetails(validate);
//                     UserValidate = this._validateUserDetails(validate);
//                     gstinValidate = this._validateGSTINDetails(validate);
//                     attachmentValidate = this._validateAttachmentDetails(validate);
//                     validate = companyValidate && UserValidate && gstinValidate && attachmentValidate;
//                 } else {
//                     UserValidate = this._validateUserDetails(validate);
//                     attachmentValidate = this._validateAttachmentDetails(validate);
//                     validate = UserValidate && attachmentValidate;
//                     // if (validate) {
//                     if (roles.CANEDITGST || roles.CANADDGSTIN) {
//                         gstinValidate = this._validateGSTINDetails(validate);
//                         validate = gstinValidate;
//                         // }
//                     }
//                 }

//                 return validate;
//             },

//             _validateInput: function (sId, sValue, errorMessage, validationFunction, validationErrorMessage) {
//                 if (!sValue || sValue.trim().length === 0) {
//                     sId.setValueState("Error").setValueStateText(errorMessage);
//                     return false;
//                 } else if (validationFunction && !validationFunction(sValue)) {
//                     sId.setValueState("Error").setValueStateText(validationErrorMessage);
//                     return false;
//                 }
//                 sId.setValueState("None");
//                 return true;
//             },

//             _validateCompanyDetails: function (validate) {
//                 const companyDetails = [
//                     { id: "inp-address", message: this.oResourceBundle.getText('addressRequired') },
//                     { id: "sel-country", message: this.oResourceBundle.getText('countryRequired') },
//                     { id: "inp-city", message: this.oResourceBundle.getText('cityRequired') },
//                     {
//                         id: "inp-pinCode",
//                         message: this.oResourceBundle.getText('pinCodeRequired'),
//                         validationFunction: validations.validatePincode,
//                         validationErrorMessage: this.oResourceBundle.getText('invalidPANFormat')
//                     },
//                     {
//                         id: "inp-companyPhone",
//                         message: this.oResourceBundle.getText('mobileRequired'),
//                         validationFunction: validations.validatePhone,
//                         validationErrorMessage: this.oResourceBundle.getText('invalidMobileFormat')
//                     }
//                 ];

//                 for (const item of companyDetails) {
//                     var value;
//                     if (item.id === "sel-country") {
//                         value = this.byId(item.id).getSelectedKey();
//                     } else if (item.id === "inp-pinCode" || item.id === "inp-companyPhone") {
//                         value = this.byId(item.id).getDOMValue() ?? this.byId(item.id).getValue();
//                     } else {
//                         value = this.byId(item.id).getValue()
//                     }
//                     validate = this._validateInput(this.byId(item.id), value, item.message, item.validationFunction, item.validationErrorMessage) && validate;
//                 }
//                 if (validate) {
//                     return true;
//                 } else {
//                     // this.byId("objs-companyDet").focus();
//                     return false
//                 }
//             },

//             _validateUserDetails: function (validate) {
//                 const userDetails = [
//                     { id: "sel-title", message: this.oResourceBundle.getText('titleRequired') },
//                     { id: "inp-firstName", message: this.oResourceBundle.getText('firstNameRequired') },
//                     { id: "inp-lastName", message: this.oResourceBundle.getText('lastNameRequired') },
//                     {
//                         id: "inp-userMobile",
//                         message: this.oResourceBundle.getText('mobileRequired'),
//                         validationFunction: validations.validatePhone,
//                         validationErrorMessage: this.oResourceBundle.getText('invalidMobileFormat')
//                     }
//                 ];

//                 for (const item of userDetails) {
//                     var value;
//                     if (item.id === "sel-title") {
//                         value = this.byId(item.id).getSelectedKey();
//                     } else if (item.id === "inp-userMobile") {
//                         value = this.byId(item.id).getDOMValue() ?? this.byId(item.id).getValue();
//                     } else {
//                         value = this.byId(item.id).getValue()
//                     }
//                     validate = this._validateInput(this.byId(item.id), value, item.message, item.validationFunction, item.validationErrorMessage) && validate;
//                 }

//                 if (validate) {
//                     return true;
//                 } else {
//                     // this.byId("objs-companyDet").focus();
//                     return false
//                 }
//             },

//             _validateGSTINDetails: function (validate) {
//                 const GSTINList = this.GSTDetailModel.getData();

//                 if (GSTINList.length === 0) {
//                     this._showMessageStrip('oVerticalContentGSTIN', 'msgStripGSTDetails', this.oResourceBundle.getText('GSTINRequired'), 'E');
//                     validate = false;
//                 } else {
//                     this._hideMessageStrip(`msgStripGSTDetails`);

//                     for (let i = 0; i < GSTINList.length; i++) {
//                         const doc = GSTINList[i];
//                         if (!doc.GSTCERTIFICATE) {
//                             let msgText = this.oResourceBundle.getText('msgUploadGSTINCertificateDoc').replace('%s', `${doc.GSTIN}`);
//                             this._showMessageStrip('oVerticalContentGSTIN', `msgStrip${doc.GSTIN}`, msgText, 'E');
//                             validate = false;
//                         } else {
//                             this._hideMessageStrip(`msgStrip${doc.GSTIN}`);
//                         }
//                     }

//                     if (!GSTINList.some(doc => doc.DEFAULT)) {
//                         this._showMessageStrip('oVerticalContentGSTIN', 'msgStripGSTDetails', this.oResourceBundle.getText('defaultGSTINRequired'), 'E');
//                         validate = false;
//                     } else {
//                         this._hideMessageStrip(`msgStripGSTDetails`);
//                     }
//                 }

//                 if (validate) {
//                     return true;
//                 } else {
//                     // this.byId("objs-gstDet").focus();
//                     return false
//                 }
//             },

//             _validateAttachmentDetails: function (validate) {
//                 const attachmentTableData = this.attachmentModel.getData();

//                 for (let i = 0; i < attachmentTableData.length; i++) {
//                     const doc = attachmentTableData[i];
//                     if (doc.ISMANDATORY === true && doc.FILE === "") {
//                         let msgText = this.oResourceBundle.getText('msgUploadMandatoryDoc').replace('%s', `${doc.DOCUMENTTYPECODE} - ${doc.DOCUMENTNAME}`);
//                         this._showMessageStrip('oVerticalContent', `msgStrip${doc.DOCUMENTTYPECODE}`, msgText, 'E');
//                         validate = false;
//                     } else {
//                         this._hideMessageStrip(`msgStrip${doc.DOCUMENTTYPECODE}`);
//                     }
//                     if (doc.ISSUEDON && !validations.validateDate(doc.ISSUEDON)) {
//                         let msgText = this.oResourceBundle.getText('msgInvalidDateFormat').replace('%s', `${doc.DOCUMENTTYPECODE} - ${doc.DOCUMENTNAME}`);
//                         this._showMessageStrip('oVerticalContent', `msgStripDate${doc.DOCUMENTTYPECODE}`, msgText, 'E');
//                         validate = false;
//                     } else {
//                         this._hideMessageStrip(`msgStripDate${doc.DOCUMENTTYPECODE}`);
//                     }
//                 }

//                 if (validate) {
//                     return true;
//                 } else {
//                     // this.byId("objs-attachmentDet").focus();
//                     return false
//                 }
//             },

//             _showMessageStrip: function (oVCId, msgStripId, msgStripText, msgType) {
//                 let oVC = this.byId(oVCId);
//                 let messageType;
//                 switch (msgType) {
//                     case 'E':
//                         messageType = "Error";
//                         break;
//                     case 'W':
//                         messageType = "Warning";
//                         break;
//                     case 'I':
//                     default:
//                         messageType = "Information";
//                         break;
//                 }
//                 let oMsgStrip = sap.ui.getCore().byId(`${msgStripId}`);
//                 if (oMsgStrip) {
//                     oMsgStrip.destroy();
//                 }
//                 oMsgStrip = new sap.m.MessageStrip(`${msgStripId}`, {
//                     text: `${msgStripText}`,
//                     showCloseButton: true,
//                     showIcon: true,
//                     type: `${messageType}`
//                 });
//                 oVC.addContent(oMsgStrip);
//             },

//             _hideMessageStrip: function (msgStripId) {
//                 let oMsgStrip = sap.ui.getCore().byId(`${msgStripId}`);
//                 if (oMsgStrip) {
//                     oMsgStrip.destroy();
//                 }
//             },

//             handleDateChange: function (oEvent) {
//                 var oDP = oEvent.getSource(),
//                     bValid = oEvent.getParameter("valid");
//                 if (bValid) {
//                     oDP.setValueState("None");
//                 } else {
//                     oDP.setValueState("Error");
//                 }
//             }

        });
    }
);