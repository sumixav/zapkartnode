/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('style_quiz_answers', {
        id: {
          type: DataTypes.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            }
          },
        styleQuizOptionId: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
          references: {
            model: 'style_quiz_options',
            key: 'id'
          }
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
        tableName: 'style_quiz_answers'
      });
      Model.associate = function(models){
        this.user = this.belongsTo(models.users); 
        this.styleQuizOption = this.belongsTo(models.style_quiz_options); 
        this.styleQuiz = this.belongsTo(models.style_quizes);
      };
    
      return Model;
    };
    