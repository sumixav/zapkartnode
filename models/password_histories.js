/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('password_histories', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    }, {
      
      tableName: 'password_histories'
    });
  };
  