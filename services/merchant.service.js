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

  let merchantTypes;

  [err, merchants] = await to(merchants.create(param));
if(err) { return err; }
  return merchants;
};

exports.getAllMerchant = async query => {
  [err, merchantlist] = await to(merchants.findAll({
    where: [{ status: 'active' }]
}));
  if (!merchantlist || merchantlist.length === 0) {
    return "No record found"; 
  }
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
  [err,merchants ] = await to(merchants.update(param, {where: {id: id} }));
      if(err) TE(err.message);
  return merchants;
}

module.exports.updatemerchant = updatemerchant;