sap.ui.define([
], function () {
    "use strict";

    return {
        validateEmail: function (sValue) {
            const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return validEmailRegex.test(sValue);
        },
        validatePAN: function (sValue) {
            sValue = sValue.toUpperCase();
            const validPANRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
            return validPANRegex.test(sValue);
        },
        validatePhone: function (sValue) {
            const validPhoneRegex = /^(?:(?:\+|0{0,2})(91)(\s*|[\\-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/gm;
            return validPhoneRegex.test(sValue);
        },
        validatePincode: function (sValue) {
            const validPincodeRegex = /^[1-9]{1}\d{2}\s?\d{3}$/gm;
            return validPincodeRegex.test(sValue);
        },
        validatePassword: function (sValue) {
            const validPasswordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
            return validPasswordRegex.test(sValue);
        },
        validateGSTIN: function (sValue) {
            sValue = sValue.toUpperCase();
            const validGstinRegex = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/gm
            return validGstinRegex.test(sValue);
        },
        validateDate: function (sValue) {
            const validDateRegex = /^\d{4}-\d{2}-\d{2}$/;
            return validDateRegex.test(sValue);
        }
    };
}
);