module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('mail_settings', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      mailSecuritySetting: {
        type: Sequelize.STRING(50),
        allowNull: true,
        enum: ['ssl', 'tls']
      },
      smtpHost: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      smtpUsername: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      smtpPassword: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      smtpPort: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      smtpTimeout: {
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
    return queryInterface.dropTable('mail_settings');
  }
};

