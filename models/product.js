const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { seoSchema } = require("./seo");
const { imageSchema } = require("./image");
const { shippingDimSchema } = require("./shippingDim");
// const { enums } = require("../utils/appStatics");
const slug = require("mongoose-slug-updater");
const shortId = require("shortid")
mongoose.plugin(slug);

// const pricingSchema = Schema({
//   startDate: Date,
//   endDate: Date,
//   listPrice: Number,
//   salePrice: Number,
//   taxId: { type: Schema.Types.ObjectId, ref: "TaxClass" }
// });



const productsSchema = Schema(
  {
    // _id: {
    //   type: String,
    //   unique: true,
    //   index: true,
    //   default: function () {
    //     if (this.parentId)
    //       return (`${this.parentId}_${shortId.generate()}`);
    //     return shortId.generate()
    //   }
    // },
    name: { type: String, required: true },
    pricing: { type: Schema.Types.ObjectId, ref: "Pricing", required: true },
    slug: {
      type: String,
      slug: "name",
      index: true,
      slugPaddingSize: 4
    },
    sku: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "hold"],
      required: true
    },
    // mainImage: imageSchema,
    images: [imageSchema],
    category: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Category"
        }
      ],
      required: true,
      validate: [a => a.length > 0, "At least one category required"]
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand"
    },
    purchaseCount: { type: Number },
    minOrderQty: { type: "Number", required: false },
    maxOrderQty: { type: "Number", required: false },
    availability: {
      type: String,
      enum: ['in-stock', 'unavailable'],
      default: 'in-stock'
    },
    // images: [imageSchema],
    shipping: shippingDimSchema,
    composition: [{ type: Schema.Types.ObjectId, ref: "Composition" }],
    prescriptionNeeded: Boolean,
    returnable: {
      type: Boolean,
      required: true
    },
    featured: Boolean,

    // medicineType: {
    //   type: String,
    //   enum: Object.values(enums.MedicineType),
    //   required: true
    // },
    returnPeriod: {
      type: Number,
      required: function () {
        return this.returnable;
      }
    },
    priorityOrder: {
      type: Number,
      default: 0
    },
    // tags: [{ type: Schema.Types.ObjectId, ref: "Tags" }],
    tags: [{ type: Schema.Types.String }],
    seo: seoSchema,
    parentId: {
      type: String,
      default: null,
      ref: "Product"
    },
    variantCount: {
      type: Number,
      required: function () {
        return this.parentId === null;
      },
      default: 0,
    },
    variantType: {
      type: "String",
      enum: ['single', 'multiple'] // single, multiple
    },
    attributes: [
      {
        attributeGroup: { type: Schema.Types.ObjectId, ref: "Attributes" },
        required: false,
        value: {
          type: Schema.Types.ObjectId,
          ref: "AttributesValues"
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// productsSchema.pre('deleteOne', async function(next){
//   // const product = this.find
//   next()
// })

// module.exports = {
//   Product: mongoose.model("Product", productsSchema),
//   Pricing: mongoose.model("Pricing", pricingSchema),
//   Shiping: mongoose.model("Shipping", shippingSchema),
//   Image: mongoose.model("_Image", imageSchema),
//   MainImage: mongoose.model("_MainImage", mainImageSchema)
// };
module.exports = mongoose.model("Product", productsSchema);
