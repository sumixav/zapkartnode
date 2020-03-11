const { to, ReE, ReS } = require("../../services/util.service");
const { status_codes_msg } = require("../../utils/appStatics");
const Logger = require("../../logger");
const coupenService       = require('../../services/coupen.service');

const create = async (req, res, next) => {
  let param = req.body;
 
  try {
      [err, coupen] = await to(coupenService.createCoupen(param));
      if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (coupen) {
      return ReS(res,{ message: "Coupen", data: coupen },status_codes_msg.CREATED.code);
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
}
module.exports.create = create;
exports.getAllCoupen = async (req, res, next) => {
  try {
    const [err, Coupen] = await to(coupenService.getAllCoupen(req.query));

    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (Coupen) {
      return ReS(
        res,
        { message: "Coupen", data: Coupen },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

const getCoupen = async function(req, res) {
  try {
      let id  = req.params.id;
      [err, coupenlist] = await to(coupenService.getCoupenId(id));
          if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
          if (coupenlist) {
            
              return ReS(res, { message:'coupen', data :coupenlist}
                      , status_codes_msg.SUCCESS.code);
          }
  } catch (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.getCoupen = getCoupen;

const updateCoupen = async function(req, res) {
  let id  = req.params.id;
  
  try {
      [err, coupenlist] = await to(coupenService.updatecoupen(id,req.body));
          if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
          if (coupenlist) {
              
              return ReS(res, { message:'coupen has been updated', coupenlistDetails : coupenlist}
                      , status_codes_msg.SUCCESS.code);
          }
  } catch (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }

};

module.exports.updateCoupen = updateCoupen;

exports.getAllCoupenSection = async (req, res, next) => {
  try {
    const [err, Coupensection] = await to(coupenService.getAllCoupenSection());

    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (Coupensection) {
      return ReS(
        res,
        { message: "Coupensection", data: Coupensection },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};


