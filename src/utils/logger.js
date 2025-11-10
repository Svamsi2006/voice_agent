/**
 * Simple logger utility for consistent logging across the application
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase() || 'INFO'];

function formatMessage(level, message, ...args) {
  const timestamp = new Date().toISOString();
  const formattedArgs = args.length > 0 ? ' ' + JSON.stringify(args) : '';
  return `[${timestamp}] [${level}] ${message}${formattedArgs}`;
}

function debug(message, ...args) {
  if (currentLevel <= LOG_LEVELS.DEBUG) {
    console.log(formatMessage('DEBUG', message, ...args));
  }
}

function info(message, ...args) {
  if (currentLevel <= LOG_LEVELS.INFO) {
    console.log(formatMessage('INFO', message, ...args));
  }
}

function warn(message, ...args) {
  if (currentLevel <= LOG_LEVELS.WARN) {
    console.warn(formatMessage('WARN', message, ...args));
  }
}

function error(message, ...args) {
  if (currentLevel <= LOG_LEVELS.ERROR) {
    console.error(formatMessage('ERROR', message, ...args));
  }
}

module.exports = {
  debug,
  info,
  warn,
  error
};
