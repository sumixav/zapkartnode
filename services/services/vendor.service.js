const { vendors }  = require('../models');
const validator     = require('validator');
const { to, TE , ReE, ReS}    = require('../services/util.service');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


const getVendorDetails = async (user) => {
    [err, vendorlist] = await to(vendors.findAll({
        where: [{languageId:user.languageId}]
    }));
    if(err) { return err; }
    return vendorlist;
}

module.exports.getVendorDetails = getVendorDetails;