"use strict";

const { createLogger, format, transports } = require("winston");
const { combine, timestamp, colorize, printf, splat, errors } = format;

const {
  customLevels,
  level,
  logTransport,
  transportFileOptions
} = require("./lib/config");

const allLevels = {
  error: 0,
  warn: 1,
  audit: 2,
  trace: 3,
  info: 4,
  perf: 5,
  verbose: 6,
  debug: 7,
  silly: 8
};
const customLevelsArr = customLevels.split(/ *, */); // extra white space before/after the comma is ignored
const ignoredLevels = customLevels
  ? Object.keys(allLevels).filter(key => !customLevelsArr.includes(key))
  : [];

const customFormat = printf(info => {
  return `${info.timestamp} - ${info.level}: ${info.message}`;
});

const errorStackTracerFormat = format(info => {
  if (info.meta && info.meta instanceof Error) {
    info.message = `${info.message} ${info.meta.stack}`;
  }
  return info;
});

let transport = new transports.Console();
if (logTransport === "file") {
  transport = new transports.File(transportFileOptions);
}

const Logger = createLogger({
  level,
  levels: allLevels,
  format: combine(
    errors({ stack: true }),
    timestamp(),
    colorize({
      colors: {
        audit: "magenta",
        trace: "white",
        perf: "green"
      }
    }),
    splat(),
    // errorStackTracerFormat(),
    customFormat
  ),
  transports: [transport],
  exceptionHandlers: [transport],
  exitOnError: false
});

// Modify Logger before export
ignoredLevels.map(level => {
  Logger[level] = () => {};
});

module.exports = Logger;
