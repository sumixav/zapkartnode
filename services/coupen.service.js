const cleanDeep = require("clean-deep");
const { offers, offer_types, offer_user_mappings, offer_category_products, carts } = require("../auth_models");
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
const map = require("lodash/map");
const moment = require('moment');



exports.createCoupen = async (param) => {
  const { totalUsedCount, description, type, method, minimum_cart, maximum_cart, offeritem, name, validFrom, validTo, coupenTypeId, status, coupenCode, usergroup, userData, amount } = param;
  [err, coupenlists] = await to(offers.create({ totalUsedCount, method, minimum_cart, maximum_cart, type, description, createdBy: 1, name, validFrom, validTo, status, coupenCode, amount }));
  if (err) { TE(err.message); }
  Logger.info("00000", coupenlists, userData);
  let usermapping = '';
  let usergroupData = {};
  let userD = {};
  if (coupenlists) {
    if (userData) {
      usergroupData = JSON.parse(userData).map((values, index) => {
        let aValue = values.value;
        let alabel = values.label;
        return { 'offerId': coupenlists.id, 'userMappingId': aValue, 'label': alabel, 'mappingType': 'individualUser' };
      });
      [err, coupenmapping] = await to(offer_user_mappings.bulkCreate(usergroupData));
      if (err) { TE(err.message); }
    }
    if (usergroup) {
      let Stringarray = usergroup.split(",") || usergroup;
      userD = Stringarray.map((values, index) => {
        let aValue = values;
        return { 'offerId': coupenlists.id, 'userMappingId': aValue, 'mappingType': 'userGroup' };
      });
      [err, coupenmapping] = await to(offer_user_mappings.bulkCreate(userD));
      if (err) { TE(err.message); }
    }

    if (offeritem) {
      let Stringarray1 = offeritem.split(",") || offeritem;
      userD1 = Stringarray1.map((values, index) => {
        let aValue = values;
        return { 'offerId': coupenlists.id, 'type': coupenTypeId, 'itemId': aValue };
      });

      [err, coupenmapping] = await to(offer_category_products.bulkCreate(userD1));
      if (err) { TE(err.message); }
    }
  }
  return coupenlists;
};

exports.searchCoupenAssign = async (search) => {
  let searchCondition = {};
  if (search) {
    Object.assign(searchCondition, search['id'] ? { 'id': search['id'] } : '',
      search['name'] ? { 'name': search['name'] } : '',
      search['coupenCode'] ? { 'coupenCode': search['coupenCode'] } : '');
  }
  return Object.values(searchCondition);
};

exports.getAllCoupen = async (query) => {
  const { page, limit, search } = parseStrings(query);
  Logger.info("555", search);
  const dbQuery = getSearchQuery(search)
  Logger.info("dbQuerydbQuery", dbQuery);
  let coupenlist, err = '';
  [err, coupenlist] = await to(offers.findAndCountAll({
    where: { ...dbQuery, 'deleted': 0 },
    order: [
      ['id', 'DESC'],
    ],
    "limit": 10,
    "offset": 0
  }
  ));
  if (err) { TE(err.message); }
  return coupenlist;
};

const getCoupenId = async (id) => {
  let offerproduct = {};
  [err, offeruser] = await to(offer_user_mappings.findAll({ where: { offerId: id } }));
  if (err) { TE(err.message); }
  [err, offerlist] = await to(offers.findAll({ where: { id: id } }));
  if (err) { TE(err.message); }
  [err, offerProductResult] = await to(offer_category_products.findAll({ where: { offerId: id } }));
  if (err) { TE(err.message); }
  if (offerProductResult) {

    offerproduct = await Promise.all(
      offerProductResult.map(async function (item) {
        //Object.assign(item, {key3: "value3"});
        product = await Product.findOne({ _id: item.itemId }).select("name");
        Logger.info("ggg", product);
        let obj = { ...product._doc };

        return obj;
      })
    );
  }
  let coupenlist = { "offer": offerlist, "offeruser": offeruser, "offerproduct": offerproduct };
  return coupenlist;
}

module.exports.getCoupenId = getCoupenId;

