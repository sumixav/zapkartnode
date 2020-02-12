"use strict";

// var enums = {};

module.exports.enums = {
  product: {
    availablity: {
      IN_STOCK: "in-stock",
      UNAVAILABLE: "unavailable"
    },
    status: {
      PENDING: "pending",
      ACTIVE: "active",
      DISABLED: "disabled",
      DELETED: "deleted"
    },
    variantType: {
      SINGLE: "single",
      MULTIPLE: "multiple"
    }
  },
  status: {
    active: "active",
    hold: "hold"
  },
  lengthClass: {
    mm: "mm",
    cm: "cm",
    m: "inch"
  },
  weightClass: {
    kg: "kg",
    gm: "gm",
    pound: "pound",
    ounce: "ounce"
  },
  outOfStockStatus: {
    inStock: "in-stock",
    outOfStock: "out-of-stock"
  }
};

module.exports.status_codes_msg = {
  SUCCESS: {
    status: "success",
    code: 200,
    error: null
  },
  FAILED: {
    status: "error",
    code: 500,
    error: "Internal error occurred while processing the request"
  },
  INVALID: {
    status: "error",
    code: 400,
    error: ""
  },
  NO_RECORD_FOUND: {
    status: "error",
    code: 404,
    error: "Not Found"
  },
  UNAUTHORIZED: {
    status: "error",
    code: 401,
    error: "Please enter a valid credentials."
  },
  JWT_TOKEN_EXPIRED: {
    status: "error",
    code: 440,
    error: "TOKEN_EXPIRED"
  },
  VALIDATION_ERROR: {
    status: "error",
    code: 400,
    error: ""
  },
  INVALID_ENTITY: {
    status: "error",
    code: 422,
    error: "Invalid Entity"
  },
  NO_CONTENT: {
    status: "no content",
    code: 204,
    error: "There is no Record Found"
  },
  CREATED: {
    status: "Created",
    code: 201,
    error: "Created"
  }
};

// enums.status = {
//   enabled: "enabled",
//   disabled: "disabled",
//   deleted: "deleted"
// };

module.exports.STRINGS = {
  NOT_EXIST: "Resource does not exist",
  DB_ERROR: "Database Error",
  INVALID_PARENTID: "Invalid parent product ID",
  INVALID_ID: "Invalid ID",
  DELETED: "Resource deleted",
  RESTORED: "Resource restored",
  DUPLICATE: "Resource with same name already exists",
  NO_DATA: "No data available",
  CREATE_SUCCESS: "Created successfully"
};

module.exports.PAGE_LIMIT = 0;
