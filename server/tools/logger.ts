export const enum Log {
  INFO = 'INFO',
  GRADE = 'GRADE',
  FILLED = 'FILLED',
  SEMI = 'SEMI',
  FULL = 'FULL',
  LIMIT = 'LIMIT',
  TCC_FULL = 'TCC_FULL',
  SUCCESS = 'SUCCESS',
  REMOVE = 'REMOVE',
  HEAD = 'HEAD',
  ERROR = 'ERROR',
  TEXT = 'TEXT',
}

export type Logs = [string, string][];
export type Errors = string[];

class Logger {
  private logs: Logs;
  private errors: Errors;

  constructor() {
    this.logs = [];
    this.errors = [];
  }

  /** Send a message to log */
  public log(type: Log = Log.INFO, message: string): void {
    this.logs.push([type, message]);
    if (type === 'ERROR') {
      this.errors.push(message);
    }
  }

  /** Return the current log */
  public getLog(): Logs {
    return this.logs;
  }

  /** Return all recorded errors from the log */
  public getErrors(): Errors {
    return this.errors;
  }

  /** Send an error message to the log */
  public error(message: string): void {
    this.log(Log.ERROR, message);
  }

  /** Clear the log */
  public clear(): boolean {
    this.logs.length = 0;
    this.errors.length = 0;
    return true;
  }
}

const logger = new Logger();
export default logger;
