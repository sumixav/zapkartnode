const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-updater')

const seoSchema = Schema(
    {
        metaTitle: {
            type: String,
            required: true
        },
        metaDescription: {
            type: String,
            required: true
        },
        metaKeywords: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = {
    seoModel: mongoose.model("Seo", seoSchema),
    seoSchema
}