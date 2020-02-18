const mongoose = require("mongoose");
const { imageSchema } = require("./image");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const bannerSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    shortDescription: { type: String, default: "" },
    width: { type: Number },
    height: { type: Number },
    status: {
      type: String,
      enum: ["active", "hold"],
      required: true
    },
    images: {
      type: [imageSchema],
      required: false,
    },
    slug: {
      type: String,
      slug: "name",
      index: true,
      slugPaddingSize: 4
    },
    priorityOrder: {
      type: Number,
      default: 0
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

module.exports = mongoose.model("Banner", bannerSchema);
