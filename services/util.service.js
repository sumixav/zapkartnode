const { to } = require("await-to-js");
const path = require("path");
const pe = require("parse-error");
const fs = require("fs").promises;
const gm = require("gm");
const map = require("lodash/map");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const mongoose = require("mongoose");
const Logger = require("../logger");

module.exports.fromEntries = arr =>
  Object.assign({}, ...Array.from(arr, ([k, v]) => ({ [k]: v })));

module.exports.to = async promise => {
  let err, res;
  [err, res] = await to(promise);

  if (err) return [pe(err)];

  return [null, res];
};

module.exports.ReE = function (res, err, code) {
  // Error Web Response

  Logger.error(err);
  if (typeof err == "object" && typeof err.message != "undefined") {
    err = err.message;
  }

  if (typeof code !== "undefined") res.statusCode = code;
  else res.statusCode = 422;

  return res.json({ success: false, error: err });
};

module.exports.ReS = function (res, data, code) {
  // Success Web Response
  let send_data = { success: true };

  if (typeof data == "object") {
    send_data = Object.assign(data, send_data); //merge the objects
  }

  if (typeof code !== "undefined") res.statusCode = code;

  return res.json(send_data);
};

module.exports.formatValidationError = function (errorArray) {
  let errorMessage = [];
  errorArray.forEach(i => {
    // const m = i.message.replace(/(\r\n|\n|\r)/gm," ");
    if (i.property === "instance") {
      errorMessage = errorMessage + i.message + "." + "\n";
      // const obj = { message: i.message }
      // errorMessage.push(obj)
    } else {
      const a = i.property.split("instance.")[1];
      errorMessage = errorMessage + " " + a + " " + i.message + "." + "\n";
      // const obj = { path: a, message: i.message }
      // errorMessage.push(obj)
    }
  });
  Logger.info(errorMessage);
  return errorMessage;
};

module.exports.TE = TE = function (err_message, log, status) {
  // TE stands for Throw Error
  if (log === true) {
    console.error(err_message);
  }
  const error = new Error(err_message)
  Logger.info(status)
  if (status) error.status = status
  throw error
};

exports.deleteFile = async path => {
  return fs
    .unlink(`./${path}`)
    .then(a => {
      Logger.info("deleted ", path, a);
      return true;
    })

    .catch(err => {
      Logger.error(err);
      throw err;
    });
};

exports.saveThumbnails = imagePathArray => {
  Logger.info(imagePathArray);
  const promises = imagePathArray.map(imagePath => {
    Logger.info(imagePath);
    const parsedPath = path.parse(imagePath);
    const thumbName = `${parsedPath.dir}/${parsedPath.name}_thumb${parsedPath.ext}`;
    return new Promise((resolve, reject) =>
      gm(imagePath).thumb(150, 150, `${thumbName}`, 100, err => {
        if (err) {
          Logger.error(err);
          reject(new Error(err));
        }
        Logger.info(thumbName);
        resolve(thumbName);
      })
    );
  });

  return Promise.all(promises);
};

exports.resizeCropMultiple = (imagePathArray, w, h) => {
  Logger.info(imagePathArray);
  // Logger.info("in resize&crop");
  const promises = imagePathArray.map(imagePath => {
    Logger.info(imagePath);
    // const parsedPath = path.parse(imagePath);
    // const resizedName = `${parsedPath.dir}/${parsedPath.name}_${w}x${h}${parsedPath.ext}`;
    return new Promise((resolve, reject) =>
      gm(imagePath)
        // .resize(w, h, "^")
        .resize(w, h)
        .gravity("Center")
        // .crop(w, h)
        .write(imagePath, function (err) {
          if (err) {
            Logger.error(err);
            reject(new Error(err));
          }
          Logger.info(imagePath);
          resolve(imagePath);
        })
    );
  });

  return Promise.all(promises);
};

function uniq(a) {
  return Array.from(new Set(a));
}
exports.uniq = uniq;

