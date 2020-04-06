/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('offer_category_products', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      offerId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: ' offers',
          key: 'id'
        }
      },
      type: {
        type:   DataTypes.ENUM,
        values: ['category', 'product']
      },
      itemId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      status: {
        type:   DataTypes.ENUM,
        values: ['active', 'hold']
      },
    },
     {
      tableName: 'offer_category_products'
    });
    
      Model.associate = function(models){
        this.offer = this.belongsTo(models.offers);
      };   
    return Model;
  };
  
