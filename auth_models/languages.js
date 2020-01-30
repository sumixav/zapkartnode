/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('languages', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    },
     {
      
      tableName: 'languages'
    });
    
    Model.associate = function(models){
        this.merchants = this.hasMany(models.merchants);
      };

    return Model;
  };
  