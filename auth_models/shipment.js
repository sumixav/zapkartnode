module.exports = function (sequelize, DataTypes) {
  const Shipment = sequelize.define("shipment", {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    masterOrderId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'order_masters',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    activityDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shipmentOriginDetails: {
      allowNull: true,
      type: DataTypes.TEXT,
      get: function () {
        return JSON.parse(this.getDataValue("shipmentOriginDetails"));
      },
      set: function (value) {
        this.setDataValue("shipmentOriginDetails", JSON.stringify(value));
      },
    },
    shipmentDestinationAddress: {
      allowNull: true,
      type: DataTypes.TEXT,
      get: function () {
        return JSON.parse(this.getDataValue("shipmentDestinationAddress"));
      },
      set: function (value) {
        this.setDataValue("shipmentDestinationAddress", JSON.stringify(value));
      },
    },
    grossWeight: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    carrier: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serviceType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipmentCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    packageDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dropOffType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otherLogisticPartner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otherTrackingUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pickupCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isRequired: function (value) {
          if (this.shippingStatus === "pickup" && value == null)
            throw new Error("Pickup created date required");
        },
      },
    },
    pickupDateTime: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isRequired: function (value) {
          if (this.shippingStatus === "pickup" && value == null)
            throw new Error("Pickup date required");
        },
      },
    },
    pickupClosingTime: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: "00:00",
    },
    dispatchDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isRequired: function (value) {
          if (this.shippingStatus === "dispatched" && value == null)
            throw new Error("Dispatched date required required");
        },
      },
    },
    dispatchExpDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isRequired: function (value) {
          if (this.shippingStatus === "dispatched" && value == null)
            throw new Error("Expected delivery date required");
        },
      },
    },
    dispatchStatusDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dispatchNotifyCustomer: {
      type: DataTypes.ENUM,
      values: ["yes", "no"],
      allowNull: true,
    },
    trackingNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    deliveredDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isRequired: function (value) {
          if (this.shippingStatus === "delivered" && value == null)
            throw new Error("Delivered date required");
        },
      },
    },
    deliveredComment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deliveredNotifyCustomer: {
      type: DataTypes.ENUM,
      values: ["yes", "no"],
      allowNull: true,
    },
    shippedCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isRequired: function (value) {
          if (this.shippingStatus === "shipped" && value == null)
            throw new Error("Shipped created date required");
        },
      },
    },
    trackingDetails: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    shippingCharge: {
      type: DataTypes.DECIMAL(15, 5),
      allowNull: true,
    },
    extra: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancelledDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isRequired: function (value) {
          if (this.shippingStatus === "cancelled" && value == null)
            throw new Error("Cancelled date required");
        },
      },
    },
    cancelledReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdByType: {
      type: DataTypes.ENUM,
      values: ["admin", "merchant"],
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    shippingStatus: {
      type: DataTypes.ENUM,
      values: [
        "pending",
        "shipped",
        "pickup",
        "delivered",
        "cancelled",
        "dispatched",
      ],
      defaultValue: "pending",
    },
  });

  Shipment.associate = function (models) {
    Shipment.belongsTo(models.order_masters, {
      as: "masterOrder",
      foreignKey: "masterOrderId",
    });
    // Shipment.hasMany(models.order_items, {as:'orderItems'})
    Shipment.hasMany(models.shipment_order_item, { as: "orderItems", foreignKey:"shipmentId" });
    Shipment.belongsTo(models.users, { foreignKey: "createdBy" });
    // Shipment.belongsTo(models.user_types,{foreignKey:"createdByType"});
  };

  Shipment.prototype.toWeb = function () {
    let json = this.toJSON();
    return json;
  };

  return Shipment;
};


