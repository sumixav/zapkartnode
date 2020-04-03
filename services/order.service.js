const cleanDeep = require("clean-deep");
const { carts, order_masters, order_items, coupens, address, users } = require("../auth_models");
const Product = require("../models/product");
const validator = require("validator");
const {
  to,
  TE,
  ReE,
  ReS,
  isEmpty,
  omitUserProtectedFields
} = require("../services/util.service");
const Logger = require("../logger");
//use parse-strings-in-object



exports.create = async (param) => {

  [err, cartDetails] = await to(carts.findAll({ userId: param.user.id, deletedAt: null }));
  if (err) { TE(err.message) }
  let coupenDetails = shippingDetails = billingDetails = orderParam = updateOrderMaster = {};
  let totalPrice = totalQty = salePrice = 0;
  if (param.coupen) {
    [err, coupenDetails] = await to(coupens.findOne({ coupenCode: param.coupen }));
    if (err) { TE(err.message) }
  }
  if (param.shippingId) {
    [err, shippingDetails] = await to(address.findOne({ id: param.shippingId }));
    if (err) { TE(err.message) }
  }
  if (param.billingId) {
    [err, billingDetails] = await to(address.findOne({ id: param.billingId }));
    if (err) { TE(err.message) }
  }
  let orderno = `zapOrd${new Date().getUTCMilliseconds()}`;
  Logger.info('cartDetails', cartDetails);
  if (cartDetails) {
    if (cartDetails.length === 0) TE("No items in cart");
    orderParam = {
      'orderNo': orderno,
      'userId': param.user.id,
      'coupenId': (isEmpty(coupenDetails)) ? null : coupenDetails.id,
      'paymentSettingId': (param.payment != 'cod') ? param.payment : null,
      'paymentType': (param.payment != 'cod') ? 'onlinePayment' : 'cod',
      'billingAddress': `${billingDetails.houseNo} ${billingDetails.street} ${billingDetails.landmark} ${billingDetails.city} ${billingDetails.state} ${billingDetails.pincode}`,
      'shippingAddress': `${shippingDetails.houseNo} ${shippingDetails.street} ${shippingDetails.landmark} ${shippingDetails.city} ${shippingDetails.state} ${shippingDetails.pincode}`,
      'shippingAmount': (param.shippingAmount) ? param.shippingAmount : 75
    };
    [err, orderMasterDetails] = await to(order_masters.create(orderParam));
    Logger.info('orderMasterDetails', orderMasterDetails);
    if (err) { TE(err.message); }
    if (!orderMasterDetails) TE("Order could not be created");

    if (orderMasterDetails && cartDetails.length > 0) {
      orderItemResult = await Promise.all(cartDetails.map(async function (item) {
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
        totalPrice += parseInt(product.pricing.listPrice, 10) * parseInt(item.quantity);
        totalQty += parseInt(item.quantity, 10);
        salePrice += parseInt(item.price, 10) * parseInt(item.quantity);

        let obj = {
          'orderMasterId': orderMasterDetails.id,
          'productId': item.productId,
          'userId': param.user.id,
          'quantity': parseInt(item.quantity),
          'price': parseInt(product.pricing.salePrice),
          'subtotal': parseInt(item.price) * parseInt(item.quantity),
          'preceptionRequired': item.prescriptionRequired
        };
        return obj;
      }));
      [err, orderItemDetails] = await to(order_items.bulkCreate(orderItemResult));
      if (err) { TE(err.message); }
      orderMasterDetails.orderTotalAmount = parseInt(totalPrice);
      orderMasterDetails.orderQty = parseInt(totalQty);
      orderMasterDetails.orderSubtotal = parseInt(salePrice);
      const [errM, updateOrderMaster] = await to(orderMasterDetails.save())
      // const [errM, updateOrderMaster] = await to(order_masters.update({...updatedOrderParams}, { where: { id: orderMasterDetails.id } }));
      if (!updateOrderMaster) TE("Order could not be updated")
      if (errM) TE(errM.message);

      // remove items from cart - to do

      return updateOrderMaster;
    }

  }
};

