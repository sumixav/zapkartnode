module.exports = function (sequelize, DataTypes) {
  let Model = sequelize.define(
    "otp",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      otp: {
        type: DataTypes.INTEGER(5),
        allowNull: false
      },
      noOfRetries: {
        type: DataTypes.INTEGER(5),
        allowNull: false
      },
      userId:{
        type: DataTypes.INTEGER(11),
        allowNull:false,
      },
      phone:{
        type: DataTypes.STRING(20),
        allowNull:false
      },
      expiresAt:{
        allowNull: false,
        type: DataTypes.DATE,
      },
      lastRetry:{
        allowNull:true,
        type: DataTypes.DATE,
      }
    },
    {
      tableName: "otp",
      
    }
  );

  Model.associate = function (models) {
    Model.belongsTo(models.users, {
      as:'user',
      foreignKey:'userId'
    })
  }

  return Model;
};
