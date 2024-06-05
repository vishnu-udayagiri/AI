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
        }

    };
}
);