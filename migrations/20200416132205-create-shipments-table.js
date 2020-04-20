"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("shipments", {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      masterOrderId: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references: {
          model: 'order_masters',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      activityDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      shipmentOriginDetails: {
        allowNull: true,
        type: Sequelize.TEXT,
        get: function () {
          return JSON.parse(this.getDataValue("shipmentOriginDetails"));
        },
        set: function (value) {
          this.setDataValue("shipmentOriginDetails", JSON.stringify(value));
        },
      },
      shipmentDestinationAddress: {
        allowNull: true,
        type: Sequelize.TEXT,
        get: function () {
          return JSON.parse(this.getDataValue("shipmentDestinationAddress"));
        },
        set: function (value) {
          this.setDataValue("shipmentDestinationAddress", JSON.stringify(value));
        },
      },
      grossWeight: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      carrier: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      serviceType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipmentCreatedDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      packageDetails: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      dropOffType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      otherLogisticPartner: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      otherTrackingUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pickupCreatedDate: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isRequired: function (value) {
            if (this.shippingStatus === "pickup" && value == null)
              throw new Error("Pickup created date required");
          },
        },
      },
      pickupDateTime: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isRequired: function (value) {
            if (this.shippingStatus === "pickup" && value == null)
              throw new Error("Pickup date required");
          },
        },
      },
      pickupClosingTime: {
        type: Sequelize.TIME,
        allowNull: true,
        defaultValue: "00:00",
      },
      dispatchDate: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isRequired: function (value) {
            if (this.shippingStatus === "dispatched" && value == null)
              throw new Error("Dispatched date required required");
          },
        },
      },
      dispatchExpDeliveryDate: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isRequired: function (value) {
            if (this.shippingStatus === "dispatched" && value == null)
              throw new Error("Expected delivery date required");
          },
        },
      },
      dispatchStatusDetails: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      dispatchNotifyCustomer: {
        type: Sequelize.ENUM,
        values: ["yes", "no"],
        allowNull: true,
      },
      trackingNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      deliveredDate: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isRequired: function (value) {
            if (this.shippingStatus === "delivered" && value == null)
              throw new Error("Delivered date required");
          },
        },
      },
      deliveredComment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      deliveredNotifyCustomer: {
        type: Sequelize.ENUM,
        values: ["yes", "no"],
        allowNull: true,
      },
      shippedCreatedDate: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isRequired: function (value) {
            if (this.shippingStatus === "shipped" && value == null)
              throw new Error("Shipped created date required");
          },
        },
      },
      trackingDetails: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      shippingCharge: {
        type: Sequelize.DECIMAL(15, 5),
        allowNull: true,
      },
      extra: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cancelledDate: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isRequired: function (value) {
            if (this.shippingStatus === "cancelled" && value == null)
              throw new Error("Cancelled date required");
          },
        },
      },
      cancelledReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdByType: {
        type: Sequelize.ENUM,
        values: ["admin", "merchant"],
        allowNull: false,
      },
      createdBy: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      shippingStatus: {
        type: Sequelize.ENUM,
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("shipments");
  },
};
