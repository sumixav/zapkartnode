"use strict";

const Product = require("../models/product");
const Pricing = require("../models/pricing");
const Brand = require("../models/brand");
const Attribute = require("../models/attribute");
const Stock = require("../models/stock");
const ProductExtraInfo = require("../models/productExtraInfo");
const Composition = require("../models/composition");
const Category = require("../models/category");
const { shippingDimModel: ShippingDim } = require("../models/shippingDim");
const validator = require("validator");
const find = require("lodash/find");
const isEmpty = require("lodash/isEmpty");
const pick = require("lodash/pick");
const omit = require("lodash/omit");
const intersectionBy = require("lodash/intersectionBy");
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
  uniq,
  isValidId,
  isObjectId
} = require("../services/util.service");
const mongoose = require("mongoose");
const Logger = require("../logger");
const { seoModel: Seo } = require("../models/seo");
const { imageModel: Image } = require("../models/image");
const { STRINGS, PAGE_LIMIT } = require("../utils/appStatics");
const { transformProduct } = require("./transforms");
const parseStrings = require("parse-strings-in-object");
const qs = require("qs");
const { addCompositions } = require("./composition.service");
const { addOrganics } = require("./organic.service");
const { createOrganic } = require("./organic.service");
const reduce = require("lodash/reduce");
//use parse-strings-in-object

const WIDTH = null;
// const WIDTH = 800;
// const HEIGHT = 550;
const HEIGHT = 340;

exports.isParentIdValid = async (id) => {
  Logger.info("isParentIdValid", id);
  const [err, parentProduct] = await to(Product.findOne({ _id: id }));
  if (err) throw err;
  if (parentProduct) return true;
  return false;
};

