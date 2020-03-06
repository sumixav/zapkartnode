
const nodemailer = require("nodemailer");
const { SMTP_HOST, SMTP_PORT,
    SMTP_USER,
    SMTP_PASS, FROM_EMAIL } = require("../config/config.js");

const smtpTransport = nodemailer.createTransport({
    // service: "gmail",
    // host: "smtp.gmail.com",
    // auth: {
    //     user: "tettaapp@gmail.com",
    //     pass: "tetta@123"
    // }

    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    }


});

module.exports.sendMail = async (email) => {
    const { to, subject, text } = email
    var mailOptions = {
        from: FROM_EMAIL,
        to: to,
        subject: subject,
        text: text
    }
    return smtpTransport.sendMail(mailOptions);

};