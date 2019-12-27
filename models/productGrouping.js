
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const productGroupingSchema = Schema({
    productId:[{
        type : Schema.Types.ObjectId,
        ref:"Product"
    }]
})

module.exports = mongoose.model("ProductGrouping", productGroupingSchema);