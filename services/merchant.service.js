
const {merchants, users} = require("../auth_models");

const {
  to,
  TE,
  ReE,
  ReS,
  isEmpty
} = require("../services/util.service");
const Logger = require("../logger");
const pick =  require("lodash/pick");
//use parse-strings-in-object



exports.createmerchant = async (param) => {
  let intParams = pick(param, ['countryId', 'cityId', 'stateId', 'languageId', 'merchantTypeId']);
  [err, merchant] = await to(merchants.create({...param, ...intParams}));
  if(err) { TE(err.message); }
  if (!merchant) TE("Error while creating merchant")
  const merchanePopulated = merchants.findOne({where:{id:merchant.id}, include:[{model:users}]})
  return merchant;
};

exports.getAllMerchant = async query => {
  [err, merchantlist] = await to(merchants.findAll());
  if(err) { TE(err.message); }
  return merchantlist;
};

const getMerchantId = async (id) => {
  [err, merchantlist] = await to(merchants.findById(id));
  if(err) { TE(err.message); }
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
