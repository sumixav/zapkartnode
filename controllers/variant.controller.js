const { to, ReE, ReS } = require('../services/util.service');
const { status_codes_msg } = require('../utils/appStatics');
const Logger = require('../logger')

const variantService = require('../services/variant.service');


exports.createVariant = async function (req, res) {
    const param = req.body
    try {

        if (!req.files || (req.files && !req.files["image"])) { const err = new Error('Image(s) required'); throw err };
        let images = req.files["image"]
        if (req.files.image.constructor === Object) images = new Array(req.files["image"])
        const [err,variant] = await to(variantService.createVariant(param, images));
        if (err) { return ReE(res, err, status_codes_msg.INVALID_ENTITY.code); }
        if (variant) {
            return ReS(res, { message: 'Variant', data: variant }
                , status_codes_msg.SUCCESS.code);
        }
    } catch (err) {
        console.error(err)
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};