exports.getAllOrders = async (query) => {
  const [errA, orders] = await to(order_masters.findAll({
    where: {
      ...query
    },
    include: [
      {
        model: order_items
      },
    ]
  }));
  if (errA) TE(errA.message);
  if (!orders) TE("No orders placed");

  // const [errB, ordersWithDetails] = await to(Promise.all(orders.map(async a => {
  //   const [errM, orderItemDetails] = await to(Promise.all(a.order_items.map(async i => {
  //     const [errB, prod] = await to(Product.findById(i.productId).populate("brand", "name"));
  //     if (errB) TE(errB.message);
  //     if (!prod) return { ...i.toWeb(), product: {} }
  //     return { ...i.toWeb(), product: prod }
  //   })));
  //   if (errM) TE(errM.message);
  //   return {
  //     ...a.toWeb(), order_items: orderItemDetails
  //   }

  // })));
  // if (errB) TE(errB.message);
  // Logger.info(ordersWithDetails)

  return orders

}
exports.getUserOrders = async (userId) => {
  const [errA, orders] = await to(order_masters.findAll({
    where: { userId },
    include: [{
      model: order_items
    }]
  }));
  if (errA) TE(errA.message);
  if (!orders) TE("No order items");

  const [errB, ordersWithDetails] = await to(Promise.all(orders.map(async a => {
    const [errM, orderItemDetails] = await to(Promise.all(a.order_items.map(async i => {
      const [errB, prod] = await to(Product.findById(i.productId).populate("brand", "name"));
      if (errB) TE(errB.message);
      if (!prod) return { ...i.toWeb(), product: {} }
      return { ...i.toWeb(), product: prod }
    })));
    if (errM) TE(errM.message);
    return {
      ...a.toWeb(), order_items: orderItemDetails
    }

  })));
  if (errB) TE(errB.message);
  // Logger.info(ordersWithDetails)

  return ordersWithDetails

}

exports.getOrderDetails = async (orderId) => {
  const [errA, order] = await to(order_masters.findOne({
    where: { id: orderId },
    include: [{
      model: order_items
    }
      //   , { // not working
      //   model: users,

      // }
    ]
  }));

  if (errA) TE(errA.message);
  if (!order) TE("Order does not exist");

  Logger.info(' order userid', order.userId)

  // need to be removed, since include not working - workaround
  const [errN, user] = await to(users.findOne({ where: { id: order.userId } }))
  if (errN) TE(errN.message);
  if (!user) TE("No user exists");


  const [errM, orderItemDetails] = await to(Promise.all(order.order_items.map(async i => {
    const [errB, prod] = await to(Product.findById(i.productId).populate("brand", "name"));
    if (errB) TE(errB.message);
    if (!prod) return { ...i.toWeb(), product: {} }
    return { ...i.toWeb(), product: prod }
  })));
  if (errM) TE(errM.message);
  return {
    ...order.toWeb(), order_items: orderItemDetails,
    // need to be removed
    user: omitUserProtectedFields(user.toWeb())
  }

}

const getCart = async (userid) => {
  [err, cart] = await to(carts.findAll({ where: { userId: userid } }));
  if (err) { return err; }
  let cartResult = {};
  //console.log(cart[0].id);

  if (cart) {

    cartResult = await Promise.all(cart.map(async function (item) {
      //Object.assign(item, {key3: "value3"});
      product = await Product.findOne({ _id: item.productId });
      let obj = { item, product: { ...product._doc } };
      return obj;
    }));
    console.log(cartResult);
  }
  return cartResult;
}



const updateCart = async (id, param) => {

  console.log("hh", param);
  [err, cart] = await to(carts.update(param, { where: { id: id } }));
  if (err) TE(err.message);
  return cart;
}



const deleteCart = async (id) => {

  console.log("hh", param);
  [err, cart] = await to(carts.destroy({ where: { id: id } }));
  if (err) { return err; }
  return cart;
}


