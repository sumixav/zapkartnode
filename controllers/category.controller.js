const { to, ReE, ReS } = require("../services/util.service");
const { status_codes_msg } = require("../utils/appStatics");
const Logger = require("../logger/index");

const categoryService = require("../services/category.services");


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

exports.deleteCategory = async function (req, res) {
  try {
    const [err, isDeleted] = await to(
      categoryService.deleteCategory(req.params.id)
    );
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

exports.getAllCategories = async function (req, res) {
  try {
    const [err, categories] = await to(
      categoryService.getAllCategories(req.query)
    );
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (categories) {
      return ReS(
        res,
        { message: "Categories", data: categories, count: categories.length },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getCategory = async function (req, res, next) {
  try {
    const [err, category] = await to(
      categoryService.getCategoryDetails(req.params.id)
    );
    if (err) {
      next(err);
    }
    if (category) {
      return ReS(
        res,
        { message: "Category", data: category },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (error) {
    next(error);
  }
};

exports.editCategory = async (req, res, next) => {
  try {
    let params = Object.assign({}, req.body);
    // Logger.info(typeof req.files["image"])
    // throw new Error("mock error");
    if (typeof req.files !== "undefined" && req.files["image"] !== "undefined")
      params.image = req.files["image"];
    const [err, category] = await to(
      categoryService.editCategory(params, req.params.id, req.query)
    );
    if (err) {
      next(err);
    }
    if (category) {
      return ReS(
        res,
        { message: "Edited category", data: category },
        status_codes_msg.SUCCESS.code
      );
    }
    // throw new Error('Error editing!')
  } catch (error) {
    Logger.error("caught error", error);
    next(error);
  }
};
