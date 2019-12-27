// 'use strict';
// const fs        = require('fs');
// const path      = require('path');
// const mongoose = require('mongoose');
// const basename  = path.basename(__filename);
// const db        = {};
// const CONFIG = require('../config/config');

// mongoose.connect(CONFIG.mongodb_uri, {
//   dbName: CONFIG.DB_NAME,
//   useNewUrlParser: true
// });

// fs.readdirSync(__dirname)
//   .filter((file) => {
//     return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
//   })
//   .forEach((file) => {
//     let model = mongoose.model(path.join(file.toUpperCase()), file);
//     db[model.name] = model;
//   });



// module.exports = db;
