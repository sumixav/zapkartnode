/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  let Model = sequelize.define('order_items', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    orderMasterId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'order_masters',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    price: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    subtotal: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    shipmentStatus: {
      type: DataTypes.ENUM,
      values: ['Pending', 'Shipment', 'Pickup', 'Delivered']
    },
    shippingMethod: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    merchantId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    preceptionRequired: {
      type: DataTypes.ENUM,
      values: ['yes', 'no']
    },
    shippingId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    refundShippingId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },

  }, {

    tableName: 'order_items'
  });

  Model.associate = function (models) {
    this.userId = this.belongsTo(models.users, { foreignKey: 'userId' });
  };
  Model.associate = function (models) {
    this.orderMasterId = this.belongsTo(models.order_masters, { foreignKey: 'orderMasterId' });
  };

  Model.prototype.toWeb = function () {
    let json = this.toJSON();
    return json;
  };

  return Model;
};
