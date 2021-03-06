const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const enums = require("../utils/appStatics");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

// id name attribute sku
const variantSchema = Schema(
    {
        deleted: {
            type: Boolean,
            default: false
        },
        name: { type: String, required: true },
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        slug: {
            type: String,
            slug: "name",
            index: true,
            slugPaddingSize: 4
        },
        sku: { type: String, required: true },
        status: {
            type: String,
            enum: Object.values(enums.product.status),
            required: true
        },
        
        // images: [imageSchema],
        // shipping: shippingSchema,

        attributes: [
            {
                attributeGroup: { type: Schema.Types.ObjectId, ref: "Attributes" },
                required: false,
                values: [
                    {
                        type: Schema.Types.ObjectId,
                        ref: "AttributesValues"
                    }
                ]
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Variant", variantSchema);
