const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const shippingDimSchema = Schema({
    dimensions: {
        height: Number,
        length: Number,
        width: Number
    },
    weight: Number
});

module.exports = {
    shippingDimModel: mongoose.model("ShippingDim", shippingDimSchema),
    shippingDimSchema
}