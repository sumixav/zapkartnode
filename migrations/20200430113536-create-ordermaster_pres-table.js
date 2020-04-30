'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ordermaster_pres', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      orderMasterId: {
        type: Sequelize.INTEGER(11),
        allowNull: false
      },
      presId: {
        type: Sequelize.INTEGER(11),
        allowNull: false
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

  down: (queryInterface) => {
    return queryInterface.removeTable('ordermaster_pres');
  }
};
