"use strict";

const cleanDeep = require("clean-deep");
const Blog = require("../models/blog");
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
const { seoModel: Seo } = require("../models/seo");
const { STRINGS } = require("../utils/appStatics");
const { imageModel: Image } = require("../models/image");
const WIDTH = null;
// const WIDTH = 800;
// const HEIGHT = 550;
const HEIGHT = 340;
//use parse-strings-in-object

exports.getBlog = async id => {
  const query = getIdQuery(id);
  Logger.info(query);
  const blog = await Blog.find({ ...query, deleted: false });
  //.populate("parent");

  if (!blog || blog.length === 0) throw new Error("Blog does not exist");
  return blog[0];
};

exports.createBlog = async param => {
  const { name, metaTitle, metaDescription, metaKeywords,images } = param;
  const duplicateBlog = await Blog.find({
    name: name,
    deleted: false
  });

  if (duplicateBlog && duplicateBlog.length > 0) {
    if (images && images.length > 0)
      images.map(i => deleteFile(i.path));
    const err = new Error("Duplicate Blog");
    err.status = 409;
    throw err;
  }

  const seo = new Seo({
    metaTitle,
    metaDescription,
    metaKeywords
  });

  let imageDocs =  [];
  // let imageDocs = [];
  if (images ) {
    // for variants maybe no images
    
      
        const thumbnail = await saveThumbnail(images.path);
        const url = await resizeCrop(images.path, WIDTH, HEIGHT);
        const dimensions = await getDimensions(images.path);
        const imageDocsNew =  new Image({
          url,
          thumbnail,
          width: dimensions.width,
          height: dimensions.height
        });
     
    
    imageDocs = imageDocsNew;
  }
  
  const newBlog= new Blog({ ...param, seo, images: imageDocs });

  const newBlogDoc = await newBlog.save();
  return newBlogDoc;
};

exports.getAllBlogs = async query => {
  let dbQuery = { deleted: false };
  let sortQuery = { updatedAt: -1 };
  if (query.status) dbQuery = { ...dbQuery, status: query.status };
  if (query.priorityOrder) dbQuery = { ...dbQuery, priorityOrder: -1 };
  if (query.sort) sortQuery = { [query.sort]: -1 };
  if (query.feature) dbQuery = { ...dbQuery, feature: query.feature };

  const blogs = await Blog.find(dbQuery).sort(sortQuery);
  if (!blogs || blogs.length === 0) {
    const err = new Error(STRINGS.NO_DATA);
    throw err;
  }
  return blogs;
};

exports.getBlogDetails = async id => {
  const query = getIdQuery(id);
  const blogs = await Blog.find(query);
  if (!blogs || blogs.length === 0)
    throw new Error("Blogs does not exist");
  return blogs[0];
};

exports.deleteBlog = async id => {
  try {
    const a = await Blog.findOne({ _id: id });
    Logger.info("dddd",a);
    if (!a) throw new Error("Invalid Blog");
    if (a.deleted === true) throw new Error("Blog does not exist");
    const b = await Blog.update({ _id: id }, { deleted: true });
    Logger.info(b);
    if (b.ok === 1 && b.nModified === 1) return true;
    return false;
  } catch (error) {
    throw error;
  }
};

exports.editBlog = async (params, query) => {
  Logger.info("params", params);
  const { blogId, images, deletedImages } = params;
  const findQuery = getIdQuery(blogId);

  Logger.info(findQuery)

  const [err, blog] = await to(Blog.findOne(findQuery));
  if (err) throw new Error("Database error while finding Blogs");
  if (!blog) throw new Error("No such Blog exists");

  if (query) {
    if (query.status) {
      blog.status = query.status;
      const updated = await blog.save();
      Logger.info(updated);
      return updated;
    }
  }

  if (images ) {
    // for variants maybe no images
    
      
        const thumbnail = await saveThumbnail(images.path);
        const url = await resizeCrop(images.path, WIDTH, HEIGHT);
        const dimensions = await getDimensions(images.path);
        const imageDocsNew =  new Image({
          url,
          thumbnail,
          width: dimensions.width,
          height: dimensions.height
        });
    blog.images.push(imageDocsNew);
  }

  if (deletedImages && deletedImages.length > 0) {
    deletedImages.map(i =>  blog.images.pull({ _id: i }));
  }

  const fieldsToEdit = cleanDeep({
    status: params.status,
    feature: params.feature,
    name: params.name,
    priorityOrder: params.priorityOrder,
    htmlContent: params.htmlContent,
    metaTitle: params.metaTitle,
    metaDescription: params.metaDescription,
    metaKeywords: params.metaKeywords,
    shortDescription: params.shortDescription,
    imgtext_data: params.imgtext_data,
  });

  Logger.info(blog);
  Logger.info(fieldsToEdit);

  Object.keys(fieldsToEdit).forEach(key => {
    Logger.info(key);
    
    switch (key) {
      case "metaTitle":
      case "metaDescription":
      case "metaKeywords":
        blog.seo[key] = fieldsToEdit[key];
        break;
      default:
        blog[key] = fieldsToEdit[key];
        break;
    }
  });
  Logger.info("77777",blog);
  const [errUpdate, updatedInfo] = await to(blog.save());
  if (errUpdate) {
    Logger.info(errUpdate);
    throw new Error("Error while updating");
  }
  return updatedInfo;
};
