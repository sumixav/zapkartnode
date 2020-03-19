const cleanDeep = require("clean-deep");
const {carts,order_masters,order_items,coupens,address} = require("../auth_models");
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

    [err, cartDetails] = await to(carts.findAll({userId: param.user.id })); 
    if(err) { return err; }
    let coupenDetails = shippingDetails = billingDetails = orderParam = {};
    let totalPrice = totalQty = salePrice = 0;
    if(param.coupen) {
    [err,coupenDetails] = await to(coupens.findOne({coupenCode: param.coupen })); 
    if(err) { return err; }
    }
    if(param.shippingId) {
    [err,shippingDetails] = await to(address.findOne({id: param.shippingId })); 
    if(err) { return err; }
    }
    if(param.billingId) {
    [err,billingDetails] = await to(address.findOne({id: param.billingId })); 
    if(err) { return err; }
    }
    let orderno = `zapOrd${new Date().getUTCMilliseconds()}`;
    if(cartDetails) {
        orderParam = {
            'orderNo':orderno,
            'userId': param.user.id,
            'coupenId':(isEmpty(coupenDetails))?'':coupenDetails.id,
            'paymentSettingId':(param.payment!='cod')?param.payment:'',
            'paymentType':(param.payment!='cod')?'onlinePayment':'cod',
            'billingAddress':`${billingDetails.houseNo} ${billingDetails.street} ${billingDetails.landmark} ${billingDetails.city} ${billingDetails.state} ${billingDetails.pincode}`,
            'shippingAddress':`${shippingDetails.houseNo} ${shippingDetails.street} ${shippingDetails.landmark} ${shippingDetails.city} ${shippingDetails.state} ${shippingDetails.pincode}`,
            'shippingAmount' : (param.shippingAmount)?param.shippingAmount:''
        };
        [err,orderMasterDetails] = await to(order_masters.create(orderParam)); 
        if(err) { return err; }
        if(orderMasterDetails && item.length > 1) {
        orderItemResult = await Promise.all(cartDetails.map(async function(item) {
            product = await Product.findOne({ _id: item.productId }).populate("category", "name images seo")
            .populate("composition", "_id deleted name slug")
            .populate("organic", "_id deleted name slug")
            .populate("brand", "_id deleted name slug image")
            .populate("pricing", "listPrice salePrice startDate endDate taxId")
            .populate("attributes.attributeGroup", "name status attribute_group_code")
            .populate("attributes.value", "value status")
            .populate("medicineType")
            .populate("stock")
            .populate("productExtraInfo");
            totalPrice += product.pricing.listPrice;
            totalQty += item.quantity;
            salePrice += item.price;
        let obj = {'orderMasterId':orderMasterDetails.id,
                   'productId':item.productId,
                   'userId':param.user.id,
                   'quantity':item.quantity,
                   'price':product.pricing.salePrice,
                   'subtotal':item.price,
                   'preceptionRequired':item.prescriptionRequired
                  };
            return obj;      
      }));
      [err,orderItemDetails] = await to(order_items.bulkCreate(orderItemResult));
      if(err) { return err; }
      let Orderparam = {
         'orderTotalAmount':totalPrice,
         'orderQty':totalQty,
         'orderSubtotal':salePrice
      }
      [err,updateOrderMaster ] = await to(order_masters.update(Orderparam, {where: {id: orderMasterDetails.is} }));
      if(err) TE(err.message);
    }
      console.log(orderItemResult);
    }
    return orderItemResult;
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
