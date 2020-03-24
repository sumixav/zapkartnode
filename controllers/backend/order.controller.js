const { to, ReE, ReS } = require("../../services/util.service");
const { status_codes_msg } = require("../../utils/appStatics");
const Logger = require("../../logger");

const orderService = require("../../services/order.service");

const create = async (req, res, next) => {
  const user = req.user;
  const param = {...req.body,user};
return ReS(res,{ message: "Order added", data: {'orderId':1} },status_codes_msg.CREATED.code);
  try {
   
     [err, order] = await to(orderService.create(param));
  
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (order) {
      return ReS(res,{ message: "Order added", data: order },status_codes_msg.CREATED.code);
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
}
module.exports.create = create;

const getCart = async function(req, res) {
    try {
        let id  = req.user.id;
        [err, cartlist] = await to(orderService.getCart(id));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (cartlist) {
                return ReS(res, { message:'cartlist', cartlistDetails : cartlist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
  };
  
  module.exports.getCart = getCart;

  const updateCart = async function(req, res) {
 
    let id  = req.params.id;
  
    try {
        [err, cartlist] = await to(orderService.updateCart(id,req.body));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (cartlist) {
                
                return ReS(res, { message:'cart has been updated', cartlistDetails : cartlist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
  
  };
  
  module.exports.updateCart = updateCart;

  const deleteCart = async function(req, res) {
 
    let id  = req.params.id;
  
    try {
        [err, cartlist] = await to(orderService.deleteCart(id));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (cartlist) {
                
                return ReS(res, { message:'cart has been deleted', cartlistDetails : cartlist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
  
  };
  
  module.exports.deleteCart = deleteCart;