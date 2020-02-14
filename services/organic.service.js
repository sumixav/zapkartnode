"use strict";

const Organic = require("../models/organic");

const { to, deleteFile, getIdQuery } = require("../services/util.service");
const Logger = require("../logger");
const { uniq } = require("./util.service")
//use parse-strings-in-object

exports.getOrganic = async id => {
  const query = getIdQuery(id);
  Logger.info(query);
  const organic = await Organic.find({ ...query, deleted: false });
  //.populate("parent");

  if (!organic || organic.length === 0)
    throw new Error("Organic does not exist");
  return organic[0];
};

exports.createOrganic = async param => {
  const { name } = param;

  const duplicateOrganic = await Organic.find({
    name: name,
    deleted: false
  });

  if (duplicateOrganic && duplicateOrganic.length > 0) {
    const err = new Error("Organic with same name already exists");
    err.status = 409;
    throw err;
  }

  const newOrganic = new Organic({
    name,
    // status
  });

  const newOrganicDoc = await newOrganic.save();
  return newOrganicDoc;
};

/**
 * to add organics from name if already exists, return existing)
 * @param {array} values ['abc', id, 'abc', 'acd']
 */
exports.addOrganics = async values => {
  const newOrganics = uniq(values);

  Logger.info("newOrganics raw", newOrganics);
  let [errExistComp, existingCompDocs = []] = await to(
    this.findOrganicsFromNames({ names: newOrganics })
  );
  Logger.info("existingCompDocs", existingCompDocs);
  let [errNewComp, newOrganicsDocs = []] = await to(
    this.createOrganics({ names: newOrganics })
  );
  Logger.info("newOrganicdocs", newOrganicsDocs);
  if (errExistComp || errNewComp) {
    Logger.error("error adding new comps");
  }
  return [
    ...existingCompDocs.map(i => i._doc),
    ...newOrganicsDocs.map(i => i._doc)
  ];
};

/**
 * to create organics from array
 * @param {array} param ['abc','def']
 */
exports.createOrganics = async param => {
  const { names } = param;

  const organicDocs = names.map(
    i =>
      new Organic({
        name: i.toLowerCase()
      })
  );

  const newOrganicDocs = await Organic.insertMany(organicDocs, {
    ordered: false
  });
  Logger.info(newOrganicDocs);
  return newOrganicDocs;
};

/**
 * to get organics from name
 * @param {string} param 'abc'
 */
exports.findOrganicsFromNames = async param => {
  const { names } = param;
  Logger.info(names);
  const newOrganicDocs = await Organic.find({
    name: { $in: names.map(i => i.toLowerCase()) }
  });
  Logger.info(newOrganicDocs);
  return newOrganicDocs;
};

exports.getAllOrganices = async query => {
  let dbQuery = { deleted: false };
  let sortQuery = { updatedAt: -1 };
  if (query.status) dbQuery = { ...dbQuery, status: query.status };

  const organics = await Organic.find(dbQuery).sort(sortQuery);
  if (!organics || organics.length === 0) {
    const err = new Error("No organics");
    throw err;
  }
  return organics;
};

exports.getOrganic = async id => {
  const query = getIdQuery(id);
  const organic = await Organic.find({ ...query, deleted: false });
  if (!organic || organic.length === 0)
    throw new Error("Organic does not exist");
  return organic[0];
};

exports.deleteOrganic = async id => {
  try {
    const a = await Organic.findOne({ _id: id });
    if (!a) throw new Error("Invalid organic");
    if (a.deleted === true) throw new Error("Resource does not exist");
    const b = await Organic.update({ _id: id }, { deleted: true });
    Logger.info(b);
    if (b.ok === 1 && b.nModified === 1) return true;
    return false;
  } catch (error) {
    throw error;
  }
};

exports.editOrganic = async (params, query) => {
  Logger.info("params", params);
  const { organicId } = params;

  const findQuery = getIdQuery(organicId);

  const [err, organic] = await to(Organic.findOne(findQuery));
  if (err) throw new Error("Database error while finding organic");
  if (!organic) throw new Error("Resource does not exist");

  organic.name = params.name;

  const a = await organic.save();
  return a;
};

exports.restoreOrganic = async id => {
  const restoredData = await Organic.findOneAndUpdate(
    { _id: id, deleted: true },
    { $set: { deleted: false } }
  );
  if (!restoredData) throw new Error("Resource does not exist");
  return restoredData;
};
