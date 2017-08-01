///<reference path="../custom_typings/statsd-client.d.ts"/>
import * as Statsd from "statsd-client";
import {
  CommonOptions,
  TcpOptions,
  HttpOptions,
  UdpOptions,
} from "statsd-client";

const defaultLogger = {
  trace(...args: any[]): void {},
  debug(...args: any[]): void {},
  info(...args: any[]): void {},
  warn(...args: any[]): void {},
  error(...args: any[]): void {},
  fatal(...args: any[]): void {},
};

export type StatsdClientOptions =
  CommonOptions & (TcpOptions | UdpOptions | HttpOptions);
export type StatsdClient = Statsd

function getOpTable(servantType: any) {
  return function *() {
    let ops = {};
    while (servantType != null) {
      ops = {
        ...ops,
        ...servantType.__ops.raw,
        ...getOpTableFromInterfaces(servantType.__implements || []),
      };

      servantType = servantType.__parent;
    }
    for (const methodName of Object.keys(ops)) {
      yield methodName;
      yield `${methodName}_async`;
    }
  };
}

function getOpTableFromInterfaces(interfaces: any[]) {
  let ops = {};
  for (const interface_ of interfaces) {
    ops = {...ops, ...interface_.__ops.raw};
  }
  return ops;
}

export interface StatsdConfigurator {
  isStatsdEnabled(): boolean;
  getStatsdConfiguration(): StatsdClientOptions;
  getLogger?: () => {
    trace(...args: any[]): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    fatal(...args: any[]): void;
  };
}

export const getClient = (() => {
  let currentOptions: StatsdClientOptions = {};
  let client: StatsdClient;

  function isEqArray (v: any, i: any) {
    return v === this[i];
  }

  const isEq = (prev: any, current: any) => {
    const prevKeys = Object.keys(prev);
    const currentKeys = Object.keys(current);
    if (prevKeys.length !== currentKeys.length) {
      return false;
    }

    if (!prevKeys.every(isEqArray, currentKeys)) {
      return false;
    }

    if (!!prev.headers && !isEq(prev.headers, current.headers)) {
      return false;
    }

    for (const key of prevKeys) {
      if (key === 'headers') {
        continue;
      }
      if ((prev as any)[key] !== (current as any)[key]) {
        return false;
      }
    }
    return true;
  };

  return (options: StatsdClientOptions): StatsdClient => {
    if (isEq(currentOptions, options)) {
      return client;
    }
    client = new Statsd(options);
    return client;
  };
})();

export const operationWithLatencyMetrics = (
  configurator: StatsdConfigurator
) => {
  function decorator(prototype: any, key: string,
                     descriptor: PropertyDescriptor) {
    const tag = `${prototype.constructor.name}.${key}`;
    const logger = configurator.getLogger
      ? configurator.getLogger()
      : defaultLogger;
    const collectLatency = ([timer]: any[]) => {
      logger.trace('Send timing to statsd', {tag, timer});
      getClient(configurator.getStatsdConfiguration())
        .timing(tag, timer);
    };
    const method: (...args: any[]) => any = descriptor.value;
    if (key.endsWith('_async')) {
      return {
        ...descriptor,
        value: function (callback: {
                           ice_response: (...args: any[]) => any,
                           ice_exception: (...args: any[]) => any
                         },
                         ...args: any[]): any {
          if (configurator.isStatsdEnabled() === false) {
            return method.apply(this, [callback, ...args]);
          }
          const timer = new Date();
          const {ice_response, ice_exception} = callback;
          callback.ice_response = function (...args: any[]) {
            const result = ice_response.apply(this, args);
            collectLatency([timer]);
            return result;
          };
          callback.ice_exception = function (...args: any[]) {
            const result = ice_exception.apply(this, args);
            collectLatency([timer]);
            return result;
          };
          return method.apply(this, [callback, ...args]);
        },
      };
    } else {
      return {
        ...descriptor,
        value: function (...args: any[]): any {
          if (configurator.isStatsdEnabled() === false) {
            return method.apply(this, args);
          }
          const timer = new Date();
          const result = method.apply(this, args);
          Promise
            .all([timer, result])
            .then(collectLatency)
            .catch(collectLatency);
          return result;
        },
      };
    }
  }
  return decorator;
};

export const servantWithLatencyMetrics = (
  configurator: StatsdConfigurator,
) => {
  return function decorator<T>(target: T): T {
    const opDecorator = operationWithLatencyMetrics(configurator);
    let type: {new (): T};
    let prototype: Object;
    if (typeof target === 'function') {
      type = target;
      prototype = (target as any).prototype;
    } else {
      type = target.constructor as {new (): T};
      prototype = Object.getPrototypeOf(target);
    }

    for (const methodName of {[Symbol.iterator]: getOpTable(type)}) {
      const descriptor = Object.getOwnPropertyDescriptor(
        prototype,
        methodName,
      );
      if (descriptor === undefined) {
        continue;
      }
      Object.defineProperty(
        prototype,
        methodName,
        opDecorator(prototype, methodName, descriptor),
      );
    }
    return target;
  };
};
