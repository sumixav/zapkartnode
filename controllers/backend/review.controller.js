const { users } = require('../../auth_models');
const reviewService = require('../../services/reviews.service');
const { to, ReE, ReS } = require('../../services/util.service');
const { status_codes_msg } = require('../../utils/appStatics');
const { STRINGS } = require("../../utils/appStatics")
const Logger = require("../../logger");
const omit = require('lodash/omit')
const parseStrings = require('parse-strings-in-object')



exports.addReview = async function (req, res) {
    const [err, review] = await to(reviewService.addReview(req.body, req.user.id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!review) return ReE(res, new Error('Error adding review'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Review added', data: review }
        , status_codes_msg.SUCCESS.code);
}

exports.editReview = async function (req, res) {
    const { user } = req;
    if (!user) ReE(res, "Not authorised to edit review", status_codes_msg.INVALID_ENTITY.code);
    if (user.userTypeId === 1 && !req.params.userId) ReE(res, "Need userId param", status_codes_msg.INVALID_ENTITY.code);

    const restParams = omit(req.body, ['status', 'priorityOrder'])
    
    const [err, review] = await to(reviewService.updateReview({ ...restParams, status: user.userTypeId === 1 ? req.body.status : undefined, priorityOrder: user.userTypeId === 1 ? req.body.priorityOrder : undefined }, req.params.reviewId, user.userTypeId === 1 ? req.params.userId : user.id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!review) return ReE(res, new Error('Error editing review'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Review updated', data: review }
        , status_codes_msg.SUCCESS.code);
}

exports.deleteReview = async function (req, res) {
    const { user } = req;
    if (!user) ReE(res, "Not authorised to delete review", status_codes_msg.INVALID_ENTITY.code);
    if (user.userTypeId === 1 && !req.params.userId) ReE(res, "Need userId param", status_codes_msg.INVALID_ENTITY.code);
    const [err, isDeleted] = await to(reviewService.deleteReview(req.params.reviewId, user.userTypeId === 1 ? req.params.userId : user.id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!isDeleted) return ReE(res, new Error('Error deleting review'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Review deleted' }
        , status_codes_msg.SUCCESS.code);
}

exports.restoreReview = async function (req, res) {
    const { user } = req;
    if (!user) ReE(res, "Not authorised to restore review", status_codes_msg.INVALID_ENTITY.code);
    if (user.userTypeId === 1 && !req.params.userId) ReE(res, "Need userId param", status_codes_msg.INVALID_ENTITY.code);
    const [err, restoredAddr] = await to(reviewService.restoreReview(req.params.reviewId, user.userTypeId === 1 ? req.params.userId : user.id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!restoredAddr) return ReE(res, new Error('Error restoring review'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Review restored', data: restoredAddr }
        , status_codes_msg.SUCCESS.code);
}

exports.getUserReviews = async function (req, res) {
    const { user } = req;
    if (!user) ReE(res, "Not authorised to fetch reviews", status_codes_msg.INVALID_ENTITY.code);
    let userId = req.user.id;
    if (user.userTypeId === 1) userId = req.params.userId;

    const [err, reviews] = await to(reviewService.getUserReviews(userId));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!reviews) return ReE(res, new Error('No reviews'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Review list', data: reviews }
        , status_codes_msg.SUCCESS.code);
}

exports.getProductReviews = async function (req, res) {
    const params = { ...req.query, productId: req.params.productId }
    const [err, reviews] = await to(reviewService.getProductReviews(params));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!reviews) return ReE(res, new Error('No reviews'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Review list', data: reviews }
        , status_codes_msg.SUCCESS.code);
}
