
const { reviews, users, order_masters, order_items } = require("../auth_models");
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

/**
 * add new review
 * @param {int} userId
 * @param {object} params
 * @param {int} params.orderId
 * @param {int} params.productId
 * @param {string} params.text
 */
module.exports.addReview = async (params, userId) => {
    const { orderId, productId } = params;

    // check if it is ordered product
    const [errA, orderProduct] = await to(order_items.findOne({ where: { productId, orderMasterId: orderId } }));
    if (errA) TE(errA.message)
    if (!orderProduct) TE("Not authorisied to post review. Invalid order details")

    // create review for ordered product
    const [errB, review] = await to(reviews.create({
        ...params, userId
    }));
    if (errB) TE("Error creating review. " + errB.message);
    if (!review) TE("Error creating review");
    return review;
}

/**
 * edit review with review ID
 * @param {int} reviewId
 */
module.exports.updateReview = async (params, reviewId) => {
    const { text } = params;
    const [errA, count] = await to(reviews.update(
        { text },
        {
            where: {
                id: reviewId,

            }
        },
    ));
    if (!count || count === 0) TE(STRINGS.NO_DATA_DELETE + ' ' + err.message)
    if (errA) TE(STRINGS.UPDATE_ERROR + ' ' + errA.message)

    const [errB, updatedAddr] = await to(review.findOne({
        where: {
            id: params.id,
            userId: user.id
        }
    }))
    if (errB) TE(STRINGS.RETREIVE_ERROR + errB.message);
    if (!updatedAddr) TE(STRINGS.NO_DATA);
    return updatedAddr;
}

module.exports.deleteReview = async (id) => {
    const [err, count] = await to(review.destroy(
        {
            where: {

                id
            },
            paranoid: true
        }
    ));
    if (!count || count === 0) TE(STRINGS.NO_DATA_DELETE)
    if (err) TE(STRINGS.DELETE_ERROR + ' ' + err.message)
    return true
}

module.exports.restoreReview = async (id) => {
    const [errD, validData] = await to(review.findOne({
        where: {
            // userId: userId,
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

module.exports.getUserReviews = async (userId) => {
    const [err, reviewList] = await to(review.findAll({
        where: {
            userId
        },
        attributes: {
            exclude: ["deletedAt"]
        },
        order: [
            ['updatedAt', 'DESC']
        ]
    }));
    if (err) TE(STRINGS.DB_ERROR + err.message);
    if (!reviewList) TE(STRINGS.NO_DATA)
    return reviewList
}

/**
 * filter reviews from various parameters
 * @param {number} params.page
 * @param {number} params.limit
 * @param {string} params.sort
 * @param {int} productId 
 */
module.exports.getProductReviews = async (params) => {
    const parsedParams = parseStrings(params);
    const { page = 1, limit = MAX_PAGE_LIMIT, search = {}, sort = {} } = parsedParams;
    Logger.info(parsedParams);
    const query = omit(parsedParams, ['page', 'limit', 'search', 'sort']);
    const dbQuery = {
        where: {
            productId: params.productId
            // ...query, //filter by this query
            // ...getSearchQuery(search)
        },
        attributes: {
            exclude: ["deletedAt"]
        },
        ...getOrderQuery(sort),
        ...paginate(page, limit)
    }

    // console.log(pick(dbQuery, 'where'))
    const [err, data] = await to(reviews.findAndCountAll(dbQuery))
    if (err) TE(STRINGS.DB_ERROR + err.message);
    if (!data) TE(STRINGS.NO_DATA)
    return { reviews: data.rows, count: data.count }
}

