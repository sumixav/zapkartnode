const { users }             = require('../models');
const commonService         = require('../services/common.service');
const { to, ReE, ReS }      = require('../services/util.service');
const { status_codes_msg }  = require('../utils/appStatics');
const { sendMail }          = require('../services/mail.services');


const config = async function(req, res) {
    const param = req.body;
    try {
        [err, configData] = await to(commonService.configTypes());
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (configData) {
                return ReS(res, {config : configData }
                        , status_codes_msg.CREATED.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

module.exports.config = config;


