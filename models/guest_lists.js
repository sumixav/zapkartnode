/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('guest_lists', {
        id: {
          type: DataTypes.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        userId: {
          type: DataTypes.INTEGER(11),
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        email: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        statueId: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
          references: {
            model: 'statues',
            key: 'id'
          }
        }
      }, {
        tableName: 'guest_lists'
      });
      Model.associate = function(models){
        this.status = this.belongsTo(models.statues); 
        this.user = this.belongsTo(models.users);
      };
    
      return Model;
    };
    
