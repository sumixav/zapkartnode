"use strict";

const cleanDeep = require("clean-deep");
const Information = require("../models/information");
const { to, getIdQuery } = require("../services/util.service");
const Logger = require("../logger");
const { seoModel: Seo } = require("../models/seo");
const { STRINGS } = require("../utils/appStatics");
//use parse-strings-in-object

exports.getInformation = async id => {
  const query = getIdQuery(id);
  Logger.info(query);
  const info = await Information.find({ ...query, deleted: false });
  //.populate("parent");

  if (!info || info.length === 0) throw new Error("Information does not exist");
  return info[0];
};

exports.createInformation = async param => {
  const { name, metaTitle, metaDescription, metaKeywords } = param;
  const duplicateInformation = await Information.find({
    name: name,
    deleted: false
  });

  if (duplicateInformation && duplicateInformation.length > 0) {
    const err = new Error("Duplicate Information");
    err.status = 409;
    throw err;
  }

  const seo = new Seo({
    metaTitle,
    metaDescription,
    metaKeywords
  });

  const newInformation = new Information({ ...param, seo });

  const newInformationDoc = await newInformation.save();
  return newInformationDoc;
};

exports.getAllInformations = async query => {
  let dbQuery = { deleted: false };
  let sortQuery = { updatedAt: -1 };
  if (query.status) dbQuery = { ...dbQuery, status: query.status };
  if (query.priorityOrder) dbQuery = { ...dbQuery, priorityOrder: -1 };
  if (query.sort) sortQuery = { [query.sort]: -1 };

  const infos = await Information.find(dbQuery).sort(sortQuery);
  if (!infos || infos.length === 0) {
    const err = new Error(STRINGS.NO_DATA);
    throw err;
  }
  return infos;
};

exports.getInformationDetails = async id => {
  const query = getIdQuery(id);
  const infos = await Information.find(query);
  if (!infos || infos.length === 0)
    throw new Error("Information does not exist");
  return infos[0];
};

exports.deleteInformation = async id => {
  try {
    const a = await Information.findOne({ _id: id });
    if (!a) throw new Error("Invalid Information");
    if (a.deleted === true) throw new Error("Information does not exist");
    const b = await Information.update({ _id: id }, { deleted: true });
    Logger.info(b);
    if (b.ok === 1 && b.nModified === 1) return true;
    return false;
  } catch (error) {
    throw error;
  }
};

exports.editInformation = async (params, query) => {
  Logger.info("params", params);
  const { informationId } = params;
  const findQuery = getIdQuery(informationId);

  Logger.info(findQuery)

  const [err, info] = await to(Information.findOne(findQuery));
  if (err) throw new Error("Database error while finding Information");
  if (!info) throw new Error("No such Information exists");

  if (query) {
    if (query.status) {
      info.status = query.status;
      const updated = await info.save();
      Logger.info(updated);
      return updated;
    }
  }

  const fieldsToEdit = cleanDeep({
    status: params.status,
    name: params.name,
    priorityOrder: params.priorityOrder,
    htmlContent: params.htmlContent,
    metaTitle: params.metaTitle,
    metaDescription: params.metaDescription,
    metaKeywords: params.metaKeywords,
    shortDescription: params.shortDescription
  });

  Logger.info(info);
  Logger.info(fieldsToEdit);

  Object.keys(fieldsToEdit).forEach(key => {
    Logger.info(key);
    switch (key) {
      case "metaTitle":
      case "metaDescription":
      case "metaKeywords":
        info.seo[key] = fieldsToEdit[key];
        break;
      default:
        info[key] = fieldsToEdit[key];
        break;
    }
  });

  const [errUpdate, updatedInfo] = await to(info.save());
  if (errUpdate) {
    Logger.info(errUpdate);
    throw new Error("Error while updating");
  }
  return updatedInfo;
};
