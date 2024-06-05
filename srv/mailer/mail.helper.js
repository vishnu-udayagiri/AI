const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require('path');


const decrypter = require('../utils/decrypter')

// const envFilePath = path.join(process.cwd(), 'default-env.json');
const configData = getSMTPMailCredentials()


const mailConfig = {
    "host": configData?.host ?? "",
    "port": configData?.port ?? "",
    "secure": false,
    "tls": {
        "ciphers": "SSLv3",
        "rejectUnauthorized": false
    },
    "auth": {
        "user": configData?.username ?? "",
        "pass": configData?.password ?? ""
    }
}

const userActivationMail = async (name, email, password) => {

    try {
        const templatePath = 'srv/mailer/mail-template/activate.user.template.html'
        const htmlData = fs.readFileSync(templatePath, "utf-8")

        const template = {
            "[[name]]": name,
            "[[password]]": password
        }

        const updatedHTML = await modifyHTMLTemplate(template, htmlData)
        const transporter = nodemailer.createTransport(mailConfig);

        const mailOptions = {
            from: 'noreply@airindia.com',
            to: email,
            subject: 'Welcome Back! Your GST.AI account has been reactivated sucessfully ',
            html: updatedHTML
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
    } catch (error) {
        console.log(`Error sending email: ${error}`);
    }
}

const userDeactivationMail = async (name, email, reason) => {

    try {
        const templatePath = 'srv/mailer/mail-template/deactivate.user.template.html'
        const htmlData = fs.readFileSync(templatePath, "utf-8")

        const template = {
            "[[name]]": name,
            "[[reason]]": reason
        }

        const updatedHTML = await modifyHTMLTemplate(template, htmlData)
        const transporter = nodemailer.createTransport(mailConfig);

        const mailOptions = {
            from: 'noreply@airindia.com',
            to: email,
            subject: ' Important: GST.AI account deactivation confirmation ',
            html: updatedHTML
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
    } catch (error) {
        console.log(`Error sending email: ${error}`);
    }
}

const assignAsAdminMail = async (name, email) => {

    try {
        const templatePath = 'srv/mailer/mail-template/assign.as.admin.template.html'
        const htmlData = fs.readFileSync(templatePath, "utf-8")

        const template = {
            "[[name]]": name
        }

        const updatedHTML = await modifyHTMLTemplate(template, htmlData)
        const transporter = nodemailer.createTransport(mailConfig);

        const mailOptions = {
            from: 'noreply@airindia.com',
            to: email,
            subject: 'Congratulations! You are now an admin of your GST.AI account.',
            html: updatedHTML
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
    } catch (error) {
        console.log(`Error sending email: ${error}`);
    }
}

const userApprovalMail = async (name, email, password) => {

    try {
        const templatePath = 'srv/mailer/mail-template/approve.user.template.html'
        const htmlData = fs.readFileSync(templatePath, "utf-8")

        const template = {
            "[[name]]": name,
            "[[password]]": password
        }

        const updatedHTML = await modifyHTMLTemplate(template, htmlData)
        const transporter = nodemailer.createTransport(mailConfig);

        const mailOptions = {
            from: 'noreply@airindia.com',
            to: email,
            subject: 'Welcome to Air India - Your Account is Now Approved!',
            html: updatedHTML
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
    } catch (error) {
        console.log(`Error sending email: ${error}`);
    }
}

const userRejectMail = async (name, email, reason) => {

    try {
        const templatePath = 'srv/mailer/mail-template/reject.user.template.html'
        const htmlData = fs.readFileSync(templatePath, "utf-8")

        const template = {
            "[[name]]": name,
            "[[reason]]": reason
        }

        const updatedHTML = await modifyHTMLTemplate(template, htmlData)
        const transporter = nodemailer.createTransport(mailConfig);

        const mailOptions = {
            from: 'noreply@airindia.com',
            to: email,
            subject: 'Air India Account Rejection Notice',
            html: updatedHTML
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
    } catch (error) {
        console.log(`Error sending email: ${error}`);
    }
}

async function modifyHTMLTemplate(template, html) {

    html = html.toString();

    for (const key in template) {
        if (Object.hasOwnProperty.call(template, key)) {
            const value = template[key];
            html = html.replaceAll(key, value);
        }
    }
    return html;
}

function getSMTPMailCredentials() {

    const stage = process.env.ENV_STAGE ?? "DEV";

    try {

        if (stage == "PROD") {
            return {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                username: process.env.SMTP_USER,
                password: decrypter(process.env.SMTP_PASS),
            }
        } else {
            return {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                username: process.env.SMTP_USER,
                password: process.env.SMTP_PASS,
            }
        }

    } catch (error) {

        return {
            host: "sandbox.smtp.mailtrap.io",
            port: "587",
            username: "870f11c7c3c13a",
            password: "57ddf9798eccb7",
        }

    }





}

module.exports = {
    userActivationMail,
    userDeactivationMail,
    assignAsAdminMail,
    userApprovalMail,
    userRejectMail
}