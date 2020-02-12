const mongoose = require("mongoose");
// const slug = require("mongoose-slug-updater");
const { enums } = require("../utils/appStatics");
// mongoose.plugin(slug);

const stockSchema = mongoose.Schema(
    {
        subtract: { type: Boolean, required: true },
        outOfStockStatus: {
            type: String,
            enum: Object.values(enums.outOfStockStatus),
            required: true
        },
        quantity: {
            type: Number,
            default: 0,
            required: true
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

module.exports = mongoose.model("Stock", stockSchema);
