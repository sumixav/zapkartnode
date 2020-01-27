const { to, ReE, ReS } = require('../services/util.service');
const { status_codes_msg } = require('../utils/appStatics');
const Logger = require('../logger')

const attributeGroupService = require('../services/attributeGroup.service');


exports.createAttributeGroup = async function (req, res) {
    try {
        const param = req.body
        Logger.info(req.body)
        const [err, attributeGroup] = await to(attributeGroupService.createAttributeGroup(param));
        if (err) { return ReE(res, err, status_codes_msg.INVALID_ENTITY.code); }
        if (attributeGroup) {
            return ReS(res, { message: 'Attribute', data: attributeGroup }
                , status_codes_msg.SUCCESS.code);
        }
    } catch (err) {
        console.error(err)
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

exports.getAllAttrubutes = async function (req, res) {
    try {
        const [err, attributes] = await to(attributeGroupService.getAllAttributeGroups(req.query));
        if (err) { return ReE(res, err, status_codes_msg.INVALID_ENTITY.code); }
        if (attributes) {
            return ReS(res, { message: 'Attribute', data: attributes, count: attributes.length }
                , status_codes_msg.SUCCESS.code);
        }
    } catch (err) {
        console.error(err)
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
}

exports.getAttribute = async function (req, res, next) {
    try {
        const [err, attribute] = await to(attributeGroupService.getAttributeDetails(req.params.id));
        if (err) { next(err) }
        if (attribute) {
            return ReS(res, { message: 'Attribute', data: attribute }
                , status_codes_msg.SUCCESS.code);
        }
    } catch (error) {

        next(error)
    }
}

exports.deleteAttributeGroup = async function (req, res, next) {
    try {
        const [err, attribute] = await to(attributeGroupService.deleteAttributeGroup(req.params.id));
        if (err) { next(err) }
        if (attribute) return ReS(res, { message: 'Deleted successfully' }, status_codes_msg.SUCCESS.code)
    } catch (error) {
        next(error)
    }
}

exports.restore = async function (req, res, next) {
    try {
        const [err, attribute] = await to(attributeGroupService.restoreAttributeGroup(req.params.id));
        if (err) { next(err) }
        if (attribute) return ReS(res, { message: 'Restored successfully' }, status_codes_msg.SUCCESS.code)
    } catch (error) {
        next(error)
    }
}



exports.editAttributeGroup = async function (req, res, next) {
    try {
        Logger.info(req.params.id)
        const [err, attribute] = await to(attributeGroupService.editAttributeGroup(req.body, req.params.id, req.query));
        if (err) { next(err) }
        if (attribute) {
            return ReS(res, { message: 'Attribute', data: attribute }
                , status_codes_msg.SUCCESS.code);
        }
    } catch (error) {

        next(error)
    }
}