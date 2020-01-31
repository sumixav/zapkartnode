const { to, ReE, ReS } = require("../../services/util.service");
const { status_codes_msg } = require("../../utils/appStatics");
const Logger = require("../../logger");

const merchantTypeService = require("../../services/merchantType.service");

const create = async (req, res, next) => {
  const param = {...req.body,"createdBy":3};
  try {
   
     [err, merchanttype] = await to(merchantTypeService.createmerchanttype(param));
  
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (merchanttype) {
      return ReS(res,{ message: "Merchant Type", data: merchanttype },status_codes_msg.CREATED.code);
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
}
module.exports.create = create;
exports.getAllMerchantType = async (req, res, next) => {
  try {
    const [err, MerchantType] = await to(merchantTypeService.getAllMerchantType(req.query));
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (MerchantType) {
      return ReS(
        res,
        { message: "MerchantType", data: MerchantType, count: MerchantType.length },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

const getMerchantType = async function(req, res) {
  try {
      let id  = req.params.id;
      [err, merchanttypelist] = await to(merchantTypeService.getMerchantTypeId(id));
          if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
          if (merchanttypelist) {
              return ReS(res, { message:'merchanttype', merchanttypelistDetails : merchanttypelist}
                      , status_codes_msg.SUCCESS.code);
          }
  } catch (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.getMerchantType = getMerchantType;

const updateMerchantType = async function(req, res) {
 
  let id  = req.params.id;

  try {
      [err, merchantTypelist] = await to(merchantTypeService.updatemerchantType(id,req.body));
          if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
          if (merchantTypelist) {
              
              return ReS(res, { message:'merchantType has been updated', merchantTypelistDetails : merchantTypelist}
                      , status_codes_msg.SUCCESS.code);
          }
  } catch (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }

};

module.exports.updateMerchantType = updateMerchantType;


