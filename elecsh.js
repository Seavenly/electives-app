const tools = require('./server/tools/tools');
const chalk = require('chalk');
const mongoose = require('mongoose');

const mongodbConfig = require('./server/config/mongodb');

mongoose.connect(mongodbConfig.address);

const args = process.argv.slice(2);
const flags = ['reset-electives', 'setup-users', 'run'];

/**
 * Create string of given length with padded spaces
 * @param {string} str - original string
 * @param {number} length - max characters
 * @param {string} direction - left or right padded
 * @returns {string} padded string
 */
function padstr(str, length, direction = 'left') {
  const pad = ' '.repeat(20);
  if (direction === 'left') return (pad + str).slice(-length);
  return (str + pad).slice(-length);
}

const command = new Promise((resolve, reject) => {
  let p = Promise.resolve();

  if (args[0] === flags[0]) {
    p = tools.resetElectives()
      .then(() => resolve('Electives successfully reset.'));
  } else if (args[0] === flags[1]) {
    p = tools.fromCsv()
      .then(() => resolve('Students and lists successfully created.'));
  } else if (args[0] === flags[2]) {
    p = tools.assignElectives()
      .then((logger) => {
        let log = '';
        tools.createHtmlLog(logger.log);
        logger.log.forEach((lineArr, index) => {
          let line;
          if (lineArr[0] === 'HEAD') line = chalk.bold(`\n\n=== ${lineArr[1]} ===\n\n`);
          else if (lineArr[0] === 'TEXT') line = `${padstr(index + 1, 4)}  ${padstr(lineArr[0], 8)}   ${lineArr[1]}\n`;
          else if (lineArr[0] === 'INFO') line = `${padstr(index + 1, 4)}  ${chalk.bold.cyan(padstr(lineArr[0], 8))}   ${chalk.cyan(lineArr[1])}\n`;
          else if (lineArr[0] === 'SUCCESS') line = `${padstr(index + 1, 4)}  ${chalk.bold.green(padstr(lineArr[0], 8))}   ${chalk.green(lineArr[1])}\n`;
          else if (lineArr[0] === 'ERROR') line = `${padstr(index + 1, 4)}  ${chalk.bold.red(padstr(lineArr[0], 8))}   ${chalk.red(lineArr[1])}\n`;
          else line = `${padstr(index + 1, 4)}  ${chalk.bold.yellow(padstr(lineArr[0], 8))}   ${chalk.yellow(lineArr[1])}\n`;
          log += line;
        });
        resolve(`Electives calculated ${log}`);
      });
  } else {
    reject('No valid args passed');
  }
  p.catch(err => reject(err));
});

command
  .then(message => console.log(chalk.green('Success:'), message))
  .catch(err => console.log(chalk.red(err.stack.slice(0, 6)), err.stack.slice(6)))
  .then(() => mongoose.connection.close());

