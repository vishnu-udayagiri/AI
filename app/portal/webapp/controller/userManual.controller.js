sap.ui.define(
    ["sap/ui/core/mvc/Controller",
        "sap/m/MessageBox",
        "sap/ui/Device",
        "sap/m/PDFViewer",
        "sap/ui/model/json/JSONModel"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,
        MessageBox,
        Device,
        PDFViewer,
        JSONModel) {
        "use strict";

        return Controller.extend("airindiagst.controller.userManual", {
            onAfterRendering: function () {


            },
            onInit: function () {
                /**Check for JWT token */
                

                const jwt = sessionStorage.getItem("jwt");

                if (!jwt) {
                    window.location.replace('/portal/index.html')
                }

                this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("userManual").attachPatternMatched(this._routeMatched, this);
                this.SendRequest = this.getOwnerComponent().SendRequest;
                this.getOwnerComponent().getModel("shellModel").setProperty("/hinticon", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "User Manual");
                this.defaultGSTN_num = "";
                this.defaultperiod = "";

            },
            _routeMatched: function () {
                sap.ui.core.BusyIndicator.show();

                this.dashboarddetails = "";
                const jwt = sessionStorage.getItem("jwt")
                var decodedData;
                
                if (!jwt) {

                    window.location.replace('/portal/index.html');

                }
                if (jwt) {
                    decodedData = JSON.parse(atob(jwt.split('.')[1]));
                    this.getOwnerComponent().getModel("shellModel").setProperty("/welcomeMessage", " " + decodedData.FirstName + ' ' + decodedData.LastName);
                }
                // if(decodedData.CanAmendmentRequest){
                //     this.canAmmnedRequestFlag = true;
                // }else{
                //     this.canAmmnedRequestFlag = false;
                // }
                this.category = decodedData.category;
                if (decodedData.ISB2A == true) {
                    sap.ui.core.BusyIndicator.hide();
                    var pdfViewer = this.getView().byId("pdfViewer");

                    // Set the source property of the PDF viewer control
                    pdfViewer.setSource("css/images/Travel_Partners_B2A_User_Manual.pdf"); 
                    this.ISB2A_flag = true;
                } else {
                    sap.ui.core.BusyIndicator.hide();
                    var pdfViewer = this.getView().byId("pdfViewer");

                    // Set the source property of the PDF viewer control
                    pdfViewer.setSource("css/images/Partners_B2B_User_Manual.pdf");
                    this.ISB2A_flag = false;
                }
                this._oModel = new JSONModel({
                    Source: this._sValidPath,
                    Title: "GST.AI User Manual",
                    Height: "600px"
                });
                this.getView().setModel(this._oModel);
                sap.ui.core.BusyIndicator.hide();
                this.getOwnerComponent().getModel("shellModel").setProperty("/showAvatar", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/show", true);
                this.getOwnerComponent().getModel("shellModel").setProperty("/title", "GST.AI User Manual");
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_user", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/pending_amend", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/hinticon", false);
                this.getOwnerComponent().getModel("shellModel").setProperty("/userInfo", + decodedData.FIRSTNAME + ' ' + decodedData.LASTNAME);
            },
           
          
        });
    }
);