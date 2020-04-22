const shipmentService = require('../../services/shipment.service');
const { to, ReE, ReS, isJsonStr, getJsonObject } = require('../../services/util.service');
const { status_codes_msg } = require('../../utils/appStatics');
const Logger = require("../../logger");



exports.createShipment = async function (req, res) {
    const createdBy = req.user.id;
    const createdByType = req.user.userTypeId;
    const shipmentOriginDetails = isJsonStr(req.body.shipmentOriginDetails) ? getJsonObject(req.body.shipmentOriginDetails) : req.body.shipmentOriginDetails;
    const shipmentDestinationAddress = isJsonStr(req.body.shipmentDestinationAddress) ? getJsonObject(req.body.shipmentDestinationAddress) : req.body.shipmentDestinationAddress;
    const orderItems = isJsonStr(req.body.orderItems) ? getJsonObject(req.body.orderItems) : req.body.orderItems;
    console.log('orderItems', orderItems)
    console.log('shipmentOriginDetails', shipmentOriginDetails)
    console.log('shipmentDestinationAddress', shipmentDestinationAddress)
    const [err, shipment] = await to(shipmentService.createShipment({
        ...req.body, shipmentOriginDetails,
        shipmentDestinationAddress, orderItems, createdBy,
        createdByType
    }));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!shipment) return ReE(res, new Error('Error creating shipment'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Shipment created', data: shipment }
        , status_codes_msg.SUCCESS.code);
}

exports.editShipment = async function (req, res) {
    const [err, shipment] = await to(shipmentService.updateShipment(req.body, req.params.shipmentId));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!shipment) return ReE(res, new Error('Error updating shipment'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Shipment updated', data: shipment }
        , status_codes_msg.SUCCESS.code);
}


exports.getShipments = async function (req, res) {
    const [err, shipments] = await to(shipmentService.getShipments(req.query));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!shipments) return ReE(res, new Error('No shipments'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Shipment list', data: shipments.rows, count:shipments.count }
        , status_codes_msg.SUCCESS.code);
}

exports.getShipmentDetails = async function (req, res) {
    const [err, shipment] = await to(shipmentService.getShipmentDetails(req.params.shipmentId));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!shipment) return ReE(res, new Error('No shipment'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Shipment details', data: shipment }
        , status_codes_msg.SUCCESS.code);
}

// exports.getUnshippedOrderItems = async function (req, res) {
//     const [err, items] = await to(shipmentService.getUnshippedOrderItems(req.params.masterOrderId));
//     if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
//     if (!items) return ReE(res, new Error('No order items'), status_codes_msg.INVALID_ENTITY.code);
//     return ReS(res, { message: 'Unshipped order items', data: items }
//         , status_codes_msg.SUCCESS.code);
// }

exports.getUnshippedOrderItems = async function (req, res) {
    const [err, items] = await to(shipmentService.getUnshippedOrderItems(req.params.masterOrderId));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!items) return ReE(res, new Error('No order items'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Unshipped order items', data: items }
        , status_codes_msg.SUCCESS.code);
}


