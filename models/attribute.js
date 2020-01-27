const mongoose = require('mongoose');
const { enums } = require('../utils/appStatics')
const AttributeGroupStatus = enums.status;
const slug = require('mongoose-slug-updater')
mongoose.plugin(slug)

const attributesSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    priorityOrder: { type: Number, default: 0 },
    // attribute_group_code: { type: String, required: true },
    attribute_group_code: {
      type: String,
      slug: "name",
      index: true,
      unique: true,
      slugPaddingSize: 4
    },
    values: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AttributesValues' }],
    status: {
      type: String,
      enum: Object.values(AttributeGroupStatus),
      required: true
    },
    deleted: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true
  }
)

// attributesSchema.pre('update', async function (next) {
//   console.log('in save', this, this.deleted);
//   next()
// });

module.exports = mongoose.model('Attributes', attributesSchema)
