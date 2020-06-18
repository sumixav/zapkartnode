
const nodemailer = require("nodemailer");
const {
    // SMTP_HOST, SMTP_PORT,
    // SMTP_USER,
    // SMTP_PASS, 
    FROM_EMAIL } = require("../config/config.js");
const { to, TE } = require("../services/util.service");
const { mail_settings } = require("../auth_models");
const { STRINGS } = require("../utils/appStatics.js");

// const smtpTransport = nodemailer.createTransport({
//     // service: "gmail",
//     // host: "smtp.gmail.com",
//     // auth: {
//     //     user: "tettaapp@gmail.com",
//     //     pass: "tetta@123"
//     // }

//     host: SMTP_HOST,
//     port: SMTP_PORT,
//     secure: false, // true for 465, false for other ports
//     auth: {
//         user: SMTP_USER,
//         pass: SMTP_PASS
//     }
// });

module.exports.sendMail = async (email) => {
    [err, mailSettings] = await to(mail_settings.findOne({ order: [['id', 'DESC'], ['updatedAt', 'DESC']] }));
    if (err) TE(err.message);
    if (!mailSettings) TE("No mail settings configured");

    const smtpTransport = nodemailer.createTransport({
        // service: "gmail",
        // host: "smtp.gmail.com",
        // auth: {
        //     user: "tettaapp@gmail.com",
        //     pass: "tetta@123"
        // }

        host: mailSettings.smtpHost,
        port: mailSettings.smtpPort,
        secure: false, // true for 465, false for other ports
        greetingTimeout: mailSettings.smtpTimeout || 0,
        logger: true,
        auth: {
            user: mailSettings.smtpUsername,
            pass: mailSettings.smtpPassword
        }


    });

    const { to, subject, text } = email
    var mailOptions = {
        from: FROM_EMAIL,
        to: to,
        subject: subject,
        text: text
    }
    return smtpTransport.sendMail(mailOptions);

};

module.exports.editMailSettings = async (param) => {
    let err, mailSettings;

    [err, mailSettings] = await to(mail_settings.findOne({ order: [['id', 'DESC'], ['updatedAt', 'DESC']] }));
    if (err) TE(err.message);
    if (param.mailSecuritySetting === "null" || param.mailSecuritySetting === "none") param.mailSecuritySetting = null
        if (!mailSettings) {
            [err, mailSettings] = await to(mail_settings.create({ ...param }));
            if (err) TE(err.message);
            if (!mailSettings) TE("Error creating settings");
            return mailSettings
        }
    for (let key in param) {
        mailSettings[key] = param[key]
    }
    [err] = await to(mailSettings.save());
    if (err) TE(err.message);
    [err] = await to(mailSettings.reload());
    if (err) TE(err.message)
    return mailSettings
}

module.exports.getMailSettings = async () => {
    let err, mailSettings;
    [err, mailSettings] = await to(mail_settings.findOne({ order: [['id', 'DESC'], ['updatedAt', 'DESC']] }));
    if (err) TE(err.message);
    if (!mailSettings) TE(STRINGS.NO_DATA);
    return mailSettings
}