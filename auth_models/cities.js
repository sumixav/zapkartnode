/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('cities', {
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
    stateId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'states',
          key: 'id'
        }
      }
    },
     {
      
      tableName: 'cities'
    });
    Model.associate = function(models){
        this.state = this.belongsTo(models.states);
      };
      Model.associate = function(models){
        this.merchant = this.hasMany(models.merchants);
      };  
    return Model;
  };
  