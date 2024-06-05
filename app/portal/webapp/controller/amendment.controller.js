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
        return Controller.extend("airindiagst.controller.amendment", {
            formatter: formatter,
            onAfterRendering: function () {
            },
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("amendment").attachPatternMatched(this._routeMatched, this);
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
                this.reqJson = {
                    approveRequest: []
                }
                this.reqAddressJson = {
                    approveRequest: []
                }
                this.changeAddressJson = {
                    approveRequest: []
                }
                this.rejectJson = {
                    rejectRequests: []

                }
                this.rejectAddressJson = {
                    rejectRequests: []
                }
                this.sendApproveDetails = {
                    results: []
                };
                this.sendApproveAddressDetails = {
                    results: []
                };
                this.sendApproveChangeAddressDetails = {
                    results: []
                };
                this.validateDetailsAmendment = {                  //Object for all conditons of approve/reject
                    results: []
                };
                var oModelData = new sap.ui.model.json.JSONModel();
                this.filterJson = {
                };
                this.getView().setModel(oModelData, "FilterDatamodel");
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                this.selectionFlag = false;
                this.jwt = sessionStorage.getItem("jwt")

                if (!this.jwt) {

                    window.location.replace('/portal/index.html');

                }
                this._registerForP13n();
            },
            restore: function () {
                var oFilterBar = this.byId("filterbar");
                oFilterBar.getAllFilterItems().forEach(function (oFilterItem) {
                    oFilterItem.setVisibleInFilterBar(true);
                });
            },
            onScroll: function (oEvent) {

                var totalPages = Math.ceil(this.GSTDetails.totalInvoices / 100);
                if (this.loopfilters.pageNumber <= totalPages) {
                    sap.ui.core.BusyIndicator.show();
                    this.loopfilters.pageNumber = this.loopfilters.pageNumber + 1;
                    this.SendRequest(this, "/portal-api/portal/v1/get-user-invoices", "POST", {}, JSON.stringify(this.loopfilters), (_self, data, message) => {
                        if (data !== null) {
                            if (data.invoices.length > 0) {
                                for (var i = 0; i < data.invoices.length; i++) {
                                    if (data.invoices[i].AMENDEMENTSTATUS == "P") {
                                        data.invoices[i].AMENDEMENTSTATUS = "Pending";
                                    }
                                    if (data.invoices[i].AMENDEMENTSTATUS == "A") {
                                        data.invoices[i].AMENDEMENTSTATUS = "Approved";
                                    }
                                    if (data.invoices[i].AMENDEMENTSTATUS == "R") {
                                        data.invoices[i].AMENDEMENTSTATUS = "Rejected";
                                    }
                                    if (data.invoices[i].AMENDEMENTSTATUS == "RY") {
                                        data.invoices[i].AMENDEMENTSTATUS = "Rejected";
                                    }
                                    if (data.invoices[i].AMENDEMENTSTATUS == "AY") {
                                        data.invoices[i].AMENDEMENTSTATUS = "Rejected";
                                    }
                                }
                                _self.GSTDetails.invoices = [..._self.GSTDetails.invoices, ...data.invoices];
                                _self.getView().byId("title").setText("Amendments" + " " + "(1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");
                                _self.getView().getModel("GSTDetailsModel").refresh();
                            }
                            sap.ui.core.BusyIndicator.hide();
                        }
                        sap.ui.core.BusyIndicator.hide();
                    });
                }
            },
            _registerForP13n: function () {
                var oTable = this.byId("tbl_amendment");
                this.oMetadataHelper = new MetadataHelper([
                    { key: "colAMD_TICKETNUMBER", label: "Ticket Number", path: "TICKETNUMBER" },
                    { key: "colAMD_DOCTyp", label: "Document Type", path: "DOCUMENTTYPE" },
                    { key: "colAMD_INVNUm", label: "Document Number", path: "INVOICENUMBER" },
                    { key: "originalInvNUmber", label: "Original Document Number", path: "ORIGINALINVOICENUMBER" },
                    { key: "colAMD_invDate", label: "Document Date", path: "INVOICEDATE" },
                    { key: "colAMD_AMENDEMENTNEWVALUE", label: "New GSTIN / Address", path: "AMENDEMENTNEWVALUE" },
                    { key: "colAMD_AMENDEMENTOLDVALUE", label: "Old GSTIN / Address", path: "AMENDEMENTOLDVALUE" },
                    { key: "colAMD_AMDStatus", label: "Amendment Status", path: "AMENDEMENTSTATUS" },
                    { key: "colAMD_reason", label: "Reason", path: "AMENDMENTREASON" }

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
                } else {

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
            onchangeB2Aview: function (oEvent) {
                var _self = this;
                this.segment = oEvent.getSource().getSelectedKey();
                var segmentItem = oEvent.getSource().getSelectedItem();

                if (this.segment == "BOOKEDTHROUGH") {
                    sap.ui.core.BusyIndicator.show();
                    this.byId("fbinp-iataNumber").removeAllTokens();
                    this.byId("oldInvoicesBtn").setVisible(true);
                    this.getView().byId("originalInvNUmber").setVisible(true);
                    this.getView().byId("colAMD_reasonRejected").setVisible(false);
                    this.getView().byId("colAMD_reason").setVisible(true);
                    this.byId("singleAmendedInvoiceButton").setVisible(true);
                    this.byId("singleOriginalInvoiceButton").setVisible(true);
                    this.byId("singleInvoiceButton").setVisible(false);
                    this.byId("fbmc-GSTIN").setSelectedKeys("");
                    this.byId("approveButton").setVisible(false);
                    this.byId("rejectButton").setVisible(false);
                    this.getView().byId("colAMD_INVNUm").setVisible(true);
                    this.readInvoicesFromAmendment(oEvent);
                } else if (this.segment == "MYBOOKINGS") {
                    sap.ui.core.BusyIndicator.show();
                    this.byId("approveButton").setVisible(false);
                    this.byId("rejectButton").setVisible(false);
                    this.byId("oldInvoicesBtn").setVisible(true);
                    this.getView().byId("originalInvNUmber").setVisible(true);
                    this.getView().byId("colAMD_reasonRejected").setVisible(false);
                    this.getView().byId("colAMD_reason").setVisible(true);
                    this.getView().byId("colAMD_INVNUm").setVisible(true);
                    this.byId("singleAmendedInvoiceButton").setVisible(true);
                    this.byId("singleOriginalInvoiceButton").setVisible(true);
                    this.byId("singleInvoiceButton").setVisible(false);
                    this.byId("fbmc-GSTIN").setSelectedKeys(this.filterJson.defaultGSTIN);
                    this.readInvoicesFromAmendment(oEvent);
                }
                else if (this.segment == "APPROVED") {
                    sap.ui.core.BusyIndicator.show();
                    this.byId("approveButton").setVisible(false);
                    this.byId("rejectButton").setVisible(false);
                    this.getView().byId("originalInvNUmber").setVisible(true);
                    this.getView().byId("colAMD_reasonRejected").setVisible(false);
                    this.getView().byId("colAMD_INVNUm").setVisible(true);
                    this.getView().byId("colAMD_reason").setVisible(true);
                    this.byId("oldInvoicesBtn").setVisible(true);
                    this.byId("amendedInvoicesBtn").setVisible(true);
                    this.byId("singleAmendedInvoiceButton").setVisible(true);
                    this.byId("singleOriginalInvoiceButton").setVisible(true);
                    this.byId("singleInvoiceButton").setVisible(false);
                    this.readInvoicesFromAmendment(oEvent);
                } else if (this.segment == "PENDING") {
                    sap.ui.core.BusyIndicator.show();
                    this.byId("approveButton").setVisible(true);
                    this.byId("rejectButton").setVisible(true);
                    this.byId("oldInvoicesBtn").setVisible(false);
                    this.byId("amendedInvoicesBtn").setVisible(false);
                    this.getView().byId("colAMD_INVNUm").setVisible(true);
                    this.byId("singleAmendedInvoiceButton").setVisible(false);
                    this.byId("singleOriginalInvoiceButton").setVisible(false);
                    this.byId("singleInvoiceButton").setVisible(true);
                    this.getView().byId("originalInvNUmber").setVisible(false);
                    this.getView().byId("colAMD_reason").setVisible(true);
                    this.getView().byId("colAMD_reasonRejected").setVisible(false);
                    this.readInvoicesFromAmendment(oEvent);
                } else if (this.segment == "REJECTED") {
                    sap.ui.core.BusyIndicator.show();
                    this.byId("approveButton").setVisible(false);
                    this.byId("rejectButton").setVisible(false);
                    this.getView().byId("originalInvNUmber").setVisible(false);
                    this.getView().byId("colAMD_reasonRejected").setVisible(true);
                    this.getView().byId("colAMD_INVNUm").setVisible(true);
                    this.getView().byId("colAMD_reason").setVisible(false);
                    this.byId("oldInvoicesBtn").setVisible(false);
                    this.byId("singleAmendedInvoiceButton").setVisible(false);
                    this.byId("singleOriginalInvoiceButton").setVisible(false);
                    this.byId("singleInvoiceButton").setVisible(false);
                    this.byId("amendedInvoicesBtn").setVisible(false);
                    this.readInvoicesFromAmendment(oEvent);
                }
            },
            formatTimeStamp: function (sValue) {

                if (sValue) {
                    var dateString = sValue;
                    var parts = dateString.split(" ");
                    var formattedDate = parts[0];
                    return formattedDate;
                }
            },

            onTokenUpdate: function (evt) {
                var removedType = evt.mParameters.removedTokens[0].mProperties.text;
                for (var type = 0; type < this.aContexts.length; type++) {
                    var index = this.aContexts.indexOf(this.aContexts[type].getPath());
                    this.aContexts.splice(index, 1);
                }
            },
            readInvoicesFromAmendment: function (oEvent) {
                this.getView().byId("tbl_amendment").clearSelection();

                var filterval = {

                };
                this.loopfilters = {};
                filterval.isInitial = true;
                filterval.pageNumber = 1;
                filterval.pageSize = 100;
                var oModelData = new sap.ui.model.json.JSONModel();
                this.getView().byId("fbinp-iataNumber").removeAllTokens();
                this.getView().byId("fbinp-invoiceNumber").removeAllTokens();
                this.getView().byId("fbinp-ticketNumber").removeAllTokens();
                this.segment = this.byId("b2aSegments").getSelectedKey();

                if ((this.pendingFlag == false) && (this.decodedData.ISB2A == false)) {
                    if (this.segment == "REJECTED") {
                        filterval.apiType = "AmendmentsRejected";
                        filterval.generateExcel = false;
                    }
                    if (this.segment == "APPROVED") {
                        filterval.apiType = "AmendmentsApproved";
                        filterval.generateExcel = false;
                    }

                }
                if ((this.pendingFlag == true) && (this.decodedData.ISB2A == false)) {
                    filterval.apiType = "PendingAmendments";
                    filterval.generateExcel = false;
                }
                if ((this.pendingFlag == true) && (this.decodedData.ISB2A == true)) {
                    filterval.apiType = "PendingAmendments";
                    filterval.generateExcel = false;
                }
                if ((this.pendingFlag == false) && (this.decodedData.ISB2A == true)) {
                    if (this.segment == "REJECTED") {
                        filterval.generateExcel = false;
                        filterval.apiType = "AmendmentsRejected";
                    } else {
                        if (this.decodedData.category == '07') {
                            filterval.generateExcel = false;
                            filterval.apiType = "AmendmentsApproved";
                            filterval.bookingType = "booked through";
                        } else {
                            filterval.generateExcel = false;
                            filterval.apiType = "AmendmentsApproved";
                            filterval.bookingType = "my bookings";

                        }
                        if (this.decodedData.category == '01') {
                            if (this.segment == "BOOKEDTHROUGH") {
                                filterval.generateExcel = false;
                                filterval.apiType = "AmendmentsApproved";
                                filterval.bookingType = "booked through";
                            }
                            else {
                                filterval.generateExcel = false;
                                filterval.apiType = "AmendmentsApproved";
                                filterval.bookingType = "my bookings";
                            }
                        }
                    }
                }
                this.loopfilters = filterval;
                this.SendRequest(this, "/portal-api/portal/v1/get-user-invoices", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                    if (data !== null) {
                        _self.GSTDetails = data;
                        sap.ui.core.BusyIndicator.hide();
                        const segmentSelected = this.byId("b2aSegments").getSelectedKey();
                        if ((segmentSelected == "BOOKEDTHROUGH") || (segmentSelected == "MYBOOKINGS") || (segmentSelected == "APPROVED")) {
                            if (data.invoices.length == 0) {
                                this.byId("oldInvoicesBtn").setVisible(false);
                                this.byId("dwnldForExcelBtn").setVisible(false);
                                this.byId("amendedInvoicesBtn").setVisible(false);
                            } else {
                                this.byId("oldInvoicesBtn").setVisible(true);
                                this.byId("dwnldForExcelBtn").setVisible(true);
                                this.byId("amendedInvoicesBtn").setVisible(true);
                            }
                        }
                        if (this.pendingFlag == true) {
                            if (data.invoices.length == 0) {
                                this.byId("approveButton").setVisible(false);
                                this.byId("rejectButton").setVisible(false);
                                this.byId("dwnldForExcelBtn").setVisible(false);
                            } else {
                                this.byId("approveButton").setVisible(true);
                                this.byId("rejectButton").setVisible(true);
                                this.byId("dwnldForExcelBtn").setVisible(true);
                            }
                        }
                        for (var i = 0; i < data.invoices.length; i++) {
                            if (data.invoices[i].AMENDEMENTSTATUS == "P") {
                                data.invoices[i].AMENDEMENTSTATUS = "Pending";
                            }
                            if (data.invoices[i].AMENDEMENTSTATUS == "A") {
                                data.invoices[i].AMENDEMENTSTATUS = "Approved";
                            }
                            if (data.invoices[i].AMENDEMENTSTATUS == "R") {
                                data.invoices[i].AMENDEMENTSTATUS = "Rejected";
                            }
                            if (data.invoices[i].AMENDEMENTSTATUS == "AY") {
                                data.invoices[i].AMENDEMENTSTATUS = "Approved";
                            }
                            if (data.invoices[i].AMENDEMENTSTATUS == "RY") {
                                data.invoices[i].AMENDEMENTSTATUS = "Rejected";
                            }
                        }
                        this.oModel = new sap.ui.model.json.JSONModel([]);
                        this.oModel.setData(data);
                        this.getView().setModel(this.oModel, "GSTDetailsModel");
                        this.GSTDetails = data;

                        this.oModel = new sap.ui.model.json.JSONModel([]);
                        this.oModel.setData(this.GSTDetails.invoices);
                        if (_self.GSTDetails.invoices.length > 0) {
                            _self.getView().byId("title").setText("Amendments" + " " + "(1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");
                        } else {
                            _self.getView().byId("title").setText("Amendments(" + _self.GSTDetails.invoices.length + ")");

                        }
                        this.getView().byId("fbmc-GSTIN").setSelectedKeys(data.filters.defaultGSTIN);
                        this.byId("tbl_amendment").setVisible(true);
                        this.byId("panel_table").setVisible(true);
                        if (data.filters) {
                            this.filterJson = data.filters;
                            var oModelData = new sap.ui.model.json.JSONModel();
                            oModelData.setData(this.filterJson);
                            this.getView().setModel(oModelData, "FilterDatamodel");
                            _self.getView().byId("fbmc-DocType").setSelectedKeys(_self.filterJson.documentType);
                            if (_self.flag) {
                                var tokensToSelect = [];
                                _self.filterJson.iataNumber = data.filters.agentName;
                            }
                        }
                    } else {
                        sap.ui.core.BusyIndicator.hide();
                    }
                });
            },
            triggerSegmentedButtonBookings: function (oEvent) {
                this.pendingFlag = false;
                this.byId("approveButton").setVisible(false);
                this.byId("rejectButton").setVisible(false);
            },
            triggerSegmentedButton: function () {
                this.pendingFlag = true;
                this.byId("oldInvoicesBtn").setVisible(false);
                this.byId("amendmentapprovedOnFilter").setVisible(false);

            },

            _routeMatched: function (oEvent) {

                this.pendingFlag = false;
                this.GSTDetails = {
                    results: []
                }
                this.filtered_GSTDetails = {
                    results: []
                }
                this.uniqueGSTDetails = {
                    results: []
                }
                this.reqJson = {
                    approveRequest: []

                }
                this.reqAddressJson = {
                    approveRequest: []
                }
                this.rejectJson = {
                    rejectRequests: []

                }
                this.rejectAddressJson = {
                    rejectRequests: []
                }
                this.sendApproveDetails = {
                    results: []
                };
                this.sendApproveAddressDetails = {
                    results: []
                };
                this.byId("approveButton").setVisible(false);
                this.byId("rejectButton").setVisible(false);
                this.getView().byId("fbinp-iataNumber").removeAllTokens();
                this.getView().byId("fbinp-invoiceNumber").removeAllTokens();
                this.getView().byId("fbinp-pnr").removeAllTokens();
                this.getView().byId("fbinp-ARN").removeAllTokens();
                this.getView().byId("fbdat-InvoiceDate").setValue("");
                this.getView().byId("fbdat-InvoiceDateApproved").setValue("");
                sap.ui.core.BusyIndicator.show();
                const jwt = sessionStorage.getItem("jwt")
                this.decodedData;
                if (jwt) {
                    this.decodedData = JSON.parse(atob(jwt.split('.')[1]));
                    this.category = this.decodedData.category;
                    if (this.decodedData.category == "07") {
                        this.decodedData.ISB2A = true
                    }
                    if (this.decodedData.ISB2A == true) {
                        if (this.decodedData.category == "07") {
                            this.byId("myBookingsButton").setVisible(false);
                            this.byId("b2aSegments").setSelectedKey("BOOKEDTHROUGH");
                            this.ISB2A_flag = true;
                            this.isMyBookings = "booked through";
                            this.byId("fbmc-GSTIN").setSelectedKeys("");
                            this.byId("approvedButton").setVisible(false);
                            this.byId("tbl_amendment").setVisible(false);
                            this.byId("panel_table").setVisible(false);
                        } else {
                            this.flag = true;
                            this.byId("b2aSegments").setVisible(true);
                            this.isMyBookings = "my bookings";
                            this.byId("approvedButton").setVisible(false);
                            this.byId("b2aSegments").setSelectedKey("MYBOOKINGS")
                        }
                    }
                    if (this.decodedData.ISB2A == false) {
                        this.flag = false;
                        this.byId("b2aSegments").setSelectedKey("APPROVED");
                        this.byId("myBookingsButton").setVisible(false);
                        this.byId("bookedForButton").setVisible(false);
                        this.byId("pendingButton").setVisible(true);
                    }
                }
                this.readInvoicesFromAmendment();
                this.decodedData;
                this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", "" + this.decodedData.FirstName + ' ' + this.decodedData.LastName);
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "Approve Amendments");
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/hinticon", true);
            },
            onButtonDownloadPressMultiOld: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                const oTable = this.byId("tbl_amendment");
                const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                const oSelIndices = oTable.getSelectedIndices();
                const aInvoices = [];
                if (oSelIndices.length) {
                    var oModel = oTable.getModel("GSTDetailsModel");

                    oSelIndices.forEach(function (iIndex) {
                        var ID;
                        var MultiOrgINVOICENUMBER = oTableData[iIndex].ORIGINALINVOICENUMBER;
                        var MultiAmendedINVOICENUMBER = oTableData[iIndex].INVOICENUMBER;
                        var oContext = oTable.getContextByIndex(iIndex);
                        var oData = oModel.getProperty(null, oContext);
                        if (MultiOrgINVOICENUMBER == "") {
                            ID = oData.INVOICENUMBER;
                        } else {
                            ID = oData.ORIGINALINVOICENUMBER;
                        }
                        aInvoices.push({ ID })
                    });
                    if (oSelIndices.length > 20000) {
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageBox.warning("Downloading PDF is restricted to only 20000 Documents.Please select lesser documents.")
                    } else {
                        if (oSelIndices.length > 1) {
                            this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ isCancelled: true, invoices: aInvoices }), (_self, data, message) => {
                                if (data !== null) {
                                    const invoices = data.invoice;
                                    const base64Data = "data:application/zip;base64," + invoices;
                                    const link = document.createElement('a');
                                    link.href = base64Data;
                                    link.download = `Original Invoices Documents`;
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
                                } else {
                                    MessageBox.warning("Something went wrong");
                                    sap.ui.core.BusyIndicator.hide();
                                }
                            });
                        } else {
                            this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ isCancelled: true, invoices: aInvoices }), (_self, data, message) => {

                                if (data !== null) {
                                    const invoices = data.invoice;
                                    const base64Data = "data:application/pdf;base64," + invoices;
                                    const link = document.createElement('a');
                                    link.href = base64Data;
                                    link.download = `Original Invoices - ${data.invoiceNumber}`;
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
                                } else {
                                    MessageBox.warning("Something went wrong");
                                    sap.ui.core.BusyIndicator.hide();
                                }

                            });
                        }
                    }
                } else {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.information("Please select the documents for downloading.");
                }
                sap.ui.core.BusyIndicator.hide();
            },
            onButtonDownloadPressMultiAmended: function (oEvent) {
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
                        const ID = oData.INVOICENUMBER;
                        aInvoices.push({ ID })
                    });
                    if (oSelIndices.length > 20000) {
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageBox.warning("Downloading PDF is restricted to only 20000 Documents.Please select lesser documents.")
                    } else {
                        if (oSelIndices.length > 1) {
                            this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices: aInvoices }), (_self, data, message) => {
                                if (data !== null) {
                                    const invoices = data.invoice;
                                    const base64Data = "data:application/zip;base64," + invoices;
                                    const link = document.createElement('a');
                                    link.href = base64Data;
                                    link.download = `Amended Invoices Documents`;
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
                                } else {
                                    MessageBox.warning("Something went wrong");
                                    sap.ui.core.BusyIndicator.hide();
                                }
                            });
                        } else {
                            this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices: aInvoices }), (_self, data, message) => {
                                if (data !== null) {
                                    const invoices = data.invoice;
                                    const base64Data = "data:application/pdf;base64," + invoices;
                                    const link = document.createElement('a');
                                    link.href = base64Data;
                                    link.download = `Amended Invoices - ${data.invoiceNumber}`;
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
                                } else {
                                    MessageBox.warning("Something went wrong");
                                    sap.ui.core.BusyIndicator.hide();
                                }
                            });
                        }
                    }
                } else {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.information("Please select the documents for downloading.");
                }
            },

            onButtonDownloadPressSingleAmended: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                const oTable = this.byId("tbl_amendment");
                var row = oEvent.getParameter("row").getIndex()
                var val = oEvent.getParameter("row").getBindingContext("GSTDetailsModel").getProperty("INVOICENUMBER");
                var orgInvNum = oEvent.getParameter("row").getBindingContext("GSTDetailsModel").getProperty("ORIGINALINVOICENUMBER");
                if ((val == "") || (val == null) || (val == undefined)) {
                    MessageBox.warning("Document cannot be downloaded due to missing invoice number");
                    sap.ui.core.BusyIndicator.hide();
                } else {
                    const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                    const aInvoices = [];
                    aInvoices.push({ ID: val });
                    if (orgInvNum == "") {
                        this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ isCancelled: true, invoices: aInvoices }), (_self, data, message) => {

                            if (data !== null) {
                                const invoices = data.invoice;
                                const base64Data = "data:application/pdf;base64," + invoices;
                                const link = document.createElement('a');
                                link.href = base64Data;
                                link.download = `Original Invoice - ${data.invoiceNumber}`;
                                link.click();
                                sap.ui.core.BusyIndicator.hide();
                            } else {
                                MessageBox.warning("Something went wrong");
                                sap.ui.core.BusyIndicator.hide();
                            }
                        });
                    } else {
                        this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices: aInvoices }), (_self, data, message) => {

                            if (data !== null) {
                                const invoices = data.invoice;
                                const base64Data = "data:application/pdf;base64," + invoices;
                                const link = document.createElement('a');
                                link.href = base64Data;
                                link.download = `Amended Invoice - ${data.invoiceNumber}`;
                                link.click();
                                sap.ui.core.BusyIndicator.hide();
                            } else {
                                MessageBox.warning("Something went wrong");
                                sap.ui.core.BusyIndicator.hide();
                            }
                        });
                    }
                }
            },
            onButtonDownloadPressSingleInvoice: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                const oTable = this.byId("tbl_amendment");
                var row = oEvent.getParameter("row").getIndex()
                var val = oEvent.getParameter("row").getBindingContext("GSTDetailsModel").getProperty("INVOICENUMBER");
                if ((val == "") || (val == null) || (val == undefined)) {
                    MessageBox.warning("Document cannot be downloaded due to missing invoice number");
                    sap.ui.core.BusyIndicator.hide();
                } else {
                    const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                    const aInvoices = [];
                    aInvoices.push({ ID: val });
                    this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices: aInvoices }), (_self, data, message) => {
                        sap.ui.core.BusyIndicator.hide();
                        if (data !== null) {
                            const invoices = data.invoice;
                            const base64Data = "data:application/pdf;base64," + invoices;
                            const link = document.createElement('a');
                            link.href = base64Data;
                            link.download = `Invoice - ${data.invoiceNumber}`;
                            link.click();
                            sap.ui.core.BusyIndicator.hide();
                        } else {
                            MessageBox.warning("Something went wrong");
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                }

                // }
            },
            onButtonDownloadPressSingleOld: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                const oTable = this.byId("tbl_amendment");
                var row = oEvent.getParameter("row").getIndex();
                const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                const aInvoices = [];
                var val = oEvent.getParameter("row").getBindingContext("GSTDetailsModel").getProperty("ORIGINALINVOICENUMBER");
                var orgInvNumOld = oEvent.getParameter("row").getBindingContext("GSTDetailsModel").getProperty("INVOICENUMBER");
                if ((val == "") || (val == null) || (val == undefined)) {
                    aInvoices.push({ ID: orgInvNumOld });
                } else {
                    aInvoices.push({ ID: val });
                }
                this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ isCancelled: true, invoices: aInvoices }), (_self, data, message) => {

                    if (data !== null) {
                        const invoices = data.invoice;
                        const base64Data = "data:application/pdf;base64," + invoices;
                        const link = document.createElement('a');
                        link.href = base64Data;
                        link.download = `Original Invoice - ${data.invoiceNumber}`;
                        link.click();
                        sap.ui.core.BusyIndicator.hide();
                    } else {
                        MessageBox.warning("Something went wrong");
                        sap.ui.core.BusyIndicator.hide();
                    }
                });
                // }

            },

            Fetch_GSTDetails: function () {
                this.defaultGSTN_num = ["05KHGPG2501F1ZK"];
                this.getView().byId("fbmc-GSTIN").setSelectedKeys(this.defaultGSTN_num);
            },
            onApproveAmndReq: function (oEvent) {
                const oObject = oEvent.getSource().getBindingContext("GSTDetailsModel").getObject();
                const invoiceNumber = oObject.ID,
                    isAmendedAddress = oObject.AMENDENTEDADDRESS ? true : false;
                if (!this.oApproveAmendmentDialog) {
                    this.oApproveAmendmentDialog = new Dialog({
                        type: DialogType.Message,
                        title: "Confirm Approve",
                        content: [
                            new Label({
                                text: "Are you sure you want to Approve this Amendment?"
                            })
                        ],
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "Approve",
                            press: function () {
                                sap.ui.core.BusyIndicator.show();
                                this.handleApproveAmndReq(invoiceNumber, isAmendedAddress);
                                this.oApproveAmendmentDialog.close();
                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: "Cancel",
                            press: function () {
                                this.oApproveAmendmentDialog.close();
                            }.bind(this)
                        })
                    });
                }
                this.oApproveAmendmentDialog.open();
            },
            approveChangeGSTIN: function () {
                return new Promise((resolve, reject) => {
                    var _self = this;
                    var url = "/portal-api/portal/v1/approve-amendment-request"; //change gstin
                    this.SendRequest(this, url, "POST", {}, JSON.stringify({ approveRequest: this.approveRequests }), (_self, data, message) => {
                        /** Handle Message Validation */
                        if (data) {
                            _self.validateDetailsAmendment.results = _self.validateDetailsAmendment.results.concat(data);
                            resolve();
                        } else {
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                });
            },
            approveRemoveGSTIN: function () {
                return new Promise((resolve, reject) => {
                    var _self = this;
                    var url = "/portal-api/portal/v1/approve-address-amendment-request"; //remove gstin 
                    this.SendRequest(this, url, "POST", {}, JSON.stringify({ approveRequest: this.approveAddressRequests }), (_self, data, message) => {
                        /** Handle Message Validation */
                        if (data) {
                            _self.validateDetailsAmendment.results = _self.validateDetailsAmendment.results.concat(data);
                            resolve();
                        } else {
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                });
            },
            approveChangeAddress: function () {
                return new Promise((resolve, reject) => {
                    var _self = this;
                    var url = "/portal-api/portal/v1/approve-change-address-amendment-request"; //change address 
                    this.SendRequest(this, url, "POST", {}, JSON.stringify({ approveRequest: this.approveChangeAddressRequests }), (_self, data, message) => {
                        /** Handle Message Validation */
                        if (data) {
                            _self.validateDetailsAmendment.results = _self.validateDetailsAmendment.results.concat(data);
                            resolve();
                        } else {
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                });
            },
            rejectChangeGSTIN: function () {
                return new Promise((resolve, reject) => {
                    var _self = this;
                    var url = "/portal-api/portal/v1/reject-amendment-request"; //change gstin
                    this.SendRequest(this, url, "POST", {}, JSON.stringify({ rejectRequests: this.approveRequests }), (_self, data, message) => {
                        /** Handle Message Validation */
                        if (data) {
                            _self.validateDetailsAmendment.results = _self.validateDetailsAmendment.results.concat(data);
                            resolve();
                        } else {
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                });
            },
            rejectRemoveGSTIN: function () {
                return new Promise((resolve, reject) => {
                    var _self = this;
                    var url = "/portal-api/portal/v1/reject-address-amendment-request"; //remove gstin 
                    this.SendRequest(this, url, "POST", {}, JSON.stringify({ rejectRequests: this.approveAddressRequests }), (_self, data, message) => {
                        /** Handle Message Validation */
                        if (data) {
                            _self.validateDetailsAmendment.results = _self.validateDetailsAmendment.results.concat(data);
                            resolve();
                        } else {
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                });
            },
            rejectChangeAddress: function () {
                return new Promise((resolve, reject) => {
                    var _self = this;
                    var url = "/portal-api/portal/v1/reject-change-address-amendment-request"; //change address 
                    this.SendRequest(this, url, "POST", {}, JSON.stringify({ rejectRequests: this.approveChangeAddressRequests }), (_self, data, message) => {
                        /** Handle Message Validation */
                        if (data) {
                            _self.validateDetailsAmendment.results = _self.validateDetailsAmendment.results.concat(data);
                            resolve();
                        } else {
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                });
            },
            confirmApprove: async function (oEvent) {
                const oTable = this.getView().byId("tbl_amendment");
                const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                const oSelIndices = oTable.getSelectedIndices();
                const aInvoices = [];
                this.reqAddressJson.approveRequest = [];
                this.reqJson.approveRequest = [];
                this.changeAddressJson.approveRequest = [];

                if (oSelIndices.length) {
                    oSelIndices.forEach(index => {
                        const ID = oTableData[index].ID;
                        const INVOICENUMBER = oTableData[index].INVOICENUMBER;
                        const ADMENTMENTTYPE = oTableData[index].AMENDMENTTYPE;

                        if (oTableData[index].AMENDMENTTYPE == "REMOVE GSTIN") {
                            this.reqAddressJson.approveRequest.push({ ID: ID, INVOICENUMBER: INVOICENUMBER });
                        }
                        if (oTableData[index].AMENDMENTTYPE == "CHANGE ADDRESS") {
                            this.changeAddressJson.approveRequest.push({ ID: ID, INVOICENUMBER: INVOICENUMBER });
                        }
                        if (oTableData[index].AMENDMENTTYPE == "CHANGE GSTIN") {
                            this.reqJson.approveRequest.push({ ID: ID, INVOICENUMBER: INVOICENUMBER });
                        }
                    });
                }
                var _self = this;
                sap.ui.core.BusyIndicator.show();
                const reqJson = this.reqJson;
                const reqAddressJson = this.reqAddressJson;
                const changeAddressJson = this.changeAddressJson;
                this.approveAddressRequests = reqAddressJson.approveRequest;
                this.approveRequests = reqJson.approveRequest;
                this.approveChangeAddressRequests = changeAddressJson.approveRequest;
                let url;
                this.sendApproveDetails.results = [];
                this.sendApproveAddressDetails.results = [];
                this.sendApproveChangeAddressDetails.results = [];
                this.validateDetailsAmendment.results = [];
                if (this.approveAddressRequests.length > 0 && this.approveRequests.length > 0 && this.approveChangeAddressRequests.length > 0) {
                    url = "/portal-api/portal/v1/approve-address-amendment-request";   //remove gstin
                    this.SendRequest(this, url, "POST", {}, JSON.stringify({ approveRequest: this.approveAddressRequests }), (_self, data, message) => {
                        _self.sendApproveAddressDetails.results = _self.sendApproveAddressDetails.results.concat(data);
                    });
                    url = "/portal-api/portal/v1/approve-change-address-amendment-request";   //change address
                    this.SendRequest(this, url, "POST", {}, JSON.stringify({ approveRequest: this.approveChangeAddressRequests }), (_self, data, message) => {
                        _self.sendApproveChangeAddressDetails.results = _self.sendApproveChangeAddressDetails.results.concat(data);
                    });
                    url = "/portal-api/portal/v1/approve-amendment-request"; //change gstin
                    this.SendRequest(this, url, "POST", {}, JSON.stringify({ approveRequest: this.approveRequests }), (_self, data, message) => {

                        _self.sendApproveDetails.results = _self.sendApproveDetails.results.concat(data);
                        if (_self.sendApproveAddressDetails.results.length > 0) {
                            _self.sendApproveDetails.results = _self.sendApproveDetails.results.concat(_self.sendApproveAddressDetails.results)
                        }
                        if (_self.sendApproveChangeAddressDetails.results.length > 0) {
                            _self.sendApproveDetails.results = _self.sendApproveDetails.results.concat(_self.sendApproveChangeAddressDetails.results)
                        }

                        /** Handle Message Validation */
                        if (_self.sendApproveDetails.results.length > 0) {
                            var oModelData = new sap.ui.model.json.JSONModel([]);
                            oModelData.setData(_self.sendApproveDetails);
                            _self.getView().setModel(oModelData, "validateModel");
                            if (!_self._validateFrag) {
                                _self._validateFrag = sap.ui.xmlfragment("airindiagst.view.Fragment.approveRejectStatus", _self);
                                _self.getView().addDependent(_self._validateFrag);
                            }
                            sap.ui.getCore().byId("myDialogStatus")._getCancelButton().setText("Close");
                            _self._validateFrag.open();
                            sap.ui.core.BusyIndicator.hide();
                        } else {
                            MessageBox.warning("Something went wrong");
                            sap.ui.core.BusyIndicator.show();
                            _self.readInvoicesFromAmendment(oEvent);
                        }
                        sap.ui.core.BusyIndicator.hide();
                        _self.readInvoicesFromAmendment(oEvent);
                    });
                } else {
                    if (this.approveRequests.length > 0) {
                        await _self.approveChangeGSTIN();
                    } if (this.approveAddressRequests.length > 0) {
                        await _self.approveRemoveGSTIN();
                    } if (this.approveChangeAddressRequests.length > 0) {
                        await _self.approveChangeAddress();
                    }
                    if (_self.validateDetailsAmendment.results.length > 0) {
                        var oModelData = new sap.ui.model.json.JSONModel([]);
                        oModelData.setData(_self.validateDetailsAmendment);
                        _self.getView().setModel(oModelData, "validateModel");
                        if (!_self._validateFrag) {
                            _self._validateFrag = sap.ui.xmlfragment("airindiagst.view.Fragment.approveRejectStatus", _self);
                            _self.getView().addDependent(_self._validateFrag);
                        }
                        sap.ui.getCore().byId("myDialogStatus")._getCancelButton().setText("Close");
                        _self._validateFrag.open();
                        _self.readInvoicesFromAmendment(oEvent);
                        sap.ui.core.BusyIndicator.hide();
                    } else {
                        MessageBox.warning("Something went wrong");
                        _self.readInvoicesFromAmendment(oEvent);
                        sap.ui.core.BusyIndicator.hide();
                    }
                    sap.ui.core.BusyIndicator.hide();

                }
                //   }
            },
            onPressApprove: function (oEvent) {
                var _self = this;
                const oTable = this.getView().byId("tbl_amendment");
                const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                const oSelIndices = oTable.getSelectedIndices();
                if (oSelIndices.length == 0) {
                    MessageBox.information("Please select atleast one row to proceed");
                } else {
                    MessageBox.warning("Do you want to approve the following document(s)?", {
                        actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.NO) {
                            } else {
                                _self.confirmApprove(oEvent);
                            }
                        }
                    });
                }
            },
            handleSearchInvoiceInAmendments: function (oEvent) {
                var sValue = oEvent.getParameter("value").trim();
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("INVOICENUMBER", sap.ui.model.FilterOperator.Contains, sValue)
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },
            handleClose: function () {
                var _self = this;
                sap.ui.core.BusyIndicator.hide();
                _self.readInvoicesFromAmendment();
            },
            onPressReject: function (oEvent) {
                var _self = this;
                const oTable = this.byId("tbl_amendment");
                const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                const oSelIndices = oTable.getSelectedIndices();
                if (oSelIndices.length == 0) {
                    MessageBox.information("Please select atleast one row to proceed");
                }
                else {
                    MessageBox.warning("Do you want to reject the following document(s)?", {
                        actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.NO) {
                            } else {
                                if (!_self.rejectionText) {
                                    _self.rejectionText = sap.ui.xmlfragment("airindiagst.view.Fragment.amendmentRejectText", _self);
                                    _self.getView().addDependent(_self.rejectionText);
                                }
                                _self.rejectionText.open();
                            }
                        }
                    });
                }

            },
            onRejection: function (oEvent) {
                var _self = this;
                this.rejectionFragment = sap.ui.getCore().byId("inp-textArea");
                this.rejectReasonText = sap.ui.getCore().byId("inp-textArea").getValue();
                if (this.rejectReasonText == "") {
                    this.rejectionFragment.setValueState("Error").setValueStateText("Reason Is Mandatory");
                } else {
                    sap.ui.getCore().byId("inp-textArea").setValue("");
                    _self.confirmReject(oEvent);
                    _self.rejectionText.close();
                }
            },
            oncloseRejectionFragment: function (oEvent) {
                var _self = this;
                _self.rejectionText.close();
            },
            confirmReject: async function (oEvent) {
                const oTable = this.byId("tbl_amendment");
                const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                const oSelIndices = oTable.getSelectedIndices();
                const aInvoices = [];
                this.reqAddressJson.approveRequest = [];
                this.reqJson.approveRequest = [];
                this.changeAddressJson.approveRequest = [];
                if (oSelIndices.length) {
                    oSelIndices.forEach(index => {
                        const ID = oTableData[index].ID;
                        const INVOICENUMBER = oTableData[index].INVOICENUMBER;
                        const ADMENTMENTTYPE = oTableData[index].AMENDMENTTYPE;
                        if (oTableData[index].AMENDMENTTYPE == "REMOVE GSTIN") {
                            this.reqAddressJson.approveRequest.push({ ID: ID, INVOICENUMBER: INVOICENUMBER, rejectedReason: this.rejectReasonText });
                        }
                        if (oTableData[index].AMENDMENTTYPE == "CHANGE ADDRESS") {
                            this.changeAddressJson.approveRequest.push({ ID: ID, INVOICENUMBER: INVOICENUMBER, rejectedReason: this.rejectReasonText });
                        }
                        if (oTableData[index].AMENDMENTTYPE == "CHANGE GSTIN") {
                            this.reqJson.approveRequest.push({ ID: ID, INVOICENUMBER: INVOICENUMBER, rejectedReason: this.rejectReasonText });
                        }
                    });
                }
                var _self = this;
                sap.ui.core.BusyIndicator.show();
                const reqJson = this.reqJson;
                const reqAddressJson = this.reqAddressJson;
                const changeAddressJson = this.changeAddressJson;
                this.approveAddressRequests = reqAddressJson.approveRequest;
                this.approveRequests = reqJson.approveRequest;
                this.approveChangeAddressRequests = changeAddressJson.approveRequest;
                let url;
                this.sendApproveDetails.results = [];
                this.sendApproveAddressDetails.results = [];
                this.sendApproveChangeAddressDetails.results = [];
                this.validateDetailsAmendment.results = [];

                if (this.approveAddressRequests.length > 0 && this.approveRequests.length > 0 && this.approveChangeAddressRequests.length > 0) {
                    url = "/portal-api/portal/v1/reject-address-amendment-request";
                    this.SendRequest(this, url, "POST", {}, JSON.stringify({ rejectRequests: this.approveAddressRequests }), (_self, data, message) => {
                        _self.sendApproveAddressDetails.results = _self.sendApproveAddressDetails.results.concat(data);
                    });
                    url = "/portal-api/portal/v1/reject-change-address-amendment-request";   //change address
                    this.SendRequest(this, url, "POST", {}, JSON.stringify({ rejectRequests: this.approveChangeAddressRequests }), (_self, data, message) => {
                        _self.sendApproveChangeAddressDetails.results = _self.sendApproveChangeAddressDetails.results.concat(data);
                    });
                    url = "/portal-api/portal/v1/reject-amendment-request";
                    this.SendRequest(this, url, "POST", {}, JSON.stringify({ rejectRequests: this.approveRequests }), (_self, data, message) => {

                        _self.sendApproveDetails.results = _self.sendApproveDetails.results.concat(data);
                        if (_self.sendApproveAddressDetails.results.length > 0) {
                            _self.sendApproveDetails.results = _self.sendApproveDetails.results.concat(_self.sendApproveAddressDetails.results)
                        }

                        /** Handle Message Validation */
                        if (_self.sendApproveDetails.results.length > 0) {
                            var oModelData = new sap.ui.model.json.JSONModel([]);
                            oModelData.setData(_self.sendApproveDetails);
                            _self.getView().setModel(oModelData, "validateModel");
                            if (!_self._validateFrag) {
                                _self._validateFrag = sap.ui.xmlfragment("airindiagst.view.Fragment.approveRejectStatus", _self);
                                _self.getView().addDependent(_self._validateFrag);
                            }
                            sap.ui.getCore().byId("myDialogStatus")._getCancelButton().setText("Close");
                            _self._validateFrag.open();
                            _self.readInvoicesFromAmendment(oEvent);
                            sap.ui.core.BusyIndicator.hide();
                        } else {
                            MessageBox.warning("Something went wrong");
                            _self.readInvoicesFromAmendment(oEvent);
                            sap.ui.core.BusyIndicator.hide();
                        }
                        sap.ui.core.BusyIndicator.hide();
                        _self.readInvoicesFromAmendment(oEvent);
                    });
                } else {
                    if (this.approveRequests.length > 0) {
                        await _self.rejectChangeGSTIN();
                    } if (this.approveAddressRequests.length > 0) {
                        await _self.rejectRemoveGSTIN();
                    } if (this.approveChangeAddressRequests.length > 0) {
                        await _self.rejectChangeAddress();
                    }
                    if (_self.validateDetailsAmendment.results.length > 0) {
                        var oModelData = new sap.ui.model.json.JSONModel([]);
                        oModelData.setData(_self.validateDetailsAmendment);
                        _self.getView().setModel(oModelData, "validateModel");
                        if (!_self._validateFrag) {
                            _self._validateFrag = sap.ui.xmlfragment("airindiagst.view.Fragment.approveRejectStatus", _self);
                            _self.getView().addDependent(_self._validateFrag);
                        }
                        sap.ui.getCore().byId("myDialogStatus")._getCancelButton().setText("Close");
                        _self._validateFrag.open();
                        _self.readInvoicesFromAmendment(oEvent);
                        sap.ui.core.BusyIndicator.hide();
                    } else {
                        MessageBox.warning("Something went wrong");
                        _self.readInvoicesFromAmendment(oEvent);
                        sap.ui.core.BusyIndicator.hide();
                    }
                    sap.ui.core.BusyIndicator.hide();

                }

                //    }
            },
            handleRejectAmndReq: function (invoiceNumber, isAmendedAddress) {
                let url;
                if (isAmendedAddress) {
                    url = "/portal-api/portal/v1/reject-address-amendment-request";
                } else {
                    url = "/portal-api/portal/v1/reject-amendment-request";
                }
                const reqData = { ID: invoiceNumber }
                this.SendRequest(this, url, "POST", {}, JSON.stringify({ ...reqData }), (_self, data, message) => {
                    MessageToast.show(`Amendment request rejected.`)
                    _self._profileData();
                });
            },

            onSearch: function (oEvent) {
                this.getView().byId("tbl_amendment").clearSelection();
                this.segment = this.byId("b2aSegments").getSelectedKey();
                if (!this.getView().byId("filterbar").isDialogOpen()) {
                    sap.ui.core.BusyIndicator.show();

                    this.getView().byId("tbl_amendment").setVisible(true);
                    var filterval = {};
                    filterval.generateExcel = false;
                    var _self = this;
                    const selSegment = this.byId("b2aSegments").getSelectedKey();
                    if (selSegment == 'MYBOOKINGS') {
                        filterval.apiType = "AmendmentsApproved";
                        filterval.bookingType = "my bookings";
                    } else if (selSegment == 'BOOKEDTHROUGH') {
                        filterval.apiType = "AmendmentsApproved";
                        filterval.bookingType = "booked through";
                    }
                    if (!oEvent) {
                        _self.getView().byId("title").setText("Amendments(" + _self.GSTDetails.invoices.length + " / " + _self.GSTDetails.totalInvoices + ")");
                        _self.getView().getModel("GSTDetailsModel").setData(_self.GSTDetails);
                        _self.getView().getModel("GSTDetailsModel").refresh();
                        _self.getView().getModel("FilterDatamodel").refresh();
                        _self.byId("panel_table").setVisible(true);
                        _self.byId("tbl_amendment").setVisible(true);
                        sap.ui.core.BusyIndicator.hide();
                    } else {
                        this.loopfilters = {};
                        if (filterval.isMyBookings === "my Bookings") {
                            if (this.getView().byId("fbmc-GSTIN").getSelectedKeys().length < 1) {
                                MessageBox.error("Please select atleast one Buyer GSTIN");
                                sap.ui.core.BusyIndicator.hide();
                                return false;

                            }
                        }
                        if (this.getView().byId("fbinp-invoiceNumber").getTokens().length > 0) {
                            var invTokens = this.getView().byId("fbinp-invoiceNumber").getTokens();
                            var invToken = invTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var invarr = invToken.split(',');

                            filterval.invoiceNumber = invarr;
                        }
                        if (this.getView().byId("fbinp-ARN").getTokens().length > 0) {
                            var fieldName = "amendmentRequestNo";
                            filterval[fieldName] = this.getView().byId("fbinp-ARN").getValue();
                        }
                        if (this.getView().byId("fbdat-InvoiceDateSelected").getValue()) {
                            if (this.byId("fbdat-InvoiceDateSelected").isValidValue()) {
                                var daterange = this.getView().byId("fbdat-InvoiceDateSelected").getValue().split("to");
                                var formattedDates = daterange.map(date => {
                                    let parts = date.trim().split('/');
                                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                                });
                                filterval.from = formattedDates[0].trim();
                                filterval.to = formattedDates[1].trim();
                            } else {
                                MessageBox.error("Please choose a valid Date");
                                sap.ui.core.BusyIndicator.hide();
                                return false;
                            }
                        }
                        if (this.getView().byId("fbdat-InvoiceDate").getValue()) {
                            var daterange = this.getView().byId("fbdat-InvoiceDate").getValue().split("to");
                            filterval.amendmentRequestedOnFrom = daterange[0].trim();
                            filterval.amendmentRequestedOnTo = daterange[1].trim();
                        }
                        if (this.getView().byId("fbmc-DocType").getSelectedKeys()) {
                            filterval.documentType = this.getView().byId("fbmc-DocType").getSelectedKeys();

                        }
                        if (this.getView().byId("fbinp-ticketNumber").getTokens().length > 0) {
                            var ticTokens = this.getView().byId("fbinp-ticketNumber").getTokens();
                            var ticToken = ticTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var ticarr = ticToken.split(',');
                            filterval.ticketNumber = ticarr;
                        }
                        if (this.getView().byId("fbinp-ARN").getTokens().length > 0) {
                            var arnTokens = this.getView().byId("fbinp-ARN").getTokens();
                            var arnToken = arnTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var arnArr = arnToken.split(',');

                            filterval.amendmentRequestNo = arnArr;
                        }
                        if (this.getView().byId("fbinp-buyername").getTokens().length > 0) {
                            var buyerTokens = this.getView().byId("fbinp-buyername").getTokens();
                            var buyerToken = buyerTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var buyerarr = buyerToken.split(',');

                            filterval.billToName = buyerarr;
                        }
                        if (this.getView().byId("fbinp-pnr").getTokens().length > 0) {
                            var pnrTokens = this.getView().byId("fbinp-pnr").getTokens();
                            var pnrToken = pnrTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var pnrarr = pnrToken.split(',');

                            filterval.pnr = pnrarr;
                        }
                        if (this.getView().byId("fbinp-iataNumber").getTokens().length > 0) {
                            var iataTokens = this.getView().byId("fbinp-iataNumber").getTokens();
                            var iataToken = iataTokens.map(function (oToken) {
                                return oToken.mProperties.text;
                            }).join(",");
                            var iataarr = iataToken.split(',');

                            filterval.iataNumber = iataarr;
                        }
                        if ((this.pendingFlag == false) && (this.decodedData.ISB2A == false)) {
                            if (this.segment == "REJECTED") {
                                filterval.apiType = "AmendmentsRejected";
                                filterval.generateExcel = false;
                            }
                            if (this.segment == "APPROVED") {
                                filterval.apiType = "AmendmentsApproved";
                                filterval.generateExcel = false;
                            }

                        }
                        if ((this.pendingFlag == true) && (this.decodedData.ISB2A == false)) {
                            filterval.apiType = "PendingAmendments";
                            filterval.generateExcel = false;
                        }
                        if ((this.pendingFlag == true) && (this.decodedData.ISB2A == true)) {
                            filterval.apiType = "PendingAmendments";
                            filterval.generateExcel = false;
                        }
                        if ((this.pendingFlag == false) && (this.decodedData.ISB2A == true)) {
                            if (this.segment == "REJECTED") {
                                filterval.generateExcel = false;
                                filterval.apiType = "AmendmentsRejected";
                            } else {
                                if (this.decodedData.category == '07') {
                                    filterval.generateExcel = false;
                                    filterval.apiType = "AmendmentsApproved";
                                    filterval.bookingType = "booked through";
                                } else {
                                    filterval.generateExcel = false;
                                    filterval.apiType = "AmendmentsApproved";
                                    filterval.bookingType = "my bookings";

                                }
                                if (this.decodedData.category == '01') {
                                    if (this.segment == "BOOKEDTHROUGH") {
                                        filterval.generateExcel = false;
                                        filterval.apiType = "AmendmentsApproved";
                                        filterval.bookingType = "booked through";
                                    }
                                    else {
                                        filterval.generateExcel = false;
                                        filterval.apiType = "AmendmentsApproved";
                                        filterval.bookingType = "my bookings";
                                    }
                                }
                            }
                        }
                        filterval.pageNumber = 1;
                        filterval.pageSize = 100;
                        this.loopfilters = filterval;
                        this.SendRequest(this, "/portal-api/portal/v1/get-user-invoices", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                            if (data !== null) {
                                _self.GSTDetails = data;
                                if ((selSegment == "BOOKEDTHROUGH") || (selSegment == "MYBOOKINGS") || (selSegment == "APPROVED")) {
                                    if (data.invoices) {
                                        if (data.invoices.length == 0) {
                                            this.byId("oldInvoicesBtn").setVisible(false);
                                            this.byId("dwnldForExcelBtn").setVisible(false);
                                            this.byId("amendedInvoicesBtn").setVisible(false);

                                        } else {
                                            this.byId("oldInvoicesBtn").setVisible(true);
                                            this.byId("dwnldForExcelBtn").setVisible(true);
                                            this.byId("amendedInvoicesBtn").setVisible(true);
                                        }
                                    }
                                }
                                if (this.pendingFlag == true) {
                                    if (data.invoices) {
                                        if (data.invoices.length == 0) {
                                            this.byId("approveButton").setVisible(false);
                                            this.byId("rejectButton").setVisible(false);
                                        } else {
                                            this.byId("approveButton").setVisible(true);
                                            this.byId("rejectButton").setVisible(true);
                                        }
                                    }
                                }

                                for (var i = 0; i < data.invoices.length; i++) {
                                    if (data.invoices[i].AMENDEMENTSTATUS == "P") {
                                        data.invoices[i].AMENDEMENTSTATUS = "Pending";
                                    }
                                    if (data.invoices[i].AMENDEMENTSTATUS == "A") {
                                        data.invoices[i].AMENDEMENTSTATUS = "Approved";
                                    }
                                    if (data.invoices[i].AMENDEMENTSTATUS == "R") {
                                        data.invoices[i].AMENDEMENTSTATUS = "Rejected";
                                    }
                                    if (data.invoices[i].AMENDEMENTSTATUS == "RY") {
                                        data.invoices[i].AMENDEMENTSTATUS = "Rejected";
                                    }
                                    if (data.invoices[i].AMENDEMENTSTATUS == "AY") {
                                        data.invoices[i].AMENDEMENTSTATUS = "Approved";
                                    }
                                }
                                if (_self.GSTDetails.invoices.length > 0) {
                                    "Ticket Status" + " " + "(1 - "
                                    _self.getView().byId("title").setText("Amendments" + " " + "(1 - " + _self.GSTDetails.invoices.length + " of " + _self.GSTDetails.totalInvoices + ")");
                                } else {
                                    _self.getView().byId("title").setText("Amendments(" + _self.GSTDetails.invoices.length + ")");

                                }

                                this.oModel = new sap.ui.model.json.JSONModel([]);
                                this.oModel.setData(data);
                                _self.getView().setModel(this.oModel, "GSTDetailsModel");
                                _self.getView().getModel("GSTDetailsModel").refresh();
                                sap.ui.core.BusyIndicator.hide();
                            } else {
                                sap.ui.core.BusyIndicator.hide();
                            }
                        });
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
                var resultJSON = {
                    uniqueorginalGstins: uniqueorginalGstinsArray
                };
                this.uniqueGSTDetails.results = resultJSON.uniqueorginalGstins;
                this.oModel = new sap.ui.model.json.JSONModel([]);
                this.oModel.setData(this.uniqueGSTDetails);
                this.getView().setModel(this.oModel, "uniqueGSTDetailsModel");
            },
            handleSelectedGSTIN: function () {

                this.selectedGSTN_array = [];
                var selectedGSTN = this.getView().byId("fbmc-GSTIN").getSelectedItems();
                this.selectedGSTN_array = selectedGSTN.map(function (oToken) {
                    return oToken.mProperties.key;
                });
            },
            handleSelectedSupGSTIN: function () {
                this.selectedSupGSTN_array = [];
                var selectedGSTN = this.getView().byId("fbmc-SupGSTIN").getSelectedItems();
                this.selectedSupGSTN_array = selectedGSTN.map(function (oToken) {
                    return oToken.mProperties.key;
                });
            },
            handleValueHelpinvoiceNum: function (oEvent) {
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.invNumberDialog) {
                    this.invNumberDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.invoiceNumberFIlterDialog", this);
                    this.getView().addDependent(this.invNumberDialog);
                }
                var oList = this.invNumberDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }

                var selKeys = [];
                const prevSelected = this.byId("fbinp-invoiceNumber").getTokens();
                prevSelected.forEach(element => {
                    selKeys.push(element.getText())
                });

                oList = this.invNumberDialog._aSelectedItems;
                this.invNumberDialog.open();
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
                this.byId("fbinp-invoiceNumber").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-invoiceNumber");
                var aTitle = [];
                this.oListPlant = this.invNumberDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject();
                    aTitle.push(text);
                }

                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("fbinp-invoiceNumber").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                const sId = this.byId("fbinp-invoiceNumber");

                sId.getAggregation("tokenizer").setEditable(false);
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
                var invnoSH = oEvent.getParameter("value");
                if (invnoSH !== "") {
                    this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "invoiceNumber": invnoSH, "apiType": "Document" }), (_self, data, message) => {

                        var oModelData = new sap.ui.model.json.JSONModel();
                        if (data !== null) {
                            _self.filterJson;
                            _self.filterJsonUpdated = data.filters;
                            _self.filterJson.invoiceNumber = _self.filterJson.invoiceNumber.concat(data.filters.invoiceNumber.filter(function (item) {
                                return _self.filterJson.invoiceNumber.indexOf(item) === -1; // Check for uniqueness
                            }));
                            oModelData.setData(_self.filterJson);
                            _self.getView().setModel(oModelData, "FilterDatamodel");
                            var sValue = oEvent.getParameter("value");
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
            handleValueHelpAmendmentNum: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.amendReqNumDialog) {
                    this.amendReqNumDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.amendmentRequestNumber", this);
                    this.getView().addDependent(this.amendReqNumDialog);
                }
                var oList = this.amendReqNumDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.amendReqNumDialog._aSelectedItems;
                this.amendReqNumDialog.open();
            },
            handleValueHelpbuyername: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this.buyerNameDialog) {
                    this.buyerNameDialog = sap.ui.xmlfragment("airindiagst.view.Fragment.buyerFIlterDialog", this);
                    this.getView().addDependent(this.buyerNameDialog);
                }
                var oList = this.buyerNameDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this.buyerNameDialog._aSelectedItems;
                this.buyerNameDialog.open();
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
            handleValueHelpCloseAmReqNum: function (oEvent) {
                var token = [];
                this.aContexts = oEvent.getParameter("selectedContexts");
                if (this.aContexts && this.aContexts.length) {
                    this.aContexts.map(function (oContext) {
                        token.push(oContext.getObject().key);
                        return oContext.getObject().key;
                    }).join(", ");
                }
                this.byId("fbinp-ARN").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedItems"),
                    oInput = this.byId("fbinp-ARN");
                var aTitle = [];
                this.oListPlant = this.amendReqNumDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getTitle();
                    aTitle.push(text);
                }
                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("fbinp-ARN").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                var tokens = this.byId("fbinp-ARN").getTokens();
                tokens.forEach(function (token) {
                    token.setEditable(false);
                });
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
                sId.getAggregation("tokenizer").setEditable(false)
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
            handlecancelticket: function (oEvent) {

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
                var oSelectedItems = oEvent.getParameter("selectedContexts"),
                    oInput = this.byId("fbinp-ticketNumber");
                var aTitle = [];
                this.oListPlant = this.ticketNumberDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getObject();
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
                var tcknoSH = oEvent.getParameter("value");
                if (tcknoSH !== "") {
                    this.SendRequest(this, "/portal-api/portal/v1/get-filter-data", "POST", {}, JSON.stringify({ "ticketNumber": tcknoSH, "apiType": "Document" }), (_self, data, message) => {

                        var oModelData = new sap.ui.model.json.JSONModel();
                        if (data !== null) {
                            _self.filterJson;
                            _self.filterJsonUpdated = data.filters;
                            _self.filterJson.ticketNumber = _self.filterJson.ticketNumber.concat(data.filters.ticketNumber.filter(function (item) {
                                return _self.filterJson.ticketNumber.indexOf(item) === -1; // Check for uniqueness
                            }));
                            oModelData.setData(_self.filterJson);
                            _self.getView().setModel(oModelData, "FilterDatamodel");
                            var sValue = oEvent.getParameter("value");
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
            handleValueHelpPNRNum: function (oEvent) {
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
            handleValueHelpClosepnrNum: function (oEvent) {
                var token = [];
                this.aContexts = oEvent.getParameter("selectedContexts");
                if (this.aContexts && this.aContexts.length) {
                    this.aContexts.map(function (oContext) {
                        token.push(oContext.getObject().key);
                        return oContext.getObject().key;
                    }).join(", ");
                }
                this.byId("fbinp-pnr").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedItems"),
                    oInput = this.byId("fbinp-pnr");
                var aTitle = [];
                this.oListPlant = this.pnrNumDialog._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getTitle();
                    aTitle.push(text);
                }
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
            onPressExportExcel: function () {
                const selSegmentForExcel = this.byId("b2aSegments").getSelectedKey();
                var filterval = {

                };
                if ((selSegmentForExcel == "MYBOOKINGS") || (selSegmentForExcel == "BOOKEDTHROUGH") || (selSegmentForExcel == "APPROVED")) {
                    filterval.columns = {
                        "DOCUMENTTYPE": "Document Type",
                        "INVOICENUMBER": "Document Number",
                        "INVOICEDATE": "Document Date",
                        "ORIGINALINVOICENUMBER": "Original Document Number",
                        "TICKETNUMBER": "Ticket Number",
                        "AMENDMENTREASON": "Reason",
                        "AMENDEMENTNEWVALUE": "New GSTIN / Address",
                        "AMENDEMENTOLDVALUE": "Old GSTIN / Address",
                        "AMENDEMENTSTATUS": "Status (Approved - A, Pending - P, Rejected - R)"
                    }
                }
                if (selSegmentForExcel == "PENDING") {
                    filterval.columns = {
                        "DOCUMENTTYPE": "Document Type",
                        "INVOICENUMBER": "Document Number",
                        "INVOICEDATE": "Document Date",
                        "TICKETNUMBER": "Ticket Number",
                        "AMENDMENTREASON": "Reason",
                        "AMENDEMENTNEWVALUE": "New GSTIN / Address",
                        "AMENDEMENTOLDVALUE": "Old GSTIN / Address",
                        "AMENDEMENTSTATUS": "Status (Approved - A, Pending - P, Rejected - R)"
                    }
                }
                if (selSegmentForExcel == "REJECTED") {
                    filterval.columns = {
                        "DOCUMENTTYPE": "Document Type",
                        "INVOICENUMBER": "Document Number",
                        "INVOICEDATE": "Document Date",
                        "TICKETNUMBER": "Ticket Number",
                        "AMENDMENTREJECTIONREASON": "Reason",
                        "AMENDEMENTNEWVALUE": "New GSTIN / Address",
                        "AMENDEMENTOLDVALUE": "Old GSTIN / Address",
                        "AMENDEMENTSTATUS": "Status (Approved - A, Pending - P, Rejected - R)"

                    }
                }
                sap.ui.core.BusyIndicator.show();
                var oTable = this.byId("tbl_amendment");
                var aSelectedIndices = oTable.getSelectedIndices();
                var aSelectedInvoiceNumbers = [];
                aSelectedIndices.forEach(function (aSelectedIndices) {
                    var oBindingContext = oTable.getContextByIndex(aSelectedIndices);
                    var sInvoiceNumber = oBindingContext.getProperty().INVOICENUMBER;
                    aSelectedInvoiceNumbers.push(sInvoiceNumber);
                });
                if (aSelectedInvoiceNumbers.length == 0) {
                    MessageBox.information("Please select atleast one row to proceed");
                    sap.ui.core.BusyIndicator.hide();
                }
                this.segment = this.byId("b2aSegments").getSelectedKey();
                if (aSelectedInvoiceNumbers.length > 0) {
                    filterval.invoiceNumber = aSelectedInvoiceNumbers;
                    if ((this.pendingFlag == false) && (this.decodedData.ISB2A == false)) {
                        if (this.segment == "REJECTED") {
                            filterval.apiType = "AmendmentsRejected";
                            filterval.generateExcel = false;
                        }
                        if (this.segment == "APPROVED") {
                            filterval.apiType = "AmendmentsApproved";
                            filterval.generateExcel = false;
                        }

                    }
                    if ((this.pendingFlag == true) && (this.decodedData.ISB2A == false)) {
                        filterval.apiType = "PendingAmendments";
                        filterval.generateExcel = false;
                    }
                    if ((this.pendingFlag == true) && (this.decodedData.ISB2A == true)) {
                        filterval.apiType = "PendingAmendments";
                        filterval.generateExcel = false;
                    }
                    if ((this.pendingFlag == false) && (this.decodedData.ISB2A == true)) {
                        if (this.segment == "REJECTED") {
                            filterval.generateExcel = false;
                            filterval.apiType = "AmendmentsRejected";
                        } else {
                            if (this.decodedData.category == '07') {
                                filterval.generateExcel = false;
                                filterval.apiType = "AmendmentsApproved";
                                filterval.bookingType = "booked through";
                            } else {
                                filterval.generateExcel = false;
                                filterval.apiType = "AmendmentsApproved";
                                filterval.bookingType = "my bookings";

                            }
                            if (this.decodedData.category == '01') {
                                if (this.segment == "BOOKEDTHROUGH") {
                                    filterval.generateExcel = false;
                                    filterval.apiType = "AmendmentsApproved";
                                    filterval.bookingType = "booked through";
                                }
                                else {
                                    filterval.generateExcel = false;
                                    filterval.apiType = "AmendmentsApproved";
                                    filterval.bookingType = "my bookings";
                                }
                            }
                        }
                    }
                    filterval.generateExcel = true;
                    this.SendRequest(this, "/portal-api/portal/v1/get-user-invoices", "POST", {}, JSON.stringify(filterval), (_self, data, message) => {
                        if (data != null) {
                            var base64Data = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + data.excel;
                            const link = document.createElement('a');
                            link.href = base64Data;
                            link.download = "Amendment Documents";
                            link.click();
                            sap.ui.core.BusyIndicator.hide();
                        } else {
                            MessageBox.warning("Something went wrong");
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                }

            }
        });
    }
);