"use strict";
const Validator = require("jsonschema").Validator;
const parseStrings = require("parse-strings-in-object");
const v = new Validator();
const isEmpty = require("is-empty")
const { to, ReE, ReS, formatValidationError } = require("../util.service");
const Logger = require("../../logger");
const { status_codes_msg } = require("../../utils/appStatics");
const {
  productsSchema,
  brandSchema,
  editAttributesSchema,
  categorySchema,
  editCategorySchema,
  medicineTypesBulkSchema,
  comboSchema,
  informationSchema,
  forgotPasswordSchema,
  passwordUpdateEmailSchema,
  addressSchema,
  updatePasswordSchema,
  phoneVerifySchema,
  otpSchema
} = require("./schema");



exports.validatePhoneVerify = (req, res, next) => {
  let params = Object.assign({}, req.body);
  const validRes = v.validate(params, phoneVerifySchema).errors;
  if (!(validRes.length > 0)) {
    return next();
  } else {
    const errorMessage = formatValidationError(validRes);
    return ReE(res, errorMessage, status_codes_msg.VALIDATION_ERROR.code);
  }
}

exports.validateOtp = (req, res, next) => {
  let params = Object.assign({}, req.body);
  const validRes = v.validate(params, otpSchema).errors;
  if (!(validRes.length > 0)) {
    return next();
  } else {
    const errorMessage = formatValidationError(validRes);
    return ReE(res, errorMessage, status_codes_msg.VALIDATION_ERROR.code);
  }
}

exports.validateProduct = (req, res, next) => {
  Logger.info(
    req.body.height,
    typeof req.body.height,
    req.body.returnable.constructor
  );
  let params = Object.assign({}, req.body);
  params.attributes = JSON.parse(params.attributes);
  Logger.info(params);
  // Logger.info(params)
  // params.listPrice = Number(params.listPrice)
  // params.salePrice = Number(params.salePrice)
  // params.purchaseCount = Number(params.purchaseCount)
  // params.minOrderQty = Number(params.minOrderQty)
  // params.maxOrderQty = Number(params.maxOrderQty)
  // params.prescriptionNeeded = (params.prescriptionNeeded === "true")
  // params.returnable = (params.returnable === "true")
  // params.featured = (params.featured === "true")
  // params.returnPeriod = Number(params.returnPeriod)
  // Logger.info(params.attributes)
  // params.attributes = JSON.parse(params.attributes)
  const parsedParams = parseStrings(params);
  const validRes = v.validate(parsedParams, productsSchema).errors;
  Logger.info(validRes);
  const imageValid = req.files && req.files["image"];
  // const mainImageValid = req.files && req.files["mainImage"];
  if (!parsedParams.parentId && typeof imageValid === "undefined")
    validRes.push({ property: "instance.image", message: "Image required" });
  // if (typeof mainImageValid === "undefined")
  // validRes.push({
  //   property: "instance.mainImage",
  //   message: "Main image required"
  // });
  Logger.info(imageValid);
  if (!(validRes.length > 0)) {
    return next();
  } else {
    const errorMessage = formatValidationError(validRes);
    return ReE(res, errorMessage, status_codes_msg.VALIDATION_ERROR.code);
  }
};

exports.validateBrand = (req, res, next) => {
  let params = Object.assign({}, req.body);
  const validRes = v.validate(params, brandSchema).errors;
  const imageValid = req.files && req.files["image"];
  if (typeof imageValid === "undefined")
    validRes.push({ property: "instance.image", message: "required" });
  if (!(validRes.length > 0)) {
    return next();
  } else {
    const errorMessage = formatValidationError(validRes);
    return ReE(res, errorMessage, status_codes_msg.VALIDATION_ERROR.code);
  }
};

exports.validateInfos = (req, res, next) => {
  let params = Object.assign({}, req.body);
  const validRes = v.validate(parseStrings(params), informationSchema).errors;
  if (!(validRes.length > 0)) {
    return next();
  } else {
    const errorMessage = formatValidationError(validRes);
    return ReE(res, errorMessage, status_codes_msg.VALIDATION_ERROR.code);
  }
};

exports.validateMedicineTypesBulk = (req, res, next) => {
  let params = Object.assign({}, req.body);
  const validRes = v.validate(params, medicineTypesBulkSchema).errors;
  if (!(validRes.length > 0)) {
    return next();
  } else {
    const errorMessage = formatValidationError(validRes);
    return ReE(res, errorMessage, status_codes_msg.VALIDATION_ERROR.code);
  }
};

