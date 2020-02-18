"use strict";

const Product = require("../models/product");
const Pricing = require("../models/pricing");
const Stock = require("../models/stock");
const Composition = require("../models/composition");
const { shippingDimModel: ShippingDim } = require("../models/shippingDim");
const validator = require("validator");
// const parseQuery = require("query-string")
const {
  to,
  TE,
  ReE,
  ReS,
  deleteFile,
  saveThumbnails,
  resizeCrop,
  saveThumbnail,
  getDimensions,
  getIdQuery,
  uniq
} = require("../services/util.service");
const mongoose = require("mongoose");
const Logger = require("../logger");
const { seoModel: Seo } = require("../models/seo");
const { imageModel: Image } = require("../models/image");
const { STRINGS, PAGE_LIMIT } = require("../utils/appStatics");
const { transformProduct } = require("./transforms");
const parseStrings = require("parse-strings-in-object");
const { isObjectId } = require("./util.service");
const { addCompositions } = require("./composition.service");
const { addOrganics } = require("./organic.service");
const { createOrganic } = require("./organic.service");
//use parse-strings-in-object

const WIDTH = null;
// const WIDTH = 800;
// const HEIGHT = 550;
const HEIGHT = 340;

exports.isParentIdValid = async id => {
  Logger.info("isParentIdValid", id);
  const [err, parentProduct] = await to(Product.findOne({ _id: id }));
  if (err) throw err;
  if (parentProduct) return true;
  return false;
};

