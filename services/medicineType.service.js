"use strict";

const MedicineType = require("../models/medicineType");

const { to, deleteFile, getIdQuery } = require("../services/util.service");
const Logger = require("../logger");
const { STRINGS } = require("../utils/appStatics");
//use parse-strings-in-object

exports.getMedicineType = async id => {
  Logger.info(query);
  const medicineType = await MedicineType.find({ _id: id, deleted: false });

  if (!medicineType || medicineType.length === 0)
    throw new Error("MedicineType does not exist");
  return medicineType[0];
};

exports.createMedicineType = async param => {
  const { name } = param;

  const duplicateMedicineType = await MedicineType.find({
    name: name,
    deleted: false
  });

  if (duplicateMedicineType && duplicateMedicineType.length > 0) {
    const err = new Error(STRINGS.DUPLICATE);
    err.status = 409;
    throw err;
  }

  const newMedicineType = new MedicineType({
    name,

  });

  const newMedicineTypeDoc = await newMedicineType.save();
  return newMedicineTypeDoc;
};

/**
 * to create medicineTypes from array
 * @param {array} param ['abc','def']
 */
exports.createMedicineTypes = async param => {
  const { names } = param;

  const medicineTypeDocs = names.map(
    i =>
      new MedicineType({
        name: i
      })
  );

  const newMedicineTypeDocs = await MedicineType.insertMany(medicineTypeDocs, { ordered: false });
  Logger.info(newMedicineTypeDocs);
  return newMedicineTypeDocs;
};

exports.getAllMedicineTypees = async () => {
  let dbQuery = { deleted: false };
  let sortQuery = { updatedAt: -1 };
  // if (query.status) dbQuery = { ...dbQuery };

  const medicineTypes = await MedicineType.find(dbQuery).sort(sortQuery);
  if (!medicineTypes || medicineTypes.length === 0) {
    const err = new Error(STRINGS.NO_DATA);
    throw err;
  }
  return medicineTypes;
};

exports.getMedicineType = async id => {
  const query = getIdQuery(id);
  const medicineType = await MedicineType.find({ ...query, deleted: false });
  if (!medicineType || medicineType.length === 0)
    throw new Error(STRINGS.NOT_EXIST);
  return medicineType[0];
};

exports.deleteMedicineType = async id => {
  try {
    const a = await MedicineType.findOne({ _id: id });
    if (!a) throw new Error(STRINGS.INVALID_ID);
    if (a.deleted === true) throw new Error(STRINGS.NOT_EXIST);
    const b = await MedicineType.update({ _id: id }, { deleted: true });
    Logger.info(b);
    if (b.ok === 1 && b.nModified === 1) return true;
    return false;
  } catch (error) {
    throw error;
  }
};

exports.editMedicineType = async (params, id) => {
  Logger.info("params", params);

  // const findQuery = getIdQuery(medicineTypeId);

  const [err, medicineType] = await to(MedicineType.findOne({ _id: id }));
  if (err) throw new Error(STRINGS.DB_ERROR);
  if (!medicineType) throw new Error(STRINGS.NOT_EXIST);

  medicineType.name = params.name;

  const a = await medicineType.save();
  return a;
};

exports.createMedicineTypes = async data => {
  const medicineTypeDocs = data.map(
    i =>
      new MedicineType({
        name: i.name
      })
  );

  const newMedicineTypeDocs = await MedicineType.insertMany(medicineTypeDocs);
  Logger.info(newMedicineTypeDocs);
  return newMedicineTypeDocs;
};

exports.restoreMedicineType = async id => {
  const restoredData = await MedicineType.findOneAndUpdate(
    { _id: id, deleted: true },
    { $set: { deleted: false } }
  );
  if (!restoredData) throw new Error(STRINGS.NOT_EXIST);
  return restoredData;
};
