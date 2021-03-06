const mongoose = require('mongoose');

const attributeValueSchema = mongoose.Schema({
    // _id: mongoose.Schema.ObjectId,
    attributeId :{type: mongoose.Schema.Types.ObjectId, ref:'Attrbutes'},
    value: String,
    deleted:{
        type:Boolean, 
        default:false
      }
},
    {
        timestamps: true
    })

    module.exports = mongoose.model('AttributesValues', attributeValueSchema)