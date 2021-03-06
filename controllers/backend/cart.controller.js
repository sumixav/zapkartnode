const { to, ReE, ReS } = require("../../services/util.service");
const { status_codes_msg } = require("../../utils/appStatics");
const parseStrings = require("parse-strings-in-object");
const Logger= require("../../logger")

const cartService = require("../../services/cart.service");

module.exports.removeFromCart = async(req, res, next) => {
  
  const param = { productId: req.body.productId, userId: req.user.id };
  try {
    [err, cart] = await to(cartService.removeFromCart(param));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (cart) {
      return ReS(
        res,
        { message: "Deleted from cart", data: cart },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.restoreToCart = async(req, res, next) => {
  const param = { productId: req.body.productId, userId: req.user.id };
  try {
    [err, cart] = await to(cartService.restoreToCart(param));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (cart) {
      return ReS(
        res,
        { message: "Restored product to cart", data: cart },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};
module.exports.addToCartGuestToLogged = async(req, res, next) => {
  const user = req.user;
  let {products} = req.body;

  Logger.info('req.body', req.body)

  //each object - productId, quantity
  products = products.map(i => ({...i, quantity: parseInt(i.quantity)}))
  
  const param = { products,userId: req.user.id };
  try {
    [err, cart] = await to(cartService.addToCartFromGuestToLogged(param));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (cart) {
      return ReS(
        res,
        { message: "Cart added", data: cart },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.addToCart = async(req, res, next) => {
  const user = req.user;
  const qty = parseStrings({ quantity: req.body.quantity });
  const param = { ...req.body, user, quantity: qty.quantity };
  try {
    [err, cart] = await to(cartService.addToCart(param));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (cart) {
      return ReS(
        res,
        { message: "Cart added", data: cart },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

const getCart = async function(req, res) {
  try {
    let id = req.user.id;
    [err, cartlist] = await to(cartService.getCart(id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (cartlist) {
      return ReS(
        res,
        { message: "cartlist", cartlistDetails: cartlist },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.getCart = getCart;

const updateCart = async function(req, res) {
  let id = req.params.id;

  try {
    [err, cartlist] = await to(cartService.updateCart(id, req.body));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (cartlist) {
      return ReS(
        res,
        { message: "cart has been updated", cartlistDetails: cartlist },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.updateCart = updateCart;

const deleteCart = async function(req, res) {
  let id = req.params.id;

  try {
    [err, cartlist] = await to(cartService.deleteCart(id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (cartlist) {
      return ReS(
        res,
        { message: "cart has been deleted", cartlistDetails: cartlist },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.deleteCart = deleteCart;
