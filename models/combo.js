const mongoose = require("mongoose");
const { imageSchema } = require("./image");
const Schema = mongoose.Schema;
const { enums } = require("../utils/appStatics");

const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const comboSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    // image: { type: String, required: true },
    image: [imageSchema],
    status: {
      type: String,
      enum: ["active", "hold"],
      required: true
    },
    slug: {
      type: String,
      slug: "name",
      index: true,
      slugPaddingSize: 4
    },
    description: { type: String },
    price: { type: Number, required: true },
    product: {
        type: [
          {
            type: Schema.Types.ObjectId,
            ref: "Category"
          }
        ],
        required: true,
        validate: [a => a.length > 0, "At least one category required"]
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




module.exports = mongoose.model("Combo", comboSchema);


