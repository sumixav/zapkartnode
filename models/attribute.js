const mongoose = require('mongoose');
const enums = require('../utils/appStatics')
const AttributeGroupStatus = enums.status;

const attributesSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
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
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Attributes', attributesSchema)
