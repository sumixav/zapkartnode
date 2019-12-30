const { to, ReE, ReS } = require('../services/util.service');
const { status_codes_msg } = require('../utils/appStatics');
const Logger = require('../logger')

const brandService = require('../services/brand.service');

exports.createBrand = async (req, res, next) => {
    const param = req.body
    try {
        // if (!req.files || (req.files && !req.files["image"])) { const err = new Error('Image(s) required'); throw err };
        // if (!req.files || (req.files && !req.files["mainImage"])) { const err = new Error('Main image required'); throw err };
        let image = req.files["image"]
        Logger.info(image)
        if (image.constructor === Object) image = new Array(image)
        param.image = image
        const [err, brand] = await to(brandService.createBrand(param));

        if (err) { return ReE(res, err, status_codes_msg.INVALID_ENTITY.code); }
        if (brand) {
            return ReS(res, { message: 'Brand', data: brand }
                , status_codes_msg.CREATED.code);
        }
    } catch (err) {

        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
}

exports.getAllBrands = async (req, res, next) => {
    try {
        const [err, brands] = await to(brandService.getAllBrands(req.query));
        if (err) { Logger.error(err); return ReE(res, err, status_codes_msg.INVALID_ENTITY.code); }
        if (brands) {
            return ReS(res, { message: 'Brand', data: brands, count: brands.length }
                , status_codes_msg.SUCCESS.code);
        }
    } catch (err) {
        console.error(err)
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
}

exports.editBrand = async (req, res, next) => {
    const param = req.body;
    param.brandId = req.params.brandId
    try {
        let newImages;
        if (req.files && req.files["image"]);
        newImages = req.files["image"];
        const deletedImages = param.deletedImage
        Logger.info(deletedImages)
        const [err, brand] = await to(brandService.editBrand(param, { newImages, deletedImages }))
        if (err) { return ReE(res, err, status_codes_msg.INVALID_ENTITY.code); }
        if (brand) {
            return ReS(res, { message: 'Brand', data: brand }
                , status_codes_msg.SUCCESS.code);
        }
    } catch (error) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
}