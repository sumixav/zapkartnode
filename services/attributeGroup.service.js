"use strict";

const validator = require("validator");
const {
  to,
  TE,
  ReE,
  ReS,
  getIdQuery,
  isValidId
} = require("../services/util.service");
const mongoose = require("mongoose");
const Logger = require("../logger");
const Attributes = require("../models/attribute");
const AttributesValues = require("../models/attributesValue");
const cleanDeep = require("clean-deep");
//use parse-strings-in-object

exports.createAttributeGroup = async param => {
  const {
    name,
    values,
    status
    // attribute_group_code
  } = param;
  Logger.info(name, values);

  const result = await Attributes.findOne({ name: name, deleted: false });
  if (result) throw new Error("Attribute with same name already exists");

  const attributeId = new mongoose.Types.ObjectId();
  const attribute_values = values.map(value => {
    Logger.info(value);
    const attributeValue = new AttributesValues({
      // _id: new mongoose.Types.ObjectId,
      attributeId,
      value: value
    });
    return attributeValue;
  });
  Logger.info(attribute_values);
  const attribute_group = new Attributes({
    _id: attributeId,
    name,
    status,
    // attribute_group_code,
    values: attribute_values.map(a => {
      Logger.info(a._id);
      return a._id;
    })
    // values : attribute_values
  });

  const err = attribute_group.validateSync();
  if (err) {
    throw new Error(err);
  }
  // const result = await Attributes.findOne({ name: name });

  //Attributes.findOne({ name: name }).then(result => {
  // if (!result) {

  const a = await Promise.all(attribute_values.map(val => val.save()));
  Logger.info(a);
  const b = await attribute_group.save();
  if (a) {
    const c = await Attributes.findById(b._id)
      .populate("values")
      .exec();
    return c;
  }

  // } else {
  //     throw new Error('Attribute with same name already exists')

  // }
};

exports.getAllAttributeGroups = async query => {
  // throw new Error('hi error')
  let dbQuery = { deleted: false };
  let sortQuery = { updatedAt: -1 };
  Logger.info(query);
  if (query) {
    if (query.all === true || query.all === "true") {
      dbQuery = {};
    }
    if (query.status) dbQuery = { ...dbQuery, status: query.status };
  }
  if (query.sort) {
    sortQuery = { [query.sort]: -1 };
  }
  Logger.info(sortQuery);
  const attributes = await Attributes.find(dbQuery)
    .sort(sortQuery)
    .populate("values");
  if (!attributes || attributes.length === 0) {
    const err = new Error("No attributes");
    throw err;
  }
  return attributes;
};

exports.deleteAttributeGroupOld = async id => {
  Logger.info(id);
  const data = await Attributes.findOne({ _id: id });
  if (!data) throw new Error("Invalid ID");
  if (data.deleted) throw new Error("Resource does not exist");
  const softDeleteUpdate = await Attributes.update(
    { _id: id, deleted: false },
    { $set: { deleted: true } }
  );
  Logger.info("softDeleteUpdate", softDeleteUpdate);
  if (softDeleteUpdate.ok === 1 && softDeleteUpdate.nModified === 1)
    return true;
  throw new Error("Update failed");
};

exports.deleteAttributeGroup = async id => {
  Logger.info(id);
  const softDeleteUpdate = await Attributes.findOneAndUpdate(
    { _id: id, deleted: false },
    { $set: { deleted: true } }
  );
  Logger.info("softDeleteUpdate", softDeleteUpdate);
  if (!softDeleteUpdate) throw new Error("Resource does not exist");
  return true;
};

exports.restoreAttributeGroup = async id => {
  const restoredData = await Attributes.findOneAndUpdate(
    { _id: id, deleted: true },
    { $set: { deleted: false } }
  );
  if (!restoredData) throw new Error("Resource does not exist");
  return restoredData;
};

exports.getAttributeDetails = async id => {
  const query = getIdQuery(id, "attribute_group_code");
  const attribute = await Attributes.find({
    ...query,
    deleted: false
  }).populate("values");
  if (!attribute || attribute.length === 0)
    throw new Error("Attribute does not exist");
  return attribute[0];
};

exports.editAttributeGroup = async (params, attributeGroupId, query) => {
  const {
    name,
    editedValues,
    deletedValues,
    newValues,
    status
    // attribute_group_code
  } = params;
  Logger.info("attributeGroupId", attributeGroupId);
  try {
    if (!isValidId(attributeGroupId))
      throw new Error(`Invalid ObjectId ${attributeGroupId}`);
    // editedValues.forEach(item => !isValidId(item._id));
    const result = await Attributes.findById(attributeGroupId); //turn to await
    Logger.info(result);
    if (result) {
      if (query.status) {
        result.status = query.status;
        const m = result.save();
        return m;
      }
      const a =
        editedValues && editedValues.length > 0
          ? editedValues.map(val => {
              // val.value != null
              return AttributesValues.findOneAndUpdate(
                {
                  _id: val._id
                },
                {
                  // $set: {
                  value: val.value
                  // }
                },
                {
                  new: true
                }
              );
            })
          : [Promise.resolve(0)];

      const b =
        deletedValues && deletedValues.length > 0
          ? deletedValues.map(val => {
              // return AttributesValues.findOneAndRemove({
              return AttributesValues.findOneAndUpdate(
                { _id: val._id },
                { $set: { deleted: true } }
              );
            })
          : [Promise.resolve(0)];
      const c =
        newValues && newValues.length > 0
          ? newValues.map(val => {
              return new AttributesValues({
                attributeId: attributeGroupId,
                value: val.value
              });
              //.save()
            })
          : null;
      const d =
        c !== null && c.length > 0
          ? c.map(val => {
              return val.save();
            })
          : [Promise.resolve(0)];
      const allEdits = await Promise.all([...a, ...b, ...d]); // turn to await
      Logger.info(allEdits);
      if (name) result.name = name;
      if (status) result.status = status;
      // result.attribute_group_code = attribute_group_code;
      const err = result.validateSync();
      if (err) {
        throw new Error(err);
      }
      deletedValues &&
        deletedValues.length > 0 &&
        deletedValues.forEach(r => {
          Logger.info(r);
          return result.values.pull(r._id);
        });
      Logger.info(c);
      c != null && c.length > 0 && c.forEach(r => result.values.push(r._id));
      return result.save().then(a => {
        Logger.info(a);
        return a.populate("values").execPopulate();
      });
      // .then(a => {
      //     Attributes.findById(attributeGroupId)
      //         .populate("values")
      //         .then(a => {
      //             res.status(200).json({
      //                 message: "Edit success",
      //                 data: a
      //             });
      //         });
      // });
    } else {
      throw new Error("Invalid attribute group ID");
    }
  } catch (err) {
    throw err;
  }
};
