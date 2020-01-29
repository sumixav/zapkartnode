
const { enums } = require('../../utils/appStatics');


exports.productsSchema = {
  "properties": {
    "name": {
      "type": "string"
    },
    "startDate": {
      "type": "string"
    },
    "endDate": {
      "type": "string"
    },
    "listPrice": {
      "type": "number"
    },
    "salePrice": {
      "type": "number"
    },
    "taxId": {
      "type": "string"
    },
    "height": {
      "type": "number"
    },
    "length": {
      "type": "number"
    },
    "width": {
      "type": "number"
    },
    "weight": {
      "type": "number"
    },
    "sku": {
      "type": "string"
    },
    "status": {
      "enum": Object.values(enums.status)
    },
    "availability": {
      "enum": Object.values(enums.product.availablity)
    },
    "category": {
      "type": "array",
      "items": {
        "type": "string",
      }
    },
    "brand": {
      "type": "string"
    },
    "purchaseCount": {
      "type": "number"
    },
    "minOrderQty": {
      "type": "number"
    },
    "maxOrderQty": {
      "type": "number"
    },
    "composition": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "prescriptionNeeded": {
      "type": "boolean"
    },
    "returnable": {
      "type": "boolean"
    },
    "featured": {
      "type": "boolean"
    },
    "returnPeriod": {
      "type": "number"
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
      "type": "array",
      "items": { "$ref": "#/definitions/attribute" }
    },
    "variantType": {
      "enum": ["single", "multiple"]
    }
  },
  "definitions": {
    "attribute": {
      "type": "object",
      "required": ["attributeGroup", "value"],
      "properties": {
        "attributeGroup": { "type": "string" },
        "attributeGroup": { "type": "string" },
      }
    }
  },
  "required": [
    "name",
    "status",
    "category",
    "brand",
    "listPrice",
    "salePrice",
    "taxId",
    "startDate",
    "endDate",
    "variantType",
    "purchaseCount",
    // "minOrderQty",
    // "maxOrderQty",
    "composition",
    "prescriptionNeeded",
    "returnable",
    // "returnPeriod",
    "metaTitle",
    "metaDescription",
    "metaKeywords",
    "height", "length", "width", "weight"]
}

exports.brandSchema = {
  "properties": {
    "name": {
      "type": "string"
    },
    "status": {
      "enum": ["active", "hold"]
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

exports.categorySchema = {
  "properties": {
    "name": {
      "type": "string"
    },
    "status": {
      "enum": ["active", "hold"]
    },
    "parent": {
      "type": "string"
    },
    "description": {
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
    "priorityOrder": {
      "type": "number"
    },
    "image": {
      "type": "array"
    },
  },
  "required": ["name", "description", "metaTitle", "metaDescription", "metaKeywords", "priorityOrder"]
}

exports.editCategorySchema = {
  "properties": {
    "name": {
      "type": "string"
    },
    "status": {
      "enum": Object.values(enums.status)
    },
    "parent": {
      "type": "string"
    },
    "description": {
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
    "priorityOrder": {
      "type": "number"
    },
    "image": {
      "type": "array"
    },
    "deletedImages": {
      "type": "array"
    },
  },

}

exports.editAttributesSchema = {
  "properties": {
    "name": {
      "type": "string"
    },
    "status": {
      "enum": Object.values(enums.status)
    },
    "editedValues": {
      "type": "array"
    },
    "deletedValues": {
      "type": "array"
    },
    "newValues": {
      "type": "array"
    },
  },
}