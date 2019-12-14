const { wedding_day_timelines, users, statues }  = require('../models');
const validator     = require('validator');
const { to, TE , ReE, ReS}    = require('../services/util.service');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const storeWeddinglist = async (paramInfo, user) => {

    let weddingParam = {userId:user.id,
    dateTime:paramInfo.date,
    name:paramInfo.name,
    languageId:user.languageId
    };
console.log(weddingParam);
    [err, weddingDetails] = await to(wedding_day_timelines.create(weddingParam));
    if(err) { return err; }
    return weddingDetails; 
}

module.exports.storeWeddinglist = storeWeddinglist;

const getWeddingById = async (id, user) => {
    [err, weddinglist] = await to(wedding_day_timelines.findById(id, {
        include: [
            { model :statues, required:false  }
         ]
        }));
    if(err) { return err; }
    return weddinglist;
}

module.exports.getWeddingById = getWeddingById;

const updateWeddingService = async (id, param) => {
    weddingData = weddingBodyParam(param.body);
    
        
    [err,weddingupdate ] = await to(wedding_day_timelines.update(weddingData, {where: {id: id} }));
        if(err) TE(err.message);
    return weddingupdate;
}

module.exports.updateWeddingService = updateWeddingService;

const weddingBodyParam =  (params) => {
    
    let wedding ={};
    for (var data in params) {
       
        wedding[data] = params[data];
        }
    return wedding;
    
}

module.exports.weddingBodyParam = weddingBodyParam;

const getWeddingDetails = async (user) => {
    [err, weddinglist] = await to(wedding_day_timelines.findAll({
        where: [{ userId: user.id },{languageId:user.languageId},{active:1}],
        attributes: ['id', 'userId','name','statueId','statueId','active', 
        [Sequelize.fn('date_format', Sequelize.col('dateTime'), '%H:%i'), 'dateTime']],
        order: [
            ['dateTime', 'ASC'],
        ],
        include: [
            { model :statues  }
         ]
    }));
    if(err) { return err; }
    return weddinglist;
}

module.exports.getWeddingDetails = getWeddingDetails;
