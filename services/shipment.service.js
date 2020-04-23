
const {
  users,
  order_masters,
  order_items,
  shipment,
  shipment_order_item,
  user_types,
  orderitem_merchant,
  sequelize,
  merchants
} = require("../auth_models");
const {
  to,
  TE,
  paginate,
  convertArrayToObject
} = require("../services/util.service");
const Product = require("../models/product");
const Sequelize = require("sequelize");
const Logger = require("../logger");
const { STRINGS } = require("../utils/appStatics");
const omit = require("lodash/omit");
const groupBy = require("lodash/groupBy");
const transform = require("lodash/transform");
const differenceBy = require("lodash/differenceBy");
const intersectionBy = require("lodash/intersectionBy");
const parseStrings = require("parse-strings-in-object");

const Op = Sequelize.Op;

/**
 * @typedef {string} Status
 **/

/**
 * @enum {Status}
 */
var status = {
  active: "active",
  pending: "pending",
  disabled: "disabled",
};

module.exports.createShipment = async (params) => {
  Logger.info(params);
  const transaction = await sequelize.transaction();
  try {
    const shipmentCreatedDate = new Date().toISOString();

    const [errM, userType] = await to(
      user_types.findOne({
        where: {
          id: params.createdByType
        }
      }, { transaction })
    );
    if (errM) TE(errM.message);
    if (!userType) TE("No such user type");

    Logger.info("userType", userType)
    const [errA, createdShipment] = await to(
      shipment.create({
        ...params,
        createdByType: userType.name,
        shipmentCreatedDate
      }, { transaction })
    );
    if (errA) TE("Error creating shipment. " + errA.message);
    if (!createdShipment) TE("Error creating shipment");

    // insert order items to 
    const { orderItems } = params;
    const insertItems = orderItems.map((i) => ({
      orderItemId: i.id,
      shipmentId: createdShipment.id,
      quantity: i.quantity,
    }));
    const [errB, shipmentOrderItems] = await to(shipment_order_item.bulkCreate(insertItems, { transaction }));
    if (errB) TE("Error creating shipment for each order item. " + errB.message);
    if (!shipmentOrderItems) TE("Error creating shipment order items");


    await transaction.commit();
    Logger.info(shipmentOrderItems);
    return this.getShipmentDetails(createdShipment.id);
  }
  catch (err) {
    await transaction.rollback();
    TE(err.message)
  }
};

module.exports.updateShipment = async (params, shipmentId) => {
  params = parseStrings(params);
  Logger.info(params)
  const [errA, count] = await to(
    shipment.update(
      { ...params },
      {
        where: {
          id: shipmentId,
        },
      }
    )
  );
  Logger.info("count", count);
  if (!count || count[0] === 0) TE("Unable to update");
  if (errA) TE(STRINGS.UPDATE_ERROR + " " + errA.message);

  const [errB, updated] = await to(
    shipment.findOne({
      where: {
        id: shipmentId,
      },
    })
  );
  if (errB) TE(STRINGS.RETREIVE_ERROR + errB.message);
  if (!updated) TE(STRINGS.NO_DATA);
  return updated;
};

module.exports.getShipments = async (params) => {

  const parsedParams = parseStrings(params);
  const query = omit(parsedParams, ["page", "limit", "search", "sort"]);
  const { page, limit } = parsedParams;

  const dbQuery = {
    where: {
      ...query,
    },
    include:!query.masterOrderId && [
      {
        model:order_masters,
        as:'masterOrder',
        include:[
          {model:users,attributes:['firstName', 'lastName','email','phone']}
        ]
      }
    ],
    order: [["updatedAt", "DESC"]],
    ...paginate(page, limit),
    
  };

  Logger.info(dbQuery)

  const [err, shipmentList] = await to(shipment.findAndCountAll(dbQuery));
  if (err) TE(err.message);
  if (!shipmentList) TE("No shipments");
  Logger.info(shipmentList)
  return shipmentList;
};

