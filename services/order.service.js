
const {
  transaction_details,
  carts,
  order_masters,
  order_items,
  offers,
  address,
  users,
  payment_method,
  order_merchant_assign_items,
  orderitem_merchant,
  order_merchant_assign,
  shipment_order_item,
  shipment,
  order_status_history,
  merchants,
  ordermaster_pres,
  prescriptions,
  sequelize,
} = require("../auth_models");
const Product = require("../models/product");
const validator = require("validator");
const {
  to,
  TE,
  isEmpty,
  omitUserProtectedFields,
} = require("../services/util.service");
const Logger = require("../logger");
//use parse-strings-in-object
const paymentService = require("../services/payment.service");
const crypto = require("crypto");
const { STRINGS } = require("../utils/appStatics");
const Op = require("sequelize").Op;
const omit = require("lodash/omit")
const find = require("lodash/find");
const sub = require("date-fns/sub");
const format = require("date-fns/format");
const RazorPay = require("razorpay");
const { sendMail } = require("../services/mail.service")

exports.create = async (param) => {
  let err, cartDetails, a, errM;
  [err, cartDetails] = await to(
    carts.findAll({ where: { userId: param.user.id, deletedAt: null } })
  );
  if (err) TE(err.message);
  if (!cartDetails || cartDetails.length === 0) TE("Nothing in cart");

  Logger.info("order param", param);
  if (err) {
    TE(err.message);
  }
  let coupenDetails = (shippingDetails = billingDetails = orderParam = updateOrderMaster = {});
  let totalPrice = (totalQty = salePrice = 0);
  if (param.coupen) {
    Logger.info("2222");
    [err, coupenDetails] = await to(
      offers.findOne({ where: { coupenCode: param.coupen } })
    );
    if (err) {
      TE(err.message);
    }
  }
  Logger.info("3333");

  if (param.shippingId) {
    Logger.info("rrrr");
    [err, shippingDetails] = await to(
      address.findOne({ where: { id: param.shippingId } })
    );
    if (err) {
      TE(err.message);
    }
    Logger.info("rrrr", shippingDetails);
  }
  Logger.info("4444");
  if (param.billingId) {
    [err, billingDetails] = await to(
      address.findOne({ where: { id: param.billingId } })
    );
    if (err) {
      TE(err.message);
    }
  }
  let orderno = `popolr${new Date().getUTCMilliseconds()}`;
  Logger.info("cartDetails", cartDetails);
  // if (cartDetails) {
  // if (cartDetails.length === 0) TE("No items in cart");
  orderParam = {
    orderNo: orderno,
    userId: param.user.id,
    coupenId: isEmpty(coupenDetails) ? null : coupenDetails.id,
    paymentSettingId: param.payment,
    orderStatus: param.payment == 2 ? "processing" : "hold",
    paymentType: param.payment != 2 ? "onlinePayment" : "cod",
    // 'billingAddress': `${billingDetails.houseNo} ${billingDetails.street} ${billingDetails.landmark} ${billingDetails.city} ${billingDetails.state} ${billingDetails.pincode}`,
    // 'shippingAddress': `${shippingDetails.houseNo} ${shippingDetails.street} ${shippingDetails.landmark} ${shippingDetails.city} ${shippingDetails.state} ${shippingDetails.pincode}`,
    billingAddress: {
      fullName: billingDetails.fullName,
      mobileNo: billingDetails.mobileNo,
      houseNo: billingDetails.houseNo,
      street: billingDetails.street,
      landmark: billingDetails.landmark,
      city: billingDetails.city,
      state: billingDetails.state,
      pincode: billingDetails.pincode,
    },
    shippingAddress: {
      fullName: shippingDetails.fullName,
      mobileNo: shippingDetails.mobileNo,
      houseNo: shippingDetails.houseNo,
      street: shippingDetails.street,
      landmark: shippingDetails.landmark,
      city: shippingDetails.city,
      state: shippingDetails.state,
      pincode: shippingDetails.pincode,
    },
    shippingAmount: param.shippingAmount ? param.shippingAmount : 75,
  };

  [errM, orderDet] = await to(sequelize.transaction(async (t) => {
    [err, orderMasterDetails] = await to(order_masters.create(orderParam, { transaction: t }));
    Logger.info("orderMasterDetails", orderMasterDetails);
    if (err) {
      TE(err.message);
    }
    if (!orderMasterDetails) TE("Order could not be created");
    let productDetails = "";
    let paymentJson = {};
    if (orderMasterDetails && cartDetails.length > 0) {
      const payments = await to(paymentService.getPaymentId(param.payment));
      let pyMent = payments ? payments[1] : {};

      orderItemResult = await Promise.all(
        cartDetails.map(async function (item) {
          product = await Product.findOne({ _id: item.productId })
            .populate("category", "name images seo")
            .populate("composition", "_id deleted name slug")
            .populate("organic", "_id deleted name slug")
            .populate("brand", "_id deleted name slug image")
            .populate("pricing", "listPrice salePrice startDate endDate taxId")
            .populate(
              "attributes.attributeGroup",
              "name status attribute_group_code"
            )
            .populate("attributes.value", "value status")
            .populate("medicineType")
            .populate("stock")
            .populate("productExtraInfo");
          productDetails = productDetails.concat(",", product.name);
          Logger.info("product3422", item.productId, "#--#");
          totalPrice +=
            parseInt(product.pricing.listPrice, 10) * parseInt(item.quantity);
          totalQty += parseInt(item.quantity, 10);
          salePrice += parseInt(item.price, 10) * parseInt(item.quantity);

          let obj = {
            orderMasterId: orderMasterDetails.id,
            productId: item.productId,
            userId: param.user.id,
            quantity: parseInt(item.quantity),
            price: parseInt(product.pricing.salePrice),
            subtotal: parseInt(item.price) * parseInt(item.quantity),
            prescriptionRequired: item.prescriptionRequired,
          };
          return obj;
        })
      );
      Logger.info("orderItemResult", orderItemResult);
      [err, orderItemDetails] = await to(
        order_items.bulkCreate(orderItemResult, { transaction: t })
      );
      if (err) {
        TE(err.message);
      }
      orderMasterDetails.orderTotalAmount = parseInt(totalPrice);
      orderMasterDetails.orderQty = parseInt(totalQty);
      orderMasterDetails.orderSubtotal = parseInt(salePrice);
      if (find(cartDetails, m => m.prescriptionRequired === "yes")) {
        let pres = param.prescriptions;
        if (param.prescriptions.constructor !== Array) pres = [param.prescriptions];
        [err, a] = await to(ordermaster_pres.bulkCreate(pres.map(i => ({
          orderMasterId: orderMasterDetails.id,
          presId: +i
        })), { transaction: t }));
        if (err) TE(err.message);
      };
      Logger.info('orderMasterDetails', orderMasterDetails);

      // apply discount to subtotal if valid offer ID
      if (orderParam.coupenId) {
        [err, couponDetails] = await to(offers.findOne({ id: orderParam.coupenId }, { transaction: t }));
        if (err) TE(err.message);
        if (!coupenDetails) TE("Invalid coupon code");
        orderMasterDetails.orderSubtotal -= coupenDetails.amount;
      }
      const [errM, updateOrderMaster] = await to(orderMasterDetails.save({ transaction: t, include: [{ model: order_items }] }));

      // const [errM, updateOrderMaster] = await to(order_masters.update({...updatedOrderParams}, { where: { id: orderMasterDetails.id } }));
      if (!updateOrderMaster) TE("Order could not be updated");
      if (errM) { console.log('jojojo', errM.message); TE(errM.message) };

      if (!isEmpty(param.payment) && param.payment == 1) {
        let gateway = pyMent[0].gatewayDetails;
        Logger.info('gateway', gateway)
        let resGateWay = JSON.parse(gateway);
        let cryp = crypto.createHash("sha512");
        let text = `${resGateWay.key}|${orderno}|${totalPrice}|${productDetails}|${param.user.firstName}|${param.user.email}|||||BOLT_KIT_NODE_JS||||||${resGateWay.salt}`;
        // let text = `${resGateWay.key}|${orderno}|${totalPrice}|${productDetails}|${param.user.firstName}|${param.user.email}`;
        cryp.update(text);
        let hash = cryp.digest("hex");
        paymentJson.key = resGateWay.key;
        paymentJson.txnid = orderno;
        paymentJson.hash = hash;
        paymentJson.amount = orderMasterDetails.orderSubtotal;
        // paymentJson.amount = totalPrice;
        paymentJson.firstname = param.user.firstName;
        paymentJson.email = param.user.email;
        paymentJson.phone = param.user.phone;
        paymentJson.productinfo = productDetails;
        paymentJson.udf5 = "BOLT_KIT_NODE_JS";
        paymentJson.surl = "localhost:3000/test";
        paymentJson.furl = "localhost:3000/test";
      }

      // razorpay
      if (!isEmpty(param.payment) && param.payment == 3) {
        let gateway = pyMent[0].gatewayDetails;
        let resGateWay = JSON.parse(gateway);
        const instance = new RazorPay({
          key_id: resGateWay.key,
          key_secret: resGateWay.secret,
        });
        const options = {
          amount: orderMasterDetails.orderSubtotal * 100,
          currency: "INR",
          receipt: orderno,
          payment_capture: '0'
        }
        const [errRp, rpRes] = await to(instance.orders.create(options));
        if (errRp) TE(err.message);
        if (!rpRes) TE("Error creating payment");

        paymentJson.amount = rpRes.amount;  // amount in the smallest currency unit
        paymentJson.currency = rpRes.currency;
        paymentJson.payment_capture = '0';
        paymentJson.order_id = rpRes.id;
        paymentJson.name = param.user.firstName;
        paymentJson.email = param.user.email;
        paymentJson.contact = param.user.phone;

      }

      if (param.payment == 2) { // cart delete on cod
        [err, cart] = await to(
          carts.destroy({ where: { userId: param.user.id }, transaction: t })
        );
        if (err) TE("Error deleting cart");

        const [errMail, mailStatus] = await to(sendMail({
          to: param.user.email,
          text: 'Your order has been placed.\n\n'
            + `Order No: #${orderMasterDetails.orderNo}\n\n`
            + `Order date:${format(updateOrderMaster.createdAt, "MM/dd/yyyy")}\n\n`,
          subject: 'Zapkart Order Confirmation'
        }));

        Logger.info(mailStatus)

        if (errMail || !mailStatus || !mailStatus.messageId) Logger.error("Error sending mail")
        if (mailStatus && mailStatus.messageId) Logger.info(`Order confirmation mail sent ${orderMasterDetails.orderno}`)
      }

      return { updateOrderMaster, payment: paymentJson };
    }
  }));
  // }
  if (errM) TE(errM.message);
  if (!orderDet) TE("Error creating order")
  return orderDet;
};

