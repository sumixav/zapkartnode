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
  const {name, validFrom, validTo, coupenTypeId, status,coupenCode, usergroup, userData} = param;
  [err, coupenlists] = await to(coupens.create({createdBy:1,name,validFrom,validTo,coupenTypeId,status,coupenCode}));
  if(err) { return err; }
  let usermapping = '';
  if(coupenlists) {
    const usergroupData = JSON.parse(userData).map((values, index) => {
      let aValue = values.value;
      let alabel = values.label;
      return {'coupenId':coupenlists.id,'userMappingId':aValue,'label':alabel,'mappingType':'individualUser'};
    });
    let Stringarray = usergroup.split(",")||usergroup;
    const userD = Stringarray.map((values, index) => {
      let aValue = values;
      return {'coupenId':coupenlists.id,'userMappingId':aValue,'mappingType':'userGroup'};
    });
    usermapping = usergroupData.concat(userD);
    [err, coupenmapping] = await to(coupen_user_mappings.bulkCreate(usermapping));
    if(err) { return err; }
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
  const dbQuery = {
    where: {
        ...getSearchQuery(search)
    }
  }
  let coupenlist, err = '';
  [err, coupenlist] = await to(coupens.findAndCountAll({where:{deleted:0},limit,offset:page}));
  if(err) { return err; }
  return coupenlist;
};

const getCoupenId = async (id) => {
  [err, coupenlist] = await to(coupens.find({where: { id: id },include: [{model: coupen_user_mappings}]}));
  if(err) { return err; }
  return coupenlist;
}

module.exports.getCoupenId = getCoupenId;

const updatecoupen = async (id, param) => {
  
    const {name, validFrom, validTo, coupenTypeId, status,coupenCode, usergroup, userData,deleted} = param;
  [err,coupenlists ] = await to(coupens.update(param, {where: {id: id} }));
  if(err) TE(err.message);
  let usermapping = '';
  if(coupenlists && (userData || usergroup )) {
    [err, deletecoupen] = await to(coupen_user_mappings.destroy({where: {coupenId:id,isApplied:'no'}}));
    if(err) { return err; }
    const usergroupData = JSON.parse(userData).map((values, index) => {
      let aValue = values.value;
      let alabel = values.label;
      return {'coupenId':id,'userMappingId':aValue,'label':alabel,'mappingType':'individualUser'};
    });
    let Stringarray = usergroup.split(",")||usergroup;
    const userD = Stringarray.map((values, index) => {
      let aValue = values;
      return {'coupenId':id,'userMappingId':aValue,'mappingType':'userGroup'};
    });
    usermapping = usergroupData.concat(userD);
    [err, coupenmapping] = await to(coupen_user_mappings.bulkCreate(usermapping));
    if(err) { return err; }
  }
  return coupenlists;
}

module.exports.updatecoupen = updatecoupen;

exports.getAllCoupenSection = async () => {
  [err, coupensectionlist] = await to(coupen_types.findAll());
  if(err) { return err; }
  return coupensectionlist;
}

const getCoupenDetail = async (id) => {
  [err, coupenlist] = await to(coupens.find({where: { coupenCode: id }}));
  if(err) { return err; }
  return coupenlist;
}

module.exports.getCoupenDetail = getCoupenDetail;
