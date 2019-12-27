'use strict';

const validator = require('validator');
const { to, TE, ReE, ReS, getIdQuery } = require('../services/util.service');
const mongoose = require("mongoose");
const Logger = require('../logger')
const Attributes = require("../models/attribute");
const AttributesValues = require("../models/attributesValue");
//use parse-strings-in-object

exports.createAttributeGroup = async (param) => {
    const { name, values, status,
        // attribute_group_code 
    } = param
    Logger.info(name, values);
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
    const result = await Attributes.findOne({ name: name });

    //Attributes.findOne({ name: name }).then(result => {
    if (!result) {

        const a = await Promise.all(attribute_values.map(val => val.save()));
        Logger.info(a);
        const b = await attribute_group.save();
        if (a) {
            const c = await Attributes.findById(b._id)
                .populate("values")
                .exec();
            return c
        }


    } else {
        throw new Error('Attribute with same name already exists')

    }
}

exports.getAllAttributeGroups = async (query) => {
    let dbQuery = {};
    let sortQuery = { updatedAt: -1 };
    if (query) {
        if (query.status)
            dbQuery = { status: query.status };
    }
    const attributes = await Attributes.find(dbQuery).sort(sortQuery).populate('values');
    if (!attributes || attributes.length === 0) {
        const err = new Error('No attributes');
        throw err
    }
    return attributes
}

exports.getAttributeDetails = async (id) => {
    const query = getIdQuery(id, 'attribute_group_code')
    const attribute = await Attributes.find(query)
        .populate("values")

    if (!attribute || attribute.length === 0) throw new Error('Attribute does not exist')
    return attribute[0]
}

exports.editAttributeGroup = async (params, attributeGroupId) => {
    const {
        name,
        editedValues,
        deletedValues,
        newValues,
        status,
        attribute_group_code
    } = params;
    Logger.info(name);
    try {
        if (!isValidId(attributeGroupId)) throw new Error("Invalid ObjectId");
        editedValues.forEach(item => !isValidId(item._id));
        const result = await Attributes.findById(attributeGroupId); //turn to await
        Logger.info(result);
        if (result) {
            const a =
                editedValues.length > 0
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
                deletedValues.length > 0
                    ? deletedValues.map(val => {
                        return AttributesValues.findOneAndRemove({
                            _id: val._id
                        });
                    })
                    : [Promise.resolve(0)];
            const c =
                newValues.length > 0
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
            result.name = name;
            result.status = status;
            result.attribute_group_code = attribute_group_code;
            const err = result.validateSync();
            if (err) {
                throw new Error(err);
            }
            deletedValues.length > 0 &&
                deletedValues.forEach(r => {
                    Logger.info(r);
                    return result.values.pull(r._id);
                });
            Logger.info(c);
            c != null && c.length > 0 && c.forEach(r => result.values.push(r._id));
            result
                .save()
                .then(a => {
                    Logger.info(a);
                    return a;
                })
                .then(a => {
                    Attributes.findById(attributeGroupId)
                        .populate("values")
                        .then(a => {
                            res.status(200).json({
                                message: "Edit success",
                                data: a
                            });
                        });
                });
        } else {
            throw new Error("Invalid attribute group ID");
        }
    } catch (err) {
        next(err);
    }
}