exports.getAllOrders = async (query, userDetails = {}) => {
  // let orders = {};
  let orders = [];

  const { limit, orderStatus } = query
  let limitQuery = {}
  if (limit) limitQuery = { limit: +limit };
  query = omit(query, ["limit", "orderStatus"])
  if (orderStatus === "nothold")
    query = { ...query, orderStatus: { [Op.not]: "hold" } };
  console.log('hmm', userDetails.userTypeId)
  if (+userDetails.userTypeId === 3) {
    [err, merchantlist] = await to(merchants.find({
      where: { userId: userDetails.id }
    }));
    if (err) { TE(err.message); }
    [errA, ordersMerchant] = await to(
      orderitem_merchant.findAll({
        where: { merchantId: merchantlist.id },
        include: [
          {
            model: order_items,
          },
        ],
      })
    );
    console.log('umm', ordersMerchant)
    if (ordersMerchant.length > 0) {
      let orderItem = [];
      Object.entries(ordersMerchant).map(([key, value]) => {
        orderItem.push(value.order_item.id);
      });

      [errA, orders] = await to(
        order_masters.findAll({
          order: [
            ['createdAt', 'DESC']
          ],
          include: [
            {
              model: order_items,
              where: { id: { [Op.or]: orderItem } }
            },
            {
              model: ordermaster_pres,
              as: 'prescriptions',
              include: [
                {
                  model: prescriptions
                }
              ]
            },
          ],
        })
      );
      if (errA) TE(errA.message);

    }
  }
  else {
    [errA, orders] = await to(
      order_masters.findAll({
        where: {
          ...query,
        },
        ...limitQuery,
        order: [
          ['createdAt', 'DESC']
        ],
        include: [
          {
            model: order_items,
          },
          {
            model: ordermaster_pres,
            as: 'prescriptions',
            include: [
              {
                model: prescriptions
              }
            ]
          },
        ],
      })
    );
    if (errA) TE(errA.message);
  }

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


  return orders;
};
exports.getUserOrders = async (userId, role = 'user') => {
  let addQuery = { orderStatus: { [Op.ne]: "hold" } };
  if (role === 'admin') addQuery = {}
  const [errA, orders] = await to(
    order_masters.findAll({
      where: { userId, ...addQuery },
      include: [
        {
          model: order_items,
          include: [
            {
              model: shipment_order_item,
              as: "shipping",
              // exclude: ["id"],
              include: [
                {
                  model: shipment,
                },
              ],
            },
          ]
        },
        {
          model: ordermaster_pres,
          as: 'prescriptions',
          include: [
            {
              model: prescriptions
            }
          ]
        },

      ],
      order: [
        ['createdAt', 'DESC']
      ]
    })
  );
  if (errA) TE(errA.message);
  if (!orders) TE("No order items");

  const [errB, ordersWithDetails] = await to(
    Promise.all(
      orders.map(async (a) => {
        const [errM, orderItemDetails] = await to(
          Promise.all(
            a.order_items.map(async (i) => {
              const [errB, prod] = await to(
                Product.findById(i.productId).populate("brand", "name")
              );
              if (errB) TE(errB.message);
              if (!prod) return { ...i.toWeb(), product: {} };
              return { ...i.toWeb(), product: prod };
            })
          )
        );
        if (errM) TE(errM.message);
        return {
          ...a.toWeb(),
          order_items: orderItemDetails,
        };
      })
    )
  );
  if (errB) TE(errB.message);
  // Logger.info(ordersWithDetails)

  return ordersWithDetails;
};

