const { to, ReE, ReS }  = require('../services/util.service');
const { status_codes_msg }  = require('../utils/appStatics');
const tipService       = require('../services/tip.service');

const getTipDetail = async function(req, res) {
    try {
        
        [err, tiplist] = await to(tipService.getTipDetails(req.user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (tiplist) {
                return ReS(res, { message:'tiplist', tiplist : tiplist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

module.exports.getTipDetail = getTipDetail;