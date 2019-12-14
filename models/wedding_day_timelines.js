/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Model = sequelize.define('wedding_day_timelines', {
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
        dateTime: {
          type: DataTypes.STRING(255),
          allowNull: false
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        
        statueId: {
          type: DataTypes.INTEGER(11),
          allowNull: true,
          references: {
            model: 'statues',
            key: 'id'
          }
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
        tableName: 'wedding_day_timelines'
      });
      Model.associate = function(models){
        this.user = this.belongsTo(models.users); 
        this.language = this.belongsTo(models.languages); 
        this.status = this.belongsTo(models.statues); 
      };
    
      return Model;
    };
    
