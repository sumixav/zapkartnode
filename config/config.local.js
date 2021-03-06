require('dotenv').config();//instatiate environment variables

let CONFIG = {} //Make this global to use all over the application

CONFIG.app = process.env.APP || 'dev';
CONFIG.port = process.env.PORT || '3004';

CONFIG.db_dialect = process.env.DB_DIALECT || 'mysql';
CONFIG.db_host = process.env.DB_HOST || 'localhost';
CONFIG.db_port = process.env.DB_PORT || '3306';
CONFIG.db_name = process.env.DB_NAME || 'zapkart-dev';
CONFIG.sql_db_name = process.env.SQL_DB_NAME || 'zapkart-dev';

// CONFIG.db_dialect = process.env.DB_DIALECT || 'mysql';
// CONFIG.db_host = process.env.DB_HOST || '51.79.74.247';
// CONFIG.db_port = process.env.DB_PORT || '3306';
// CONFIG.sql_db_name = process.env.SQL_DB_NAME || 'demodb';

CONFIG.db_user = process.env.DB_USER || 'admin';
CONFIG.db_password = process.env.DB_PASSWORD || 'admin';
CONFIG.mongodb_uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb'

CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || 'zapcart-#app';
CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || '365000000';
CONFIG.uploadpath = '/home/acer/Restaurent-app-node/teeta/teetaAdmin/upload/';

CONFIG.SMTP_HOST = process.env.SMTP_HOST;
CONFIG.SMTP_PORT = process.env.SMTP_PORT;
CONFIG.SMTP_USER = process.env.SMTP_USER;
CONFIG.SMTP_PASS = process.env.SMTP_PASS;
CONFIG.FROM_EMAIL = process.env.FROM_EMAIL;

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
