const { tips }  = require('../models');
const validator     = require('validator');
const { to, TE , ReE, ReS}    = require('../services/util.service');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


const getTipDetails = async (user) => {
    [err, tiplist] = await to(tips.findAll({
        where: [{languageId:user.languageId}]
    }));
    if(err) { return err; }
    return tiplist;
}

module.exports.getTipDetails = getTipDetails;