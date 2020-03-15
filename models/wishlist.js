const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const wishlistSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.Number },
    products: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        }
      ]
    }
  },
  {
    timestamps: true
  }
);

wishlistSchema.plugin(mongoose_delete);
module.exports = mongoose.model("Wishlist", wishlistSchema);
