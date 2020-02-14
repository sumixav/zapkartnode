const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const organicSchema = mongoose.Schema(
  {
    // _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true, unique: true, index: true },
    deleted: {
      type: Boolean,
      default: false
    },
    slug: {
      type: String,
      slug: "name",
      index: true,
      unique: true,
      slugPaddingSize: 4
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Organic", organicSchema);
