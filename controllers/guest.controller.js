const { to, ReE, ReS }  = require('../services/util.service');
const { status_codes_msg }  = require('../utils/appStatics');
const guestService       = require('../services/guest.service');


const getGuestlist = async function(req, res) {
    try {
        [err, guestlist] = await to(guestService.getGuestDetails(req.user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (guestlist) {
                return ReS(res, { message:'Guest', guestDetails : guestlist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

module.exports.getGuestlist = getGuestlist;

const storeGuestlist = async function(req, res){
    const param = req.body;
    let user = req.user;
    
    try {
        [err, storeguest] = await to(guestService.storeGuestDetails(param, user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (storeguest) {
            return ReS(res, {message:storeguest},  status_codes_msg.SUCCESS.code);
            }
        } catch (err) {
            return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
        }   
};

module.exports.storeGuestlist = storeGuestlist;

const storeBulkGuestlist = async function(req, res){
    const param = req.body;
    console.log(JSON.stringify(param));
    
    try {
        [err, storeguest] = await to(guestService.storeBulkGuestDetails(param));
        console.log("11111",err);
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (storeguest) {
                console.log("222222",JSON.stringify(storeguest));
            return ReS(res, {message:"Created Data Successfully"},  status_codes_msg.SUCCESS.code);
            }
        } catch (err) {
            return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
        }   
};

module.exports.storeBulkGuestlist = storeBulkGuestlist;

const deleteGuestlist = async function(req, res){
    let param  = req.body;
    
    
    try {
        [err, deleteguest] = await to(guestService.deleteguestDetails(param));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (deleteguest) {
            return ReS(res, {message:"Contact deleted successfully"},  status_codes_msg.SUCCESS.code);
            }
        } catch (err) {
            return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
        }   
};

module.exports.deleteGuestlist = deleteGuestlist;