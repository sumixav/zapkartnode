'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('transaction_details', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      transactionId: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      transactionResponseDetails: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      orderId: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      status: {
          type:   Sequelize.ENUM,
          values: ['pending', 'failed','success']
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
    return queryInterface.dropTable('transaction_details');
  }
};
