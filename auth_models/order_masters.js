/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('order_masters', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      orderNo: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      orderTotalAmount: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      coupenId: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      userId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    orderSubtotal: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    orderQty: {
        type: DataTypes.INTEGER(11),
        allowNull: true
    },
    orderQty: {
        type: DataTypes.INTEGER(11),
        allowNull: true
    },
    paymentSettingId: {
        type: DataTypes.INTEGER(11),
        allowNull: true
    },
    paymentType: {
      type:   DataTypes.ENUM,
      values: ['cod','onlinePayment']
    },
    paymentStatus: {
      type:   DataTypes.ENUM,
      values: ['pending','failed','success']
    },
    orderStatus: {
        type:   DataTypes.ENUM,
        values: ['hold','pending','processing','completed']
    },
    transactionId: {
        type: DataTypes.STRING(255),
        allowNull: true
    }, 
    billingAddress: {
        type: DataTypes.STRING(255),
        allowNull: true
    }, 
    shippingAddress: {
        type: DataTypes.STRING(255),
        allowNull: true
    }, 
    shippingAmount: {
        type: DataTypes.INTEGER(11),
        allowNull: true
    }, 

    }, {
      
      tableName: 'order_masters'
    });

    Model.associate = function(models){
        this.userId = this.belongsTo(models.users, {foreignKey: 'userId'});
      };

    return Model;
  };
  