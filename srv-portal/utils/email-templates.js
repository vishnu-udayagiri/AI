const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs-extra');
const decrypter = require('../libs/decrypter');
const configData = getSMTPMailCredentials();
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

const userLoginMailTemplate = async (otp, email, name) => {
  try {
    //const db = req.db;
    const templatePath = path.join(process.cwd(), 'mail-templates', 'common.template.html');
    const htmlData = fs.readFileSync(templatePath, 'utf-8');

    let content = `Your One Time Password (OTP) for login is <strong> ${otp} </strong>`;
    let title = 'LOGIN WITH OTP';
    // const userDetails = await db.exec(`SELECT FIRSTNAME, LASTNAME FROM COMPANYUSERS WHERE LOGINEMAIL='${email}'`);
    // const name = userDetails[0].FIRSTNAME;
    const template = {
      '[[Name]]': name,
      '[[title]]': title,
      '[[content]]': content,
      '[[Email]]': email,
      '[[regards]]': 'Regards, ',
    };

    const updatedHTML = await modifyHTMLTemplate(template, htmlData);
    const transporter = nodemailer.createTransport(mailConfig);

    const mailOptions = {
      from: 'noreply@airindia.com',
      to: email,
      subject: `OTP for GST.AI Login`,
      html: updatedHTML,
    };

    // await transporter.sendMail(mailOptions);
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(`Error sending email User: ${error}`);
  }
};

