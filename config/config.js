require('dotenv').config();//instatiate environment variables

let CONFIG = {} //Make this global to use all over the application

CONFIG.app          = process.env.APP   || 'dev';
CONFIG.port         = process.env.PORT  || '3010';

CONFIG.db_dialect   = process.env.DB_DIALECT    || 'mysql';
CONFIG.db_host      = process.env.DB_HOST       || 'localhost';
CONFIG.db_port      = process.env.DB_PORT       || '3306';
CONFIG.db_name      = process.env.DB_NAME       || 'zapkart';
CONFIG.db_user      = process.env.DB_USER       || 'root';
CONFIG.db_password  = process.env.DB_PASSWORD   || 'teetta@987';
CONFIG.mongodb_uri       = process.env.MONGODB_URI   || 'mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb'

CONFIG.jwt_encryption  = process.env.JWT_ENCRYPTION || 'wedding-#app';
CONFIG.jwt_expiration  = process.env.JWT_EXPIRATION || '365000000';
CONFIG.uploadpath = '/home/acer/Restaurent-app-node/teeta/teetaAdmin/upload/';

CONFIG.logger = {
    "LOG_LEVEL": "info",
    "LOG_FILTER": "",
    "LOG_TRANSPORT": "console",
    "TRANSPORT_FILE_OPTIONS": {
      "json": false,
      "timestamp": true,
      "prettyPrint": true,
      "colorize": true,
      "filename": "logs/combined.log"
    }
  }

module.exports = CONFIG;
