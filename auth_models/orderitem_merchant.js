/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    let Model = sequelize.define(
      "orderitem_merchant",
      {
        id: {
          type: DataTypes.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        orderItemId: {
          type: DataTypes.INTEGER(11),
          allowNull: false,
          references: {
            model: "order_items",
            key: "id",
          },
        },
        merchantId:{
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
              model: "merchants",
              key: "id",
            },
        },
        status: {
            type: DataTypes.ENUM,
            values: ['shipment-created', 'shipment-to-admin', 'rejected', 'pending'],
            defaultValue: 'pending'
          },
          comment: {
            type: DataTypes.TEXT,
            allowNull: true
          }
     
      },
      {
        tableName: "orderitem_merchant",
      }
    );
  
    Model.associate = function (models) {
      Model.belongsTo(models.order_items, { foreignKey: "orderItemId" });
      Model.belongsTo(models.merchants, { foreignKey: "merchantId" });
      
    };
  
    Model.prototype.toWeb = function () {
      let json = this.toJSON();
      return json;
    };
  
    return Model;
  };
  