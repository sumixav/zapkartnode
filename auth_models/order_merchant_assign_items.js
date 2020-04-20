/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  let Model = sequelize.define('order_merchant_assign_items', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    merchantAssignId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    orderItemId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },

  }, {

    tableName: 'order_merchant_assign_items'
  });

  Model.associate = function (models) {
    Model.belongsTo(models.order_merchant_assign, { foreignKey: 'merchantAssignId' });
    Model.belongsTo(models.order_items, { foreignKey: 'orderItemId' });

  };

  Model.prototype.toWeb = function () {
    let json = this.toJSON();
    return json;
  };

  return Model;
};
