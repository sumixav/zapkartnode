const mongoose = require('mongoose');

const compositionSchema = mongoose.Schema(
  {
    // _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Composition', compositionSchema)