exports.createProduct = async param => {
  Logger.info("createProduct");
  const parsedParam = parseStrings(param);
  Logger.info(parsedParam);
  const {
    medicineType,
    length,
    width,
    height,
    weight,
    startDate,
    endDate,
    listPrice,
    salePrice,
    taxId,
    variantType,
    parentId,
    name,
    status,
    category,
    brand,
    purchaseCount,
    minOrderQty,
    maxOrderQty,
    shipping,
    composition,
    prescriptionNeeded,
    returnable,
    featured,
    returnPeriod,
    sku,
    tag,
    metaTitle,
    metaDescription,
    metaKeywords,
    attributes: attributesJSON,
    images,
    lengthClass,
    weightClass,
    quantity,
    outOfStockStatus,
    subtract,
    textDescription,
    organic
  } = parsedParam;

  const attributes = JSON.parse(attributesJSON);

  const duplicateProduct = await Product.find({ name: name });

  if (duplicateProduct && duplicateProduct.length > 0) {
    if (images && images.length > 0)
      // for variants maybe no images
      images.map(i => deleteFile(i.path));
    const err = new Error("Duplicate product");
    err.status = 409;
    throw err;
  }

  let parentProdDoc = null;
  // if (typeof parentId !== "undefined" && parentId !== "null") {
  if (parentId) {
    parentProdDoc = await Product.findOne({ _id: parentId });
    Logger.info("parentProdDoc", parentProdDoc);
    if (!parentProdDoc) throw new Error("Invalid parent ID");
    parentProdDoc.variantCount = parentProdDoc.variantCount + 1;
  }

  //  const thumbnailPaths = await saveThumbnails(imagesPath)
  // const thumbnailPathsMainImage = await saveThumbnails(new Array(mainImage[0].path))
  // const dimensions = await Promise.all(images.map(i => getDimensions(i.path)))
  // const dimensionsMainImage = await getDimensions(mainImage[0].path)
  // Logger.info(dimensions)

  // handling composition field
  const newCompositions = composition.filter(i => !isObjectId(i));
  const newCompositionsDocs = addCompositions(newCompositions);
  let toAddComps = composition.filter(i => isObjectId(i));
  toAddComps = uniq([
    ...(await newCompositionsDocs).map(i => i._id),
    ...toAddComps
  ]);

  // handling organic field
  const newOrganics = organic.filter(i => !isObjectId(i));
  const newOrganicsDocs = addOrganics(newOrganics);
  let toAddOrganicsId = organic.filter(i => isObjectId(i));
  toAddOrganicsId = uniq([
    ...(await newOrganicsDocs).map(i => i._id),
    ...toAddOrganicsId
  ]);

  // Logger.info('newCompositions raw', newCompositions)
  // let [errExistComp, existingCompDocs] = await to(
  //   findCompositionsFromNames({names: newCompositions})
  // )
  // Logger.info('existingCompDocs', existingCompDocs)
  // let [errNewComp, newCompositionsDocs] = await to(
  //   createCompositions({ names: newCompositions })
  // );

  // let newCompIds = newCompositionsDocs && newCompositionsDocs.length > 0 ? newCompositionsDocs.map(i => i._id): []
  // let existingCompIds = existingCompDocs && existingCompDocs.length > 0 ? existingCompDocs.map(i => i._id) : []
  // if (errExistComp || errNewComp) {
  //   Logger.error("Error adding new compositions", errNewComp, errExistComp);
  // }

  // toAddComps = uniq([...toAddComps, ...newCompIds, ...existingCompIds]);

  let imageDocs = parentId ? parentProdDoc.images : [];
  // let imageDocs = [];
  if (images && images.length > 0) {
    // for variants maybe no images
    const imageDocsNew = await Promise.all(
      images.map(async i => {
        const thumbnail = await saveThumbnail(i.path);
        const url = await resizeCrop(i.path, WIDTH, HEIGHT);
        const dimensions = await getDimensions(i.path);
        return new Image({
          url,
          thumbnail,
          width: dimensions.width,
          height: dimensions.height
        });
      })
    );
    imageDocs = [...imageDocs, ...imageDocsNew];
  }
  Logger.info(imageDocs);

  // const mainImageDoc = new Image({
  //     url: mainImage[0].path,
  //     thumbnail: thumbnailPathsMainImage[0],
  //     width: dimensionsMainImage.width,
  //     height: dimensionsMainImage.height
  // })

  const seo = new Seo({
    metaTitle,
    metaDescription,
    metaKeywords
  });

  const shippingDim = new ShippingDim({
    dimensions: {
      length: {
        value: length,
        unit: lengthClass
      },
      width: {
        value: width,
        unit: lengthClass
      },
      height: {
        value: height,
        unit: lengthClass
      }
    },
    weight: {
      value: weight,
      unit: weightClass
    }
  });

  const attributesDoc = attributes.map(i => ({
    attributeGroup: i.attributeGroup,
    value: i.value
  }));

  // save pricing details to Pricing colln
  const pricing = new Pricing({
    startDate,
    endDate,
    listPrice,
    salePrice,
    taxId
  });

  const [errPricing, pricingDoc] = await to(pricing.save());
  if (errPricing) throw new Error("Error while saving pricing");
  if (!pricingDoc) throw new Error("No pricing created");

  // Save stock details to stock colln
  const stock = new Stock({
    subtract,
    outOfStockStatus,
    quantity
  });
  const [errStock, stockDoc] = await to(stock.save());
  if (errStock) throw new Error("Error while saving stock");
  if (!stockDoc) throw new Error("No stock created");

  const newProduct = new Product({
    // _id,
    medicineType,
    name,
    sku,
    status,
    category,
    brand,
    purchaseCount,
    minOrderQty,
    maxOrderQty,
    shipping,
    composition: toAddComps,
    organic: toAddOrganicsId,
    prescriptionNeeded,
    returnable,
    featured,
    returnPeriod,
    tag,
    attributes: attributesDoc,
    seo,
    images: imageDocs,
    attributes: attributesDoc,
    variantType: parentProdDoc ? "multiple" : "single",
    parentId,
    pricing: pricingDoc._id,
    shipping: shippingDim,
    deleted: false,
    stock: stockDoc._id,
    textDescription

    // mainImage: mainImageDoc
  });

  const [errProd, newProductDoc] = await to(newProduct.save());

  let errParent = null;
  Logger.info(parentProdDoc);
  if (parentProdDoc) {
    let [errParent, updatedParentProdDoc] = await to(parentProdDoc.save());
    Logger.info(updatedParentProdDoc);
    if (errParent) Logger.error(errParent);
  }
  if (errProd) Logger.error(errProd);
  if (errProd || errParent) throw new Error("Error while saving to database");
  if (!newProductDoc) throw new Error("Oopss..");
  return Product.populate(
    newProductDoc,
    "category composition pricing medicineType stock"
  );
};

