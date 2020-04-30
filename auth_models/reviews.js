module.exports = function (sequelize, DataTypes) {
  let Model = sequelize.define(
    "reviews",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      text: {
        type: DataTypes.TEXT('medium'),
        allowNull: false
      },
      rating: {
        type: DataTypes.INTEGER(3),
        allowNull: false
      },
      title: {
        type: DataTypes.TEXT('tiny'),
        allowNull: false
      },
      orderId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
          model: "order_masters",
          key: "id"
        }
      },
      // orderItemId:{
      //   type: DataTypes.INTEGER(11),
      //   allowNull: true,
      //   references: {
      //     model: "order_items",
      //     key: "id"
      //   }
      // },
      productId: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        }
      },
      status: {
        type: DataTypes.ENUM,
        values: ["active", "disabled", "pending"]
      },
      priorityOrder: {
        type: DataTypes.INTEGER(11),
        default: 0
      }
    },
    {
      tableName: "reviews",
      paranoid: true
    }
  );

  Model.associate = function (models) {
    Model.belongsTo(models.order_masters, { foreignKey: "orderId" });
    // Model.belongsTo(models.order_items, { foreignKey: "orderItemId" });
    Model.belongsTo(models.users, { foreignKey: "userId" });
  };


  Model.prototype.toWeb = function () {
    let json = this.toJSON();
    return json;
  };

  return Model;
};
