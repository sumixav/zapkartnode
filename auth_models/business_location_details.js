/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('business_location_details', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      zipcode: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
     latitude: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    longituge: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    },
     {
      tableName: 'business_location_details'
    }); 
    return Model;
  };
  
