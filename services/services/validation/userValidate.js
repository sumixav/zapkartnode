"use strict";

// let Validator 	  = require('jsonschema').Validator;
// // let debug 		  = require('debug')('validation');
// // let appStatic     = require("./utils/appStatic");
// let v 			  = new Validator();
let validator = {};

// var userValidateSchema = {
//     "properties": {
//       "userId": {
//         "type": "string"
//       },
//       "custAccountId": {
//         "type": "string"
//       },
//       "nickName" : {
//         "type": "string"
//       },
//       "address" : {
//         "type": "object"
//       },
//       "billingZip" :{
//         "type" :  "string"
//       }
//     },
//     "required": ["userId", "custAccountId", "nickName", "lang"]
//   }
  
validator.userValidate = (params, callback) => {
    console.log(params);
};

module.exports = validator;