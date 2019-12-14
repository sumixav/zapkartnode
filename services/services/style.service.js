const { style_quizes, style_quiz_sectors, style_quiz_answers, users, statues, style_quiz_categories, style_quiz_options }  = require('../models');
const validator     = require('validator');
const { to, TE , ReE, ReS}    = require('../services/util.service');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require("../models");



const getStyleAnswer = async (user) => {
    [err, answerlist] = await to(style_quiz_answers.findAll({
        where: [{ userId: user.id }],
        include: [
            { model :statues ,
                required:false
             }
         ]
    }));
    if(err) { return err; }
    return answerlist;
}

module.exports.getStyleAnswer = getStyleAnswer;

const getStyleDetails = async (user) => {


    [err, sector] = await to(style_quiz_sectors.findAll({
        where: [{languageId:user.languageId, active:1}]
    }));
    if(err) { return err; }
    let selectStyle = styletmp = selectunion = '';

    for (var data in sector) {
        let incre = parseInt(data) +1;
       
        selectunion = (typeof  sector[incre] !== 'undefined')?'union all':'';
        selectStyle = `${selectStyle} (select * from style_quizes where styleQuizSectorId = ${sector[data]['id']} ORDER BY RAND() limit 3) ${selectunion}`;
        
        
    }
    
    let sytleId = await to(db.sequelize.query(selectStyle, {
        replacements: {active: 1,language:user.languageId},
        type: db.sequelize.QueryTypes.SELECT
      }));
    //console.log("gbg",sytleId[1]);
    //return sytleId[1];
    let styleIds = [];
    if(sytleId[1].length>0) {
        for (var data in sytleId[1]) {
       
            styleIds[data] = sytleId[1][data]['id'];
            }
        
    }
    
    [err, stylelist] = await to(style_quizes.findAll({
        where: [{ id: {
            [Op.in]: styleIds
        } }],
        include: [
            { model :style_quiz_options ,
                required:false,
                where: [{ active:1 }],
                order: [
                    [Sequelize.literal('RAND()')]
                  ],
            
                limit: 2,
                
                
                include: [{
                    model: style_quiz_categories ,
                    required:false,
                }]
             },
            { model :style_quiz_answers ,
                required:false,
                include: [{
                    model: style_quiz_options ,
                    required:false, 
                }]
             }
         ]
    }));
    if(err) { return err; }
    return stylelist;
}

module.exports.getStyleDetails = getStyleDetails;

const storeStylelist = async (paramInfo, user) => {

    [err, styleanswer ] = await to(style_quiz_answers.findAll({
        where: [{
            userId: user.id
   }, {
    styleQuizeId: paramInfo.styleId
   },
   {
       styleQuizOptionId:paramInfo.styleoptionId
    }]   
   }));
    if(err) TE(err.message);
    let styleDetails ={};
    if(styleanswer.length > 0) {
        styleData = {styleQuizOptionId:paramInfo.styleQuizOptionId, styleQuizeId:paramInfo.styleId};
        [err,styleDetails ] = await to(style_quiz_answers.update(styleData, 
            {where: {id: paramInfo.styleanswerId} }));
        if(err) TE(err.message);
    }
    else {
    let styleParam = {userId:user.id,
        styleQuizOptionId:paramInfo.styleQuizOptionId,
        styleQuizeId:paramInfo.styleId
    };
    [err, styleDetails] = await to(style_quiz_answers.create(styleParam));
    if(err) { return err; }
}
    return styleDetails; 
}

module.exports.storeStylelist = storeStylelist;

const getStyleAnswerDetails = async (user) => {
    let objArr = [];
    [err, answerlist] = await to(style_quiz_answers.findAll({
        where: [{ userId: user.id, styleQuizOptionId: {
            [Op.ne]: null
          } }],
          attributes: [
            'styleQuizOptionId'
        ]
       
    }));
    if(err) { return err; }
    for (let data in answerlist) {
       
        objArr[data] = answerlist[data]['styleQuizOptionId'];
        }
    return objArr;
}

module.exports.getStyleAnswerDetails = getStyleAnswerDetails;


const getStyleOptionDetails = async (stylelistans) => {
    
    [err, optionlist] = await to(style_quiz_options.findAll({
        where: [{id: {
            [Op.in]: stylelistans
          } }],
          attributes: [[Sequelize.fn('count', Sequelize.col('styleQuizCategoryId')), "countopt"],'styleQuizCategoryId'],
          group: ['styleQuizCategoryId'],
          include: [{
            model: style_quiz_categories ,
            required:false,
        }]
         
       
    }));
    if(err) { return err; }
    
    
    return optionlist;
}

module.exports.getStyleOptionDetails = getStyleOptionDetails;


const stylelistDelete = async (user) => {
    
    let styleDelete = {};
    [err, ansuser] = await to(style_quiz_answers.findAll({
        where: [{userId:user.id}]
    }));
    if(err) { return err; }
    if(ansuser.length > 0) {
    [err, styleDelete] = await to(style_quiz_answers.destroy({where: { userId:user.id}}));
    if(err) { return err; }
    }
    
    return styleDelete;
}

module.exports.stylelistDelete = stylelistDelete;
