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
        return Controller.extend("airindiagst.controller.tcsSummary", {
            formatter: formatter,
            onAfterRendering: function () {
            },
            onInit: function () {

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("tcsSummary").attachPatternMatched(this._routeMatched, this);
                //*******************************
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);

                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/hinticon", true);
                this.configModel = new JSONModel();
                this.getView().setModel(this.configModel);
                // this.getView().getModel().setProperty("/toggleVisible", true);
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
                var oTable = this.byId("tbl_gstInvoices");
                this.oMetadataHelper = new MetadataHelper([
                    { key: "col_invnum", label: "invoice Number", path: "INVOICENUMBER" },
                    { key: "col_ticnum", label: "Ticket Number", path: "TICKETNUMBER" },
                    { key: "col_passgstin", label: "Passenger GSTIN", path: "PASSENGERGSTIN" },
                    { key: "col_sale", label: "Sale/Refund", path: "TRANSACTIONTYPE" },
                    { key: "col_iata", label: "IATA Code", path: "IATANUMBER" },
                    { key: "col_orginvdat", label: "Original Invoice Date", path: "ORGINALINVOICEDATE" },
                    { key: "col_pos", label: "Place of Supply", path: "PLACEOFSUPPLY" },
                    { key: "col_suppgstin", label: "Supplier GSTIN", path: "SUPPLIERGSTIN" },
                    { key: "col_ref_iss", label: "Refund Issue Date", path: "TICKETISSUEDATE" },
                    { key: "col_state", label: "State", path: "STATENAME" },
                    { key: "col_gstrmonth", label: "GSTR Month", path: "GSTR1PERIOD" },
                    { key: "col_nettax", label: "Net Taxable Value", path: "NETTAXABLEVALUE" },
                    { key: "col_nontax", label: "Non Taxable Value", path: "NONTAXABLE" },
                    { key: "col_k3", label: "TCS K3", path: "K3TAX" },
                    { key: "col_tcsgstval", label: "GST", path: "TCSGSTVALUE" },
                    { key: "col_cgst", label: "CGST", path: "TCS_CGST" },
                    { key: "col_sgst", label: "SGST", path: "TCS_SGST_UGST" },
                    { key: "col_igst", label: "IGST", path: "TCS_IGST" },
                    { key: "col_totinvamt", label: "Total Invoice Amount", path: "TOTALINVOICEAMOUNT" },
                    { key: "col_remark", label: "Remarks", path: "INVOICESTATUS" },
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
                    // Load more data here and append it to the model
                    this.loadMoreData();
                }
            },
            loadMoreData: function () {
                var oTable = this.getView().byId("tbl_gstInvoices");
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
            handleValueHelpotaGstin: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.otagstinDialog) {
                    this.otagstinDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.otagstin", this);
                    this.getView().addDependent(this.otagstinDialog);
                }
                var oList = this.otagstinDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.otagstinDialog._aSelectedItems;

                this.otagstinDialog.open();

            },

            handleValueHelpSearchotagstin: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var _self = this;
                var val = oEvent.getParameter("value").trim();
                var filtr = (_self.apiType === "TCSReport") ? "ota_gstin" : "gstin_ota";

                if (val !== "") {
                    this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ [filtr]: val, "apiType": this.apiType }), (_self, data, message) => {

                        var oModelData = new sap.ui.model.json.JSONModel();
                        if (data !== null) {
                            _self.filterJson;
                            if (_self.apiType === "TCSDetailsReport") {
                                data.filters.ota_gstin = data.filters.gstin_ota;

                            }

                            _self.filterJsonUpdated = data.filters;
                            _self.filterJson.ota_gstin = _self.filterJson.ota_gstin.concat(data.filters.ota_gstin.filter(function (item) {
                                return _self.filterJson.ota_gstin.indexOf(item) === -1; // Check for uniqueness
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
                        } else {
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
            handleValueHelpCloseotagstin: function (oEvent) {
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
                this.byId("fbinp-otaGSTIN").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-otaGSTIN");
                var aTitle = [];
                this.oListPlant = this.otagstinDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject();
                    aTitle.push(text);
                }
                //adding the selected values to the tokens.
                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("fbinp-otaGSTIN").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                const sId = this.byId("fbinp-otaGSTIN");
                sId.getAggregation("tokenizer").setEditable(false);
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
            fetchInvoices: function (oEvent) {
                var filterval = {};
                this.loopfilters = {};
                filterval.apiType = this.apiType;
                filterval.pageNumber = 1;
                filterval.pageSize = 500;
                filterval.isInitial = true;
                // this.loopfilters = filterval;

                this.SendRequest(this, "/portal-api/portal/v1/get-reports", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {


                    sap.ui.core.BusyIndicator.hide();
                    // _self.GSTDetails = data;

                    if (data) {
                        // if (_self.apiType === "TCSReport") {
                        //     data.invoices.forEach(function (item) {
                        //         item.GSTIN_OTA = item.OTA_GSTIN;
                        //     });

                        // }



                        // _self.totalinvoiceslength = data.invoices.length;

                        // _self.oModel = new sap.ui.model.json.JSONModel([]);
                        // _self.oModel.setData(_self.GSTDetails.invoices);



                        if (data.filters) {
                            var oModelData = new sap.ui.model.json.JSONModel([]);
                            _self.filterJson = data.filters;
                            oModelData.setData(_self.filterJson);
                            _self.getView().setModel(oModelData, "FilterDatamodel");
                            // _self.byId("fbmc-TIMELINE").setSelectedKey(_self.filterJson.invoiceFilter);

                            // _self.getView().byId("fbmc-GSTIN").setSelectedKeys(this.filterJson.defaultGSTIN);

                        }
                        // if (data.invoices.length > 0) {

                        //     _self.getView().byId("btn-excel").setVisible(true);

                        //     // _self.getView().byId("btn-pdf").setVisible(true);


                        // } else {
                        //     _self.getView().byId("btn-excel").setVisible(false);

                        //     _self.getView().byId("btn-pdf").setVisible(false);

                        // }
                    }
                    // else if (data === null) {

                    //     _self.GSTDetails = null;
                    // }
                    // _self.oModel.setData(_self.GSTDetails);
                    // _self.getView().setModel(_self.oModel, "GSTDetailsModel");
                    _self.onSearch();

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

            },
            handleValueHelpbuyername: function (oEvent) {
                // this.setValuesToSearchHelp(oEvent);
                var sInputValue = oEvent.getSource().getValue();
                //this.InputId = oEvent.getSource().getId();
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.buyerNameDialog) {
                    this.buyerNameDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.passengerFIlterDialog", this);
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
            handleValueHelpSearchpassengername: function (oEvent) {
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
                this.getView().byId("title").setText("Documents(0)");
                var oModel = new sap.ui.model.json.JSONModel([]);

                oModel.setData(null);

                this.getView().setModel(oModel, "GSTDetailsModel");
                this.byId("b2aSegments").setSelectedKey("tcssum")
                this.getView().byId("fbinp-otaGSTIN").removeAllTokens();
                this.getView().byId("fbinp-iataNumber").removeAllTokens();
                this.getView().byId("fbdat-month").setValue("");

                this.getView().byId("fbdat-invoiceDate").setValue("");
                this.getView().byId("fbmc-DocType").setSelectedKeys("");

                this.getView().byId("fbdat-invoiceDate").setValue("");

                this.getView().byId("fbdat-invoiceDate").setValueState("None").setValueStateText("");
                this.getView().getModel().setProperty("/toggleVisible", false);
                this.changeB2AViewFlag = false;

                this.apiType = "TCSReport";
                this.fetchInvoices();


                this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", " " + decodedData.FirstName + ' ' + decodedData.LastName);
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "TCS Summary");
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", true);
                // this.ISB2A_flag = false;


            },
            restore: function () {
                var oFilterBar = this.byId("filterbar");
                oFilterBar.getAllFilterItems().forEach(function (oFilterItem) {
                    oFilterItem.setVisibleInFilterBar(true);
                });
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
            onScroll: function (oEvent) {
                var totalPages = Math.ceil(this.GSTDetails.totalInvoices / 500);
                if (this.loopfilters.pageNumber <= totalPages) {
                    this.loopfilters.pageNumber = this.loopfilters.pageNumber + 1;


                    this.SendRequest(this, "/portal-api/portal/v1/get-reports", "POST", {}, JSON.stringify(this.loopfilters), (_self, data, message) => {
                        if (data.invoices.length > 0) {
                            if (_self.apiType === "TCSReport") {
                                data.invoices.forEach(function (item) {
                                    item.GSTIN_OTA = item.OTA_GSTIN;
                                });

                            }
                            else {
                                data.invoices.forEach(function (item) {
                                    item.GSTR_MONTH = item.GSTR1PERIOD;
                                    item.AIRLINE_GSTN = item.SUPPLIERGSTIN;
                                    item.STATE_OF_DEPOSIT = item.STATENAME;
                                });

                            }

                            _self.GSTDetails.invoices = [..._self.GSTDetails.invoices, ...data.invoices];

                            _self.getView().byId("title").setText("Documents (1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");


                            _self.getView().getModel("GSTDetailsModel").refresh();
                        }
                    });
                }
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
                    oSelIndices.forEach(function (iIndex) {
                        var oContext = oTable.getContextByIndex(iIndex);
                        var oData = oModel.getProperty(null, oContext);
                        const ID = oData.ID;
                        // oSelIndices.forEach(index => {
                        //     const ID = oTableData[index].ID
                        aInvoices.push({ ID })
                    });
                    if (oSelIndices.length > 1) {
                        sap.ui.core.BusyIndicator.hide();

                        this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices: aInvoices }), (_self, data, message) => {
                            //   const invoices = data.invoicePDFs;
                            const invoices = data.invoice;
                            const base64Data = "data:application/zip;base64," + invoices;
                            const link = document.createElement('a');
                            link.href = base64Data;
                            link.download = `TCS Report Documents`;
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
                } else {
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

                // Create an array to store the selected invoice numbers
                var aSelectedInvoiceNumbers = [];

                // Loop through the selected indices and retrieve the INVOICENUMBER
                aSelectedIndices.forEach(function (aSelectedIndices) {
                    var oBindingContext = oTable.getContextByIndex(aSelectedIndices);
                    var sInvoiceNumber = oBindingContext.getProperty().ID;
                    aSelectedInvoiceNumbers.push(sInvoiceNumber);
                });
                if (aSelectedInvoiceNumbers.length > 0) {


                    filterval.id = aSelectedInvoiceNumbers;
                    filterval.apiType = this.apiType;
                    filterval.generateExcel = true;
                    filterval.columns = (filterval.apiType === "TCSReport") ? {
                        "OTA_GSTIN": "OTA GSTIN",
                        "AIRLINE_GSTN": "Airline GSTIN",
                        "IATANUMBER": "IATA Code",
                        "STATE_OF_DEPOSIT": "State of Deposit",
                        "GSTR_MONTH": "GSTR1 Month",
                        "TOTAL_TICKET_VALUE": "Total Ticket Value",
                        "TAXABLE": "Taxable Value",
                        "TCS_PERC_GST_VALUE": "TCS GST Value",
                        "TCS_CGST": " TCS CGST",
                        "TCS_SGST_UTGST": "TCS SGST/UTGST",
                        "TCS_IGST": " TCS IGST"
                    } : {
                        "DOCUMENTTYPE": "Document Type",
                        "TICKETNUMBER": "Ticket Number",
                        "GSTIN_OTA": "OTA GSTIN",
                        "INVOICEDATE": "Issue Date",
                        "TRANSACTIONTYPE": "Sale/Refund",
                        "SUPPLIERGSTIN": "Airline GSTIN",
                        "GSTR1FILINGSTATUS": "GSTR1 filling status",
                        "IATANUMBER": "IATA Code",
                        "STATENAME": "State of Deposit",
                        "GSTR1PERIOD": "GSTR1 Month",
                        "TOTAL_TICKET_VALUE": "Total Ticket Value",
                        "TAXABLE": "Taxable Value",
                        "TCS_PERC_GST_VALUE": "TCS GST Value",
                        "ORGINALINVOICEDATE": "Original Invoice Date",
                        "PLACEOFSUPPLY": "Place of Supply",
                        "NONTAXABLE": "Non Taxable Value",
                        "TOTAL_TAX": "TCS K3",
                        "TCS_CGST": " TCS CGST",
                        "TCS_SGST_UTGST": "TCS SGST/UTGST",
                        "TCS_IGST": " TCS IGST",
                        "REMARKS": "Remarks"
                    };


                    // Now, aSelectedInvoiceNumbers contains the INVOICENUMBER of all selected rows


                    this.SendRequest(this, "/portal-api/portal/v1/get-reports", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                        sap.ui.core.BusyIndicator.hide();
                        if (data) {
                            var base64Data = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + data.excel;

                            const link = document.createElement('a');

                            link.href = base64Data;

                            link.download = "TCS Documents";

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
            Exportall: function () {
                var filterval = {};
                var _self = this;
                sap.ui.core.BusyIndicator.show();
                  if (_self.GSTDetails.invoices.length > 0) {

                   
                    filterval.generateExcel = true;
                    filterval.exportAll = true;     
                    filterval.columns = (filterval.apiType === "TCSReport") ? {
                        "OTA_GSTIN": "OTA GSTIN",
                        "AIRLINE_GSTN": "Airline GSTIN",
                        "IATANUMBER": "IATA Code",
                        "STATE_OF_DEPOSIT": "State of Deposit",
                        "GSTR_MONTH": "GSTR1 Month",
                        "TOTAL_TICKET_VALUE": "Total Ticket Value",
                        "TAXABLE": "Taxable Value",
                        "TCS_PERC_GST_VALUE": "TCS GST Value",
                        "TCS_CGST": " TCS CGST",
                        "TCS_SGST_UTGST": "TCS SGST/UTGST",
                        "TCS_IGST": " TCS IGST"
                    } : {
                        "DOCUMENTTYPE": "Document Type",
                        "TICKETNUMBER": "Ticket Number",
                        "GSTIN_OTA": "OTA GSTIN",
                        "INVOICEDATE": "Issue Date",
                        "TRANSACTIONTYPE": "Sale/Refund",
                        "SUPPLIERGSTIN": "Airline GSTIN",
                        "GSTR1FILINGSTATUS": "GSTR1 filling status",
                        "IATANUMBER": "IATA Code",
                        "STATENAME": "State of Deposit",
                        "GSTR1PERIOD": "GSTR1 Month",
                        "TOTAL_TICKET_VALUE": "Total Ticket Value",
                        "TAXABLE": "Taxable Value",
                        "TCS_PERC_GST_VALUE": "TCS GST Value",
                        "ORGINALINVOICEDATE": "Original Invoice Date",
                        "PLACEOFSUPPLY": "Place of Supply",
                        "NONTAXABLE": "Non Taxable Value",
                        "TOTAL_TAX": "TCS K3",
                        "TCS_CGST": " TCS CGST",
                        "TCS_SGST_UTGST": "TCS SGST/UTGST",
                        "TCS_IGST": " TCS IGST",
                        "REMARKS": "Remarks"
                    };
                    filterval = {...filterval, ..._self.loopfilters};
                    delete filterval.pageNumber;
                    delete filterval.pageSize;
                   
                    this.SendRequest(this, "/portal-api/portal/v1/get-reports", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                        sap.ui.core.BusyIndicator.hide();
                        if (data) {
                            var base64Data = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + data.excel;

                            const link = document.createElement('a');

                            link.href = base64Data;

                            link.download = "TCS Documents";

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

            onSearch: function (oEvent) {
                this.getView().byId("tbl_gstInvoices").clearSelection();
                if (!this.getView().byId("filterbar").isDialogOpen()) {
                    sap.ui.core.BusyIndicator.show();

                    var filter = new Array();
                    var filterval = {};

                    var _self = this;


                    filterval.apiType = _self.apiType;
                    if (!oEvent) {

                        if (_self.GSTDetails.invoices.length > 0) {
                            _self.getView().byId("morelink").setVisible(true);
                            _self.getView().byId("title").setText("Documents (1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");
                            // _self.getView().byId("morelink").setText("(1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ") More..");
                        } else {
                            _self.getView().byId("title").setText("Documents (" + _self.GSTDetails.invoices.length + ")");
                            _self.getView().byId("morelink").setVisible(false);

                        }

                        // _self.getView().getModel("GSTDetailsModel").setData(_self.GSTDetails);
                        _self.getView().getModel("GSTDetailsModel").refresh();
                        // // _self.getView().getModel("uniqueGSTDetailsModel").refresh();
                        _self.getView().getModel("FilterDatamodel").refresh();
                        // _self.byId("panel_table").setVisible(true);

                        // _self.byId("tbl_gstInvoices").setVisible(true);

                        sap.ui.core.BusyIndicator.hide();
                    } else {
                        var validflag;

                        filterval.isInitial = this.changeB2AViewFlag ? true : false;

                        if (filterval.isInitial || this.getView().byId("fbdat-month").getValue() !== "") {
                            this.getView().byId("fbdat-month").setValueState("None").setValueStateText("");
                            validflag = true;
                        } else {
                            this.getView().byId("fbdat-month").setValueState("Error").setValueStateText("GSTR1 Period is mandatory!");
                            sap.ui.core.BusyIndicator.hide();
                            validflag = false;
                        }
                        if (validflag) {


                            this.loopfilters = {};
                            if (filterval.isInitial === false) {
                                if (this.getView().byId("fbmc-DocType").getSelectedKeys()) {
                                    filterval.documentType = this.getView().byId("fbmc-DocType").getSelectedKeys();
                                    filterval.documentType.shift();

                                }
                            }



                            if (this.getView().byId("fbinp-otaGSTIN").getTokens().length > 0) {
                                // var fieldName = "passengerGSTIN";
                                // filterval.passengerGSTIN = this.getView().byId("fbmc-GSTIN").getSelectedKeys();
                                var otaGstinTokens = this.getView().byId("fbinp-otaGSTIN").getTokens();
                                var otaGstinToken = otaGstinTokens.map(function (oToken) {
                                    return oToken.mProperties.text;
                                }).join(",");
                                var otagstinarr = otaGstinToken.split(',');

                                // filterval.ota_gstin = otagstinarr;
                                filterval[_self.apiType === "TCSReport" ? "ota_gstin" : "gstin_ota"] = otagstinarr;
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
                            if (this.getView().byId("fbdat-month").getValue()) {

                                var daterange = this.getView().byId("fbdat-month").getValue().split("/").join("");
                                filterval[_self.apiType === "TCSReport" ? "gstr_month" : "gstr1period"] = daterange;

                            }

                            if (this.getView().byId("fbdat-invoiceDate").getValue()) {
                                if (this.byId("fbdat-invoiceDate").isValidValue()) {
                                    var daterange = this.getView().byId("fbdat-invoiceDate").getValue().split("to");
                                    var formattedDates = daterange.map(date => {
                                        let parts = date.trim().split('/');
                                        return `${parts[2]}/${parts[1]}/${parts[0]}`;
                                    });
                                    filterval.from = formattedDates[0].trim();
                                    filterval.to = formattedDates[1].trim();
                                }
                                else {
                                    MessageBox.error("Please choose a valid Date");
                                    sap.ui.core.BusyIndicator.hide();
                                    return false;

                                }
                            }

                            filterval.pageNumber = 1;
                            filterval.pageSize = 500;
                            this.loopfilters = filterval;

                            this.SendRequest(this, "/portal-api/portal/v1/get-reports", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                                // _self.getView().byId("tbl_gstInvoices").setVisible(true);  

                                sap.ui.core.BusyIndicator.hide();
                                if (data) {
                                    if (_self.changeB2AViewFlag) {

                                        _self.getView().getModel("FilterDatamodel").setData(data.filters);
                                        _self.getView().getModel("FilterDatamodel").refresh();
                                    }
                                    else {
                                        _self.GSTDetails = data;
                                        if (data.invoices.length > 0) {
                                            if (_self.apiType === "TCSReport") {
                                                data.invoices.forEach(function (item) {
                                                    item.GSTIN_OTA = item.OTA_GSTIN;
                                                });

                                            }
                                            else {
                                                data.invoices.forEach(function (item) {
                                                    item.GSTR_MONTH = item.GSTR1PERIOD;
                                                    item.AIRLINE_GSTN = item.SUPPLIERGSTIN;
                                                    item.STATE_OF_DEPOSIT = item.STATENAME;
                                                });

                                            }


                                            _self.getView().byId("btn-excel").setVisible(true);
                                            // _self.getView().byId("txt-inr").setVisible(true);
                                            // _self.getView().byId("btn-pdf").setVisible(true);


                                        } else {
                                            _self.getView().byId("btn-excel").setVisible(false);
                                            // _self.getView().byId("txt-inr").setVisible(false);
                                            _self.getView().byId("btn-pdf").setVisible(false);

                                        }
                                        if (_self.GSTDetails.invoices.length > 0) {
                                            _self.getView().byId("morelink").setVisible(true);
                                            _self.getView().byId("title").setText("Documents (1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");

                                        } else {
                                            _self.getView().byId("title").setText("Documents (" + _self.GSTDetails.invoices.length + ")");
                                            _self.getView().byId("morelink").setVisible(false);

                                        }

                                        _self.totalinvoiceslength = data.invoices.length;

                                        _self.GSTDetails = data;

                                        this.oModel = new sap.ui.model.json.JSONModel([]);

                                        this.oModel.setData(_self.GSTDetails);

                                        _self.getView().setModel(this.oModel, "GSTDetailsModel");
                                    }
                                    _self.changeB2AViewFlag = false;

                                }
                                else if (data === null) {

                                    this.oModel = new sap.ui.model.json.JSONModel([]);

                                    this.oModel.setData(null);

                                    _self.getView().setModel(this.oModel, "GSTDetailsModel");
                                }


                            });
                            //  }
                            //  else{

                        }
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




            onButtonDownloadPresssingle: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                const oTable = this.byId("tbl_gstInvoices");
                var row = oEvent.getParameter("row").getIndex()
                var val = oEvent.getParameter("row").getBindingContext("GSTDetailsModel").getProperty("ID");
                const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                // var row = this.getView().byId("tbl_amendment").mProperties.selectedIndex;
                // const oSelIndices = oTable.getSelectedIndices();
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
                var sValue = oEvent.getParameter("value").trim();
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("", sap.ui.model.FilterOperator.Contains, sValue),
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
            //     this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "iataNumber": val, "apiType": this.apiType}), (_self, data, message) => {

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
            // },


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
            // onchangeview: function (oEvent) {
            //     var segmentkey = oEvent.getSource().getSelectedKey();
            //     var segmentItem = oEvent.getSource().getSelectedItem();
            //     if (segmentkey === "tcssumd") {
            //         this.getView().getModel().setProperty("/toggleVisible", true);

            //     } else {
            //         this.getView().getModel().setProperty("/toggleVisible", false);

            //     }

            // },
            onchangeview: function (oEvent) {
                var segmentkey = oEvent.getSource().getSelectedKey();
                var segmentItem = oEvent.getSource().getSelectedItem();
                var _self = this;
                // sap.ui.core.BusyIndicator.show();

                this.changeB2AViewFlag = true;
                this.getView().byId("fbdat-month").setValueState("None").setValueStateText("");
                this.oModel = new sap.ui.model.json.JSONModel([]);
                this.oModel.setData(null);
                this.getView().setModel(this.oModel, "GSTDetailsModel");
                this.getView().byId("title").setText("Documents(0)");
                this.getView().byId("morelink").setVisible(false);


                if (segmentkey == "tcssumd") {

                    // this.getView().byId("tbl_gstInvoices").setVisible(false);  

                    this.getView().byId("fbinp-otaGSTIN").removeAllTokens();
                    this.getView().byId("fbinp-iataNumber").removeAllTokens();
                    this.getView().byId("fbdat-month").setValue("");
                    this.getView().byId("fbdat-invoiceDate").setValue("");
                    this.getView().byId("fbmc-DocType").setSelectedKeys("");
                    this.getView().byId("fbdat-invoiceDate").setValue("");
                    this.getView().byId("fbdat-invoiceDate").setValueState("None").setValueStateText("");
                    this.getView().byId("invdat_filtr").setVisible(true);

                    if (this.iataNumberDialog) {
                        this.iataNumberDialog.clearSelection(true);
                    }
                    if (this.otagstinDialog) {
                        this.otagstinDialog.clearSelection(true);
                    }
                    this.apiType = "TCSDetailsReport";

                    this.onSearch(oEvent);
                    this.getView().getModel().setProperty("/toggleVisible", true);
                }
                else {



                    // this.getView().byId("tbl_gstInvoices").setVisible(false);    

                    this.getView().byId("fbinp-otaGSTIN").removeAllTokens();
                    this.getView().byId("fbinp-iataNumber").removeAllTokens();
                    this.getView().byId("fbdat-month").setValue("");
                    this.getView().byId("fbdat-invoiceDate").setValue("");
                    this.getView().byId("fbmc-DocType").setSelectedKeys("");
                    this.getView().byId("fbdat-invoiceDate").setValue("");
                    this.getView().byId("fbdat-invoiceDate").setValueState("None").setValueStateText("");
                    this.getView().byId("invdat_filtr").setVisible(false);
                    if (this.iataNumberDialog) {
                        this.iataNumberDialog.clearSelection(true);
                    }
                    if (this.otagstinDialog) {
                        this.otagstinDialog.clearSelection(true);
                    }

                    // this.getView().byId("fbdat-invoiceDate").setValue("");
                    // this.getView().byId("fbdat-ticketIssueDate").setValue("");
                    // this.getView().byId("fbmc-GSTINAI").setSelectedKeys(null);
                    // this.byId("fbmc-TIMELINE").setSelectedKey(this.filterJson.invoiceFilter);

                    // this.byId("buyergst").setVisible(true);
                    // this.getView().byId("fbinp-GSTIN").removeAllTokens();
                    // this.byId("fbmc-GSTIN").setSelectedKeys(this.filterJson.defaultGSTIN);
                    this.apiType = "TCSReport";
                    this.onSearch(oEvent);
                    this.getView().getModel().setProperty("/toggleVisible", false);

                }
            }

        });
    }
);