/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('tips', {
        id: {
          type: DataTypes.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        slug: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        content: {
            type: DataTypes.STRING(255),
            allowNull: false 
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false 
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: false
       },
        languageId: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
          references: {
            model: 'languages',
            key: 'id'
          }
        },
          active: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
          defaultValue: 1
        }
      }, {
        tableName: 'tips'
      });
      Model.associate = function(models){
        this.language = this.belongsTo(models.languages);
      };
    
      return Model;
    };
    
