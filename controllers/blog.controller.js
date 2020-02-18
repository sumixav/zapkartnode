const { to, ReE, ReS } = require("../services/util.service");
const { status_codes_msg } = require("../utils/appStatics");
const Logger = require("../logger");

const blogService = require("../services/blog.service");

exports.createBlog = async (req, res, next) => {
  const param = req.body;
  try {
    let image = req.files["image"];
    Logger.info(image);
    // if (image.constructor === Object) image = new Array(image);
    param.images = (req.files["image"])?image[0]:null;
    const [err, blog] = await to(blogService.createBlog(param));
    Logger.info(err);
    if (err) {
      throw err;
    }
    if (blog) {
      return ReS(
        res,
        { message: "Blog", data: blog },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getAllBlogs = async (req, res, next) => {
  try {
    const [err, blogs] = await to(blogService.getAllBlogs(req.query));
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (blogs) {
      return ReS(
        res,
        { message: "Blogs", data: blogs, count: blogs.length },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getBlog = async (req, res, next) => {
  try {
    const [err, blog] = await to(blogService.getBlog(req.params.blogId));
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (blog) {
      return ReS(
        res,
        { message: "Blog", data: blog },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.editBlog = async (req, res, next) => {
  const param = req.body;
  param.blogId = req.params.blogId;
  try {
    if (typeof req.files !== "undefined" && req.files["image"] !== "undefined")
      param.images = (req.files["image"])?req.files["image"][0]:null;
      Logger.log(param.image);
    const [err, blog] = await to(
      blogService.editBlog(param, req.query)
    );
    if (err) {
      console.log("will throw error");
      throw err;
    }
    if (blog) {
      return ReS(
        res,
        { message: "Blog", data: blog },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (error) {
    console.log("caught", error);
    return next(error);
  }
};

exports.deleteBlog = async function(req, res) {
  try {
    const [err, isDeleted] = await to(blogService.deleteBlog(req.params.blogId));
    Logger.info(err, isDeleted);
    if (err) throw err;
    if (isDeleted)
      return ReS(
        res,
        { message: "Blog deleted" },
        status_codes_msg.SUCCESS.code
      );
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};
