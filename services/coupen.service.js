const cleanDeep = require("clean-deep");
const {coupens, coupen_types, coupen_user_mappings} = require("../auth_models");
const validator = require("validator");
const {
  to,
  TE,
  ReE,
  ReS,
  isEmpty,
  getSearchQuery
} = require("../services/util.service");
const Logger = require("../logger");
const parseStrings = require("parse-strings-in-object");



exports.createCoupen = async (param) => {
    const {name, validFrom, validTo, coupenTypeId, status} = param;

  [err, coupenlists] = await to(coupens.create({name,validFrom,validTo,coupenTypeId,status}));
  if(err) { return err; }
  return coupenlists;
};

exports.searchCoupenAssign = async (search) => {
    let searchCondition={};
    if(search) {
    Object.assign(searchCondition, search['id'] ? { 'id': search['id'] } : '',
    search['name'] ? { 'name': search['name'] } : '',
    search['coupenCode'] ? { 'coupenCode': search['coupenCode'] } : '');
    }
    return Object.values(searchCondition);
};

exports.getAllCoupen = async (query) => {
  const {page, limit, search} = parseStrings(query);
  let searchCondition = {};
  const dbQuery = {
    where: {
        ...getSearchQuery(search)
    }
  }
Logger.info("999",searchCondition);
  [err, coupenlist] = await to(coupens.findAndCountAll({dbQuery,limit,offset:page}));
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
