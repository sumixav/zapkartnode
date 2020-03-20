/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  var Model = sequelize.define('address', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    fullName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    mobileNo: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    pincode: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    houseNo: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    street: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    landmark: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    // stateId: {
    //   type: DataTypes.INTEGER(11),
    //   allowNull: false,
    //   references: {
    //     model: 'states',
    //     key: 'id'
    //   }
    // },
    userId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: false,

    },
    active: {
      type: DataTypes.ENUM,
      values: ['active', 'hold'],
      allowNull: false,
      default: 'active'
    },
    address_type: {
      type: DataTypes.ENUM,
      values: ['home', 'office', 'other'],
      allowNull: true,
      default:'other'
    },
  },
    {
      tableName: 'address',
      paranoid: true
    }
  );

  Model.associate = function (models) {
    this.user = this.belongsTo(models.users);
  };

  // Model.associate = function (models) {
  //   this.state = this.belongsTo(models.states);
  // };

  Model.prototype.toWeb = function () {
    let json = this.toJSON();
    return json;
  };

  return Model;
};
