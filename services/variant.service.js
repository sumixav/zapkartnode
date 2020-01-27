const validator = require('validator');
const { to, TE, ReE, ReS, deleteFile, saveThumbnails, getDimensions, getIdQuery } = require('../services/util.service');
const mongoose = require("mongoose");
const Logger = require('../logger')
const { imageModel: Image } = require('../models/image');
const Variant = require('../models/variant');
const ProductvariantGrouping = require('../models/productvariantGrouping');

exports.createVariant = async (params) => {
    const { name, product, sku, status,
        attributes, attributeValues } = params;
        const _id = new mongoose.Types.ObjectId;
        const newVariant = new Variant({
            _id,
            name,
            product,
            status,
            sku,
            attributes: {
                attributeGroup: attributes,
                values:attributeValues
            }
          
        });
    
        const [err,variantDetails] = await newVariant.save();
        if(err) { return err; }
        if(variantDetails) {
            const variantgrouping = new ProductvariantGrouping({
                productId:product,
                variantId:_id
            });
            const [err,variantproduct] = await to(variantgrouping.save());
        if(err) { return err; }
        }
        return variantDetails;
    
}

exports.getAllVariants = async (query) => {
    let dbQuery = {};
    let sortQuery = { updatedAt: -1 };
    if (query.status)
        dbQuery = { status: query.status };
    if (query.priorityOrder)
       sortQuery = { ...sortQuery, priorityOrder: -1 }
    if (query.sort)
        sortQuery = { [query.sort]: -1 }
        Logger.info("mmmmmmmmmmmmmmmm",dbQuery);
    const variants = await Variant.find(dbQuery).sort(sortQuery);
    if (!variants || variants.length === 0) {
        const err = new Error('No variants');
        throw err
    }
    return variants
}