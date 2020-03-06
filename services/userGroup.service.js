const cleanDeep = require("clean-deep");
const {user_types,user_groups } = require("../auth_models");
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



exports.createusergroup = async (param) => {
 
  [err, userGroup] = await to(user_groups.create(param));
  if(err) { return err; }
  return userGroup;
};

exports.getAllUserGroup = async (role) => {
  [err, userGrouplist] = await to(user_groups.findAll({where: {userTypeId:role,deleted:'false'}}));
  return userGrouplist;
};

exports.getUserGroupId = async (id) => {
  [err, userGrouplist] = await to(user_groups.findById(id));
  if(err) { return err; }
  return userGrouplist;
}


exports.updateUserGroup = async (id, param) => {
  
  console.log("hh",param);
  [err,userGroups ] = await to(user_groups.update(param, {where: {id: id} }));
      if(err) TE(err.message);
  return userGroups;
}
