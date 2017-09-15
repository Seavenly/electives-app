let log = [];
let errors = [];

const logger = {
  log: (type = 'INFO', message) => {
    log.push([type, message]);
    if (type === 'ERROR') errors.push(message);
  },

  getLog: () => log,

  getErrors: () => errors,

  error: message => logger.log('ERROR', message),

  clear: () => {
    log = [];
    errors = [];
  },
};

module.exports = logger;
