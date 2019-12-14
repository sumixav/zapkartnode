/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('vendors', {
        id: {
          type: DataTypes.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        email: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        link: {
          type: DataTypes.STRING(20),
          allowNull: true
      },
        avatarlocation: {
        type: DataTypes.STRING(255),
        allowNull: false
       },
        description: {
            type: DataTypes.STRING(192),
            allowNull: true
        },
       active: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
          defaultValue: 1
        },
        languageId: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
          references: {
            model: 'languages',
            key: 'id'
          }
        }
      }, {
        tableName: 'vendors'
      });
      Model.associate = function(models){
        this.language = this.belongsTo(models.languages);
      };
    
      return Model;
    };
    
