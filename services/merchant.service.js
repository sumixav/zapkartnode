
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

exports.updatemerchant = async (id, param) => {
  
  console.log("hh",param);
  [err,merchantdetails ] = await to(merchants.update(param, {where: {id: id} }));
      if(err) TE(err.message);
  return merchantdetails;
}

exports.updatemerchantNew = async (id, param) => {
  let err, updateMerchantCount, updateUserCount, errA, updated;

  Logger.info("hh", param);
  [errA, updated] = await to(sequelize.transaction(async (t) => {
    [err, updateMerchantCount] = await to(merchants.update(param, {
      fields: [
        'merchantTypeId',
        'name',
        'slug',
        'address',
        'countryId',
        'stateId',
        'cityId',
        'zipcode',
        'regnumber',
        'establishdate',
        'languageId',
        'latitude',
        'longitude',
        'profiledescription',
        'commissionslab',
        'designation',
        'website',
        'accountdetails',
        'accounttype',
        'nameonaccount',
        'status',
        'deleted',
        'createdBy',
        'userId',
        'customSlug',
      ],
      where: { id: id }, transaction: t
    }));
    if (err) TE(err.message);
    // if (!updateMerchantCount || updateMerchantCount[0] === 0) TE("Unable to update merchant details");
    if (!updateMerchantCount) TE("Unable to update merchant details");
    [err, updateUserCount] = await to(users.update(param, {
      fields: [
        'firstName',
        'lastName',
        'email',
        'phone',
        'avatartype',
        'avatarlocation',
        'password',
        'active',
        'confirmed',
        'timezone',
        'userTypeId',
        'socialType',
        'gender',
      ], where: { id: param.userId }, transaction: t
    }));
    if (err) TE(err.message);
    if (!updateUserCount || updateUserCount[0] === 0) TE("Unable to update merchant user");;
    return true;
  }));
  if (errA) TE(errA.message);
  if (!updated) TE("Error updating merchant");
  return "Updated merchant";
}