const updatecoupen = async (id, param) => {

  let err, coupenlists, deletecoupen, coupenmapping;
  const { description, type, method, minimum_cart, maximum_cart, offeritem, name, validFrom, validTo, coupenTypeId, status, coupenCode, usergroup, userData, amount } = param;
  const filteredObject = pickBy(param, v => v !== null && v !== undefined && v !== "null");
  // let filteredObject = pickBy(param, v => v !== undefined);
  // filteredObject = map(filteredObject, i => i === "null" ? null : i);
  // Object.entries(filteredObject).forEach(([key, value])=> {
  //   if (value === "null") filteredObject[key] = null;
  // });
  // Logger.info('mmm', filteredObject)


  [err, coupenlists] = await to(offers.update(filteredObject, { where: { id: id } }));
  if (err) TE(err.message);
  let usermapping = '';
  let userD = usergroupData = {};
  Logger.info("7777", userData);
  [err, deletecoupen] = await to(offer_user_mappings.destroy({ where: { offerId: id, isApplied: 'no' } }));
  if (err) { TE(err.message); }
  if (!isEmpty(userData) && userData != 'null') {
    usergroupData = JSON.parse(userData).map((values, index) => {
      Logger.info("hhhhhh");
      let aValue = values.value;
      let alabel = values.label;
      return { 'offerId': id, 'userMappingId': aValue, 'label': alabel, 'mappingType': 'individualUser' };
    });
    [err, coupenmapping] = await to(offer_user_mappings.bulkCreate(usergroupData));
    if (err) { TE(err.message); }
  }
  if (!isEmpty(usergroup)) {
    let Stringarray = usergroup.split(",") || usergroup;
    userD = Stringarray.map((values, index) => {
      let aValue = values;
      return { 'offerId': id, 'userMappingId': aValue, 'mappingType': 'userGroup' };
    });
    [err, coupenmapping] = await to(offer_user_mappings.bulkCreate(userD));
    if (err) { TE(err.message); }
  }





  if (filteredObject.coupenTypeId) {
    [err, deleteproduct] = await to(offer_category_products.destroy({ where: { offerId: id } }));
    if (err) { TE(err.message); }
    let Stringarray1 = offeritem.split(",") || offeritem;
    userD1 = Stringarray1.map((values, index) => {
      let aValue = values;
      return (!isEmpty(aValue)) ? { 'offerId': id, 'type': coupenTypeId, 'itemId': aValue } : {};
    }).filter(i => !isEmpty(i));

    Logger.info('ddd', userD1)
    if (userD1.length > 0) {
      [err, coupenmapping] = await to(offer_category_products.bulkCreate(userD1));
      if (err) { TE(err.message); }

    }
  }

  return coupenlists;
}

module.exports.updatecoupen = updatecoupen;

exports.getAllCoupenSection = async () => {
  [err, coupensectionlist] = await to(offer_types.findAll());
  if (err) { TE(err.message); }
  return coupensectionlist;
}

const getCoupenDetail = async (id, user) => {
  let aValue = 0;
  let offerproduct = {};
  [err, coupenlist] = await to(offers.find({ where: { coupenCode: id } }));
  if (err) { TE(err.message); }
  if (coupenlist) {
    [err, cart] = await to(carts.findAll({ where: { userId: user.id } }));
    if (err) { TE(err.message); }

    if (!(moment().isBetween(coupenlist.validFrom, coupenlist.validTo))) {
      TE("Coupon has expired!");
    }

    [err, userGroupcoupen] = await to(offer_user_mappings.findAll({ where: { offerId: coupenlist.id, mappingType: 'individualUser' } }));
    if (err) { TE(err.message); }
    let cartPrice = cart.map(cartprice => cartprice.price).reduce((acc, cartprice) => cartprice + acc);

    if (coupenlist && (!(cartPrice >= coupenlist.minimum_cart))) {
      TE(`Coupen minimum cart value should be Rs ${coupenlist.minimum_cart}`);
    }
    if (userGroupcoupen && (userGroupcoupen.length > 0)) {
      [err, userGroup] = await to(offer_user_mappings.findAll({ where: { offerId: coupenlist.id, mappingType: 'individualUser', userMappingId: user.id } }));
      if (err) { TE(err.message); };
      if (userGroup.length > 0) return coupenlist;
      else TE(`Coupen can't be used right now`);
    }

    [err, offerProductResult] = await to(offer_category_products.findAll({ where: { offerId: coupenlist.id } }));
    if (err) { TE(err.message); }

    if (offerProductResult.length > 0) {
      let finalAmt = 0;
      offerproduct = await Promise.all(
        offerProductResult.map(async function (item) {
          //Object.assign(item, {key3: "value3"});
          cartProduct = await carts.findOne({ where: { userId: user.id, productId: item.itemId } });
          if (coupenlist.type === 'flat') {
            let cartPrice = cartProduct.price * cartProduct.quantity;
            let coupenPrice = coupenlist.amount * cartProduct.quantity;
            let tempAmt = cartPrice - coupenPrice;
            Logger.info("***", coupenPrice);
            finalAmt += tempAmt;
          }
          else {
            let cartPrice = cartProduct.price * cartProduct.quantity;
            let coupenPrice = (cartProduct.price * (coupenlist.amount / 100)) * cartProduct.quantity;
            let tempAmt = cartPrice - coupenPrice;
            Logger.info("***", coupenPrice);
            finalAmt += tempAmt;
            finalAmt = (finalAmt / 100);
          }
          Logger.info("***", finalAmt);

          return finalAmt;
        })
      );
      coupenlist.amount = offerproduct[0]
    }
    Logger.info("$$$$", offerProductResult.length);


    return coupenlist;
  } else {
    TE("Invalid coupon");
  }
}

module.exports.getCoupenDetail = getCoupenDetail;
