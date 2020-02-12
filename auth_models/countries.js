/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('countries', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      sortname: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      phonecode: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      }
    },
     {
      timestamps: false,
      tableName: 'countries',
    });
    
    Model.associate = function(models){
      this.states = this.hasMany(models.states);
    };

    Model.associate = function(models){
      this.merchant = this.hasMany(models.merchants);
    };

    return Model;
  };
  