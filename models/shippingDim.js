const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { enums } = require("../utils/appStatics");

// const lengthClassSchema = Schema({})

const shippingDimSchema = Schema({
    dimensions: {
        height: {
            value: Number,
            unit: {
                type: String,
                enum: Object.values(enums.lengthClass)
            }
        },
        length: {
            value: Number,
            unit: {
                type: String,
                enum: Object.values(enums.lengthClass)
            }
        },
        width: {
            value: Number,
            unit: {
                type: String,
                enum: Object.values(enums.lengthClass)
            }
        }
    },
    weight: {
        value: Number,
        unit: {
            type: String,
            enum: Object.values(enums.weightClass)
        }
    }
});

module.exports = {
    shippingDimModel: mongoose.model("ShippingDim", shippingDimSchema),
    shippingDimSchema
    // lengthClassSchema,
    // weightClassSchema
};