exports.getProductsFromIds = async (ids, fields = []) => {
  Logger.info("hi", ids, fields);
  let select = {};
  if (fields && fields.length > 0) {
    fields.forEach(i => (select[i] = 1));
  }
  const [err, prods] = await to(
    Product.find({ _id: { $in: ids } })
      .select(select)
      .populate("category", "name images seo")
      .populate("composition", "_id deleted name slug")
      .populate("organic", "_id deleted name slug")
      .populate("brand", "_id deleted name slug image")
      .populate("pricing", "listPrice salePrice startDate endDate taxId")
      .populate("attributes.attributeGroup", "name status attribute_group_code")
      .populate("attributes.value", "value status")
      .populate("medicineType")
      .populate("stock")
  );
  Logger.info(err, prods);
  if (err) throw err;
  return {
    products: prods.map(i => transformProduct(i))
  };
};

exports.getAllProducts = async query => {
  let dbQuery = { deleted: false };

  let queryParsed = parseStrings(query);
  // Logger.info(queryParsed);
  let {
    fields,
    status,
    page = 1,
    limit = PAGE_LIMIT,
    sortField = "updatedAt",
    sortOrder = 1,
    organic,
    category, // slugs
    featured, brand
    // id
  } = queryParsed;

  // Object.entries(queryParsed).forEach(([key,value]) => {
  // })

  if (category) dbQuery = { ...dbQuery, category };
  if (brand) dbQuery = { ...dbQuery, brand };
  if (featured) dbQuery = { ...dbQuery, featured: true };
  if (status) dbQuery = { ...dbQuery, status };
  if (organic) dbQuery = { ...dbQuery, organic: { $in: organic } };
  Logger.info(organic)
  // if (query.priorityOrder)
  //     dbQuery = { ...dbQuery, priorityOrder: -1 }
  // if (query.sort) sortQuery = { [query.sort]: -1 };
  let select = {};
  if (fields && fields.length > 0) {
    fields.forEach(i => (select[i] = 1));
  }

  sortOrder === "ascend" ? (sortOrder = 1) : (sortOrder = -1);

  Logger.info(dbQuery, select, sortField, sortOrder, page, limit);

  const products = await Product.find(dbQuery)
    .select(select)
    .sort({ [sortField]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("category", "name images seo")
    .populate("composition", "_id deleted name slug")
    .populate("organic", "_id deleted name slug")
    .populate("brand", "_id deleted name slug image")
    .populate("pricing", "listPrice salePrice startDate endDate taxId")
    .populate("attributes.attributeGroup", "name status attribute_group_code")
    .populate("attributes.value", "value status")
    .populate("medicineType")
    .populate("stock");
  if (!products || products.length === 0) {
    const err = new Error("No products");
    throw err;
  }
  return {
    products: products.map(i => transformProduct(i)),
    total: await Product.countDocuments({ deleted: false, ...dbQuery })
    // total: await Product.estimatedDocumentCount({ deleted: false, ...dbQuery })
  };
  // return products
};

exports.getAllVariants = async (productId, query) => {
  let dbQuery = { deleted: false, parentId: productId };

  let queryParsed = parseStrings(query);
  // Logger.info(queryParsed);
  let {
    fields,
    status,
    page = 1,
    limit = PAGE_LIMIT,
    sortField = "updatedAt",
    sortOrder = 1
    // category // slugs

    // id
  } = queryParsed;

  Logger.info("queryParsed", queryParsed);

  if (status) dbQuery = { ...dbQuery, status };
  // if (query.priorityOrder)
  //     dbQuery = { ...dbQuery, priorityOrder: -1 }
  // if (query.sort) sortQuery = { [query.sort]: -1 };
  let select = {};
  if (fields && fields.length > 0) {
    fields.forEach(i => (select[i] = 1));
  }

  sortOrder === "ascend" ? (sortOrder = 1) : (sortOrder = -1);

  Logger.info(select, sortField, sortOrder, page, limit);

  Logger.info("dbQuery", dbQuery);

  const products = await Product.find(dbQuery)
    .select(select)
    .sort({ [sortField]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("category", "name images seo")
    .populate("composition", "_id deleted name slug")
    .populate("organic", "_id deleted name slug")
    .populate("brand", "_id deleted name slug image")
    .populate("pricing", "listPrice salePrice startDate endDate taxId")
    .populate("attributes.attributeGroup", "name status attribute_group_code")
    .populate("attributes.value", "value status")
    .populate("medicineType")
    .populate("stock");
  if (!products || products.length === 0) {
    const err = new Error("No variants");
    throw err;
  }
  return {
    products: products.map(i => transformProduct(i)),
    total: await Product.countDocuments({ deleted: false, ...dbQuery })
    // total: await Product.estimatedDocumentCount({ deleted: false, ...dbQuery })
  };
  // return products
};

exports.getProductDetails = async (id, { fields }) => {
  let dbQuery = getIdQuery(id);
  dbQuery = { ...dbQuery, deleted: false };
  Logger.info(dbQuery);

  let select = {};

  if (fields && fields.length > 0) {
    fields.forEach(i => (select[i] = 1));
  }

  const product = await Product.find(dbQuery) // limit page sort fielf sort order
    .select(select)

    .populate("category", "name images seo")
    .populate("composition", "_id deleted name slug")
    .populate("brand", "_id deleted name slug image")
    .populate("pricing", "listPrice salePrice startDate endDate taxId")
    .populate("attributes.attributeGroup", "name status attribute_group_code")
    .populate("attributes.value", "value status")
    .populate("medicineType")
    .populate("stock");
  Logger.info(product);
  if (product.length === 0) throw new Error(STRINGS.NOT_EXIST);
  return product[0];
};

exports.editProduct = async (params, query) => {
  const { productId } = params;
  const dbQuery = getIdQuery(productId);
  // const mainImageFile = req.files["mainImage"][0];
  // const imagesFiles = req.files["images"];
  Logger.info(params);

  const product = await Product.findOne(dbQuery);
  if (!product) throw new Error(STRINGS.NOT_EXIST);
  const pricing = await Pricing.findOne({ _id: product.pricing._id });
  const stock = await Stock.findOne({ _id: product.stock._id });
  const seoModel = new Seo({
    metaTitle: product.seo.metaTitle,
    metaDescription: product.seo.metaDescription,
    metaKeywords: product.seo.metaKeywords
  });
  const promises = await Object.entries(params).map(async ([key, value]) => {
    switch (key) {
      case "returnable":
        if (value === "false");
        // product.returnPeriod = undefined;
        product.returnPeriod = null;
        break;
      case "deletedImages":
        value.map(i => product.images.pull({ _id: i }));
        // return Promise.resolve(1)
        break;
      case "images":
        Logger.info(value);
        const imageDocs = await Promise.all(
          value.map(async i => {
            const thumbnail = await saveThumbnail(i.path);
            const url = await resizeCrop(i.path, WIDTH, HEIGHT);
            const dimensions = await getDimensions(i.path);
            return new Image({
              // url: i.path,
              url,
              thumbnail,
              width: dimensions.width,
              height: dimensions.height
            });
          })
        );
        Logger.info(imageDocs);
        return imageDocs.map(i => product.images.push(i));
        // return Promise.resolve(1);
        break;
      case "parentId":
      case "variantType":
        break;
      case "listPrice":
      case "salePrice":
      case "startDate":
      case "endDate":
      case "taxId":
        if (pricing) {
          pricing[key] = value;
        }
        // product.pricing[key] = value;
        // Promise.resolve(1);
        break;
      case "length":
      case "width":
      case "height":
        product.shipping.dimensions[key] = { value, unit: params.lengthClass };
        // return Promise.resolve(1)
        break;
      case "weight":
        product.shipping[key] = { value, unit: params.weightClass };
        // return Promise.resolve(1)
        break;
      case "metaTitle":
      case "metaDescription":
      case "metaKeywords":
        seoModel[key] = value;
        break;
      case "attributes":
        const attr = JSON.parse(value);
        product.attributes = [];
        // product.attributes
        //     .filter(i => i.attributeGroup !== attr.attributeGroup)
        //     .map(i => product.attributes.pull({ attributeGroup: i.attributeGroup }));
        attr.map(i =>
          product.attributes.push({
            attributeGroup: i.attributeGroup,
            value: i.value
          })
        );
        // return Promise.resolve(1)

        break;
      case "quantity":
      case "outOfStockStatus":
      case "subtract":
        stock[key] = value;
      case "composition":
        Logger.info(value);
        const newCompositions = params.composition.filter(i => !isObjectId(i));
        const newCompositionsDocs = addCompositions(newCompositions);
        let toAddComps = params.composition.filter(i => isObjectId(i));
        toAddComps = uniq([
          ...(await newCompositionsDocs).map(i => i._id),
          ...toAddComps
        ]);
        product["composition"] = toAddComps;
        break;
      case "organic":
        const newOrganics = params.organic.filter(i => !isObjectId(i));
        const newOrganicsDocs = addOrganics(newOrganics);
        let toAddOrganicsId = params.organic.filter(i => isObjectId(i));
        toAddOrganicsId = uniq([
          ...(await newOrganicsDocs).map(i => i._id),
          ...toAddOrganicsId
        ]);
        product["organic"] = toAddOrganicsId;
        break;
      default:
        product[key] = value;
        // return Promise.resolve(1)
        break;
    }
  });
  const b = await Promise.all(promises);
  Logger.info(b);
  product.seo = seoModel;
  await pricing.save();
  await stock.save();
  const updatedProduct = await product.save();
  const populatedProd = await Product.populate(
    updatedProduct,
    "category composition pricing brand attributes.attributeGroup attributes.value stock organic"
  );
  Logger.info(populatedProd);
  return transformProduct(populatedProd);
};

exports.deleteProduct = async id => {
  const a = await Product.findOne({ _id: id });
  Logger.info(a);
  if (!a) throw new Error(STRINGS.INVALID_ID);
  if (a.deleted === true) throw new Error(STRINGS.NOT_EXIST);

  // main product
  if (a.parentId === null && a.variantCount > 0) {
    // main with variants; soft deletes all variants
    const variants = await Product.find({ parentId: id });
    Logger.info("variants", variants);
    if (variants.length > 0) {
      const variantIds = variants.map(i => i._id);
      Logger.info(variantIds);
      const b = await Product.updateMany(
        { _id: { $in: variantIds } },
        { deleted: true }
      );
      Logger.info("Variants delete", b);
      // return (b.ok === 1 && b.nModified === a.variantCount)
    }
  }

  // delete main product (or) variant product
  const b = await Product.update({ _id: id }, { deleted: true });
  Logger.info(b);
  if (b.ok === 1 && b.nModified === 1) return true;

  return false;
};

exports.restoreProduct = async id => {
  const restoredData = await Product.findOneAndUpdate(
    { _id: id, deleted: true },
    { $set: { deleted: false } }
  );
  if (!restoredData) throw new Error(STRINGS.NOT_EXIST);
  return restoredData;
};
