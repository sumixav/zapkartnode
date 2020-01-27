var winston = require('winston')
var path = require('path')
var PROJECT_ROOT = path.join(__dirname, '..');
const { SPLAT } = require('triple-beam');
var appRoot = require('app-root-path');
const { combine, timestamp, colorize, printf } = winston.format

const options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
    timestamp: true
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: true,
    colorize: true,
    timestamp: true
  }
};

const customFormat = printf((info) => {
  const { level, message, timestamp } = info
  const rest = info[SPLAT] || [];
  const msg = info.stack ? formatObject(info.stack) : formatObject(message);
  let result = `${timestamp} - ${level}: ${msg}`
  if (rest.length) {
    result += `\n${rest.map(formatObject).join('\n')}`;
  }

  return result;
})

const formatObject = (param) => {
  if (typeof param === 'string') {
    return param;
  }

  if (param instanceof Error) {
    return param.stack ? param.stack : JSON.stringify(param, null, 2);
  }

  return JSON.stringify(param, null, 2);
};

var logger = winston.createLogger({
  format: combine(
    timestamp(),
    colorize({
      colors: {
        audit: 'magenta',
        trace: 'white',
        perf: 'green'
      }
    }),
    customFormat
  ),
  transports: [
    // new winston.transports.File(options.file),
    new winston.transports.Console(options.console)
    // new winston.transports.Console({
    //   format: combine(colorize()),
    //   handleExceptions: true,
    // }),
  ],
  exitOnError: false // do not exit on handled exceptions
});

logger.stream = {
  write: function (message) {
    logger.info(message)
  }
}

// A custom logger interface that wraps winston, making it easy to instrument
// code and still possible to replace winston in the future.

module.exports.debug = module.exports.log = function () {
  logger.debug.apply(logger, formatLogArguments(arguments))
}

module.exports.info = function () {
  logger.info.apply(logger, formatLogArguments(arguments))
}

module.exports.warn = function () {
  logger.warn.apply(logger, formatLogArguments(arguments))
}

module.exports.error = function () {
  logger.error.apply(logger, formatLogArguments(arguments))
}

module.exports.stream = logger.stream

/**
 * Attempts to add file and line number info to the given log arguments.
 */
function formatLogArguments(args) {
  // console.log(args)
  args = Array.prototype.slice.call(args)

  var stackInfo = getStackInfo(1)

  if (stackInfo) {
    // get file path relative to project root
    var calleeStr = '(' + stackInfo.relativePath + ':' + stackInfo.line + ')'

    if (typeof (args[0]) === 'string') {
      args[0] = calleeStr + ' ' + args[0]
    } else {
      args.unshift(calleeStr)
    }

    // error
    // if (args[0] && args[0].stack) args[0] = args[0].stack 
    // if (args[0] instanceof Error) {
    //   args[0] =  args.stack ? args.stack : JSON.stringify(args, null, 2);
    // }



    // else args[0] = '\n' + args[0]

    //  else {
    //   args.unshift(calleeStr)
    // }
  }

  return args
}

/**
 * Parses and returns info about the call stack at the given index.
 */
function getStackInfo(stackIndex) {
  // get call stack, and analyze it
  // get all file, method, and line numbers
  var stacklist = (new Error()).stack.split('\n').slice(3)

  // stack trace format:
  // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
  // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
  var stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
  var stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi

  var s = stacklist[stackIndex] || stacklist[0]
  var sp = stackReg.exec(s) || stackReg2.exec(s)

  if (sp && sp.length === 5) {
    return {
      method: sp[1],
      relativePath: path.relative(PROJECT_ROOT, sp[2]),
      line: sp[3],
      pos: sp[4],
      file: path.basename(sp[2]),
      stack: stacklist.join('\n')
    }
  }
}