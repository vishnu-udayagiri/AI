sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat"
], function (
    Controller, JSONModel, DateFormat
) {
    "use strict";

    return Controller.extend("admindashboard.controller.Dashboard", {
        onInit: async function () {
            this.cardManifests = new JSONModel();
            this.getView().setModel(this.cardManifests, "manifests");
            this._getCardData();
            this.oRouter = this.getOwnerComponent().getRouter();
        },
        _getCardData: function () {

            const taxLiability = {
                "title": "Tax Liability",
                "number": "12,000",
                "unit": "",
                "trend": "Up",
                "state": "Good",
                "sideIndicators": [
                    {
                        "title": "IGST",
                        "number": "5000.00",
                        "unit": ""
                    },
                    {
                        "title": "CGST",
                        "number": "5000.00",
                        "unit": ""
                    },
                    {
                        "title": "SGST/UGST",
                        "number": "2000.00",
                        "unit": ""
                    }
                ],
                "measure": [
                    {
                        "measureName": "IGST",
                        "value": 5000
                    },
                    {
                        "measureName": "CGST",
                        "value": 5000
                    },
                    {
                        "measureName": "SGST/UGST",
                        "value": 2000
                    }
                ]
            };
            const stateBreakUp = {};
            const SegmentBreakUp = {};
            const line = {};
            const table = {};
            const list2 = {};

            var data = {
                "taxLiability": {
                    "sap.app": {
                        "id": "sample.CardsLayout.model.donut",
                        "type": "card"
                    },
                    "sap.card": {
                        "type": "Analytical",
                        "header": {
                            "type": "Numeric",
                            "title": taxLiability.title,
                            "mainIndicator": {
                                "number": taxLiability.number,
                                "unit": taxLiability.unit,
                                "trend": taxLiability.trend,
                                "state": taxLiability.state,
                            },
                            "details": "Revenue",
                            "sideIndicators": taxLiability.sideIndicators
                        },
                        "content": {
                            "chartType": "pie",
                            "legend": {
                                "visible": true,
                                "position": "Bottom",
                                "alignment": "Left"
                            },
                            "plotArea": {
                                "dataLabel": {
                                    "visible": true,
                                    "showTotal": true
                                }
                            },
                            "title": {
                                "visible": false,
                                "title": ""
                            },
                            "measureAxis": "size",
                            "dimensionAxis": "color",
                            "data": {
                                "json": {
                                    "measures": taxLiability.measure
                                },
                                "path": "/measures"
                            },
                            "dimensions": [{
                                "label": "Measure Name",
                                "value": "{measureName}"
                            }],
                            "measures": [{
                                "label": "Value",
                                "value": "{value}"
                            }]
                        }
                    }
                },
                "stateBreakUp": {
                    "sap.app": {
                        "id": "sample.CardsLayout.model.donut",
                        "type": "card"
                    },
                    "sap.card": {
                        "type": "Analytical",
                        "content": {
                            "chartType": "pie",
                            "legend": {
                                "visible": true,
                                "position": "Bottom",
                                "alignment": "Left"
                            },
                            "plotArea": {
                                "dataLabel": {
                                    "visible": true,
                                    "showTotal": true
                                }
                            },
                            "title": {
                                "visible": true,
                                "text": "State"
                            },
                            "measureAxis": "size",
                            "dimensionAxis": "color",
                            "data": {
                                "json": {
                                    "measures": [
                                        {
                                            "measureName": "Kerala",
                                            "value": 1564235.29
                                        },
                                        {
                                            "measureName": "Karnataka",
                                            "value": 157913.07
                                        },
                                        {
                                            "measureName": "Goa",
                                            "value": 1085567.22
                                        }
                                    ]
                                },
                                "path": "/measures"
                            },
                            "dimensions": [{
                                "label": "Measure Name",
                                "value": "{measureName}"
                            }],
                            "measures": [{
                                "label": "Value",
                                "value": "{value}"
                            }]
                        }
                    }
                },
                "SegmentBreakUp": {
                    "sap.app": {
                        "id": "sample.CardsLayout.model.donut",
                        "type": "card"
                    },
                    "sap.card": {
                        "type": "Analytical",
                        "content": {
                            "chartType": "pie",
                            "legend": {
                                "visible": true,
                                "position": "Bottom",
                                "alignment": "Left"
                            },
                            "plotArea": {
                                "dataLabel": {
                                    "visible": true,
                                    "showTotal": true
                                }
                            },
                            "title": {
                                "visible": true,
                                "text": "Segment"
                            },
                            "measureAxis": "size",
                            "dimensionAxis": "color",
                            "data": {
                                "json": {
                                    "measures": [
                                        {
                                            "measureName": "B2B",
                                            "value": 1564235.29
                                        },
                                        {
                                            "measureName": "B2C",
                                            "value": 157913.07
                                        },
                                        {
                                            "measureName": "B2A",
                                            "value": 1085567.22
                                        }
                                    ]
                                },
                                "path": "/measures"
                            },
                            "dimensions": [{
                                "label": "Measure Name",
                                "value": "{measureName}"
                            }],
                            "measures": [{
                                "label": "Value",
                                "value": "{value}"
                            }]
                        }
                    }
                },
                "line": {
                    "sap.app": {
                        "id": "sample.CardsLayout.model.Analytical",
                        "type": "card"
                    },
                    "sap.card": {
                        "type": "Analytical",
                        "header": {
                            "type": "Numeric",
                            "title": "Failure Breakdown - Q1, 2019",
                            "mainIndicator": {
                                "number": "43.2",
                                "unit": "%",
                                "trend": "Down",
                                "state": "Good"
                            }
                        },
                        "content": {
                            "chartType": "Line",
                            "legend": {
                                "visible": true,
                                "position": "Bottom",
                                "alignment": "Left"
                            },
                            "title": {
                                "visible": true,
                                "text": ""
                            },
                            "measureAxis": "valueAxis",
                            "dimensionAxis": "categoryAxis",
                            "data": { //Data with Dimension and Measure
                                "json": {
                                    "list": [
                                        {
                                            "Category": "Weather",
                                            "Revenue": 431000.22,
                                            "Cost": 230000.00,
                                            "Target": 500000.00,
                                            "Budget": 210000.00
                                        },
                                        {
                                            "Category": "Mechanics",
                                            "Revenue": 494000.30,
                                            "Cost": 238000.00,
                                            "Target": 500000.00,
                                            "Budget": 224000.00
                                        },
                                        {
                                            "Category": "Software",
                                            "Revenue": 491000.17,
                                            "Cost": 221000.00,
                                            "Target": 500000.00,
                                            "Budget": 238000.00
                                        }
                                    ]
                                },
                                "path": "/list"
                            },
                            "dimensions": [
                                {
                                    "label": "Categories",
                                    "value": "{Category}"
                                }
                            ],
                            "measures": [
                                {
                                    "label": "Revenue",
                                    "value": "{Revenue}"
                                },
                                {
                                    "label": "Cost",
                                    "value": "{Cost}"
                                },
                                {
                                    "label": "Target",
                                    "value": "{Target}"
                                }
                            ]
                        }
                    }
                },
                "table": {
                    "sap.app": {
                        "id": "sample.CardsLayout.model.table",
                        "type": "card"
                    },
                    "sap.card": {
                        "type": "Table",
                        "data": {
                            "json": [
                                {
                                    "salesOrder": "5000010050",
                                    "customerName": "Robert Brown Entertainment",
                                    "netAmount": "2K USD",
                                    "status": "Delivered",
                                    "statusState": "Success"
                                },
                                {
                                    "salesOrder": "5000010051",
                                    "customerName": "Entertainment Argentinia",
                                    "netAmount": "127k USD",
                                    "status": "Canceled",
                                    "statusState": "Error"
                                },
                                {
                                    "salesOrder": "5000010052",
                                    "customerName": "Brazil Technologies",
                                    "netAmount": "8K USD",
                                    "status": "In Progress",
                                    "statusState": "Warning"
                                },
                                {
                                    "salesOrder": "5000010053",
                                    "customerName": "Quimica Madrilenos",
                                    "netAmount": "25K USD",
                                    "status": "Delivered",
                                    "statusState": "Success"
                                },
                                {
                                    "salesOrder": "5000010054",
                                    "customerName": "Development Para O Governo",
                                    "netAmount": "7K USD",
                                    "status": "Delivered",
                                    "statusState": "Success"
                                }
                            ]
                        },
                        "header": {
                            "title": "Sales Orders for Key Accounts"
                        },
                        "content": {
                            "row": {
                                "columns": [
                                    {
                                        "title": "Sales Order",
                                        "value": "{salesOrder}",
                                        "identifier": true
                                    },
                                    {
                                        "title": "Customer",
                                        "value": "{customerName}"
                                    },
                                    {
                                        "title": "Net Amount",
                                        "value": "{netAmount}"
                                    },
                                    {
                                        "title": "Status",
                                        "value": "{status}",
                                        "state": "{statusState}"
                                    }
                                ]
                            }
                        }
                    }
                },
                "list2": {
                    "sap.app": {
                        "id": "sample.CardsLayout.model.list2",
                        "type": "card"
                    },
                    "sap.card": {
                        "type": "List",
                        "header": {
                            "title": "Incidents in the last 24 hours",
                            "subTitle": "Suddent storm wind damaged 3 polinating hives",
                            "icon": {
                                "src": "./test-resources/sap/ui/integration/demokit/sample/CardsLayout/images/CompanyLogo.png"
                            }
                        },
                        "content": {
                            "data": {
                                "json": [
                                    {
                                        "name": "Alain Chevalier",
                                        "icon": "./test-resources/sap/ui/integration/demokit/sample/CardsLayout/images/Avatar_1.png",
                                        "description": "On Site"
                                    },
                                    {
                                        "name": "Yolanda Barrueco",
                                        "icon": "./test-resources/sap/ui/integration/demokit/sample/CardsLayout/images/Avatar_2.png",
                                        "description": "Travelling to Idaho"
                                    },
                                    {
                                        "name": "Arend Pellewever",
                                        "icon": "./test-resources/sap/ui/integration/demokit/sample/CardsLayout/images/Avatar_3.png",
                                        "description": "Travelling to Idaho"
                                    },
                                    {
                                        "name": "Lean Pulp",
                                        "icon": "./test-resources/sap/ui/integration/demokit/sample/CardsLayout/images/Avatar_4.png",
                                        "description": "Headquaters Support"
                                    }
                                ]
                            },
                            "item": {
                                "icon": {
                                    "src": "{icon}"
                                },
                                "title": {
                                    "value": "{name}"
                                },
                                "description": {
                                    "value": "{description}"
                                },
                                "actions": [
                                    {
                                        "type": "Navigation",
                                        "parameters": {
                                            "url": "/users/{name}"
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
            }
            this.cardManifests.setData(data);
        },


        onAction: function (oEvent) {
            debugger;
            if (oEvent.getParameter("type") === integrationLibrary.CardActionType.Navigation) {
                MessageToast.show("URL: " + oEvent.getParameter("parameters").url);
            }
        },

        resolveCardUrl: function (sUrl) {
            return sap.ui.require.toUrl("sap/ui/integration/sample/CardsLayout/" + sUrl);
        },

        onPressProfile: function (oEvent) {
            this.oRouter.navTo("UserProfile");

        },
        onPressAmendments: function (oEvent) {
            this.oRouter.navTo("amendments");

        }
    });
});
