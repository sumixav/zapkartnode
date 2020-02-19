const { to, ReE, ReS } = require("../services/util.service");
const { status_codes_msg } = require("../utils/appStatics");
const Logger = require("../logger");

const informationService = require("../services/information.service");

exports.createInformation = async (req, res, next) => {
  const param = req.body;
  try {
    const [err, information] = await to(informationService.createInformation(param));
    Logger.info(err);
    if (err) {
      throw err;
    }
    if (information) {
      return ReS(
        res,
        { message: "Information", data: information },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getAllInformations = async (req, res, next) => {
  try {
    const [err, informations] = await to(informationService.getAllInformations(req.query));
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (informations) {
      return ReS(
        res,
        { message: "Information", data: informations, count: informations.length },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getInformation = async (req, res, next) => {
  try {
    const [err, information] = await to(informationService.getInformation(req.params.informationId));
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (information) {
      return ReS(
        res,
        { message: "Information", data: information },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.editInformation = async (req, res, next) => {
  const param = req.body;
  param.informationId = req.params.informationId;
  try {
    
    const [err, information] = await to(
      informationService.editInformation(param, req.query)
    );
    if (err) {
      console.log("will throw error");
      throw err;
    }
    if (information) {
      return ReS(
        res,
        { message: "Information", data: information },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (error) {
    console.log("caught", error);
    return next(error);
  }
};

exports.deleteInformation = async function(req, res) {
  try {
    const [err, isDeleted] = await to(informationService.deleteInformation(req.params.informationId));
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
