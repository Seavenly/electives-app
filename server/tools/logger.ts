export enum Log {
  Info = 'INFO',
  Grade = 'GRADE',
  Filled = 'FILLED',
  Semi = 'SEMI',
  Full = 'FULL',
  Limit = 'LIMIT',
  TCCFull = 'TCC-FULL',
  Success = 'SUCCESS',
  Remove = 'REMOVE',
  Head = 'HEAD',
  Error = 'ERROR',
}

class Logger {
  private logs: [string, string][];
  private errors: string[];

  constructor() {
    this.logs = [];
    this.errors = [];
  }

  /** Send a message to log */
  public log(type: Log = Log.Info, message: string): void {
    this.logs.push([type, message]);
    if (type === 'ERROR') {
      this.errors.push(message);
    }
  }

  /** Return the current log */
  public getLog(): [string, string][] {
    return this.logs;
  }

  /** Return all recorded errors from the log */
  public getErrors(): string[] {
    return this.errors;
  }

  /** Send an error message to the log */
  public error(message: string): void {
    this.log(Log.Error, message);
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
