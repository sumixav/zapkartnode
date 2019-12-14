/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('statues', {
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
    },  {
      tableName: 'statues'
    });

    Model.associate = function(models){
     
      this.guestlist = this.hasMany(models.guest_lists); 
      this.checklistanswer = this.hasMany(models.check_list_answers); 
      this.weddingdaytimelines = this.hasMany(models.wedding_day_timelines);
    };
    return Model;
  };
  
