/* jshint indent: 2 */
const SequelizeSlugify = require('sequelize-slugify');

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('transaction_details', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      transactionId: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      transactionResponseDetails: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      orderId: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      status: {
          type:   DataTypes.ENUM,
          values: ['pending', 'failed','success']
        },
      },
     {
      tableName: 'transaction_details'
    }); 
    return Model;
  };
  
