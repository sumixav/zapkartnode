/* jshint indent: 2 */
const bcrypt 		    	  = require('bcrypt');
const bcrypt_p 		  	  = require('bcrypt-promise');
const jwt             	= require('jsonwebtoken');
const {TE, to}          = require('../services/util.service');
const CONFIG            = require('../config/config');
const randtoken = require('rand-token') 

module.exports = function(sequelize, DataTypes) {
  var Model = sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    avatartype: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'gravatar'
    },
    avatarlocation: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(3),
      allowNull: true
    },
    confirmationCode: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    confirmed: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    timezone: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastLoginIp: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    remember_token: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    userTypeId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'user_types',
        key: 'id'
      }
    },
    

  }, {
    tableName: 'users'
  });
  
  Model.associate = function(models){
    this.usertype = this.belongsTo(models.user_types);
  };
  
  Model.prototype.getJWT = function () {

    let expiration_time = parseInt(CONFIG.jwt_expiration);
    return "Bearer "+jwt.sign({user_id:this.id}, CONFIG.jwt_encryption, {expiresIn: expiration_time});
    
  };

  Model.prototype.getRefreshToken = function () {
    let refToken =randtoken.uid(16);
    user.update({ confirmationCode: refToken});
    return refToken;
    
  };

  
  Model.beforeSave(async (user, options) => {
    let err;
    if (user.changed('password')){
        let salt, hash
        [err, salt] = await to(bcrypt.genSalt(10));
        if(err) TE(err.message, true);

        [err, hash] = await to(bcrypt.hash(user.password, salt));
        if(err) TE(err.message, true);

        user.password = hash;
    }
  });

  Model.prototype.toWeb = function (pw) {
    let json = this.toJSON();
    delete json.password;
    return json;
  };

  Model.prototype.comparePassword = async function (pw) {
    let err, pass
    if(!this.password) TE('password not set');

    [err, pass] = await to(bcrypt_p.compare(pw, this.password));
    if(err) TE(err);

    if(!pass) TE('invalid password');

    return this;
  }
  return Model;
};
