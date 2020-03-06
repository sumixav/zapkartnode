const { users } = require('../../auth_models');
const authService = require('../../services/auth.service');
const userService = require('../../services/user.service');
const { to, ReE, ReS } = require('../../services/util.service');
const { status_codes_msg } = require('../../utils/appStatics');
const prescriptionService = require("../../services/prescription.service")
const Logger = require("../../logger");

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
    user.set(data);

    [err, user] = await to(user.save());

    return ReS(res, { message: user }
        , status_codes_msg.CREATED.code);
}
module.exports.update = update;

const fblogin = async function (req, res) {
    const body = req.body;
    let err, user;
    [err, user] = await to(authService.authFbUser(req.body));
    if (err) return ReE(res, err, 422);
    return ReS(res, { message: 'User Authenticated.', user: user.toWeb(), token: user.getJWT(), refreshToken: user.getRefreshToken() }
        , status_codes_msg.SUCCESS.code);

}
module.exports.fblogin = fblogin;

const gblogin = async function (req, res) {
    const body = req.body;
    let err, user;
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
    const [err, users] = await to(userService.getUsers(req.query));
    if (err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (!users) return ReE(res, new Error('No users'), status_codes_msg.INVALID_ENTITY.code);
    return ReS(res, { message: 'Users list', users: users }
        , status_codes_msg.SUCCESS.code);
}


