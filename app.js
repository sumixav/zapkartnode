const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const passport = require("passport");
const pe = require("parse-error");
const mongoose = require("mongoose");
const cors = require("cors");
// const fileUpload = require("express-fileupload");
const multer = require("multer");
// const upload = multer();
const Logger = require("./logger");
const { ReE, to, TE } = require("./services/util.service");
const {order_items, order_merchant_assign_items} = require("./auth_models")
const compression = require("compression");



const catalog = require("./routes/catalog");
const backend = require("./routes/backend");

const app = express();
const { status_codes_msg } = require("./utils/appStatics");

// const v1 = require("./routes/v1");




const CONFIG = require("./config/config");

app.use(compression());
app.use(logger("dev"));

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
// app.use("/upload", express.static(__dirname + '/upload'));
app.use("/uploads", express.static("uploads"));

//Passport
app.use(passport.initialize());



//DATABASE
const authmodels = require("./auth_models");
authmodels.sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to SQL database:", CONFIG.sql_db_name);
  })
  .catch((err) => {
    console.error(
      "Unable to connect to SQL database:",
      CONFIG.sql_db_name,
      err
    );
  });
if (CONFIG.app === "dev") {
  //models.sequelize.sync();//creates table if they do not already exist
  //authmodels.sequelize.sync({ force: true }); //deletes all tables then recreates them useful for testing and development purposes
}
//Log Env
Logger.info(`Environment: ${CONFIG.app}`);
//DATABASE
Logger.info("MONDODB_URI", CONFIG.mongodb_uri);
mongoose
  .connect(CONFIG.mongodb_uri, {
    dbName: CONFIG.db_name,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    Logger.info(`📖  Connected to MongoDB database: ${CONFIG.db_name}`);
  })
  .catch((err) => Logger.error("❗  Could not connect to MongoDB...", err));

if (CONFIG.app === "dev") {
  //models.sequelize.sync();//creates table if they do not already exist
  // authmodels.sequelize.sync({ force: true }); //deletes all tables then recreates them useful for testing and development purposes
}
// CORS
app.use(cors());
// app.use(fileUpload());
// app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
// app.use(upload.none())

app.use("/api/catalog/v1", catalog);
app.use("/api/backend/v1", backend);

app.use("/", function (req, res) {
  res
    .status(status_codes_msg.NO_RECORD_FOUND.code)
    .json(status_codes_msg.NO_RECORD_FOUND);
});

// const bootstrap = async () => {

//   const [errJ, orderItemWithMerchant] = await to(order_items.findOne({
//     where:{
//       id:10
//     },
//     include:[
//       {
//         model:order_merchant_assign_items,
//         as:'assignedMerchant'
//       }
//     ]
//   }))

//   if (errJ) Logger.error(errJ.message);
//   Logger.info('other one')
//   Logger.info(orderItemWithMerchant)
// }
// bootstrap();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log("err.status");
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  console.error("ERROR", err.status);
  return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
});

// error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//   console.log("err.status" + err.status);
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;

//This is here to handle all the uncaught promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Uncaught Error", pe(error));
});

const http = require("http");
const port = normalizePort(CONFIG.port || "80");
app.set("port", port);
const server = http.createServer(app);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();

  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  //   debug('Listening on ' + bind);

  Logger.info(`🚀   Server listening on port: ${port}`);
}
