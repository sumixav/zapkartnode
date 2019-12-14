/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('checklist_periods', {
        id: {
          type: DataTypes.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
          },
          description: {
            type: DataTypes.STRING(192),
            allowNull: true
          } ,
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
        tableName: 'checklist_periods'
      });
      Model.associate = function(models){
       
        this.language = this.belongsTo(models.languages);
        this.checklist = this.hasMany(models.check_lists); 
      };
    
      return Model;
    };
    