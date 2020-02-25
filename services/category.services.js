"use strict";

const Category = require("../models/category");
const qs = require("qs");
const validator = require("validator");
const parseStrings = require("parse-strings-in-object");
const {
  to,
  TE,
  ReE,
  ReS,
  deleteFile,
  saveThumbnails,
  saveThumbnail,
  getDimensions,
  getIdQuery,
  generateObjectId,
  fromEntries
} = require("../services/util.service");
const mongoose = require("mongoose");
const Logger = require("../logger");
const { seoModel: Seo } = require("../models/seo");
const { imageModel: Image } = require("../models/image");
const cleanDeep = require("clean-deep");
const { transformCategory } = require("./transforms");
//use parse-strings-in-object

exports.deleteCategory = async id => {
  console.log("hi");
  try {
    const a = await Category.findOne({ _id: id });
    if (!a) throw new Error("Invalid category");
    if (a.deleted === true) throw new Error("Category does not exist");
    const b = await Category.update({ _id: id }, { deleted: true });
    Logger.info(b);
    if (b.ok === 1 && b.nModified === 1) return true;
    return false;
  } catch (error) {
    throw error;
  }
};

exports.createCategory = async (param, images) => {
  const {
    name,
    parent,
    description,
    status,
    metaTitle,
    metaDescription,
    metaKeywords,
    priorityOrder,
    title
  } = param;
  Logger.info(images);
  let imagesPath = [];
  imagesPath = images.map(i => i.path);
  Logger.info(imagesPath);

  const duplicateCategory = await Category.find({ name: name, deleted: false });

  if (duplicateCategory && duplicateCategory.length > 0) {
    imagesPath.map(i => deleteFile(i));
    const err = new Error("Duplicate category");
    err.status = 409;
    throw err;
  }

  const thumbnailPaths = await saveThumbnails(imagesPath);
  // const dimensions = await Promise.all(images.map(i => getDimensions(i.path)))
  // Logger.info(dimensions)

  // Promise.all
  const imageDocs = await Promise.all(
    images.map(async (i, index) => {
      const dimensions = await getDimensions(i.path);
      return new Image({
        title: title || "",
        url: i.path,
        thumbnail: thumbnailPaths[index],
        width: dimensions.width,
        height: dimensions.height
      });
    })
  );
  Logger.info(imageDocs);
  const _id = generateObjectId();
  let idPath;
  let parentA = parent === "null" ? null : parent;
  Logger.info(parentA);
  if (parentA) {
    const docParent = await Category.findOne({
      _id: parent
    });

    idPath = [...docParent.idPath, _id];
  } else {
    idPath = [_id];
  }
  const seo = new Seo({
    metaTitle,
    metaDescription,
    metaKeywords
  });

  const newCategory = new Category({
    _id,
    name,
    parent,
    status,
    priorityOrder,
    images: imageDocs,
    // idPath : parent ? _id : idPath,
    description,
    idPath,
    // base,
    seo
  });

  const newCategoryDoc = await newCategory.save();

  return transformCategory(newCategoryDoc);
};

exports.getAllCategories = async query => {
  //&status=active&
  // const sortArray = Object.entries(query.sort).map(([key, value]) => {
  //   if (value === "ascend") return { [key]: 1 };
  //   return { [key]: -1 };
  // });
  // console.log(sortArray);
  // const sortObject = fromEntries(sortArray);
  // console.log(sortObject);

  // const options = { sort: { priorityOrder: 1, updatedAt: -1 }, status: "active" };
  // console.log(qs.stringify(options))
  // sort%5BpriorityOrder%5D=1&sort%5BupdatedAt%5D=-1&status=active

  let sortQuery = {};
  let select = {};
  let dbQuery = { deleted: false };

  // if (query.status) dbQuery = { ...dbQuery, status: query.status };
  // if (query.sort) sortQuery = { ...query.sort, updatedAt: -1 };
  const { populateParent } = query;

  const parsedQuery = parseStrings(query);
  console.log('parsedQuery',parsedQuery)
  Object.entries(parsedQuery).forEach(([key, value]) => {
    switch (key) {
      // case "parent":
      //   dbQuery = { ...dbQuery, [key]: value };
      //   break;
      case "sort":
        sortQuery = { ...value, updatedAt: -1 };
      case "page":
      case "limit":
        break;
      case "field": //field[]=name&field[]=slug
        Logger.info(value)
        if (value && value.length > 0) {
          value.forEach(i => (select[i] = 1));
        }
        break;
      default:
        dbQuery = { ...dbQuery, [key]: value };
    }
  });

  console.log(sortQuery);
  console.log(select);

  const categories = populateParent
    ? await Category.find(dbQuery)
        .sort(sortQuery)
        .select(select)
        .populate("parent")
    : await Category.find(dbQuery)
        .sort(sortQuery)
        .select(select);

  if (!categories || categories.length === 0) {
    const err = new Error("No categories");
    throw err;
  }
  return categories;
};

