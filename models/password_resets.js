/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('password_resets', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      token: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    }, {
      
      tableName: 'password_resets'
    });
  };
  