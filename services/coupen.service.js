const cleanDeep = require("clean-deep");
const {coupens, coupen_types, coupen_user_mappings} = require("../auth_models");
const validator = require("validator");
const {
  to,
  TE,
  ReE,
  ReS,
  isEmpty
} = require("../services/util.service");
const Logger = require("../logger");
//use parse-strings-in-object



exports.createCoupen = async (param) => {
    const {name, validFrom, validTo, coupenTypeId, status} = param;

  [err, coupenlists] = await to(coupens.create({name,validFrom,validTo,coupenTypeId,status}));
  if(err) { return err; }
  return coupenlists;
};

exports.getAllCoupen = async query => {
  [err, coupenlist] = await to(coupens.findAll());
  if(err) { return err; }
  return coupenlist;
};

const getCoupenId = async (id) => {
  [err, coupenlist] = await to(coupens.findById(id));
  if(err) { return err; }
  return coupenlist;
}

module.exports.getCoupenId = getCoupenId;

const updatecoupen = async (id, param) => {
  
  console.log("hh",param);
  [err,coupendetails ] = await to(coupens.update(param, {where: {id: id} }));
      if(err) TE(err.message);
  return coupendetails;
}

module.exports.updatecoupen = updatecoupen;
