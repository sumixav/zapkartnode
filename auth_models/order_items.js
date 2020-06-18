/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  let Model = sequelize.define(
    "order_items",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      orderMasterId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
          model: "order_masters",
          key: "id",
        },
      },
      userId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      productId: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      subtotal: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      shipmentStatus: {
        type: DataTypes.ENUM,
        values: ["Pending", "Shipment", "Pickup", "Delivered"],
        defaultValue:"Pending"
      },
      shippingMethod: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      merchantId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      prescriptionRequired: {
        type: DataTypes.ENUM,
        values: ["yes", "no"],
      },
      shippingId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        // references:{
        //   model:'shipment_order_item',
        //   key:'shipmentId'
        // }
      },
      refundShippingId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
    },
    {
      tableName: "order_items",
    }
  );

  Model.associate = function (models) {
    Model.belongsTo(models.users, { foreignKey: "userId" });
    Model.belongsTo(models.order_masters, { foreignKey: "orderMasterId" });
    Model.hasOne(models.shipment_order_item, { as: "shipping", foreignKey:"orderItemId" });
    // Model.hasOne(models.reviews, { foreignKey: "orderItemId", as:'review' });
    // Model.hasMany(models.shipment_order_item, { as: "shipping", foreignKey:"orderItemId" });
    Model.hasOne(models.order_merchant_assign_items, 
       { as: "assignedMerchant", foreignKey:"orderItemId" }
      );
    Model.hasOne(models.orderitem_merchant, 
       { as: "merchantassigned", foreignKey:"orderItemId" } // using
      );
    // this.userId = this.belongsTo(models.users, { foreignKey: 'userId' });
  };
  // Model.associate = function (models) {
  //   this.orderMasterId = this.belongsTo(models.order_masters, { foreignKey: 'orderMasterId' });
  // };

  Model.prototype.toWeb = function () {
    let json = this.toJSON();
    return json;
  };

  return Model;
};
