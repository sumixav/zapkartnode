"use strict";

const { shipping_rates: shippingRates, business_location_details: businessLocations } = require("../auth_models");

const { to, deleteFile, getIdQuery } = require("../services/util.service");
const Logger = require("../logger");
const { STRINGS } = require("../utils/appStatics");
//use parse-strings-in-object

exports.createshippingRate = async param => {
  const {bussnessLocationDetailId} = param;

  const [errC, validBusinessLocId] = await to(businessLocations.findOne({where:{id:bussnessLocationDetailId}}));
  if (errC) TE(errC);
  if (!validBusinessLocId) TE("Invalid business location ID")

  const [errB, duplicate] = await to(shippingRates.findOne({where:{bussnessLocationDetailId}}));
  if (errB) TE(errB.message)
  if (duplicate) TE("Shipping rate for same business lication ID already exists")

  const [err, newshippingRatesDoc] = await to(shippingRates.create({ ...param }));
  if (err) TE(err.message);
  if (!newshippingRatesDoc) TE("Could not be created");
    return newshippingRatesDoc;
};


exports.getAllShippingRates = async () => {
  let dbQuery = { deleted: false };
  let sortQuery = { updatedAt: -1 };
  // if (query.status) dbQuery = { ...dbQuery };

  const [err, shippingRates] = await to(shippingRates.findAll());
  if (err) TE(err.message);
  if (!shippingRates || shippingRates.length === 0) {
    const err = new Error(STRINGS.NO_DATA);
    throw err;
  }
  return shippingRates;
};

exports.getShippingRate = async id => {
  const [err, shippingRate] = await to(shippingRates.findOne({ where: { id } }));
  if (err) TE(err.message)
  if (!shippingRate) TE(STRINGS.NOT_EXIST)
  return shippingRate[0];
};

exports.deleteshippingRates = async (param, id) => {

  const [err, a] = await to(shippingRates.findOne({ where: { id } }));
  if (err) TE(err.message)
  if (!a) TE(STRINGS.INVALID_ID);
  const b = await shippingRates.destroy(param, { where: { id } });
  return b;

};

exports.editshippingRates = async (params, id) => {
  Logger.info("params", params);

  // const findQuery = getIdQuery(shippingRateId);

  const [err, shippingRate] = await to(shippingRates.update(params, { where: { id } }));
  if (err) TE(STRINGS.DB_ERROR);
  if (!shippingRate) TE(STRINGS.NOT_EXIST);
  return shippingRate
};

exports.restoreShippingRate = async id => {
  const [errD, validData] = await to(shippingRates.findOne({
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
