'use strict';

const Product = require('../models/product');
const Composition = require('../models/composition');
const validator = require('validator');
const { to, TE, ReE, ReS, deleteFile, saveThumbnails, getDimensions, getIdQuery } = require('../services/util.service');
const mongoose = require("mongoose");
const Logger = require('../logger')
const { seoModel: Seo } = require('../models/seo');
const { imageModel: Image } = require('../models/image');
//use parse-strings-in-object

exports.createProduct = async (param, images, mainImage) => {

    Logger.info(param.productComposition, param.productComposition.constructor === Array)
    const { name, status, category, brand, purchaseCount, minOrderQty,
        maxOrderQty,
        shipping,
        productComposition,
        prescriptionNeeded,
        returnable,
        featured,
        returnPeriod,
        sku,
        tag, metaTitle, metaDescription, metaKeywords, attributes } = param

    let imagesPath = []
    imagesPath = images.map(i => i.path)
    Logger.info(imagesPath)

    const duplicateProduct = await Product.find({ name: name })


    if (duplicateProduct && duplicateProduct.length > 0) {
        imagesPath.map(i => deleteFile(i));
        const err = new Error('Duplicate product');
        err.status = 409;
        throw err
    }

    const thumbnailPaths = await saveThumbnails(imagesPath)
    const thumbnailPathsMainImage = await saveThumbnails(new Array(mainImage[0].path))
    const dimensions = await Promise.all(images.map(i => getDimensions(i.path)))
    const dimensionsMainImage = await getDimensions(mainImage[0].path)
    Logger.info(dimensions)

    const imageDocs = images.map((i, index) => new Image({
        url: i.path,
        thumbnail: thumbnailPaths[index],
        width: dimensions[index].width,
        height: dimensions[index].height
    }));

    const mainImageDoc = new Image({
        url: mainImage[0].path,
        thumbnail: thumbnailPathsMainImage[0],
        width: dimensionsMainImage.width,
        height: dimensionsMainImage.height
    })

    const seo = new Seo({
        metaTitle,
        metaDescription,
        metaKeywords
    })

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
        productComposition,
        prescriptionNeeded,
        returnable,
        featured,
        returnPeriod,
        tag,
        attributes,
        seo,
        images: imageDocs,
        mainImage: mainImageDoc
    });

    // const [err,newProductDoc] = await to(newProduct.save())
    const newProductDoc = await newProduct.save()
    return Product.populate(newProductDoc, 'category productComposition')


}

exports.getAllProducts = async (query) => {
    let dbQuery = {};
    let sortQuery = { updatedAt: -1 };
    if (query.status)
        dbQuery = { status: query.status };
    if (query.priorityOrder)
        dbQuery = { ...dbQuery, priorityOrder: -1 }
    if (query.sort)
        sortQuery = { [query.sort]: -1 }

    const categories = await Product.find(dbQuery).sort(sortQuery);
    if (!categories || categories.length === 0) {
        const err = new Error('No categories');
        throw err
    }
    return categories
}

exports.getProductDetails = async (id) => {
    const query = getIdQuery(id)
    const product = await Product.find(query)
    if (!product || product.length === 0) throw new Error('Product does not exist')
    return product[0]
}

exports.editProduct = () => {

}

