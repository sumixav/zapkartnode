const { to, ReE, ReS } = require("../services/util.service");
const { status_codes_msg } = require("../utils/appStatics");
const Logger = require("../logger");

const bannerService = require("../services/banner.service");

exports.createBanner = async (req, res, next) => {
  const param = req.body;
  try {
    Logger.info(image);
    // if (image.constructor === Object) image = new Array(image);
    param.images = (req.files["image"])?image[0]:null;
    const [err, banner] = await to(bannerService.createBanner(param));
    Logger.info(err);
    if (err) {
      throw err;
    }
    if (banner) {
      return ReS(
        res,
        { message: "Banner", data: banner },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getAllBanners = async (req, res, next) => {
  try {
    const [err, banners] = await to(bannerService.getAllBanners(req.query));
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (banners) {
      return ReS(
        res,
        { message: "Banners", data: banners, count: banners.length },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getBanner = async (req, res, next) => {
  try {
    const [err, banner] = await to(bannerService.getBanner(req.params.bannerId));
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (banner) {
      return ReS(
        res,
        { message: "Banner", data: banner },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.editBanner = async (req, res, next) => {
  const param = req.body;
  param.bannerId = req.params.bannerId;
  try {
    if (typeof req.files !== "undefined" && req.files["image"] !== "undefined")
      param.images = (req.files["image"])?req.files["image"][0]:null;
      Logger.log("ttttttttttttt",param.image);
    const [err, banner] = await to(
      bannerService.editBanner(param, req.query)
    );
    if (err) {
      console.log("will throw error");
      throw err;
    }
    if (banner) {
      return ReS(
        res,
        { message: "Banner", data: banner },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (error) {
    console.log("caught", error);
    return next(error);
  }
};

exports.deleteBanner = async function(req, res) {
  try {
    const [err, isDeleted] = await to(bannerService.deleteBanner(req.params.bannerId));
    Logger.info(err, isDeleted);
    if (err) throw err;
    if (isDeleted)
      return ReS(
        res,
        { message: "Banner deleted" },
        status_codes_msg.SUCCESS.code
      );
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};
