const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { seoSchema } = require("./seo");
const { imageSchema } = require("./image");
const enums = require("../utils/appStatics");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const pricingSchema = Schema({
  startDate: Date,
  endDate: Date,
  listPrice: Number,
  salePrice: Number,
  taxId: { type: Schema.Types.ObjectId, ref: "TaxClass" }
});

const shippingSchema = Schema({
  dimensions: {
    height: Number,
    length: Number,
    width: Number
  },
  weight: Number
});

const productsSchema = Schema(
  {
    // _id: Schema.Types.ObjectId,
    name: { type: String, required: true },
    pricing: { type: pricingSchema, required: false },
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
    mainImage: imageSchema,
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
    minOrderQty: Number,
    maxOrderQty: Number,
    availability: {
      type: String,
      enum: Object.values(enums.product.availablity),
      default: enums.product.availablity.IN_STOCK
    },
    // images: [imageSchema],
    shipping: shippingSchema,
    productComposition: [{ type: Schema.Types.ObjectId, ref: "Composition" }],
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
    // tags: [{ type: Schema.Types.ObjectId, ref: "Tags" }],
    tags: [{ type: Schema.Types.String }],
    seo: [seoSchema],
    // attributes: [
    //   {
    //     attributeGroup: { type: Schema.Types.ObjectId, ref: "Attributes" },
    //     required: false,
    //     values: [
    //       {
    //         type: Schema.Types.ObjectId,
    //         ref: "AttributesValues"
    //       }
    //     ]
    //   }
    // ]
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
