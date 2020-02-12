const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const enums = require('../utils/appStatics')
mongoose.plugin(slug);

const taxClassSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        status: {
            type: String,
            enum: ["active", "hold"],
            required: true
        },
        slug: {
            type: String,
            slug: 'name',
            index: true,
            slugPaddingSize: 4
        },
        deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('TaxClass', taxClassSchema, 'taxClass');
