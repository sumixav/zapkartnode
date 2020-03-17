/* jshint indent: 2 */
const SequelizeSlugify = require('sequelize-slugify');

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('coupens', {
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
      coupenCode: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      validFrom: {
        type: DataTypes.DATE,
        allowNull: false
      },
      validTo: {
        type: DataTypes.DATE,
        allowNull: false
      },
      coupenTypeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: ' coupen_types',
          key: 'id'
        }
      },
      status: {
          type:   DataTypes.ENUM,
          values: ['active', 'hold']
        },
      totalUsedCount: {
          type:   DataTypes.INTEGER(11),
          allowNull: true,
        },
        deleted: {
          type:   DataTypes.INTEGER(11),
          default:0,
        },
          createdBy: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          }
        },
      },
     {
      tableName: 'coupens'
    });
    Model.associate = function(models){
      this.coupenType = this.belongsTo(models.coupen_types);
    };

    Model.associate = function(models){
        this.createdby = this.belongsTo(models.users, {foreignKey: 'createdBy'});
      };
    
      Model.associate = function(models){
        this.coupenMapping = this.hasMany(models.coupen_user_mappings);
      };  
    return Model;
  };
  
