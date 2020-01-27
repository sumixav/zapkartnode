const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const imageSchema = Schema(
    {
        url: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        width: { type: Number, requirred: true },
        height: { type: Number, requirred: true },
        title: {
            type: String,
            default: " ",
            // required: true,
        }
    },
    {
        timestamps: true
    }
);
module.exports = {
    imageModel: mongoose.model("Image", imageSchema),
    imageSchema: imageSchema
};
