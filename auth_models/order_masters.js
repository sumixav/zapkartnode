/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  let Model = sequelize.define('order_masters', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    orderNo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    orderTotalAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    coupenId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    orderSubtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    orderQty: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    // orderQty: {
    //     type: DataTypes.INTEGER(11),
    //     allowNull: true
    // },
    paymentSettingId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    paymentType: {
      type: DataTypes.ENUM,
      values: ['cod', 'onlinePayment']
    },
    paymentStatus: {
      type: DataTypes.ENUM,
      values: ['pending', 'failed', 'success']
      // values:['pending', 'denied', 'received', 'refunded', 'error']
    },
    orderStatus: {
      type: DataTypes.ENUM,
      values: ['hold', 'pending', 'processing', 'completed']
      // values:['pending', 'processed', 'cancelled', 'error', 'backordered']
    },
    transactionId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    billingAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
      get: function () {
        const dataValue = this.getDataValue("billingAddress");
        console.log('getter billingAddress', dataValue)
        if (dataValue)
          return JSON.parse(dataValue);
      },
      set: function (value) {

        console.log('setter billingAddress', value)
        if (value) this.setDataValue("billingAddress", JSON.stringify(value));

      },
    },
    // billingAddressId:{
    //   type:DataTypes.INTEGER(11),
    //   allowNull:true
    // },
    // shippingAddressId:{
    //   type:DataTypes.INTEGER(11),
    //   allowNull:true
    // },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
      get: function () {
        const dataValue = this.getDataValue("shippingAddress");
        console.log('getter shippingAddress', dataValue)
        if (dataValue)

          return JSON.parse(dataValue);
      },
      set: function (value) {
        console.log('setter shippingAddress', value)
        console.log('setter json shippingAddress', JSON.stringify(value))
        if (value) this.setDataValue("shippingAddress", JSON.stringify(value));

      },
    },
    shippingAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },

  }, {

    tableName: 'order_masters'
  });

  Model.associate = function (models) {
    // this.userId = this.belongsTo(models.users, { foreignKey: 'userId' });
    Model.belongsTo(models.users, { foreignKey: 'userId' });
    Model.belongsTo(models.offers, { foreignKey: 'coupenId' });
    Model.hasMany(models.order_items);
    Model.hasMany(models.shipment, { as: 'shipments', foreignKey: 'masterOrderId' })
    Model.hasMany(models.order_merchant_assign,
      { as: 'assignedMerchants', foreignKey: 'masterOrderId' }
    )
    Model.hasMany(models.order_status_history,
      { as: 'orderHistory', foreignKey: 'orderId' }
    )
    Model.hasMany(models.ordermaster_pres,
      { as: 'prescriptions', foreignKey: 'orderMasterId' }
    )
    // this.userId = this.belongsTo(models.users, { foreignKey: 'id', sourceKey:'userId' });
  };
  // Model.associate = function (models) {
  //   this.orderItems = this.hasMany(models.order_items);
  // };

  Model.prototype.toWeb = function () {
    let json = this.toJSON();
    return json;
  };

  return Model;
};
