/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('budget_mini_statements', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      budgetId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'budgets',
          key: 'id'
        }
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      spentAmount: {
        type: DataTypes.INTEGER(11),
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
    },{
      tableName: 'budget_mini_statements'
    });
    Model.associate = function(models){
      this.budget = this.belongsTo(models.budgets); 
      this.language = this.belongsTo(models.languages);
    };
    return Model;
  };
  