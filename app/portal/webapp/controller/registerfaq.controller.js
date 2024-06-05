sap.ui.define(
    ["sap/ui/core/mvc/Controller",
        "sap/m/MessageBox",
        "sap/ui/Device",
        "sap/m/PDFViewer",
        "sap/ui/model/json/JSONModel",
        'sap/ui/export/library',
        'sap/ui/export/Spreadsheet',
        "airindiagst/model/formatter",
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
        MessageBox,
        Device,
        PDFViewer,
        JSONModel, exportLibrary, Spreadsheet,formatter, Engine, SelectionController, SortController, GroupController, MetadataHelper, Sorter) {
        "use strict";
        var EdmType = exportLibrary.EdmType;
        return Controller.extend("airindiagst.controller.registerfaq", {
            onAfterRendering: function () {
            },
            onInit: async function () {
                sap.ui.core.BusyIndicator.show();
                this.jwt = sessionStorage.getItem("jwt")
                // if (!this.jwt) {
                //     window.location.replace('/portal/index.html');
                // }
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("registerfaq").attachPatternMatched(this._routeMatched, this);
                this.SendRequest = this.getOwnerComponent().SendRequest;
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                this.IATA = {
                };
                var oData = {
                    tableData: [{
                        Category: "Taxpayer in India",
                        Prerequisite: "PAN \n If SEZ recipient, then undertaking to be furnished."
                      },
                      {
                        Category: "Overseas Agent",
                        Prerequisite: "1) Country of Agent  as per IATA records.\n 2) Head entity IATA code as per IATA records."
                      },
                      {
                        Category: "Consulate/Embassy",
                        Prerequisite: "Country of Embassy along with unique Identity number as per GST laws, if any"
                      },
                      {
                        Category: "UN Bodies",
                        Prerequisite: "Record certifying an UN Body along with Unique Identity Number as per GST laws, if any."
                      }
                    ]
                  };
            
                  // Create a JSON model
                  var oModel = new JSONModel(oData);
         
                  // Set the model to the view
                  this.getView().setModel(oModel, "tableModel");            


            },
            _routeMatched: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "GST.AI Registration Process FAQ's");
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/hinticon", false);
                sap.ui.core.BusyIndicator.hide();
            },
           
            onButtonDownloadPresssingle: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                //  const oTable = this.byId("tbl_amendment");
                var row = oEvent.getParameter("row").getIndex()

                // const oTableData = this.getView().getModel("GSTDetailsModel").getData().invoices;
                const aInvoices = [];
                aInvoices.push({ ID: oEvent.getParameter("row").getBindingContext("GSTDetailsModel").getProperty("ID") });
                //  aInvoices.push({ID:oTableData[row].ID});
                // if (oTableData.length) {
                //     oTableData.forEach(index => {
                //         const ID = index.ID
                //         aInvoices.push({ ID })
                //     });
                this.SendRequest(this, "/portal-api/portal/v1/download-invoice-pdf", "POST", {}, JSON.stringify({ invoices: aInvoices }), (_self, data, message) => {
                    const invoices = data.invoice;
                    if (invoices.length > 0) {

                        const base64Data = "data:application/pdf;base64," + data.invoice;
                        const link = document.createElement('a');
                        link.href = base64Data;
                        link.download = `Invoice - ${data.invoiceNumber}`;
                        link.click();

                    }
                    sap.ui.core.BusyIndicator.hide();
                });
                // }
            },
           

        });
    }
);