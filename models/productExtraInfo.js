const mongoose = require("mongoose");
const Schema = mongoose.Schema;


// description, keyBenefits, directionsForUse, safetyInfo, otherInfo, 
const productExtraInfoSchema = Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    description: { type: String, default: '' },
    keyBenefits: { type: String, default: '' },
    directionsForUse: { type: String, default: '' },
    safetyInfo: { type: String, default: '' },
    otherInfo: { type: String, default: '' },
  },
  {
    timestamps: true,
    selectPopulatedPaths: false
  }
);

module.exports = mongoose.model("ProductExtraInfo", productExtraInfoSchema);
