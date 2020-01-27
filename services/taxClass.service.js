"use strict";

const cleanDeep = require("clean-deep");
const TaxClass = require("../models/taxClass");
const validator = require("validator");
const {
  to,
  getIdQuery,
} = require("../services/util.service");
const Logger = require("../logger");
//use parse-strings-in-object

exports.getTaxClass = async id => {
  const query = getIdQuery(id);
  Logger.info(query);
  const taxClass = await TaxClass.find({ ...query, deleted: false });
  //.populate("parent");

  if (!taxClass || taxClass.length === 0) throw new Error("TaxClass does not exist");
  return taxClass[0];
};

exports.createTaxClass = async param => {
  const {
    name,
    status,
  } = param;

  const duplicateTaxClass = await TaxClass.find({ name: name, deleted: false });

  if (duplicateTaxClass && duplicateTaxClass.length > 0) {

    const err = new Error("Tax class with same name already exists");
    err.status = 409;
    throw err;
  }

  const newTaxClass = new TaxClass({
    name,
    status
  });

  const newTaxClassDoc = await newTaxClass.save();
  return newTaxClassDoc;
};

exports.getAllTaxClasses = async query => {
  let dbQuery = { deleted: false };
  let sortQuery = { updatedAt: -1 };
  if (query.status) dbQuery = { ...dbQuery, status: query.status };

  const taxClasss = await TaxClass.find(dbQuery).sort(sortQuery);
  if (!taxClasss || taxClasss.length === 0) {
    const err = new Error("No taxClasss");
    throw err;
  }
  return taxClasss;
};

exports.getTaxClass = async id => {
  const query = getIdQuery(id);
  const taxClass = await TaxClass.find({ ...query, deleted: false });
  if (!taxClass || taxClass.length === 0) throw new Error("TaxClass does not exist");
  return taxClass[0];
};

exports.deleteTaxClass = async id => {
  try {
    const a = await TaxClass.findOne({ _id: id });
    if (!a) throw new Error("Invalid taxClass");
    if (a.deleted === true) throw new Error("Resource does not exist");
    const b = await TaxClass.update({ _id: id }, { deleted: true });
    Logger.info(b);
    if (b.ok === 1 && b.nModified === 1) return true;
    return false;
  } catch (error) {
    throw error;
  }
};

exports.editTaxClass = async (params, query) => {
  Logger.info("params", params);
  const { taxClassId } = params;
  
  const findQuery = getIdQuery(taxClassId);

  const [err, taxClass] = await to(TaxClass.findOne(findQuery));
  if (err) throw new Error("Database error while finding tax class");
  if (!taxClass) throw new Error("Resource does not exist");

  if (query) {
    if (query.status) {
      taxClass.status = query.status;
      const updated = await taxClass.save();
      Logger.info(updated);
      return updated;
    }
  }

  taxClass.status = params.status;
  taxClass.name = params.name;

  const a = await taxClass.save();
  return a

};


exports.restoreTaxClass = async id => {
  const restoredData = await TaxClass.findOneAndUpdate(
    { _id: id, deleted: true },
    { $set: { deleted: false } }
  );
  if (!restoredData) throw new Error("Resource does not exist");
  return restoredData;
};
