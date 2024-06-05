sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/Popover",
    "sap/m/Button",
    "sap/m/library", "airindiagst/model/validations",
    "sap/ui/core/Fragment"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, Popover, Button, library, validations, Fragment) {
        "use strict";
        var ButtonType = library.ButtonType,
            PlacementType = library.PlacementType;

        return Controller.extend("airindiagst.controller.App", {
            validations: validations,
            onInit: function () {
                /** Get i18n Resource Bundle */
                this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                sap.ui.getCore().setModel(this.oResourceBundle, "i18n");
                this.oRouter = this.getOwnerComponent().getRouter();
                //  this.oRouter.getRoute("LandingPage").attachPatternMatched(this._routeMatched, this);
                this.SendRequest = this.getOwnerComponent().SendRequest;
            },
            onPressAvatar: function (event) {
                var _self = this;
                var oPopover = new Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new Button({
                            text: _self.oResourceBundle.getText('btnSignout'),
                            type: ButtonType.Transparent,
                            icon: "sap-icon://log",
                            press: function (oEvent) {
                                MessageBox.confirm(_self.oResourceBundle.getText('msgConfirmLogout'), {
                                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                                    emphasizedAction: MessageBox.Action.OK,
                                    onClose: function (sAction) {
                                        if (sAction == "OK") {
                                            _self.SendRequest(_self, "/portal-api/portal/v1/logout", "GET", { Authorization: "Bearer " + sessionStorage.getItem("jwt") }, null, (_self, data, message) => {
                                                sessionStorage.clear();
                                                window.location.replace("/portal/index.html");   
                                            });
                                        }
                                    },
                                });
                            }
                        }),
                        new sap.m.Button({
                            text: _self.oResourceBundle.getText('resetPassword'),
                            type: ButtonType.Transparent,
                            icon: "sap-icon://private",
                            press: function (oEvent) {
                                if (!_self.oResponsivePaddingDialog) {
                                    _self.oResponsivePaddingDialog = new sap.m.Dialog({
                                        title: "Reset Password",
                                        contentWidth: "350px",
                                        contentHeight: "230px",
                                        resizable: true,
                                        draggable: true,
                                        content: new sap.ui.layout.form.SimpleForm({
                                            layout: sap.ui.layout.form.SimpleFormLayout.ColumnLayout,
                                            content: [
                                                new sap.m.Label({ text: "Old Password" }),
                                                new sap.m.Input("oldPassword", {
                                                    type: sap.m.InputType.Password,
                                                    valueHelpIconSrc: "sap-icon://show",
                                                    maxLength: 16,
                                                    showValueHelp: true,
                                                    valueHelpRequest: function (oEvent) {
                                                        const id = oEvent.getSource(),
                                                            type = id.getType();
                                                        if (type == "Text") {
                                                            id.setType("Password");
                                                            id.setValueHelpIconSrc("sap-icon://show");
                                                        } else {
                                                            id.setType("Text");
                                                            id.setValueHelpIconSrc("sap-icon://hide");
                                                        }
                                                    },
                                                    liveChange: function (oEvent) {
                                                        const sValue = oEvent.getParameter("value"),
                                                            sNewPass = sap.ui.getCore().byId("oldPassword");
                                                        if (sValue) {
                                                            sap.ui.getCore().byId("oldPassword").setValueState("None");
                                                            _self.validate = true;
                                                        }
                                                    }
                                                }),

                                                new sap.m.Label({ text: "New Password" }),
                                                new sap.m.Input("newPassword", {
                                                    type: sap.m.InputType.Password,
                                                    valueHelpIconSrc: "sap-icon://show",
                                                    maxLength: 16,
                                                    showValueHelp: true,
                                                    valueHelpRequest: function (oEvent) {
                                                        const id = oEvent.getSource(),
                                                            type = id.getType();
                                                        if (type == "Text") {
                                                            id.setType("Password");
                                                            id.setValueHelpIconSrc("sap-icon://show");
                                                        } else {
                                                            id.setType("Text");
                                                            id.setValueHelpIconSrc("sap-icon://hide");
                                                        }
                                                    },
                                                    liveChange: function (oEvent) {
                                                        const sValue = oEvent.getParameter("value");
                                                        const selOldPass = sap.ui.getCore().byId("oldPassword");
                                                        if (!validations.validatePassword(sValue)) {
                                                            sap.ui.getCore().byId("newPassword").setValueState("Information").setValueStateText(
                                                                `Password must contain 1 number (0-9), 1 uppercase letter, 1 lowercase letter, 1 non-alpha numeric number, 8-16 characters with no space.`);
                                                            _self.validate = false;
                                                        } else {
                                                            // Check if the Old Password and New Password are the same
                                                            if (selOldPass.getValue() === sValue) {
                                                                // Show a message indicating that the old and new passwords are the same
                                                                sap.ui.getCore().byId("newPassword").setValueState("Warning").setValueStateText("Old and new passwords cannot be the same..");
                                                                _self.validate = false;
                                                            } else {
                                                                sap.ui.getCore().byId("newPassword").setValueState("None");
                                                                _self.validate = true;
                                                            }
                                                        }
                                                    }
                                                }),

                                                new sap.m.Label({ text: "Confirm New Password" }),
                                                new sap.m.Input("reEnterPassword", {
                                                    type: sap.m.InputType.Password,
                                                    valueHelpIconSrc: "sap-icon://show",
                                                    maxLength: 16,
                                                    showValueHelp: true,
                                                    valueHelpRequest: function (oEvent) {
                                                        const id = oEvent.getSource(),
                                                            type = id.getType();
                                                        if (type == "Text") {
                                                            id.setType("Password");
                                                            id.setValueHelpIconSrc("sap-icon://show");
                                                        } else {
                                                            id.setType("Text");
                                                            id.setValueHelpIconSrc("sap-icon://hide");
                                                        }
                                                    },
                                                    liveChange: function (oEvent) {
                                                        const sValue = oEvent.getParameter("value"),
                                                            sNewPass = sap.ui.getCore().byId("newPassword").getValue();
                                                        if (sValue === sNewPass) {
                                                            sap.ui.getCore().byId("reEnterPassword").setValueState("Success");
                                                            _self.validate = true;
                                                        } else {
                                                            sap.ui.getCore().byId("reEnterPassword").setValueState("Information").setValueStateText("Re-enter your password to verify it matches");
                                                            _self.validate = false;
                                                        }
                                                    }
                                                })
                                            ]
                                        }),
                                        beginButton: new Button({
                                            type: ButtonType.Emphasized,
                                            text: "Reset Password",
                                            press: function () {
                                                // Get references to UI elements by their IDs
                                                const selOldPass = sap.ui.getCore().byId("oldPassword"),
                                                    selNewPass = sap.ui.getCore().byId("newPassword"),
                                                    selReEnterPass = sap.ui.getCore().byId("reEnterPassword");
                                                var validated = true;

                                                // Reset the value states of the password fields
                                                sap.ui.getCore().byId("oldPassword").setValueState("None");
                                                sap.ui.getCore().byId("newPassword").setValueState("None");
                                                sap.ui.getCore().byId("reEnterPassword").setValueState("None");

                                                // Check if the Old Password field is empty
                                                if (!selOldPass.getValue()) {
                                                    sap.ui.getCore().byId("oldPassword").setValueState("Error").setValueStateText("Old Password is required");
                                                    validated = false;
                                                }

                                                // Check if the New Password field is empty
                                                if (!selNewPass.getValue()) {
                                                    sap.ui.getCore().byId("newPassword").setValueState("Error").setValueStateText("New password is required");
                                                    validated = false;
                                                } else {
                                                    if (!validations.validatePassword(selNewPass.getValue())) {
                                                        sap.ui.getCore().byId("newPassword").setValueState("Information").setValueStateText(
                                                            `Password must contain 1 number (0-9), 1 uppercase letter, 1 lowercase letter, 1 non-alpha numeric number, 8-16 characters with no space.`);
                                                        validated = false;
                                                    }
                                                    // Check if the Old Password and New Password are the same
                                                    if (selOldPass.getValue() === selNewPass.getValue()) {
                                                        // Show a message indicating that the old and new passwords are the same
                                                        sap.ui.getCore().byId("newPassword").setValueState("Error").setValueStateText("Old and new passwords cannot be the same.");
                                                        validated = false;
                                                    }
                                                }

                                                // Check if the Re-Enter Password field is empty
                                                if (!selReEnterPass.getValue()) {
                                                    sap.ui.getCore().byId("reEnterPassword").setValueState("Error").setValueStateText("Re-Enter password is required");
                                                    validated = false;
                                                } else {
                                                    // Check if the Re-Enter Password and New Password match
                                                    if (selReEnterPass.getValue() !== selNewPass.getValue()) {
                                                        sap.ui.getCore().byId("reEnterPassword").setValueState("Error").setValueStateText("Passwords do not match.");
                                                        validated = false;
                                                    }
                                                }

                                                if (_self.validate && validated) {
                                                    sap.ui.core.BusyIndicator.show();
                                                    // If validation is successful, make an API call to reset the password
                                                    const reqData = {
                                                        oldPassword: selOldPass.getValue(),
                                                        newPassword: selNewPass.getValue()
                                                    };

                                                    _self.SendRequest(_self, "/portal-api/portal/v1/reset-password", "POST", {}, JSON.stringify(reqData), (_self1, data, message) => {
                                                        // Show a success message when the password is changed
                                                        sap.m.MessageBox.success("Password changed successfully!", {
                                                            title: "Success",
                                                            actions: [sap.m.MessageBox.Action.OK],
                                                            onClose: function () {
                                                                _self.oResponsivePaddingDialog.close();
                                                            }
                                                        });
                                                        sap.ui.core.BusyIndicator.hide();
                                                    });
                                                }
                                            }.bind(_self)
                                        }),
                                        endButton: new Button({
                                            text: "Close",
                                            press: function () {
                                                _self.oResponsivePaddingDialog.close();
                                            }.bind(_self)
                                        })
                                    });

                                    // Enable responsive padding by adding the appropriate classes to the control
                                    _self.oResponsivePaddingDialog.addStyleClass("sapUiResponsivePadding--content sapUiResponsivePadding--header sapUiResponsivePadding--footer sapUiResponsivePadding--subHeader");

                                    //to get access to the controller's model
                                    _self.getView().addDependent(_self.oResponsivePaddingDialog);
                                }
                                sap.ui.getCore().byId("oldPassword").setValue("");
                                sap.ui.getCore().byId("oldPassword").setValueState("None");
                                sap.ui.getCore().byId("newPassword").setValue("");
                                sap.ui.getCore().byId("newPassword").setValueState("None");
                                sap.ui.getCore().byId("reEnterPassword").setValue("");
                                sap.ui.getCore().byId("reEnterPassword").setValueState("None");

                                _self.oResponsivePaddingDialog.open();
                            }
                        })
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(event.getSource());
            },
            onclickLogo: function (oEvent){
                this.oRouter.navTo("LandingPage", {}, true);
            },
            onPendingAmendNotif: function (oEvent) {
                this.oRouter.navTo("amendment");

            },
            onUserApprovalNotif: function (oEvent) {
                this.oRouter.navTo("userProfile", {
                    eventfiredfrom: "UserApprove"
                });

            },
            handlePopoverPress: function (oEvent) {
                var _self = this;
                if(this.oRouter.oHashChanger.hash == "LandingPage"){
                var oPopover = new Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        // new sap.m.Text({
                        //     text: "Profile\n You can view and edit your company details, Personal Details and preferences.\n \nDocuments \n you can view and download your GST invoices for the current financial year.\n \nDocument History \n you can view and download your GST invoices for the Previous financial years.\n \nRequest For Amendment \n You can request for amendment to your invoice.The rights for requesting amendment is controlled by your company Admin.\n \nApprove Amendments \n You can approve the requested amendments for invoice.The rights for approving amendments is controlled by your company Admin.\n \nAudit Trail \n You can view all the changes been done.\n \nReports \n Under the reports section you have different reports like Ticket status report, Invoice report, GSTIN master report, TCS summary, Area summary and GST report.\n \nGraph Card \n This shows the consolidated information of total IGST, SGST/UGST and CGST amount for the selected GSTIN and period.\n\nResults are fetched based on the default GSTIN and default period you have choosen under profile section.\nYou can change and search accordingly.\nOnce you select previous financial year option for period you will get additional filters of year and date range from which you want to fetch consolidated data.\n All counts on the tiles are based on this search criterias.",
                        // }),  
                        new sap.m.Text({
                            text: "Results are fetched based on the default values of GSTIN and period you have chosen under the profile section. You can change and search accordingly.\n\n You can modify the period based on your requirements under the Profile card.",
                        }),   
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            } else if(this.oRouter.oHashChanger.hash == "GSTInvoices"){
                var oPopover = new Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "GST Invoices, Tax invoices, Debit Notes, Credit Notes, Bill of Supply, Bill of Supply Debit Note, and Bill of Supply Credit Note are presented in a tabular format.\n\n Search Functionality \n Utilize the search options to easily find specific documents.\n\n My Bookings - Tickets are booked under the company passenger GSTIN.\n\n Booked For - Tickets are specifically booked for external customers. \n\n Document Handling \n View and Download - Users can view and download documents in PDF format.\n Export Table - Export document details in Excel format for efficient record-keeping.\n Bulk Download - Convenient option for bulk downloading multiple documents simultaneously.",
                        }),    
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            } else if(this.oRouter.oHashChanger.hash == "GSTInvoicesHistory"){
                var oPopover = new Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "GST Invoices, Debit Notes, Credit Notes, Bill of Supply, Bill of Supply Debit Note, and Bill of Supply Credit Note are presented in a tabular format.\n\n Document Viewing \n Current and Previous Period - Easily access both current and previous period documents within the tab.\n\n Search Functionality \n Utilize the search options to easily find specific documents.\n\n My Bookings - Tickets are booked under the company passenger GSTIN.\n\n Booked For - Tickets are specifically booked for external customers. \n\n Document Handling \n View and Download - Users can view and download documents in PDF format.\n Export Table - Export document details in Excel format for efficient record-keeping.\n Bulk Download - Convenient option for bulk downloading multiple documents simultaneously.",
                        }),    
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            }else if(this.oRouter.oHashChanger.hash == "DocumentHistoryPriorTo"){
                var oPopover = new Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "Here, the user can access the documents before April 1, 2024, which were available in the old portal.\n\n Search Functionality \n Utilize the search options to easily find specific documents. The search functionality enables users to filter and find relevant information quickly.",
                        }),    
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            }  else if(this.oRouter.oHashChanger.hash == "amendmentRequest"){
                var oPopover = new Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "User Authorization - Both main user and sub-user can initiate requests for amendments.\n\n Approval Authority - Main user holds exclusive approval authority, with the option to delegate amendment approval to sub-users if desired.\n\n Search Functionality \n Utilize the search options to easily find specific documents.\n\n My Bookings - Tickets are booked under the company passenger GSTIN.\n\n Booked For - Tickets are specifically booked for external customers. \n\n Types of Amendments \n Address Amendment - Applicable to all active documents, allowing users to change or amend the address in the invoice.\n GSTIN Amendment \n Involves three types \n Change GSTIN - Alter the GSTIN associated with a transaction.\n Remove GSTIN: Eliminate a GSTIN and replace it with an address.\n Add GSTIN: Include a GSTIN in a B2C invoice, associating it with a specific B2C sales transaction.\n\n GSTIN amendments cover various changes, serving different purposes in Goods and Services Tax compliance.\n\n Download Options- Users can download documents in PDF format, export tables in Excel format, and perform bulk downloads for convenience.",
                        }),    
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            } else if(this.oRouter.oHashChanger.hash == "amendment"){
                var oPopover = new Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "Administrators can review and authorize user-submitted amendment requests, with the option to reject proposed changes directly from this page.\n\n My Bookings - Tickets are booked under the company passenger GSTIN.\n\n Booked For - Tickets are specifically booked for external customers.\n\n Pending -\n Users can view, approve, or reject pending amendments.\n Download the Excel attachment and document PDF.\n\n Rejected - \n  Users can view the list of rejected amendments.\n\n Search Functionality \n Utilize the search options to easily find specific documents.\n Download amended invoices, original invoices.\n Export the table in Excel format.\n Bulk download option available.",
                        }),    
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            } else if(this.oRouter.oHashChanger.hash == "auditLog"){
                var oPopover = new Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "The Audit Trail feature provides a detailed record of all changes made within the system.\n\n Captured details include - \n Affected module \n Type of event \n Old and new values \n User responsible \n Timestamp \n Status information \n This information is available at both the system and invoice levels, ensuring a comprehensive overview of activities.\n\n Search Functionality \n Utilize the search options to easily find specific documents.\n The search functionality enables users to filter and find relevant information quickly.",
                        }),    
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            } else if(this.oRouter.oHashChanger.hash == "TicketStatus"){
                var oPopover = new Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: " The Ticket Status Report provides a real-time display of the current status of tickets within ticketing systems or customer support processes.\n This feature offers a quick overview, aiding in the efficient monitoring and management of tasks or issues.\n\n Search Functionality \n Utilize the search options to easily find specific documents.\n The search functionality enables users to filter and find relevant information quickly.\n Users can view and download document PDFs for detailed analysis.\n Excel reports are available for a comprehensive overview of ticket data.\n Take advantage of the bulk download option for streamlined access to multiple documents.",
                        }),    
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            } else if(this.oRouter.oHashChanger.hash == "InvoiceReport"){
                var oPopover = new Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "Facilitating the viewing of invoices. Users can apply various filters to refine the report and download PDF prints directly.\n\n Search Functionality \n Utilize the search options to easily find specific documents.\n The search functionality enables users to filter and find relevant information quickly.\n Users can view and download document PDFs for detailed analysis.\n Excel reports are available for a comprehensive overview of ticket data.\n Take advantage of the bulk download option for streamlined access to multiple documents.",
                        }),    
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            } else if(this.oRouter.oHashChanger.hash == "GSTReports"){
                var oPopover = new Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "Used to review the revenue generated for different GSTN.\n\n Search Functionality \n Utilize the search options to easily find specific documents.\n The search functionality enables users to filter and find relevant information quickly.\n Users can view and download document PDFs for detailed analysis.\n Excel reports are available for a comprehensive overview of ticket data.\n Take advantage of the bulk download option for streamlined access to multiple documents.",
                        }),    
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            } else if(this.oRouter.oHashChanger.hash == "tcsSummary"){
                var oPopover = new Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "Exclusive to E-Commerce operators, providing information on Tax Collected at Source (TCS) with details on the 1% TCS tax rate and corresponding amounts.\n\n TCS Summary Overview \n Allows users to access documents containing comprehensive tax and total invoice amount details.\n\n TCS Summary Details \n Presents a breakdown of tax and invoice amounts for thorough analysis.\n\n Comparison Provision \n Users can review documents with less information in comparison to the TCS Summary.\n Facilitates quick identification of variations in document details.\n\n Search Functionality \n Utilize the search options to swiftly locate specific documents related to invoice  or support processes.\n Excel reports are available.\n Excel reports are available for a comprehensive overview of ticket data.\n Take advantage of the bulk download option for streamlined access to multiple documents.",
                        }),    
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            } else if(this.oRouter.oHashChanger.hash == "Areasummary"){
                var oPopover = new Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "Segments information by geographical areas for a detailed analysis based on distinct regions.\n\n Area Summary Features \n Allows users to view and download documents within specific geographical areas.\n\n Area Summary Details \n Users can access documents with less information compared to the comprehensive Area Summary.\n\n Search Functionality \n Utilize the search options to swiftly locate specific documents.\n Users can view and download document PDFs for detailed analysis.\n Excel reports are available.\n Excel reports are available.\n Take advantage of the bulk download option for streamlined access to multiple documents.",
                        }),    
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            }  else if(this.oRouter.oHashChanger.hash == "gstinMasterReport"){
                var oPopover = new Popover({
                    showHeader: false,
                    placement: PlacementType.Bottom,
                    content: [
                        new sap.m.Text({
                            text: "Provides access to details of all GSTINs associated with a PAN for the logged-in user's company.\n\n Search Functionality \n Utilize the search functionality to quickly locate specific documents or GSTIN details.\n\n Usage.\n Accessing GSTIN Master Report.\n Navigate to the GSTIN Master Report section to view details associated with GSTINs.\n\n Excel Report Download \n Download an Excel report containing detailed information on the selected invoices.\n\n Advantages \n Comprehensive GSTIN Details \n Access details of all GSTINs associated with the PAN for enhanced insights.\n Efficient Search \n Swiftly locate specific documents using the search options. \n Excel Report Download \n Users can download selected invoices in an Excel format for further analysis.",
                        }),    
                    ]
                }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
                oPopover.openBy(oEvent.getSource());
            }

            }  
        });
    }
);