/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  let Model = sequelize.define('order_merchant_assign', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    masterOrderId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    merchantId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM,
      values: ['shipment-created', 'shipment-to-admin', 'rejected', 'pending'],
      defaultValue: 'pending'
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }

  }, {

    tableName: 'order_merchant_assign'
  });

  Model.associate = function (models) {
    Model.belongsTo(models.order_masters, { foreignKey: 'masterOrderId' });
    Model.belongsTo(models.merchants, { foreignKey: 'merchantId' });
    Model.hasMany(models.order_merchant_assign_items,
      { as: 'orderItems', foreignKey:'merchantAssignId'}
    )

  };

  Model.prototype.toWeb = function () {
    let json = this.toJSON();
    return json;
  };

  return Model;
};
