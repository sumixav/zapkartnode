module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_groups', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      userTypeId: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
        references: {
          model: 'user_types',
          key: 'id'
        },

      },
      createdBy: {
        type: Sequelize.INTEGER(11),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM,
        values: ['active', 'hold']
      },
      deleted: {
        type: Sequelize.ENUM,
        values: ['true', 'false']
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
    return queryInterface.removeTable('user_groups');
  }
};

