/* jshint indent: 2 */
const SequelizeSlugify = require('sequelize-slugify');

module.exports = function (sequelize, DataTypes) {
  let Model = sequelize.define('merchants', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    merchantTypeId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'merchant_types',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    countryId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'countries',
        key: 'id'
      }
    },
    stateId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'states',
        key: 'id'
      }
    },
    cityId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'cities',
        key: 'id'
      }
    },
    zipcode: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    regnumber: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    establishdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    languageId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'languages',
        key: 'id'
      }
    },
    latitude: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    longitude: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    profiledescription: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    commissionslab: {
      type: DataTypes.INTEGER(20),
      allowNull: false
    },
    designation: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    accountdetails: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    accounttype: {
      type: DataTypes.ENUM,
      values: ['saving', 'current']
    },
    nameonaccount: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM,
      values: ['active', 'hold']
    },
    deleted: {
      type: DataTypes.ENUM,
      values: ['true', 'false']
    },
    createdBy: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    customSlug: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.get('name') && this.get('name');
      },
    },
  }, {
    getterMethods: {
      timestamp() {
        return Date.now();
      },
    }

  },
    {
      tableName: 'merchants'
    });

  SequelizeSlugify.slugifyModel(Model, {
    source: ['customSlug'],
    suffixSource: ['timestamp'],
    slugOptions: { lower: true },
    overwrite: false,
    column: 'slug',
    incrementalReplacement: '-',
  });

  Model.associate = function (models) {
    this.userId = this.belongsTo(models.users);
  };

  Model.associate = function (models) {
    this.createdby = this.belongsTo(models.users, { foreignKey: 'createdBy' });
  };

  Model.associate = function (models) {
    this.languages = this.belongsTo(models.languages);
  };

  Model.associate = function (models) {
    this.merchanttypes = this.belongsTo(models.merchant_types);
  };

  Model.associate = function (models) {
    this.countries = this.belongsTo(models.countries);
  };

  Model.associate = function (models) {
    this.states = this.belongsTo(models.states);
  };
  Model.associate = function (models) {
    this.cities = this.belongsTo(models.cities);
  };
  Model.associate = function (models) {
    this.assignedOrders = this.hasMany(models.order_merchant_assign, { as: 'assignedOrders', foreignKey: 'merchantId' });
  };
  return Model;
};

