import * as Statsd from 'statsd-client';

import {defaultLogger} from "./logger";
import {
  F0, F1, F2, F3, F4, F5, F6, F7,
  functionWithLatencyMetrics,
  LatencyCollectorConfig,
} from "./functionWrapper";

export interface Prototype {
  constructor: {
    name: string;
  };
}

export interface ParameterizedPropertyDescriptor<T> extends PropertyDescriptor {
  value?: T;
}

export interface MetricOptions {
  prefix?: string;
  name?: string;
  useClassNameAsPrefix?: boolean;
};

export const operationWithLatencyMetrics = (
  config: LatencyCollectorConfig,
  metricName?: string,
) => {
  function decorator<R>(
    prototype: Prototype,
    metric: string,
    descriptor: ParameterizedPropertyDescriptor<F0<R>>
  ): ParameterizedPropertyDescriptor<F0<R>>;
  function decorator<P, R>(
    prototype: Prototype,
    metric: string,
    descriptor: ParameterizedPropertyDescriptor<F1<P, R>>
  ): ParameterizedPropertyDescriptor<F1<P, R>>;
  function decorator<P, P1, R>(
    prototype: Prototype,
    metric: string,
    descriptor: ParameterizedPropertyDescriptor<F2<P, P1, R>>
  ): ParameterizedPropertyDescriptor<F2<P, P1, R>>;
  function decorator<P, P1, P2, R>(
    prototype: Prototype,
    metric: string,
    descriptor: ParameterizedPropertyDescriptor<F3<P, P1, P2, R>>
  ): ParameterizedPropertyDescriptor<F3<P, P1, P2, R>>;
  function decorator<P, P1, P2, P3, R>(
    prototype: Prototype,
    metric: string,
    descriptor: ParameterizedPropertyDescriptor<F4<P, P1, P2, P3, R>>
  ): ParameterizedPropertyDescriptor<F4<P, P1, P2, P3, R>>;
  function decorator<P, P1, P2, P3, P4, R>(
    prototype: Prototype,
    metric: string,
    descriptor: ParameterizedPropertyDescriptor<F5<P, P1, P2, P3, P4, R>>
  ): ParameterizedPropertyDescriptor<F5<P, P1, P2, P3, P4, R>>;
  function decorator<P, P1, P2, P3, P4, P5, R>(
    prototype: Prototype,
    metric: string,
    descriptor: ParameterizedPropertyDescriptor<F6<P, P1, P2, P3, P4, P5, R>>
  ): ParameterizedPropertyDescriptor<F6<P, P1, P2, P3, P4, P5, R>>;
  function decorator<P, P1, P2, P3, P4, P5, P6, R>(
    prototype: Prototype,
    metric: string,
    descriptor: ParameterizedPropertyDescriptor<
      F7<P, P1, P2, P3, P4, P5, P6, R>>
  ): ParameterizedPropertyDescriptor<F7<P, P1, P2, P3, P4, P5, P6, R>>;
  function decorator(
    prototype: Prototype,
    operationName: string,
    descriptor: ParameterizedPropertyDescriptor<Function>,
  ): ParameterizedPropertyDescriptor<Function> {
    if (config instanceof Statsd) {
      config = {client: config};
    }
    const logger = (config.logger
      ? config.logger
      : defaultLogger
    ).child({operationName});

    if (descriptor.value === undefined) {
      logger.trace('descriptor.value is undefined');
      throw new Error('descriptor.value is undefined');
    }

    logger.trace('Decorate operation');
    
    const decorated = {
      ...descriptor,
      value: functionWithLatencyMetrics({
          ...config,
          logger,
        },
        `${prototype.constructor.name}.${metricName || operationName}`,
      )(descriptor.value as any),
    };

    Object.defineProperty(
      prototype,
      operationName,
      decorated,
    );
    return decorated;
  }
  return decorator;
};
