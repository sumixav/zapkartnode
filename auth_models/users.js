/* jshint indent: 2 */
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const { TE, to } = require('../services/util.service');
const CONFIG = require('../config/config');
const randtoken = require('rand-token')

module.exports = function (sequelize, DataTypes) {
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
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    phoneVerified: {
      type:DataTypes.INTEGER(1),
      allowNull:false,
      default:0
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
      },

    },
    socialMediaId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    socialType: {
      type: DataTypes.ENUM,
      values: ['facebook', 'google', 'normal'],
      allowNull: true,
      defaultValue: 'normal'
    },
    gender: {
      type: DataTypes.ENUM,
      values: ['male', 'female'],
      allowNull: true
    },
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpiresIn: DataTypes.DATE,
  },
    {
      tableName: 'users'
    }
  );

  Model.associate = function (models) {
    this.prescriptions = this.hasMany(models.prescriptions);
  };

  Model.associate = function (models) {
    this.coupen = this.hasMany(models.coupens);
  };


  Model.associate = function (models) {
    this.addresses = this.hasMany(models.address);
  };

  Model.associate = function (models) {
    this.coupenMapping = this.hasMany(models.coupen_user_mappings);
  };

  Model.associate = function (models) {
    this.coupen = this.hasMany(models.coupens);
  };
  Model.associate = function (models) {
    this.orders = this.hasMany(models.order_masters);
  };

  Model.associate = function (models) {

    this.cart = this.hasMany(models.carts);
  };

  Model.associate = function (models) {
    this.merchant = this.hasMany(models.merchants);
  };

  Model.associate = function (models) {
    this.usertype = this.belongsTo(models.user_types);
  };

  Model.prototype.getJWT = function () {

    let expiration_time = parseInt(CONFIG.jwt_expiration);
    return "Bearer " + jwt.sign({ user_id: this.id }, CONFIG.jwt_encryption, { expiresIn: expiration_time });

  };

  Model.prototype.getRefreshToken = function () {
    let refToken = randtoken.uid(16);
    user.update({ confirmationCode: refToken, lastLoginAt: Date.now() });
    return refToken;

  };


  Model.beforeSave(async (user, options) => {
    let err;
    if (user.changed('password')) {
      let salt, hash
      [err, salt] = await to(bcrypt.genSalt(10));
      if (err) TE(err.message, true);

      [err, hash] = await to(bcrypt.hash(user.password, salt));
      if (err) TE(err.message, true);

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
    if (!this.password) TE('password not set');

    [err, pass] = await to(bcrypt_p.compare(pw, this.password));
    if (err) TE(err);

    if (!pass) TE('invalid password');

    return this;
  }

  Model.prototype.verifyPassword = async function (pw) {
    let err, salt, pass;
    if (!this.password) TE('password not set');

    [err, salt] = await to(bcrypt.genSalt(10));
    if (err) TE(err.message, true);

    [err, hash] = await to(bcrypt.hash(pw, salt));
    if (err) TE(err.message, true);

    [err, pass] = await to(bcrypt_p.compare(pw, this.password));
    if (err) TE(err);

    if (!pass) TE('Invalid password');

    return this;
  }
  return Model;
};
