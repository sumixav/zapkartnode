const cleanDeep = require("clean-deep");
const {offers, offer_types, offer_user_mappings, offer_category_products,carts} = require("../auth_models");
const validator = require("validator");
const Product = require("../models/product");
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
const pickBy = require("lodash/pickBy");
const moment     = require('moment');



exports.createCoupen = async (param) => {
  const {totalUsedCount,description, type, method, minimum_cart, maximum_cart, offeritem, name, validFrom, validTo, coupenTypeId, status,coupenCode, usergroup, userData, amount} = param;
  [err, coupenlists] = await to(offers.create({totalUsedCount,method,minimum_cart,maximum_cart,type,description,createdBy:1,name,validFrom,validTo,status,coupenCode,amount}));
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
  Logger.info("dbQuerydbQuery",dbQuery);
  let coupenlist, err = '';
  [err, coupenlist] = await to(offers.findAndCountAll({
    where: {...dbQuery,'deleted': 0 },
    "limit": 10,
    "offset": 0
  }
  ));
  if(err) { return err; }
  return coupenlist;
};

const getCoupenId = async (id) => {
  let offerproduct = {};
  [err, offeruser] = await to(offer_user_mappings.findAll({where: { offerId: id }}));
  if(err) { return err; }
  [err, offerlist] = await to(offers.findAll({where: { id: id }}));
  if(err) { return err; }
  [err, offerProductResult] = await to(offer_category_products.findAll({where: { offerId: id }}));
  if(err) { return err; }
  if(offerProductResult) {

    offerproduct =  await Promise.all(
    offerProductResult.map(async function (item) {
        //Object.assign(item, {key3: "value3"});
        product = await Product.findOne({ _id: item.itemId }).select("name");
        Logger.info("ggg",product);
        let obj = {...product._doc };
        
        return obj;
      })
    );
  }
  let coupenlist = {"offer":offerlist,"offeruser":offeruser,"offerproduct":offerproduct};
  return coupenlist;
}

module.exports.getCoupenId = getCoupenId;

const updatecoupen = async (id, param) => {
  
  const {description, type, method, minimum_cart, maximum_cart, offeritem, name, validFrom, validTo, coupenTypeId, status,coupenCode, usergroup, userData, amount} = param;
  const filteredObject = pickBy(param, v => v !== null && v !== undefined && v !== "null");
  
  [err,coupenlists ] = await to(offers.update(filteredObject, {where: {id: id} }));
  if(err) TE(err.message);
  let usermapping = '';
  let userD = usergroupData = {};
  if((JSON.parse(userData).length > 0)) {
    [err, deletecoupen] = await to(offer_user_mappings.destroy({where: {offerId:id,isApplied:'no'}}));
    if(err) { return err; }
    usergroupData = JSON.parse(userData).map((values, index) => {
      Logger.info("hhhhhh");
      let aValue = values.value;
      let alabel = values.label;
      return {'offerId':id,'userMappingId':aValue,'label':alabel,'mappingType':'individualUser'};
    });
    [err, coupenmapping] = await to(offer_user_mappings.bulkCreate(usergroupData));
    if(err) { return err; }
  }
    if(!isEmpty(usergroup)) {
    let Stringarray = usergroup.split(",")||usergroup;
     userD = Stringarray.map((values, index) => {
      let aValue = values;
      return {'offerId':id,'userMappingId':aValue,'mappingType':'userGroup'};
    });
    [err, coupenmapping] = await to(offer_user_mappings.bulkCreate(userD));
    if(err) { return err; }
  }

  
    
  

  if(filteredObject.coupenTypeId) {
    [err, deleteproduct] = await to(offer_category_products.destroy({where: {offerId:id}}));
    if(err) { return err; }
    let Stringarray1 = offeritem.split(",")||offeritem;
      userD1= Stringarray1.map((values, index) => {
      let aValue = values;
      return {'offerId':id,'type':coupenTypeId,'itemId':aValue};
    });
    
    [err, coupenmapping] = await to(offer_category_products.bulkCreate(userD1));
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

const getCoupenDetail = async (id, user) => {
  let aValue = 0;
  let offerproduct = {};
  [err, coupenlist] = await to(offers.find({where: { coupenCode: id }}));
  if(err) { TE(err.message); }
  if(coupenlist) {
  [err, cart] = await to(carts.findAll({ where: { userId: user.id } }));
  if(err) { TE(err.message); }

  if(!(moment().isBetween(coupenlist.validFrom, coupenlist.validTo))) {
    return "Coupen Can't be Applied";
  }

  [err, userGroupcoupen] = await to(offer_user_mappings.findAll({where: {offerId:coupenlist.id,mappingType:'individualUser'}}));
  if(err) { return err; }
  let cartPrice = cart.map(cartprice => cartprice.price).reduce((acc, cartprice) => cartprice + acc);
   
  if(coupenlist && (!(cartPrice >= coupenlist.minimum_cart))) {
     return `Coupen minimum cart order should be ${coupenlist.minimum_cart}`;
  }
  if(userGroupcoupen && (userGroupcoupen.length > 0)) {
    [err, userGroup] = await to(offer_user_mappings.findAll({where: {offerId:coupenlist.id,mappingType:'individualUser',userMappingId:user.id}}));
    if(err) { return err; }
    return (userGroup.length > 0)?coupenlist:`Coupen can't be used right now`;
  }

  [err, offerProductResult] = await to(offer_category_products.findAll({where: { offerId: coupenlist.id }}));
  if(err) { return err; }

  if(offerProductResult) {
    let finalAmt = 0;
    offerproduct =  await Promise.all(
      offerProductResult.map(async function (item) {
          //Object.assign(item, {key3: "value3"});
          cartProduct = await carts.findOne({ where: { userId: user.id,productId:item.itemId } });
          if(coupenlist.type === 'flat') {
            let cartPrice =cartProduct.price * cartProduct.quantity;
            let coupenPrice =coupenlist.amount * cartProduct.quantity;
            let tempAmt = cartPrice - coupenPrice;
            Logger.info("***",coupenPrice);
            finalAmt +=tempAmt;
          }
          else {
            let cartPrice =cartProduct.price * cartProduct.quantity;
            let coupenPrice =(cartProduct.price * (coupenlist.amount/100)) * cartProduct.quantity;
            let tempAmt = cartPrice - coupenPrice;
            Logger.info("***",coupenPrice);
            finalAmt +=tempAmt;
            finalAmt = (finalAmt/100);
          }
          Logger.info("***",finalAmt);
          
          return finalAmt;
        })
      );
      coupenlist.amount = offerproduct[0]
  }
  

  
  return  coupenlist;
} else {
  return  "Invalid Coupen";
}
}

module.exports.getCoupenDetail = getCoupenDetail;
