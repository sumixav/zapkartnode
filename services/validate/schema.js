
const { product: productEnum } = require('../../utils/appStatics');

exports.productsSchema = {
    "properties": {
      "name": {
        "type": "string"
      },
      "height": {
        "type": "string"
      },
      "length": {
        "type": "string"
      },
      "width": {
        "type": "string"
      },
      "weight": {
        "type": "string"
      },
      "sku": {
        "type": "string"
      },
      "status": {
        "enum": Object.values(productEnum.status)
      },
      "availability": {
        "enum": Object.values(productEnum.availablity)
      },
      "category": {
        "type": "string"
      },
      "brand": {
        "type": "string"
      },
      "purchaseCount": {
        "type": "string"
      },
      "minOrderQty": {
        "type": "string"
      },
      "maxOrderQty": {
        "type": "string"
      },
      "shipping": {
        "type": "string"
      },
      "productComposition": {
        "type": "array"
      },
      "prescriptionNeeded": {
        "type": "string"
      },
      "returnable": {
        "type": "string"
      },
      "featured": {
        "type": "string"
      },
      "returnPeriod": {
        "type": "string"
      },
      "tag": {
        "type": "string"
      },
      "metaTitle": {
        "type": "string"
      },
      "metaDescription": {
        "type": "string"
      },
      "metaKeywords": {
        "type": "string"
      },
      "attributes": {
        "type": "string"
      },
  
    },
    "required": ["name", "status", "category", "brand", "purchaseCount", "minOrderQty",
      "maxOrderQty",
      "productComposition",
      "prescriptionNeeded",
      "returnable",
      "returnPeriod",
      "metaTitle", "metaDescription", "metaKeywords", "height", "length", "width", "weight"]
  }

  exports.brandSchema = {
    "properties": {
      "name": {
        "type": "string"
      },
      "status": {
        "enum": Object.values(productEnum.status)
      },
      "metaTitle": {
        "type": "string"
      },
      "metaDescription": {
        "type": "string"
      },
      "metaKeywords": {
        "type": "string"
      },
    },
    "required": ["name"]
  }