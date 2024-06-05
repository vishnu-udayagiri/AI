const fs = require('fs-extra');
const nodemailer = require('nodemailer');
const path = require('path');
const { getAdminsFromCompanyId, getAISuperAdmins } = require('../db/agent.db');

const decrypter = require('../libs/decrypter')

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

const sendAmendmentRequestSuccessMailToUser = async (name, email, newValue, oldValue, type) => {

    try {
        const templatePath = path.join(process.cwd(), 'mail-templates', 'amendment.request.confirmation.template.html')
        const htmlData = fs.readFileSync(templatePath, "utf-8")

        let category1= ""
        let category2= ""

        switch (type){
            case 'GSTIN':
                category1 = "Old GSTIN"
                category2 = "New GSTIN"
                break;
            case 'Remove GSTIN':
                category1 = "New Address";
                category2 = "Removing GSTIN";
                break;
            case 'GSTIN Address':
                category1 = "Old Address";
                category2 = "New Address";
                break;
            default:
                category1 = ""
                category2 = ""
        }

        const template = {
            "[[name]]": name,
            "[[type]]": type,
            "[[oldValue]]": oldValue??"",
            "[[newValue]]": newValue??"",
            "[[category1]]": category1,
            "[[category2]]": category2,
        }

        const updatedHTML = await modifyHTMLTemplate(template, htmlData)
        const transporter = nodemailer.createTransport(mailConfig);

        const mailOptions = {
            from: 'noreply@airindia.com',
            to: email,
            subject:  `Pending Approval: ${type} Amendment Request`,
            html: updatedHTML
        };

        const info = await transporter.sendMail(mailOptions);
        // console.log(`Email sent: ${info.messageId}`);
    } catch (error) {
        console.log(`Error sending email User: ${error}`);
    }
}

const sendAmendmentRequestMailToAdmin = async (db, companyId, newValue, oldValue, type) => {

    try {

        const templatePath = path.join(process.cwd(), 'mail-templates', 'amendment.request.admin.template.html')
        const htmlData = fs.readFileSync(templatePath, "utf-8")

        let category1= ""
        let category2= ""

        switch (type){
            case 'GSTIN':
                category1 = "Old GSTIN"
                category2 = "New GSTIN"
                break;
            case 'Remove GSTIN':
                category1 = "New Address";
                category2 = "Removing GSTIN";
                break;
            case 'Address':
                category1 = "Old Address";
                category2 = "New Address";
                break;
            default:
                category1 = ""
                category2 = ""
        }

        const template = {
            "[[type]]": type,
            "[[oldValue]]": oldValue??"",
            "[[newValue]]": newValue??"",
            "[[category1]]": category1,
            "[[category2]]": category2,
        }

        const updatedHTML = await modifyHTMLTemplate(template, htmlData)
        const transporter = nodemailer.createTransport(mailConfig);

        const admins = (await getAdminsFromCompanyId(db, companyId)).data
        // console.log(admins);
        const email = admins.map(a => a.LOGINEMAIL)

        const mailOptions = {
            from: 'noreply@airindia.com',
            to: email,
            subject:  `Pending Approval: ${type} Amendment Request`,
            html: updatedHTML
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
    } catch (error) {
        console.log(`Error sending email Admin: ${error}`);
    }
}

const sendAmendmentApproveorRejectMailToUser = async (name, email, newValue, oldValue, type, mailType) => {

    try {
        let templateMailPath;
        if(mailType == 'approved'){
            templateMailPath = path.join(process.cwd(), 'mail-templates', 'amendment.request.approved.template.html')
        }else{
            templateMailPath = path.join(process.cwd(), 'mail-templates', 'amendment.request.rejected.template.html')
        }

        let category1= ""
        let category2= ""

        switch (type){
            case 'GSTIN':
                category1 = "Old GSTIN"
                category2 = "New GSTIN"
                break;
            case 'Remove GSTIN':
                category1 = "New Address";
                category2 = "Removing GSTIN";
                break;
            case 'Address':
                category1 = "Old Address";
                category2 = "New Address";
                break;
            default:
                category1 = ""
                category2 = ""
        }

        const htmlData = fs.readFileSync(templateMailPath, "utf-8")

        const template = {
            "[[name]]": name,
            "[[type]]": type,
            "[[oldValue]]": oldValue??"",
            "[[newValue]]": newValue??"",
            "[[category1]]": category1,
            "[[category2]]": category2,
        }

        const updatedHTML = await modifyHTMLTemplate(template, htmlData)
        const transporter = nodemailer.createTransport(mailConfig);
        const mailOptions = {
            from: 'noreply@airindia.com',
            to: email,
            subject: `${type} Amendment Request ${mailType} Successfully`,
            html: updatedHTML
        };

        const info = await transporter.sendMail(mailOptions);
        // console.log(`Email sent: ${info.messageId}`);
    } catch (error) {
        console.log(`Error sending email Approve or Reject: ${error}`);
    }
}

const sendAmendmentRequestMailToAIAdmins = async (db, newValue, oldValue, type) => {

    try {

        const templatePath = path.join(process.cwd(), 'mail-templates', 'amendment.request.admin.template.html')
        const htmlData = fs.readFileSync(templatePath, "utf-8")

        let category1= ""
        let category2= ""

        switch (type){
            case 'GSTIN':
                category1 = "Old GSTIN"
                category2 = "New GSTIN"
                break;
            case 'Remove GSTIN':
                category1 = "New Address";
                category2 = "Removing GSTIN";
                break;
            case 'GSTIN Address':
                category1 = "Old Address";
                category2 = "New Address";
                break;
            default:
                category1 = ""
                category2 = ""
        }

        const template = {
            "[[type]]": type,
            "[[oldValue]]": oldValue??"",
            "[[newValue]]": newValue??"",
            "[[category1]]": category1,
            "[[category2]]": category2,
        }

        const updatedHTML = await modifyHTMLTemplate(template, htmlData)
        const transporter = nodemailer.createTransport(mailConfig);

        const admins = (await getAISuperAdmins(db)).data
        // console.log(admins);
        const email = admins.map(a => a.EMAIL)

        const mailOptions = {
            from: 'noreply@airindia.com',
            to: email,
            subject:  `Pending Approval: ${type} Amendment Request`,
            html: updatedHTML
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
    } catch (error) {
        console.log(`Error sending email AI Admins: ${error}`);
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

function getSMTPMailCredentials(){

    const stage = process.env.ENV_STAGE?? "DEV";
    try {
        if(stage == "PROD"){
            return {
                host:process.env.SMTP_HOST,
                port:process.env.SMTP_PORT,
                username:process.env.SMTP_USER,
                password:decrypter(process.env.SMTP_PASS),
            }
        } else{
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
    sendAmendmentRequestSuccessMailToUser,
    sendAmendmentRequestMailToAdmin,
    sendAmendmentApproveorRejectMailToUser,
    sendAmendmentRequestMailToAIAdmins,
    getSMTPMailCredentials
}