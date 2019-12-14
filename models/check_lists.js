/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  let Model = sequelize.define('check_lists', {
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
      checklistPeriodId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
          model: 'checklist_periods',
          key: 'id'
        }
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      description: {
        type: DataTypes.STRING(192),
        allowNull: true
      },
      duedate: {
        type: DataTypes.DATE,
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
      active: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 1
      }
    }, {
      tableName: 'check_lists'
    });
    Model.associate = function(models){
      this.language = this.belongsTo(models.languages); 
      this.checklistPeriod = this.belongsTo(models.checklist_periods); 
      this.user = this.belongsTo(models.users);
      this.checklistanswer = this.hasMany(models.check_list_answers);
    };
  
    return Model;
  };
  