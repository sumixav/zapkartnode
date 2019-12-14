/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('jobs', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      queue: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      payload: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      attempts: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      reservedAt: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      availableAt: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      }
    }, {
      
      tableName: 'jobs'
    });
  };
  