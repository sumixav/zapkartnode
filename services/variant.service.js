const Category = require('../models/category');
const validator = require('validator');
const { to, TE, ReE, ReS, deleteFile, saveThumbnails, getDimensions, getIdQuery } = require('../services/util.service');
const mongoose = require("mongoose");
const Logger = require('../logger')
const { imageModel: Image } = require('../models/image');

exports.createVariant = (params, images) => {
    const { name, product, sku, status, purchaseCount,
        availability,
        attributes } = params;
    
    
}