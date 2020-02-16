const mongoose = require("mongoose");
const { seoSchema } = require("./seo");

const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const infosSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    shortDescription: { type: String, default: "" },
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
    priorityOrder: {
      type: Number,
      default: 0
    },
    htmlContent: {
      type: String,
      required: true
    },
    seo: {
      type: seoSchema,
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

module.exports = mongoose.model("Information", infosSchema);
