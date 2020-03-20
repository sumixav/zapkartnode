const { to, ReE, ReS } = require("../../services/util.service");
const { status_codes_msg } = require("../../utils/appStatics");
const parseStrings = require("parse-strings-in-object");
const Logger= require("../../logger")

const businessLocationService = require("../../services/businessLocation.service");

module.exports.getbusinessLocation = async(req, res, next) => {
  const {id} = req.params
  try {
    [err, businessLocation] = await to(businessLocationService.getbusinessLocation(id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (businessLocation) {
      return ReS(
        res,
        { message: "Business Location", data: businessLocation },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.getAllbusinessLocations = async(req, res, next) => {
  
  try {
    [err, businessLocation] = await to(businessLocationService.getAllbusinessLocations());
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (businessLocation) {
      return ReS(
        res,
        { message: "Business Location List", data: businessLocation },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.getAllbusinessLocations = async(req, res, next) => {
  const {id} = req.params
  try {
    [err, businessLocation] = await to(businessLocationService.deletebusinessLocations(id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (businessLocation) {
      return ReS(
        res,
        { message: "Business Location Deleted", data: businessLocation },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.restorebusinessLocation = async(req, res, next) => {
  const {id} = req.params
  try {
    [err, businessLocation] = await to(businessLocationService.restorebusinessLocation(id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (businessLocation) {
      return ReS(
        res,
        { message: "Restored product to businessLocation", data: businessLocation },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.createbusinessLocation = async(req, res, next) => {
  const param = req.body
  try {
    [err, businessLocation] = await to(businessLocationService.createbusinessLocation(param));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (businessLocation) {
      return ReS(
        res,
        { message: "Business Location created", data: businessLocation },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.editbusinessLocations = async(req, res, next) => {
  const {id} = req.params;
  const param = req.body
  try {
    [err, businessLocation] = await to(businessLocationService.editbusinessLocations(param, id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (businessLocation) {
      return ReS(
        res,
        { message: "Business Location updated", data: businessLocation },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

const getbusinessLocation = async function(req, res) {
  try {
    let id = req.user.id;
    [err, businessLocationlist] = await to(businessLocationService.getbusinessLocation(id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (businessLocationlist) {
      return ReS(
        res,
        { message: "businessLocationlist", businessLocationlistDetails: businessLocationlist },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.getbusinessLocation = getbusinessLocation;

const updatebusinessLocation = async function(req, res) {
  let id = req.params.id;

  try {
    [err, businessLocationlist] = await to(businessLocationService.updatebusinessLocation(id, req.body));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (businessLocationlist) {
      return ReS(
        res,
        { message: "businessLocation has been updated", businessLocationlistDetails: businessLocationlist },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.updatebusinessLocation = updatebusinessLocation;

const deletebusinessLocation = async function(req, res) {
  let id = req.params.id;

  try {
    [err, businessLocationlist] = await to(businessLocationService.deletebusinessLocation(id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (businessLocationlist) {
      return ReS(
        res,
        { message: "businessLocation has been deleted", businessLocationlistDetails: businessLocationlist },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.deletebusinessLocation = deletebusinessLocation;
