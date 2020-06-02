const {
  reviews,
  users,
  order_masters,
  order_items
} = require("../auth_models");
const Product = require("../models/product");
const {
  to,
  TE,
  paginate,
  getSearchQuery,
  getOrderQuery,
  getIdQuery,
  omitUserProtectedFields
} = require("../services/util.service");
const Sequelize = require("sequelize");
const Logger = require("../logger");
const { STRINGS } = require("../utils/appStatics");
const omit = require("lodash/omit");
const map = require("lodash/map");
const pick = require("lodash/pick");
const parseStrings = require("parse-strings-in-object");

const MAX_PAGE_LIMIT = 10;

/**
 * @typedef {string} Status
 **/

/**
 * @enum {Status}
 */
var status = {
  active: "active",
  pending: "pending",
  disabled: "disabled"
};

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
  const [errA, orderProduct] = await to(
    order_items.findOne({ where: { productId, orderMasterId: orderId } })
  );
  if (errA) TE(errA.message);
  if (!orderProduct)
    TE("Not authorisied to post review. Invalid order details");

  const [errC, duplicateReview] = await to(
    reviews.findOne({ where: { productId }, userId })
  );
  if (errC) TE(STRINGS.DB_ERROR + errC.message);
  if (duplicateReview) TE("Review already posted");

  // create review for ordered product
  const [errB, review] = await to(
    reviews.create({
      ...params,
      userId
    })
  );
  if (errB) TE("Error creating review. " + errB.message);
  if (!review) TE("Error creating review");
  return review;
};

/**
 * edit review with review ID & userId
 * @param {int} reviewId
 * @param {int} userId
 * @param {(actve|disabled|pending)} params.status
 * @param {object} params
 * @param {String} params.text
 * @param {int} params.priorityOrder
 */
module.exports.updateReview = async (params, reviewId, userId, fromUser = false) => {
  Logger.info(params, reviewId, userId);
  // if (fromUser) params.status = 'pending'
  const [errA, count] = await to(
    reviews.update(
      { ...params },
      {
        where: {
          id: reviewId,
          // userId
        }
      }
    )
  );
  Logger.info("count", count);
  if (!count || count[0] === 0) TE("Unable to update");
  if (errA) TE(STRINGS.UPDATE_ERROR + " " + errA.message);

  const [errB, updated] = await to(
    reviews.findOne({
      where: {
        id: reviewId
        // userId: user.id
      }
    })
  );
  if (errB) TE(STRINGS.RETREIVE_ERROR + errB.message);
  if (!updated) TE(STRINGS.NO_DATA);
  return updated;
};

/**
 * soft delete review with reviewId & userId
 * @param {int} reviewId
 * @param {int} userId
 */
module.exports.deleteReview = async (reviewId, userId) => {
  const [err, count] = await to(
    reviews.destroy({
      where: {
        id: reviewId,
        userId
      },
      paranoid: true
    })
  );
  Logger.info("count", count);
  if (!count || count === 0) TE(STRINGS.NO_DATA_DELETE);
  if (err) TE(STRINGS.DELETE_ERROR + " " + err.message);
  return true;
};

/**
 * restore review review with reviewId & userId
 * @param {int} reviewId
 * @param {int} userId
 */
module.exports.restoreReview = async (reviewId, userId) => {
  const [errD, validData] = await to(
    reviews.findOne({
      where: {
        // userId: userId,
        id: reviewId,
        userId
      },
      paranoid: false
    })
  );
  if (errD) TE(errD.message);
  if (!validData) TE(STRINGS.NOT_EXIST);
  if (validData.deletedAt === null) TE(STRINGS.NO_DATA_RESTORE);

  const [err, restored] = await to(validData.restore());
  Logger.info(restored);
  if (!restored) TE(STRINGS.NO_DATA_RESTORE);
  if (err) TE(STRINGS.DELETE_ERROR + " " + err.message);
  return restored;
};

