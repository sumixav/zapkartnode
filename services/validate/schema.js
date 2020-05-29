
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
    "lengthClass": {
      "type": Object.values(enums.lengthClass)
    },
    "weightClass": {
      "type": Object.values(enums.weightClass)
    },
    "sku": {
      "type": ["string, integer"]
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
    "organic": {
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
      "type": ["number", "null"]
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
    },
    "quantity": {
      "type": "number"
    },
    "subtract": {
      "type": "boolean"
    },
    "outOfStockStatus": {
      "enum": Object.values(enums.outOfStockStatus)
    },
    "textDescription": {
      "type": "string"
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
    "height", "length", "width", "weight", "weightClass", "lengthClass"]
}

exports.medicineTypesBulkSchema = {
  "properties": {
    "data": {
      "type": "array",
      "items": { "$ref": "#/definitions/medicineType" }
    }
  },
  "definitions": {
    "medicineType": {
      "type": "object",
      "required": ["name"],
      "properties": {
        "name": {
          "type": "string",
          "description": "Name of medicine type"
        }
      }
    }
  },
  "required": ["data"]
}

exports.comboSchema = {
  "properties": {
    "name": {
      "type": "string"
    },
    "status": {
      "enum": ["active", "hold"]
    },
    "description": {
      "type": "string"
    },
    "price": {
      "type": "string"
    },
    "products": {
      "type": "array",
      "items": {
        "type": "string",
      }
    }
  },
  "required": ["name"]
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

exports.informationSchema = {
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
    "priorityOrder": {
      "type": "number"
    },
    "htmlContent": {
      "type": "string"
    }
  },
  "required": ["name", "status", "priorityOrder", "htmlContent"]
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

exports.forgotPasswordSchema = {
  "properties": {
    "email": {
      "type": "string",
      "format": "email"
    },
  },
  "required": ["email"]
}

exports.passwordUpdateEmailSchema = {
  "properties": {
    "email": {
      "type": "string",
      "format": "email"
    },
    "resetPasswordToken": {
      "type": "string"
    },
    "password": {
      "type": "password"
    }

  },
  "required": ["email", "resetPasswordToken", "password"]
}
exports.updatePasswordSchema = {
  "properties": {
    "password": {
      "type": "password"
    }

  },
  "required": ["password"]



}

exports.addressSchema = {
  properties: {
    fullName: {
      type: "string"
    },
    mobileNo: {
      type: "string",
      pattern: "[0-9 -()+]+$",
      maxLength: 10,

    },
    pincode: {
      type: "string",
      pattern: "^[1-9][0-9]{5}$",
      maxLength: 6,
      description: "Must be valid pincode"
    },
    houseNo: {
      type: "string"
    },
    street: {
      type: "string"
    },
    landmark: {
      type: "string"
    },
    city: {
      type: "string"
    },
    state: {
      type: "string"
    },
    active: {
      type: "string",
      enum: Object.values(enums.status)
    },
    address_type: {
      type: "string",
      enum: ["home", "office", "other"]
    }
  },
  "required": [
    "fullName",
    "mobileNo",
    "pincode",
    "houseNo",
    "street",
    "landmark",
    "city",
    "state",
    "active"
  ],
};

exports.otpSchema = {
  properties: {
    phone: {
      type: "string",
      pattern: "[0-9 -()+]+$",
      maxLength: 10,
    },
  },
  "required": [
    "phone"
  ],
};
exports.phoneVerifySchema = {
  properties: {
    phone: {
      type: "string",
      pattern: "[0-9 -()+]+$",
      maxLength: 10,
    },
    otp:{
      type:"string",
      pattern: "[0-9 -()+]+$",
      maxLength:4
    }
  },
  "required": [
    "phone","otp"
  ],
};