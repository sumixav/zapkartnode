const { users }          = require('../../auth_models');
const authService       = require('../../services/auth.service');
const { to, ReE, ReS }  = require('../../services/util.service');
const { status_codes_msg }  = require('../../utils/appStatics');
const { sendMail }  = require('../../services/mail.services');


const create = async function(req, res) {

    const param = req.body;
    try {
        [err, user] = await to(authService.createUser(param));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (user) {
                
            return ReS(res, { message:'Successfully created new user.', user : user.toWeb(), token : user.getJWT() }
                        , status_codes_msg.CREATED.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

module.exports.create = create;

const login = async function(req, res){
    const body = req.body;
    let err, user;
    [err, user] = await to(authService.authUser(req.body));
    if(err) return ReE(res, err, 422);
    return ReS(res, { message:'User Authenticated.', user : user.toWeb(), token : user.getJWT(), refreshToken : user.getRefreshToken() }
     , status_codes_msg.SUCCESS.code);
  
}
module.exports.login = login;

const getUserById = async function(req, res){
    [err, user] = await to(authService.getUser(req.params.id));
    if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    if (user) {
        return ReS(res, { message:'user.', user : user.toWeb() }
                , status_codes_msg.SUCCESS.code);
    }
}
module.exports.getUserById = getUserById;

const update = async function(req, res){
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
   
    return ReS(res, { message:user }
                        , status_codes_msg.CREATED.code);
}
module.exports.update = update;