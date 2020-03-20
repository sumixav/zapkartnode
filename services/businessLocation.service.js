"use strict";

const { business_location_details: businessLocations } = require("../auth_models");

const { to, deleteFile, getIdQuery } = require("../services/util.service");
const Logger = require("../logger");
const { STRINGS } = require("../utils/appStatics");
//use parse-strings-in-object

exports.createbusinessLocation = async param => {
  const { zipcode } = param;
  const [errA, duplicate] = await to(businessLocations.findOne({ where: { zipcode } }));
  if (duplicate) TE("Business with same zipcode already exists");

  const [err, newbusinessLocationsDoc] = await to(businessLocations.create({ ...param }));

  if (err) TE(err.message);
  if (!newbusinessLocationsDoc) TE("Could not be created")
  return newbusinessLocationsDoc;
};




exports.getAllbusinessLocations = async () => {
  let dbQuery = { deleted: false };
  let sortQuery = { updatedAt: -1 };
  // if (query.status) dbQuery = { ...dbQuery };

  const [err, businessLocations] = await to(businessLocations.findAll());
  if (err) TE(err.message);
  if (!businessLocations || businessLocations.length === 0) {
    const err = new Error(STRINGS.NO_DATA);
    throw err;
  }
  return businessLocations;
};

exports.getbusinessLocation = async id => {
  const [err, businessLocation] = await to(businessLocations.findOne({ where: { id } }));
  if (err) TE(err.message)
  if (!businessLocation) TE(STRINGS.NOT_EXIST)
  return businessLocation[0];
};

exports.deletebusinessLocations = async (param, id) => {

  const [err, a] = await to(businessLocations.findOne({ where: { id } }));
  if (err) TE(err.message)
  if (!a) TE(STRINGS.INVALID_ID);
  const b = await businessLocations.destroy(param, { where: { id } });
  return b;

};

exports.editbusinessLocations = async (params, id) => {
  Logger.info("params", params);

  // const findQuery = getIdQuery(businessLocationId);

  const [err, businessLocation] = await to(businessLocations.update(params, { where: { id } }));
  if (err) TE(STRINGS.DB_ERROR);
  if (!businessLocation) TE(STRINGS.NOT_EXIST);
  return businessLocation
};

exports.restorebusinessLocation = async id => {
  const [errD, validData] = await to(businessLocations.findOne({
    where: {

      id
    },
    paranoid: false
  }))
  if (errD) TE(errD.message)
  if (!validData) TE(STRINGS.NOT_EXIST)
  if (validData.deletedAt === null) TE(STRINGS.NO_DATA_RESTORE)

  const [err, restored] = await to(validData.restore());
  Logger.info(restored)
  if (!restored) TE(STRINGS.NO_DATA_RESTORE)
  if (err) TE(STRINGS.DELETE_ERROR + ' ' + err.message);
  return restored
};
