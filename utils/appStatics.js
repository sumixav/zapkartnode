"use strict";

var enums = {};
enums.status_codes_msg = {
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



module.exports = enums;