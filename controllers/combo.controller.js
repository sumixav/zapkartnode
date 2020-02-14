const { to, ReE, ReS } = require("../services/util.service");
const { status_codes_msg } = require("../utils/appStatics");
const Logger = require("../logger");

const comboService = require("../services/combo.service");

exports.createCombo = async (req, res, next) => {
  const param = req.body;
  try {
    // if (!req.files || (req.files && !req.files["image"])) { const err = new Error('Image(s) required'); throw err };
    // if (!req.files || (req.files && !req.files["mainImage"])) { const err = new Error('Main image required'); throw err };
    let image = req.files["image"];
    Logger.info(image);
    if (image.constructor === Object) image = new Array(image);
    param.image = image;
    const [err, combo] = await to(comboService.createCombo(param));
    Logger.info(err);
    if (err) {
      throw err;
    }
    if (combo) {
      return ReS(
        res,
        { message: "Combo", data: combo },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getAllCombos = async (req, res, next) => {
  try {
    const [err, combos] = await to(comboService.getAllCombos(req.query));
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (combos) {
      return ReS(
        res,
        { message: "Combo", data: combos, count: combos.length },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getCombo = async (req, res, next) => {
  try {
    const [err, combo] = await to(comboService.getCombo(req.params.comboId));
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (combo) {
      return ReS(
        res,
        { message: "Combo", data: combo },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.editCombo = async (req, res, next) => {
  const param = req.body;
  param.comboId = req.params.comboId;
  try {
    let newImages;
    if (req.files && req.files["image"]) {
      newImages = req.files["image"];
    }
    const deletedImages = param.deletedImage;
    Logger.info(deletedImages);
    const [err, combo] = await to(
      comboService.editCombo(param, { newImages, deletedImages }, req.query)
    );
    if (err) {
      console.log("will throw error");
      throw err;
    }
    if (combo) {
      return ReS(
        res,
        { message: "Combo", data: combo },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (error) {
    console.log("caught", error);
    return next(error);
  }
};

exports.deleteCombo = async function(req, res) {
  try {
    const [err, isDeleted] = await to(comboService.deleteCombo(req.params.id));
    Logger.info(err, isDeleted);
    if (err) throw err;
    if (isDeleted)
      return ReS(
        res,
        { message: "Combo deleted" },
        status_codes_msg.SUCCESS.code
      );
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};