module.exports.getUserReviews = async query => {
  const {page = 1, limit = MAX_PAGE_LIMIT, userId, isPaginate = true} = query;
  console.log('query', query)
  const [err, reviewList] = await to(
    reviews.findAndCountAll({
      where: {
        userId
      },
      attributes: {
        exclude: ["deletedAt"]
      },
      order: [["updatedAt", "DESC"]],
      ...paginate(page, limit)
    }),
  );

  console.log('MMM', reviewList, err)

  const [errM, userDetails] = await to(
    users.findOne({
      where: {
        id: userId
      }
    })
  )
  if (errM) TE("Error while fetching user details");
  if (!userDetails) TE("Invalid user");

  if (err) TE(STRINGS.DB_ERROR + err.message);
  if (!reviewList) TE(STRINGS.NO_DATA);
  const [errA, reviewsWithProdDetails] = await to(Promise.all(reviewList.rows.map(async i => {
    const [errA, product] = await to(Product.findOne({ _id: i.productId }).select("_id slug images name"));
    if (errA) TE(errA.message);
    if (!product) return {};
    return { ...i.toWeb(), product }
  })));
  Logger.info('helloooi', reviewsWithProdDetails, reviewList.count)
  if (errA) TE(errA.message);
  return {
    reviews: reviewsWithProdDetails,
    user: omitUserProtectedFields(userDetails.toWeb()),
    count: reviewList.count
  }

};

module.exports.getAllReviews = async (query) => {
  const { page = 1, limit = MAX_PAGE_LIMIT, ...restQuery } = query;
  const [err, reviewList] = await to(
    reviews.findAndCountAll({
      where: restQuery,
      include:[
        {model:users, as:'user'}
      ],
      attributes: {
        exclude: ["deletedAt"]
      },
      order: [["updatedAt", "DESC"]],
      ...paginate(page, limit)
    })
  );

  if (err) TE(STRINGS.DB_ERROR + err.message);
  if (!reviewList) TE(STRINGS.NO_DATA);
  const [errA, reviewsWithProdDetails] = await to(Promise.all(reviewList.rows.map(async i => {
    const [errB, product] = await to(Product.findOne({ _id: i.productId }).select("_id slug images name"));
    if (errB) TE(errB.message);
    if (!product) return {};
    return { ...i.toWeb(), product }
  })));
  if (errA) TE(errA.message);
  return {
    reviews: reviewsWithProdDetails,
    count: reviewList.count,
    page
  }

};

/**
 * filter reviews from various parameters
 * @param {number} params.page
 * @param {number} params.limit
 * @param {string} params.sort
 * @param {int} productId
 */
module.exports.getProductReviews = async params => {
  const { productId } = params;

  const findQuery = getIdQuery(productId);

  const [errB, validProd] = await to(Product.findOne(findQuery));
  if (errB) TE(STRINGS.DB_ERROR + errB.message);
  if (!validProd) TE("Invalid product");

  const parsedParams = parseStrings(params);
  const {
    page = 1,
    limit,
    search = {},
    sort = {}
  } = parsedParams;
  Logger.info(parsedParams);
  const query = omit(parsedParams, ["page", "limit", "search", "sort"]);
  const dbQuery = {
    where: {
      productId: validProd._id.toString(),
      ...query
      // ...getSearchQuery(search)
    },
    include: [
      {
        model: users,
        attributes: {
          exclude: [
            "password",
            "passwordChangedAt",
            "remember_token",
            "resetPasswordToken",
            "resetPasswordExpiresIn"
          ]
        }
      }
    ],
    attributes: {
      exclude: ["deletedAt"]
    },
    ...getOrderQuery(sort),
    ...paginate(page, limit)
  };

  // console.log(pick(dbQuery, 'where'))
  const [err, data] = await to(reviews.findAndCountAll(dbQuery));
  if (err) TE(STRINGS.DB_ERROR + err.message);
  if (!data) TE(STRINGS.NO_DATA);
  return {
    reviews: data.rows.map(i => ({
      ...i.toWeb(),
    })),
    product: { name: validProd.name, slug: validProd.slug, images: validProd.images },
    count: data.count,
    page
  };
};
