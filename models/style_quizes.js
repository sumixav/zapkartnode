/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('style_quizes', {
        id: {
          type: DataTypes.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        
        description: {
            type: DataTypes.STRING(192),
            allowNull: true
        },
        languageId: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
          references: {
            model: 'languages',
            key: 'id'
          }
        },
        styleQuizSectorId: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
          references: {
            model: 'style_quiz_sectors',
            key: 'id'
          }
        },
        active: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
          defaultValue: 1
        }
      }, {
        tableName: 'style_quizes'
      });
      Model.associate = function(models){
        this.language = this.belongsTo(models.languages); 
        this.stylequizoption = this.hasMany(models.style_quiz_options);
        this.stylequizanswer = this.hasMany(models.style_quiz_answers);
        this.styleQuizSector = this.belongsTo(models.style_quiz_sectors);
      };
    
      return Model;
    };
    