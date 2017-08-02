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

export interface Prototype {
  constructor: {
    name: string;
  };
}

export type F0<R> = () => R;
export type F1<P, R> = (p: P) => R;
export type F2<P, P1, R> = (p: P, p1: P1) => R;
export type F3<P, P1, P2, R> = (p: P, p1: P1, p2: P2) => R;
export type F4<P, P1, P2, P3, R> = (p: P, p1: P1, p2: P2, p3: P3) => R;
export type F5<P, P1, P2, P3, P4, R> =
  (p: P, p1: P1, p2: P2, p3: P3, p4: P4) => R;
export type F6<P, P1, P2, P3, P4, P5, R> =
  (p: P, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5) => R;
export type F7<P, P1, P2, P3, P4, P5, P6, R> =
  (p: P, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => R;

export interface ParametrizePropertyDescriptor<T> extends PropertyDescriptor {
  value?: T;
}

export const operationWithLatencyMetrics = (
  configurator: StatsdConfigurator,
  metric: string = '',
) => {
  function decorator<R>(
    prototype: Prototype,
    metric: string,
    descriptor: ParametrizePropertyDescriptor<F0<R>>
  ): ParametrizePropertyDescriptor<F0<R>>;
  function decorator<P, R>(
    prototype: Prototype,
    metric: string,
    descriptor: ParametrizePropertyDescriptor<F1<P, R>>
  ): ParametrizePropertyDescriptor<F1<P, R>>;
  function decorator<P, P1, R>(
    prototype: Prototype,
    metric: string,
    descriptor: ParametrizePropertyDescriptor<F2<P, P1, R>>
  ): ParametrizePropertyDescriptor<F2<P, P1, R>>;
  function decorator<P, P1, P2, R>(
    prototype: Prototype,
    metric: string,
    descriptor: ParametrizePropertyDescriptor<F3<P, P1, P2, R>>
  ): ParametrizePropertyDescriptor<F3<P, P1, P2, R>>;
  function decorator<P, P1, P2, P3, R>(
    prototype: Prototype,
    metric: string,
    descriptor: ParametrizePropertyDescriptor<F4<P, P1, P2, P3, R>>
  ): ParametrizePropertyDescriptor<F4<P, P1, P2, P3, R>>;
  function decorator<P, P1, P2, P3, P4, R>(
    prototype: Prototype,
    metric: string,
    descriptor: ParametrizePropertyDescriptor<F5<P, P1, P2, P3, P4, R>>
  ): ParametrizePropertyDescriptor<F5<P, P1, P2, P3, P4, R>>;
  function decorator<P, P1, P2, P3, P4, P5, R>(
    prototype: Prototype,
    metric: string,
    descriptor: ParametrizePropertyDescriptor<F6<P, P1, P2, P3, P4, P5, R>>
  ): ParametrizePropertyDescriptor<F6<P, P1, P2, P3, P4, P5, R>>;
  function decorator<P, P1, P2, P3, P4, P5, P6, R>(
    prototype: Prototype,
    metric: string,
    descriptor: ParametrizePropertyDescriptor<F7<P, P1, P2, P3, P4, P5, P6, R>>
  ): ParametrizePropertyDescriptor<F7<P, P1, P2, P3, P4, P5, P6, R>>;
  function decorator<R>(
    target: F0<R>,
  ): F0<R>;
  function decorator<P, R>(
    target: F1<P, R>,
  ): F1<P, R>;
  function decorator<P, P1, R>(
    target: F2<P, P1, R>,
  ): F2<P, P1, R>;
  function decorator<P, P1, P2, R>(
    target: F3<P, P1, P2, R>,
  ): F3<P, P1, P2, R>;
  function decorator<P, P1, P2, P3, R>(
    target: F4<P, P1, P2, P3, R>,
  ): F4<P, P1, P2, P3, R>;
  function decorator<P, P1, P2, P3, P4, R>(
    target: F5<P, P1, P2, P3, P4, R>,
  ): F5<P, P1, P2, P3, P4, R>;
  function decorator<P, P1, P2, P3, P4, P5, R>(
    target: F6<P, P1, P2, P3, P4, P5, R>,
  ): F6<P, P1, P2, P3, P4, P5, R>;
  function decorator<P, P1, P2, P3, P4, P5, P6, R>(
    target: F7<P, P1, P2, P3, P4, P5, P6, R>,
  ): F7<P, P1, P2, P3, P4, P5, P6, R>;
  function decorator(...args: any[]) {
    const metricName = args.length === 3
      ? `${args[0].constructor.name}.${args[1]}`
      : metric;
    const target = args.length === 3
      ? args[2].value
      : args[0];

    if (typeof target !== 'function') {
      throw new Error(
        (args.length === 3
        ? 'descriptor.value'
        : 'target') + ` for '${metricName}' must be a function.`
      );
    }

    const logger = configurator.getLogger
      ? configurator.getLogger()
      : defaultLogger;
    const collectLatency = ([timer]: any[]) => {
      logger.trace('Send timing to statsd', {metricName, timer});
      getClient(configurator.getStatsdConfiguration())
        .timing(metricName, timer);
    };
    let wrapped;
    if (args.length === 3 && args[1].endsWith('_async')) {
      wrapped = function (...args: any[]): any {
        const [callback, ...rest] = args;
        if (configurator.isStatsdEnabled() === false) {
          return target.apply(this, args);
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
        return target.apply(this, [callback, ...rest]);
      };
    } else {
      wrapped = function (...args: any[]): any {
        if (configurator.isStatsdEnabled() === false) {
          return target.apply(this, args);
        }
        const timer = new Date();
        const result = target.apply(this, args);
        Promise
          .all([timer, result])
          .then(collectLatency)
          .catch(collectLatency);
        return result;
      };
    }

    return args.length === 3
      ? {...args[2], value: wrapped}
      : wrapped;
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
