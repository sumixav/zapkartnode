const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-updater')

const seoSchema = Schema(
    {
        metaTitle: {
            type: String,
            default:''
        },
        metaDescription: {
            type: String,
            default:''
        },
        metaKeywords: {
            type: String,
            // required: true
            default:''
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