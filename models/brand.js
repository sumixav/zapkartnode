const mongoose = require('mongoose')
const { imageSchema } = require("./image");
const { seoSchema } = require("./seo");
const enums = require("../utils/appStatics");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug)


const brandsSchema = mongoose.Schema(
    {

        name: { type: String, required: true },
        // image: { type: String, required: true },
        image: [imageSchema],
        status: {
            type: String,
            enum: Object.values(enums.product.status),
            required: true
        },
        slug: {
            type: String,
            slug: "name",
            index: true,
            slugPaddingSize: 4
        },
        seo: {
            type: seoSchema,
            required: true
        }
    },
    {
        timestamps: true
    }
)

// brandsSchema.pre('save', async function (next) {
//     Logger.info('in pre save brand hook', this.name)
//     const duplicateBrand = await mongoose.models["Brand"].findOne({ name: this.name })
//     if (duplicateBrand) {
//         Logger.info('duplicate brand')
//         const error = getError('Brand with same name already exists', 409)
//         next(error)
//     }
//     else next()
// })

module.exports = mongoose.model('Brand', brandsSchema)