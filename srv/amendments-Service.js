const cds = require('@sap/cds');
const moment = require('moment');
const { approveOrRejectGSTINAmendment, approveOrRejectAddressAmendment, approveOrRejectChangeAddressAmendment } = require('./db/invoices.db')
module.exports = async function () {

    const srv = await cds.connect.to('InvoiceService')

    this.on("approveAmendment", async (req) => {
        try {

            /** TODO :  @Aromal Approve requested amendment */

            const tx = cds.transaction(req);
            const reqData = req.data.invoices;
            var msg = [];
            var info = [];
            // const reqType = reqData?.reqType ?? ""

            for (let i = 0; i < reqData.length; i++) {
                const oSelInv = reqData[i];
                const invoiceId = oSelInv.ID;
                const invCompany = oSelInv.company;

                const originalInvoiceQuery = `SELECT * FROM INVOICE WHERE ID = ?`;
                const [originalInvoice] = await tx.run(originalInvoiceQuery, [invoiceId]);

                if (originalInvoice.AMENDEMENTSTATUS != 'AA' && originalInvoice.AMENDEMENTSTATUS != 'AY') {
                    if (originalInvoice.AMENDEMENTSTATUS != 'AR') {
                        const reqType = originalInvoice?.AMENDMENTTYPE ?? ""

                        // const email = originalInvoice.AMENDMENTAPPROVEDBY;
                        const email = req.user.id;

                        /**
                         * P -  Pending
                         * A -  Approved
                         * R -  Rejected 
                         * AP - Forwarded to Air India for approval, 
                         * AF - Air India Requested, 
                         * AA - Air india Approved, 
                         * AR - Air india Rejected, 
                         * AY - Air india Approved the Forwarded request from B2A 
                         */

                        /**
                         * if status = 'Y' then after approve change status = 'AY'
                         */

                        let result;

                        switch (reqType) {
                            case 'CHANGE GSTIN':
                                result = await approveOrRejectGSTINAmendment(tx, originalInvoice, invoiceId, 'AA', email, false, '');
                                if (result.status == 'FAILED') {
                                    info.push(`Amendment Request (${originalInvoice.AMENDMENTREQUESTNO}) is not eligible for Approval`);
                                    
                                } else {
                                    msg.push(`Amendment Request (${originalInvoice.AMENDMENTREQUESTNO}) Approved`);
                                }
                                break;
                            case 'REMOVE GSTIN':
                                result = await approveOrRejectAddressAmendment(tx, originalInvoice, invoiceId, 'AA', email, false, '');
                                if (result.status == 'FAILED') {
                                    info.push(`Amendment Request (${originalInvoice.AMENDMENTREQUESTNO}) is not eligible for Approval`);
                                } else {
                                msg.push(`Amendment Request (${originalInvoice.AMENDMENTREQUESTNO}) Approved`);
                                }
                                break;
                            case 'CHANGE ADDRESS':
                                result = await approveOrRejectChangeAddressAmendment(tx, originalInvoice, invoiceId, 'AA', email, false, '');
                                if (result.status == 'FAILED') {
                                    info.push(`Amendment Request (${originalInvoice.AMENDMENTREQUESTNO}) is not eligible for Approval`);
                                } else {
                                msg.push(`Amendment Request (${originalInvoice.AMENDMENTREQUESTNO}) Approved`);
                                }
                                break;
                               
                            default:
                                return req.warn(400, 'Invalid request type')
                        }


                    } else {
                        msg.push(`Amendment Request (${originalInvoice.AMENDMENTREQUESTNO}) is already Rejected`);
                    }
                } else {
                    msg.push(`Amendment Request (${originalInvoice.AMENDMENTREQUESTNO}) is already Approved`);
                }
            }

            return {msg: msg.join('\n'), info: info.join('\n') };
        
        } catch (error) {
            return req.error(500, error.message);
        }
    });

    this.on("rejectAmendment", async (req) => {
        try {
            /** TODO :  @Aromal Reject requested amendment */

            const tx = cds.transaction(req);
            const reqData = req.data.invoices;
            var msg = [];
            const reason = req.data.reason;
            for (let i = 0; i < reqData.length; i++) {
                const oSelInv = reqData[i];
                const invoiceId = oSelInv.ID;
                const invCompany = oSelInv.company;

                const originalInvoiceQuery = `SELECT * FROM INVOICE WHERE ID = ?`;
                const [originalInvoice] = await tx.run(originalInvoiceQuery, [invoiceId]);

                if (!originalInvoice) {
                    return req.warn(400, 'Invoice not found')
                }

                if (originalInvoice.AMENDEMENTSTATUS != 'AA' && originalInvoice.AMENDEMENTSTATUS != 'AY') {
                    if (originalInvoice.AMENDEMENTSTATUS != 'AR') {

                        const email = originalInvoice.AMENDMENTREQUESTEDBY;

                        const reqType = originalInvoice?.AMENDMENTTYPE ?? "";

                        let result;

                        switch (reqType) {
                            case 'CHANGE GSTIN':
                                result = await approveOrRejectGSTINAmendment(tx, originalInvoice, invoiceId, 'AR', email, false, reason);
                                msg.push(`Amendment Request (${originalInvoice.AMENDMENTREQUESTNO}) Rejected for reason :${reason}`);
                                break;
                            case 'REMOVE GSTIN':
                                result = await approveOrRejectAddressAmendment(tx, originalInvoice, invoiceId, 'AR', email, false, reason);
                                msg.push(`Amendment Request (${originalInvoice.AMENDMENTREQUESTNO}) Rejected for reason :${reason}`);
                                break;
                            case 'CHANGE ADDRESS':
                                result = await approveOrRejectChangeAddressAmendment(tx, originalInvoice, invoiceId, 'AR', email, false, reason);
                                msg.push(`Amendment Request (${originalInvoice.AMENDMENTREQUESTNO}) Rejected for reason :${reason}`);
                                break;
                            default:
                                return req.warn(400, 'Invalid request type')
                        }
                    } else {
                        msg.push(`Amendment Request (${originalInvoice.AMENDMENTREQUESTNO}) is already Rejected`);
                    }
                } else {
                    msg.push(`Amendment Request (${originalInvoice.AMENDMENTREQUESTNO}) is already Approved`);
                }
            }
            return msg.join('\n');
        } catch (error) {
            req.error(500, error.message);
        }
    });

    this.on("downloadInvoice", async (req) => {
        /**Calling download function from invoice */
        try {

            return await srv.tx(req).downloadInvoice(req.data);

        } catch (error) {
            req.error(500, error.message);
        }
    });

    this.on("getCSRFToken", (req) => {
        return "Token";
    });


}