/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('sessions', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      ipAddress: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      payload: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      lastActivity: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      }
    }, {
      
      tableName: 'sessions'
    });
  };
  