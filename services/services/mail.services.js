const nodemailer = require("nodemailer");
const { to, ReE, ReS }  = require('../services/util.service');

const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: "tettaapp@gmail.com",
        pass: "tetta@123"
    }
});

module.exports.sendMail = (to, subject, text ) => {
    var mailOptions={
        to : to,
        subject : subject,
        text : text
    }
    smtpTransport.sendMail(mailOptions, (error, response) => {
        if (error) {
            console.log(error)
        } else {
            console.log('true')
            return true;
        }

    });
};