const { ExtractJwt, Strategy } = require('passport-jwt');
const { users, user_types } 	    = require('../auth_models');
const CONFIG        = require('../config/config');
const {to}          = require('../services/util.service');
const Logger = require("../logger");

module.exports = function(passport){
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = CONFIG.jwt_encryption;

    passport.use(new Strategy(opts, async function(jwt_payload, done){
        let err, user;
        [err, user] = await to(users.findOne({where:{id:jwt_payload.user_id}, include:[{model:user_types}]}));
        Logger.info("666666666666",user);
        if(err) return done(err, false);
        if(user) {
            return done(null, user);
        }else{
            return done(null, false);
        }
    }));
}