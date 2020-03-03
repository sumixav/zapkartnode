/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('user_groups', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      userTypeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'user_types',
          key: 'id'
        },
        
      },
      createdBy: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    status: {
        type:   DataTypes.ENUM,
        values: ['active', 'hold']
      },
      deleted: {
          type:   DataTypes.ENUM,
          values: ['true', 'false']
        }

    }, {
      
      tableName: 'user_groups'
    });

    Model.associate = function(models){
        this.createdby = this.belongsTo(models.users, {foreignKey: 'createdBy'});
      };

      Model.associate = function(models){
        this.merchants = this.hasMany(models.merchants);
      };

      Model.associate = function(models){
        this.userType = this.belongsTo(models.user_types, {foreignKey: 'userTypeId'});
      };
    return Model;
  };
  