exports.resizeCrop = (imagePath, w, h) => {
  Logger.info(imagePath);
  // const parsedPath = path.parse(imagePath);
  // const resizedName = `${parsedPath.dir}/${parsedPath.name}_${w}x${h}${parsedPath.ext}`;
  return new Promise((resolve, reject) =>
    gm(imagePath)
      // .resize(w, h, "^")
      .resize(w, h)
      .gravity("Center")
      // .crop(w, h)
      .write(imagePath, function (err) {
        if (err) {
          Logger.error(err);
          reject(new Error(err));
        }
        Logger.info(imagePath);
        resolve(imagePath);
      })
  );
};

exports.saveThumbnail = imagePath => {
  Logger.info(imagePath);
  const parsedPath = path.parse(imagePath);
  const thumbName = `${parsedPath.dir}/${parsedPath.name}_thumb${parsedPath.ext}`;
  return new Promise((resolve, reject) =>
    gm(imagePath).thumb(150, 150, `${thumbName}`, 100, err => {
      if (err) {
        Logger.error(err);
        reject(new Error(err));
      }
      Logger.info(thumbName);
      resolve(thumbName);
    })
  );

  // return Promise.all(promises);
};

exports.generateObjectId = () => new mongoose.Types.ObjectId();

exports.getDimensions = async filePath => {
  return new Promise((resolve, reject) => {
    gm(filePath).size(function (err, size) {
      Logger.info(size);
      if (!err) {
        return resolve({ width: size.width, height: size.height });
      }
      Logger.error(err);
      reject(err);
    });
  });
};

exports.isObjectId = id => {
  const regEx = /^[0-9a-fA-F]{24}$/;
  return id.match(regEx) && mongoose.Types.ObjectId.isValid(id);
};

exports.getIdQuery = (value, queryField = "slug") => {
  let query = {
    _id: value
  };
  // let toQuery = 'slug'
  let toQuery = queryField;
  // if (typeof queryField !== 'undefined')
  //     toQuery = [queryField]
  if (!this.isObjectId(value))
    query = {
      [toQuery]: value
    };
  Logger.info(query);
  return query;
};

exports.getError = (message = "Error", status = 422) => {
  const error = new Error();
  error.message = message;
  error.status = status;
  return error;
};

exports.isEmpty = val => {
  if (!Object.entries) {
    entries.shim();
  }
  if (val === "" || val === null || val === undefined) return true;
  if (val.constructor === Object && Object.entries(val).length === 0)
    return true;
  if (val.constructor === Array && val.length === 0) return true;
  return false;
};

exports.isValidId = id => {
  return mongoose.Types.ObjectId.isValid(id);
};

exports.paginate = (page, pageSize) => {
  const offset = (page - 1) * pageSize;
  const limit = pageSize;
  return {
    offset,
    limit
  };
};

exports.getSearchQuery = (searchObj = {}, searchOp = '[Op.like]') => {
  let searchQuery = {};
  map(searchObj, (value, key) => {
   
    searchQuery = {
      [key]: {
        [searchOp]: "%" + value + "%"
      }
    };
    //Logger.info("777",searchObj);
  });
  // let y= "hh";
  // let result = Object.entries(searchObj).map(([key, value])  => [{[key]:{
  //   [searchOp]: "%" + value + "%"
  // }}])
  
  return searchQuery
};

exports.getOrderQuery = (orderObj = {}) => {
  return { order: Object.entries(orderObj) }
}

// exports.saveThumbnail = imagePathArray => {
//     Logger.info(imagePathArray);
//     Logger.info("in saveThumbnail");
//     const promises = imagePathArray.map(imagePath => {
//       Logger.info(imagePath);
//       const parsedPath = path.parse(imagePath);
//       const thumbName = `${parsedPath.dir}/${parsedPath.name}_thumb${parsedPath.ext}`;
//       return new Promise((resolve, reject) =>
//         gm(imagePath).thumb(150, 150, `${thumbName}`, 100, err => {
//           if (err) {
//             Logger.error(err);
//             reject(new Error(err));
//           }
//           Logger.info(thumbName);
//           resolve(thumbName);
//         })
//       );
//     });

//     return Promise.all(promises);
//   };
