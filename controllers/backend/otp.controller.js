const { users } = require('../../auth_models');
const otpService = require('../../services/otp.service');
const { to, ReE, ReS } = require('../../services/util.service');
const { status_codes_msg } = require('../../utils/appStatics');
const { STRINGS } = require("../../utils/appStatics")
const Logger = require("../../logger");
const omit = require('lodash/omit')
const parseStrings = require('parse-strings-in-object')



exports.generateOtp = async (req, res) => {
    const userId = req.user.id;
    const phone = req.body.phone
    const [err, otpResult] = await to(otpService.generateOtp({phone, userId}));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (otpResult) return ReS(res, { message: 'OTP sent', otp: otpResult.otp }
        , status_codes_msg.SUCCESS.code);
    return ReE(res, new Error("Error sending OTP"), status_codes_msg.INVALID_ENTITY.code);
}

exports.verifyOtp = async (req, res) => {
    const userId = req.user.id;
    const phone = req.body.phone
    const otp = req.body.otp
    const [err, result] = await to(otpService.verifyOtp({phone, userId, otp}));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (result) return ReS(res, { message: 'Phone verification successful' }
        , status_codes_msg.SUCCESS.code);
    return ReE(res, new Error("Error sending OTP"), status_codes_msg.INVALID_ENTITY.code);
}

