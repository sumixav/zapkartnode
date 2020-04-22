require("dotenv").config(); //instatiate environment variables

let CONFIG = {}; //Make this global to use all over the application

CONFIG.app = process.env.APP || "development";
CONFIG.port = process.env.PORT || "3005";

CONFIG.development = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.SQL_DB_NAME,
  host: "127.0.0.1",
  dialect: process.env.DB_DIALECT|| "mysql",
  operatorsAliases: false,
  define: {
    charset: "utf8",
    collate: "utf8_general_ci",
    timestamps: true,
  },
};

CONFIG.db_dialect = process.env.DB_DIALECT || "mysql";
CONFIG.db_host = process.env.DB_HOST || "localhost";
CONFIG.db_port = process.env.DB_PORT || "3306";
CONFIG.db_name = process.env.DB_NAME || "zapkart-dev";
CONFIG.sql_db_name = process.env.SQL_DB_NAME || "zapkartdev";

// CONFIG.db_dialect = process.env.DB_DIALECT || 'mysql';
// CONFIG.db_host = process.env.DB_HOST || '51.79.74.247';
// CONFIG.db_port = process.env.DB_PORT || '3306';
// CONFIG.sql_db_name = process.env.SQL_DB_NAME || 'demodb';

CONFIG.db_user = process.env.DB_USER || "admin";
CONFIG.db_password = process.env.DB_PASSWORD || "admin";
CONFIG.mongodb_uri =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb";

CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || "zapcart-#app";
CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || "365000000";
CONFIG.uploadpath = "/home/acer/Restaurent-app-node/teeta/teetaAdmin/upload/";

CONFIG.SMTP_HOST = process.env.SMTP_HOST || "dallas119.mysitehosted.com";
CONFIG.SMTP_PORT = process.env.SMTP_PORT || "587";
CONFIG.SMTP_USER = process.env.SMTP_USER || "emailtest@riolabz.com";
CONFIG.SMTP_PASS = process.env.SMTP_PASS || "oKTWB-S@c*IW";
CONFIG.FROM_EMAIL = process.env.FROM_EMAIL || "sumixavier@gmail.com";

CONFIG.logger = {
  LOG_LEVEL: "info",
  LOG_FILTER: "",
  LOG_TRANSPORT: "console",
  TRANSPORT_FILE_OPTIONS: {
    json: false,
    timestamp: true,
    prettyPrint: true,
    colorize: true,
    filename: "logs/combined.log",
  },
};

module.exports = CONFIG;