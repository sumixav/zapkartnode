const mongoose = require("mongoose");
const { enums } = require("../utils/appStatics");
const slug = require("mongoose-slug-updater");
const { seoSchema } = require("./seo");
const { imageSchema } = require("./image");
mongoose.plugin(slug)

const categorySchema = mongoose.Schema(
  {
    // _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true, unique:true
     },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    images: {
      type: [imageSchema],
      required: false,
    },
    idPath: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
      }
    ],
    description: String,
    seo: seoSchema,
    status: {
      type: String,
      enum: Object.values(enums.status),
      required: true
    },
    slug: {
      type: String,
      slug: "name",
      index: true,
      // unique: true,
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

// categorySchema.pre('insertMany', function(next) {
//   console.log('koala', this.name);
//   // next()
// });

// categorySchema.pre('find', function(next) {

//   console.log('in category pre find', this)
//    next()
// });

// categorySchema.pre('update', function(next) {

//   console.log('in category pre update')
//    next()
// });
// categorySchema.pre('findOne', function(next) {

//   console.log('in category pre findOne')
//    next()
// });


module.exports = mongoose.model("Category", categorySchema);
