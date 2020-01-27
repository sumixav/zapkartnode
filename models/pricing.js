const mongoose = require('mongoose');


const pricingSchema = mongoose.Schema(
    {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        listPrice: { type: Number, required: true },
        salePrice: { type: Number, required: true },
        taxId: { type: mongoose.Schema.Types.ObjectId, ref: "TaxClass", required: true }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Pricing', pricingSchema)
