/* jshint indent: 2 */
const SequelizeSlugify = require('sequelize-slugify');

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('payment_method', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      methodName: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      label: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
          type:   DataTypes.ENUM,
          values: ['active', 'hold']
        },
      },
     {
      tableName: 'payment_settings'
    }); 
    return Model;
  };
  
