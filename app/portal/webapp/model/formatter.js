sap.ui.define([
], function () {
    "use strict";

    return {
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
                } else{
                    return sValue
                }
            }
        },
        setTypeText: function (sValue) {
            if (sValue) {
                if (sValue === "HE") {
                    return "Head Entity";
                } else if (sValue === "GE") {
                    return "Global Entity";
                } else if (sValue === "AE") {
                    return "Associate Entity"
                } else {
                    return sValue;
                }
            }
        },
        formatDocumentType: function(sType) {
            switch (sType) {
                case "INVOICE":
                    return "Invoice";
                case "DEBIT":
                    return "Debit Note";
                case "CREDIT":
                    return "Credit Note";
                case "BOS":
                    return "Bill of Supply";
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
        setinvoiceState: function (sValue) {
            if (sValue) {
                if (sValue === "Cancelled") {
                    return "Error";
                } else {
                    return "None"
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
        },
        setDescription: function (sValue, sArray) {
            if (sValue) {
                const filtArr = sArray.find(item => item.code === sValue);
                return filtArr ? filtArr.description : sValue;
            }
        },
        formatDate: function (sValue) {
            if (sValue) {
                const oDate = new Date(sValue);
                const year = oDate.getFullYear();
                const month = String(oDate.getMonth() + 1).padStart(2, '0'); // Add 1 to month because it's 0-based
                const day = String(oDate.getDate()).padStart(2, '0');

                return `${year}-${month}-${day}`;
            }
        },
        formatAmount: function (value) {
            if (isNaN(value) || value === null) {
                return "";
            }

            let newValue = value;
            let suffix = "";

            if (value >= 1e9) {
                newValue = value / 1e9;
                suffix = "B";
            } else if (value >= 1e6) {
                newValue = value / 1e6;
                suffix = "M";
            } else if (value >= 1e3) {
                newValue = value / 1e3;
                suffix = "K";
            }

            // Format the value to have a maximum of 2 decimal places
            newValue = parseFloat(newValue.toFixed(2));

            return newValue + suffix;
        },
        formatDateTime: function (sValue) {
            // if (sValue) {
            //     const now = new Date(sValue);
            //     const ISTOffset = 5.5 * 60;

            //     const timestamp = new Date(now.getTime() + ISTOffset * 60000);
            //     const formattedDateTime = `${timestamp.getFullYear()}-${(timestamp.getMonth() + 1).toString().padStart(2, '0')}-${(timestamp.getDate() + 1).toString().padStart(2, '0')} ${timestamp.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`;

            //     return formattedDateTime;
            // }
            if (sValue) {
                const now = new Date(sValue);
                const ISTOffset = 5.5 * 60 * 60 * 1000;
                const timestamp = new Date(now.getTime() + ISTOffset);
                
                const formattedDateTime = `${timestamp.getDate().toString().padStart(2, '0')}-${(timestamp.getMonth() + 1).toString().padStart(2, '0')}-${timestamp.getFullYear()} ${timestamp.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`;
                
                return formattedDateTime;
            }
            
        },

        formatTimeStamp: function (sValue) {

            if (sValue) {
                var dateString = sValue;

                // Split the string by space to separate date and time
                var parts = dateString.split(" ");

                // The date is now in the first part of the array
                var formattedDate = parts[0];
                var updatedDate = formattedDate.split("-");
                var formattedDateupdated = updatedDate[2] + "-" + updatedDate[1] + "-" + updatedDate[0] ;

                // Output the formatted date
                return formattedDateupdated;
            }
        },

        formatNewDateChange: function (sValue) {

            if (sValue) {
                var dateStringChange = sValue;

                // Split the string by space to separate date and time
                var partsChanged = dateStringChange.split("-");

                // The date is now in the first part of the array
                var formattedDate = partsChanged[2] + "-" + partsChanged[1] + "-" + partsChanged[0] ;

                // Output the formatted date
                return formattedDate;
            }
        }


    };
}
);