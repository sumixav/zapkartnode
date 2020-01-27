'use strict';

const Product = require('../models/product');
const Pricing = require('../models/pricing');
const Composition = require('../models/composition');
const { shippingDimModel: ShippingDim } = require('../models/shippingDim');
const validator = require('validator');
const { to, TE, ReE, ReS, deleteFile, saveThumbnails, saveThumbnail, getDimensions, getIdQuery } = require('../services/util.service');
const mongoose = require("mongoose");
const Logger = require('../logger')
const { seoModel: Seo } = require('../models/seo');
const { imageModel: Image } = require('../models/image');
const { STRINGS } = require("../utils/appStatics")
const { transformProduct } = require("./transforms")
//use parse-strings-in-object

exports.isParentIdValid = async (id) => {
    const [err, parentProduct] = await to(Product.findOne({ _id: id }));
    if (err) throw err;
    if (parentProduct) return true;
    return false;
}

exports.createProduct = async (param) => {
    const {
        length, width, height, weight,
        startDate,
        endDate,
        listPrice,
        salePrice,
        taxId,
        variantType, parentId,
        name, status, category, brand, purchaseCount, minOrderQty,
        maxOrderQty,
        shipping,
        composition,
        prescriptionNeeded,
        returnable,
        featured,
        returnPeriod,
        sku,
        tag, metaTitle, metaDescription, metaKeywords, attributes: attributesJSON, images } = param

    const attributes = JSON.parse(attributesJSON)

    const duplicateProduct = await Product.find({ name: name })


    if (duplicateProduct && duplicateProduct.length > 0) {
        images.map(i => deleteFile(i.path));
        const err = new Error('Duplicate product');
        err.status = 409;
        throw err
    };

    let parentProdDoc = null;
    if (typeof parentId !== "undefined" && typeof parentId !== "null") {
        parentProdDoc = await Product.findOne({ _id: parentId });
        Logger.info('parentProdDoc', parentProdDoc)
        if (!parentProdDoc) throw new Error("Invalid parent ID");
        parentProdDoc.variantCount = parentProdDoc.variantCount + 1;
    }

    //  const thumbnailPaths = await saveThumbnails(imagesPath)
    // const thumbnailPathsMainImage = await saveThumbnails(new Array(mainImage[0].path))
    // const dimensions = await Promise.all(images.map(i => getDimensions(i.path)))
    // const dimensionsMainImage = await getDimensions(mainImage[0].path)
    // Logger.info(dimensions)

    const imageDocs = await Promise.all(images.map(async i => {
        const thumbnail = await saveThumbnail(i.path);
        const dimensions = await getDimensions(i.path)
        return new Image({
            url: i.path,
            thumbnail,
            width: dimensions.width,
            height: dimensions.height
        })
    }));

    Logger.info(imageDocs)

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
            length, width, height
        },
        weight

    })

    const attributesDoc = attributes.map(i => ({
        attributeGroup: i.attributeGroup,
        value: i.value
    }));

    const pricing = new Pricing({
        startDate,
        endDate,
        listPrice,
        salePrice,
        taxId,
    })

    const [errPricing, pricingDoc] = await to(pricing.save());
    if (errPricing) throw new Error('Error while saving pricing');
    if (!pricingDoc) throw new Error('No pricing created');

    const newProduct = new Product({
        // _id,
        name,
        sku,
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
        tag,
        attributes: attributesDoc,
        seo,
        images: imageDocs,
        attributes: attributesDoc,
        variantType: parentProdDoc ? "multiple" : "single",
        parentId,
        pricing: pricingDoc._id,
        shipping: shippingDim
        // mainImage: mainImageDoc
    });


    const [errProd, newProductDoc] = await to(newProduct.save());

    let errParent = null;
    Logger.info(parentProdDoc);
    if (parentProdDoc) {
        let [errParent, updatedParentProdDoc] = await to(parentProdDoc.save());
        Logger.info(updatedParentProdDoc)
        if (errParent) Logger.error(errParent)
    }
    if (errProd) Logger.error(errProd);
    if (errProd || errParent) throw new Error('Error while saving to database');
    if (!newProductDoc) throw new Error('Oopss..')
    return Product.populate(newProductDoc, 'category composition pricing')


}