// update quantity of order item
exports.updateOrderItem = async (params, orderItemId) => {
  Logger.info(params);
  let err, validItem, count, product, update;

  [err, validItem] = await to(
    order_items.findOne({
      where: { id: orderItemId },
      include: [{ model: order_masters }],
    })
  );
  if (err) TE(errA.message);
  Logger.info(validItem);
  if (!validItem || !validItem.order_master) TE(STRINGS.NOT_EXIST);
  Logger.info(validItem);

  const [errM, updated] = await to(
    sequelize.transaction(async (t) => {
      let updateParams = params;


      updateParams = omit(updateParams, 'merchantId')

      if (params.quantity) {
        // need to fetch products sale price? (could have be updated)
        const subtotal = params.quantity * validItem.price;
        updateParams = { ...updateParams, subtotal };
      }
      Logger.info("updateParams", updateParams);
      [err, count] = await to(
        order_items.update(updateParams, {
          where: { id: orderItemId },
          transaction: t,
        })
      );
      if (err) TE(err.message);
      if (!count || count[0] === 0) TE("Invalid order item ID");

      // update order Master total
      if (params.quantity) {
        [err, product] = await to(
          Product.findOne({ _id: validItem.productId }).populate("pricing")
        );
        if (err) TE(err.message);
        if (!product) TE("Invalid product ID");
        if (!product.pricing) TE("No pricing details on product");

        const orderMtotal =
          validItem.order_master.orderTotalAmount -
          product.pricing.listPrice * validItem.quantity +
          validItem.price * params.quantity;
        const orderMsubtotal =
          validItem.order_master.orderSubtotal -
          validItem.subtotal +
          updateParams.subtotal;

        [err, update] = await to(
          order_masters.update(
            {
              orderSubtotal: orderMsubtotal,
              orderTotalAmount: orderMtotal,
            },
            {
              where: {
                id: validItem.order_master.id,
              },
              transaction: t,
            }
          )
        );
        if (err) TE(err.message);
        if (!update || update[0] === 0) TE("Error updating master order");




        return true;
      }
    })
  );
  if (errM) TE(errM.message);
  if (!updated) TE("Error updating");
  return this.getOrderDetails(validItem.order_master.id);
};

