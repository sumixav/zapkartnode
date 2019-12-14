const { check_lists, check_list_answers, checklist_periods, users, statues }  = require('../models');
const validator     = require('validator');
const { to, TE , ReE, ReS}    = require('../services/util.service');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const storeChecklist = async (paramInfo, user) => {

    let checklistParam = {'userId':user.id,
    'checklistPeriodId':paramInfo.checklistPeriod,
    'name':paramInfo.name,
    'description':(typeof paramInfo.description !== 'undefined')?paramInfo.description:null,
    'duedate':(typeof paramInfo.duedate !== 'undefined')?paramInfo.duedate:null,
    'languageId':paramInfo.language
    };
    [err, checkDetails] = await to(check_lists.create(checklistParam));
    if(err) { return err; }
    return checkDetails; 
}

module.exports.storeChecklist = storeChecklist;

const getChecklistById = async (id, user) => {
    [err, checklist] = await to(check_lists.findById(id, {
        include: [
            { model :checklist_periods  },
            { model :check_list_answers,
                where: [{ userId:user.id }],
                required:false,
                include: [{
                    model: statues  
                }]
              }
         ]
        }));
    if(err) { return err; }
    return checklist;
}

module.exports.getChecklistById = getChecklistById;

const updateChecklistService = async (id, param) => {
    checklistData = checklistBodyParam(param.body);
    checklistData.userId=param.user.id;
        
    [err,checklistupdate ] = await to(check_lists.update(checklistData, {where: {id: id} }));
        if(err) TE(err.message);
    return checklistupdate;
}

module.exports.updateChecklistService = updateChecklistService;

const checklistBodyParam =  (params) => {
    
    let checklist ={};
    for (var data in params) {
       
        checklist[data] = params[data];
        }
     //console.log("ggggg"+JSONrestaurant);
    return checklist;
    
}

module.exports.checklistBodyParam = checklistBodyParam;


const getchecklistperiod = async (user) => {
    [err, checklistperiodList ] = await to(checklist_periods.findAll({
        where: [{active:1},{languageId:user.languageId}]
    }));
        if(err) TE(err.message);
    return checklistperiodList;
}

module.exports.getchecklistperiod = getchecklistperiod;

const getchecklistDetails = async (user) => {
    
    [err, adminuser ] = await to(users.findAll({
        where: [{
       firstName: 'Admin'
   }]   
   }));
        if(err) TE(err.message);
    let checklist = [];    
 if (adminuser.length > 0) {
    [err, checklist] = await to(check_lists.findAll({
        where: [{ userId: {
            [Op.in]: [adminuser[0]['id'], user.id]
        } },{active:1},{languageId:user.languageId}],
        include: [
            { model :checklist_periods, required:false },
            { model :check_list_answers, required:false }
         ]
        }));
    if(err) { return err; }
    }
    return checklist;
}

module.exports.getchecklistDetails = getchecklistDetails;

const getchecklistAnswerDetails = async (user, param) => {
    [err, getchecklistanswer ] = await to(check_list_answers.findAll(
        {
            where: [{ userId: user.id },{checkListId:param.id}] 
        }
    ));
        if(err) TE(err.message);

        if(getchecklistanswer.length > 0) {
            
            checklistData = {statueId:param.status};
            [err,checklistanswer ] = await to(check_list_answers.update(checklistData, 
                {where: {checkListId: param.id} }));
            if(err) TE(err.message);
        } else {
            console.log("create");
            let checklistansParam = {
                userId:user.id,
                checkListId: param.id,
                statueId: param.status
            };
            [err, checklistanswer] = await to(check_list_answers.create(checklistansParam));
            if(err) { return err; }
        }
    return checklistanswer;
}

module.exports.getchecklistAnswerDetails = getchecklistAnswerDetails;
