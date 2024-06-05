sap.ui.define([
], function () {
    "use strict";

    return {
        formatTaxCode: function (sValue) {
            if (sValue) {
                const taxCodes = this.taxCodeModel.getData();
                if (Array.isArray(taxCodes)) {
                    for (const taxCode of taxCodes) {
                        if (taxCode.taxCode === sValue) {
                            return taxCode.description;
                        }
                    }
                }
            }
            return "";
        },
        setStatusText: function (sValue) {
            if (sValue) {
                if (sValue === "A") {
                    return "Active";
                } else if (sValue === "B") {
                    return "Blocked";
                } else if (sValue === "2") {
                    return "Regular"
                } else if (sValue === "D") {
                    return "Deactivated"
                } else if (sValue === "P") {
                    return "Pending"
                } else if (sValue === "R") {
                    return "Rejected"
                }
            }
        },
        setStatusState: function (sValue) {
            if (sValue) {
                if (sValue === "A") {
                    return "Success";
                } else if (sValue === "B" || sValue === "D" || sValue === "R") {
                    return "Error";
                } else if (sValue === "P") {
                    return "Warning"
                }
            }
        },
        setStatusIcon: function (sValue) {
            if (sValue) {
                if (sValue === "A") {
                    return "sap-icon://sys-enter-2";
                } else if (sValue === "B") {
                    return "sap-icon://private";
                } else if (sValue === "D") {
                    return "sap-icon://sys-minus"
                } else if (sValue === "P") {
                    return "sap-icon://pending"
                } else if (sValue === "R") {
                    return "sap-icon://sys-cancel"
                }
            }
        }

    };
}
);