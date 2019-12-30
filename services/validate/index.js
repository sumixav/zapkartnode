"use strict";
var Validator = require('jsonschema').Validator;
var v = new Validator();
const { to, ReE, ReS, formatValidationError } = require('../util.service');
const Logger = require('../../logger')
const { status_codes_msg } = require('../../utils/appStatics');

const { productsSchema, brandSchema } = require('./schema')


exports.validateProduct = (req, res, next) => {
  Logger.info(req.body.height, typeof req.body.height, req.body.returnable.constructor)
  let params = Object.assign({}, req.body);
  const validRes = v.validate(params, productsSchema).errors;
  Logger.info(validRes)
  const imageValid = req.files && req.files["image"]
  const mainImageValid = req.files && req.files["mainImage"]
  if (typeof imageValid === "undefined") validRes.push({ property: 'instance.image', message: 'Image required' })
  if (typeof mainImageValid === "undefined") validRes.push({ property: 'instance.mainImage', message: 'Main image required' })
  Logger.info(imageValid, mainImageValid)
  if (!(validRes.length > 0)) {
    return next();
  } else {
    const errorMessage = formatValidationError(validRes);
    return ReE(res, errorMessage, status_codes_msg.VALIDATION_ERROR.code);
  }
}

exports.validateBrand = (req, res, next) => {
  let params = Object.assign({}, req.body);
  const validRes = v.validate(params, brandSchema).errors;
  const imageValid = req.files && req.files["image"]
  if (typeof imageValid === "undefined") validRes.push({ property: 'instance.image', message: 'required' })
  if (!(validRes.length > 0)) {
    return next();
  } else {
    const errorMessage = formatValidationError(validRes);
    return ReE(res, errorMessage, status_codes_msg.VALIDATION_ERROR.code);
  }
}

var checklistValidateSchema = {
  "properties": {
    "name": {
      "type": "string"
    }
  },
  "required": ["checklistPeriod", "name", "language"]
}

module.exports.validateChecklist = (req, res, next) => {
  let params = Object.assign({}, req.body);
  let validRes = v.validate(params, checklistValidateSchema).errors;
  Logger.info(validRes)
  if (!validRes.length) {
    return next();
  } else {
    return ReE(res, validRes[0].message, status_codes_msg.VALIDATION_ERROR.code);
  }
}

var userRegisterSchema = {
  "properties": {
    "email": {
      "type": "string",
      "format": "email"
    },
    "firstName": {
      "type": "string"
    },
    "lastName": {
      "type": "string"
    },
    "partnerlastName": {
      "type": "string"
    },
    "partnerfirstName": {
      "type": "string"
    },
    "phone": {
      "type": "string",
      "pattern": "^[0-9()\\-\\.\\s]+$",
      "maxLength": 12,
      "minLength": 6
    },
    "password": {
      "type": "string"
    }
  },
  "required": ["firstName", "lastName", "email", "password", "partnerfirstName", "partnerlastName"]
}

var userLoginValidateSchema = {
  "properties": {
    "loginId": {
      "type": "string"
    },
    "password": {
      "type": "string"
    }
  },
  "required": ["loginId", "password"]
}

var userRefferalValidateSchema = {
  "properties": {
    "user_id": {
      "type": "integer"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "refferal_status_id": {
      "type": "integer"
    }


  },
  "required": ["user_id", "email", "refferal_status_id"]
}


module.exports.registerUser = (req, res, next) => {
  let params = Object.assign({}, req.body, req.query);
  var validRes = v.validate(params, userRegisterSchema).errors;

  if (!validRes.length) {
    return next();
  } else {

    return ReE(res, validRes[0].message, status_codes_msg.VALIDATION_ERROR.code);
  }
}


module.exports.validateAuth = (req, res, next) => {
  let params = Object.assign({}, req.body, req.query);
  var validRes = v.validate(params, userLoginValidateSchema).errors;
  if (!validRes.length) {
    return next();
  } else {
    return ReE(res, validRes[0].message, status_codes_msg.VALIDATION_ERROR.code);
  }
}
module.exports.validateUpdate = (req, res, next) => {
  // let params = Object.assign({}, req.body, req.query);
  // var validRes = v.validate(params, userLoginValidateSchema).errors;
  // if (!validRes.length) {
  return next();
  // } else {
  //   return ReE(res, validRes[0].message ,status_codes_msg.INVALID_ENTITY);
  // }
}


module.exports.validateRefferal = (req, res, next) => {
  let params = Object.assign({}, req.body, req.query);
  var validRes = v.validate(params, userRefferalValidateSchema).errors;
  if (!validRes.length) {
    return next();
  } else {
    return ReE(res, validRes[0].message, status_codes_msg.INVALID_ENTITY);
  }
}

var validateUpdateLocationSchema = {
  "properties": {
    "latitude": {
      "type": "number"
    },
    "longitude": {
      "type": "number"
    }
  },
  "required": ["latitude", "longitude"]
}


module.exports.validateUpdateLocation = (req, res, next) => {
  let params = Object.assign({}, req.body);
  var validRes = v.validate(params, validateUpdateLocationSchema).errors;
  if (!validRes.length) {
    return next();
  } else {
    return ReE(res, validRes[0].message, status_codes_msg.INVALID_ENTITY);
  }
}