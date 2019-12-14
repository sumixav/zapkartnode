const { users } 	    = require('../models');
const validator     = require('validator');
const { to, TE , ReE}    = require('../services/util.service');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const findUserByEmail = async function(email){

    if(email && validator.isEmail(email)) {
        [err, user] = await to(users.findOne({where: {email:email}}));
        if(err) { return err; }
        if (user && user.email) {
          return {email: user.email};;
        } else {
            return { message: 'NotExist'};
        }
    }
}
module.exports.findUserByEmail = findUserByEmail;

const findUserByPhone = async function(phone){
    if(phone && validator.isMobilePhone(phone)) {
        [err, user] = await to(users.find({where: {phone:phone}}));
        if(err) { return err; }
        if (user && user.phone) {
            return {phone: user.phone};
        } else {
            return { message: 'NotExist'};
        }
    }
}
module.exports.findUserByPhone = findUserByPhone;

const createUser = async (userInfo) => {
    
    let email = await findUserByEmail(userInfo.email);
    
     let phone = (typeof userInfo.phone!='undefined')? 
    await findUserByPhone(userInfo.phone.toString()):null;
    
    if (email.message === 'NotExist') {
        let userParam={};
        userParam.firstName =  userInfo.firstName;
        userParam.lastName =  userInfo.lastName;
        userParam.email =  userInfo.email;
        userParam.phone =  (typeof userInfo.phone!='undefined')?userInfo.phone:null;
        userParam.weddingaddress =  userInfo.weddingaddress;
        userParam.password =  userInfo.password;
        userParam.userTypeId =  userInfo.userType;
        userParam.partnerfirstName =  userInfo.partnerfirstName;
        userParam.partnerlastName =  userInfo.partnerlastName;
        userParam.languageId =  userInfo.languageId;
        userParam.weddingDate =  userInfo.weddingDate;
        userParam.guestCount =  userInfo.guestCount;
        userParam.active =  0;
        userParam.confirmed =  0;
        [err, user] = await to(users.create(userParam));
        if(err) { return TE(err.message); }
        return user;
    } else if( email && email.email){
        return TE('Email id already exist');
    } else if( phone && phone.phone){
        return TE('phone number already exist');
    }
}
module.exports.createUser = createUser;

const authUser = async function(userInfo){
    
    if(validator.isEmail(userInfo.loginId)) {
        [err, user] = await to(users.findOne({where: {email:userInfo.loginId}}));
            if(err) TE(err.message);
    
    } else if (validator.isMobilePhone(userInfo.loginId)) {
        [err, user] = await to(users.findOne({where:{phone:userInfo.loginId}}));
            if(err) TE(err.message);
    }
    
    if(!user) TE('user not registered');

    [err, user] = await to(user.comparePassword(userInfo.password));
    if(err) TE(err.message);
    return user;

}
module.exports.authUser = authUser;

const updateUserLocation = async function(user, data){

    userData = userBodyParam(param.body);
    [err, user] = await to(user.update(
        userData, {where: {id: user.id} }
      ));
      if(err) TE(err.message);
      return user;
}
module.exports.updateUserLocation = updateUserLocation;

const userBodyParam =  (params) => {
    
    let user ={};
    for (var data in params) {
       
        user[data] = params[data];
        }
    return user;
    
}

module.exports.userBodyParam = userBodyParam;

const getUser = async function(userId){
    console.log(userId);
    [err, user] = await to(users.findById(userId));
      if(err) TE(err.message);
      return user;
}
module.exports.getUser = getUser;

const authuserSearch = async function(param){
   
    [err, user] = await authSearchCriteria(param);
      if(err) TE(err.message);
      return user;
}
module.exports.authuserSearch = authuserSearch;

const authSearchCriteria = async function(params) {
    
    let search ={};
    switch (params.usertype) {
        case 1: 
        [err, user] = await to(users.find({where: {'email':{[Op.like]: `%${params.values}%`}}
        }));
        if(err) { return err; }
        break;
        
        case 2: 
        [err, user] = await to(users.find({where: {'phone':{[Op.like]: `%${params.values}%`}}
        }));
        if(err) { return err; }
        break;

        case 3: 
        [err, user] = await to(users.find({where: {'firstName':{[Op.like]: `%${params.values}%`}}
        }));
        if(err) { return err; }
        break;
        
     }

     return user;
    
}

module.exports.authSearchCriteria = authSearchCriteria;


