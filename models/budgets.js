/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('budgets', {
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
      totalAmount: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      remainingAmount: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      }
    }, {
      tableName: 'budgets'
     
    });
    Model.associate = function(models){
      this.user = this.belongsTo(models.users); 
      this.budgetministatement = this.hasMany(models.budget_mini_statements); 
    };
    return Model;
  };
  