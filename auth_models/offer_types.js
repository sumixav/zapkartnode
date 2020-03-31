/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('offer_types', {
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
      tableName: 'offer_types'
    });
    
      Model.associate = function(models){
        this.offer = this.hasMany(models.offers);
      };  
    return Model;
  };
  
