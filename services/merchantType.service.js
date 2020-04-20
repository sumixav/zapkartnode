const cleanDeep = require("clean-deep");
const {merchant_types} = require("../auth_models");
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



exports.createmerchanttype = async (param) => {
  let {
    name,
    status,
    createdby,
  } = param;


   [err,duplicatemerchanttype] = await to(merchant_types.findAll({where:{name:name}}));
  if(err) { return err; }
  if (duplicatemerchanttype && duplicatemerchanttype.length > 0) {
    return "Duplicate record found"; 
  }
 

  let newMerchantType ={name,status,createdby};
  let merchantTypes;

  [err, merchantTypes] = await to(merchant_types.create(param));
if(err) { return err; }
  return merchantTypes;
};

exports.getAllMerchantType = async query => {
  [err, merchantTypelist] = await to(merchant_types.findAll());
  if (!merchantTypelist || merchantTypelist.length === 0) {
    return "No record found"; 
  }
  return merchantTypelist;
};

const getMerchantTypeId = async (id) => {
  [err, merchantTypelist] = await to(merchant_types.findById(id));
  if(err) { return err; }
  return merchantTypelist;
}

module.exports.getMerchantTypeId = getMerchantTypeId;

const updatemerchantType = async (id, param) => {
  
  console.log("hh",param);
  [err,merchantTypes ] = await to(merchant_types.update(param, {where: {id: id} }));
      if(err) TE(err.message);
  return merchantTypes;
}

module.exports.updatemerchantType = updatemerchantType;