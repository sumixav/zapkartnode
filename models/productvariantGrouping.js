
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const productvariantGroupingSchema = Schema({
    productId:[{
        type : Schema.Types.ObjectId,
        ref:"Product"
    }],
    variantId:[{
        type : Schema.Types.ObjectId,
        ref:"Variant"
    }]
})

module.exports = mongoose.model("ProductVariantGrouping", productvariantGroupingSchema);