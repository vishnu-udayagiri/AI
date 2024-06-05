
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
        JSONModel, exportLibrary, Spreadsheet, Engine, SelectionController, SortController, GroupController, MetadataHelper, Sorter) {
        "use strict";
        var EdmType = exportLibrary.EdmType;
        return Controller.extend("airindiagst.controller.amendmentRequest", {
            formatter: formatter,
            onAfterRendering: function () {
            },
            onInit: function () {

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("amendmentRequest").attachPatternMatched(this._routeMatched, this);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/hinticon", true);
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
                this._registerForP13n();
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
                    { key: "col_doctyp", label: "Document Type", path: "DOCUMENTTYPE" },
                    { key: "col_invnum", label: "Document Number", path: "INVOICENUMBER" },
                    { key: "col_invdat", label: "Document Date", path: "INVOICEDATE" },
                    { key: "col_pnr", label: "PNR", path: "PNR" },
                    { key: "col_ticnum", label: "Ticket Number", path: "TICKETNUMBER" },
                    { key: "col_ticisdat", label: "Ticket Issue Date", path: "TICKETISSUEDATE" },
                    { key: "col_passgstin", label: "Passenger GSTIN", path: "PASSENGERGSTIN" },
                    { key: "col_suppgstin", label: "Supplier GSTIN", path: "SUPPLIERGSTIN" },
                    { key: "col_iata", label: "IATA Code", path: "IATANUMBER" },
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
                var oTable = this.byId("tbl_amendment");

                Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
                    contentHeight: "35rem",
                    contentWidth: "32rem",
                    source: oEvt.getSource()
                });
            },

            onSort: function (oEvt) {
                var oTable = this.byId("tbl_amendment");
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

            restore: function () {
                var oFilterBar = this.byId("filterbar");
                oFilterBar.getAllFilterItems().forEach(function (oFilterItem) {
                    oFilterItem.setVisibleInFilterBar(true);
                });
            },
            onColumnMove: function (oEvt) {
                var oTable = this.byId("tbl_amendment");
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
                var oTable = this.byId("tbl_amendment");
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

            createColumnConfig: function (mstrtyp, Rowtype) {
                var header;
                var data;
                header = [
                    {
                        label: 'Invoice Number',
                        property: 'invoiceNumber',
                        type: 'EdmType.String',

                    }
                    , {
                        label: 'New GSTIN',
                        property: 'gstin'
                    },
                    {
                        label: 'Reason',
                        property: 'amendmentReason'
                    }

                ];
                data = [{

                    "invoiceNumber": "invoiceNumber",
                    "gstin": "gstin",
                    "amendmentReason": "amendmentReason",

                }];
                if (Rowtype == "Header") {
                    return header;
                } else {
                    return data;
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
            // change: async function (oEvent) {
            //     /** Check if the file is of considered type */

            //     const fileUpload = this.getView().byId("fileUploader");
            //     const file = fileUpload.getDomRef("fu").files[0];

            //     await isImage(file, function (isImage) {
            //         fileUpload.setValueState("None");
            //         if (!isImage) {
            //             fileUpload.setValue();
            //             fileUpload.setValueState("Error").setValueStateText("Invalid file format. Please upload an image of format: JPEG, JPG, PNG");
            //         }
            //     });

            //     // Function to check if a file is an image based on its content
            //     function isImage(file, callback) {
          
            //         const reader = new FileReader();

            //         reader.onloadend = function () {
            //             // Get the first few bytes of the file (usually enough to determine the file type)
            //             const arr = new Uint8Array(reader.result).subarray(0, 4);
            //             let header = "";
            //             for (let i = 0; i < arr.length; i++) {
            //                 header += arr[i].toString(16);
            //             }

            //             // Check if the file matches common image file signatures
            //             if (header.startsWith("89504e47") || // PNG
            //                 header.startsWith("ffd8ffe0") // JPEG/JPG
            //             ) {
            //                 callback(true);
            //             } else {
            //                 callback(false);
            //             }

            //             // header.startsWith("25504446") || // PDF
            //             // header.startsWith("504b0304") || // DOCX
            //             // header.startsWith("504b0304") || // XLSX
            //             // header.startsWith("d0cf11e0")) {  // DOC or XLS

            //         };

            //         // Read the file content
            //         reader.readAsArrayBuffer(file);
            //     }
            // },
            change: async function () {
                return new Promise((resolve, reject) => {
                    // Check if the file is of considered type
               
                    var _self = this;
                    const fileUpload = this.getView().byId("fileUploader");
                    const file = fileUpload.getDomRef("fu").files[0];
                  
                    isImage(file, function (isImage) {
                        if (!isImage) {
                            MessageBox.error("Invalid file format. Please upload an excel of format as XLSX");
                            _self.getView().byId("fileUploader").clear();
                            _self.validfileflag = false;
                            // Clear the File Name and File Type fields
                           
                            // Update the model
                         
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
            

            handleUploadPress:async function (oEvent) {
                var _self = this;
                sap.ui.core.BusyIndicator.show();
                _self.validfileflag = true;
                var fileUpload = _self.getView().byId("fileUploader");
                var domref = _self.getView().byId("fileUploader").sId;
                var file = sap.ui.getCore().byId(domref).getDomRef("fu").files[0];
                var valflag = true;
                if (file == 'undefined' || file == null || file == "") {
                    MessageBox.error("Please select the excel file you want to upload.");
                    sap.ui.core.BusyIndicator.hide();
                } else {
                    await this.change();
                    if ((file) && (this.validfileflag)) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var Base64 = {
                            _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
                            encode: function (e) {
                                var t = "";
                                var n, r, i, s, o, u, a;
                                var f = 0;
                                e = Base64._utf8_encode(e);
                                while (f < e.length) {
                                    n = e.charCodeAt(f++);
                                    r = e.charCodeAt(f++);
                                    i = e.charCodeAt(f++);
                                    s = n >> 2;
                                    o = (n & 3) << 4 | r >> 4;
                                    u = (r & 15) << 2 | i >> 6;
                                    a = i & 63;
                                    if (isNaN(r)) {
                                        u = a = 64
                                    } else if (isNaN(i)) {
                                        a = 64
                                    }
                                    t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
                                }
                                return t
                            },
                            decode: function (e) {
                                var t = "";
                                var n, r, i;
                                var s, o, u, a;
                                var f = 0;
                                e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                                while (f < e.length) {
                                    s = this._keyStr.indexOf(e.charAt(f++));
                                    o = this._keyStr.indexOf(e.charAt(f++));
                                    u = this._keyStr.indexOf(e.charAt(f++));
                                    a = this._keyStr.indexOf(e.charAt(f++));
                                    n = s << 2 | o >> 4;
                                    r = (o & 15) << 4 | u >> 2;
                                    i = (u & 3) << 6 | a;
                                    t = t + String.fromCharCode(n);
                                    if (u != 64) {
                                        t = t + String.fromCharCode(r);
                                    }
                                    if (a != 64) {
                                        t = t + String.fromCharCode(i);
                                    }
                                }
                                t = Base64._utf8_decode(t);
                                return t;
                            },
                            _utf8_encode: function (e) {
                                e = e.replace(/\r\n/g, "\n");
                                var t = "";
                                for (var n = 0; n < e.length; n++) {
                                    var r = e.charCodeAt(n);
                                    if (r < 128) {
                                        t += String.fromCharCode(r);
                                    } else if (r > 127 && r < 2048) {
                                        t += String.fromCharCode(r >> 6 | 192);
                                        t += String.fromCharCode(r & 63 | 128);
                                    } else {
                                        t += String.fromCharCode(r >> 12 | 224);
                                        t += String.fromCharCode(r >> 6 & 63 | 128);
                                        t += String.fromCharCode(r & 63 | 128);
                                    }
                                }
                                return t;
                            },
                            _utf8_decode: function (e) {
                                var t = "";
                                var c1, c2;
                                var n = 0;
                                var r = c1 = c2 = 0;
                                while (n < e.length) {
                                    r = e.charCodeAt(n);
                                    if (r < 128) {
                                        t += String.fromCharCode(r);
                                        n++;
                                    } else if (r > 191 && r < 224) {
                                        c2 = e.charCodeAt(n + 1);
                                        t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                                        n += 2
                                    } else {
                                        c2 = e.charCodeAt(n + 1);
                                        var c3 = e.charCodeAt(n + 2);
                                        t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                                        n += 3;
                                    }
                                }
                                return t;
                            }
                        };

                        var data = e.target.result;
                        var sBase64 = btoa(data);
                        const reqData = {
                            excel: sBase64

                        }
                     _self.SendRequest(_self, "/portal-api/portal/v1/excelUpload/amendment-request", "POST", {}, JSON.stringify(reqData), (_self, data, message) => {
                            sap.ui.core.BusyIndicator.hide();
                            if (data) {
                                var base64Data = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + data.processedExcelFile;
                             
                                const link = document.createElement('a');

                                link.href = base64Data;

                                link.download = "Amendment Template Status";

                                link.click();
                                _self.onSearch(oEvent);
                                MessageBox.success("File uploaded successfully.Please check the status of the invoices in the downloaded excel file.")
                                _self.getView().byId("fileUploader").clear();

                                sap.ui.core.BusyIndicator.hide();
                            }
                            else {
                                _self.getView().byId("fileUploader").clear();
                                var message = message.Text;
                                if (message) {
                                    MessageBox.error(message);
                                }
                                else {
                                    MessageBox.error("Something went wrong!");
                                }

                            }
                        
                        });


                      
                    };

                    reader.readAsBinaryString(file);
                }
                }
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
                // this.setValuesToSearchHelp(oEvent);
                var sInputValue = oEvent.getSource().getValue();
                //this.InputId = oEvent.getSource().getId();
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
                //this._OpenBusyDialogNoDelay();

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

                sId.getAggregation("tokenizer").setEditable(false)
              
            },

            // handleValueHelpSearchticketNum: function (oEvent) {
            //     var sValue = oEvent.getParameter("value");
            //     var oFilter = new sap.ui.model.Filter({
            //         filters: [
            //             new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
            //         ],
            //         and: false
            //     });
            //     oEvent.getSource().getBinding("items").filter([oFilter]);
            // },
            handleValueHelpSearchticketNum: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var val = oEvent.getParameter("value").trim();
                if(val !== ""){
                this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "ticketNumber": val, "apiType": "Document" }), (_self, data, message) => {
 
                    var oModelData = new sap.ui.model.json.JSONModel();
                    if (data !== null) {
                        _self.filterJson;
                        _self.filterJsonUpdated = data.filters;
                        _self.filterJson.ticketNumber = _self.filterJson.ticketNumber.concat(data.filters.ticketNumber.filter(function (item) {
                            return _self.filterJson.ticketNumber.indexOf(item) === -1; // Check for uniqueness
                        }));
                        oModelData.setData(_self.filterJson);
                        _self.getView().setModel(oModelData, "FilterDatamodel");
                        var sValue = oEvent.getParameter("value").trim();
                        var oFilter = new sap.ui.model.Filter({
                            filters: [
                                new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                            ],
                            and: false
                        });
                        oEvent.getSource().getBinding("items").filter([oFilter]);
                        sap.ui.core.BusyIndicator.hide();
                    }else {
                        var oModelData = new sap.ui.model.json.JSONModel();
                oModelData.setData(null);
                _self.getView().setModel(oModelData, "FilterDatamodel");
                        sap.ui.core.BusyIndicator.hide();
                    }
                });
            }
            else {
                var oModelData = new sap.ui.model.json.JSONModel();
                oModelData.setData(_self.filterJson);
                _self.getView().setModel(oModelData, "FilterDatamodel");
                sap.ui.core.BusyIndicator.hide();
            }
            },

            readInvoicesFromAmendment: function (oEvent) {
                var filterval = {

                };
                this.loopfilters = {};

                filterval.apiType = "AmendmentRequest";
                filterval.isInitial = true;
                if (this.ISB2A_flag == true) {
                    filterval.bookingType = this.bookingType;
                }
                else {
                    filterval.bookingType = "my bookings";
                }
                filterval.pageNumber = 1;
                filterval.pageSize = 500;
                this.loopfilters = filterval;
                this.SendRequest(this, "/portal-api/portal/v1/get-user-invoices", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {

                    sap.ui.core.BusyIndicator.hide();
                    _self.GSTDetails = data;
                 

                    if (data) {
                        _self.oModel = new sap.ui.model.json.JSONModel([]);
                        _self.oModel.setData(_self.GSTDetails.invoices);

                        var oModelData = new sap.ui.model.json.JSONModel([]);

                        if (data.filters) {
                            _self.filterJson = data.filters;
                            oModelData.setData(_self.filterJson);
                            _self.getView().setModel(oModelData, "FilterDatamodel");
                            _self.byId("fbmc-TIMELINE").setSelectedKey(_self.filterJson.invoiceFilter);

                            // _self.getView().byId("fbmc-GSTIN").setSelectedKeys(_self.filterJson.defaultGSTIN);
                            if (this.category === "07") {
                                _self.filterJson.iataNumber.forEach(function (token) {

                                    _self.getView().byId("fbinp-iataNumber").addToken(new sap.m.Token({
                                        text: token.IATANUMBER
                                    }));
                                });
                            }
                        }
                        if (data.invoices.length > 0) {

                            _self.getView().byId("btn-excel").setVisible(true);
                            _self.getView().byId("btn-pdf").setVisible(true);

                        } else {
                            _self.getView().byId("btn-excel").setVisible(false);
                            _self.getView().byId("btn-pdf").setVisible(false);

                        }
                    }
                    else if (data === null) {

                        _self.GSTDetails = null;
                    }

                    _self.oModel.setData(_self.GSTDetails);
                    _self.getView().setModel(_self.oModel, "GSTDetailsModel");
                    _self.onSearch();

                });

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
            handleDateChange: function (oEvent) {
                var oDP = oEvent.getSource(),
                    bValid = oEvent.getParameter("valid");
                if (bValid) {
                    oDP.setValueState("None");
                } else {
                    oDP.setValueState("Error");
                }
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
                sId.getAggregation("tokenizer").setEditable(false);
            },
            handleValueHelpbuyername: function (oEvent) {

                var sInputValue = oEvent.getSource().getValue();
              
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.buyerNameDialog) {
                    this.buyerNameDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.passengerFIlterDialog", this);
                    this.getView().addDependent(this.buyerNameDialog);
                }
               
                var oList = this.buyerNameDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.buyerNameDialog._aSelectedItems;
                this.buyerNameDialog.open();
              

            },
            // handleValueHelpSearchpassengergstin: function (oEvent) {
            //     var sValue = oEvent.getParameter("value");
            //     var oFilter = new sap.ui.model.Filter({
            //         filters: [
            //             new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
            //         ],
            //         and: false
            //     });
            //     oEvent.getSource().getBinding("items").filter([oFilter]);
               
            // },
            handleValueHelpSearchpassengergstin: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var val = oEvent.getParameter("value").trim();
                if(val !== ""){
                this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "passengerGSTIN": val, "apiType": "Document" }), (_self, data, message) => {
 
                    var oModelData = new sap.ui.model.json.JSONModel();
                    if (data !== null) {
                        _self.filterJson;
                        _self.filterJsonUpdated = data.filters;
                        _self.filterJson.passengerGSTIN = _self.filterJson.passengerGSTIN.concat(data.filters.passengerGSTIN.filter(function (item) {
                            return _self.filterJson.passengerGSTIN.indexOf(item) === -1; // Check for uniqueness
                        }));
                        oModelData.setData(_self.filterJson);
                        _self.getView().setModel(oModelData, "FilterDatamodel");
                        var sValue = oEvent.getParameter("value").trim();
                        var oFilter = new sap.ui.model.Filter({
                            filters: [
                                new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                            ],
                            and: false
                        });
                        oEvent.getSource().getBinding("items").filter([oFilter]);
                        sap.ui.core.BusyIndicator.hide();
                    }else {
                        var oModelData = new sap.ui.model.json.JSONModel();
                oModelData.setData(null);
                _self.getView().setModel(oModelData, "FilterDatamodel");
                        sap.ui.core.BusyIndicator.hide();
                    }
                });
            }
            else {
                var oModelData = new sap.ui.model.json.JSONModel();
                oModelData.setData(_self.filterJson);
                _self.getView().setModel(oModelData, "FilterDatamodel");
                sap.ui.core.BusyIndicator.hide();
            }
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
            // handleValueHelpSearchpassengername: function (oEvent) {
            //     var sValue = oEvent.getParameter("value");
            //     var oFilter = new sap.ui.model.Filter({
            //         filters: [
            //             new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
            //         ],
            //         and: false
            //     });
            //     oEvent.getSource().getBinding("items").filter([oFilter]);
               
            // },
            handleValueHelpSearchpassengername: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var val = oEvent.getParameter("value").trim();
                if(val !== ""){
                this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "passengerName": val, "apiType": "Document" }), (_self, data, message) => {
 
                    var oModelData = new sap.ui.model.json.JSONModel();
                    if (data !== null) {
                        _self.filterJson;
                        _self.filterJsonUpdated = data.filters;
                        _self.filterJson.passengerName = _self.filterJson.passengerName.concat(data.filters.passengerName.filter(function (item) {
                            return _self.filterJson.passengerName.indexOf(item) === -1; // Check for uniqueness
                        }));
                        oModelData.setData(_self.filterJson);
                        _self.getView().setModel(oModelData, "FilterDatamodel");
                        var sValue = oEvent.getParameter("value").trim();
                        var oFilter = new sap.ui.model.Filter({
                            filters: [
                                new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                            ],
                            and: false
                        });
                        oEvent.getSource().getBinding("items").filter([oFilter]);
                        sap.ui.core.BusyIndicator.hide();
                    }else {
                        var oModelData = new sap.ui.model.json.JSONModel();
                oModelData.setData(null);
                _self.getView().setModel(oModelData, "FilterDatamodel");
                        sap.ui.core.BusyIndicator.hide();
                    }
                });
            }
            else {
                var oModelData = new sap.ui.model.json.JSONModel();
                oModelData.setData(_self.filterJson);
                _self.getView().setModel(oModelData, "FilterDatamodel");
                sap.ui.core.BusyIndicator.hide();
            }
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
                  this.getView().byId("fbinp-invoiceNumber").removeAllTokens();
                  this.getView().byId("fbinp-GSTIN").removeAllTokens();
                this.getView().byId("fbinp-buyername").removeAllTokens();
                this.getView().byId("fbdat-invoiceDate").setValue("");
                this.getView().byId("fbdat-ticketIssueDate").setValue("");
                this.getView().byId("fbdat-invoiceDate").setValueState("None").setValueStateText("");
                this.getView().byId("fbdat-ticketIssueDate").setValueState("None").setValueStateText("");
                this.getView().byId("fbmc-GSTINAI").setSelectedKeys(null);
                this.category = decodedData.category;
                if (decodedData.category == "07") {
                    decodedData.ISB2A = true
                }
                if (decodedData.ISB2A == true) {
                    if (decodedData.category == "07") {
                        this.byId("b2aSegments").setVisible(false);
                        this.byId("b2aSegments").setSelectedKey("BOOKEDTHROUGH");
                        this.ISB2A_flag = true;
                        this.bookingType = "booked through";
                        // this.byId("fbmc-GSTIN").removeAllTokens();

                        this.byId("tbl_amendment").setVisible(false);
                        this.byId("panel_table").setVisible(false); 
                        this.byId("buyergst").setVisible(false);
                    } else {

                        // this.byId("fbinp-iataNumber").setEnabled(false);
                        this.byId("b2aSegments").setVisible(true);
                        this.bookingType = "my bookings";
                        this.byId("buyergst").setVisible(true);
                        this.byId("b2aSegments").setSelectedKey("MYBOOKINGS")
                        this.ISB2A_flag = true;
                    }
                } else {
                    this.bookingType = "my bookings";
                    this.changeB2AViewFlag = false;
                    this.ISB2A_flag = false;
                    this.byId("fbinp-iataNumber").setEnabled(true);
                    this.byId("b2aSegments").setVisible(false);
                }
                this.getView().byId("fbmc-DocType").setSelectedKeys("INVOICE");
                this.readInvoicesFromAmendment();

                this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", " " + decodedData.FirstName + ' ' + decodedData.LastName);
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "Request for Amendment");
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", true);
             
            },
            onchangeB2Aview: function (oEvent) {
                var segmentkey = oEvent.getSource().getSelectedKey();
                var segmentItem = oEvent.getSource().getSelectedItem();
                var _self = this;
                sap.ui.core.BusyIndicator.show();

                this.changeB2AViewFlag = true;


                if (segmentkey == "BOOKEDTHROUGH") {
                    this.getView().byId("fbinp-GSTIN").removeAllTokens();
                    // this.byId("fbmc-GSTIN").setSelectedKeys("");
                    this.getView().byId("fbinp-pnr").removeAllTokens();
                    this.getView().byId("fbinp-iataNumber").removeAllTokens();
                    this.getView().byId("fbinp-ticketNumber").removeAllTokens();
                    this.getView().byId("fbinp-invoiceNumber").removeAllTokens();
                    this.getView().byId("fbinp-buyername").removeAllTokens();
                    if (this.iataNumberDialog) {
                        this.iataNumberDialog.clearSelection(true);
                    }
                    if (this.pnrNumDialog) {
                        this.pnrNumDialog.clearSelection(true);
                    }
                    if (this.ticketNumberDialog) {
                        this.ticketNumberDialog.clearSelection(true);
                    }
                    if (this.invNumberDialog) {
                        this.invNumberDialog.clearSelection(true);
                    }
                    if (this.buyerNameDialog) {
                        this.buyerNameDialog.clearSelection(true);
                    }

                    this.getView().byId("fbdat-invoiceDate").setValue("");
                    this.getView().byId("fbdat-ticketIssueDate").setValue("");
                    this.getView().byId("fbmc-GSTINAI").setSelectedKeys(null);

                    _self.byId("buyergst").setVisible(false);
                    _self.bookingType = "booked through";

                    this.onSearch(oEvent);
                }
                else {
                    this.getView().byId("fbinp-pnr").removeAllTokens();
                    this.getView().byId("fbinp-iataNumber").removeAllTokens();
                    this.getView().byId("fbinp-ticketNumber").removeAllTokens();
                    this.getView().byId("fbinp-invoiceNumber").removeAllTokens();
                    this.getView().byId("fbinp-buyername").removeAllTokens();
                    if (this.iataNumberDialog) {
                        this.iataNumberDialog.clearSelection(true);
                    }
                    if (this.pnrNumDialog) {
                        this.pnrNumDialog.clearSelection(true);
                    }
                    if (this.ticketNumberDialog) {
                        this.ticketNumberDialog.clearSelection(true);
                    }
                    if (this.invNumberDialog) {
                        this.invNumberDialog.clearSelection(true);
                    }
                    if (this.buyerNameDialog) {
                        this.buyerNameDialog.clearSelection(true);
                    }

                    this.getView().byId("fbmc-DocType").setSelectedKeys("INVOICE");
                    this.getView().byId("fbdat-invoiceDate").setValue("");
                    this.getView().byId("fbdat-ticketIssueDate").setValue("");
                    this.getView().byId("fbmc-GSTINAI").setSelectedKeys(null);
                    this.byId("fbmc-TIMELINE").setSelectedKey(this.filterJson.invoiceFilter);

                    this.byId("buyergst").setVisible(true);
                    this.getView().byId("fbinp-GSTIN").removeAllTokens();
                    // this.byId("fbmc-GSTIN").setSelectedKeys(this.filterJson.defaultGSTIN);
                    this.bookingType = "my bookings";
                    this.onSearch(oEvent);

                }
            },

            onPressExportExcel: function () {
                var filterval = {

                };
                sap.ui.core.BusyIndicator.show();
                // Assuming you have a reference to the table
                var oTable = this.byId("tbl_amendment");

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
                    filterval.apiType = "AmendmentRequest";
                    if (this.ISB2A_flag == true) {
                        filterval.bookingType = this.bookingType;
                    }
                    else {
                        filterval.bookingType = "my bookings";
                    }
                    filterval.generateExcel = true;
                    filterval.columns = {
                        "DOCUMENTTYPE": "Document Type",
                        "INVOICENUMBER": "Document Number",
                        "INVOICEDATE": "Document Date",
                        "PNR": "PNR",
                        "TICKETNUMBER": "Ticket No.",
                        "TICKETISSUEDATE": "Ticket Issue Date",
                        "PASSENGERGSTIN": "Passenger GSTIN",
                        "SUPPLIERGSTIN": "Supplier GSTIN",
                        "IATANUMBER": "IATA Code",
                        "TOTALINVOICEAMOUNT": "Total Invoice Amount"
                    };

                    // Now, aSelectedInvoiceNumbers contains the INVOICENUMBER of all selected rows
             
                    this.SendRequest(this, "/portal-api/portal/v1/get-user-invoices", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                        sap.ui.core.BusyIndicator.hide();
                        if (data) {
                            var base64Data = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + data.excel;
                   
                            const link = document.createElement('a');

                            link.href = base64Data;

                            link.download = "Amendment Request Documents";

                            link.click();
                        }
                        else {
                            MessageBox.error("Something went wrong!");

                        }

                    });
                }
                else {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.information("Please select the documents for exporting excel.");


                }

            },

            onTemplateDownload: function () {
                var filterval = {

                };
                sap.ui.core.BusyIndicator.show();
             
                this.SendRequest(this, "/portal-api/portal/v1/excelUpload/get-amendment-excel-template", "GET", {}, JSON.stringify(filterval), (_self, data, message) => {
                    var base64Data = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + data.excelBase64;
                   
                    const link = document.createElement('a');

                    link.href = base64Data;

                    link.download = "Amendment Template";

                    link.click();


                    sap.ui.core.BusyIndicator.hide();
                });

            },

            onSearch: function (oEvent) {
                this.getView().byId("tbl_amendment").clearSelection();
                if (!this.getView().byId("filterbar").isDialogOpen()) {
                    sap.ui.core.BusyIndicator.show();

                    var filter = new Array();
                    var filterval = {};
                    filterval.apiType = "AmendmentRequest";
                    var _self = this;


                    if (this.ISB2A_flag == true) {
                        filterval.bookingType = this.bookingType;


                    }
                    else {
                        filterval.bookingType = "my bookings";
                    }
                    if (!oEvent) {
                        this.filtered_GSTDetails.invoices = this.GSTDetails.invoices.filter(function (item) {
                            return _self.selectedGSTN_array.includes(item.SUPPLIERGSTIN);
                        });
                        if (_self.GSTDetails.invoices.length > 0) {
                            _self.getView().byId("morelink").setVisible(true);
                            _self.getView().byId("title").setText("Documents (1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");
                        } else {
                            _self.getView().byId("title").setText("Documents (" + _self.GSTDetails.invoices.length + ")");
                            _self.getView().byId("morelink").setVisible(false);

                        }
                        _self.getView().getModel("GSTDetailsModel").setData(_self.GSTDetails);
                        _self.getView().getModel("GSTDetailsModel").refresh();
                        _self.getView().getModel("FilterDatamodel").refresh();
                        _self.byId("panel_table").setVisible(true);

                        _self.byId("tbl_amendment").setVisible(true);

                        sap.ui.core.BusyIndicator.hide();
                    } else {
                        if (this.changeB2AViewFlag) {
                            filterval.isInitial = true;
                        } else {
                            filterval.isInitial = false;
                        }
                        this.loopfilters = {};
                        if (filterval.isInitial === false) {
                            if (this.getView().byId("fbmc-DocType").getSelectedKeys()) {
                                filterval.documentType = this.getView().byId("fbmc-DocType").getSelectedKeys();

                            }
                        }
                    //     if (this.changeB2AViewFlag == false) {
                    //     if (filterval.bookingType === "my bookings") {
                    //         if (this.getView().byId("fbinp-GSTIN").getTokens().length < 1) {
                    //             MessageBox.error("Please select atleast one Passenger GSTIN");
                    //             sap.ui.core.BusyIndicator.hide();
                    //             return false;

                    //         }

                    //     }
                    // }
                        if (this.getView().byId("fbinp-invoiceNumber").getTokens().length > 0) {
                            var invTokens = this.getView().byId("fbinp-invoiceNumber").getTokens();
                            var invToken = invTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var invarr = invToken.split(',');

                            filterval.invoiceNumber = invarr;
                        }
                        if (this.getView().byId("fbinp-pnr").getTokens().length > 0) {
                            var pnrTokens = this.getView().byId("fbinp-pnr").getTokens();
                            var pnrToken = pnrTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var pnrarr = pnrToken.split(',');

                            filterval.pnr = pnrarr;
                        }
                        if (this.getView().byId("fbmc-GSTINAI").getSelectedKeys() != "") {
                        
                            filterval.supplierGSTIN = this.getView().byId("fbmc-GSTINAI").getSelectedKeys();
                        }
                        if (filterval.isInitial === false) {
                            if (this.getView().byId("fbinp-GSTIN").getTokens().length > 0) {
                             
                                var passengerGstinTokens = this.getView().byId("fbinp-GSTIN").getTokens();
                                var passengerGstinToken = passengerGstinTokens.map(function (oToken) {
                                    return oToken.mProperties.text;
                                }).join(",");
                                var passgstinarr = passengerGstinToken.split(',');
    
                                filterval.passengerGSTIN = passgstinarr;
                            }
                        }
                        if (this.getView().byId("fbinp-buyername").getTokens().length > 0) {
                            var buyerTokens = this.getView().byId("fbinp-buyername").getTokens();
                            var buyerToken = buyerTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var buyerarr = buyerToken.split(',');

                            filterval.billToName = buyerarr;
                        }
                        if (filterval.isInitial === false) {
                            if (this.getView().byId("fbinp-iataNumber").getTokens().length > 0) {
                                var iataTokens = this.getView().byId("fbinp-iataNumber").getTokens();
                                var iataToken = iataTokens.map(function (oToken) {
                                    return oToken.mProperties.text;
                                }).join(",");
                                var iataarr = iataToken.split(',');

                                filterval.iataNumber = iataarr;
                            }
                        }
                        if (this.getView().byId("fbinp-ticketNumber").getTokens().length > 0) {
                            
                            var ticTokens = this.getView().byId("fbinp-ticketNumber").getTokens();
                            var ticToken = ticTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var ticarr = ticToken.split(',');
                            filterval.ticketNumber = ticarr;
                           
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
                        if (this.getView().byId("fbdat-ticketIssueDate").getValue()) {
                            if(this.byId("fbdat-ticketIssueDate").isValidValue()){
                            var daterange = this.getView().byId("fbdat-ticketIssueDate").getValue().split("to");
                            var formattedDates = daterange.map(date => {
                                let parts = date.trim().split('/');
                                return `${parts[2]}/${parts[1]}/${parts[0]}`;
                            });
                            filterval.ticketIssueDateFrom = formattedDates[0].trim();
                            filterval.ticketIssueDateTo = formattedDates[1].trim();
                            }
                            else{
                                MessageBox.error("Please choose a valid Date");
                                sap.ui.core.BusyIndicator.hide();
                                return false;

                            }
                        }

                        filterval.pageNumber = 1;
                        filterval.pageSize = 500;
                        this.loopfilters = filterval;

                        this.SendRequest(this, "/portal-api/portal/v1/get-user-invoices", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {


                            sap.ui.core.BusyIndicator.hide();
                            if (data) {
                                _self.changeB2AViewFlag = false;
                                _self.GSTDetails = data;
                                if (_self.GSTDetails.invoices.length > 0) {
                                    _self.getView().byId("btn-excel").setVisible(true);
                                
                                    _self.getView().byId("btn-pdf").setVisible(true);

                                } else {
                                    _self.getView().byId("btn-excel").setVisible(false);
                                    
                                    _self.getView().byId("btn-pdf").setVisible(false);

                                }
                                if (_self.GSTDetails.invoices.length > 0) {
                                    _self.getView().byId("morelink").setVisible(true);
                                    _self.getView().byId("title").setText("Documents (1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");
                                    
                                } else {
                                    _self.getView().byId("title").setText("Documents (" + _self.GSTDetails.invoices.length + ")");
                                    _self.getView().byId("morelink").setVisible(false);

                                }
                               
                                if (filterval.isInitial == true) {
                                  
                                    _self.getView().getModel("FilterDatamodel").setData(_self.GSTDetails.filters);
                                    _self.getView().getModel("FilterDatamodel").refresh();
                                }

                                this.oModel = new sap.ui.model.json.JSONModel([]);

                                this.oModel.setData(_self.GSTDetails);

                                _self.getView().setModel(this.oModel, "GSTDetailsModel");
                            }
                            else if (data === null) {

                                this.oModel = new sap.ui.model.json.JSONModel([]);

                                this.oModel.setData(null);

                                _self.getView().setModel(this.oModel, "GSTDetailsModel");
                            }

                        });
                    }

                }
            },
            onButtonDownloadPress: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                const oTable = this.byId("tbl_amendment");
                const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                const oSelIndices = oTable.getSelectedIndices();
                const aInvoices = [];
                if (oSelIndices.length) {
                    var oModel = oTable.getModel("GSTDetailsModel");
                    oSelIndices.forEach(function (iIndex) {
                        var oContext = oTable.getContextByIndex(iIndex);
                        var oData = oModel.getProperty(null, oContext);
                        const ID = oData.ID;
                        aInvoices.push({ ID })
                    });
                    if(oSelIndices.length > 20000){
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageBox.warning("Downloading PDF is restricted to only 20000 Documents.Please select lesser documents.")
                    }else{
                    if (oSelIndices.length > 1) {
                        this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices: aInvoices }), (_self, data, message) => {
                         
                            const invoices = data.invoice;
                            const base64Data = "data:application/zip;base64," + invoices;
                            const link = document.createElement('a');
                            link.href = base64Data;
                            link.download = `Amendment Request Documents`;
                            link.click();
                            sap.ui.core.BusyIndicator.hide();
                            const responseData = data.invoiceNumber;
                            if (responseData.notGenerated.length > 0) {
                                const generatedString = responseData.notGenerated.join(', ');
                                MessageBox.warning("List of documents pending for invoice generation.", {
                                    title: "Download status",
                                    id: "messageBoxId1",
                                    details: generatedString,
                                    contentWidth: "100px"
                                });
                            }
                        });
                       
                    } else {
                        this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices: aInvoices }), (_self, data, message) => {
                            const invoices = data.invoice;
                            const base64Data = "data:application/pdf;base64," + invoices;
                            const link = document.createElement('a');
                            link.href = base64Data;
                            link.download = `Invoice - ${data.invoiceNumber}`;
                            link.click();
                            sap.ui.core.BusyIndicator.hide();
                            const responseData = data.invoiceNumber;
                            if (responseData.notGenerated.length > 0) {
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
                    }
                } else {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.information("Please select the documents for downloading.");
                }
            },
            
            onButtonDownloadPresssingle: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                const oTable = this.byId("tbl_amendment");
                var row = oEvent.getParameter("row").getIndex()
                var val = oEvent.getParameter("row").getBindingContext("GSTDetailsModel").getProperty("ID");
                const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
               
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
             
                    var index = this.aContexts.indexOf(this.aContexts[type].getPath());
                    this.aContexts.splice(index, 1);
                }
            },
            handleValueHelpinvoiceNum: function (oEvent) {
                
                var sInputValue = oEvent.getSource().getValue();
              
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

            handleValueHelpAmendment: function (oEvent) {
                var _self = this;
                _self.gstinflag = false;
                const oTable = this.byId("tbl_amendment");
                // sap.ui.getCore().byId("ca_gst").setVisible(false);
                const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                const oSelIndices = oTable.getSelectedIndices();
                const aInvoices = [];
                if (oSelIndices.length) {
                    var oModel = oTable.getModel("GSTDetailsModel");
                    oSelIndices.forEach(function (iIndex) {
                        var oContext = oTable.getContextByIndex(iIndex);
                        var oData = oModel.getProperty(null, oContext);
                        var invNum = oData.INVOICENUMBER;
                        var gstin = oData.PASSENGERGSTIN;
                        var address = oData.BILLTOFULLADDRESS;
                        var doc_typ = oData.DOCUMENTTYPE;
                        aInvoices.push({ invNum }, { gstin }, { address }, { doc_typ });
                    });
                }
                if (oSelIndices.length === 1) {
                    sap.ui.core.BusyIndicator.show();

                    var filterJson;
                    this.inputId = oEvent.getSource().getId();
                    if (!this.amendmentDialog) {
                        this.amendmentDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.amendmentRequestDialog", this);
                    }
                    this.getView().addDependent(this.amendmentDialog);
                    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.amendmentDialog);
                    var invNum = aInvoices[0].invNum;
                    var gstin = aInvoices[1].gstin;
                    var address = aInvoices[2].address;
                    if (gstin == null) {
                        gstin = "";
                    }

                    var pan = gstin.substring(2, 12);
                    var def_pan = this.filterJson.defaultGSTIN.substring(2, 12);
                    sap.ui.getCore().byId("inp-invnum").setText(invNum);
                    sap.ui.getCore().byId("inp-gstin").setText(gstin);
                    sap.ui.getCore().byId("inp-current_address").setValue(address);
                    
                    sap.ui.getCore().byId("inp-address").setVisible(false);
                    sap.ui.getCore().byId("inp-reason").setVisible(true);

                    sap.ui.getCore().byId("inp-new_address").setVisible(false);
                    sap.ui.getCore().byId("combo-act").setSelectedKey("CG");
                    if (aInvoices[3].doc_typ !== "INVOICE") {
                        sap.ui.getCore().byId("inp-address").setVisible(false);
                        sap.ui.getCore().byId("inp-newgstin").setVisible(false);
                        sap.ui.getCore().byId("combo-act").setVisible(false);
                        sap.ui.getCore().byId("inp-newgstinb2a").setVisible(false);
                        sap.ui.getCore().byId("inp-new_address").setVisible(true);
                    }
                    else {
                        if (pan !== def_pan) {
                            _self.gstinflag = true;
                            sap.ui.getCore().byId("inp-newgstin").setVisible(false);
                            sap.ui.getCore().byId("inp-newgstinb2a").setVisible(true);
                            sap.ui.getCore().byId("act_remove").setEnabled(false);
                            sap.ui.getCore().byId("combo-act").setVisible(true);
                        }
                        else {
                            sap.ui.getCore().byId("act_remove").setEnabled(true);
                            sap.ui.getCore().byId("inp-newgstin").setVisible(true);
                            sap.ui.getCore().byId("inp-newgstinb2a").setVisible(false);
                            sap.ui.getCore().byId("combo-act").setVisible(true);

                            _self.getView().getModel("FilterDatamodel").refresh();
                        }
                    }
                    _self.amendmentDialog.open();
                    sap.ui.core.BusyIndicator.hide();


                }
                else if (oSelIndices.length > 1) {
                    this.getView().byId("tbl_amendment").clearSelection();
                    MessageBox.warning("Kindly use excel upload option for the amendment of more than one invoice!")
                }
                else if (oSelIndices.length < 1) {
                    MessageBox.error("Please select a invoice!")
                }

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
            onScroll: function (oEvent) {
                var totalPages = Math.ceil(this.GSTDetails.totalInvoices / 500);
                if (this.loopfilters.pageNumber <= totalPages) {
                    this.loopfilters.pageNumber = this.loopfilters.pageNumber + 1;
                    this.SendRequest(this, "/portal-api/portal/v1/get-user-invoices", "POST", {}, JSON.stringify(this.loopfilters), (_self, data, message) => {
                        if (data.invoices.length > 0) {
                            _self.GSTDetails.invoices = [..._self.GSTDetails.invoices, ...data.invoices];
                          
                            _self.getView().byId("title").setText("Documents (1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");
                       
                            _self.getView().getModel("GSTDetailsModel").refresh();
                        }
                    });
                }
            },
            actionchange: function (oEvent) {
                var combo = oEvent.oSource.mProperties.selectedKey;
                var formid =   sap.ui.getCore().byId("simplefrag");
                var oConditionalTextArea = sap.ui.getCore().byId("inp-address");
                if (combo === "RG") {
                    sap.ui.getCore().byId("inp-newgstin").setVisible(false);               
                    sap.ui.getCore().byId("inp-new_address").setVisible(false);       
                    sap.ui.getCore().byId("inp-address").setVisible(true);
                }
                if (combo === "CG") {
                    if (this.gstinflag == true) {
                        sap.ui.getCore().byId("inp-newgstin").setVisible(false);
                        sap.ui.getCore().byId("inp-newgstinb2a").setVisible(true);
                    }
                    else {
                        sap.ui.getCore().byId("inp-newgstin").setVisible(true);
                        sap.ui.getCore().byId("inp-newgstinb2a").setVisible(false);
                    }
                    sap.ui.getCore().byId("inp-address").setVisible(false);
                    sap.ui.getCore().byId("inp-new_address").setVisible(false);

                }
                if (combo === "CA") {

                    sap.ui.getCore().byId("inp-newgstinb2a").setVisible(false);
                    sap.ui.getCore().byId("inp-address").setVisible(false);
                    sap.ui.getCore().byId("inp-newgstin").setVisible(false);
                    sap.ui.getCore().byId("inp-new_address").setVisible(true);
                }
            },
            onAmendmentRequest: function (oEvent) {
                if (this._handleInputValidation()) {
                    sap.ui.core.BusyIndicator.show();
                    var invnum = sap.ui.getCore().byId("inp-invnum").getText();
                    var oldgstin = sap.ui.getCore().byId("inp-gstin").getText();
                    var reason = sap.ui.getCore().byId("inp-reason").getValue();
                    if (sap.ui.getCore().byId("combo-act").getVisible()) {
                        var action = sap.ui.getCore().byId("combo-act").getSelectedKey();
                        if (action == "CG") {
                            if (this.gstinflag == true) {
                              var  newgstin = sap.ui.getCore().byId("inp-newgstinb2a").getValue();
                            }
                            else {
                              var   newgstin = sap.ui.getCore().byId("inp-newgstin").getSelectedKey();
                            }
                            if (newgstin === oldgstin) {
                                MessageBox.error("New GSTIN and existing GSTIN are same!")
                                sap.ui.core.BusyIndicator.hide();
                                return false;

                            }
                            else {

                                const reqData = {
                                    amendmentRequests: [{
                                        gstin: newgstin,
                                        invoiceNumber: invnum,
                                        amendmentReason: reason
                                    }]
                                }
                                this.SendRequest(this, "/portal-api/portal/v1/make-gstin-amendment", "POST", {}, JSON.stringify(reqData), (_self, data, message) => {

                                    _self.getView().byId("tbl_amendment").clearSelection();
                                    //   sap.ui.core.BusyIndicator.hide();
                                    if (data) {
                                        if (data[0].status === "SUCCESS") {

                                            MessageBox.success(data[0].message);
                                        }
                                        else {
                                            MessageBox.error(data[0].message);
                                        }
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
                        } else if (action == "RG") {
                            const reqData = {
                                amendmentRequests: [{
                                    address: sap.ui.getCore().byId("inp-address").getValue(),
                                    invoiceNumber: sap.ui.getCore().byId("inp-invnum").getText(),
                                    amendmentReason: reason
                                }]
                            }
                            this.SendRequest(this, "/portal-api/portal/v1/make-address-amendment", "POST", {}, JSON.stringify(reqData), (_self, data, message) => {

                                _self.getView().byId("tbl_amendment").clearSelection();
                                //   sap.ui.core.BusyIndicator.hide();
                                if (data) {
                                    if (data[0].status === "SUCCESS") {


                                        MessageBox.success(data[0].message);
                                    }
                                    else {
                                        MessageBox.error(data[0].message);

                                    }
                                    _self.onCloseAmendmet();
                                }
                                else {

                                    MessageBox.error("Something went wrong!");
                                    _self.onCloseAmendmet();
                                    sap.ui.core.BusyIndicator.hide();

                                }
                                this.onSearch(oEvent);

                            });
                        } else if (action == "CA") {
                            const reqData = {
                                amendmentRequests: [{
                                    address: sap.ui.getCore().byId("inp-new_address").getValue(),
                                    invoiceNumber: sap.ui.getCore().byId("inp-invnum").getText(),
                                    amendmentReason: reason
                                }]
                            }
                            this.SendRequest(this, "/portal-api/portal/v1/make-change-address-amendment", "POST", {}, JSON.stringify(reqData), (_self, data, message) => {

                              
                                _self.getView().byId("tbl_amendment").clearSelection();
                              
                                if (data) {
                                    if (data[0].status === "SUCCESS") {

                                        MessageBox.success(data[0].message);
                                    }
                                    else {
                                        MessageBox.error(data[0].message);

                                    }
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
                        const oTable = this.byId("tbl_amendment");
                        const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                        const oSelIndices = oTable.getSelectedIndices();
                        const aInvoices = [];
                        if (oSelIndices.length) {
                            var oModel = oTable.getModel("GSTDetailsModel");
                            oSelIndices.forEach(function (iIndex) {
                                var oContext = oTable.getContextByIndex(iIndex);
                                var oData = oModel.getProperty(null, oContext);
                                var doc_typ = oData.DOCUMENTTYPE;
                                aInvoices.push({ doc_typ });
                            });
                        }
                        if (aInvoices[0].doc_typ !== "INVOICE") {
                            const reqData = {
                                amendmentRequests: [{
                                    address: sap.ui.getCore().byId("inp-new_address").getValue(),
                                    invoiceNumber: sap.ui.getCore().byId("inp-invnum").getText(),
                                    amendmentReason: reason
                                }]
                            }
                            this.SendRequest(this, "/portal-api/portal/v1/make-change-address-amendment", "POST", {}, JSON.stringify(reqData), (_self, data, message) => {

                                _self.getView().byId("tbl_amendment").clearSelection();
                                if (data) {
                                    if (data[0].status === "SUCCESS") {

                                        MessageBox.success(data[0].message);
                                    }
                                    else {
                                        MessageBox.error(data[0].message);

                                    }
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

                        else {
                            const reqData = {
                                amendmentRequests: [
                                    {
                                        gstin: sap.ui.getCore().byId("inp-newgstinb2a").getValue(),
                                        invoiceNumber: invnum,
                                        amendmentReason: reason
                                    }]
                            }
                            this.SendRequest(this, "/portal-api/portal/v1/make-gstin-amendment", "POST", {}, JSON.stringify(reqData), (_self, data, message) => {

                                _self.getView().byId("tbl_amendment").clearSelection();
                                if (data) {

                                    if (data[0].status === "SUCCESS") {
                                        MessageBox.success(data[0].message);
                                    }
                                    else {
                                        MessageBox.error(data[0].message);
                                    }

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

                }
            },
            formatDocumentType: function (sType) {
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
            _handleInputValidation: function () {
                var validate = true;
                var reason = sap.ui.getCore().byId("inp-reason");
                if (sap.ui.getCore().byId("combo-act").getVisible()) {
                    var combo = sap.ui.getCore().byId("combo-act").getSelectedKey();
                    var id;
                   
                    if (combo === "CA") {
                        id = sap.ui.getCore().byId("inp-new_address");
                        if (id.getValue()) {
                            id.setValueState("None").setValueStateText("");
                        } else {
                            id.setValueState("Error").setValueStateText("New Address is Mandatory");
                            validate = false;
                        }
                       
                    }
                    else if (combo === "CG") {
                        if (this.gstinflag == true) {
                            var new_gst = sap.ui.getCore().byId("inp-newgstinb2a");
                            if (new_gst.getValue()) {
                                if (this.validateGSTIN(new_gst.getValue())) {
                                    new_gst.setValueState("None").setValueStateText("");
                                 
                                } else {
                                    new_gst.setValueState("Error").setValueStateText("Invalid GSTIN format");
                                    
                                    validate = false;
                                }
                              
                            } else {
                                new_gst.setValueState("Error").setValueStateText("GSTIN is Mandatory");
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
                }
                else {
                    const oTable = this.byId("tbl_amendment");
                    const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                    const oSelIndices = oTable.getSelectedIndices();
                    const aInvoices = [];
                    if (oSelIndices.length) {
                        var oModel = oTable.getModel("GSTDetailsModel");
                        oSelIndices.forEach(function (iIndex) {
                            var oContext = oTable.getContextByIndex(iIndex);
                            var oData = oModel.getProperty(null, oContext);
                            var doc_typ = oData.DOCUMENTTYPE;
                            aInvoices.push({ doc_typ });
                        });
                    }
                   
                    id = sap.ui.getCore().byId("inp-new_address");
                    if (id.getValue()) {
                        id.setValueState("None").setValueStateText("");
                    } else {
                        id.setValueState("Error").setValueStateText("New Address is Mandatory");
                        validate = false;
                    }

                   
                }
                if (reason.getValue()) {
                    reason.setValueState("None").setValueStateText("");
                } else {
                    reason.setValueState("Error").setValueStateText("Reason is Mandatory");
                    validate = false;
                }


                return validate;
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
                sap.ui.getCore().byId("inp-new_address").setValue("");
                sap.ui.getCore().byId("inp-reason").setValue("");
                sap.ui.getCore().byId("inp-reason").setValueState("None").setValueStateText("");
                sap.ui.getCore().byId("inp-newgstin").setValueState("None").setValueStateText("");
                sap.ui.getCore().byId("inp-new_address").setValueState("None").setValueStateText("");
                sap.ui.getCore().byId("inp-newgstinb2a").setValueState("None").setValueStateText("");


                this.amendmentDialog.close();
            },

            // handleValueHelpSearchpnrNum: function (oEvent) {
            //     var sValue = oEvent.getParameter("value");
            //     var oFilter = new sap.ui.model.Filter({
            //         filters: [
            //             new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
            //         ],
            //         and: false
            //     });
            //     oEvent.getSource().getBinding("items").filter([oFilter]);
            // },
            handleValueHelpSearchpnrNum: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var val = oEvent.getParameter("value").trim();
                if(val !== ""){
                this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "pnr": val, "apiType": "Document" }), (_self, data, message) => {
 
                    var oModelData = new sap.ui.model.json.JSONModel();
                    if (data !== null) {
                        _self.filterJson;
                        _self.filterJsonUpdated = data.filters;
                        _self.filterJson.pnr = _self.filterJson.pnr.concat(data.filters.pnr.filter(function (item) {
                            return _self.filterJson.pnr.indexOf(item) === -1; // Check for uniqueness
                        }));
                        oModelData.setData(_self.filterJson);
                        _self.getView().setModel(oModelData, "FilterDatamodel");
                        var sValue = oEvent.getParameter("value").trim();
                        var oFilter = new sap.ui.model.Filter({
                            filters: [
                                new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                            ],
                            and: false
                        });
                        oEvent.getSource().getBinding("items").filter([oFilter]);
                        sap.ui.core.BusyIndicator.hide();
                    }else {
                        var oModelData = new sap.ui.model.json.JSONModel();
                oModelData.setData(null);
                _self.getView().setModel(oModelData, "FilterDatamodel");
                        sap.ui.core.BusyIndicator.hide();
                    }
                });
            }
            else {
                var oModelData = new sap.ui.model.json.JSONModel();
                oModelData.setData(_self.filterJson);
                _self.getView().setModel(oModelData, "FilterDatamodel");
                sap.ui.core.BusyIndicator.hide();
            }
            },

            // handleValueHelpSearchinvoiceNum: function (oEvent) {
            //     var sValue = oEvent.getParameter("value");
            //     var oFilter = new sap.ui.model.Filter({
            //         filters: [
            //             new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
            //         ],
            //         and: false
            //     });
            //     oEvent.getSource().getBinding("items").filter([oFilter]);
            // },
            handleValueHelpSearchinvoiceNum: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var val = oEvent.getParameter("value").trim();
                if(val !== ""){
                this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "invoiceNumber": val, "apiType": "Document" }), (_self, data, message) => {
 
                    var oModelData = new sap.ui.model.json.JSONModel();
                    if (data !== null) {
                        _self.filterJson;
                        _self.filterJsonUpdated = data.filters;
                        _self.filterJson.invoiceNumber = _self.filterJson.invoiceNumber.concat(data.filters.invoiceNumber.filter(function (item) {
                            return _self.filterJson.invoiceNumber.indexOf(item) === -1; // Check for uniqueness
                        }));
                        oModelData.setData(_self.filterJson);
                        _self.getView().setModel(oModelData, "FilterDatamodel");
                        var sValue = oEvent.getParameter("value").trim();
                        var oFilter = new sap.ui.model.Filter({
                            filters: [
                                new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
                            ],
                            and: false
                        });
                        oEvent.getSource().getBinding("items").filter([oFilter]);
                        sap.ui.core.BusyIndicator.hide();
                    }else {
                        var oModelData = new sap.ui.model.json.JSONModel();
                oModelData.setData(null);
                _self.getView().setModel(oModelData, "FilterDatamodel");
                        sap.ui.core.BusyIndicator.hide();
                    }
                });
            }
            else {
                var oModelData = new sap.ui.model.json.JSONModel();
                oModelData.setData(_self.filterJson);
                _self.getView().setModel(oModelData, "FilterDatamodel");
                sap.ui.core.BusyIndicator.hide();
            }
            },

            handleValueHelpSearchiataNum: function (oEvent) {
                var sValue = oEvent.getParameter("value").trim();
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("IATANUMBER", sap.ui.model.FilterOperator.Contains, sValue),
                        new sap.ui.model.Filter("LEGALNAME", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },

            // handleValueHelpSearchiataNum: function (oEvent) {
            //     sap.ui.core.BusyIndicator.show();
            //     var _self = this;
            //     var val = oEvent.getParameter("value").trim();
            //     if(val !== ""){
            //     this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "iataNumber": val, "apiType": "Document" }), (_self, data, message) => {
 
            //         var oModelData = new sap.ui.model.json.JSONModel();
            //         if (data !== null) {
            //             _self.filterJson;
            //             _self.filterJsonUpdated = data.filters;
            //             _self.filterJson.iataNumber = _self.filterJson.iataNumber.concat(data.filters.iataNumber.filter(function (item) {
            //                 return _self.filterJson.iataNumber.indexOf(item) === -1; // Check for uniqueness
            //             }));
            //             oModelData.setData(_self.filterJson);
            //             _self.getView().setModel(oModelData, "FilterDatamodel");
            //             var sValue = oEvent.getParameter("value").trim();
            //             var oFilter = new sap.ui.model.Filter({
            //                 filters: [
            //                     new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
            //                 ],
            //                 and: false
            //             });
            //             oEvent.getSource().getBinding("items").filter([oFilter]);
            //             sap.ui.core.BusyIndicator.hide();
            //         }else {
            //             var oModelData = new sap.ui.model.json.JSONModel();
            //     oModelData.setData(null);
            //     _self.getView().setModel(oModelData, "FilterDatamodel");
            //             sap.ui.core.BusyIndicator.hide();
            //         }
            //     });
            // }
            // else {
            //     var oModelData = new sap.ui.model.json.JSONModel();
            //     oModelData.setData(_self.filterJson);
            //     _self.getView().setModel(oModelData, "FilterDatamodel");
            //     sap.ui.core.BusyIndicator.hide();
            // }
            // }
        });
    }
);