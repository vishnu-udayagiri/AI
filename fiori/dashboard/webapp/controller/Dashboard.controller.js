sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/viz/ui5/format/ChartFormatter",
    'sap/ui/export/Spreadsheet',
    "sap/viz/ui5/api/env/Format",
    "sap/m/MessageBox",
    'sap/viz/ui5/controls/Popover',
    'sap/ui/core/HTML',
    "sap/m/library",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, ChartFormatter, Spreadsheet, Format, MessageBox, Popover, HTMLControl, Library) {
        "use strict";
        var EdmType = Library.EdmType;

        return Controller.extend("ns.dashboard.controller.Dashboard", {
            onInit: function () {
                this.SendRequest = this.getOwnerComponent().SendRequest;
                //Get i18n Resource Bundle
                this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

                //JSON Models
                this.oFilterModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(this.oFilterModel, "filterDatamodel");

                this.oTaxWiseLiabiityModel = new sap.ui.model.json.JSONModel([]);
                this.getView().setModel(this.oTaxWiseLiabiityModel, "oTaxWiseLiabiityModel");

                this.oTaxWiseLiabiityFilterModel = new sap.ui.model.json.JSONModel([]);
                this.getView().setModel(this.oTaxWiseLiabiityFilterModel, "oTaxWiseLiabiityFilterModel");

                this.oSectionWiseLiabiityModel = new sap.ui.model.json.JSONModel([]);
                this.getView().setModel(this.oSectionWiseLiabiityModel, "oSectionWiseLiabiityModel");

                this.oSectionWiseLiabiityFilterModel = new sap.ui.model.json.JSONModel([]);
                this.getView().setModel(this.oSectionWiseLiabiityFilterModel, "oSectionWiseLiabiityFilterModel");

                this.oStateWiseLiabiityModel = new sap.ui.model.json.JSONModel([]);
                this.getView().setModel(this.oStateWiseLiabiityModel, "oStateWiseLiabiityModel");

                this.oStateWiseLiabiityFilterModel = new sap.ui.model.json.JSONModel([]);
                this.getView().setModel(this.oStateWiseLiabiityFilterModel, "oStateWiseLiabiityFilterModel");

                this.oSalesWiseBreakUpModel = new sap.ui.model.json.JSONModel([]);
                this.getView().setModel(this.oSalesWiseBreakUpModel, "oSalesWiseBreakUpModel");

                this.oSalesWiseBreakUpFilterModel = new sap.ui.model.json.JSONModel([]);
                this.getView().setModel(this.oSalesWiseBreakUpFilterModel, "oSalesWiseBreakUpFilterModel");

                this.oTaxRateWiseBreakUpModel = new sap.ui.model.json.JSONModel([]);
                this.getView().setModel(this.oTaxRateWiseBreakUpModel, "oTaxRateWiseBreakUpModel");

                this.oTaxRateWiseBreakUpFilterModel = new sap.ui.model.json.JSONModel([]);
                this.getView().setModel(this.oTaxRateWiseBreakUpFilterModel, "oTaxRateWiseBreakUpFilterModel");

                this.oTrendModel = new sap.ui.model.json.JSONModel([]);
                this.getView().setModel(this.oTrendModel, "trendDataModel");

                sap.ui.core.BusyIndicator.hide();

                this.SendRequest = this.getOwnerComponent().SendRequest;

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("RouteDashboard").attachPatternMatched(this._routeMatched, this);

                this._setCustomFormatter();
            },
            _routeMatched: function () {
                sap.ui.core.BusyIndicator.show();
                this.byId("BlockLayout3").setVisible(true);
                this.byId("BlockLayout4").setVisible(false);
                /** get Service URL */
                const mObj = this.getOwnerComponent().getManifestObject();
                if (mObj._oBaseUri._string.includes("port") || mObj._oBaseUri._string.includes("localhost")) {
                    this.sURL = mObj._oBaseUri._string.split('/dashboard')[0] + '/'
                } else {
                    this.sURL = mObj._oBaseUri._parts.path
                }

                var currentDate = new Date();
                var oCalendar = this.byId("dp-financialYear");
                // Calculate the start date of the next financial year (April 1st)
                var nextFinancialYearStartDate = new Date(currentDate.getFullYear() + 1, 3, 1);

                // Set the maximum date to the start date of the next financial year
                oCalendar.setMaxDate(nextFinancialYearStartDate);


                this._getFilterData();

                this._getChartData([], '', [], [], [], '', '', '');
                var oVizFrame = this.getView().byId("idVizFrame_sectionWise");
                    oVizFrame.setVizProperties({
                     plotArea: {
                            colorPalette: ['#B61032', '#531251']
                           }
                    });
                    var oVizFrame1 = this.getView().byId("idVizFrame_taxWise");
                    oVizFrame1.setVizProperties({
                     plotArea: {
                            colorPalette: ['#B61032', '#531251', '#F8C1B4', '#F9F6EE']
                           }
                    });
                    var oVizFrame2 = this.getView().byId("idVizFrame_stateWise");
                    oVizFrame2.setVizProperties({
                     plotArea: {
                            colorPalette: ['#B61032', '#531251', '#F8C1B4', '#F9F6EE']
                           }
                    });
                    var oVizFrame3 = this.getView().byId("idVizFrame_SalesWiseBreakUp");
                    oVizFrame3.setVizProperties({
                     plotArea: {
                            colorPalette: ['#B61032', '#531251', '#F8C1B4', '#F9F6EE']
                           }
                    });
                    var oVizFrame4 = this.getView().byId("idVizFrame_TaxRateWiseBreakUp");
                    oVizFrame4.setVizProperties({
                     plotArea: {
                            colorPalette: ['#B61032', '#531251', '#F8C1B4', '#F9F6EE']
                           }
                    });
                    var oVizFrame5 = this.getView().byId("idVizFrame_TrendChart");
                    oVizFrame5.setVizProperties({
                     plotArea: {
                            colorPalette: ['#B61032', '#531251', '#F8C1B4', '#F9F6EE']
                           }
                    });
                    var oVizFrame6 = this.getView().byId("idVizFrame_TrendChart1");
                    oVizFrame6.setVizProperties({
                     plotArea: {
                            colorPalette: ['#B61032', '#531251', '#F8C1B4', '#F9F6EE']
                           }
                    });

            },
            /** Filter Data */
            _getFilterData: function () {
                var _self = this;
                jQuery.ajax({
                    url: _self.sURL + "dashboard/supplierGSTIN",
                    type: "GET",
                    contentType: "application/json",
                    success: function (response, textStatus, jqXHR) {
                        _self.oFilterModel.setData(response.value);
                        _self.oFilterModel.setSizeLimit(response.value.length);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        MessageBox.error("Something went wrong. Please try again");
                    },
                });
            },
            /** Value help - supplier GSTIN */
            handleValueHelpSupplierGSTIN: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                this.InputId = oEvent.getSource().getId().split("--")[1];
                if (!this._oSupplierFilterDialog) {
                    this._oSupplierFilterDialog = sap.ui.xmlfragment("ns.dashboard.view.Fragments.supplierGSTIN", this);
                    this.getView().addDependent(this._oSupplierFilterDialog);
                }
                var oList = this._oSupplierFilterDialog._aSelectedItems;
                if (oList) {
                    oList.pop();
                }
                oList = this._oSupplierFilterDialog._aSelectedItems;

                this._oSupplierFilterDialog.open();
            },
            /** Value Help Search - Supplier GSTIN */
            handleValueHelpSearchSupplierGSTIN: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("supplierGSTIN", sap.ui.model.FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },
            /** Value Help Close - Supplier GSTIN */
            handleValueHelpCloseSupplierGSTIN: function (oEvent) {
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
                this.byId("minp-GSTINAI").removeAllTokens();
                var oSelectedItems = oEvent.getParameter("selectedItems"),
                    oInput = this.byId("minp-GSTINAI");
                var aTitle = [];
                // this.oListPlant = this.filterInvnum._aSelectedItems;
                for (var title = 0; title < oSelectedItems.length; title++) {
                    var text = oSelectedItems[title].getTitle();
                    aTitle.push(text);
                }
                //adding the selected values to the tokens.
                for (var i = 0; i < aTitle.length; i++) {
                    this.byId("minp-GSTINAI").addToken(new sap.m.Token({
                        text: aTitle[i]
                    }));
                }
                if (!oSelectedItems) {
                    oInput.resetProperty("value");
                }
                const sId = this.byId("minp-GSTINAI");

                sId.getAggregation("tokenizer").setEditable(false)

                /*var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
                if (oSelectedItem) {
                    this.getView().byId(this.inputId).setValue(oSelectedItem);
                }
                oEvent.getSource().getBinding("items").filter([]);*/
            },
            /**Handle Chnage Qaurter */
            handleSelectedQuarterType: function (oEvent) {
                debugger;
                const oSelKey = oEvent.getSource().getSelectedKey();
                this.getView().byId("fbdat-Year").setValueState("None");
                if (oSelKey) {
                    this.byId("fbmc-Year").setVisible(true);
                } else {
                    this.byId("fbmc-Year").setVisible(false);
                }
            },
            /** Change Financial Year */
            onFinancialYearChange: function (oEvent) {
                var oDP = oEvent.getSource(),
                    bValid = oEvent.getParameter("valid");
                if (bValid) {
                    oDP.setValueState("None");
                } else {
                    oDP.setValueState("Error").setValueStateText("Enter a valid Financial Year");
                }
            },
            /** On Search filter - SupplierGSTIN & Financial Year */
            onSearch: function (oEvent) {
                var validate = true;
                if (this.getView().byId("fbmc-Quarter").getSelectedKey()){
                    if (this.getView().byId("fbdat-Year").getValue()) {
                        var year = this.getView().byId("fbdat-Year").getValue();
                    } else {
                        this.getView().byId("fbdat-Year").setValueState("Error").setValueStateText("Year is mandatory");
                        validate = false
                    }
                }


                if (!this.getView().byId("filterbar").isDialogOpen() && validate) {
                    if (this.getView().byId("minp-GSTINAI").getTokens().length > 0) {
                        const tokens = this.getView().byId("minp-GSTINAI").getTokens();
                        var supplierGSTIN = tokens.map(function (oToken) {
                            return { value: oToken.mProperties.text };
                        });
                    }
                    if (this.getView().byId("dp-financialYear").getValue()) {
                        var financialYear = this.getView().byId("dp-financialYear").getValue();
                    }
                    if (this.getView().byId("fbmc-DocType").getSelectedKeys()) {
                        const oSelData = this.getView().byId("fbmc-DocType").getSelectedKeys();
                        var documentType = oSelData.map(function (oKey) {
                            return { value: oKey };
                        });

                    }
                    if (this.getView().byId("fbmc-secType").getSelectedKeys()) {
                        const oSelData = this.getView().byId("fbmc-secType").getSelectedKeys();
                        var sectionType = oSelData.map(function (oKey) {
                            return { value: oKey };
                        });

                    }
                    if (this.getView().byId("fbmc-Quarter").getSelectedKey()) {
                        const oSelData = this.getView().byId("fbmc-Quarter").getSelectedKey();
                        var quarter = [{ value: oSelData }];
                    }
                    if (this.getView().byId("fbmc-Quarter").getSelectedKey() && this.getView().byId("fbdat-Year").getValue()) {
                        var year = this.getView().byId("fbdat-Year").getValue();
                    } else {
                        this.getView().byId("fbdat-Year").setValueState("Error").setValueStateText("Year is mandatory");
                    }
                    if (this.getView().byId("fbdat-invoiceDate").getValue()) {
                        if (this.byId("fbdat-invoiceDate").isValidValue()) {
                            var from = this.getView().byId("fbdat-invoiceDate").getDateValue();
                            var to = this.getView().byId("fbdat-invoiceDate").getSecondDateValue();
                        } else {
                            MessageBox.error("Please choose a valid Document date");
                            sap.ui.core.BusyIndicator.hide();
                            return false;
                        }
                    }

                    if (this.getView().byId("dp-financialYear")._bValid) {
                        sap.ui.core.BusyIndicator.show();
                        this._getChartData(supplierGSTIN ?? [], financialYear ?? '', documentType ?? [], sectionType ?? [], quarter ?? [], year ?? '', from ?? '', to ?? '');
                    }
                }
            },
            /** Chart Details - Type wise, State Wise and Segment Wise Breakup of tax Liability */
            _getChartData: function (supplierGSTIN, financialYear, documentType, sectionType, quarter, year, from, to) {
                var _self = this;
                jQuery.ajax({
                    url: _self.sURL + "dashboard/getDashboardDetails",
                    type: "POST",
                    data: JSON.stringify({ supplierGSTIN: supplierGSTIN, financialYear: financialYear, documentType: documentType, sectionType: sectionType, quarter: quarter, year: year, from: from, to: to }),
                    contentType: "application/json",
                    success: function (response, textStatus, jqXHR) {
                        const data = JSON.parse(response.value);

                        _self.oSectionWiseLiabiityModel.setData(data.sectionWiseLiabiity);
                        _self.oSectionWiseLiabiityFilterModel.setData(data.sectionWiseLiabiity);

                        _self.oTaxWiseLiabiityModel.setData(data.taxWiseLiabiity);
                        _self.oTaxWiseLiabiityFilterModel.setData(data.taxWiseLiabiity);

                        _self.oStateWiseLiabiityModel.setData(data.stateWiseLiabiity);
                        _self.oStateWiseLiabiityFilterModel.setData(data.stateWiseLiabiity);

                        _self.oSalesWiseBreakUpModel.setData(data.salesWiseBreakUp);
                        _self.oSalesWiseBreakUpFilterModel.setData(data.salesWiseBreakUp);

                        _self.oTaxRateWiseBreakUpModel.setData(data.taxRateWiseBreakUp);
                        _self.oTaxRateWiseBreakUpFilterModel.setData(data.taxRateWiseBreakUp);

                        _self.oTrendModel.setData(data.trendData);
                      
                        /**Tax Type Wise Liability - Properties */
                        sessionStorage.setItem("taxWiseLiabiity", JSON.stringify(data.taxWiseLiabiity));
                        var oVizFrame_taxWise = _self.oVizFrame_taxWise = _self.getView().byId("idVizFrame_taxWise");
                        var oPopOver_taxWise = _self.oPopOver_taxWise = _self.getView().byId("idPopOver_taxWise");
                        oPopOver_taxWise.connect(oVizFrame_taxWise.getVizUid());
                        /**Section Wise Liability - Properties */
                        sessionStorage.setItem("sectionWiseLiabiity", JSON.stringify(data.sectionWiseLiabiity));
                        var oVizFrame_sectionWise = _self.oVizFrame_sectionWise = _self.getView().byId("idVizFrame_sectionWise");
                        var oPopOver_sectionWise = _self.oPopOver_sectionWise = _self.getView().byId("idPopOver_sectionWise");
                        oPopOver_sectionWise.connect(oVizFrame_sectionWise.getVizUid());
                        /**State Wise Liability - Properties */
                        sessionStorage.setItem("stateWiseLiability", JSON.stringify(data.stateWiseLiabiity));
                        var oVizFrame_stateWise = _self.oVizFrame_stateWise = _self.getView().byId("idVizFrame_stateWise");
                        var oPopOver_stateWise = _self.oPopOver_stateWise = _self.getView().byId("idPopOver_stateWise");
                        oPopOver_stateWise.connect(oVizFrame_stateWise.getVizUid());
                        /**Sales Wise BreakUp - Properties */
                        sessionStorage.setItem("salesWiseLiability", JSON.stringify(data.salesWiseBreakUp));
                        var oVizFrame_salesWise = _self.oVizFrame_salesWise = _self.getView().byId("idVizFrame_SalesWiseBreakUp");
                        var oPopOver_salesWise = _self.oPopOver_salesWise = _self.getView().byId("idPopOver_SalesWiseBreakUp");
                        oPopOver_salesWise.connect(oVizFrame_salesWise.getVizUid());
                        /**Tax Rate Wise BreakUp - Properties */
                        sessionStorage.setItem("taxRateWiseLiability", JSON.stringify(data.taxRateWiseBreakUp));
                        var oVizFrame_TaxRateWiseBreakUp = _self.oVizFrame_TaxRateWiseBreakUp = _self.getView().byId("idVizFrame_TaxRateWiseBreakUp");
                        var oPopOver_TaxRateWiseBreakUp = _self.oPopOver_TaxRateWiseBreakUp = _self.getView().byId("idPopOver_TaxRateWiseBreakUp");
                        oPopOver_TaxRateWiseBreakUp.connect(oVizFrame_TaxRateWiseBreakUp.getVizUid());
                        /**Trend Data - Properties */
                        sessionStorage.setItem("trendData", JSON.stringify(data.trendData));
                        var oVizFrame_TrendChart = _self.oVizFrame_TrendChart = _self.getView().byId("idVizFrame_TrendChart");
                        var oPopOver_TrendChart = _self.oPopOver_TrendChart = _self.getView().byId("idPopOver_TrendChart");
                        oPopOver_TrendChart.connect(oVizFrame_TrendChart.getVizUid());

                        var oVizFrame_TrendChart1 = _self.oVizFrame_TrendChart1 = _self.getView().byId("idVizFrame_TrendChart1");
                        var oPopOver_TrendChart1 = _self.oPopOver_TrendChart1 = _self.getView().byId("idPopOver_TrendChart1");
                        oPopOver_TrendChart1.connect(oVizFrame_TrendChart1.getVizUid());
                        sap.ui.core.BusyIndicator.hide();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        const message = jqXHR.responseJSON?.error?.message;
                        if (message) {
                            MessageBox.error(message);
                        }
                        sap.ui.core.BusyIndicator.hide();
                    },
                });
            },
            _setCustomFormatter: function () {
                var chartFormatter = ChartFormatter.getInstance();
                Format.numericFormatter(chartFormatter);
                var UI5_FLOAT_FORMAT = "CustomFloatFormat_F2";
                chartFormatter.registerCustomFormatter(UI5_FLOAT_FORMAT, function (value) {
                    var ofloatInstance = sap.ui.core.format.NumberFormat.getFloatInstance({
                        style: 'short',
                        maxFractionDigits: 2
                    });
                    return ofloatInstance.format(value);
                });
            },
            /** PopOver - State Wise */
            onSelectDataStateWise: function (oEvent) {
                const oSelection = oEvent.getSource().vizSelection();
                var divStr = "";
                var totalAmount = 0;
                if (oSelection.length > 0) {
                    for (let i = 0; i < oSelection.length; i++) {
                        const element = oSelection[i].data;

                        const stateModel = JSON.parse(sessionStorage.getItem("stateWiseLiability"));

                        const state = stateModel.find((state) => state.region === element.State);

                        divStr = divStr + `<div style = 'margin: 10px 30px 2px 30px'>` + `<b><span style = 'float: center'>${element.State}</b></span></div>`;

                        state.state.forEach(element => {
                            divStr = divStr + `<div style = 'margin: 10px 30px 2px 30px'>` + element.state + "<span style = 'float: right'>" + formatNumberWithCommas(element.amount) + "</span></div>";
                        });
                        totalAmount = totalAmount + element.Amount;
                    }
                    divStr = divStr + `<div style = 'margin: 10px 30px 2px 30px'>` + "<b>Total :<span style = 'float: right'>" + formatNumberWithCommas(totalAmount) + "</b></span></div>";

                    var popoverProps = {
                        'customDataControl': function () {
                            return new HTMLControl({ content: divStr });
                        }
                    }
                }
                this.oPopOver_stateWise = new Popover(popoverProps);
                this.oPopOver_stateWise.connect(this.oVizFrame_stateWise.getVizUid());
            },
            /** PopOver - Section Wise */
            onSelectDataSectionWise: function (oEvent) {
                const oSelection = oEvent.getSource().vizSelection();
                var divStr = "";
                var totalAmount = 0;
                if (oSelection.length > 0) {
                    for (let i = 0; i < oSelection.length; i++) {
                        const element = oSelection[i].data;

                        const sectionModel = JSON.parse(sessionStorage.getItem("sectionWiseLiabiity"));

                        const section = sectionModel.find((section) => section.sectionType === element.Type);

                        // divStr = divStr + `<div style = 'margin: 10px 30px 2px 30px'>` + `<b><span style = 'float: center'>${element.Section}</b></span></div>`;

                        // state.state.forEach(element => {
                        divStr = divStr + `<div style = 'margin: 10px 30px 2px 30px'>` + section.sectionType + "<span style = 'float: right'>" + formatNumberWithCommas(section.totalInvoiceValue) + "</span></div>";
                        // });
                        totalAmount = totalAmount + element.Amount;
                    }
                    divStr = divStr + `<div style = 'margin: 10px 30px 2px 30px'>` + "<b>Total :<span style = 'float: right'>" + formatNumberWithCommas(totalAmount) + "</b></span></div>";

                    var popoverProps = {
                        'customDataControl': function () {
                            return new HTMLControl({ content: divStr });
                        }
                    }
                }
                this.oPopOver_sectionWise = new Popover(popoverProps);
                this.oPopOver_sectionWise.connect(this.oVizFrame_sectionWise.getVizUid());
            },
            /** PopOver - Tax type Wise */
            onSelectDataTaxTypeWise: function (oEvent) {
                const oSelection = oEvent.getSource().vizSelection();
                var divStr = "";
                var totalAmount = 0;
                if (oSelection.length > 0) {
                    for (let i = 0; i < oSelection.length; i++) {
                        const element = oSelection[i].data;

                        const taxTypeModel = JSON.parse(sessionStorage.getItem("taxWiseLiabiity"));

                        const taxType = taxTypeModel.find((taxType) => taxType.TaxType === element.Type);

                        divStr = divStr + `<div style = 'margin: 10px 30px 2px 30px'>` + taxType.TaxType + "<span style = 'float: right'>" + formatNumberWithCommas(taxType.totalInvoiceValue) + "</span></div>";

                        totalAmount = totalAmount + element.Amount;
                    }
                    divStr = divStr + `<div style = 'margin: 10px 30px 2px 30px'>` + "<b>Total :<span style = 'float: right'>" + formatNumberWithCommas(totalAmount) + "</b></span></div>";

                    var popoverProps = {
                        'customDataControl': function () {
                            return new HTMLControl({ content: divStr });
                        }
                    }
                }
                this.oPopOver_taxWise = new Popover(popoverProps);
                this.oPopOver_taxWise.connect(this.oVizFrame_taxWise.getVizUid());
            },
            /** PopOver - Sales wise break up */
            onSelectDataSalesWiseBreakUp: function (oEvent) {
                const oSelection = oEvent.getSource().vizSelection();
                var divStr = "";
                var totalAmount = 0;
                if (oSelection.length > 0) {
                    for (let i = 0; i < oSelection.length; i++) {
                        const element = oSelection[i].data;

                        const salesWiseTypeModel = JSON.parse(sessionStorage.getItem("salesWiseLiability"));

                        const salesWiseType = salesWiseTypeModel.find((x) => x.type === element.Type);

                        divStr = divStr + `<div style = 'margin: 10px 30px 2px 30px'>` + salesWiseType.type + "<span style = 'float: right'>" + formatNumberWithCommas(salesWiseType.totalInvoiceValue) + "</span></div>";
                        totalAmount = totalAmount + element.Amount;
                    }
                    divStr = divStr + `<div style = 'margin: 10px 30px 2px 30px'>` + "<b>Total :<span style = 'float: right'>" + formatNumberWithCommas(totalAmount) + "</b></span></div>";

                    var popoverProps = {
                        'customDataControl': function () {
                            return new HTMLControl({ content: divStr });
                        }
                    }
                }
                this.oPopOver_salesWise = new Popover(popoverProps);
                this.oPopOver_salesWise.connect(this.oVizFrame_salesWise.getVizUid());
            },
            /** PopOver - Sales wise break up */
            onSelectDataTaxRateWiseBreakUp: function (oEvent) {
                const oSelection = oEvent.getSource().vizSelection();
                var divStr = "";
                var totalAmount = 0;
                if (oSelection.length > 0) {
                    for (let i = 0; i < oSelection.length; i++) {
                        const element = oSelection[i].data;

                        const taxRateWiseModel = JSON.parse(sessionStorage.getItem("taxRateWiseLiability"));

                        const taxRateWise = taxRateWiseModel.find((x) => x.taxRate === element.TaxRate);

                        divStr = divStr + `<div style = 'margin: 10px 30px 2px 30px'>` + taxRateWise.taxRate + "<span style = 'float: right'>" + formatNumberWithCommas(taxRateWise.totalInvoiceValue) + "</span></div>";

                        totalAmount = totalAmount + element.Amount;
                    }
                    divStr = divStr + `<div style = 'margin: 10px 30px 2px 30px'>` + "<b>Total :<span style = 'float: right'>" + formatNumberWithCommas(totalAmount) + "</b></span></div>";

                    var popoverProps = {
                        'customDataControl': function () {
                            return new HTMLControl({ content: divStr });
                        }
                    }
                }
                this.oPopOver_TaxRateWiseBreakUp = new Popover(popoverProps);
                this.oPopOver_TaxRateWiseBreakUp.connect(this.oVizFrame_TaxRateWiseBreakUp.getVizUid());
            },

            /** Export - Export Table data */
            createColumnConfig: function (type) {
                var aCols = [];
                if (type == 'sectionWise') {
                    aCols.push({
                        label: 'Section Type',
                        property: 'sectionType',
                        type: 'String',
                    });

                    aCols.push({
                        label: 'Total',
                        type: 'Decimal',
                        property: 'totalInvoiceValue',
                        scale: 0,
                    });
                } else if (type == 'taxTypeWise') {
                    aCols.push({
                        label: 'Type',
                        property: 'TaxType',
                        type: 'String',
                    });

                    aCols.push({
                        label: 'Amount',
                        type: 'Decimal',
                        property: 'totalInvoiceValue',
                        scale: 0,
                    });
                } else if (type == 'regionWise') {
                    aCols.push({
                        label: 'State',
                        property: 'region',
                        type: 'String',
                    });

                    aCols.push({
                        label: 'Amount',
                        type: 'Decimal',
                        property: 'amount',
                        scale: 0,
                    });
                } else if (type == 'salesWise') {
                    aCols.push({
                        label: 'Type',
                        property: 'type',
                        type: 'String',
                    });

                    aCols.push({
                        label: 'Amount',
                        type: 'Decimal',
                        property: 'totalInvoiceValue',
                        scale: 0,
                    });
                } else if (type == 'taxRateWise') {
                    aCols.push({
                        label: 'TaxRate',
                        property: 'taxRate',
                        type: 'Decimal',
                    });

                    aCols.push({
                        label: 'Amount',
                        type: 'Decimal',
                        property: 'totalInvoiceValue',
                        scale: 0,
                    });
                }

                return aCols;
            },
            onExport: function (oEvent) {

                var aCols, oRowBinding, oSettings, oSheet, oTable;

                if (oEvent.getSource().getId() == "__button0") {

                    this._oTable = this.byId('idTbl_sectionWise');

                    oTable = this._oTable;

                    oRowBinding = oTable.getBinding('items');

                    aCols = this.createColumnConfig('sectionWise');

                    oSettings = {

                        workbook: {

                            columns: aCols,

                            hierarchyLevel: 'Level',

                        },
                        dataSource: oRowBinding,

                        fileName: 'Section wise breakup of tax liability',

                        worker: true, // We need to disable worker because we are using a MockServer as OData Service

                    };

                    oSheet = new Spreadsheet(oSettings);

                    oSheet.build().finally(function () {

                        oSheet.destroy();

                    });

                } else if (oEvent.getSource().getId() == "__button7") {

                    this._oTable = this.byId('idTbl__taxWise');
                    oTable = this._oTable;

                    oRowBinding = oTable.getBinding('items');

                    aCols = this.createColumnConfig('taxTypeWise');

                    oSettings = {

                        workbook: {

                            columns: aCols,

                            hierarchyLevel: 'Level',

                        },
                        dataSource: oRowBinding,

                        fileName: 'Tax type wise breakup of tax liability',

                        worker: true, // We need to disable worker because we are using a MockServer as OData Service

                    };

                    oSheet = new Spreadsheet(oSettings);

                    oSheet.build().finally(function () {

                        oSheet.destroy();

                    });

                } else if (oEvent.getSource().getId() == "__button14") {

                    this._oTable = this.byId('idTbl__regionWise');
                    oTable = this._oTable;

                    oRowBinding = oTable.getBinding('items');

                    aCols = this.createColumnConfig('regionWise');

                    oSettings = {

                        workbook: {

                            columns: aCols,

                            hierarchyLevel: 'Level',

                        },
                        dataSource: oRowBinding,

                        fileName: 'Region wise breakup of tax liability',

                        worker: true, // We need to disable worker because we are using a MockServer as OData Service

                    };

                    oSheet = new Spreadsheet(oSettings);

                    oSheet.build().finally(function () {

                        oSheet.destroy();

                    });

                } else if (oEvent.getSource().getId() == "__button21") {

                    this._oTable = this.byId('idTbl__salesWise');
                    oTable = this._oTable;

                    oRowBinding = oTable.getBinding('items');

                    aCols = this.createColumnConfig('salesWise');

                    oSettings = {

                        workbook: {

                            columns: aCols,

                            hierarchyLevel: 'Level',

                        },
                        dataSource: oRowBinding,

                        fileName: 'Sales wise breakup',

                        worker: true, // We need to disable worker because we are using a MockServer as OData Service

                    };

                    oSheet = new Spreadsheet(oSettings);

                    oSheet.build().finally(function () {

                        oSheet.destroy();

                    });

                } else if (oEvent.getSource().getId() == "__button28") {

                    this._oTable = this.byId('idTbl__taxrateWise');
                    oTable = this._oTable;

                    oRowBinding = oTable.getBinding('items');

                    aCols = this.createColumnConfig('taxRateWise');

                    oSettings = {

                        workbook: {

                            columns: aCols,

                            hierarchyLevel: 'Level',

                        },
                        dataSource: oRowBinding,

                        fileName: 'Tax rate wise sales breakup',

                        worker: true, // We need to disable worker because we are using a MockServer as OData Service

                    };

                    oSheet = new Spreadsheet(oSettings);

                    oSheet.build().finally(function () {

                        oSheet.destroy();

                    });

                }
            },
            /**Change Data based on Trend Type */
            handleChangeTrendType: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                const oSelTrend = oEvent.getSource().getSelectedKey();
                var properties = {
                    plotArea: {
                        drawingEffect: '',
                        dataLabel: {
                            visible: true,
                            type: 'value',
                            formatString: 'CustomFloatFormat_F2'
                        }
                    },
                    timeAxis: {
                        levels: ['day','year'],
                        title: {
                            visible: false
                        }
                    },
                    valueAxis: {
                        title: {
                            visible: false
                        }
                    },
                    title: {
                        visible: false
                    },
                    legend: {
                        visible: false
                    }
                };
                // if(properties.categoryAxis){
                // delete properties.categoryAxis;
                // }
                //   this.byId("trendlabel").setDataType('date');
                //  // this.byId("idVizFrame_TrendChart").setVizType('timeseries_line');
                //   this.byId("categoryAxisFeed").setUid('timeAxis');
                switch (oSelTrend) {
                    case '1D':
                        this.byId("BlockLayout3").setVisible(true);
                        this.byId("BlockLayout4").setVisible(false);
                        this.oTrendModel.setData(JSON.parse(sessionStorage.trendData));
                        properties.timeAxis.levels = ['day', 'month', 'year'];
                        sap.ui.core.BusyIndicator.hide();
                        // this.byId("chartContainerTrendChart").setVisible(true);
                        // this.byId("chartContainerTrendChart1").setVisible(false);
                        break;
                    case '1W':
                        this.byId("BlockLayout3").setVisible(true);
                        this.byId("BlockLayout4").setVisible(false);   
                         this.oTrendModel.setData(JSON.parse(sessionStorage.trendData));
                        properties.timeAxis.levels = ['week', 'month', 'year'];
                        sap.ui.core.BusyIndicator.hide();
                        // this.byId("chartContainerTrendChart").setVisible(true);
                        // this.byId("chartContainerTrendChart1").setVisible(false);
                        break;
                    case '1M':
                        this.byId("BlockLayout3").setVisible(true);
                        this.byId("BlockLayout4").setVisible(false);
                        this.oTrendModel.setData(JSON.parse(sessionStorage.trendData));
                        properties.timeAxis.levels = ['month', 'year'];
                        sap.ui.core.BusyIndicator.hide();
                        // this.byId("chartContainerTrendChart").setVisible(true);
                        // this.byId("chartContainerTrendChart1").setVisible(false);
                        break;
                    case '1Y':
                        this.byId("BlockLayout3").setVisible(true);
                        this.byId("BlockLayout4").setVisible(false);  
                        this.oTrendModel.setData(JSON.parse(sessionStorage.trendData)); 
                        properties.timeAxis.levels = ['year'];
                        this.oTrendModel.refresh();
                        this.byId("idVizFrame_TrendChart").setVizProperties(properties);
                        sap.ui.core.BusyIndicator.hide();
                        // this.byId("chartContainerTrendChart").setVisible(true);
                        // this.byId("chartContainerTrendChart1").setVisible(false);
                        break;
                    case '3Y':
                        this.byId("BlockLayout4").setVisible(true);
                        this.byId("BlockLayout3").setVisible(false);
                        this._getTrend3y5ydata("3Y");
                        //properties.timeAxis.levels = ['quarter', 'year'];
                        break;
                    case '5Y':
                        this.byId("BlockLayout4").setVisible(true);
                        this.byId("BlockLayout3").setVisible(false);
                        this._getTrend3y5ydata("5Y");
                        // Define properties for 5Y trend
                        break;
                    default:
                        properties.timeAxis.levels = ['day', 'year'];
                        break;
                }
                this.oTrendModel.refresh();
                this.byId("idVizFrame_TrendChart").setVizProperties(properties);
            },
            _getTrend3y5ydata:async function(year){
                var _self = this;
                jQuery.ajax({
                    url: _self.sURL + `dashboard/getTrendDetails(year='${year}')`,
                    type: "GET",
                    contentType: "application/json",
                    success: function (response, textStatus, jqXHR) {
                        const data = JSON.parse(response.value);
                        _self.oTrendModel.setData(data.trendData);
                        _self.byId("BlockLayout3").setVisible(false);
                        _self.byId("BlockLayout4").setVisible(true);
                       // _self.getView().byId("container")._oChartSegmentedButton.setSelectedButton("__button52");
                        _self.oTrendModel.refresh();
                        sap.ui.core.BusyIndicator.hide();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        const message = jqXHR.responseJSON?.error?.message;
                        if (message) {
                            MessageBox.error(message);
                        }
                        sap.ui.core.BusyIndicator.hide();
                    },
                });
            },

        });
    });
function formatNumberWithCommas(number) {
    number = parseFloat(number);
    return number.toLocaleString("en-US")
}