/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('style_quiz_categories', {
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
    },  {
      tableName: 'style_quiz_categories'
    });
    Model.associate = function(models){
       
      this.language = this.belongsTo(models.languages);
      this.stylequizoption = this.hasMany(models.style_quiz_options);
      
    };
    return Model;
  };
  