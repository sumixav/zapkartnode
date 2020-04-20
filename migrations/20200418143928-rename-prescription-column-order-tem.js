'use strict';

module.exports = {
  up: (queryInterface) => {
   return queryInterface.renameColumn('order_items', 'preceptionRequired', 'prescriptionRequired' );
  },

  down: (queryInterface) => {
    return queryInterface.renameColumn('order_items', 'prescriptionRequired', 'preceptionRequired' );
  }
};
