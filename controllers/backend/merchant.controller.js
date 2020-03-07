const { to, ReE, ReS } = require("../../services/util.service");
const { status_codes_msg } = require("../../utils/appStatics");
const Logger = require("../../logger");
const authService       = require('../../services/auth.service');

const merchantService = require("../../services/merchant.service");

const create = async (req, res, next) => {
  let param = req.body;
 
  try {
      [err, user] = await to(authService.createUser({...param,"roleId":2}));
      if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
      let merchantParam = {...param,"userId":req.user.Id,"createdBy":req.user.Id};
     [err, merchant] = await to(merchantService.createmerchant(merchantParam));
  
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (merchant) {
      return ReS(res,{ message: "Merchant", data: merchant },status_codes_msg.CREATED.code);
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
}
module.exports.create = create;
exports.getAllMerchant = async (req, res, next) => {
  try {
    const [err, Merchant] = await to(merchantService.getAllMerchant(req.query));

    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (Merchant) {
      return ReS(
        res,
        { message: "Merchant", data: Merchant },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

const getMerchant = async function(req, res) {
  try {
      let id  = req.params.id;
      [err, merchantlist] = await to(merchantService.getMerchantId(id));
          if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
          [err, user] = await to(authService.getUser(merchantlist.userId));
          if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);  
          
          if (merchantlist) {
            userlist = user.toJSON();
            delete userlist.password;
            merchant = {...merchantlist.toJSON(),...userlist}
              return ReS(res, { message:'merchant', data :merchant}
                      , status_codes_msg.SUCCESS.code);
          }
  } catch (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.getMerchant = getMerchant;

const updateMerchant = async function(req, res) {
  let id  = req.params.id;
  
  try {
      [err, merchantlist] = await to(merchantService.updatemerchant(id,req.body));
          if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
          if (merchantlist) {
              
              return ReS(res, { message:'merchant has been updated', merchantlistDetails : merchantlist}
                      , status_codes_msg.SUCCESS.code);
          }
  } catch (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }

};

module.exports.updateMerchant = updateMerchant;