module.exports.getShipmentDetails = async (shipmentId) => {
  let errA, products, shipmentDetails;
  [err, shipmentDetails] = await to(shipment.findOne({
    where: { id: shipmentId },
    include: [
      {
        model: shipment_order_item, as: 'orderItems',
        include: [

          {
            model: order_items,


            include: [
              {
                model: order_masters
              },
              {
                model: shipment_order_item,
                as: "shipping"
              },
              {
                model: orderitem_merchant,

                as: "merchantassigned",

                // where: sequelize.or({ 'status': 'shipment-created' }, { 'status': 'pending' }),
                // where: sequelize.and({ '$order_merchant_assign.status$': null }),
                // required: false,
                include: [
                  {
                    model: merchants,


                  }
                ]
              }
            ],

          },


        ]
      },
      {
        model: order_masters,
        as: 'masterOrder'
      }
    ]
  }));
  if (err) TE(err.message);
  if (!shipmentDetails) TE(STRINGS.NOT_EXIST);
  const prodArr = shipmentDetails.orderItems.map(i => i.order_item.productId);


  [errA, products] = await to(Product.find({ _id: { $in: prodArr } }).populate('pricing').select('name shipping images slug sku pricing'));
  if (errA) TE("Error fetching products", errA.message);
  if (!products) TE("Error fetching products");
  products = convertArrayToObject(products, '_id');

  shipmentDetails = { ...shipmentDetails.toWeb(), orderItems: shipmentDetails.orderItems.map(i => ({ ...i.toWeb(), order_item: { ...i.order_item.toWeb(), product: products[i.order_item.productId] } })) }

  return shipmentDetails;
};


/**
 * to get order items list from master order, where merchant isn't assigned (merchant)
 * or order_merchant_assign status -  ['rejected'] &
 * where order_items in master order don't have shipment 
 * @param {integer} orderMasterId
 */
exports.getUnshippedOrderItems = async (orderMasterId) => {
  let err, orderItemsUU, orderItemsUA, products, orderMaster;

  [err, orderMaster] = await to(order_masters.findOne({
    where: {
      id: orderMasterId
    },
    include: [
      {
        model: users,
        attributes: ['firstName', 'lastName', 'email', 'phone']
      }
    ]
  },
  ));
  if (err) TE(err.message);
  if (!orderMaster) TE("Invalid order ID");

  const includeProps = [

    {

      model: shipment_order_item,
      as: 'shipping',
      include: [
        { model: shipment }
      ]
    },
    {
      model: orderitem_merchant,
      as: 'merchantassigned',
      include: [
        {
          model: merchants,
          // group:['id']
        }
      ]
    }
  ];

  // get items unshipped & (unassigned or merchant assigned to admin/ merchant rejected)
  [err, orderItemsUU] = await to(order_items.findAll({
    where: {
      orderMasterId,
      [Op.and]: [
        { '$shipping.id$': { [Op.eq]: null } },
        {
          [Op.or]: [
            { '$merchantassigned.id$': { [Op.eq]: null } },
            { '$merchantassigned.status$': { [Op.in]: ['rejected'] } },

          ]
        }
        // { quantity: 5 }
      ]
    },
    // attributes: {
    //   include: [
    //     [sequelize.fn('SUM', sequelize.col('shipping.quantity')), 'totalQty']
    //   ]
    // },
    // group:['shipping.id'],
    include: includeProps
  }));
  if (err) TE(err.message);
  // if (!orderItems) TE(STRINGS.NOT_EXIST)

  // get order items unshipped and  merchant reverted to admin for shipping
  [err, orderItemsUA] = await to(order_items.findAll({
    where: {
      orderMasterId,
      [Op.and]: [
        { '$shipping.id$': { [Op.eq]: null } },
        { '$merchantassigned.status$': { [Op.eq]: ['shipment-to-admin'] } },
        // { quantity: 5 }
      ]
    },
    // attributes: {
    //   include: [
    //     [sequelize.fn('SUM', sequelize.col('shipping.quantity')), 'totalQty']
    //   ]
    // },
    // group:['shipping.id'],
    include: includeProps


  }));
  if (err) TE(err.message);

  // get products in each item
  const productIdArr = [...orderItemsUU, ...orderItemsUA].map(i => i.productId);
  Logger.info('productIds', productIdArr);

  [err, products] = await to(Product.find({ _id: { $in: productIdArr } }).populate('pricing').select('name shipping images slug sku pricing'));
  if (err) TE("Error while fetching products. " + err.message);
  if (!products) {
    TE("No products")
    // return {
    //   unassigned: orderItemsUU,
    //   assigned: orderItemsUA,
    //   master_order:orderMaster
    // }
  }
  products = convertArrayToObject(products, '_id');
  orderItemsUU = orderItemsUU.map(i => {
    return ({ ...i.toWeb(), product: products[i.productId] })
  }
  );
  orderItemsUA = orderItemsUA.map(i => ({ ...i.toWeb(), product: products[i.productId] }));
  // orderItemsUA = groupBy(orderItemsUA.map(i => ({ ...i.toWeb(), product: products[i.productId] })),'merchantassigned.merchantId')
  return {
    unassigned: orderItemsUU,
    assigned: orderItemsUA,
    master_order: orderMaster
  }


  // return orderItems

}
