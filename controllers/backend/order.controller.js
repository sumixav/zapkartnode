const { to, ReE, ReS, parseJSONparams } = require("../../services/util.service");
const { status_codes_msg } = require("../../utils/appStatics");
const Logger = require("../../logger");
const pick = require("lodash/pick")
const parseStrings = require("parse-strings-in-object")

const orderService = require("../../services/order.service");

const create = async (req, res, next) => {
  const user = req.user;
  const param = { ...req.body, user };
  // return ReS(res,{ message: "Order added", data: {'orderId':1} },status_codes_msg.CREATED.code);
  try {
    [err, order] = await to(orderService.create(param));

    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (order) {
      return ReS(res, { message: "Order added", data: order }, status_codes_msg.CREATED.code);
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
}
module.exports.create = create;

exports.getUserOrders = async (req, res, next) => {
  let userId = req.user.id; // for authenticated users order details
  if (req.params.userId) userId = req.params.userId; // for admin to get user's order details
  let role = 'user'
  if (req.user.userTypeId === 1) role = 'admin'
  try {

    [err, order] = await to(orderService.getUserOrders(userId, role));

    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (order) {
      return ReS(res, { message: "Order", data: order }, status_codes_msg.SUCCESS.code);
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
}

exports.getOrderDetails = async (req, res, next) => {
  const { orderId } = req.params;

  try {

    [err, order] = await to(orderService.getOrderDetails(orderId,req.user));

    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (order) {
      return ReS(res, { message: "Order", data: order }, status_codes_msg.SUCCESS.code);
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
}
exports.getAllOrders = async (req, res, next) => {
  try {
    let user = req.user;
    [err, orders] = await to(orderService.getAllOrders(req.query,user));

    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (orders) {
      return ReS(res, { message: "Orders", data: orders }, status_codes_msg.SUCCESS.code);
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
}

exports.assignMerchantToOrder = async (req, res) => {
  try {
    const intParams = parseStrings(pick(req.body, 'merchantId',
      
      'orderItemId'));
    Logger.info('intParams', intParams)

    const params = { ...req.body, ...intParams };

    Logger.info('params', params)

    const [err, assigned] = await to(orderService.assignOrderItem(params))
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: "Assigned merchant to order", data: assigned }, status_codes_msg.SUCCESS.code);
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
}

exports.deleteAssignedMerchantToItem = async (req, res) => {
  try {
    const [err, data] = await to(orderService.deleteAssignedMerchant(req.body.orderItemId))
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: "Deleted assigned merchant", data: data }, status_codes_msg.SUCCESS.code);
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
}
// exports.updateAssignedMerchantToOrder = async (req, res, next) => {
//   try {
//     const [err, updated] = await to(orderService.updateAssignedMerchantToOrder(req.body, req.params.merchantOrderId))
//     if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
//     return ReS(res, { message: "Updated merchant assignment details", data: updated }, status_codes_msg.SUCCESS.code);
//   } catch (err) {
//     return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
//   }
// }

const getCart = async function (req, res) {
  try {
    let id = req.user.id;
    [err, cartlist] = await to(orderService.getCart(id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (cartlist) {
      return ReS(res, { message: 'cartlist', cartlistDetails: cartlist }
        , status_codes_msg.SUCCESS.code);
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.getCart = getCart;

const updateCart = async function (req, res) {

  let id = req.params.id;

  try {
    [err, cartlist] = await to(orderService.updateCart(id, req.body));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (cartlist) {

      return ReS(res, { message: 'cart has been updated', cartlistDetails: cartlist }
        , status_codes_msg.SUCCESS.code);
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }

};

module.exports.updateCart = updateCart;

const deleteCart = async function (req, res) {

  let id = req.params.id;

  try {
    [err, cartlist] = await to(orderService.deleteCart(id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (cartlist) {

      return ReS(res, { message: 'cart has been deleted', cartlistDetails: cartlist }
        , status_codes_msg.SUCCESS.code);
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }

};

module.exports.deleteCart = deleteCart;

const update = async function (req, res) {
  const user = req.user;
  const param = { ...req.body, user };

  try {
    [err, updateOrderList] = await to(orderService.updateOrder(param));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (updateOrderList) {

      return ReS(res, { message: 'Order has been updated', data: updateOrderList }
        , status_codes_msg.SUCCESS.code);
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }

};

module.exports.update = update;

exports.updateOrderAdmin = async (req, res) => {
  const parsedParams = parseJSONparams(req.body)
  Logger.info('parsedParams', parsedParams)
  const { orderId } = req.params;
  try {
    [err, updatedOrder] = await to(orderService.updateOrderA(parsedParams, orderId));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (updatedOrder) {

      return ReS(res, { message: 'Order has been updated', data: updatedOrder }
        , status_codes_msg.SUCCESS.code);
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
}

exports.updateOrderItem = async (req, res) => {

  const { orderItemId } = req.params;
  try {
    [err, updated] = await to(orderService.updateOrderItem(req.body, orderItemId));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (updated) {
      return ReS(res, { message: 'Order item has been updated', data: updated }
        , status_codes_msg.SUCCESS.code);
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
}

exports.addOrderItem = async (req, res) => {
  const { orderId: orderMasterId } = req.params;
  const { productId, quantity } = req.body;
  const intQuantity = parseInt(quantity, 10);
  try {
    [err, updated] = await to(orderService.addOrderItem({
      orderMasterId, productId, quantity: intQuantity
    }));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (updated) {
      return ReS(res, { message: 'Order item has been created', data: updated }
        , status_codes_msg.SUCCESS.code);
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
}


