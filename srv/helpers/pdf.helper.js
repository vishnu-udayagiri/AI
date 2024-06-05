const { PDFDocument, rgb } = require('pdf-lib');

exports.addCancelledWatermarkToPdf = async (tx, InvoiceId, email) => {

    try {

        const query = 'SELECT INVOICE_ID, FILE FROM INVOICEDOCUMENTS WHERE INVOICE_ID = ?'
        const result = (await tx.run(query, [InvoiceId]))[0]

        if (result?.FILE) {

            const base64 = result?.FILE
            let pdfBuffer = Buffer.from(base64, 'base64')

            let pdfDoc;

            try {
                pdfDoc = await PDFDocument.load(pdfBuffer)
            } catch (error) {
                const errQuery = 'UPDATE INVOICEDOCUMENTS SET REMARKS = ?, MODIFIEDAT=CURRENT_TIMESTAMP, MODIFIEDBY=?  WHERE INVOICE_ID = ?'
                await tx.run(errQuery, ['Invalid PDF Document', email, InvoiceId])
            }

            if (pdfDoc) {
                const pages = pdfDoc.getPages();

                for (const page of pages) {
                    const { width, height } = page.getSize();


                    const fontSize = 70;
                    const text = 'CANCELLED';

                    const centerX = width / 2;
                    const centerY = height / 2;

                    const textWidth = text.length * fontSize * 0.6;
                    const textHeight = fontSize;

                    const x = centerX - textWidth / 2;
                    const y = centerY - textHeight / 2;

                    page.drawText(text, {
                        x,
                        y,
                        size: fontSize,
                        color: rgb(0.9, 0.1, 0.1),
                    });
                }

                const pdfBase64 = await pdfDoc.saveAsBase64();
                const errQuery = 'UPDATE INVOICEDOCUMENTS SET REMARKS = ?, FILE = ?, MODIFIEDAT=CURRENT_TIMESTAMP, MODIFIEDBY=?,CANCELLEDTIME=CURRENT_TIMESTAMP,CANCELLEDBY=?  WHERE INVOICE_ID = ?'
                await tx.run(errQuery, ['Cancelled PDF Updated', pdfBase64, email, email, InvoiceId])
            }
        }

        return
    } catch (error) {
        console.log(error)
    }

};


exports.addCancelledWatermark = async (base64) => {

    try {


        if (!base64) {
            return {
                status: 'Failed',
                message: 'Base64 not found',
                data: ''
            }
        }

        let pdfBuffer = Buffer.from(base64, 'base64')

        let pdfDoc;

        try {
            pdfDoc = await PDFDocument.load(pdfBuffer)
        } catch (error) {

            return {
                status: 'Failed',
                message: 'Invalid PDF document',
                data: ''
            }

        }

        if (pdfDoc) {
            const pages = pdfDoc.getPages();

            for (const page of pages) {
                const { width, height } = page.getSize();


                const fontSize = 70;
                const text = 'CANCELLED';

                const centerX = width / 2;
                const centerY = height / 2;

                const textWidth = text.length * fontSize * 0.6;
                const textHeight = fontSize;

                const x = centerX - textWidth / 2;
                const y = centerY - textHeight / 2;

                page.drawText(text, {
                    x,
                    y,
                    size: fontSize,
                    color: rgb(0.9, 0.1, 0.1),
                });
            }

            const pdfBase64 = await pdfDoc.saveAsBase64();
            return {
                status: 'Success',
                message: 'Cancelled watermark added',
                data: pdfBase64
            }
        }


        return {
            status: 'Failed',
            message: 'Invalid PDF document',
            data: ''
        }
        
    } catch (error) {

        return {
            status: 'Failed',
            message: 'Internal Error',
            data: ''
        }
    }

};