exports.validateCategory = (req, res, next) => {
  let params = Object.assign({}, req.body);
  if (params.priorityOrder) params.priorityOrder = Number(params.priorityOrder);
  const validRes = v.validate(params, categorySchema).errors;
  Logger.info(req.files, req.files["image"]);
  const imageValid = req.files && req.files["image"];
  if (typeof imageValid === "undefined")
    validRes.push({ property: "instance.image", message: "required" });
  if (!(validRes.length > 0)) {
    return next();
  } else {
    const errorMessage = formatValidationError(validRes);
    return ReE(res, errorMessage, status_codes_msg.VALIDATION_ERROR.code);
  }
};

exports.validateEditCategory = (req, res, next) => {
  if (req.query) return next();
  let params = Object.assign({}, req.body);
  if (params.priorityOrder) params.priorityOrder = Number(params.priorityOrder);
  const validRes = v.validate(params, editCategorySchema).errors;
  // const imageValid = req.files && req.files["image"]
  // if (typeof imageValid === "undefined") validRes.push({ property: 'instance.image', message: 'required' })
  if (!(validRes.length > 0)) {
    return next();
  } else {
    const errorMessage = formatValidationError(validRes);
    return ReE(res, errorMessage, status_codes_msg.VALIDATION_ERROR.code);
  }
};

exports.editAttributesSchema = (req, res, next) => {
  let params = Object.assign({}, req.body);
  const validRes = v.validate(params, editAttributesSchema).errors;
  if (!(validRes.length > 0)) {
    return next();
  } else {
    const errorMessage = formatValidationError(validRes);
    return ReE(res, errorMessage, status_codes_msg.VALIDATION_ERROR.code);
  }
};

const checklistValidateSchema = {
  properties: {
    name: {
      type: "string"
    }
  },
  required: ["checklistPeriod", "name", "language"]
};

module.exports.validateChecklist = (req, res, next) => {
  let params = Object.assign({}, req.body);
  let validRes = v.validate(params, checklistValidateSchema).errors;
  Logger.info(validRes);
  if (!validRes.length) {
    return next();
  } else {
    return ReE(
      res,
      validRes[0].message,
      status_codes_msg.VALIDATION_ERROR.code
    );
  }
};

module.exports.forgotPassword = (req, res, next) => {
  let params = Object.assign({}, req.body);
  let validRes = v.validate(params, forgotPasswordSchema).errors;
  Logger.info(validRes);
  if (!validRes.length) {
    return next();
  } else {
    return ReE(
      res,
      validRes[0].message,
      status_codes_msg.VALIDATION_ERROR.code
    );
  }
};

module.exports.updatePasswordEmail = (req, res, next) => {
  let params = Object.assign({}, req.body);
  let validRes = v.validate(params, passwordUpdateEmailSchema).errors;
  Logger.info('HELLO---', validRes);
  if (!validRes.length) {
    return next();
  } else {
    return ReE(
      res,
      validRes[0].message,
      status_codes_msg.VALIDATION_ERROR.code
    );
  }
};

module.exports.updatePassword = (req, res, next) => {
  let params = Object.assign({}, req.body);
  let validRes = v.validate(params, updatePasswordSchema).errors;
  Logger.info(validRes);
  if (!validRes.length) {
    return next();
  } else {
    return ReE(
      res,
      validRes[0].message,
      status_codes_msg.VALIDATION_ERROR.code
    );
  }
};

module.exports.prescriptionUpload = (req, res, next) => {
  let validRes = [];

  const imageValid = req.files && req.files["prescription"];
  if (typeof imageValid === "undefined")
    validRes.push({ property: "instance.image", message: "requires image 'prescription'" });

  Logger.info('HELLO', req.files, validRes)

  if (validRes.length === 0) {
    return next();
  } else {
    return ReE(
      res,
      validRes[0].message,
      status_codes_msg.VALIDATION_ERROR.code
    );
  }
};

const userRegisterSchema = {
  properties: {
    gender: {
      type: "string",
      enum: ["male", "female"]
    },
    firstName: {
      type: "string"
    },
    lastName: {
      type: "string"
    },
    phone: {
      type: "string",
      pattern: "^[0-9()\\-\\.\\s]+$",
      maxLength: 12,
      minLength: 6
    }
  },
  required: ["firstName", "lastName", "email", "phone"]
};

