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

<<<<<<< HEAD
module.exports = {
    brandModel: mongoose.model("Brand", brandSchema),
    brandSchema
}
=======
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
>>>>>>> d5df668b6cb396ebd300b478011a1ea3dcff8ef6
