/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('carts', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      productId: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      price: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      userId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }

    }, {
      
      tableName: 'carts'
    });

    Model.associate = function(models){
        this.userId = this.belongsTo(models.users, {foreignKey: 'userId'});
      };

      Model.associate = function(models){
        this.merchants = this.hasMany(models.merchants);
      };
    return Model;
  };
  