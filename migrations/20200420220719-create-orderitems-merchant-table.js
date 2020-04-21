'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('orderitem_merchant', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      orderItemId: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references: {
          model: "order_items",
          key: "id",
        },
      },
      merchantId: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references: {
          model: "merchants",
          key: "id",
        },
      },
      status: {
        type: Sequelize.ENUM,
        values: ['shipment-created', 'shipment-to-admin', 'rejected', 'pending'],
        defaultValue: 'pending'
      },
      comment: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },


  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("orderitem_merchant");
  }

};
