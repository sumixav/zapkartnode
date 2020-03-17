/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('coupen_user_mappings', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      coupenId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: ' coupens',
          key: 'id'
        }
      },
      mappingType: {
        type:   DataTypes.ENUM,
        values: ['userGroup', 'individualUser']
      },
      isApplied: {
        type:   DataTypes.ENUM,
        values: ['yes', 'no'],
        default:'no'
      },
      userMappingId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      label: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
     {
      tableName: 'coupen_user_mappings'
    });
    
      Model.associate = function(models){
        this.coupen = this.belongsTo(models.coupens);
      };   
    return Model;
  };
  
