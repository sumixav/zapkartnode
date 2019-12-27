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
        width: Number,
        height: Number,
        title: {
            type: String,
            default: ''
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
