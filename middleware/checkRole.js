const { user_types } = require("../auth_models");
const { ReE, to } = require("../services/util.service")
const { status_codes_msg } = require("../utils/appStatics")

const checkIsRole = (...roles) => async (req, res, next) => {
    if (!req.user) {
        // return res.redirect('/login')
        return ReE(res, "Unauthorised", status_codes_msg.UNAUTHORIZED.code)
    }
    const [err, userTypes] = await to(user_types.findAll());
    if (!userTypes) ReE(res, "User Types do not exist")
    if (err) ReE(res, "Database error. " + err.message);
    
    const userTypeIds = userTypes.filter(i => roles.includes(i.name)).map(i => i.id);
    if (userTypeIds.includes(req.user.userTypeId)) next();
    else ReE(res, "Unauthorised", status_codes_msg.UNAUTHORIZED.code);
}

module.exports = checkIsRole