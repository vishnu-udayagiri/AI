sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Core",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/Select",
    "sap/m/MultiComboBox",
    "sap/m/MessageToast",
    "sap/m/Text"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Core, MessageBox, Dialog, DialogType, Button, ButtonType, Label, Input, Select, MultiComboBox, MessageToast, Text) {
        "use strict";

        return Controller.extend("ns.appconfig.controller.configuration", {
            onInit: function () {
                this.SendRequest = this.getOwnerComponent().SendRequest;

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("Routeconfiguration").attachPatternMatched(this._routeMatched, this);

                this.oModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(this.oModel);

                this.configModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(this.configModel, "configModel");

                this.signatoryModel = new sap.ui.model.json.JSONModel([]);
                this.getView().setModel(this.signatoryModel, "signatoryModel");

                this.companyMasterModel = new sap.ui.model.json.JSONModel([]);
                this.getView().setModel(this.companyMasterModel, "companyMasterModel");

            },

            _routeMatched: function () {
                // sap.ui.core.BusyIndicator.show();
                /** get Service URL */
                const mObj = this.getOwnerComponent().getManifestObject();
                if (mObj._oBaseUri._string.includes("port")) {
                    this.sURL = mObj._oBaseUri._string.split('/appconfig')[0] + '/'
                } else {
                    this.sURL = mObj._oBaseUri._parts.path
                }

                this._getConfigData();
            },
            /** Get Config Data */

            _getConfigData: function () {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                this.getView().getModel().setProperty("/toggleEdit", true);
                jQuery.ajax({
                    url: _self.sURL + "config/getConfigurationDetails()",
                    type: "GET",
                    contentType: "application/json",
                    success: function (response, textStatus, jqXHR) {
                        if (response) {
                            if (response?.value?.status == 200) {
                                const configData = response.value.data;
                                _self.configModel.setData(configData.appConfig);
                                _self.signatoryModel.setData(configData.invoiceSignatory);
                                _self.companyMasterModel.setData(configData.companyDetails);

                                sessionStorage.setItem("originalAppConfig", JSON.stringify(configData.appConfig));
                                sessionStorage.setItem("originalInvoiceSignatory", JSON.stringify(configData.invoiceSignatory));
                                sap.ui.core.BusyIndicator.hide();
                            }
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error("Something went wrong. Please try again");
                    },
                });
            },

            onPressAddInvocie: function () {
                sap.ui.getCore().setModel(this.companyMasterModel);
                this.extAddSignatory = new sap.m.Dialog({
                    type: DialogType.Message,
                    title: "New Invoice Signatory",
                    contentWidth: "20%",
                    content: [

                        new Label({ text: "Company", labelFor: "sel_Company", required: true }),
                        new sap.m.Select("sel_Company", {
                            width: "100%",
                            items: {
                                path: '/',
                                template: new sap.ui.core.ListItem({
                                    key: '{code}',
                                    text: '{description}'
                                }),
                                templateShareable: true
                            }
                        }),

                        new Label({ text: "Valid From", labelFor: "dp_validFrom", required: true }),
                        new sap.m.DatePicker("dp_validFrom", {
                            displayFormat: "yyyy-MM-dd", valueFormat: "yyyy-MM-dd"
                        }),

                        new Label({ text: "Valid Till", labelFor: "dp_validTill" }),
                        new sap.m.DatePicker("dp_validTill", {
                            displayFormat: "yyyy-MM-dd", valueFormat: "yyyy-MM-dd"
                        }),

                        new Label({ text: "Signatory Name", labelFor: "inp_signatoryName", required: true }),
                        new Input("inp_signatoryName", {
                            width: "100%",
                            placeholder: 'Signatory Name'
                        }),

                        new Label({ text: "Signatory File", labelFor: "fu_fileUploader", required: true }),
                        new sap.ui.unified.FileUploader("fu_fileUploader", {
                            tooltip: "Browse...",
                            fileType: "png,jpeg,jpg",
                            width: "100%",
                            maximumFileSize: 0.1,
                            sameFilenameAllowed: "true",
                            iconOnly: true,
                            sameFilenameAllowed: true,
                            icon: "sap-icon://attachment",
                            fileSizeExceed: function (oEvent) {
                                sap.m.MessageToast.show('File size exceeded the allowed limit (100 KB). Please choose a smaller file');
                            },
                            change: async function (oEvent) {
                                /** Check if the file is of considered type */

                                const fileUpload = Core.byId("fu_fileUploader");
                                const file = fileUpload.getDomRef("fu").files[0];

                                await isImage(file, function (isImage) {
                                    fileUpload.setValueState("None");
                                    if (!isImage) {
                                        fileUpload.setValue();
                                        fileUpload.setValueState("Error").setValueStateText("Invalid file format. Please upload an image of format: JPEG, JPG, PNG");
                                    }
                                });

                                // Function to check if a file is an image based on its content
                                function isImage(file, callback) {
                                    debugger;
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
                                            header.startsWith("ffd8ffe0") // JPEG/JPG
                                        ) {
                                            callback(true);
                                        } else {
                                            callback(false);
                                        }

                                        // header.startsWith("25504446") || // PDF
                                        // header.startsWith("504b0304") || // DOCX
                                        // header.startsWith("504b0304") || // XLSX
                                        // header.startsWith("d0cf11e0")) {  // DOC or XLS

                                    };

                                    // Read the file content
                                    reader.readAsArrayBuffer(file);
                                }
                            },
                        })
                    ],
                    beginButton: new Button("ccApproveButton", {
                        type: ButtonType.Emphasized,
                        text: "Add",
                        enabled: true,
                        press: async function () {

                            var validate = true;

                            const country = Core.byId("sel_Company").getSelectedKey(),
                                validFrom = Core.byId("dp_validFrom").getValue(),
                                validTill = Core.byId("dp_validTill").getValue(),
                                signatoryName = Core.byId("inp_signatoryName").getValue(),
                                fileUpload = Core.byId("fu_fileUploader");

                            const file = fileUpload.getDomRef("fu").files[0];

                            Core.byId("fu_fileUploader").setValueState("None");
                            Core.byId("dp_validFrom").setValueState("None");
                            Core.byId("dp_validTill").setValueState("None");
                            Core.byId("inp_signatoryName").setValueState("None");

                            if (file == 'undefined' || file == null || file == "") {
                                Core.byId("fu_fileUploader").setValueState("Error").setValueStateText("Invoice signatory is required");
                                validate = false;
                            }

                            if (!validFrom) {
                                Core.byId("dp_validFrom").setValueState("Error").setValueStateText("Valid from is required");
                                validate = false;
                            }

                            if (!signatoryName) {
                                Core.byId("inp_signatoryName").setValueState("Error").setValueStateText("Signatory Name is required");
                                validate = false;
                            }

                            if (validTill && validFrom) {
                                const newValidFrom = new Date(validFrom);
                                const newValidTill = new Date(validTill);

                                if (newValidTill <= newValidFrom) {
                                    Core.byId("dp_validTill").setValueState("Error").setValueStateText("Valid till date must be greater than valid from date");
                                    validate = false;
                                }
                            }

                            if (validate) {
                                const mimeType = file.type;
                                const blob_string = await convertFileToBase64(file);
                                this.signatoryModel.getData().push({
                                    country: country,
                                    ValidFrom: validFrom,
                                    ValidTill: validTill,
                                    SignatoryName: signatoryName,
                                    mimeType: mimeType,
                                    SignatureFile: blob_string
                                });
                                this.signatoryModel.refresh();

                                this.extAddSignatory.destroy();
                            }
                        }.bind(this)
                    }),
                    endButton: new Button(
                        {
                            text: "Cancel",
                            press: function () {
                                this.extAddSignatory.destroy();
                            }.bind(this)
                        }
                    )
                });

                const signatoryData = this.signatoryModel.getData();
                let maxDate;
                if (signatoryData.length > 0) {
                    const retData = signatoryData.reduce((max, current) => {
                        return max.ValidTill > current.ValidTill ? max : current;
                    });
                    maxDate = new Date(retData.ValidTill);
                    maxDate.setDate(maxDate.getDate() + 1);
                    // } else {
                    //     maxDate = new Date();
                    // }
                    Core.byId("dp_validFrom").setMinDate(maxDate);
                    Core.byId("dp_validTill").setMinDate(maxDate);
                }
                this.extAddSignatory.open();
            },

            onPressEdit: function () {
                this.getView().getModel().setProperty("/toggleEdit", false);
            },

            /** Exit from Edit Mode */
            onPressCancel: function () {
                var _self = this;
                MessageBox.confirm("Your entries will be lost ! Do you really want to cancel ?", {
                    actions: [
                        MessageBox.Action.OK, MessageBox.Action.CANCEL
                    ],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction == "OK") {

                            _self.configModel.setData(JSON.parse(sessionStorage.getItem("originalAppConfig")));
                            _self.signatoryModel.setData(JSON.parse(sessionStorage.getItem("originalInvoiceSignatory")));

                            _self.getView().getModel().setProperty("/toggleEdit", true);
                        }
                    }
                });
            },

            onPressSave: function () {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                const reqPayload = {
                    configData: this.configModel.getData(),
                    invoiceSignatory: this.signatoryModel.getData()
                }
                jQuery.ajax({
                    url: _self.sURL + "config/saveConfigurationDetails",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(
                        { Data: JSON.stringify(reqPayload) }
                    ),
                    success: function (response, textStatus, jqXHR) {
                        if (response) {
                            if (response?.value?.status == 200) {
                                MessageBox.success('Configuration Updated successfully.');
                                _self._getConfigData();
                            }
                        }
                        sap.ui.core.BusyIndicator.hide();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        MessageBox.error("Something went wrong. Please try again");
                        sap.ui.core.BusyIndicator.hide();
                    },
                });

            },

            onPressDeleteSignatory: function (oEvent) {
                var index = oEvent.getParameter("row").getIndex();
                var oTable = this.getView().byId("tbl_invoiceSignatory");
                var _self = this;
                MessageBox.confirm("Are you sure you want to delete this item?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            var model = oTable.getModel("signatoryModel");
                            var data = model.getData();
                            data.splice(index, 1);
                            model.setData(data);
                            _self.signatoryModel.refresh();
                        }
                    }
                });
            },

            formatSignature: function (sValue1, sValue2) {
                if (sValue1 && sValue2) {
                    return `data:${sValue1};base64,` + sValue2;
                }
            }
        });
    });

function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}
