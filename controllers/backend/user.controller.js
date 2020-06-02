const { users } = require('../../auth_models');
const authService = require('../../services/auth.service');
const userService = require('../../services/user.service');
const wishlistService = require('../../services/wishlist.service');
const ordersService = require('../../services/order.service');
const reviewsService = require('../../services/reviews.service');
const { to, ReE, ReS } = require('../../services/util.service');
const { status_codes_msg } = require('../../utils/appStatics');
const prescriptionService = require("../../services/prescription.service")
const { STRINGS } = require("../../utils/appStatics")
const Logger = require("../../logger");
const omit = require('lodash/omit')
const parseStrings = require('parse-strings-in-object')

const create = async function (req, res) {

    const param = req.body;
    try {
        [err, user] = await to(authService.createUser(param));
        if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
        if (user) {

            return ReS(res, { message: 'Successfully created new user.', user: user.toWeb(), token: user.getJWT() }
                , status_codes_msg.CREATED.code);
        }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

module.exports.create = create;

const login = async function (req, res) {
    const body = req.body;
    let err, user;
    [err, user] = await to(authService.authUser(req.body));
    if (err) return ReE(res, err, 422);
    return ReS(res, { message: 'User Authenticated.', user: user.toWeb(), token: user.getJWT(), refreshToken: user.getRefreshToken() }
        , status_codes_msg.SUCCESS.code);

}
module.exports.login = login;

const getUser = async function (req, res) {
    [err, user] = await to(authService.getUser(req.user.id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (user) {
        return ReS(res, { message: 'user.', user: user.toWeb() }
            , status_codes_msg.SUCCESS.code);
    }
}
module.exports.getUser = getUser;

const getUserById = async function (req, res) {
    [err, user] = await to(authService.getUser(req.params.id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (user) {
        return ReS(res, { message: 'user.', user: user.toWeb() }
            , status_codes_msg.SUCCESS.code);
    }
}
module.exports.getUserById = getUserById;

const update = async function (req, res) {
    let err, user, data
    user = req.user;
    data = req.body;
    if (typeof req.files.image != 'undefined') {
        images = req.files["image"];
        imagesPath = images.map(i => i.path);
        data.avatarlocation = imagesPath;
    }
    Logger.info(user)
    user.set(data);

    [err, user] = await to(user.save(

    ));
    user = user.toWeb();
    user = omit(user, [
        'password',
        'passwordChangedAt',
        'confirmationCode',
        'remember_token',
        'resetPasswordToken',
        'resetPasswordExpiresIn'
    ]);
    if (err)
        return ReS(res, { user }
            , status_codes_msg.CREATED.code);
}
module.exports.update = update;

const fblogin = async function (req, res) {
    const body = req.body;
    let err, user;
    // if((typeof userInfo.id=='undefined')||(userInfo.id=='')) {
    //     return ReE(res, "Error in Social Media Credentials", 422);
    // }
    [err, user] = await to(authService.authFbUser(req.body));
    if (err) return ReE(res, err, 422);
    return ReS(res, { message: 'User Authenticated.', user: user.toWeb(), token: user.getJWT(), refreshToken: user.getRefreshToken() }
        , status_codes_msg.SUCCESS.code);

}
module.exports.fblogin = fblogin;

const gblogin = async function (req, res) {
    const body = req.body;
    let err, user;
    // if((typeof userInfo.id=='undefined')||(userInfo.id=='')) {
    //     return ReE(res, "Error in Social Media Credentials", 422);
    // }
    [err, user] = await to(authService.authGbUser(req.body));
    if (err) return ReE(res, err, 422);
    return ReS(res, { message: 'User Authenticated.', user: user.toWeb(), token: user.getJWT(), refreshToken: user.getRefreshToken() }
        , status_codes_msg.SUCCESS.code);

}
module.exports.gblogin = gblogin;

exports.forgotPassword = async function (req, res) {
    [err, response] = await to(authService.forgotPassword(req.body.email));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (response) {
        return ReS(res, { message: response }
            , status_codes_msg.SUCCESS.code);
    }
}

exports.updatePasswordViaEmail = async function (req, res) {
    const [errEmail, userEmail] = await to(authService.findUserByEmail(req.body.email));
    if (errEmail || (userEmail && userEmail.message === "NotExist")) return ReE(res, new Error('User does not exist in database'), status_codes_msg.INVALID_ENTITY.code);
    console.log('heyp', userEmail)
    const [err, user] = await to(authService.validateResetPasswordToken(req.body));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);

    const [errUpdate, updatedUser] = await to(authService.updatePassword(req.body, user));
    if (errUpdate) return ReE(res, errUpdate, status_codes_msg.INVALID_ENTITY.code);
    if (!updatedUser) return ReE(res, new Error('Error updating password'), status_codes_msg.INVALID_ENTITY.code);
    if (updatedUser) {
        return ReS(res, { message: 'Password updated', user: updatedUser }
            , status_codes_msg.SUCCESS.code);
    }
}

exports.updatePassword = async function (req, res) {
    if (!req.user) return ReE(res, new Error('Unauthorized user!'), status_codes_msg.INVALID_ENTITY.code);
    const [errUpdate, updatedUser] = await to(authService.updatePassword(req.body, req.user));
    if (errUpdate) return ReE(res, errUpdate, status_codes_msg.INVALID_ENTITY.code);
    if (!updatedUser) return ReE(res, new Error('Error updating password'), status_codes_msg.INVALID_ENTITY.code);
    if (updatedUser) {
        return ReS(res, { message: 'Password updated', user: updatedUser }
            , status_codes_msg.SUCCESS.code);
    }
}

exports.verifyPassword = async (req, res) => {
    if (!req.user) return ReE(res, new Error('Unauthorized user!'), status_codes_msg.UNAUTHORIZED.code);
    const [errUpdate, user] = await to(authService.verifyPassword(req.body, req.user));
    if (errUpdate) return ReE(res, errUpdate);
    if (!user) return ReE(res, new Error('No user'));
    return ReS(res, {
        message: 'Password verified', user
    }, status_codes_msg.SUCCESS.code);
}


exports.savePrescriptions = async function (req, res) {
    Logger.info(req.files, req.files["prescription"])
    const [errUpdate, prescriptions] = await to(prescriptionService.savePrescriptions(req));
    if (errUpdate) return ReE(res, errUpdate, status_codes_msg.INVALID_ENTITY.code);
    if (!prescriptions) return ReE(res, new Error('Error uploading prescriptions'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Prescription uploaded', prescriptions }
        , status_codes_msg.SUCCESS.code);
}

exports.updatePrescriptions = async function (req, res) {
    const [errUpdate, prescriptions] = await to(prescriptionService.updatePrescriptions(req));
    if (errUpdate) return ReE(res, errUpdate, status_codes_msg.INVALID_ENTITY.code);
    if (!prescriptions) return ReE(res, new Error('Error updating'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Prescriptions updated', prescriptions }
        , status_codes_msg.SUCCESS.code);
}

exports.getPrescriptionsFromUser = async function (req, res) {
    const [err, prescriptions] = await to(prescriptionService.getPrescriptionsFromUser(req.user.id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!prescriptions) return ReE(res, new Error('Error fetching prescriptions'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Prescriptions', prescriptions }
        , status_codes_msg.SUCCESS.code);
}

exports.addAddress = async function (req, res) {
    const [err, address] = await to(userService.addAddress(req.body, req.user));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!address) return ReE(res, new Error('Error adding address'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Address added', address }
        , status_codes_msg.SUCCESS.code);
}

exports.editAddress = async function (req, res) {
    const [err, address] = await to(userService.updateAddress({ ...req.body, id: req.params.addressId }, req.user));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!address) return ReE(res, new Error('Error editing address'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Address updated', address }
        , status_codes_msg.SUCCESS.code);
}

exports.deleteAddress = async function (req, res) {

    const [err, isDeleted] = await to(userService.deleteAddress(req.params.addressId, req.user));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!isDeleted) return ReE(res, new Error('Error deleting address'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Address deleted' }
        , status_codes_msg.SUCCESS.code);
}

exports.restoreAddress = async function (req, res) {
    const [err, restoredAddr] = await to(userService.restoreAddress(req.params.addressId, req.user));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!restoredAddr) return ReE(res, new Error('Error restoring address'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Address restored', address: restoredAddr }
        , status_codes_msg.SUCCESS.code);
}

exports.getAddressesromUser = async function (req, res) {
    const [err, addresses] = await to(userService.getAddressesFromUser(req.user.id));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!addresses) return ReE(res, new Error('No addresses'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Address list', address: addresses }
        , status_codes_msg.SUCCESS.code);
}

exports.getUsers = async function (req, res) {
    Logger.info(req.query)
    const [err, data] = await to(userService.getUsers(req.query));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!data) return ReE(res, new Error('No users'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Users list', users: data.users, total: data.count }
        , status_codes_msg.SUCCESS.code);
}

exports.updateUser = async function (req, res) {
    const { userId } = req.params;
    Logger.info(userId)
    const [err, data] = await to(authService.updateUser(req.body, userId));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!data) return ReE(res, new Error('Unable to update'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'User updated', users: data.users, total: data.count }
        , status_codes_msg.SUCCESS.code);
}

exports.getUserDetails = async function (req, res) {
    const { orders, wishlist, reviews } = parseStrings(req.query);
    const { userId } = req.params
    Logger.info('HELLO')
    let [errA, data] = await to(userService.getUserDetails(userId));
    if (errA) return ReE(res, errA, status_codes_msg.INVALID_ENTITY.code);
    if (!data) return ReE(res, new Error('User does not exist'), status_codes_msg.INVALID_ENTITY.code);
    let user = data.toWeb()
    if (orders) {
        const [errB, orders] = await to(ordersService.getUserOrders(userId));
        if (errB) Logger.error(errB)
        // Logger.info('orders', orders)
        if (orders)
            user = { ...user, orders }
    }

    if (wishlist) {
        const [errC, wishlistData] = await to(wishlistService.getWishlist(userId));
        if (errC) Logger.error(errC)
        // Logger.info(wishlistData)
        if (wishlistData) user = { ...user, wishlist: wishlistData }
    }

    if (reviews) {
        const [errD, reviewsData] = await to(reviewsService.getUserReviews({userId, isPaginate:false}));
        if (errD) Logger.error(errD)
        Logger.info('BBB', reviewsData)
        if (reviewsData) user = { ...user, reviews: reviewsData }
    }

    return ReS(res, { message: 'User details', user }
        , status_codes_msg.SUCCESS.code);
}

const getUserPerPage = async function (req, res) {
    [err, user] = await to(authService.getUserperPage(req.params));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (user) {
        return ReS(res, { message: 'user.', data: user }
            , status_codes_msg.SUCCESS.code);
    }
}
module.exports.getUserPerPage = getUserPerPage;

/**
 * add to wishlist for logged in users
 */
exports.addToWishlist = async function (req, res) {
    const params = { userId: req.user.id, productId: req.body.productId }
    const [err, wishlist] = await to(wishlistService.addToWishlist(params))
    if (err) return ReE(res, err, err.message === STRINGS.WISHLIST_DUPLICATE_PRODUCT ? 409 : 422);
    if (wishlist) return ReS(res, { message: 'Added to wishlist', wishlist })
}

/**
 * remove from wishlist for logged in users
 */
exports.removeFromWishlist = async function (req, res) {
    const params = { userId: req.user.id, productId: req.body.productId }
    const [err, wishlist] = await to(wishlistService.removeFromWishlist(params))
    if (err) return ReE(res, err);
    if (wishlist) return ReS(res, { message: 'Removed from wishlist', wishlist })
}


exports.getWishlist = async function (req, res) {
    // const params = { userId: req.user.id, productId: req.body.productId }
    const userId = req.params.userId ? req.params.userId : req.user.id;
    // const { userId } = req.user.id;
    const [err, wishlist] = await to(wishlistService.getWishlist(userId))
    if (err) return ReE(res, err);
    if (wishlist) return ReS(res, { message: 'Wishlist', wishlist })
}