exports.createProduct = async (param) => {
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
    composition = [],
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
    organic = [],
    relatedProducts,
    frequentlyBought,
    imageUrl,
  } = parsedParam;

  const attributes = JSON.parse(attributesJSON);

  const duplicateProduct = await Product.find({ name: name });

  if (duplicateProduct && duplicateProduct.length > 0) {
    if (images && images.length > 0)
      // for variants maybe no images
      images.map((i) => deleteFile(i.path));
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
  const newCompositions = composition.filter((i) => !isObjectId(i));
  const newCompositionsDocs = addCompositions(newCompositions);
  let toAddComps = composition.filter((i) => isObjectId(i));
  toAddComps = uniq([
    ...(await newCompositionsDocs).map((i) => i._id),
    ...toAddComps,
  ]);

  // handling organic field
  const newOrganics = organic.filter((i) => !isObjectId(i));
  const newOrganicsDocs = addOrganics(newOrganics);
  let toAddOrganicsId = organic.filter((i) => isObjectId(i));
  toAddOrganicsId = uniq([
    ...(await newOrganicsDocs).map((i) => i._id),
    ...toAddOrganicsId,
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

  let imageDocs = parentId
    ? intersectionBy(
      parentProdDoc.images,
      imageUrl.map((i) => ({ url: i })),
      'url'
    )
    : [];
  // let imageDocs = [];
  if (images && images.length > 0) {
    // for variants maybe no images
    const imageDocsNew = await Promise.all(
      images.map(async (i) => {
        const thumbnail = await saveThumbnail(i.path);
        const url = await resizeCrop(i.path, WIDTH, HEIGHT);
        const dimensions = await getDimensions(i.path);
        return new Image({
          url,
          thumbnail,
          width: dimensions.width,
          height: dimensions.height,
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
    metaKeywords,
  });

  const shippingDim = new ShippingDim({
    dimensions: {
      length: {
        value: length,
        unit: lengthClass,
      },
      width: {
        value: width,
        unit: lengthClass,
      },
      height: {
        value: height,
        unit: lengthClass,
      },
    },
    weight: {
      value: weight,
      unit: weightClass,
    },
  });

  const attributesDoc = attributes.map((i) => ({
    attributeGroup: i.attributeGroup,
    value: i.value,
  }));

  // save pricing details to Pricing colln
  const pricing = new Pricing({
    startDate,
    endDate,
    listPrice,
    salePrice,
    taxId,
  });

  const productExtraInfoDoc = new ProductExtraInfo({});
  Object.entries(param).forEach(([key, value]) => {
    switch (key) {
      case "description":
      case "keyBenefits":
      case "directionsForUse":
      case "safetyInfo":
      case "otherInfo":
        productExtraInfoDoc[key] = value;
        break;
      default:
        break;
    }
  });

  const [errPricing, pricingDoc] = await to(pricing.save());
  if (errPricing) throw new Error("Error while saving pricing");
  if (!pricingDoc) throw new Error("No pricing created");

  // Save stock details to stock colln
  const stock = new Stock({
    subtract,
    outOfStockStatus,
    quantity,
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
    returnPeriod: returnable ? returnPeriod : null,
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
    textDescription,
    productExtraInfo: productExtraInfoDoc._id,
    relatedProducts,
    frequentlyBought
    // mainImage: mainImageDoc
  });

  //extraInfo
  productExtraInfoDoc.productId = newProduct._id;
  const [errExtraInfo, prodExtraInfoDoc] = await to(productExtraInfoDoc.save());
  if (errExtraInfo || !productExtraInfoDoc) {
    if (errExtraInfo) throw new Error("Error saving extra info");
    throw new Error("Extra info has not been saved");
  }

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

  // new product has been created, save productExtraInfo

  Logger.info("prodExtraInfoDoc", prodExtraInfoDoc);
  return Product.populate(
    newProductDoc,
    "category composition pricing medicineType stock productExtraInfo relatedProducts frequentlyBought"
  );
};

/*
exports.createProductNew = async param => {
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
  const newProdDoc = new Product({})
  const seoDoc = new Seo({})
  const shippingDimDoc = new shippingDim({})
  Object.entries(parsedParam).forEach(async ([key, value]) => {
    switch (key) {
      case 'parentId':
        let [err, dbparentProdDoc] = await Product.findOne({ _id: value });
        Logger.info("parentProdDoc", parentProdDoc);
        if (!dbparentProdDoc) throw new Error("Invalid parent ID");
        if (err) throw err;
        parentProdDoc.variantCount = parentProdDoc.variantCount + 1;
        break;
      case 'composition':
        const newCompositions = value.filter(i => !isObjectId(i));
        const [errComps, newCompositionsDocs] = await to(addCompositions(newCompositions));
        if (errComps) throw errComps
        let toAddComps = value.filter(i => isObjectId(i));
        toAddComps = uniq([
          ...newCompositionsDocs.map(i => i._id),
          ...toAddComps
        ]);
        newProdDoc.composition = toAddComps
        break;
      case 'organic':
        const newOrganics = value.filter(i => !isObjectId(i));
        const [errOrganics, newOrganicsDocs] = await to(addOrganics(newOrganics));
        if (errOrganics) throw errOrganics;
        let toAddOrganicsId = organic.filter(i => isObjectId(i));
        toAddOrganicsId = uniq([
          ...newOrganicsDocs.map(i => i._id),
          ...toAddOrganicsId
        ]);
        newProdDoc.organic = toAddOrganicsId
        break;
      case 'images':
        let imageDocs = parentId ? parentProdDoc.images : [];
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
          newProdDoc.images = imageDocs
        }
        break;
      case 'metaTitle':
      case 'metaDescription':
      case 'metaKeywords':
        seoDoc[key] = value
        break;
      case 'length':
      case 'width':
      case 'height':
        shippingDimDoc.dimensions[key].value = value;
        break;
      case 'weight':
        shippingDimDoc[key].value = key;
        break;
      case 'weightClass':
        shippingDimDoc.weight.unit = value;
        break;
      case 'lengthClass':
        shippingDimDoc.dimensions.length.unit = value
        shippingDimDoc.dimensions.width.unit = value
        shippingDimDoc.dimensions.height.unit = value
        break;
    }
  })

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
*/

exports.getProductsFromIds = async (ids, fields = []) => {
  Logger.info("hi", ids, fields);
  let select = {};
  if (fields && fields.length > 0) {
    fields.forEach((i) => (select[i] = 1));
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
      .populate("productExtraInfo")
  );
  Logger.info(err, prods);
  if (err) throw err;
  return {
    products: prods.map((i) => transformProduct(i)),
  };
};

exports.getAllProductsAggregate = async (query) => {
  let dbQuery = { deleted: false };

  // let queryParsed = parseStrings(query);
  let queryParsed = qs.parse(query);
  // Logger.info(queryParsed);
  let {
    fields,
    status,
    page = 1,
    limit = PAGE_LIMIT,
    sort = {},
    organic,
    category, // slugs
    featured,
    brand,
    noExtraInfo,
    // id
  } = queryParsed;

  let aggregatePipeline = [
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category"
      }
    },
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brand",
      },
    },

    {
      $unwind: {
        path: "$category"
      }
    },
    {
      $unwind: {
        path: "$brand",
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $sort: { ...sort, updatedAt: -1 },
    },
    // {
    //   $count: "totalDoc"
    // },
  ];

  let match = {};

  Object.entries(queryParsed).forEach(([key, value]) => {
    switch (key) {
      case "sort":
      case "page":
      case "limit":
        break;
      default:
        match = { ...match, [key]: value };
    }
  });

  aggregatePipeline = [...aggregatePipeline, { $match: match }];

  const b = await Product.aggregate(aggregatePipeline);
  const a = await Product.populate(b, [
    // { path: "category", select: "name images seo" },
    { path: "composition", select: "_id deleted name slug" },
    { path: "organic", select: "_id deleted name slug" },
    //{ path: "brand", select: "_id deleted name slug image" },
    { path: "pricing", select: "listPrice salePrice startDate endDate taxId" },
    {
      path: "attributes.attributeGroup",
      select: "name status attribute_group_code",
    },
    { path: "attributes.value", select: "value status" },
    { path: "medicineType" },
    { path: "stock" },
    { path: "productExtraInfo" },
  ]);

  Logger.info(a);
  if (!a || a.length === 0) throw new Error("No products");
  if (a && a.length > 0)
    return {
      products: a,
      total: a.length,
    };
};

exports.getAllProducts = async (query) => {
  let dbQuery = { deleted: false };

  let queryParsed = parseStrings(query);
  Logger.info("queryParsed", queryParsed);
  let {
    fields,
    status,
    page = 1,
    limit = PAGE_LIMIT,
    sortField = "updatedAt",
    sortOrder = 1,
    organic,
    sort,
    category, // slugs
    featured,
    brand,
    noExtraInfo,
    // id
  } = queryParsed;

  // Logger.info("QUERYAAAAAAA", getIdQuery(queryParsed.category))
  if (queryParsed.category && typeof queryParsed.category === "string") queryParsed.category = new Array(queryParsed.category);
  if (queryParsed.brand && typeof queryParsed.category === "string") queryParsed.category = new Array(queryParsed.category);
  Logger.info('new queryParsed', queryParsed)
  let categoryQuery = {};
  let brandQuery = {};
  if (queryParsed.category) {
    if (!isEmpty(find(queryParsed.category, i => getIdQuery(i).slug))) {
      // if (getIdQuery(queryParsed.category).slug) {

      const { category } = queryParsed;
      const [errM, categories] = await to(Category.find({ slug: { $in: Array.isArray(category) ? category : new Array(category) } }))
      if (errM) TE("Error fetching categories", errM.message);
      if (!categories) TE("Error fetching categories");
      Logger.info(categories.map(i => i._id));
      categoryQuery = { category: { $in: categories.map(i => i._id) } }
    }
    else {
      categoryQuery = {
        category: { $in: Array.isArray(queryParsed.category) ? queryParsed.category : new Array(queryParsed.category) },
      }
    }
  }
  if (queryParsed.brand) {
    Logger.info('queryParsed.brand', queryParsed.brand)

    if ((Array.isArray(queryParsed.brand) && find(queryParsed.brand, i => typeof getIdQuery(i).slug !== "undefined") ||
      (!Array.isArray(queryParsed.brand) && getIdQuery(queryParsed.brand).slug)
    )) {
      const { brand } = queryParsed;
      const [errM, brands] = await to(Brand.find({ slug: { $in: Array.isArray(brand) ? brand : new Array(brand) } }))
      if (errM) TE("Error fetching brands", errM.message);
      if (!brands) TE("Error fetching categories");
      Logger.info(brands.map(i => i._id));
      brandQuery = { brand: { $in: brands.map(i => i._id) } }
    }
    else {
      brandQuery = {
        brand: { $in: Array.isArray(queryParsed.brand) ? queryParsed.brand : new Array(queryParsed.brand) },
      }
    }
  }




  let select = {};
  let sortQuery = { updatedAt: -1 };
  Object.entries(queryParsed).forEach(([key, value]) => {
    switch (key) {
      case "search":
        console.log(key, value, value.name);
        if (value.name)
          dbQuery = { ...dbQuery, name: { $regex: value.name, $options: "i" } };
        if (value._id) dbQuery = { ...dbQuery, _id: value._id };
        // db.getCollection('products').find({name:{$regex:/hea/,$options:"i"}, sku:{$regex:/h22/,$options:"i"}},{sku:1})
        break;
      case "organic":
        dbQuery = { ...dbQuery, organic: { $in: organic } };
        break;
      case "fields":
        Logger.info(key, typeof value)
        if (typeof value === "string")
          value = value.trim().split(',').map(i => i.trim());
        if (value && value.length > 0) {
          value.forEach((i) => (select[i] = 1));
        }
        break;
      case "noExtraInfo":
        if (value) select.productExtraInfo = 0;
        break;
      case "sortOrder":
        value === "ascend" ? (sortOrder = 1) : (sortOrder = -1);
        break;
      case "brand":
        dbQuery = {
          ...dbQuery,
          // brand: { $in: Array.isArray(value) ? value : new Array(value) },
          ...brandQuery
        };
        break;
      case "category": {
        dbQuery = {
          ...dbQuery,
          // category: { $in: Array.isArray(value) ? value : new Array(value) },
          ...categoryQuery
        };
      }
        break;
      case "page":
      case "limit":
      case "sortField":
        break;
      case "sort":
        sortQuery = reduce(
          value,
          (result, value, key) => {
            if (value === "ascend") result[key] = 1;
            else result[key] = -1;
            return result;
          },
          sortQuery
        );
        break;
      default:
        dbQuery = { ...dbQuery, [key]: value };
        break;
    }
  });

  // Logger.info("qs", qs.parse(query));
  // Logger.info("queryParsed", queryParsed);
  // if (category) dbQuery = { ...dbQuery, category };
  // if (brand) dbQuery = { ...dbQuery, brand };
  // if (featured) dbQuery = { ...dbQuery, featured: true };
  // if (status) dbQuery = { ...dbQuery, status };
  // if (organic) dbQuery = { ...dbQuery, organic: { $in: organic } };
  // Logger.info(organic);
  // if (query.priorityOrder)
  //     dbQuery = { ...dbQuery, priorityOrder: -1 }
  // if (query.sort) sortQuery = { [query.sort]: -1 };
  // let select = {};
  // if (fields && fields.length > 0) {
  //   fields.forEach(i => (select[i] = 1));
  // }
  // if (noExtraInfo) {
  //   if (JSON.parse(noExtraInfo)) select.productExtraInfo = 0;
  // }

  // sortOrder === "ascend" ? (sortOrder = 1) : (sortOrder = -1);

  Logger.info("dbQuery", dbQuery);
  Logger.info("sortQuery", sortQuery);

  const products = await Product.find(dbQuery)
    .select(select)
    .sort(sortQuery)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("category", "name images seo")
    .populate("composition", "_id deleted name slug")
    .populate("organic", "_id deleted name slug")
    .populate("brand", "_id deleted name slug image")
    // .populate({path: 'pricing', select:"listPrice salePrice startDate endDate taxId", options: { sort: { 'salePrice': -1 } } })
    .populate({
      path: "pricing",
      select: "listPrice salePrice startDate endDate taxId",
    })
    .populate("attributes.attributeGroup", "name status attribute_group_code")
    .populate("attributes.value", "value status")
    .populate("medicineType")
    // .populate({ path: "stock", options: { sort: { "quantity": -1 } } })
    .populate({ path: "stock" })
    .populate("productExtraInfo");

  // if (!products || products.length === 0) {
  //   const err = new Error("No products");
  //   throw err;
  // }
  if (!products) {
    const err = new Error("No products");
    throw err;
  }

  return {
    products: products.map((i) => transformProduct(i)),
    total: await Product.countDocuments({ deleted: false, ...dbQuery }),
    // total: await Product.estimatedDocumentCount({ deleted: false, ...dbQuery })
  };
  // return products
};

exports.getAllVariants = async (productId, query) => {
  let dbQuery_intial = { deleted: false, status: "active", parentId: productId };
  const productList = await Product.find(dbQuery_intial).distinct('_id');
  let queryParsed = parseStrings(query);
  productList.push(productId);
  Logger.info("jjjjj", productList);
  let dbQuery = { deleted: false, status: "active", parentId: productId };
  let {
    fields,
    status,
    page = 1,
    limit = PAGE_LIMIT,
    sortField = "updatedAt",
    sortOrder = 1,
    // category // slugs

    // id
  } = queryParsed;

  Logger.info("queryParsed", queryParsed);
  let dbQueryIn = { "_id": { $in: productList } };
  if (status) dbQuery = { ...dbQuery, status };
  // if (query.priorityOrder)
  //     dbQuery = { ...dbQuery, priorityOrder: -1 }
  // if (query.sort) sortQuery = { [query.sort]: -1 };
  let select = {};
  if (fields && fields.length > 0) {
    fields.forEach((i) => (select[i] = 1));
  }

  sortOrder === "ascend" ? (sortOrder = 1) : (sortOrder = -1);

  Logger.info(select, sortField, sortOrder, page, limit);

  Logger.info("dbQuery", dbQuery);

  const attributeCode = await Product.aggregate([
    { $match: dbQuery },
    {
      $group: {
        _id: "$attributes.attributeGroup",
      },
    },
  ]).exec();
  // const attributeCode = attributeResult.map(item => {
  //   return item._id;
  // })

  const attrproduct = await Promise.all(
    attributeCode.map(async function (item, index) {
      //Object.assign(item, {key3: "value3"});
      Logger.info("indexxxxx", index);
      let attrQuery = {
        attributes: { $elemMatch: { attributeGroup: item._id } },
      };
      let dbQueryResult = { ...dbQueryIn, ...attrQuery };
      Logger.info("2233", dbQueryResult);
      let attrlistProduct = await Product.find(dbQueryResult)
        .select(select)
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("category", "name images seo")
        .populate("parentId", "name parentId")
        .populate("composition", "_id deleted name slug")
        .populate("organic", "_id deleted name slug")
        .populate("brand", "_id deleted name slug image")
        .populate("pricing", "listPrice salePrice startDate endDate taxId")
        .populate(
          "attributes.attributeGroup",
          "name status attribute_group_code"
        )
        .populate("attributes.value", "value status")
        .populate("medicineType")
        .populate("stock");

      return attrlistProduct;
    })
  );
  Logger.info("ff345", attributeCode);
  const products = await Product.find(dbQuery)
    .select(select)
    .sort({ [sortField]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("category", "name images seo")
    .populate("parentId", "name parentId")
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
    products: products.map((i) => transformProduct(i)),
    total: await Product.countDocuments({ deleted: false, ...dbQuery }),
    attributelist: attrproduct,
    // total: await Product.estimatedDocumentCount({ deleted: false, ...dbQuery })
  };
  // return products
};

exports.getProductDetails = async (id, { fields, noExtraInfo }) => {
  let err, product, similarProducts;
  let dbQuery = getIdQuery(id);
  dbQuery = { ...dbQuery, deleted: false };
  Logger.info(dbQuery);

  let select = {};

  if (fields && fields.length > 0) {
    fields.forEach((i) => (select[i] = 1));
  }

  Logger.info("noExtraInfo", noExtraInfo);
  if (noExtraInfo) {
    if (JSON.parse(noExtraInfo)) select.productExtraInfo = 0;
  }


  [err, product] = await to(Product.findOne(dbQuery) // limit page sort fielf sort order
    .select(select)
    .populate("category", "name images seo")
    .populate("composition", "_id deleted name slug")
    .populate("brand", "_id deleted name slug image")
    .populate("pricing", "listPrice salePrice startDate endDate taxId")
    .populate("attributes.attributeGroup", "name status attribute_group_code")
    .populate("attributes.value", "value status")
    .populate("medicineType")
    .populate("stock")
    .populate("productExtraInfo")
    // .populate("relatedProducts", "_id slug name images pricing");
    .populate({
      path: "relatedProducts",
      populate: { path: "pricing" },
      select: " _id slug name images pricing",
    })
    .populate({
      path: "frequentlyBought",
      populate: { path: "pricing" },
      select: " _id slug name images pricing",
    }));
  if (err) TE(err.message);

  Logger.info(product);
  if (!product) throw new Error(STRINGS.NOT_EXIST);
  let prodQuery = dbQuery.slug ? { slug: { $nin: dbQuery.slug } } : { _id: { $nin: dbQuery._id } };
  const similarQuery = {
    organic: { $in: product.organic },
    status: "active",
    deleted: false,
    ...prodQuery
  };
  [err, similarProducts] = await to(Product.find({ ...similarQuery }).populate("pricing"));
  if (err) TE(err.message);

  return { ...product._doc, similarProducts: !similarProducts ? [] : similarProducts }
};

exports.editProduct = async (params, query) => {
  const { productId } = params;
  const dbQuery = getIdQuery(productId);
  // const mainImageFile = req.files["mainImage"][0];
  // const imagesFiles = req.files["images"];
  Logger.info(params);
  params = {
    ...params, ...parseStrings(pick(params, ['composition',
      'organic', 'relatedProducts', 'frequentlyBought']))
  }

  const product = await Product.findOne(dbQuery);
  if (!product) throw new Error(STRINGS.NOT_EXIST);

  // edit status & return
  const { status } = query;
  if (status) {
    product.status = status;
    const [err, statusChangedProd] = await to(product.save());
    if (err) throw err;
    return statusChangedProd;
  }

  const pricing = await Pricing.findOne({ _id: product.pricing._id });
  let productExtraInfo = await ProductExtraInfo.findOne({
    productId: product._id,
  });
  if (!productExtraInfo) {
    productExtraInfo = new ProductExtraInfo({ productId: product._id });
    product.productExtraInfo = productExtraInfo._id;
  }
  const stock = await Stock.findOne({ _id: product.stock._id });
  const seoModel = new Seo({
    metaTitle: product.seo.metaTitle,
    metaDescription: product.seo.metaDescription,
    metaKeywords: product.seo.metaKeywords,
  });
  const promises = await Object.entries(params).map(async ([key, value]) => {
    switch (key) {
      case "returnable":
        const boolRet = parseStrings({ returnable: value });
        Logger.info(boolRet);
        // product.returnPeriod = undefined;
        product.returnable = boolRet.returnable;
        if (!boolRet.returnable) product.returnPeriod = null;
        else product.returnPeriod = parseInt(params.returnPeriod, 10);
        Logger.info(product);
        break;
      case "deletedImages":
        value.map((i) => product.images.pull({ _id: i }));
        // return Promise.resolve(1)
        break;
      case "images":
        Logger.info(value);
        const imageDocs = await Promise.all(
          value.map(async (i) => {
            const thumbnail = await saveThumbnail(i.path);
            const url = await resizeCrop(i.path, WIDTH, HEIGHT);
            const dimensions = await getDimensions(i.path);
            return new Image({
              // url: i.path,
              url,
              thumbnail,
              width: dimensions.width,
              height: dimensions.height,
            });
          })
        );
        Logger.info(imageDocs);
        return imageDocs.map((i) => product.images.push(i));
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
        attr.map((i) =>
          product.attributes.push({
            attributeGroup: i.attributeGroup,
            value: i.value,
          })
        );
        // return Promise.resolve(1)

        break;
      case "quantity":
      case "outOfStockStatus":
      case "subtract":
        stock[key] = value;
        break;
      case "composition":
        Logger.info(key, value);
        if (value === null) { product["composition"] = []; break; };
        const newCompositions = value.filter((i) => !isObjectId(i));
        const newCompositionsDocs = addCompositions(newCompositions);
        let toAddComps = value.filter((i) => isObjectId(i));
        toAddComps = uniq([
          ...(await newCompositionsDocs).map((i) => i._id),
          ...toAddComps,
        ]);
        product["composition"] = toAddComps;
        break;
      case "organic":
        if (params.organic === null) { product["organic"] = []; break; };
        const newOrganics = params.organic.filter((i) => !isObjectId(i));
        const newOrganicsDocs = addOrganics(newOrganics);
        let toAddOrganicsId = params.organic.filter((i) => isObjectId(i));
        toAddOrganicsId = uniq([
          ...(await newOrganicsDocs).map((i) => i._id),
          ...toAddOrganicsId,
        ]);
        product["organic"] = toAddOrganicsId;
        break;
      case 'relatedProducts':
      case 'frequentlyBought':
        if (value === null) product[key] = [];
        else product[key] = value
        break;
      case "description":
      case "keyBenefits":
      case "directionsForUse":
      case "safetyInfo":
      case "otherInfo":
        productExtraInfo[key] = value;
        break;
      case "returnPeriod":
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
  await productExtraInfo.save();
  const updatedProduct = await product.save();
  const populatedProd = await Product.populate(
    updatedProduct,
    "category composition pricing brand attributes.attributeGroup attributes.value stock organic productExtraInfo"
  );
  Logger.info(populatedProd);
  return transformProduct(populatedProd);
};

exports.deleteProduct = async (id) => {
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
      const variantIds = variants.map((i) => i._id);
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

exports.deleteProducts = async (id) => {
  const a = await Product.find({ _id: { $in: id }, deleted: false });
  Logger.info(a);
  if (!a || (a.length !== id.length)) throw new Error(STRINGS.INVALID_ID);
  // if (a.deleted === true) throw new Error(STRINGS.NOT_EXIST);

  const session = await Product.startSession();
  try {

    session.startTransaction();

    // main product
    const [err, variantdDel] = await to(Promise.all(a.map(async prod => {

      if (prod.parentId === null && prod.variantCount > 0) {
        // main with variants; soft deletes all variants
        const variants = await Product.find({ parentId: prod._id });
        Logger.info("variants", variants);
        if (variants.length > 0) {
          const variantIds = variants.map((i) => i._id);
          // Logger.info(variantIds);
          const b = await Product.updateMany(
            { _id: { $in: variantIds } }, { deleted: true }
          , {session});
          Logger.info("Variants delete", b);
          return (b.ok === 1 && b.nModified === a.variantCount)
        }
      }
    })));
    if (err) TE(err.message);
    if (variantdDel.includes(false)) TE("Error deleting variants of products")
    console.log('kol', variantdDel)

    // delete main product (or) variant product
    const b = await Product.updateMany({ _id: { $in: id } }, { deleted: true }, {session});
    // throw new Error('mock error');
    Logger.info(b);
    if (b.ok === 1 && b.nModified === id.length) {

      await session.commitTransaction();
      session.endSession();
    }
    return true;
  }
  catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(err.message)
  }

  // return false;
};

exports.restoreProduct = async (id) => {
  const restoredData = await Product.findOneAndUpdate(
    { _id: id, deleted: true },
    { $set: { deleted: false } }
  );
  if (!restoredData) throw new Error(STRINGS.NOT_EXIST);
  return restoredData;
};

exports.getProductFilterAggregate = async (param) => {
  let { category, brand, status, sort, search, page = 1, limit = 0, fields, exclude } = param;
  let brandItems = [];
  let queryString = [{ $project: { _v: 0 } }];
  let productsortlist = [],
    queryGroupBrands = [],
    queryCount = [],
    pricelookup = [],
    priceUnwind = [],
    productmatch = [],
    categorylookup = [],
    categoryunwind = [],
    categorymatch = [],
    brandlookup = [],
    brandunwind = [],
    brandmatch = [],
    queryStringPagin = [],
    projectQuery = [],
    brandProject = [],
    matchParam = {},
    projectObj = {},
    sortlist = {},
    queryStringBrandGroup = [],
    searchParam = [],
    productInfolookup = [],
    productInfounwind = [];

  matchParam = { deleted: false, ...parseStrings(omit(param, ['category', 'brand', 'sort', 'page', 'limit', 'search', 'fields', 'exclude'])) };

  // if (status) {
  //   productmatch = [{ $match: { status: status } }];
  // }


  if (fields) {
    console.log('poo', fields);
    if (typeof fields === "string")
      fields = fields.split(',').map(i => i.trim());
    console.log('poo', fields);
    fields.forEach(i => projectObj[i] = 1);

  }
  if (exclude) {
    if (typeof exclude === "string")
      exclude = exclude.split(',').map(i => i.trim());
    console.log('pooa', exclude)
    const skipFields = ['categories_list', 'brands_list'];
    exclude.forEach(i => { if (!skipFields.includes(i)) projectObj[i] = 0 });
  }
  if (!isEmpty(projectObj)) {
    projectQuery = [
      {
        $project: projectObj
      }
    ];
  }
  console.log('aaaa1', projectObj)
  console.log('aaaa2', projectQuery)
  if (search) {
    Logger.info('search', search);
    // if (search.name)
    //   matchParam = { ...matchParam, name: { $regex: search.name, $options: "i" } }

    for (let key in search) {
      searchParam.push({ [key]: { $regex: search[key], $options: "i" } })
    }
    matchParam = { ...matchParam, $or: searchParam }
  }
  productmatch = [{ $match: matchParam }]

  let sortQuery = { updatedAt: -1 }
  // let sortQuery = {}
  if (sort) {
    sort = parseStrings(sort)
    sortQuery = Object.assign({}, sort);
    // Object.keys(sort).forEach(i => {
    //   switch (i) {
    //     case 'salePrice':
    //       sortQuery["pricing.salePrice"] = +sort.salePrice === -1 ? -1 : 1;
    //       // sortQuery = { ...sortQuery, "pricing.salePrice": +sort.salePrice === -1 ? -1 : 1 }
    //       break;
    //     default:
    //       sortQuery[i] = +sort[i] === -1 ? -1 : 1
    //       break;
    //   }
    // });
  }
  productsortlist = [
    {
      $sort: sortQuery
    },
  ];
  Logger.info('productsortlist', productsortlist)
  // generalLookup = [
  //   {
  //     $lookup: {
  //       from: "categories",
  //       localField: "parentId",
  //       foreignField: "_id",
  //       as: "parentId",
  //     },
  //   },
  //   {
  //     $unwind: "$parentId"
  //   }
  // {
  //   $lookup: {
  //     from: "compositions",
  //     localField: "composition",
  //     foreignField: "_id",
  //     as: "composition",
  //   },
  // },
  // {
  //   $lookup: {
  //     from: "organics",
  //     localField: "organic",
  //     foreignField: "_id",
  //     as: "organic",
  //   },
  // },
  // {
  //   $lookup: {
  //     from: "attributes",
  //     localField: "attributes.attributeGroup",
  //     foreignField: "_id",
  //     as: "attributes.attributeGroup",
  //   },
  // },
  // {
  //   $lookup: {
  //     from: "attributesValues",
  //     localField: "attributes.value",
  //     foreignField: "_id",
  //     as: "attributes.value",
  //   },
  // },
  // {
  //   $lookup: {
  //     from: "medicineTypes",
  //     localField: "medicineType",
  //     foreignField: "_id",
  //     as: "medicineType",
  //   },
  // },
  // {
  //   $unwind: "$medicineType"
  // },
  // {
  //   $lookup: {
  //     from: "stocks",
  //     localField: "stock",
  //     foreignField: "_id",
  //     as: "stock",
  //   },
  // },
  // {
  //   $unwind: "$stock"
  // },
  // {
  //   $lookup: {
  //     from: "productExtraInfos",
  //     localField: "productExtraInfo",
  //     foreignField: "_id",
  //     as: "productExtraInfo",
  //   },
  // },
  // {
  //   $unwind: "$productExtraInfo"
  // },
  // ]
  pricelookup = [
    {
      $lookup: {
        from: "pricings",
        localField: "pricing",
        foreignField: "_id",
        as: "pricing",
      },
    },
  ];
  priceUnwind = [
    {
      $unwind: "$pricing"
    }
  ]
  categorylookup = [
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        // as: "categories",
        as: "category",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category.idPath",
        foreignField: "_id",
        // as: "categories",
        as: "idPathPop",
      },
    },
  ];
  categoryunwind = [{ $unwind: "$category" }];
  categorymatch = [];
  if (category) {
    if (typeof category === "string") category = [category];
    // let categoryCondition = isValidId(category)
    //   ? mongoose.Types.ObjectId(category)
    //   : category;
    let categorymatchQuery = {};
    // Logger.info('valid objectid find', find(category, i => isObjectId(i)))/;
    if (!isEmpty(find(category, i => isObjectId(i)))) {
      categorymatchQuery = {
        // "category._id": { $in: category.map(i => mongoose.Types.ObjectId(i)) }
        "idPathPop._id": { $in: category.map(i => mongoose.Types.ObjectId(i)) }
      }
    }
    else
      categorymatchQuery = {
        // "category.slug": { $in: category }
        "idPathPop.slug": { $in: category }

      }
    categorymatch = [
      { $match: categorymatchQuery },
    ];
  }
  queryString = [
    ...queryString,
    ...categorylookup,
    // ...categoryunwind,
    ...categorymatch,
    { $project: { "idPathPop": 0 } }
  ];

  brandlookup = [
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brand",
      },
    },
  ];
  brandunwind = [{ $unwind: "$brand" }];
  brandmatch = [];
  if (brand) {
    if (typeof brand === "string") brand = [brand];
    brand.map((i) =>
      isObjectId(i)
        ? brandItems.push(mongoose.Types.ObjectId(i))
        : brandItems.push(i)
    );
    brandmatch = isValidId(brand[0])
      ? [{ $match: { "brand._id": { $in: brandItems } } }]
      : [{ $match: { "brand.slug": { $in: brandItems } } }];
  }
  queryString = [
    ...queryString,
    ...brandlookup,
    ...brandunwind,
    ...brandmatch,

  ];

  productInfolookup = [
    {
      $lookup: {
        from: "productextrainfos",
        localField: "productExtraInfo",
        foreignField: "_id",
        as: "productExtraInfo",
      },
    },
  ];
  productInfounwind = [{ $unwind: "$productExtraInfo" }];

  queryString = [
    ...queryString,
    ...productInfolookup,
    ...productInfounwind,
    ...productmatch,
    ...pricelookup,
    ...priceUnwind,

    // ...productsortlist,
  ];
  queryStringBrandGroup = queryString.filter(i => !brandmatch.includes(i))
  console.log('queryStringBrandGroup', queryStringBrandGroup)

  // passing $limit: 0 - error - pass only if positive int
  let paginateQuery = [{ $skip: (+page - 1) * +limit }];
  if (+limit > 0) paginateQuery = [...paginateQuery, { $limit: +limit }]
  queryCount = [...queryString, {
    $group: {
      _id: null,
      count: { $sum: 1 }
    }
  }]
  queryStringPagin = [
    ...queryString,
    ...projectQuery,
    ...paginateQuery,
    ...productsortlist,
    // {
    //   $group: {
    //     _id: null,
    //     count: { $sum: 1 },
    //     data: { $push: "$$ROOT" }
    //   }
    // },
    // {
    //   $skip: (+page - 1) * +limit,
    // },
    // {
    //   $limit: +limit,
    // },
    // {
    //   $facet: {
    //     paginatedResults: paginateQuery,
    //     totalCount: [
    //       {
    //         $count: 'count'
    //       }
    //     ],
    //     // brands: [{
    //     //   $bucket: {
    //     //     groupBy: "$brand._id",
    //     //     boundaries:[0,200],
    //     //     default:"other",
    //     //     output: {
    //     //       brand: { $mergeObjects: "$brand" },
    //     //       productCount: { "$sum": 1 }

    //     //     }
    //     //   }
    //     // }]
    //   }
    // }
  ]

  queryGroupBrands = [
    ...queryStringBrandGroup,
    // ...pricelookup,
    // ...productmatch,
    // ...productsortlist,
    {
      $group: {
        _id: "$brand._id",
        // brand: { $push: "$$ROOT" },
        brand: { $mergeObjects: "$brand" },
        productCount: { "$sum": 1 }
      }
    }
  ]

  // Logger.info('queryString', queryString)
  Logger.info('queryGroupBrands', queryGroupBrands);
  Logger.info('queryStringPagin', queryStringPagin);

  let [errCount, docs_collection_count] = await to(Product.aggregate(queryCount).exec());
  if (errCount) TE(errCount.message);
  if (!docs_collection_count) TE("Error fetching count");
  Logger.info('docs_collection_count', docs_collection_count)
  let [errProds, docs_collection] = await to(Product.aggregate(queryStringPagin).exec());
  if (errProds) TE(errProds.message);
  if (!docs_collection) TE("Error fetching products");

  [errProds, docs_collection] = await to(Product.populate(docs_collection, [
    // { path: "category", select: "name images seo" },
    { path: "composition", select: "_id deleted name slug" },
    { path: "organic", select: "_id deleted name slug" },
    //{ path: "brand", select: "_id deleted name slug image" },
    // { path: "pricing", select: "listPrice salePrice startDate endDate taxId" },
    {
      path: "attributes.attributeGroup",
      select: "name status attribute_group_code",
    },
    { path: "attributes.value", select: "value status" },
    { path: "medicineType" },
    { path: "stock" },
    // { path: "productExtraInfo" },
  ]))
  if (errProds) TE(errProds.message);
  if (!docs_collection) TE("Error fetching products");
  const [errBrands, docs_collection_brand] = await to(Product.aggregate(queryGroupBrands).exec());
  if (errBrands) TE(errBrands.message);
  // if (!docs_collection_brand) TE("Error fetchingbrands")

  let addInfo = {};
  if (page) addInfo.page = page;
  if (limit) addInfo.limit = limit;
  if (!exclude || (exclude && !exclude.includes('brands_list'))) addInfo.brands_list = docs_collection_brand;
  return {
    count: docs_collection_count.length > 0 ? docs_collection_count[0].count : 0,
    products: docs_collection,
    ...addInfo
  };

};

exports.getProductFilterAggregate = async (param) => {
  let { category, brand, status, sort, search, page = 1, limit = 0, fields, exclude } = param;
  let brandItems = [];
  let queryString = [{ $project: { _v: 0 } }];
  let productsortlist = [],
    queryGroupBrands = [],
    queryCount = [],
    pricelookup = [],
    priceUnwind = [],
    productmatch = [],
    categorylookup = [],
    categoryunwind = [],
    categorymatch = [],
    brandlookup = [],
    brandunwind = [],
    brandmatch = [],
    queryStringPagin = [],
    projectQuery = [],
    brandProject = [],
    matchParam = {},
    projectObj = {},
    sortlist = {},
    queryStringBrandGroup = [],
    searchParam = [],
    productInfolookup = [],
    productInfounwind = [];

  matchParam = { deleted: false, status: 'active' };

  // if (status) {
  //   productmatch = [{ $match: { status: status } }];
  // }


  if (fields) {
    console.log('poo', fields);
    if (typeof fields === "string")
      fields = fields.split(',').map(i => i.trim());
    console.log('poo', fields);
    fields.forEach(i => projectObj[i] = 1);

  }
  if (exclude) {
    if (typeof exclude === "string")
      exclude = exclude.split(',').map(i => i.trim());
    console.log('pooa', exclude)
    const skipFields = ['categories_list', 'brands_list'];
    exclude.forEach(i => { if (!skipFields.includes(i)) projectObj[i] = 0 });
  }
  if (!isEmpty(projectObj)) {
    projectQuery = [
      {
        $project: projectObj
      }
    ];
  }

  matchParam = { ...matchParam, $or: [{ name: { $regex: name, $options: "i" }, "productExtraInfo.description": { $regex: name, $options: "i" } }] }

  productmatch = [{ $match: matchParam }]

  let sortQuery = { updatedAt: -1 }
  // let sortQuery = {}
  if (sort) {
    sort = parseStrings(sort)
    sortQuery = Object.assign({}, sort);
    // Object.keys(sort).forEach(i => {
    //   switch (i) {
    //     case 'salePrice':
    //       sortQuery["pricing.salePrice"] = +sort.salePrice === -1 ? -1 : 1;
    //       // sortQuery = { ...sortQuery, "pricing.salePrice": +sort.salePrice === -1 ? -1 : 1 }
    //       break;
    //     default:
    //       sortQuery[i] = +sort[i] === -1 ? -1 : 1
    //       break;
    //   }
    // });
  }
  productsortlist = [
    {
      $sort: sortQuery
    },
  ];

  brandlookup = [
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brand",
      },
    },
  ];
  brandunwind = [{ $unwind: "$brand" }];
  brandmatch = [];
  if (brand) {
    if (typeof brand === "string") brand = [brand];
    brand.map((i) =>
      isObjectId(i)
        ? brandItems.push(mongoose.Types.ObjectId(i))
        : brandItems.push(i)
    );
    brandmatch = isValidId(brand[0])
      ? [{ $match: { "brand._id": { $in: brandItems } } }]
      : [{ $match: { "brand.slug": { $in: brandItems } } }];
  }
  queryString = [
    ...queryString,
    ...brandlookup,
    ...brandunwind,
    ...brandmatch,
  ];

  productInfolookup = [
    {
      $lookup: {
        from: "productextrainfos",
        localField: "productExtraInfo",
        foreignField: "_id",
        as: "productExtraInfo",
      },
    },
  ];
  productInfounwind = [{ $unwind: "$productExtraInfo" }];

  queryString = [
    ...queryString,
    ...productInfolookup,
    ...productInfounwind,
    ...productmatch,
    ...pricelookup,
    ...priceUnwind,

    // ...productsortlist,
  ];
  queryStringBrandGroup = queryString.filter(i => !brandmatch.includes(i))
  console.log('queryStringBrandGroup', queryStringBrandGroup)

  // passing $limit: 0 - error - pass only if positive int
  let paginateQuery = [{ $skip: (+page - 1) * +limit }];
  if (+limit > 0) paginateQuery = [...paginateQuery, { $limit: +limit }]
  queryCount = [...queryString, {
    $group: {
      _id: null,
      count: { $sum: 1 }
    }
  }]
  queryStringPagin = [
    ...queryString,
    ...projectQuery,
    ...paginateQuery,
    ...productsortlist,
    // {
    //   $group: {
    //     _id: null,
    //     count: { $sum: 1 },
    //     data: { $push: "$$ROOT" }
    //   }
    // },
    // {
    //   $skip: (+page - 1) * +limit,
    // },
    // {
    //   $limit: +limit,
    // },
    // {
    //   $facet: {
    //     paginatedResults: paginateQuery,
    //     totalCount: [
    //       {
    //         $count: 'count'
    //       }
    //     ],
    //     // brands: [{
    //     //   $bucket: {
    //     //     groupBy: "$brand._id",
    //     //     boundaries:[0,200],
    //     //     default:"other",
    //     //     output: {
    //     //       brand: { $mergeObjects: "$brand" },
    //     //       productCount: { "$sum": 1 }

    //     //     }
    //     //   }
    //     // }]
    //   }
    // }
  ]

  queryGroupBrands = [
    ...queryStringBrandGroup,
    // ...pricelookup,
    // ...productmatch,
    // ...productsortlist,
    {
      $group: {
        _id: "$brand._id",
        // brand: { $push: "$$ROOT" },
        brand: { $mergeObjects: "$brand" },
        productCount: { "$sum": 1 }
      }
    }
  ]

  // Logger.info('queryString', queryString)
  Logger.info('queryGroupBrands', queryGroupBrands);
  Logger.info('queryStringPagin', queryStringPagin);

  let [errCount, docs_collection_count] = await to(Product.aggregate(queryCount).exec());
  if (errCount) TE(errCount.message);
  if (!docs_collection_count) TE("Error fetching count");
  Logger.info('docs_collection_count', docs_collection_count)
  let [errProds, docs_collection] = await to(Product.aggregate(queryStringPagin).exec());
  if (errProds) TE(errProds.message);
  if (!docs_collection) TE("Error fetching products");

  [errProds, docs_collection] = await to(Product.populate(docs_collection, [
    { path: "category", select: "name images seo" },
    { path: "composition", select: "_id deleted name slug" },
    { path: "organic", select: "_id deleted name slug" },
    // { path: "brand", select: "_id deleted name slug image" },
    { path: "pricing", select: "listPrice salePrice startDate endDate taxId" },
    {
      path: "attributes.attributeGroup",
      select: "name status attribute_group_code",
    },
    { path: "attributes.value", select: "value status" },
    { path: "medicineType" },
    { path: "stock" },
    // { path: "productExtraInfo" },
  ]))
  if (errProds) TE(errProds.message);
  if (!docs_collection) TE("Error fetching products");
  const [errBrands, docs_collection_brand] = await to(Product.aggregate(queryGroupBrands).exec());
  if (errBrands) TE(errBrands.message);
  // if (!docs_collection_brand) TE("Error fetchingbrands")

  let addInfo = {};
  if (page) addInfo.page = page;
  if (limit) addInfo.limit = limit;
  if (!exclude || (exclude && !exclude.includes('brands_list'))) addInfo.brands_list = docs_collection_brand;
  return {
    count: docs_collection_count.length > 0 ? docs_collection_count[0].count : 0,
    products: docs_collection,
    ...addInfo
  };

};
