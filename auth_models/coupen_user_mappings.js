/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('coupen_user_mappings', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      coupenId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: ' coupens',
          key: 'id'
        }
      },
      userId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: ' users',
          key: 'id'
        }
      },
    },
     {
      tableName: 'coupen_user_mappings'
    });
    
      Model.associate = function(models){
        this.coupen = this.belongsTo(models.coupens);
      }; 
      Model.associate = function(models){
        this.user = this.belongsTo(models.users);
      };  
    return Model;
  };
  
