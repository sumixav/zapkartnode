'use strict';

const cleanDeep = require('clean-deep')
const Brand = require('../models/brand');
const Composition = require('../models/composition');
const validator = require('validator');
const { to, TE, ReE, ReS, deleteFile, saveThumbnails, getDimensions, getIdQuery, isEmpty } = require('../services/util.service');
const mongoose = require("mongoose");
const Logger = require('../logger')
const { seoModel: Seo } = require('../models/seo');
const { imageModel: Image } = require('../models/image');
//use parse-strings-in-object

exports.createBrand = async (param) => {


    const { name, status, metaTitle,
        metaDescription,
        metaKeywords, image: images } = param

    let imagesPath = []
    imagesPath = images.map(i => i.path)
    Logger.info(imagesPath)

    const duplicateBrand = await Brand.find({ name: name })


    if (duplicateBrand && duplicateBrand.length > 0) {
        imagesPath.map(i => deleteFile(i));
        const err = new Error('Duplicate brand');
        err.status = 409;
        throw err
    }

    const thumbnailPaths = await saveThumbnails(imagesPath)

    const dimensions = await Promise.all(images.map(i => getDimensions(i.path)))

    Logger.info(dimensions)

    const imageDocs = images.map((i, index) => new Image({
        url: i.path,
        thumbnail: thumbnailPaths[index],
        width: dimensions[index].width,
        height: dimensions[index].height
    }));

    const seo = new Seo({
        metaTitle,
        metaDescription,
        metaKeywords
    })

    const newBrand = new Brand({
        // _id,
        name,
        status,

        seo,
        image: imageDocs,
    });



    // const [err,newBrandDoc] = await to(newBrand.save())
    const newBrandDoc = await newBrand.save()
    return newBrandDoc


}

exports.getAllBrands = async (query) => {
    let dbQuery = {};
    let sortQuery = { updatedAt: -1 };
    if (query.status)
        dbQuery = { status: query.status };
    if (query.priorityOrder)
        dbQuery = { ...dbQuery, priorityOrder: -1 }
    if (query.sort)
        sortQuery = { [query.sort]: -1 }

    const brands = await Brand.find(dbQuery).sort(sortQuery);
    if (!brands || brands.length === 0) {
        const err = new Error('No brands');
        throw err
    }
    return brands
}

exports.getBrandDetails = async (id) => {
    const query = getIdQuery(id)
    const brand = await Brand.find(query)
    if (!brand || brand.length === 0) throw new Error('Brand does not exist')
    return brand[0]
}

exports.editBrand = async (params, image) => {
    const { newImages,
        deletedImages } = image
    const { brandId } = params
    Logger.info(deletedImages)
    const query = getIdQuery(brandId)
    const [err, brand] = await to(Brand.findOne(query))
    if (err) throw new Error('Database error while finding brand')
    if (!brand) throw new Error('No such brand exists')
    const fieldsToEdit = cleanDeep({ status: params.status, name: params.name })
    let deletedImagesA = [];
    let newImagesA = [];
    if (deletedImages && deletedImages.length > 0) {
        // deletedImages.forEach(i => brand.image.pull({_id:i}))
        deletedImagesA = deletedImages;
    }
    Logger.info(deletedImagesA)
    if (newImages && newImages.length > 0) {
        newImages.forEach(async i => {
            const thumbnail = await saveThumbnails(new Array(i.path))
            const dimensions = await getDimensions(i.path)
            const newImageSchema = new Image({
                url: i.path,
                thumbnail: thumbnail[0],
                width: dimensions.width,
                height: dimensions.height
            });
            newImagesA.push(newImageSchema)
            // brand.image.push(newImageSchema)
        })
    }

    let firstUpdate = {};
    let secondUpdate = {};

    if (!isEmpty(deletedImagesA))
        firstUpdate = {
            $pull: {
                image: { _id: { $in: deletedImagesA } }
            },
        }
    if (!isEmpty(fieldsToEdit))
        firstUpdate = { ...firstUpdate, $set: fieldsToEdit }
    if (!isEmpty(newImagesA))
        secondUpdate = { $push: { image: { $each: newImagesA } } }


    // firstUpdate = cleanDeep(firstUpdate);
    // secondUpdate = cleanDeep(secondUpdate)
    console.log('firstUpdate', firstUpdate, `{ $in: [${deletedImages}] }`)
    console.log('secondUpdate', secondUpdate)
    //$pull deletedImages from images & modify title, mainImage
    if (!isEmpty(firstUpdate)) {
        const [errA, firstUpdateStatus] = await to(Brand.update({ _id: brandId }, firstUpdate, {
            multi: true
        }));
        Logger.info(errA, firstUpdateStatus)
        if (errA || (!firstUpdateStatus.nModified === 1 && !firstUpdateStatus.ok === 1))
            throw new Error("Error updating data");
        brand.image.forEach(i => { deleteFile(i.url); deleteFile(i.thumbnail) })
    }

    if (!isEmpty(secondUpdate)) {
        const [errB, secondUpdateStatus] = await to(Brand.update({ _id: brandId }, secondUpdate, {
            multi: true
        }));
        Logger.info(errB, secondUpdateStatus)
        if (errB || (!secondUpdateStatus.nModified === 1 && !secondUpdateStatus.ok === 1))
            throw new Error("Error updating data");
    }

    // const updatedBrand = await brand.save()
    const updatedBrand = await Brand.findOne({ _id: brandId });
    Logger.info(updatedBrand)
    return updatedBrand

}

