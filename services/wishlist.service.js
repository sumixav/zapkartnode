const { users, address } = require("../auth_models");
const Wishlist = require("../models/wishlist");
const Product = require("../models/product");
const {
    to,
    TE,
    paginate,
    getSearchQuery,
    getOrderQuery
} = require("../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Logger = require("../logger");
const { STRINGS } = require("../utils/appStatics");
const omit = require("lodash/omit");
const find = require("lodash/find");
const map = require("lodash/map");
const pick = require("lodash/pick");
const parseStrings = require("parse-strings-in-object");

const MAX_PAGE_LIMIT = 10;

// need to add pagination $slice
/**
 * get users wishlist from userId
 * @param {int} params.userId
 */
module.exports.getWishlist = async params => {
    const { userId } = params;
    const [err, data] = await to(
        Wishlist.findOne({
            user: userId
        }).populate({ path: "products", populate: "pricing" })
    );
    if (err) TE(STRINGS.DB_ERROR + err.message);
    if (!data) TE(STRINGS.NO_DATA);
    return data;
};

/**
 * add product to user's wishlist
 * @param {int} params.userId
 * @param {string} params.productId
 */
exports.addToWishlist = async params => {

    const { productId, userId } = params;

    Logger.info(productId, userId, Product);

    const [errA, product] = await to(
        Product.findOne({
            _id: productId,
            status: "active",
            deleted: "false"
        })
    );
    if (errA) TE(errA.message);
    if (!product) TE("Product does not exist");

    const [errB, user] = await to(users.findOne({ where: { id: userId } }));
    if (errB) TE(errB.message);
    if (!user) TE("Invalid user");

    // find wishlist for userId if exists
    let [errC, wishlist] = await to(Wishlist.findOne({ user: userId }));
    if (errC) TE(errC.message);
    // create new wishlist if one doesn't exist for userId
    if (!wishlist) wishlist = new Wishlist({ user: userId });

    // error if product already in wishlist
    if (
        wishlist.products.length > 0 &&
        find(wishlist.products, i => i.toString() === productId)
    )
        TE(STRINGS.WISHLIST_DUPLICATE_PRODUCT);

    // if new product; push to wishlist products field
    wishlist.products.push(productId);

    // update existing wishlist (or) create one
    const [errD, updatedWishlist] = await to(wishlist.save());
    if (errD) TE(errD.message);
    if (!updatedWishlist) TE("Error saving wishlist");

    return Wishlist.populate(updatedWishlist, { path: "products", populate: "pricing" });
};

/**
 * remove product from user's wishlist
 * @param {int} params.userId
 * @param {string} params.productId
 */
exports.removeFromWishlist = async params => {
    const { productId, userId } = params;

    Logger.info(productId, userId, Product);

    const [errA, product] = await to(
        Product.findOne({
            _id: productId,
            status: "active",
            deleted: "false"
        })
    );
    if (errA) TE(errA.message);
    if (!product) TE("Product does not exist");

    const [errB, user] = await to(users.findOne({ where: { id: userId } }));
    if (errB) TE(errB.message);
    if (!user) TE("Invalid user");

    // find wishlist for userId if exists
    let [errC, wishlist] = await to(Wishlist.findOne({ user: userId }));
    if (errC) TE(errC.message);
    // error is wishlist does not exist
    if (!wishlist) wishlist = TE("Wishlist for user does not exist");

    // remove productId from wishlist products array
    if (
        wishlist.products.length > 0 &&
        find(wishlist.products, i => i.toString() === productId)
    )
        wishlist.products.pull(productId);
    // if productId not in wishlist products array
    else TE("Product not in wishlist");

    // update existing wishlist
    const [errD, updatedWishlist] = await to(wishlist.save());
    if (errD) TE(errD.message);
    if (!updatedWishlist) TE("Error saving wishlist");

    return Wishlist.populate(updatedWishlist, { path: "products", populate: "pricing" });
};
