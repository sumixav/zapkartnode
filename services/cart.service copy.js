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

    [err, product] = await to(Product.findOne({ _id: param.productId })); 
    if(err) { return err; }
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
    [err, cart] = await to(carts.findAll({where: {userId:userid}}));
    if(err) { return err; }
    let cartResult={};
    //console.log(cart[0].id);
   
    if(cart) {
        
        cartResult = await Promise.all(cart.map(async function(item) {
            //Object.assign(item, {key3: "value3"});
            product = await Product.findOne({ _id: item.productId }); 
        let obj = {item,product:{...product._doc}};
            return obj;      
      }));
      console.log(cartResult);
    }
    return cartResult;
  }
  
  module.exports.getCart = getCart;

  const updateCart = async (id, param) => {
  
    console.log("hh",param);
    [err,cart ] = await to(carts.update(param, {where: {id: id} }));
        if(err) TE(err.message);
    return cart;
  }
  
  module.exports.updateCart = updateCart;

  const deleteCart = async (id) => {
  
    console.log("hh",param);
    [err, cart] = await to(carts.destroy({where: { id:id}}));
    if(err) { return err; }
    return cart;
  }
  
  module.exports.deleteCart = deleteCart;
