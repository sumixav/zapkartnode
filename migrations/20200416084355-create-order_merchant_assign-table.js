'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('order_merchant_assign', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      masterOrderId:{
        type:Sequelize.INTEGER(11),
        allowNull:false
      },
      merchantId:{
        type:Sequelize.INTEGER(11),
        allowNull:false
      },
      status:{
        type:Sequelize.ENUM,
        values:['shipment-created', 'shipment-to-admin', 'rejected', 'pending'],
        defaultValue:'pending'
      },
      comment:{
        type:Sequelize.TEXT,
        allowNull:true
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
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
