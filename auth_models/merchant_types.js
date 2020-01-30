/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('merchant_types', {
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
      createdBy: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    status: {
        type:   DataTypes.ENUM,
        values: ['active', 'hold']
      }

    }, {
      
      tableName: 'merchant_types'
    });

    Model.associate = function(models){
        this.createdby = this.belongsTo(models.users, {foreignKey: 'createdBy'});
      };

      Model.associate = function(models){
        this.merchants = this.hasMany(models.merchants);
      };
    return Model;
  };
  