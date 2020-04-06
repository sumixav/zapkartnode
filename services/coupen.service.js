const cleanDeep = require("clean-deep");
const {offers, offer_types, offer_user_mappings, offer_category_products,db} = require("../auth_models");
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
const Sequelize = require('sequelize');
const Op = Sequelize.Op;



exports.createCoupen = async (param) => {
  const {description, type, method, minimum_cart, maximum_cart, offeritem, name, validFrom, validTo, coupenTypeId, status,coupenCode, usergroup, userData, amount} = param;
  [err, coupenlists] = await to(offers.create({method,minimum_cart,maximum_cart,type,description,createdBy:1,name,validFrom,validTo,status,coupenCode,amount}));
  if(err) { return err; }
  Logger.info("00000",coupenlists,userData);
  let usermapping = '';
  let usergroupData = {};
  let userD = {};
  if(coupenlists) {
    if(userData) {
     usergroupData = JSON.parse(userData).map((values, index) => {
      let aValue = values.value;
      let alabel = values.label;
      return {'offerId':coupenlists.id,'userMappingId':aValue,'label':alabel,'mappingType':'individualUser'};
    });
  }
  if(usergroup) {
    let Stringarray = usergroup.split(",")||usergroup;
      userD = Stringarray.map((values, index) => {
      let aValue = values;
      return {'offerId':coupenlists.id,'userMappingId':aValue,'mappingType':'userGroup'};
    });
    usermapping = usergroupData.concat(userD);
    [err, coupenmapping] = await to(offer_user_mappings.bulkCreate(usermapping));
    if(err) { return err; }
  }
  
  if(offeritem) {
    let Stringarray1 = offeritem.split(",")||offeritem;
      userD1= Stringarray1.map((values, index) => {
      let aValue = values;
      return {'offerId':coupenlists.id,'type':coupenTypeId,'itemId':aValue};
    });
    
    [err, coupenmapping] = await to(offer_category_products.bulkCreate(userD1));
    if(err) { return err; }
  }
  }
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
  Logger.info("555",search);
  const dbQuery = getSearchQuery(search)
  Logger.info("rrr",{where:dbQuery,limit,offset:page});
  let coupenlist, err = '';
  [err, coupenlist] = await to(offers.findAndCountAll({
    where: { 'deleted': 0 },
    "limit": 10,
    "offset": 0
  }
  ));
  if(err) { return err; }
  return coupenlist;
};

const getCoupenId = async (id) => {
  [err, offeruser] = await to(offer_user_mappings.findAll({where: { offerId: id }}));
  if(err) { return err; }
  [err, offerlist] = await to(offers.findAll({where: { id: id }}));
  if(err) { return err; }
  [err, offerproduct] = await to(offer_category_products.findAll({where: { offerId: id }}));
  if(err) { return err; }
  let coupenlist = {"offer":offerlist,"offeruser":offeruser,"offerproduct":offerproduct};
  return coupenlist;
}

module.exports.getCoupenId = getCoupenId;

const updatecoupen = async (id, param) => {
  
  const {description, type, method, minimum_cart, maximum_cart, offeritem, name, validFrom, validTo, coupenTypeId, status,coupenCode, usergroup, userData, amount} = param;
  [err,coupenlists ] = await to(offers.update(param, {where: {id: id} }));
  if(err) TE(err.message);
  let usermapping = '';
  if(coupenlists && (userData || usergroup )) {
    [err, deletecoupen] = await to(offer_user_mappings.destroy({where: {offerId:id,isApplied:'no'}}));
    if(err) { return err; }
    const usergroupData = JSON.parse(userData).map((values, index) => {
      let aValue = values.value;
      let alabel = values.label;
      return {'offerId':id,'userMappingId':aValue,'label':alabel,'mappingType':'individualUser'};
    });
    let Stringarray = usergroup.split(",")||usergroup;
    const userD = Stringarray.map((values, index) => {
      let aValue = values;
      return {'offerId':id,'userMappingId':aValue,'mappingType':'userGroup'};
    });
    usermapping = usergroupData.concat(userD);
    [err, coupenmapping] = await to(offer_user_mappings.bulkCreate(usermapping));
    if(err) { return err; }
  }
  return coupenlists;
}

module.exports.updatecoupen = updatecoupen;

exports.getAllCoupenSection = async () => {
  [err, coupensectionlist] = await to(offer_types.findAll());
  if(err) { return err; }
  return coupensectionlist;
}

const getCoupenDetail = async (id) => {
  [err, coupenlist] = await to(coupens.find({where: { coupenCode: id }}));
  if(err) { TE(err.message); }
  return coupenlist;
}

module.exports.getCoupenDetail = getCoupenDetail;
