const shipmentService = require('../../services/shipment.service');
const { to, ReE, ReS } = require('../../services/util.service');
const { status_codes_msg } = require('../../utils/appStatics');
const Logger = require("../../logger");



exports.createShipment = async function (req, res) {
    const createdBy = req.user.id;
    const createdByType = req.user.userTypeId;
    const [err, shipment] = await to(shipmentService.createShipment({...req.body, createdBy,
        createdByType}));
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
    if (!shipment) return ReE(res, new Error('No shipments'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Shipment list', data: shipments }
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


