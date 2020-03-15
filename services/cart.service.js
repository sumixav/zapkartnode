const cleanDeep = require("clean-deep");
const { carts, users } = require("../auth_models");
const Product = require("../models/product");
const Pricing = require("../models/pricing");
const validator = require("validator");
const {
  to,
  TE,
  ReE,
  ReS,
  isEmpty
} = require("../services/util.service");
const Logger = require("../logger");
//use parse-strings-in-object


/**
 * @param {object} param
 * @param {string} param.productId
 * @param {int} param.quantity
 * @param {int} param.user
 */
exports.addToCart = async (param) => {

  let err, pricing, cart, product;
  const { productId, quantity, user } = param;

  // no user
  if (!user) TE("Unauthorized");

  // find active product
  [err, product] = await to(Product.find({ _id: { $in: [productId] } }));
  if (err) return err;
  if (!product || product.length !== productId.length) {
    TE("Product not found");
  }
  if (product.status === "hold") TE("Product no longer active");

  [err, pricing] = await to(Pricing.findOne({ _id: product.pricing }));
  if (err) TE(err.message);
  if (!pricing) TE("Invalid product")
  // find cart if exists to update
  Logger.info('will execute find cart');
  [err, cart] = await to(carts.findOne({ where: { userId: user.id, productId } }))
  if (err) TE(err.message);

  Logger.info(cart)

  let updatedQty = (cart && cart !== null) ? cart.quantity + quantity : quantity;
  if (updatedQty > product.maxOrderQty) {
    updatedQty = product.maxOrderQty
    // TE("Max limit reached")
  }

  if (updatedQty < product.minOrderQty)
    TE(`Minimum ${product.minOrderQty} required`);

  Logger.info('will save/ create cart');
  // if existing cart
  if (cart) { // existing cart
    // cart.price = pricing.salePrice;
    cart.quantity = updatedQty;
    [err, cart] = await to(cart.save())
    if (err) TE(err.message);
    if (!cart) TE("No cart updated");
    return cart
  }

  // create cart if not exist
  if (!cart) { // create new cart
    [err, cart] = await to(carts.create({
      productId: product._id.toString(),
      quantity: updatedQty,
      price: pricing.salePrice,
      userId: user.id,
    }))
    if (err) TE("Error creating cart. " + err.message);
    if (!cart) TE("No cart created")
    return cart
  }

};

exports.addToCartOld = async (param) => {

  let err, pricing, cart, product;
  const { productId, quantity, user } = param;

  // no user
  if (!user) TE("Unauthorized");

  // find active product
  [err, product] = await to(Product.findOne({ _id: productId }));
  if (err) return err;
  if (!product) {
    TE("Product not found");
  }
  if (product.status === "hold") TE("Product no longer active");

  [err, pricing] = await to(Pricing.findOne({ _id: product.pricing }));
  if (err) TE(err.message);
  if (!pricing) TE("Invalid product")
  // find cart if exists to update
  Logger.info('will execute find cart');
  [err, cart] = await to(carts.findOne({ where: { userId: user.id, productId } }))
  if (err) TE(err.message);

  Logger.info(cart)

  let updatedQty = (cart && cart !== null) ? cart.quantity + quantity : quantity;
  if (updatedQty > product.maxOrderQty) {
    updatedQty = product.maxOrderQty
    // TE("Max limit reached")
  }

  if (updatedQty < product.minOrderQty)
    TE(`Minimum ${product.minOrderQty} required`);

  Logger.info('will save/ create cart');
  // if existing cart
  if (cart) { // existing cart
    // cart.price = pricing.salePrice;
    cart.quantity = updatedQty;
    [err, cart] = await to(cart.save())
    if (err) TE(err.message);
    if (!cart) TE("No cart updated");
    return cart
  }

  // create cart if not exist
  if (!cart) { // create new cart
    [err, cart] = await to(carts.create({
      productId: product._id.toString(),
      quantity: updatedQty,
      price: pricing.salePrice,
      userId: user.id,
    }))
    if (err) TE("Error creating cart. " + err.message);
    if (!cart) TE("No cart created")
    return cart
  }

};

const getCart = async (userid) => {
  [err, cart] = await to(carts.findAll({ where: { userId: userid } }));
  if (err) { return err; }
  let cartResult = {};
  //console.log(cart[0].id);

  if (!cart) TE("No cart available");
  // return cart.map(i=> i.toWeb())

  if (cart) {
    cartResult = await Promise.all(cart.map(async function (item) {
      //Object.assign(item, {key3: "value3"});
      product = await Product.findOne({ _id: item.productId });
      let obj = { ...item.toWeb(), product: { ...product._doc } };
      return obj;
    }));
    console.log(cartResult);
  }
  return cartResult;
}

module.exports.getCart = getCart;

const updateCart = async (id, param) => {

  console.log("hh", param);
  [err, cart] = await to(carts.update(param, { where: { id: id } }));
  if (err) TE(err.message);
  return cart;
}

module.exports.updateCart = updateCart;

const deleteCart = async (id) => {

  console.log("hh", param);
  [err, cart] = await to(carts.destroy({ where: { id: id } }));
  if (err) { return err; }
  return cart;
}

module.exports.deleteCart = deleteCart;
