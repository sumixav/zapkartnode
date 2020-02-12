const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
// mongoose.plugin(slug);

const medicineTypeSchema = mongoose.Schema(
  {
    // _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true, unique: true },
    deleted: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("MedicineType", medicineTypeSchema);
