/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('style_quiz_options', {
        id: {
          type: DataTypes.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        image: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        styleQuizCategoryId: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
          references: {
            model: 'style_quiz_categories',
            key: 'id'
          }
        },
        
  active: {
    type: DataTypes.INTEGER(11),
    allowNull: true,
    defaultValue: 1
  },
        styleQuizeId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            references: {
              model: 'style_quizes',
              key: 'id'
            }
          }
      }, {
        tableName: 'style_quiz_options'
      });
      Model.associate = function(models){
        this.styleQuizCategory = this.belongsTo(models.style_quiz_categories);
        this.styleQuiz = this.belongsTo(models.style_quizes);
        this.styleQuizanswer = this.hasMany(models.style_quiz_answers);
      };
    
      return Model;
    };
    