exports.getCategoryDetails = async id => {
  const query = getIdQuery(id);
  Logger.info(query);
  const category = await Category.find({ ...query, deleted: false });
  //.populate("parent");

  if (!category || category.length === 0)
    throw new Error("Category does not exist");
  return category[0];
};

exports.editCategory = async (params, id, query) => {
  // throw new Error("mock error")
  Logger.info(params, id);
  const toEditParams = Object.assign({}, params);
  // delete toEditParams.image
  const category = await Category.findOne({ _id: id, deleted: false }).populate(
    "parent"
  );
  if (!category) {
    const error = new Error("Resource does not exist");
    error.status = 404;
    throw error;
  }
  if (query) {
    if (query.status) {
      category.status = query.status;
      const updated = await category.save();
      Logger.info(updated);
      return transformCategory(updated);
    }
  }

  let fieldsToEdit = cleanDeep(toEditParams);
  //   if (fieldsToEdit.metaTitle) {
  //     category.seo.metaTitle = fieldsToEdit.metaTitle;
  //     delete fieldsToEdit.metaTitle;
  //   }
  //   if (fieldsToEdit.metaDescription) {
  //     category.seo.metaDescription = fieldsToEdit.metaDescription;
  //     delete fieldsToEdit.metaDescription;
  //   }
  //   if (fieldsToEdit.metaKeywords) {
  //     category.seo.metaKeywords = fieldsToEdit.metaKeywords;
  //     delete fieldsToEdit.metaKeywords;
  //   }
  //   if (fieldsToEdit.deletedImages) {
  //     fieldsToEdit.deletedImages.map(i => category.images.pull({ _id: i }));
  //     delete fieldsToEdit.deletedImages;
  //   }
  // let newImages = null;
  // let newImagesThumbnail = null;
  // let dimensions = null;
  //   if (params.image) {
  //     newImages = params.image.map(i => i.path);
  //     newImagesThumbnail = await saveThumbnails(newImages);
  //     // dimensions = await Promise.all(newImages.map(i => getDimensions(i)));
  //   }
  // let imgDocs = null;
  if (params.image && params.image.length > 0) {
    await Promise.all(
      params.image.map(async i => {
        const dimensions = await getDimensions(i.path);
        const thumbnail = await saveThumbnail(i.path);
        const newImage = new Image({
          url: i.path,
          thumbnail: thumbnail,
          width: dimensions.width,
          height: dimensions.height
        });
        category.images.push(newImage);
      })
    );
  }
  //   Logger.info(imgDocs);
  //   if (imgDocs) {
  //     imgDocs.map(i => category.images.push(i));
  //   }
  const reqFields = [
    "name",
    // "parent",
    "description",
    "status",
    "priorityOrder"
  ];

  const seoFields = ["metaTitle", "metaDescription", "metaKeywords"];
  if (params.parent !== category.parent) {
    let idPath = [category._id];
    Logger.info(params.parent === "null");
    if (params.parent === "null") {
      category.parent = null;
      idPath = [category._id];
    } else {
      category.parent = params.parent;
      const parentDoc = await Category.findOne({ _id: params.parent });
      if (!parentDoc) throw new Error("Invalid parent ID");
      idPath = [...parentDoc.idPath, category._id];
    }
    category.idPath = idPath;
  }

  Object.entries(fieldsToEdit).map(([key, value]) => {
    if (seoFields.includes(key)) return (category.seo[key] = value);
    if (fieldsToEdit.deletedImages && fieldsToEdit.deletedImages.length > 0) {
      fieldsToEdit.deletedImages.map(i => category.images.pull({ _id: i }));
      return "";
    }
    if (reqFields.includes(key)) category[key] = value;
  });

  const err = category.validateSync();
  if (err) throw err;

  const editedCategory = await category.save();
  const transformed = transformCategory(editedCategory);
  Logger.info(transformed);
  return transformed;
};
