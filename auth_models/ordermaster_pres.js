/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  let Model = sequelize.define('ordermaster_pres', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    orderMasterId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    presId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
  }, {

    tableName: 'ordermaster_pres'
  });

  Model.associate = function (models) {
    Model.belongsTo(models.order_masters, { foreignKey: 'orderMasterId' });
    Model.belongsTo(models.prescriptions, { foreignKey: 'presId' });
  };

  Model.prototype.toWeb = function () {
    let json = this.toJSON();
    return json;
  };

  return Model;
};
