const { to, ReE, ReS } = require("../../services/util.service");
const { status_codes_msg } = require("../../utils/appStatics");
const parseStrings = require("parse-strings-in-object");
const Logger= require("../../logger")

const shippingRateService = require("../../services/shippingRate.service");

module.exports.getshippingRate = async(req, res, next) => {
  const {id} = req.params
  try {
    [err, shippingRate] = await to(shippingRateService.getshippingRate(id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (shippingRate) {
      return ReS(
        res,
        { message: "Shipping Rate", data: shippingRate },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.getAllShippingRates = async(req, res, next) => {
  
  try {
    [err, shippingRate] = await to(shippingRateService.getAllShippingRates());
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (shippingRate) {
      return ReS(
        res,
        { message: "Shipping Rate List", data: shippingRate },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.getAllShippingRates = async(req, res, next) => {
  const {id} = req.params
  try {
    [err, shippingRate] = await to(shippingRateService.deleteshippingRates(id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (shippingRate) {
      return ReS(
        res,
        { message: "Shipping Rate Deleted", data: shippingRate },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.restoreShippingRate = async(req, res, next) => {
  const {id} = req.params
  try {
    [err, shippingRate] = await to(shippingRateService.restoreShippingRate(id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (shippingRate) {
      return ReS(
        res,
        { message: "Restored product to shippingRate", data: shippingRate },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.createshippingRate = async(req, res, next) => {
  const param = req.body
  try {
    [err, shippingRate] = await to(shippingRateService.createshippingRate(param));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (shippingRate) {
      return ReS(
        res,
        { message: "Shipping rate created", data: shippingRate },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.editshippingRates = async(req, res, next) => {
  const {id} = req.params;
  const param = req.body
  try {
    [err, shippingRate] = await to(shippingRateService.editshippingRates(param, id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (shippingRate) {
      return ReS(
        res,
        { message: "Shipping rate updated", data: shippingRate },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

const getshippingRate = async function(req, res) {
  try {
    let id = req.user.id;
    [err, shippingRatelist] = await to(shippingRateService.getshippingRate(id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (shippingRatelist) {
      return ReS(
        res,
        { message: "shippingRatelist", shippingRatelistDetails: shippingRatelist },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.getshippingRate = getshippingRate;

const updateshippingRate = async function(req, res) {
  let id = req.params.id;

  try {
    [err, shippingRatelist] = await to(shippingRateService.updateshippingRate(id, req.body));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (shippingRatelist) {
      return ReS(
        res,
        { message: "shippingRate has been updated", shippingRatelistDetails: shippingRatelist },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.updateshippingRate = updateshippingRate;

const deleteshippingRate = async function(req, res) {
  let id = req.params.id;

  try {
    [err, shippingRatelist] = await to(shippingRateService.deleteshippingRate(id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (shippingRatelist) {
      return ReS(
        res,
        { message: "shippingRate has been deleted", shippingRatelistDetails: shippingRatelist },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.deleteshippingRate = deleteshippingRate;
