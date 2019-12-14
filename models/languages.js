/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  let Model = sequelize.define('languages', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    
    tableName: 'languages'
  });
  Model.associate = function(models){
       
    this.checklistperiod = this.hasMany(models.checklist_periods);   
    this.checklist = this.hasMany(models.check_lists); 
    this.stylequiz = this.hasMany(models.style_quizes); 
    this.stylequizcategory = this.hasMany(models.style_quiz_categories);
    this.tip = this.hasMany(models.tips);
    this.user = this.hasMany(models.users);
    this.vendor = this.hasMany(models.vendors);
    this.weddingdaytimeline = this.hasMany(models.wedding_day_timelines);
    this.budgetministatementlang = this.hasMany(models.budget_mini_statements); 
  };

  return Model;
};
