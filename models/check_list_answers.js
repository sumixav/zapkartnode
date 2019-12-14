/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('check_list_answers', {
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
        checkListId: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
          references: {
            model: 'check_lists',
            key: 'id'
          }
        },
        statueId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
              model: 'statues',
              key: 'id'
            }
          }
      }, {
        tableName: 'check_list_answers'
      });
      Model.associate = function(models){
        this.user = this.belongsTo(models.users); 
        this.status = this.belongsTo(models.statues); 
        this.checklist = this.belongsTo(models.check_lists); 
      };
    
      return Model;
    };
    