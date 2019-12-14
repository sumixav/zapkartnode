const { guest_lists, users, statues }  = require('../models');
const validator     = require('validator');
const { to, TE , ReE, ReS}    = require('../services/util.service');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const getGuestDetails = async (user) => {
    [err, guestlist] = await to(guest_lists.findAll({
        where: [{ userId: user.id }],
        include: [
            { model :statues ,
                required:false
             }
         ]
    }));
    if(err) { return err; }
    return guestlist;
}

module.exports.getGuestDetails = getGuestDetails;

const storeGuestDetails = async (paramInfo, user) => {

    [err, guest ] = await to(guest_lists.findAll({
        where: [{
            userId: user.id
   }, {
    phone: paramInfo.phone
   }]   
   }));
    if(err) TE(err.message);
    let guestDetails ={};
    if(guestDetails.length > 0) {
        guestData = { name:paramInfo.name, 
                      email:paramInfo.email,
                      phone:paramInfo.phone,
                      statueId:paramInfo.status
                    };
        [err,guestDetails ] = await to(guest_lists.update(guestData, 
            {where: {id: paramInfo.id} }));
        if(err) TE(err.message);
    }
    else {
    let guestParam = {userId:user.id,
                      name:paramInfo.name, 
                      email:paramInfo.email,
                      phone:paramInfo.phone,
                      statueId:paramInfo.status
    };
    [err, guestDetails] = await to(guest_lists.create(guestParam));
    if(err) { return err; }
}
    return guestDetails; 
}

module.exports.storeGuestDetails = storeGuestDetails;

const storeBulkGuestDetails = async (paramInfo) => {

    console.log("paramInfo.contacts",paramInfo.contacts[0]['userId']);
    [err, guestDetails] = await to(guest_lists.bulkCreate(paramInfo.contacts));
    if(err) { return err; }
    console.log("gggg",JSON.stringify(guestDetails));
    return guestDetails; 
}

module.exports.storeBulkGuestDetails = storeBulkGuestDetails;

const deleteguestDetails = async (param) => {

    
    [err, guestDelete] = await to(guest_lists.destroy({where: { id: {
        [Op.in]: param.guestIds
    } }}));
    if(err) { return err; }
    return guestDelete; 
}

module.exports.deleteguestDetails = deleteguestDetails;
