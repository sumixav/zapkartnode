"use strict";


const Composition = require("../models/composition");

const {
    to,
    deleteFile,
    getIdQuery,

} = require("../services/util.service");
const Logger = require("../logger");
//use parse-strings-in-object

exports.getComposition = async id => {
    const query = getIdQuery(id);
    Logger.info(query);
    const composition = await Composition.find({ ...query, deleted: false });
    //.populate("parent");

    if (!composition || composition.length === 0) throw new Error("Composition does not exist");
    return composition[0];
};

exports.createComposition = async param => {
    const {
        name,
    } = param;

    const duplicateComposition = await Composition.find({ name: name, deleted: false });

    if (duplicateComposition && duplicateComposition.length > 0) {

        const err = new Error("Composition with same name already exists");
        err.status = 409;
        throw err;
    }

    const newComposition = new Composition({
        name,
        status
    });

    const newCompositionDoc = await newComposition.save();
    return newCompositionDoc;
};

exports.getAllCompositiones = async query => {
    let dbQuery = { deleted: false };
    let sortQuery = { updatedAt: -1 };
    if (query.status) dbQuery = { ...dbQuery, status: query.status };

    const compositions = await Composition.find(dbQuery).sort(sortQuery);
    if (!compositions || compositions.length === 0) {
        const err = new Error("No compositions");
        throw err;
    }
    return compositions;
};

exports.getComposition = async id => {
    const query = getIdQuery(id);
    const composition = await Composition.find({ ...query, deleted: false });
    if (!composition || composition.length === 0) throw new Error("Composition does not exist");
    return composition[0];
};

exports.deleteComposition = async id => {
    try {
        const a = await Composition.findOne({ _id: id });
        if (!a) throw new Error("Invalid composition");
        if (a.deleted === true) throw new Error("Resource does not exist");
        const b = await Composition.update({ _id: id }, { deleted: true });
        Logger.info(b);
        if (b.ok === 1 && b.nModified === 1) return true;
        return false;
    } catch (error) {
        throw error;
    }
};

exports.editComposition = async (params, query) => {
    Logger.info("params", params);
    const { compositionId } = params;

    const findQuery = getIdQuery(compositionId);

    const [err, composition] = await to(Composition.findOne(findQuery));
    if (err) throw new Error("Database error while finding composition");
    if (!composition) throw new Error("Resource does not exist");

    composition.name = params.name;

    const a = await composition.save();
    return a

};

exports.restoreComposition = async id => {
    const restoredData = await Composition.findOneAndUpdate(
        { _id: id, deleted: true },
        { $set: { deleted: false } }
    );
    if (!restoredData) throw new Error("Resource does not exist");
    return restoredData;
};
