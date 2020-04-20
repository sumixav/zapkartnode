/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  let Model = sequelize.define('order_status_history', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    orderId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    paymentStatus: {
      type: DataTypes.STRING,
      allowNull: true
    },
    orderStatus: {
      type: DataTypes.STRING,
      allowNull: true
    },
    comment:{
      type:DataTypes.TEXT,
      allowNull:true
    }
  
  }, {
    tableName: 'order_status_history'
  });

  Model.associate = function (models) {
    Model.belongsTo(models.order_masters, { foreignKey: 'orderId' });
  };
  
  Model.prototype.toWeb = function () {
    let json = this.toJSON();
    return json;
  };

  return Model;
};
