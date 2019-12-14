const { to, ReE, ReS }  = require('../services/util.service');
const { status_codes_msg }  = require('../utils/appStatics');
const weddingService       = require('../services/wedding.service');

const storeWedding = async function(req, res){
    const param = req.body;
    let user = req.user;
    
    try {
        [err, storewed] = await to(weddingService.storeWeddinglist(param, user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (storewed) {
            return ReS(res, {message:storewed},  status_codes_msg.SUCCESS.code);
            }
        } catch (err) {
            return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
        }   
};

module.exports.storeWedding = storeWedding;

const getWedding = async function(req, res) {
    try {
        let id  = req.params.id;
        [err, weddinglist] = await to(weddingService.getWeddingById(id, req.user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (weddinglist) {
                return ReS(res, { message:'wedding', weddingDetails : weddinglist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

module.exports.getWedding = getWedding;

const updateWedding = async function(req, res) {
    let id  = req.params.id;

    try {
        [err, weddinglist] = await to(weddingService.updateWeddingService(id,req));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (weddinglist) {
                
                return ReS(res, { message:'wedding has been updated', weddinglistDetails : weddinglist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }

};

module.exports.updateWedding = updateWedding;

const getWeddingDetail = async function(req, res) {
    try {
        
        [err, weddinglist] = await to(weddingService.getWeddingDetails(req.user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (weddinglist) {
                return ReS(res, { message:'weddinglist', weddinglist : weddinglist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

module.exports.getWeddingDetail = getWeddingDetail;