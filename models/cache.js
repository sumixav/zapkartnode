/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('cache', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      key: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      expiration: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      }
    }, {
      
      tableName: 'cache'
    });
  };
  