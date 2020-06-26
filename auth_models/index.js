"use strict";
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const db = {};
const CONFIG = require("../config/config");
const Logger = require("../logger");

const config = CONFIG.development


const sequelize = new Sequelize(
  CONFIG.sql_db_name,
  CONFIG.sql_db_user,
  CONFIG.sql_db_password,
  config
);

// Logger.info("Loading mysql models:");
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    let model = sequelize["import"](path.join(__dirname, file));
    // Logger.info(model.name);

    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

module.exports = db;
