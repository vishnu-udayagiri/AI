const nodemailer = require('nodemailer');
const decrypter = require('./decrypter.controller');

function getSMTPMailCredentials(credentials) {
    const stage = credentials.ENV_STAGE ?? 'DEV';
    try {
        if (stage == 'PROD') {
            return {
                host: credentials.SMTP_HOST,
                port: credentials.SMTP_PORT,
                username: credentials.SMTP_USER,
                password: decrypter(credentials.SMTP_PASS),
            };
        } else {
            return {
                host: credentials.SMTP_HOST,
                port: credentials.SMTP_PORT,
                username: credentials.SMTP_USER,
                password: credentials.SMTP_PASS,
            };
        }
    } catch (error) {
        return {
            host: 'sandbox.smtp.mailtrap.io',
            port: '587',
            username: '870f11c7c3c13a',
            password: '57ddf9798eccb7',
        };
    }
}
exports.establishConenction = (credentials) => {
    const configData = getSMTPMailCredentials(credentials);
    const mailConfig = {
        host: configData?.host ?? '',
        port: configData?.port ?? '',
        secure: false,
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false,
        },
        auth: {
            user: configData?.username ?? '',
            pass: configData?.password ?? '',
        },
    };
    return nodemailer.createTransport(mailConfig);
}

exports.sendEmailWithPDF = (base64PDFString, customerName, recipientEmails, fileName, transporter) => {
    return new Promise((resolve, reject) => {
        customerName = customerName ? customerName : 'Customer';
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice for your Air India booking</title>
        </head>
        <body>
            <p>Dear ${customerName},</p>
            <p>Greetings from Air India!</p> 
            <p>Please find the invoice of your Air India booking attached to this email.</p>
            <p>If you have any questions concerning your invoice, do send an email to <a href="mailto:gstsupport@airindia.com">gstsupport@airindia.com</a>.</p> 
            <p>
            Regards, <br/>
            Air India
            </p>
        </body>
        </html>
        `;

        const mailOptions = {
            from: 'noreply@airindia.com',
            to: recipientEmails, // Array of recipient email addresses
            subject: 'Invoice for your Air India booking',
            html: htmlContent,
            attachments: [
                {
                    filename: `${fileName}.pdf`,
                    content: Buffer.from(base64PDFString, 'base64'),
                    contentType: 'application/pdf'
                }
            ]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            } else {
                resolve(info);
            }
        });
    });
};


// // Example usage
// const base64String = 'base64_string_of_the_pdf';
// const recipientEmail = 'recipient_email_address';

// sendEmailWithPDF(base64String, recipientEmail)
//     .then(info => {
//         console.log('Email sent:', info.response);
//     })
//     .catch(error => {
//         console.error('Error sending email:', error);
//     });