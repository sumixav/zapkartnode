/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('coupen_types', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    },
     {
      tableName: 'coupen_types'
    });
    
      Model.associate = function(models){
        this.coupen = this.hasMany(models.coupens);
      };  
    return Model;
  };
  
