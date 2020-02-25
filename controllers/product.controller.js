const { to, ReE, ReS } = require("../services/util.service");
const { status_codes_msg } = require("../utils/appStatics");
const Logger = require("../logger");
const { STRINGS, PAGE_LIMIT } = require("../utils/appStatics");
const parseStrings = require("parse-strings-in-object");


const productService = require("../services/product.service");

exports.createProduct = async (req, res, next) => {
  const param = req.body;
  try {
    let image = req.files["image"];
    Logger.info(image);
    // if (image.constructor === Object) image = new Array(image);
    param.images = image;
    Logger.info(param.parentId, typeof param.parentId);
    if (
      param.parentId !== "undefined" &&
      typeof param.parentId !== "undefined" &&
      param.parentId !== "null" &&
      param.parentId !== null
    ) {
      const [err, isValid] = await to(
        productService.isParentIdValid(param.parentId)
      );
      if (err) throw new Error(err.message);
      if (!isValid) throw new Error(STRINGS.INVALID_PARENTID);
    }
    const [err, product] = await to(productService.createProduct(param));
    Logger.info(err);
    if (err) {
      throw err;
    }
    if (product) {
      return ReS(
        res,
        { message: "Product", data: product },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    Logger.info("hi");
    const parsedQuery = parseStrings(req.query);
    Logger.info("parsedQuery", parsedQuery);
    const { id, fields } = parsedQuery;
    const limit = parsedQuery.limit || PAGE_LIMIT;
    const page = parsedQuery.page || 1;

    if (id) {
      const [err, response] = await to(
        productService.getProductsFromIds(id, fields || [])
      );
      Logger.info(response);
      if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
      if (response.products) {
        return ReS(
          res,
          {
            message: "Product",
            data: response.products,
            total: response.total,
            page,
            limit
          },
          status_codes_msg.SUCCESS.code
        );
      }
    } else {
      const [err, response] = await to(
        productService.getAllProducts(parsedQuery)
      );
      if (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
      }
      // Logger.info(response);
      if (!response) throw new Error("No products");
      if (response && response.products) {
        return ReS(
          res,
          {
            message: "Product",
            data: response.products,
            total: response.total,
            page,
            limit
          },
          status_codes_msg.SUCCESS.code
        );
      }
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getAllProductsAggregate = async (req, res, next) => {
  try {
    Logger.info("hi");
    const parsedQuery = parseStrings(req.query);
    Logger.info("parsedQuery", parsedQuery);
    const { id, fields } = parsedQuery;
    const limit = parsedQuery.limit || PAGE_LIMIT;
    const page = parsedQuery.page || 1;
    if (id) {
      const [err, response] = await to(
        productService.getProductsFromIds(id, fields || [])
      );
      Logger.info(response);
      if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
      if (response.products) {
        return ReS(
          res,
          {
            message: "Product",
            data: response.products,
            total: response.total,
            page,
            limit
          },
          status_codes_msg.SUCCESS.code
        );
      }
    } else {
      const [err, response] = await to(
        productService.getAllProductsAggregate(parsedQuery)
      );
      if (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
      }
      // Logger.info(response);
      if (!response) throw new Error("No products");
      if (response && response.products) {
        return ReS(
          res,
          {
            message: "Product",
            data: response.products,
            total: response.total,
            page,
            limit
          },
          status_codes_msg.SUCCESS.code
        );
      }
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getAllVariants = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const parsedQuery = parseStrings(req.query);
    Logger.info("parsedQuery", parsedQuery);

    const limit = parsedQuery.limit || PAGE_LIMIT;
    const page = parsedQuery.page || 1;

    const [err, response] = await to(
      productService.getAllVariants(productId, parsedQuery)
    );
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }

    if (response.products) {
      return ReS(
        res,
        {
          message: "Variants",
          data: response.products,
          total: response.total,
          page,
          limit
        },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    Logger.info(req.params);
    const [err, product] = await to(
      productService.getProductDetails(req.params.productId, req.query)
    );
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (product) {
      return ReS(
        res,
        { message: "Product", data: product },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.editProduct = async (req, res, next) => {
  const param = req.body;

  param.productId = req.params.productId;
  try {
    let newImages;
    if (req.files && req.files["image"]) {
      newImages = req.files["image"];
      param.images = newImages;
    }
    Logger.info(newImages);

    // param.deletedImages = deletedImages
    const [err, product] = await to(
      productService.editProduct(param, req.query)
    );
    if (err) {
      console.log("will throw error", err);
      throw err;
    }
    if (product) {
      return ReS(
        res,
        { message: "Product", data: product },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (error) {
    // console.log("caught", error);
    return next(error);
  }
};

exports.deleteProduct = async function(req, res) {
  try {
    const [err, isDeleted] = await to(
      productService.deleteProduct(req.params.productId)
    );
    Logger.info(err, isDeleted);
    if (err) throw err;
    if (isDeleted)
      return ReS(
        res,
        { message: "Product deleted" },
        status_codes_msg.SUCCESS.code
      );
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};
