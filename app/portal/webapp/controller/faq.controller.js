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
        return Controller.extend("airindiagst.controller.faq", {
            onAfterRendering: function () {
            },
            onInit: async function () {
                sap.ui.core.BusyIndicator.show();
                this.jwt = sessionStorage.getItem("jwt")
                // if (!this.jwt) {
                //     window.location.replace('/portal/index.html');
                // }
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("faq").attachPatternMatched(this._routeMatched, this);
                this.SendRequest = this.getOwnerComponent().SendRequest;
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                this.IATA = {
                };
                // var oData = {
                //     tableData:[
                //         {
                //           method: "Air India Website",
                //           where_to_provide: "Booking confirmation page after payment by clicking on “Add GST Details”"
                //         },
                //         {
                //           method: "Call Centre/ Airport Ticketing office",
                //           where_to_provide: "Ask our executive to record your GST details against your Booking Reference Number"
                //         },
                //         {
                //           method: "Agents",
                //           where_to_provide: "Ask agents to record your GST details against your Booking Reference Number"
                //         }
                //       ]
                //   };
            
                //   // Create a JSON model
                //   var oModel = new JSONModel(oData);
         
                //   // Set the model to the view
                //   this.getView().setModel(oModel, "tableModelnew");
                //   var oDatanew = {
                //     tableDatanew:[
                //         {
                //             timeperiod: "Within 48 hours of booking",
                //             stepstofollow: "Please update or add GSTIN details on the website."
                //         },
                //         {
                //             timeperiod: "After 48 hours",
                //             stepstofollow: "To update GST details: \n\n Please login with your credentials on GST.AI portal and amend the GSTIN details on invoice.\n Refer detailed manual under ‘the help’ section for the detailed process to amend the GSTIN Invoice in your account.\n\nTo add your GST details:\n\n In case the booking is made by an agent, please connect with the agent, else email to: gstsupport@airindia.com. "
                //         }
                //       ]
                //   };
            
                //   // Create a JSON model
                //   var oModel = new JSONModel(oDatanew);
         
                //   // Set the model to the view
                //   this.getView().setModel(oModel, "tableModelnew");            


            },
            _routeMatched: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "GST.AI General Queries");
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/hinticon", false);
                var oData = {
                    tableData:[
                        {
                          method: "Air India Website",
                          where_to_provide: "Booking confirmation page after payment by clicking on “Add GST Details”"
                        },
                        {
                          method: "Call Centre/ Airport Ticketing office",
                          where_to_provide: "Ask our executive to record your GST details against your Booking Reference Number"
                        },
                        {
                          method: "Agents",
                          where_to_provide: "Ask agents to record your GST details against your Booking Reference Number"
                        }
                      ]
                  };
            
                  // Create a JSON model
                  var oModel = new JSONModel(oData);
         
                  // Set the model to the view
                  this.getView().setModel(oModel, "tableModel");
                  var oDatanew = {
                    tableDatanew:[
                        {
                            timeperiod: "Within 48 hours of booking",
                            stepstofollow: "Please update or add GSTIN details on the website."
                        },
                        {
                            timeperiod: "After 48 hours",
                            stepstofollow: "To update GST details: \n\n Please login with your credentials on GST.AI portal and amend the GSTIN details on invoice.\n Refer detailed manual under ‘the help’ section for the detailed process to amend the GSTIN Invoice in your account.\n\nTo add your GST details:\n\n In case the booking is made by an agent, please connect with the agent, else email to: gstsupport@airindia.com."
                        }
                      ]
                  };
            
                  // Create a JSON model
                  var oModelnew = new JSONModel(oDatanew);
         
                  // Set the model to the view
                  this.getView().setModel(oModelnew, "tableModelnew");
                  
                sap.ui.core.BusyIndicator.hide();
            },
            // formatMailTo: function(email) {
            //     return '<Link href="mailto:' + email + '">' + email + '</Link>';
            // },
           
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