/**
 * @param {number} params.orderMasterId
 * @param {string} params.productId
 * @param {number} params.quantity
 * @returns master order data
 */
exports.addOrderItem = async (params) => {
  // orderMasterId
  // userId
  // productId
  // quantity
  // price
  // subtotal
  // shipmentStatus
  // preceptionRequired

  const { orderMasterId, productId, quantity } = params;

  const [errA, product] = await to(
    Product.findOne({ _id: productId }).populate("pricing")
  );
  if (errA) TE("Error while fetching product. " + errA.message);
  if (!product) TE("Invalid product ID");
  if (!product.pricing) TE("Invalid product (no price)");

  const [errB, orderMaster] = await to(
    order_masters.findOne({ where: { id: orderMasterId } })
  );
  if (errB) TE("Error while fetching master order. " + errB.message);
  if (!orderMaster) TE("Invalid master order ID");

  const [errK, duplicateItemInOrder] = await to(
    order_items.findOne({
      where: { productId, orderMasterId: orderMaster.id },
    })
  );
  if (errK) TE("Database error. " + errK.message);
  if (duplicateItemInOrder) TE("Item already exists in order");

  const price = product.pricing.salePrice;
  const subtotal = price * quantity;
  const mrpTotal = (product.pricing.listPrice || 0) * quantity;

  const prescriptionRequired = product.prescriptionNeeded ? "yes" : "no";

  const [errE, isUpdated] = await to(
    sequelize.transaction(async (t) => {
      const [errC, orderItemNew] = await to(
        order_items.create(
          {
            orderMasterId,
            productId,
            quantity,
            price,
            subtotal,
            prescriptionRequired: prescriptionRequired,
            userId: orderMaster.userId,
          },
          { transaction: t }
        )
      );
      if (errC) TE("Error creating order item. " + errC.message);
      if (!orderItemNew) TE("Error creating order item");

      const orderSubtotal = orderMaster.orderSubtotal + subtotal;
      const orderTotalAmount = orderMaster.orderTotalAmount + mrpTotal;

      const [errD, orderMasterU] = await to(
        order_masters.update(
          {
            orderTotalAmount,
            orderSubtotal,
          },
          { where: { id: orderMasterId }, transaction: t }
        )
      );
      if (errD) TE("Error updating master order. " + errD.message);
      if (!orderMasterU) TE("Error updating master order");
      if (orderMasterU && orderMasterU[0] === 0) {
        TE("Error updating order")
      }
      return true;
    })
  );
  if (errE) TE(errE.message);
  if (!isUpdated) TE("Unable to update");
  return this.getOrderDetails(orderMasterId);

};

