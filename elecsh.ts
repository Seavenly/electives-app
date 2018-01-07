import chalk from 'chalk';
import mongoose from 'mongoose';

import mongodbConfig from './server/config/mongodb.json';
import tools from './server/tools/tools';
import { Log, Logs, Errors } from './server/tools/logger';

mongoose.connect(mongodbConfig.address);

const [arg]: string[] = process.argv.slice(2);
const enum Flags {
  Reset = 'reset-electives',
  Setup = 'setup-users',
  Run = 'run',
}

/**
 * Create string of given length with padded spaces
 * @param {string} str - original string
 * @param {number} length - max characters
 * @param {string} direction - left or right padded
 * @returns {string} padded string
 */
function padstr(
  str: string,
  length: number,
  direction: string = 'LEFT',
): string {
  const pad = ' '.repeat(20);
  if (direction === 'LEFT') {
    return (pad + str).slice(-length);
  }
  return (str + pad).slice(-length);
}

async function command() {
  switch (arg) {
    case Flags.Reset:
      await tools.resetElectives();
      return 'Electives successfully reset.';
    case Flags.Setup:
      await tools.fromCsv();
      return 'Students and lists successfully created.';
    case Flags.Run: {
      const logger = await tools.assignElectives();
      tools.createHtmlLog(logger.log);
      const log: string = logger.log.reduce(
        (
          accumulator: string,
          currentValue: [string, string],
          index: number,
        ): string => {
          const [type, message]: string[] = currentValue;
          let line: string;

          if (type === Log.HEAD) {
            line = chalk.bold(`\n\n=== ${message} ===\n\n`);
          } else if (type === Log.TEXT) {
            line = `${padstr(`${index + 1}`, 4)}  ${padstr(
              type,
              8,
            )}   ${message}\n`;
          } else if (type === Log.INFO) {
            line = `${padstr(`${index + 1}`, 4)}  ${chalk.bold.cyan(
              padstr(type, 8),
            )}   ${chalk.cyan(message)}\n`;
          } else if (type === Log.SUCCESS) {
            line = `${padstr(`${index + 1}`, 4)}  ${chalk.bold.green(
              padstr(type, 8),
            )}   ${chalk.green(message)}\n`;
          } else if (type === Log.ERROR) {
            line = `${padstr(`${index + 1}`, 4)}  ${chalk.bold.red(
              padstr(type, 8),
            )}   ${chalk.red(message)}\n`;
          } else {
            line = `${padstr(`${index + 1}`, 4)}  ${chalk.bold.yellow(
              padstr(type, 8),
            )}   ${chalk.yellow(message)}\n`;
          }
          return accumulator + line;
        },
        '',
      );
      return `Electives calculated ${log}`;
    }
    default:
      throw new Error('No valid args passed');
  }
}

async function main(): Promise<void> {
  try {
    const message = await command();
    console.log(chalk.green('Success:'), message);
  } catch (err) {
    console.log(chalk.red(err.stack.slice(0, 6)), err.stack.slice(6));
  } finally {
    mongoose.connection.close();
  }
}

main();
