"use strict";

const cleanDeep = require("clean-deep");
const Banner = require("../models/banner");
const {
  to,
  TE,
  ReE,
  ReS,
  deleteFile,
  saveThumbnail,
  getDimensions,
  getIdQuery,
  resizeCrop,
  generateObjectId
} = require("../services/util.service");
const Logger = require("../logger");
const { STRINGS } = require("../utils/appStatics");
const { imageModel: Image } = require("../models/image");
const WIDTH = null;
// const WIDTH = 800;
// const HEIGHT = 550;
const HEIGHT = 340;
//use parse-strings-in-object

exports.getBanner = async id => {
  const query = getIdQuery(id);
  Logger.info(query);
  const banner = await Banner.find({ ...query, deleted: false });
  //.populate("parent");

  if (!banner || banner.length === 0) throw new Error("Banner does not exist");
  return banner[0];
};

exports.createBanner = async param => {
  const { name,images, shortDescription, width, height } = param;
  const duplicateBanner = await Banner.find({
    name: name,
    shortDescription:shortDescription,
    deleted: false
  });
  if (duplicateBanner && duplicateBanner.length > 0) {
    if (images && images.length > 0)
      images.map(i => deleteFile(i.path));
    const err = new Error("Duplicate Banner");
    err.status = 409;
    throw err;
  }

  let imageDocs =  [];
  // let imageDocs = [];
  if (images ) {
    // for variants maybe no images
    
      
        const thumbnail = await saveThumbnail(images.path);
        const url = await resizeCrop(images.path, width, height);
        const dimensions = await getDimensions(images.path);
        const imageDocsNew =  new Image({
          url,
          thumbnail,
          width: dimensions.width,
          height: dimensions.height
        });
     
    
    imageDocs = imageDocsNew;
  }
  
  const newBanner= new Banner({ ...param,images: imageDocs });

  const newBannerDoc = await newBanner.save();
  return newBannerDoc;
};

exports.getAllBanners = async query => {
  let dbQuery = { deleted: false };
  let sortQuery = { updatedAt: -1 };
  if (query.status) dbQuery = { ...dbQuery, status: query.status };
  if (query.priorityOrder) dbQuery = { ...dbQuery, priorityOrder: -1 };
  if (query.sort) sortQuery = { [query.sort]: -1 };

  const banners = await Banner.find(dbQuery).sort(sortQuery);
  if (!banners || banners.length === 0) {
    const err = new Error(STRINGS.NO_DATA);
    throw err;
  }
  return banners;
};

exports.getBannerDetails = async id => {
  const query = getIdQuery(id);
  const banners = await Banner.find(query);
  if (!banners || banners.length === 0)
    throw new Error("Banners does not exist");
  return banners[0];
};

exports.deleteBanner = async id => {
  try {
    const a = await Banner.findOne({ _id: id });
    Logger.info("dddd",a);
    if (!a) throw new Error("Invalid Banner");
    if (a.deleted === true) throw new Error("Banner does not exist");
    const b = await Banner.update({ _id: id }, { deleted: true });
    Logger.info(b);
    if (b.ok === 1 && b.nModified === 1) return true;
    return false;
  } catch (error) {
    throw error;
  }
};

exports.editBanner = async (params, query) => {
  Logger.info("params", params);
  const { bannerId, images, deletedImages } = params;
  const findQuery = getIdQuery(bannerId);

  Logger.info(findQuery)

  const [err, banner] = await to(Banner.findOne(findQuery));
  if (err) throw new Error("Database error while finding Banners");
  if (!banner) throw new Error("No such Banner exists");

  if (query) {
    if (query.status) {
      banner.status = query.status;
      const updated = await banner.save();
      Logger.info(updated);
      return updated;
    }
  }

  if (images ) {
    // for variants maybe no images
    
      
        const thumbnail = await saveThumbnail(images.path);
        const url = await resizeCrop(images.path, params.width, params.height);
        const dimensions = await getDimensions(images.path);
        const imageDocsNew =  new Image({
          url,
          thumbnail,
          width: dimensions.width,
          height: dimensions.height
        });
    banner.images.push(imageDocsNew);
  }

  if (deletedImages && deletedImages.length > 0) {
    deletedImages.map(i =>  banner.images.pull({ _id: i }));
  }

  const fieldsToEdit = cleanDeep({
    status: params.status,
    height: params.height,
    name: params.name,
    priorityOrder: params.priorityOrder,
    width: params.width,
    shortDescription: params.shortDescription
  });

  Logger.info(banner);
  Logger.info(fieldsToEdit);

  
  Logger.info("77777",banner);
  const [errUpdate, updatedInfo] = await to(banner.save());
  if (errUpdate) {
    Logger.info(errUpdate);
    throw new Error("Error while updating");
  }
  return updatedInfo;
};
