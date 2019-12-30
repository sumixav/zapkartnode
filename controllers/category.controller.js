const { to, ReE, ReS } = require('../services/util.service');
const { status_codes_msg } = require('../utils/appStatics');
const Logger = require('../logger')

const categoryService = require('../services/category.services');


exports.createCategory = async function (req, res) {
    const param = req.body
    try {
        let images = {};
        //if (!req.files || (req.files && !req.files["image"])) { const err = new Error('Image(s) required'); throw err };
        if (typeof req.files.image != 'undefined') {
        images = req.files["image"]
        //images = new Array(req.files["image"]);
            
        }
        const [err, category] = await to(categoryService.createCategory(param, images));
        if (err) { Logger.error(err); return ReE(res, err, status_codes_msg.INVALID_ENTITY.code); }
        if (category) {
            return ReS(res, { message: 'Category', data: category }
                , status_codes_msg.SUCCESS.code);
        }
    } catch (err) {
        console.error(err)
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

exports.getAllCategories = async function (req, res) {

    try {
        const [err, categories] = await to(categoryService.getAllCategories(req.query));
        if (err) { Logger.error(err); return ReE(res, err, status_codes_msg.INVALID_ENTITY.code); }
        if (categories) {
            return ReS(res, { message: 'Categories', data: categories, count: categories.length }
                , status_codes_msg.SUCCESS.code);
        }
    } catch (err) {
        console.error(err)
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

exports.getCategory = async function (req, res, next) {
    try {
        const [err, category] = await to(categoryService.getCategoryDetails(req.params.id));
        if (err) { next(err) }
        if (category) {
            return ReS(res, { message: 'Category', data: category }
                , status_codes_msg.SUCCESS.code);
        }
    } catch (error) {

        next(error)
    }
}

exports.editCategory = (params, images, deletedImages) => {

}


