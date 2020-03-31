/* jshint indent: 2 */
const SequelizeSlugify = require('sequelize-slugify');

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('offers', {
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
      amount: {
        type: DataTypes.INTEGER(11),
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
      method: {
        type:   DataTypes.ENUM,
        values: ['voucher', 'coupon']
      },
      type: {
        type:   DataTypes.ENUM,
        values: ['flat', 'discount']
      },
      discount: {
        type:   DataTypes.INTEGER(11),
        allowNull: true,
      },
      minimum_cart: {
        type:   DataTypes.INTEGER(11),
        allowNull: true,
      },
      maximum_cart: {
        type:   DataTypes.INTEGER(11),
        allowNull: true,
      },
      no_of_voucher: {
        type:   DataTypes.INTEGER(11),
        allowNull: true,
      },
      description: {
        type:   DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
          type:   DataTypes.ENUM,
          values: ['active', 'hold']
        },
      totalUsedCount: {
          type:   DataTypes.INTEGER(11),
          allowNull: true,
        },
        max_usage_per_user: {
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
      tableName: 'offers'
    });
    Model.associate = function(models){
      this.offerType = this.belongsTo(models.offer_types);
    };

    Model.associate = function(models){
        this.createdby = this.belongsTo(models.users, {foreignKey: 'createdBy'});
      };
    
      Model.associate = function(models){
        this.offerMapping = this.hasMany(models.offer_user_mappings);
      };  

      Model.associate = function(models){
        this.offerCategory = this.hasMany(models.offer_category_products);
      }; 
    return Model;
  };
  
