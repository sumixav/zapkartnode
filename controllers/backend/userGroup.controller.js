const { to, ReE, ReS } = require("../../services/util.service");
const { status_codes_msg } = require("../../utils/appStatics");
const Logger = require("../../logger");
const { user_types }          = require('../../auth_models');

const userGroupService = require("../../services/userGroup.service");

const create = async (req, res, next) => {
  
  try {
    let usergroup = {};
    Logger.info("nbvnb",req.params.role);
    [err,userType ] = await to(user_types.findOne({where: {name:req.params.role}}));
    if(err) TE(err.message);
    if((userType)&&(userType!='')) {
    const param = {...req.body,"createdBy":req.user.id,"userTypeId":userType.id};
    [err, usergroup] = await to(userGroupService.createusergroup(param));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (usergroup) {
      return ReS(res,{ message: "User Group", data: usergroup },status_codes_msg.CREATED.code);
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
}
module.exports.create = create;
exports.getAllUserGroup = async (req, res, next) => {
  try {
    const [err_user,userType ] = await to(user_types.findOne({where: {name:req.params.role}}));
    if(err_user) TE(err_user.message);
    const [err, UserGroup] = await to(userGroupService.getAllUserGroup(userType.id));
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (UserGroup) {
      return ReS(
        res,
        { message: "UserGroup", data: UserGroup },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

const getUserGroup = async function(req, res) {
  try {
      let id  = req.params.id;
      [err, usergrouplist] = await to(userGroupService.getUserGroupId(id));
          if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
          if (usergrouplist) {
              return ReS(res, { message:'usergroup', data : usergrouplist}
                      , status_codes_msg.SUCCESS.code);
          }
  } catch (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.getUserGroup = getUserGroup;

const updateUserGroup = async function(req, res) {
 
  let id  = req.params.id;

  try {
      [err, usergrouplist] = await to(userGroupService.updateUserGroup(id,req.body));
          if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
          if (usergrouplist) {
              
              return ReS(res, { message:'userGroup has been updated', userGrouplistDetails : usergrouplist}
                      , status_codes_msg.SUCCESS.code);
          }
  } catch (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }

};

module.exports.updateUserGroup = updateUserGroup;


