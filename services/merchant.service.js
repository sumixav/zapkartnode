const cleanDeep = require("clean-deep");
const {merchants} = require("../auth_models");
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



exports.createmerchant = async (param) => {
  [err, merchantlists] = await to(merchants.create(param));
  if(err) { return err; }
  return merchantlists;
};

exports.getAllMerchant = async query => {
  [err, merchantlist] = await to(merchants.findAll());
  if(err) { return err; }
  return merchantlist;
};

const getMerchantId = async (id) => {
  [err, merchantlist] = await to(merchants.findById(id));
  if(err) { return err; }
  return merchantlist;
}

module.exports.getMerchantId = getMerchantId;

const updatemerchant = async (id, param) => {
  
  console.log("hh",param);
  [err,merchantdetails ] = await to(merchants.update(param, {where: {id: id} }));
      if(err) TE(err.message);
  return merchantdetails;
}

module.exports.updatemerchant = updatemerchant;
