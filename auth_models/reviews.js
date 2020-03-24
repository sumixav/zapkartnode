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
        type: DataTypes.STRING(1000),
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
    this.orderId = this.belongsTo(models.order_masters, { foreignKey: "orderId" });
  };

  Model.associate = function (models) {
    this.userId = this.belongsTo(models.users, { foreignKey: "userId" });
  };
  return Model;
};
