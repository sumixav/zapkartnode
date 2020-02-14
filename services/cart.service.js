const cleanDeep = require("clean-deep");
const {carts} = require("../auth_models");
const Product = require("../models/product");
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



exports.create = async (param) => {

    const product = await Product.findOne({ _id: param.productId }); 
   
  if (product && product.length == 0) {
    return "Product not found"; 
  }
  let cartParam={};
  cartParam.productId =  param.productId;
  cartParam.quantity =  param.quantity;
  cartParam.price =  param.price;
  cartParam.userId =  param.user.id;

  [err, cartDetails] = await to(carts.create(cartParam));
if(err) { return err; }
  return cartDetails;
};

const getCart = async (userid) => {
    [err, cart] = await to(carts.find({where: {userId:userid}}));
    if(err) { return err; }
    let cartResult = [];
    cart.map
    return cart;
  }
  
  module.exports.getCart = getCart;
