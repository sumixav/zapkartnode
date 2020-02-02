/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('states', {
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
    countryId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'countries',
          key: 'id'
        }
      }
    },
     {
      timestamps: false,
      tableName: 'states'
    });
    Model.associate = function(models){
        this.countries = this.belongsTo(models.countries);
      };

      Model.associate = function(models){
        this.cities = this.hasMany(models.cities);
      };

      Model.associate = function(models){
        this.merchant = this.hasMany(models.merchants);
      };

    return Model;
  };
  
