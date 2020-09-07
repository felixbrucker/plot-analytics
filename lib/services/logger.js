const moment = require('moment');

class Logger {
  log({level, msg}) {
    const logLine = `${moment().format('YYYY-MM-DD HH:mm:ss.SSS')} [${level.toUpperCase()}] | ${msg}`;
    switch (level) {
      case 'error':
        console.error(logLine);
        break;
      default:
        console.log(logLine);
    }
  }
}

module.exports = new Logger();
