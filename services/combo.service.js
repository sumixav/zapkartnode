"use strict";

const cleanDeep = require("clean-deep");
const Combo = require("../models/combo");
const validator = require("validator");
const {
  to,
  TE,
  ReE,
  ReS,
  deleteFile,
  saveThumbnails,
  getDimensions,
  getIdQuery,
  isEmpty
} = require("../services/util.service");
const mongoose = require("mongoose");
const Logger = require("../logger");
const { imageModel: Image } = require("../models/image");
//use parse-strings-in-object


exports.createCombo = async param => {
  const {
    name,
    status,
    description,
    price,
    product,
    image: images
  } = param;

  let imagesPath = [];
  imagesPath = images.map(i => i.path);
  Logger.info(imagesPath);

  const duplicateCombo = await Combo.find({ name: name, deleted: false });

  if (duplicateCombo && duplicateCombo.length > 0) {
    imagesPath.map(i => deleteFile(i));
    const err = new Error("Duplicate brand");
    err.status = 409;
    throw err;
  }

  const thumbnailPaths = await saveThumbnails(imagesPath);

  const dimensions = await Promise.all(images.map(i => getDimensions(i.path)));

  Logger.info(dimensions);

  const imageDocs = images.map(
    (i, index) =>
      new Image({
        url: i.path,
        thumbnail: thumbnailPaths[index],
        width: dimensions[index].width,
        height: dimensions[index].height
      })
  );

 

  const newCombo = new Combo({
    // _id,
    name,
    status,
    description,
    price,
    product,
    image: imageDocs
  });

  // const [err,newBrandDoc] = await to(newBrand.save())
  const newComboDoc = await newCombo.save();
  return newComboDoc;
};

exports.getAllCombos = async query => {
    let dbQuery = { deleted: false };
    let sortQuery = { updatedAt: -1 };
    if (query.status) dbQuery = { ...dbQuery, status: query.status };
    if (query.priorityOrder) dbQuery = { ...dbQuery, priorityOrder: -1 };
    if (query.sort) sortQuery = { [query.sort]: -1 };
  
    const combos = await Combo.find(dbQuery).sort(sortQuery);
    if (!combos || combos.length === 0) {
      const err = new Error("No combos");
      throw err;
    }
    return combos;
  };

  exports.getComboDetails = async id => {
    const query = getIdQuery(id);
    const combo = await Combo.find(query);
    if (!combo || combo.length === 0) throw new Error("Combo does not exist");
    return combo[0];
  };
  
  exports.deleteCombo = async id => {
    try {
      const a = await Combo.findOne({ _id: id });
      if (!a) throw new Error("Invalid combo");
      if (a.deleted === true) throw new Error("Combo does not exist");
      const b = await Combo.update({ _id: id }, { deleted: true });
      Logger.info(b);
      if (b.ok === 1 && b.nModified === 1) return true;
      return false;
    } catch (error) {
      throw error;
    }
  };
  
  exports.editCombo = async (params, image, query) => {
    Logger.info("params", params);
    const { newImages, deletedImages } = image;
    const { comboId } = params;
    Logger.info(deletedImages);
    const findQuery = getIdQuery(comboId);
  
    const [err, combo] = await to(Combo.findOne(findQuery));
    if (err) throw new Error("Database error while finding brand");
    if (!combo) throw new Error("No such brand exists");
  
    if (query) {
      if (query.status) {
        combo.status = query.status;
        const updated = await combo.save();
        Logger.info(updated);
        return updated;
      }
    }
  
    const fieldsToEdit = cleanDeep({
      status: params.status,
      name: params.name
    });
    
  
    let deletedImagesA = [];
    let newImagesA = [];
    if (deletedImages && deletedImages.length > 0) {
      // deletedImages.forEach(i => brand.image.pull({_id:i}))
      deletedImagesA = deletedImages;
    }
    Logger.info(deletedImagesA);
    Logger.info("newim", newImages);
    if (newImages && newImages.length > 0) {
      await Promise.all(
        newImages.map(async i => {
          const thumbnail = await saveThumbnails(new Array(i.path));
          const dimensions = await getDimensions(i.path);
          const newImageSchema = new Image({
            url: i.path,
            thumbnail: thumbnail[0],
            width: dimensions.width,
            height: dimensions.height
          });
          newImagesA.push(newImageSchema);
          // brand.image.push(newImageSchema)
        })
      );
    }
  
    let firstUpdate = {};
    let secondUpdate = {};
  
    if (!isEmpty(deletedImagesA))
      firstUpdate = {
        $pull: {
          image: { _id: { $in: deletedImagesA } }
        }
      };
    if (!isEmpty(fieldsToEdit))
      firstUpdate = { ...firstUpdate, $set: fieldsToEdit };
    if (!isEmpty(newImagesA))
      secondUpdate = { $push: { image: { $each: newImagesA } } };
  
    // firstUpdate = cleanDeep(firstUpdate);
    // secondUpdate = cleanDeep(secondUpdate)
    console.log("firstUpdate", firstUpdate, `{ $in: [${deletedImages}] }`);
    console.log("secondUpdate", secondUpdate);
    const opts = { runValidators: true };
    if (!isEmpty(firstUpdate)) {
      const [errA, firstUpdateStatus] = await to(
        new Promise((resolve, reject) => {
          Combo.update({ _id: brandId }, firstUpdate, opts, function(err, a) {
            if (err) reject(err);
            resolve(a);
          });
        })
      );
      Logger.info(errA, firstUpdateStatus);
      if (
        errA ||
        (!firstUpdateStatus.nModified === 1 && !firstUpdateStatus.ok === 1)
      )
        throw new Error(errA ? errA.message : "Error updating data");
      // brand.image.forEach(i => {
      //   deleteFile(i.url);
      //   deleteFile(i.thumbnail);
      // });
    }
  
    if (!isEmpty(secondUpdate)) {
      const [errB, secondUpdateStatus] = await to(
        new Promise((resolve, reject) => {
          Combo.update({ _id: brandId }, secondUpdate, opts, function(err, a) {
            if (err) reject(err);
            resolve(a);
          });
        })
      );
  
      Logger.info(errB, secondUpdateStatus);
      if (
        errB ||
        (!secondUpdateStatus.nModified === 1 && !secondUpdateStatus.ok === 1)
      )
        throw new Error("Error updating data");
    }
  
    // const updatedBrand = await brand.save()
    const updatedCombo = await Combo.findOne({ _id: comboId });
    Logger.info(updatedCombo);
    return updatedCombo;
  };
  