const { to, ReE, ReS } = require('../services/util.service');
const { status_codes_msg } = require('../utils/appStatics');
const Logger = require('../logger')

const variantService = require('../services/variant.service');


exports.createVariant = async function (req, res) {
    const param = req.body
    try {
        
        const [err,variant] = await to(variantService.createVariant(param));
        if (err) { Logger.error(err); return ReE(res, err, status_codes_msg.INVALID_ENTITY.code); }
        if (variant) {
            return ReS(res, { message: 'Variant', data: variant }
                , status_codes_msg.SUCCESS.code);
        }
    } catch (err) {
        console.error(err)
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

exports.getAllVariant = async (req, res, next) => {
    
    try {
        const [err, variants] = await to(variantService.getAllVariants(req.query));
        if (err) { Logger.error(err); return ReE(res, err, status_codes_msg.INVALID_ENTITY.code); }
        if (variants) {
            return ReS(res, { message: 'Variant', data: variants, count: variants.length }
                , status_codes_msg.SUCCESS.code);
        }
    } catch (err) {
        console.error(err)
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
}