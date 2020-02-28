const { to, ReE, ReS } = require("../services/util.service");
const { status_codes_msg } = require("../utils/appStatics");
const Logger = require("../logger");

const brandService = require("../services/brand.service");

exports.createBrand = async (req, res, next) => {
  const param = req.body;
  try {
    // if (!req.files || (req.files && !req.files["image"])) { const err = new Error('Image(s) required'); throw err };
    // if (!req.files || (req.files && !req.files["mainImage"])) { const err = new Error('Main image required'); throw err };
    let image = req.files["image"];
    Logger.info(image);
    if (image.constructor === Object) image = new Array(image);
    param.image = image;
    const [err, brand] = await to(brandService.createBrand(param));
    Logger.info(err);
    if (err) {
      throw err;
    }
    if (brand) {
      return ReS(
        res,
        { message: "Brand", data: brand },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getAllBrands = async (req, res, next) => {
  try {
    const [err, brands] = await to(brandService.getAllBrands(req.query));
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (brands) {
      return ReS(
        res,
        { message: "Brand", data: brands, count: brands.length },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getBrand = async (req, res, next) => {
  try {
    const [err, brand] = await to(brandService.getBrand(req.params.brandId));
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (brand) {
      return ReS(
        res,
        { message: "Brand", data: brand },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.editBrand = async (req, res, next) => {
  const param = req.body;
  param.brandId = req.params.brandId;
  try {
    let newImages;
    if (req.files && req.files["image"]) {
      newImages = req.files["image"];
    }
    const deletedImages = param.deletedImage;
    Logger.info(deletedImages);
    const [err, brand] = await to(
      brandService.editBrand(param, { newImages, deletedImages }, req.query)
    );
    if (err) {
      console.log("will throw error");
      throw err;
    }
    if (brand) {
      return ReS(
        res,
        { message: "Brand", data: brand },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (error) {
    console.log("caught", error);
    return next(error);
  }
};

exports.deleteBrand = async function(req, res) {
  try {
    const [err, isDeleted] = await to(brandService.deleteBrand(req.params.id));
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

exports.getBrandCategoryDetails = async function(req, res) {
  try {
    const param = req.query;
    const [err, brand] = await to(brandService.getBrandBasedCategory(param));
     Logger.info(req.body);
    if (err) throw err;
      return ReS(
        res,
        { message: brand },
        status_codes_msg.SUCCESS.code
      );
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};


