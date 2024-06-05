sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
],
function (Controller, MessageBox) {
    "use strict";

    return Controller.extend("ns.dainvoicereport.controller.DaInvoiceReport", {
        onInit: function (Controller) {
            this.SendRequest = this.getOwnerComponent().SendRequest;
            //Get i18n Resource Bundle
            this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            //JSON Models
            

            sap.ui.core.BusyIndicator.hide();

            this.SendRequest = this.getOwnerComponent().SendRequest;

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.getRoute("RouteDaInvoiceReport").attachPatternMatched(this._routeMatched, this);

        },
        _routeMatched: function () {
          
            /** get Service URL */
            const mObj = this.getOwnerComponent().getManifestObject();
            // if (mObj._oBaseUri._string.includes("port") || mObj._oBaseUri._string.includes("localhost")) {
            //     this.sURL = mObj._oBaseUri._string.split('/DaInvoiceReport')[0] + '/';
            //     this.baseUrl = this.sURL.substring(0, this.sURL.indexOf(".sap") + 4);
            //     this.baseUrl = this.baseUrl + '/';
            // } else {
                this.baseUrl = mObj._oBaseUri._parts.path;
           // }


        },
        /** Filter Data */
        onSearch: function (oEvent) {
            sap.ui.core.BusyIndicator.show();
            var _self = this;
            if (this.getView().byId("dp-financialYear").getValue()) {
                var financialYear = this.getView().byId("dp-financialYear").getValue();
                var formattedYear = financialYear.replace('/', '');
            
            jQuery.ajax({
                url: _self.baseUrl + "dainvoiceservice/DAinvoicereportmain(GSTR1PERIOD='"+formattedYear+"')/Set" ,
                type: "GET",
                contentType: "application/json",
                success: function (response, textStatus, jqXHR) {
                   // MessageBox.success("Data Fetched");
                   var data = response.value;
                   _self.oModel = new sap.ui.model.json.JSONModel([]);
                   _self.oModel.setData(data);
                   _self.getView().setModel(_self.oModel, "DataModel");
                    sap.ui.core.BusyIndicator.hide();
                    _self.byId("tbl_dainvoice").setVisible(true);
                    
                },
                error: function (jqXHR, textStatus, errorThrown) {
                  //  MessageBox.error("Something went wrong. Please try again");
                    sap.ui.core.BusyIndicator.hide();
                },
            });
        }else{
            sap.ui.core.BusyIndicator.hide();
            MessageBox.show("Please choose GSTR1 Period");
        }
        },
        onPressExportExcel: function (oEvent) {
            sap.ui.core.BusyIndicator.show();
            var _self = this;
            if (this.getView().byId("dp-financialYear").getValue()) {
                var financialYear = this.getView().byId("dp-financialYear").getValue();
                var formattedYear = financialYear.replace('/', '');
                var serviceUrl = _self.baseUrl+ "dainvoiceservice/";
                jQuery.ajax({
                    url: serviceUrl + 'getCSRFToken()',
                    type: "GET",
                    headers: {
                        "X-CSRF-Token": "fetch"
                    },
                    success: function (data, status, xhr) {
                        jQuery.ajax({
                            url: serviceUrl + "exportAll",
                            type: "POST",
                            data: JSON.stringify({ fields: JSON.stringify(formattedYear) }),
                            contentType: "application/json",
                            headers: {
                                "X-CSRF-Token": xhr.getResponseHeader("X-CSRF-Token")
                            },
                            success: function (response, textStatus, jqXHR) {
                                
                                sap.ui.core.BusyIndicator.hide();
                                if(response.value == 'GST period closure Master Data is not maintained for Current month.'){
                                    MessageBox.error(response.value);
                                }else{
                                    MessageBox.success(response.value);
                                }
                               
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
                    error: function (jqXHR, textStatus, errorThrown) {
                        const message = jqXHR.responseJSON?.error?.message;
                        if (message) {
                            MessageBox.error(message);
                        }
                        sap.ui.core.BusyIndicator.hide();
                    },
                });
        }else{
            sap.ui.core.BusyIndicator.hide();
            MessageBox.show("Please choose GSTR1 Period");
        }

        }
    });
});
