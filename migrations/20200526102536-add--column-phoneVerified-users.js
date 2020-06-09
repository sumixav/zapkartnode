'use strict';

module.exports = {
  up: async(queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('users', 'phoneVerified', {
        type:Sequelize.INTEGER(1),
        allowNull:false,
        default:0
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
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
