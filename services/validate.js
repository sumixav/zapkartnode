"use strict";
var Validator = require('jsonschema').Validator;
var v = new Validator();
const { to, ReE, ReS }  = require('../services/util.service');
var instance = 'asdsa';
var schema = {"type": "number"};
const { status_codes_msg }  = require('../utils/appStatics');

var checklistValidateSchema = {
  "properties": {
    "name": {
      "type": "string"
    }
  },
  "required": ["checklistPeriod", "name", "language"]
}

module.exports.validateChecklist =  (req, res, next) => {
  let params = Object.assign({}, req.body);
  var validRes = v.validate(params, checklistValidateSchema).errors;
  console.log("ddddd"+JSON.stringify(validRes));
  if (!validRes.length) {
   return next();
  } else {
    return ReE(res, validRes[0].message ,status_codes_msg.VALIDATION_ERROR.code);
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
      "partnerlastName":{
        "type": "string"
      },
      "partnerfirstName":{
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
    "required": ["firstName", "lastName", "email", "password",  "partnerfirstName", "partnerlastName"]
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
  "required": ["user_id", "email","refferal_status_id"]
}
  

module.exports.registerUser =  (req, res, next) => {
  let params = Object.assign({}, req.body, req.query);
  var validRes = v.validate(params, userRegisterSchema).errors;

  if (!validRes.length) {
   return next();
  } else {

    return ReE(res, validRes[0].message ,status_codes_msg.VALIDATION_ERROR.code);
  }
}


module.exports.validateAuth =  (req, res, next) => {
  let params = Object.assign({}, req.body, req.query);
  var validRes = v.validate(params, userLoginValidateSchema).errors;
  if (!validRes.length) {
   return next();
  } else {
    return ReE(res, validRes[0].message ,status_codes_msg.VALIDATION_ERROR.code);
  }
}
module.exports.validateUpdate =  (req, res, next) => {
  // let params = Object.assign({}, req.body, req.query);
  // var validRes = v.validate(params, userLoginValidateSchema).errors;
  // if (!validRes.length) {
   return next();
  // } else {
  //   return ReE(res, validRes[0].message ,status_codes_msg.INVALID_ENTITY);
  // }
}


module.exports.validateRefferal =  (req, res, next) => {
  let params = Object.assign({}, req.body, req.query);
  var validRes = v.validate(params, userRefferalValidateSchema).errors;
  if (!validRes.length) {
   return next();
  } else {
    return ReE(res, validRes[0].message ,status_codes_msg.INVALID_ENTITY);
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


module.exports.validateUpdateLocation =  (req, res, next) => {
  let params = Object.assign({}, req.body);
  var validRes = v.validate(params, validateUpdateLocationSchema).errors;
  if (!validRes.length) {
   return next();
  } else {
    return ReE(res, validRes[0].message ,status_codes_msg.INVALID_ENTITY);
  }
}