const userRegisterMailTemplate = async (otp, email, name) => {
  try {
    const templatePath = path.join(process.cwd(), 'mail-templates', 'common.template.html');
    const htmlData = fs.readFileSync(templatePath, 'utf-8');

    let content = `Your One Time Password (OTP) for login is <strong> ${otp} </strong>`;
    let title = 'LOGIN WITH OTP';
    const template = {
      '[[Name]]': name,
      '[[title]]': title,
      '[[content]]': content,
      '[[Email]]': email,
      '[[regards]]': 'Regards,',
    };

    const updatedHTML = await modifyHTMLTemplate(template, htmlData);
    const transporter = nodemailer.createTransport(mailConfig);

    const mailOptions = {
      from: 'noreply@airindia.com',
      to: email,
      subject: `OTP for GST.AI Registration`,
      html: updatedHTML,
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(`Error sending email User: ${error}`);
  }
};

const userWelcomeMailTemplate = async (password, email, name) => {
  if (password) {
    try {
      const templatePath = path.join(process.cwd(), 'mail-templates', 'common.template.html');
      const htmlData = fs.readFileSync(templatePath, 'utf-8');

      let content = `We are delighted to inform you that your Air India account on GST.AI has been approved. You can now explore a seamless and personalised experience with us.
        <br>
        <br>
        Your new password for portal login on GST.AI is: 
        <br>
        <strong> ${password} </strong>
        <br>
        <br>
        Thank you for choosing Air India. We look forward to serving you and providing you with the best possible experience.`;

      let title = ' ACCOUNT APPROVED';
      const template = {
        '[[Name]]': name,
        '[[title]]': title,
        '[[content]]': content,
        '[[Email]]': email,
        '[[regards]]': 'Regards,',
      };

      const updatedHTML = await modifyHTMLTemplate(template, htmlData);
      const transporter = nodemailer.createTransport(mailConfig);

      const mailOptions = {
        from: 'noreply@airindia.com',
        to: email,
        subject: `Your account on GST.AI has been approved!`,
        html: updatedHTML,
      };

      const info = await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log(`Error sending email User: ${error}`);
    }
  } else {
    try {
      const templatePath = path.join(process.cwd(), 'mail-templates', 'common.template.html');
      const htmlData = fs.readFileSync(templatePath, 'utf-8');

      let content = `Your profile creation has been initiated and is awaiting approval.`;
      let title = 'PROFILE APPROVAL';
      const template = {
        '[[Name]]': name,
        '[[title]]': title,
        '[[content]]': content,
        '[[Email]]': email,
        '[[regards]]': 'Regards, ',
      };

      const updatedHTML = await modifyHTMLTemplate(template, htmlData);
      const transporter = nodemailer.createTransport(mailConfig);

      const mailOptions = {
        from: 'noreply@airindia.com',
        to: email,
        subject: `Your profile approval on GST.AI is in progress`,
        html: updatedHTML,
      };

      const info = await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log(`Error sending email User: ${error}`);
    }
  }
};

const newUserRegistration = async (email, name) => {
  try {
    const templatePath = path.join(process.cwd(), 'mail-templates', 'common.template.html');
    const htmlData = fs.readFileSync(templatePath, 'utf-8');

    let content = `Greeting from Air India!
    <br>
    We are excited to receive your new user registration request. Please log in to the portal now to complete the registration process
        <br>
        <br>
        If you have any questions or need assistance,please contact<a href="mailto:gstsupport@airindia.com">gstsupport@airindia.com </a> our support team.`;
    let title = 'NEW USER REGISTRATION REQUEST ';
    const template = {
      '[[Name]]': name,
      '[[title]]': title,
      '[[content]]': content,
      '[[Email]]': email,
      '[[regards]]': 'Regards,',
    };

    const updatedHTML = await modifyHTMLTemplate(template, htmlData);
    const transporter = nodemailer.createTransport(mailConfig);

    const mailOptions = {
      from: 'noreply@airindia.com',
      to: email,
      subject: `New User Registration on GST.AI request received `,
      html: updatedHTML,
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(`Error sending email User: ${error}`);
  }
};
const blockUser = async (reason, email, name) => {
  try {
    const templatePath = path.join(process.cwd(), 'mail-templates', 'common.template.html');
    const htmlData = fs.readFileSync(templatePath, 'utf-8');

    let content = `
    We regret to inform you that your GST.AI account is currently blocked due to the following reason: <strong><u>${reason}</u> </strong>
        <br>
        <br>
        To resolve this issue and regain access, please contact<a href="mailto:gstsupport@airindia.com">gstsupport@airindia.com </a>.`;
    let title = 'ACCOUNT BLOCKED';
    const template = {
      '[[Name]]': name,
      '[[title]]': title,
      '[[content]]': content,
      '[[Email]]': email,
      '[[regards]]': 'Regards, ',
    };

    const updatedHTML = await modifyHTMLTemplate(template, htmlData);
    const transporter = nodemailer.createTransport(mailConfig);

    const mailOptions = {
      from: 'noreply@airindia.com',
      to: email,
      subject: `Important: Your GST.AI account is currently blocked`,
      html: updatedHTML,
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(`Error sending email User: ${error}`);
  }
};

const unBlockUser = async (password, email, name) => {
  try {
    const templatePath = path.join(process.cwd(), 'mail-templates', 'common.template.html');
    const htmlData = fs.readFileSync(templatePath, 'utf-8');

    let content = `
    We're thrilled to share the good news that your GST.AI account has been successfully unblocked! You can now continue enjoying our services.
        <br>
        <br>
        New password for login is: <br> <strong> ${password} </strong>`;

    let title = ' ACCOUNT UNBLOCKED ';
    const template = {
      '[[Name]]': name,
      '[[title]]': title,
      '[[content]]': content,
      '[[Email]]': email,
      '[[regards]]': 'Regards,',
    };

    const updatedHTML = await modifyHTMLTemplate(template, htmlData);
    const transporter = nodemailer.createTransport(mailConfig);

    const mailOptions = {
      from: 'noreply@airindia.com',
      to: email,
      subject: `Account Unblocked: Your New Password Inside!`,
      html: updatedHTML,
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(`Error sending email User: ${error}`);
  }
};

const activateUser = async (password, email, name) => {
  try {
    const templatePath = path.join(process.cwd(), 'mail-templates', 'common.template.html');
    const htmlData = fs.readFileSync(templatePath, 'utf-8');

    let content = `
    Welcome back! We are pleased to inform you that your GST.AI account has been successfully reactivated. 
         <br>
         <br>
         Your new password for login on GST.AI is:  <strong> ${password} </strong>
        <br>
        <br>
        If you have any questions or need assistance, feel free to  contact<a href="mailto:gstsupport@airindia.com">gstsupport@airindia.com </a>our support team.
        <br>
        <br>
        Thank you for choosing Air India! 
        `;
    let title = 'ACCOUNT REACTIVATED ';
    const template = {
      '[[Name]]': name,
      '[[title]]': title,
      '[[content]]': content,
      '[[Email]]': email,
      '[[regards]]': 'Regards,',
    };

    const updatedHTML = await modifyHTMLTemplate(template, htmlData);
    const transporter = nodemailer.createTransport(mailConfig);

    const mailOptions = {
      from: 'noreply@airindia.com',
      to: email,
      subject: `Welcome back! Your GST.AI account has been reactivated successfully`,
      html: updatedHTML,
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(`Error sending email User: ${error}`);
  }
};

const rejectUser = async (reason, email, name) => {
  try {
    const templatePath = path.join(process.cwd(), 'mail-templates', 'common.template.html');
    const htmlData = fs.readFileSync(templatePath, 'utf-8');

    let content = `
    We regret to inform you that your request for a GST.AI account has been rejected. 

        <br>
        <br>
        <strong>Reason for Rejection:
        <br>
        <u>${reason}</u> </strong>
        <br>
        <br>
        If you have any queries or need further assistance, please reach out to <a href="mailto:gstsupport@airindia.com">gstsupport@airindia.com </a>our support team.
        `;

    let title = 'ACCOUNT REJECTED';
    const template = {
      '[[Name]]': name,
      '[[title]]': title,
      '[[content]]': content,
      '[[Email]]': email,
      '[[regards]]': 'Regards,',
    };

    const updatedHTML = await modifyHTMLTemplate(template, htmlData);
    const transporter = nodemailer.createTransport(mailConfig);

    const mailOptions = {
      from: 'noreply@airindia.com',
      to: email,
      subject: `Air India Account on GST.AI rejection notice`,
      html: updatedHTML,
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(`Error sending email User: ${error}`);
  }
};

const accountActivationRequest = async (adminEmail, userEmail, name) => {
  try {
    const templatePath = path.join(process.cwd(), 'mail-templates', 'common.template.html');
    const htmlData = fs.readFileSync(templatePath, 'utf-8');

    let content = `Air India portal user with the email address ${userEmail} is awaiting account activation or unblocking. Please take the necessary action.`;
    let title = 'Account Activation Request';
    const template = {
      '[[Name]]': name,
      '[[title]]': title,
      '[[content]]': content,
      '[[Email]]': adminEmail,
      '[[regards]]': 'Sincerely',
    };

    const updatedHTML = await modifyHTMLTemplate(template, htmlData);
    const transporter = nodemailer.createTransport(mailConfig);

    const mailOptions = {
      from: 'noreply@airindia.com',
      to: adminEmail,
      subject: `Account Activation Request`,
      html: updatedHTML,
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(`Error sending email User: ${error}`);
  }
};

const forgotPassword = async (email, token, name) => {
  try {
    const templatePath = path.join(process.cwd(), 'mail-templates', 'common.template.html');
    const htmlData = fs.readFileSync(templatePath, 'utf-8');

    let content = `Please click <a href="${process.env.PORTAL_URL}/portal/index.html#/ForgotPassword/${token}">here</a>to reset your password. 
        <br>
        <br>
        If you did not request a password reset, please ignore this email. `;
    let title = 'PASSWORD RESET';
    const template = {
      '[[Name]]': name,
      '[[title]]': title,
      '[[content]]': content,
      '[[Email]]': email,
      '[[regards]]': 'Regards,',
    };

    const updatedHTML = await modifyHTMLTemplate(template, htmlData);
    const transporter = nodemailer.createTransport(mailConfig);

    const mailOptions = {
      from: 'noreply@airindia.com',
      to: email,
      subject: `GST.AI password reset `,
      html: updatedHTML,
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(`Error sending email User: ${error}`);
  }
};

const iniatedMail = async (email, name) => {
  try {
    const templatePath = path.join(process.cwd(), 'mail-templates', 'common.template.html');
    const htmlData = fs.readFileSync(templatePath, 'utf-8');

    let content = `Your profile creation has been initiated and is awaiting approval.`;
    let title = 'PROFILE APPROVAL'    ;
    const template = {
      '[[Name]]': name,
      '[[title]]': title,
      '[[content]]': content,
      '[[Email]]': email,
      '[[regards]]': 'Regards',
    };

    const updatedHTML = await modifyHTMLTemplate(template, htmlData);
    const transporter = nodemailer.createTransport(mailConfig);

    const mailOptions = {
      from: 'noreply@airindia.com',
      to: email,
      subject: `Your profile approval on GST.AI is in progress  
      `,
      html: updatedHTML,
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(`Error sending email User: ${error}`);
  }
};

const invoicePdf = async (email, invoiceNumber, pdfBuffer) => {
  try {
    const templatePath = path.join(process.cwd(), 'mail-templates', 'common.template.html');
    const htmlData = fs.readFileSync(templatePath, 'utf-8');

    let content = `<p>Please find attached the invoice for the services rendered. If you have any questions or concerns, feel free to contact us.</p>
        <p>Thank you for choosing us!</p>`;
    let title = 'Your Invoice';
    const template = {
      '[[Name]]': 'Customer',
      '[[title]]': title,
      '[[content]]': content,
      '[[Email]]': email,
      '[[regards]]': 'Best regards',
    };

    const updatedHTML = await modifyHTMLTemplate(template, htmlData);
    const transporter = nodemailer.createTransport(mailConfig);

    const mailOptions = {
      from: 'noreply@airindia.com',
      to: email,
      subject: `Invoice`,
      html: updatedHTML,
      attachments: [
        {
          filename: `${invoiceNumber}.pdf`, // Filename to be attached
          content: pdfBuffer, // PDF buffer to be attached
          contentType: 'application/pdf', // Content type of the attachment
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(`Error sending email User: ${error}`);
  }
};

const newCompanyReg = async (email, name,region) => {
  try {
    const templatePath = path.join(process.cwd(), 'mail-templates', 'common.template.html');
    const htmlData = fs.readFileSync(templatePath, 'utf-8');

    let content = `Received a new company registration for Air India portal from ${region} region. Please login to take action`;
    let title = 'New Company Registration';
    const template = {
      '[[Name]]': name,
      '[[title]]': title,
      '[[content]]': content,
      '[[Email]]': email,
      '[[regards]]': 'Sincerely',
    };

    const updatedHTML = await modifyHTMLTemplate(template, htmlData);
    const transporter = nodemailer.createTransport(mailConfig);

    const mailOptions = {
      from: 'noreply@airindia.com',
      to: email,
      subject: `New Company Registration`,
      html: updatedHTML,
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(`Error sending email User: ${error}`);
  }
};

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
  const stage = process.env.ENV_STAGE ?? 'DEV';
  try {
    if (stage == 'PROD') {
      return {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        username: process.env.SMTP_USER,
        password: decrypter(process.env.SMTP_PASS),
      };
    } else {
      return {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        username: process.env.SMTP_USER,
        password: process.env.SMTP_PASS,
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

module.exports = {
  invoicePdf,
  userLoginMailTemplate,
  userRegisterMailTemplate,
  userWelcomeMailTemplate,
  newUserRegistration,
  blockUser,
  unBlockUser,
  activateUser,
  rejectUser,
  accountActivationRequest,
  forgotPassword,
  iniatedMail,
  newCompanyReg,
};