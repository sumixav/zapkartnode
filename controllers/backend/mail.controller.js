
const mailService = require('../../services/mail.service');
const { to, ReE, ReS } = require('../../services/util.service');
const { status_codes_msg } = require('../../utils/appStatics');


exports.getMailSettings = async (req, res) => {
    const [err, mailSettings] = await to(mailService.getMailSettings());
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (mailSettings) return ReS(res, { message: 'Mail Settings', data: mailSettings }
        , status_codes_msg.SUCCESS.code);
    return ReE(res, new Error("Error fetching data"), status_codes_msg.INVALID_ENTITY.code);
}

exports.editMailSettings = async (req, res) => {
    const [err, result] = await to(mailService.editMailSettings(req.body));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (result) return ReS(res, { message: 'Mail Settings edited', data:result }
        , status_codes_msg.SUCCESS.code);
    return ReE(res, new Error("Error editing data"), status_codes_msg.INVALID_ENTITY.code);
}

