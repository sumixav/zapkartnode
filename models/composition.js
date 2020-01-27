const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const compositionSchema = mongoose.Schema(
  {
    // _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    deleted: {
      type: Boolean,
      default: false
    },
    slug: {
      type: String,
      slug: "name",
      index: true,
      slugPaddingSize: 4
    },
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Composition', compositionSchema)
