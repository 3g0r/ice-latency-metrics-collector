export interface LogFn {
  (context: object, message: string): void;
  (message: string): void;
}

export interface Logger {
  trace: LogFn;
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
  fatal: LogFn;

  child(context: object, week?: boolean): Logger;
}

export const defaultLogger = {
  trace(...args: any[]): void {},
  debug(...args: any[]): void {},
  info(...args: any[]): void {},
  warn(...args: any[]): void {},
  error(...args: any[]): void {},
  fatal(...args: any[]): void {},
  child(...args: any[]): Logger {
    return defaultLogger;
  },
};