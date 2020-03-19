/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('shipping_rates', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      bussnessLocationDetailId: {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    rate: {
        type: DataTypes.INTEGER(11),
        allowNull: true
    },
    },
     {
      tableName: 'shipping_rates'
    }); 
    return Model;
  };
  