exports.getOrderDetailsSS = async (orderId) => {
  const [errA, order] = await to(
    order_masters.findOne({
      where: { id: orderId },
      include: [
        {
          model: order_items,
          include: [
            {
              model: shipment_order_item,
              as: "shipping",
              // exclude: ["id"],
              include: [
                {
                  model: shipment,
                },
              ],
            },
            {
              model: order_merchant_assign_items,
              as: "assignedMerchant",
              include: [
                {
                  model: order_merchant_assign,
                  include: [
                    {
                      model: merchants,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: order_status_history,
          as: "orderHistory",
          order: [
            ['createdAt', 'DESC']
          ]
          // order:[
          //   [order_status_history,'createdAt', 'DESC']
          // ]
        },
        //   , { // not working
        //   model: users,

        // }
      ],
    })
  );

  if (errA) TE(errA.message);
  if (!order) TE("Order does not exist");

  Logger.info(" order userid", order.userId);

  // need to be removed, since include not working - workaround
  const [errN, user] = await to(users.findOne({ where: { id: order.userId } }));
  if (errN) TE(errN.message);
  if (!user) TE("No user exists");

  const [errM, orderItemDetails] = await to(
    Promise.all(
      order.order_items.map(async (i) => {
        const [errB, prod] = await to(
          Product.findById(i.productId).populate("brand", "name")
        );
        if (errB) TE(errB.message);
        if (!prod) return { ...i.toWeb(), product: {} };
        return { ...i.toWeb(), product: prod };
      })
    )
  );
  if (errM) TE(errM.message);
  return {
    ...order.toWeb(),
    order_items: orderItemDetails,
    // need to be removed
    user: omitUserProtectedFields(user.toWeb()),
  };
};


exports.updateOrder = async (param) => {
  let paramRes = JSON.parse(param.paymentResponse);
  console.log('helloi', paramRes, param.paymentResponse);
  const [errM, updatedOrder] = await to(sequelize.transaction(async (t) => {
    // const [errA, order] = await to(
    //   order_masters.findOne({
    //     where: { orderNo: paramRes.txnid },
    //   })
    // );

    let paymentStatus = paramRes.status !== "success" ? "failed" : "success";
    const [errA, updateOrderMaster] = await to(
      order_masters.update(
        {
          paymentStatus,
          orderStatus: "processing",
          transactionId: paramRes.razorpay_order_id || paramRes.txnid,
        },
        { where: { orderNo: paramRes.txnid }, transaction: t },

      )
    );
    if (errA) {
      TE(`aa;${errA.message}`);
    }
    if (paramRes.razorpay_payment_id) { // verify transaction for razorpay
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paramRes
      const [errC, payment] = await to(payment_method.findOne({ where: { methodName: 'razorpay' } }));
      if (errC) TE(`aa;${errC.message}`);
      if (!payment) TE("Payment method does not exist in database");
      const gatewayDetails = JSON.parse(payment.gatewayDetails);
      const secret = gatewayDetails.secret;
      const hash = crypto.createHmac('sha256', secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');
      console.log(hash, razorpay_signature)
      if (hash !== razorpay_signature) TE("Razorpay Payment verification failed")
    }
    if (paymentStatus === "success") {
      const [errMail, mailStatus] = await to(sendMail({
        to: param.user.email,
        text: 'Your order has been placed.\n\n'
          + `Order No: #${updateOrderMaster.orderNo}\n\n`
          + `Order date: ${format(updateOrderMaster.createdAt, "MM/dd/yyyy")}\n\n`,
        subject: 'Zapkart Order Confirmation'
      }));
      Logger.info(mailStatus)

      if (errMail || !mailStatus || !mailStatus.messageId) TE("Error sending mail")
      if (mailStatus.messageId) Logger.info(`Order confirmation mail sent ${updateOrderMaster.orderNo}`)
    }

    let transactionParam = {
      transactionId: paramRes.razorpay_order_id || paramRes.txnid,
      transactionResponseDetails: param.paymentResponse,
      orderId: paramRes.txnid,
      status: paymentStatus,
    };
    const [errB, transactionDetails] = await to(
      transaction_details.create(transactionParam, { transaction: t })
    );
    if (errB) {
      TE(`aa;${errB.message}`);
    }
    if (paramRes.status === "success") {
      let cart = await to(carts.destroy({ where: { userId: param.user.id }, transaction: t }));
    }

    return updateOrderMaster;
  }));
  if (errM) TE(errM.message);
  if (!updatedOrder) TE("Error updating order");
  return updatedOrder;

};

exports.updateOrderA = async (params, orderId) => {
  Logger.info("params service", params);



  const [errA, updatedCount] = await to(
    order_masters.update({ ...params }, { where: { id: orderId } })
  );
  if (errA) TE(errA.message);
  if (!updatedCount || updatedCount[0] === 0) TE("Error updating");
  // return true
  const [errB, order] = await to(this.getOrderDetails(orderId));
  if (errB) TE("Error fetching order. " + errB.message);


  if (params.paymentStatus || params.orderStatus) {
    let statusParams = {};
    if (params.paymentStatus)
      statusParams = { ...statusParams, paymentStatus: order.paymentStatus };
    if (params.orderStatus)
      statusParams = { ...statusParams, orderStatus: order.orderStatus };
    const [errC, orderHistory] = await to(
      order_status_history.create({
        ...statusParams,
        orderId: order.id,
        comment: params.comment,
      })
    );
    if (errC) Logger.error("Error adding order history", errC.message);
    if (!orderHistory) Logger.error("No order history created");
    Logger.info("orderHistory", orderHistory);
    return this.getOrderDetails(orderId); //order history added - get updated order with order history
  }

  return order;
};

exports.bulkAssignOrderItems = async (params, merchantId) => {
  let err, bulkAssign;

  const { orderTtems } = params;

  [err, bulkAssign] = await to(orderitem_merchant.bulkCreate(orderTtems.map(i => ({
    ...i, orderItemId: i.orderItemId, merchantId
  }))))
  if (err) TE(err.message);
  if (!bulkAssign) TE("Error creating data");
  return bulkAssign
}

exports.deleteAssignedMerchant = async (orderItemId) => {
  let err, deleted;
  [err, deleted] = await to(orderitem_merchant.destroy({ where: { orderItemId } }));
  if (err) TE("Error deleting", +err.message);
  if (!deleted || deleted === 0) TE(STRINGS.NO_DATA_DELETE);
}

/**
 * @param params.orderId
 * @param params.merchantId
 * @param params.comment
 * @param params.status
 */
exports.assignOrderItem = async (params, returnData = false) => {
  // status
  //  values: ['shipment-created', 'shipment-to-admin', 'rejected', 'pending'],
  let err, existing, newData, updatedData, orderItem;
  const { orderItemId } = params;
  params = omit(params, ['orderItemId']);

  [err, orderItem] = await to(order_items.findOne(
    {
      where: {
        id: orderItemId,
        [Op.or]: [
          { '$merchantassigned.id$': { [Op.eq]: null } },
          {
            '$merchantassigned.status$': { [Op.notIn]: ['shipment-to-admin', 'shipment-created'] }
          }

        ],

      },
      include: {
        model: orderitem_merchant,
        as: 'merchantassigned'
      }
    }));
  if (err) TE(err.message)
  if (!orderItem) TE("Invalid update");

  [err, existing] = await to(orderitem_merchant.findOne({ where: { orderItemId } }));
  if (err) TE(err.message);
  if (!existing) {
    [err, newData] = await to(orderitem_merchant.create({ ...params, status: 'pending' }))
    if (err) TE(err.message);
    if (!newData) TE("Error creating data");
    return returnData ? this.getOrderDetails(orderItem.orderMasterId) : true;
  }
  else {
    [err, updatedData] = await to(orderitem_merchant.update({ ...params, status: params.status || 'pending' }, { where: { orderItemId } }))
    if (err) TE(err.message)
    if (!updatedData || updatedData[0] === 0) TE("Not updated");
    return returnData ? this.getOrderDetails(orderItem.orderMasterId) : true;
  }
}

exports.getOrderDetails = async (id, userDetails = {}) => {
  let err, orderData, ordersWithDetails;
  if (userDetails.userTypeId === 3) {
    [err, merchantlist] = await to(merchants.find({
      where: { userId: userDetails.id }
    }));
    if (err) { TE(err.message); }
    [errA, ordersMerchant] = await to(
      orderitem_merchant.findAll({
        where: { merchantId: merchantlist.id },
        include: [
          {
            model: order_items,
          },
        ],
      })
    );
    if (ordersMerchant) {
      let orderItem = [];
      Object.entries(ordersMerchant).map(([key, value]) => {
        orderItem.push(value.order_item.id);
      });
      [err, orderData] = await to(order_masters.findOne(
        {
          where: { id },
          include: [
            {
              model: offers
            },
            {
              model: ordermaster_pres,
              as: 'prescriptions',
              include: [
                {
                  model: prescriptions
                }
              ]
            },
            {
              model: order_items,
              where: { id: { [Op.or]: orderItem } },
              include: [
                {
                  model: shipment_order_item,
                  as: "shipping",
                  // exclude: ["id"],
                  include: [
                    {
                      model: shipment,
                    },
                  ],
                },
                {
                  model: orderitem_merchant,
                  as: 'merchantassigned',
                  include: {
                    model: merchants
                  }
                }
              ]
            },
            {
              model: order_status_history,
              as: "orderHistory",
              // order:[
              //   [order_status_history,'createdAt', 'DESC']
              // ]
            },
          ]
        },

      ));
    }
  }
  else {
    [err, orderData] = await to(order_masters.findOne(
      {
        where: { id },
        include: [
          {
            model: offers
          },
          {
            model: ordermaster_pres,
            as: 'prescriptions',
            include: [
              {
                model: prescriptions
              }
            ]
          },
          {
            model: order_items,
            include: [
              {
                model: shipment_order_item,
                as: "shipping",
                // exclude: ["id"],
                include: [
                  {
                    model: shipment,
                  },
                ],
              },
              {
                model: orderitem_merchant,
                as: 'merchantassigned',
                include: {
                  model: merchants
                }
              }
            ]
          },
          {
            model: order_status_history,
            as: "orderHistory",
            // order:[
            //   [order_status_history,'createdAt', 'DESC']
            // ]
          },
        ]
      },

    ));
  }
  Logger.info(orderData)
  if (err) TE(err.message);
  if (!orderData) TE('No order data');

  // need to be removed, since include not working - workaround
  const [errN, user] = await to(users.findOne({ where: { id: orderData.userId } }));
  if (errN) TE(errN.message);
  if (!user) TE("No user exists");

  [err, orderItemDetails] = await to(
    Promise.all(
      orderData.order_items.map(async (i) => {
        const [errB, prod] = await to(
          Product.findById(i.productId).populate("brand", "name")
        );
        if (errB) TE(errB.message);
        if (!prod) return { ...i.toWeb(), product: {} };
        return { ...i.toWeb(), product: prod };
      })
    )
  );

  if (err) TE("Error fetching products" + err.message);

  if (!orderItemDetails) TE("Error fetching data");
  return {
    ...orderData.toWeb(),
    order_items: orderItemDetails,
    // need to be removed
    user: omitUserProtectedFields(user.toWeb()),
  }
  // return orderData
}

exports.getOrderStats = async () => {
  let err, orderData, lastWeekOrders;
  const currentDate = new Date();
  const lastWeekDate = sub(currentDate, { weeks: 5 });
  console.log(currentDate, lastWeekDate);
  [err, orderData] = await to(order_masters.find({
    where: { orderStatus: { [Op.not]: "hold" } },
    attributes: [
      [sequelize.fn('SUM', sequelize.col('orderSubtotal')), 'totalSales'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
    ],
    // group:['weekly']
  }));
  if (err) TE(err.message);
  console.log(orderData);

  [err, lastWeekOrders] = await to(order_masters.find({
    where: {
      orderStatus: { [Op.not]: "hold" },
      createdAt: { [Op.between]: [lastWeekDate, currentDate] }
    },
    attributes: [
      [sequelize.fn('SUM', sequelize.col('orderSubtotal')), 'lastWeektotalSales'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'lastWeektotalOrders'],
    ]
  }));
  if (err) TE(err.message)

  let returnData = {};
  if (orderData) returnData = { ...orderData.toWeb() }
  if (lastWeekOrders) returnData = { ...returnData, ...lastWeekOrders.toWeb() }
  return returnData;
}




