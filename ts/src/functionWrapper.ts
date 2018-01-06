///<reference path="../custom_typings/statsd-client.d.ts"/>
import * as Statsd from "statsd-client";
import {
  CommonOptions,
  TcpOptions,
  HttpOptions,
  UdpOptions,
} from "statsd-client";

import {Logger, defaultLogger} from "./logger";

export type StatsdClientOptions =
  CommonOptions & (TcpOptions | UdpOptions | HttpOptions);
export type StatsdClient = Statsd

export interface LatencyConfig {
  isEnabled: boolean;
  client: StatsdClientOptions;
  logger?: Logger;
}

/**
 * idempotent by link to options
 */
export const getClient = (() => {
  const clients = new Map<StatsdClientOptions, StatsdClient>();

  return (options: StatsdClientOptions): StatsdClient => {
    if (clients.has(options)) {
      return clients.get(options)!;
    }
    const client = new Statsd(options);
    clients.set(options, client);
    return client;
  };
})();

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

const collectLatency = ([clientConfig, logger, metricName, timer]: any[]) => {
  getClient(clientConfig)
    .timing(metricName, timer);
  logger.trace({
    timer,
    statsdConfiguration: clientConfig,
  }, 'Send timing to statsd');
};

export const functionWithLatencyMetrics = (
  config: LatencyConfig,
  metricName?: string,
) => {
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
  function decorator(target: Function) {
    const logger = (config.logger
      ? config.logger
      : defaultLogger
    ).child({metricName});

    if (typeof target !== 'function') {
      const message = 'Decoration target is not a function';
      logger.error(message);
      throw new Error(message);
    }
    metricName = metricName || target.name;

    logger.trace('Decorate function');

    function wrapped (...args: any[]): any {
      logger.trace('Started');
      if (config.isEnabled === false) {
        logger.trace('Statsd disabled');
        return target.apply(this, args);
      }
      const timer = new Date();
      const result = target.apply(this, args);
      Promise
        .all([config.client, logger, metricName, timer, result])
        .then(collectLatency)
        .catch(collectLatency);
      return result;
    };

    return wrapped;
  }
  return decorator;
};
