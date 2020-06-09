
const { merchants, users, sequelize } = require("../auth_models");

const {
  to,
  TE,
  ReE,
  ReS,
  isEmpty
} = require("../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Logger = require("../logger");
const pick = require("lodash/pick");
const parseStrings = require("parse-strings-in-object");
const { updateMerchant } = require("../controllers/backend/merchant.controller");
const authService = require("./auth.service")



exports.createmerchant = async (param) => {
  Logger.info(param)
  let errA, err, merchant, createdMerchant, createdUser;

  [errA, createdMerchant] = await to(sequelize.transaction(async (t) => {
    // let intParams = pick(param, ['countryId', 'cityId', 'stateId', 'languageId', 'merchantTypeId']);
    // [err, merchant] = await to(merchants.create({ ...param, ...intParams }, { transaction: t }));
    [err, merchant] = await to(merchants.create({ ...param }, { transaction: t, lock: t.LOCK.UPDATE }));
    if (err) { TE(err.message); };
    if (!merchant) TE("Error while creating merchant");
    [err, createdUser] = await to(authService.createUser({ ...param, roleId: 3 }, t));
    if (err) TE(err.message);
    if (!createdUser) TE("Error creating user");
    merchant.userId = createdUser.id;
    [err, updatedMerchant] = await to(merchant.save({ transaction: t }));
    if (err) TE(err.message);
    Logger.info(updatedMerchant)
    if (!updatedMerchant) TE("Error updating merchant");
    return updatedMerchant;
  }))
  if (errA) TE(errA.message);
  if (!createdMerchant) TE("Error creating merchant");
  return createdMerchant;



  // const merchanePopulated = merchants.findOne({ where: { id: merchant.id }, include: [{ model: users }] })
  return merchant;
};

exports.getAllMerchant = async query => {
  [err, merchantlist] = await to(merchants.findAll({ where: { deleted: { [Op.or]: { [Op.not]: 'true', [Op.eq]: null } } } }));
  if (err) { TE(err.message); }
  return merchantlist;
};

const getMerchantId = async (id) => {
  let err, merchantlist;
  [err, merchantlist] = await to(merchants.findById(id));
  if (err) { TE(err.message); };
  Logger.info('ji', merchantlist);
  return merchantlist;
}

module.exports.getMerchantId = getMerchantId;

exports.updatemerchant = async (id, param) => {

  console.log("hh", param);
  [err, merchantdetails] = await to(merchants.update(param, { where: { id: id } }));
  if (err) TE(err.message);
  return merchantdetails;
}

exports.updatemerchantNew = async (id, param) => {
  let err, updateMerchantCount, updateUserCount, errA, updated, user, merchant;
  console.log(param, id, 'ss');
  // [err, merchantDoc] = await to(merchants.findOne({ where: { id: param.id } }));
  [err, merchantDoc] = await to(merchants.findOne({ where: { id: id } }));
  console.log('mm', err, merchantDoc);
  if (err) TE(err.message);
  if (!merchantDoc) TE("Invalid merchant ID");
  Logger.info("hh", param);
  if (param.deleted !== 'true') param.deleted=null;
  [errA, updated] = await to(sequelize.transaction(async (t) => {
    [err, updateMerchantCount] = await to(merchantDoc.update(param, {
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
        'createdBy',
        // 'userId',
        'customSlug',
        'deleted'
      ],
      where: { id: param.id }, transaction: t
    }));
    if (err) TE(err.message);
    // if (!updateMerchantCount || updateMerchantCount[0] === 0) TE("Unable to update merchant details");
    console.log('jokl', updateMerchantCount);
    if (!updateMerchantCount) TE("Unable to update merchant details");
    [err, user] = await to(users.findOne({ where: { id: merchantDoc.userId } }));
    if (err) TE(err.message);
    if (!user) TE("Error fetching merchant");
    [err, updateUserCount] = await to(user.update({ ...parseStrings(param), password: param.password }, {
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
      ],
      where: { id: merchantDoc.userId }, transaction: t
    }));
    if (err) TE(err.message);
    if (!updateUserCount || updateUserCount[0] === 0) TE("Unable to update merchant user");;
    return true;
  }));
  if (errA) TE(errA.message);
  if (!updated) TE("Error updating merchant");
  return "Updated merchant";
}

