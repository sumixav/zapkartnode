const { to, ReE, ReS } = require('../services/util.service');
const { status_codes_msg } = require('../utils/appStatics');
const Logger = require('../logger')

const productService = require('../services/product.services');

exports.createProduct = async (req, res, next) => {
    const param = req.body
    try {

        // if (!req.files || (req.files && !req.files["image"])) { const err = new Error('Image(s) required'); throw err };
        // if (!req.files || (req.files && !req.files["mainImage"])) { const err = new Error('Main image required'); throw err };
        let images = req.files["image"]
        let mainImage = req.files["mainImage"]
        if (req.files["image"].constructor === Object) images = new Array(req.files["image"])
        if (req.files["mainImage"].constructor === Object) images = new Array(req.files["mainImage"])
        const [err, product] = await to(productService.createProduct(param, images, mainImage));

        if (err) { Logger.error(err); return ReE(res, err, status_codes_msg.INVALID_ENTITY.code); }
        if (product) {
            return ReS(res, { message: 'Product', data: product }
                , status_codes_msg.SUCCESS.code);
        }
    } catch (err) {

        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
}