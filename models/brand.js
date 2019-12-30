const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-updater')
const { imageSchema } = require("./image");
const enums = require("../utils/appStatics");
const { seoSchema } = require("./seo");

const brandSchema = Schema(
    {
        name: {
            type: String,
            required: true
        },
        key: {
            type: String,
            required: true
        },
        icon: {
            type: [imageSchema],
            required: false,
        },
        seo: seoSchema,
        status: {
            type: String,
            enum: Object.values(enums.status),
            required: true
          }
    },
    {
        timestamps: true
    }
)

module.exports = {
    brandModel: mongoose.model("Brand", brandSchema),
    brandSchema
}