/* eslint-disable camelcase */
const { to, ReE, ReS } = require("../services/util.service");
const { status_codes_msg } = require("../utils/appStatics");
const Logger = require("../logger");

const organicService = require("../services/organic.service");

exports.createOrganic = async (req, res, next) => {
  const param = req.body;
  
  try {
    const [err, organic] = await to(organicService.createOrganic(param));
    Logger.info(err);
    if (err) {
      throw err;
    }
    if (organic) {
      return ReS(
        res,
        { message: "Organic", data: organic },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getAllOrganics = async (req, res, next) => {
  try {
    const [err, organics] = await to(organicService.getAllOrganices(req.query));
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (organics) {
      return ReS(
        res,
        { message: "Organic", data: organics, count: organics.length },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getOrganic = async (req, res, next) => {
  try {
    const [err, organic] = await to(
      organicService.getOrganic(req.params.organicId)
    );
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (organic) {
      return ReS(
        res,
        { message: "Organic", data: organic },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.editOrganic = async (req, res, next) => {
  const param = req.body;
  param.organicId = req.params.organicId;
  try {
    const [err, organic] = await to(
      organicService.editOrganic(param, req.query)
    );
    if (err) {
      console.log("will throw error");
      throw err;
    }
    if (organic) {
      return ReS(
        res,
        { message: "Organic", data: organic },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (error) {
    console.log("caught", error);
    return next(error);
  }
};

exports.deleteOrganic = async function(req, res) {
  try {
    const [err, isDeleted] = await to(
      organicService.deleteOrganic(req.params.organicId)
    );
    Logger.info(err, isDeleted);
    if (err) throw err;
    if (isDeleted) {
      return ReS(
        res,
        { message: "organic deleted" },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.restoreOrganic = async function(req, res) {
  try {
    const [err, data] = await to(
      organicService.restoreOrganic(req.params.organicId)
    );
    Logger.info(err, data);
    if (err) throw err;
    if (data) {
      return ReS(
        res,
        { message: "organic restored", data },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};
