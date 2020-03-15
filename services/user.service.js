
const { users, address } = require("../auth_models");
const { to, TE, paginate, getSearchQuery, getOrderQuery } = require("../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Logger = require("../logger");
const { STRINGS } = require("../utils/appStatics")
const omit = require("lodash/omit")
const map = require("lodash/map")
const pick = require("lodash/pick")
const parseStrings = require('parse-strings-in-object')

const MAX_PAGE_LIMIT = 10;

module.exports.addAddress = async (params, user) => {
    const [err, newAddr] = await to(address.create({
        ...params,
        userId: user.id
    }));
    if (!newAddr) TE(STRINGS.ADD_ERROR + ' ' + err.message)
    if (err) TE(STRINGS.ADD_ERROR + ' ' + err.message)
    return newAddr
}



module.exports.updateAddress = async (params, user) => {
    const [err, count] = await to(address.update(
        { ...params },
        {
            where: {
                id: params.id,
                userId: user.id
            }
        },
    ));
    if (!count || count === 0) TE(STRINGS.NO_DATA_DELETE + ' ' + err.message)
    if (err) TE(STRINGS.UPDATE_ERROR + ' ' + err.message)

    const [errFind, updatedAddr] = await to(address.findOne({
        where: {
            id: params.id,
            userId: user.id
        }
    }))
    if (errFind) TE(STRINGS.RETREIVE_ERROR + errFind.message);
    if (!updatedAddr) TE(STRINGS.NO_DATA);
    return updatedAddr;
}

module.exports.deleteAddress = async (id, user) => {
    const [err, count] = await to(address.destroy(
        {
            where: {
                userId: user.id,
                id
            },
            paranoid: true
        }
    ));
    if (!count || count === 0) TE(STRINGS.NO_DATA_DELETE)
    if (err) TE(STRINGS.DELETE_ERROR + ' ' + err.message)
    return true
}

module.exports.restoreAddress = async (id, user) => {
    const [errD, validData] = await to(address.findOne({
        where: {
            userId: user.id,
            id
        },
        paranoid: false
    }))
    if (errD) TE(errD.message)
    if (!validData) TE(STRINGS.NOT_EXIST)
    if (validData.deletedAt === null) TE(STRINGS.NO_DATA_RESTORE)

    const [err, restored] = await to(validData.restore());
    Logger.info(restored)
    if (!restored) TE(STRINGS.NO_DATA_RESTORE)
    if (err) TE(STRINGS.DELETE_ERROR + ' ' + err.message);
    return restored
}

module.exports.getAddressesFromUser = async (userId) => {
    const [err, addressList] = await to(address.findAll({
        where: {
            userId
        },
        attributes: {
            exclude: ["deletedAt"]
        }
    }))
    if (err) TE(STRINGS.DB_ERROR);
    if (!addressList) TE(STRINGS.NO_DATA)
    return addressList
}

/**
 * filter users from various parameters
 * @param {number} params.page
 * @param {number} params.limit
 * @param {string} params.search
 * @param {string} params.sort
 * @param {Object} params.query rest of query for filtering
 */
module.exports.getUsers = async (params) => {
    const parsedParams = parseStrings(params);
    const { page = 1, limit = MAX_PAGE_LIMIT, search = {}, sort = {} } = parsedParams;
    Logger.info(parsedParams);
    const query = omit(parsedParams, ['page', 'limit', 'search', 'sort']);
    const dbQuery = {
        where: {
            ...query, //filter by this query
            ...getSearchQuery(search)
        },
        attributes: {
            exclude: ["deletedAt", "password"]
        },
        ...getOrderQuery(sort),
        ...paginate(page, limit)
    }

    // console.log(pick(dbQuery, 'where'))
    const [err, data] = await to(users.findAndCountAll(dbQuery))
    if (err) TE(STRINGS.DB_ERROR + err.message);
    if (!data) TE(STRINGS.NO_DATA)
    return { users: data.rows, count: data.count }
}

