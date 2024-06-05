sap.ui.define([
    "sap/ui/core/mvc/Controller", "sap/ui/core/Core", "sap/m/Dialog", "sap/m/DialogType", "sap/m/Button", "sap/m/ButtonType",
    "sap/m/Label", "sap/m/Input", "sap/m/Select", "sap/m/MultiComboBox", "sap/m/MessageToast", "sap/m/Text",
    "sap/m/TextArea", "sap/m/ComboBox", "sap/m/MessageBox", "sap/m/CheckBox", "sap/ui/model/json/JSONModel", "sap/ui/table/Table"
], function (Controller, Core, Dialog, DialogType, Button, ButtonType,
    Label, Input, Select, MultiComboBox, MessageToast, Text,
    TextArea, ComboBox, MessageBox, CheckBox, JSONModel, Table) {
    "use strict";
    return {

        viewDocument: function (oContext, aSelectedContexts) {
            // if (aSelectedContexts.length == 0) return MessageBox.warning("Select one attachment");
            for (let i = 0; i < aSelectedContexts.length; i++) {
                const oSelAttachment = aSelectedContexts[i];
                const oSelDocument = oSelAttachment.getObject();
                const file = oSelDocument.file;
                const fileName = oSelDocument.fileName;
                if (file && fileName) {
                    const base64Data = file;
                    const link = document.createElement('a');
                    link.href = base64Data;
                    link.download = fileName;
                    link.click();
                }
            }
        }
    }
});