const userProfileSchema = {
  properties: {
    firstName: {
      type: "string"
    },
    lastName: {
      type: "string"
    },
    phone: {
      type: "string",
      pattern: "^[0-9()\\-\\.\\s]+$",
      maxLength: 12,
      minLength: 6
    },
    phoneVerified: {
      type: "boolean",
    }
  },
  required: ["firstName", "lastName"],
  dependencies: {
    phone: { required: ["phoneVerified"] }
  }
};



const userLoginValidateSchema = {
  properties: {
    loginId: {
      type: "string"
    },
    password: {
      type: "string"
    }
  },
  required: ["loginId", "password"]
};

const userRefferalValidateSchema = {
  properties: {
    user_id: {
      type: "integer"
    },
    email: {
      type: "string",
      format: "email"
    },
    refferal_status_id: {
      type: "integer"
    }
  },
  required: ["user_id", "email", "refferal_status_id"]
};

module.exports.registerUser = (req, res, next) => {
  let params = Object.assign({}, req.body, req.query);
  const validRes = v.validate(params, userRegisterSchema).errors;

  if (!validRes.length) {
    return next();
  } else {
    return ReE(
      res,
      validRes[0].message,
      status_codes_msg.VALIDATION_ERROR.code
    );
  }
};

module.exports.userProfile = (req, res, next) => {
  let params = Object.assign({}, req.body, req.query);
  const validRes = v.validate(parseStrings(params), userProfileSchema).errors;

  if (!validRes.length) {
    return next();
  } else {
    return ReE(
      res,
      formatValidationError(validRes),
      status_codes_msg.VALIDATION_ERROR.code
    );
  }
};

module.exports.validateAddress = (req, res, next) => {
  let params = Object.assign({}, req.body, req.query);
  const validRes = v.validate(params, addressSchema).errors;

  if (!validRes.length) {
    return next();
  } else {
    return ReE(
      res,
      formatValidationError(validRes),
      status_codes_msg.VALIDATION_ERROR.code
    );
  }
};

module.exports.validateAuth = (req, res, next) => {
  let params = Object.assign({}, req.body, req.query);
  const validRes = v.validate(params, userLoginValidateSchema).errors;
  if (!validRes.length) {
    return next();
  } else {
    return ReE(
      res,
      validRes[0].message,
      status_codes_msg.VALIDATION_ERROR.code
    );
  }
};

module.exports.validateAuth = (req, res, next) => {
  let params = Object.assign({}, req.body, req.query);
  const validRes = v.validate(params, userLoginValidateSchema).errors;
  if (!validRes.length) {
    return next();
  } else {
    return ReE(
      res,
      validRes[0].message,
      status_codes_msg.VALIDATION_ERROR.code
    );
  }
};
module.exports.validateUpdate = (req, res, next) => {
  // let params = Object.assign({}, req.body, req.query);
  // const validRes = v.validate(params, userLoginValidateSchema).errors;
  // if (!validRes.length) {
  return next();
  // } else {
  //   return ReE(res, validRes[0].message ,status_codes_msg.INVALID_ENTITY);
  // }
};

module.exports.validateRefferal = (req, res, next) => {
  let params = Object.assign({}, req.body, req.query);
  const validRes = v.validate(params, userRefferalValidateSchema).errors;
  if (!validRes.length) {
    return next();
  } else {
    return ReE(res, validRes[0].message, status_codes_msg.INVALID_ENTITY);
  }
};

const validateUpdateLocationSchema = {
  properties: {
    latitude: {
      type: "number"
    },
    longitude: {
      type: "number"
    }
  },
  required: ["latitude", "longitude"]
};

module.exports.validateUpdateLocation = (req, res, next) => {
  let params = Object.assign({}, req.body);
  const validRes = v.validate(params, validateUpdateLocationSchema).errors;
  if (!validRes.length) {
    return next();
  } else {
    return ReE(res, validRes[0].message, status_codes_msg.INVALID_ENTITY);
  }
};

exports.validateCombo = (req, res, next) => {
  let params = Object.assign({}, req.body);
  const validRes = v.validate(params, comboSchema).errors;
  const imageValid = req.files && req.files["image"];
  if (typeof imageValid === "undefined")
    validRes.push({ property: "instance.image", message: "required" });
  if (!(validRes.length > 0)) {
    return next();
  } else {
    
    return ReE(res, formatValidationError(validRes), status_codes_msg.VALIDATION_ERROR.code);
  }
};
