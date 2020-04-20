module.exports = function (sequelize, DataTypes) {
  const ShipmentOrderItem = sequelize.define("shipment_order_item", {
    orderItemId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    shipmentId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
    },
  });

  ShipmentOrderItem.associate = function (models) {
    ShipmentOrderItem.belongsTo(models.order_items, { foreignKey: "orderItemId" });
    ShipmentOrderItem.belongsTo(models.shipment, { foreignKey: "shipmentId" });
  };

  ShipmentOrderItem.prototype.toWeb = function () {
    console.log('hello')
    let json = this.toJSON();
    return json;
  };

  return ShipmentOrderItem;
};