exports.getAllProducts = async (query) => {
    let dbQuery = {};
    let sortQuery = { updatedAt: -1 };
    if (query.status)
        dbQuery = { status: query.status };
    // if (query.priorityOrder)
    //     dbQuery = { ...dbQuery, priorityOrder: -1 }
    if (query.sort)
        sortQuery = { [query.sort]: -1 }

    const products = await Product.find(dbQuery)
        .sort(sortQuery).populate('category', 'name')
        .populate('composition', '_id deleted name slug')
        .populate('brand', '_id deleted name slug image')
        .populate('pricing', 'listPrice salePrice startDate endDate')
        .populate('attributes.attributeGroup', 'name status attribute_group_code')
        .populate('attributes.value', 'value status');
    if (!products || products.length === 0) {
        const err = new Error('No products');
        throw err
    }
    return products.map(i => transformProduct(i))
    // return products
}

exports.getProductDetails = async (id) => {
    const query = getIdQuery(id)
    const product = await Product.findOne({ ...query, deleted: false })
    if (!product) throw new Error(STRINGS.NOT_EXIST)
    return product
}

exports.editProduct = async (params, query) => {
    const { productId } = params;
    const dbQuery = getIdQuery(productId);
    // const mainImageFile = req.files["mainImage"][0];
    // const imagesFiles = req.files["images"];
    Logger.info(params)

    const product = await Product.findOne(dbQuery);
    if (!product) throw new Error(STRINGS.NOT_EXIST);
    const pricing = await Pricing.findOne({ _id: product.pricing._id });
    const seoModel = new Seo({
        metaTitle: product.seo.metaTitle,
        metaDescription: product.seo.metaDescription,
        metaKeywords: product.seo.metaKeywords
    })
    const promises = await Object.entries(params)
        .map(async ([key, value]) => {
            switch (key) {
                case 'returnable':
                    if (value === "false");
                    // product.returnPeriod = undefined;
                    product.returnPeriod = null;
                    break;
                case 'deletedImages':
                    value.map(i => product.images.pull({ _id: i }));
                    // return Promise.resolve(1)
                    break;
                case 'images':
                    Logger.info(value)
                    const imageDocs = await Promise.all(value.map(async i => {
                        const thumbnail = await saveThumbnail(i.path);
                        const dimensions = await getDimensions(i.path)
                        return new Image({
                            url: i.path,
                            thumbnail,
                            width: dimensions.width,
                            height: dimensions.height
                        });
                    }));
                    Logger.info(imageDocs);
                    return imageDocs.map(i => product.images.push(i))
                    // return Promise.resolve(1);
                    break;
                case 'listPrice':
                case 'salePrice':
                case 'startDate':
                case 'endDate':
                case 'taxId':
                    if (pricing) {
                        pricing[key] = value
                    }
                    // product.pricing[key] = value;
                    // Promise.resolve(1);
                    break;
                case 'length':
                case 'width':
                case 'height':
                    product.shipping.dimensions[key] = value;
                    // return Promise.resolve(1)
                    break;
                case 'weight':
                    product.shipping[key] = value;
                    // return Promise.resolve(1)
                    break;
                case 'metaTitle':
                case 'metaDescription':
                case 'metaKeywords':
                    seoModel[key] = value;
                    break;
                case 'attributes':
                    const attr = JSON.parse(value);
                    product.attributes = []
                    // product.attributes
                    //     .filter(i => i.attributeGroup !== attr.attributeGroup)
                    //     .map(i => product.attributes.pull({ attributeGroup: i.attributeGroup }));
                    attr.map(i => product.attributes.push({
                        attributeGroup: i.attributeGroup,
                        value: i.value
                    }));
                    // return Promise.resolve(1)

                    break;
                default:
                    product[key] = value;
                    // return Promise.resolve(1)
                    break;
            }
        });
    const b = await Promise.all(promises)
    Logger.info(b)
    product.seo = seoModel
    await pricing.save();
    const updatedProduct = await product.save();
    const populatedProd = await Product.populate(updatedProduct, 'category composition pricing brand attributes.attributeGroup attributes.value')
    Logger.info(populatedProd);
    return transformProduct(populatedProd)
}


exports.deleteProduct = async id => {
    const a = await Product.findOne({ _id: id });
    if (!a) throw new Error(STRINGS.INVALID_ID);
    if (a.deleted === true) throw new Error(STRINGS.NOT_EXIST);
    // main product with  no variants
    if (a.parentId === null) {
        const b = await Product.update({ _id: id }, { deleted: true });
        Logger.info(b);
        if (b.ok === 1 && b.nModified === 1) return true;
    };

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



