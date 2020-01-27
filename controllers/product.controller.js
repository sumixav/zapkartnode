const { to, ReE, ReS } = require("../services/util.service");
const { status_codes_msg } = require("../utils/appStatics");
const Logger = require("../logger");
const { STRINGS } = require("../utils/appStatics")

const productService = require("../services/product.service");

exports.createProduct = async (req, res, next) => {
    const param = req.body;
    try {
        let image = req.files["image"];
        Logger.info(image);
        // if (image.constructor === Object) image = new Array(image);
        param.images = image;
        if (typeof param.parentId !== 'undefined' && param.parentId !== "null" && param.parentId !== null) {
            const [err, isValid] = await to(productService.isParentIdValid(param.parentId));
            if (err) throw new Error(err.message);
            if (!isValid) throw new Error(STRINGS.INVALID_PARENTID)
        }
        const [err, product] = await to(productService.createProduct(param));
        Logger.info(err);
        if (err) {
            throw err;
        }
        if (product) {
            return ReS(
                res,
                { message: "Product", data: product },
                status_codes_msg.CREATED.code
            );
        }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

exports.getAllProducts = async (req, res, next) => {
    try {
        const [err, products] = await to(productService.getAllProducts(req.query));
        if (err) {
            return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
        }
        if (products) {
            return ReS(
                res,
                { message: "Product", data: products, count: products.length },
                status_codes_msg.SUCCESS.code
            );
        }
    } catch (err) {
        console.error(err);
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

exports.getProduct = async (req, res, next) => {
    try {
        const [err, product] = await to(productService.getProduct(req.params.productId));
        if (err) {
            return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
        }
        if (product) {
            return ReS(
                res,
                { message: "Product", data: product },
                status_codes_msg.SUCCESS.code
            );
        }
    } catch (err) {
        console.error(err);
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

exports.editProduct = async (req, res, next) => {
    const param = req.body;

    param.productId = req.params.productId;
    try {
        let newImages;
        if (req.files && req.files["image"]) {
            newImages = req.files["image"];
            param.images = newImages;
        }
        Logger.info(newImages)
        
        // param.deletedImages = deletedImages
        const [err, product] = await to(
            productService.editProduct(param, req.query)
        );
        if (err) {
            console.log("will throw error");
            throw err;
        }
        if (product) {
            return ReS(
                res,
                { message: "Product", data: product },
                status_codes_msg.SUCCESS.code
            );
        }
    } catch (error) {
        // console.log("caught", error);
        return next(error);
    }
};

exports.deleteProduct = async function (req, res) {
    try {
        const [err, isDeleted] = await to(productService.deleteProduct(req.params.id));
        Logger.info(err, isDeleted);
        if (err) throw err;
        if (isDeleted)
            return ReS(
                res,
                { message: "Category deleted" },
                status_codes_msg.SUCCESS.code
            );
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};
