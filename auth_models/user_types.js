/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  let Model = sequelize.define('user_types', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    
    tableName: 'user_types'
  });
  Model.associate = function(models){
    this.user = this.hasMany(models.users);
  };

  Model.associate = function(models){
    this.merchants = this.hasMany(models.merchants);
  };

  Model.associate = function(models){
    this.usergroup = this.hasMany(models.user_groups);
  };

  return Model;
};
