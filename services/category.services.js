'use strict';

const Category = require('../models/category');
const validator = require('validator');
const { to, TE, ReE, ReS, deleteFile, saveThumbnails, getDimensions, getIdQuery } = require('../services/util.service');
const mongoose = require("mongoose");
const Logger = require('../logger')
const { seoModel: Seo } = require('../models/seo');
const { imageModel: Image } = require('../models/image');
//use parse-strings-in-object

exports.createCategory = async (param, images) => {
    const { name,
        parent,
        description,
        status, metaTitle, metaDescription, metaKeywords, priorityOrder } = param

    let imagesPath = []
    imagesPath = images.map(i => i.path)
    Logger.info(imagesPath)

    const duplicateCategory = await Category.find({ name: name })


    if (duplicateCategory && duplicateCategory.length > 0) { imagesPath.map(i => deleteFile(i)); const err = new Error('Duplicate category'); err.status = 409; throw err }

    const thumbnailPaths = await saveThumbnails(imagesPath)
    const dimensions = await Promise.all(images.map(i => getDimensions(i.path)))
    Logger.info(dimensions)

    const imageDocs = images.map((i, index) => new Image({
        url: i.path,
        thumbnail: thumbnailPaths[index],
        width: dimensions[index].width,
        height: dimensions[index].height
    }))
    Logger.info(imageDocs)
    const _id = new mongoose.Types.ObjectId;
    let idPath;
    if (parent) {
        const docParent = await Category.findOne({
            _id: parent
        })


        idPath = [...docParent.idPath, _id]
    }
    else {
        idPath = [_id]
    }
    const seo = new Seo({
        metaTitle,
        metaDescription,
        metaKeywords
    })

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

    const newCategoryDoc = await newCategory.save()

    return newCategoryDoc
}

exports.getAllCategories = async (query) => {
    let dbQuery = {};
    let sortQuery = { updatedAt: -1 };
    if (query.status)
        dbQuery = { status: query.status };
    if (query.priorityOrder)
        dbQuery = { ...dbQuery, priorityOrder: -1 }
    if (query.sort)
        sortQuery = { [query.sort]: -1 }

    const categories = await Category.find(dbQuery).sort(sortQuery);
    if (!categories || categories.length === 0) {
        const err = new Error('No categories');
        throw err
    }
    return categories
}

exports.getCategoryDetails = async (id) => {
    const query = getIdQuery(id)
    const category = await Category.find(query)
    if (!category || category.length === 0) throw new Error('Category does not exist')
    return category[0]
}

exports.editCategory = () => {

}

