/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  var Model = sequelize.define(
    "prescriptions",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      url: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      thumbnail: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },

      },
    },
    {
      tableName: "prescriptions"
    }
  );



  Model.associate = function (models) {
    this.user = this.belongsTo(models.users);
  };

  return Model;
};
