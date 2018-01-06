import {defaultLogger} from "./logger";
import {LatencyConfig} from "./functionWrapper";
import {operationWithLatencyMetrics} from "./operationWrapper";

function getOpTable(servantType: any) {
  return {[Symbol.iterator]: function* getOpTable() {
    let ops = {};
    while (servantType != null) {
      ops = {
        ...ops,
        ...servantType._iceOps.raw,
        ...getOpTableFromInterfaces(servantType.__implements || []),
      };

      servantType = servantType.__parent;
    }
    for (const methodName of Object.keys(ops)) {
      yield methodName;
      yield `${methodName}_async`;
    }
  }};
}

function getOpTableFromInterfaces(interfaces: any[]) {
  let ops = {};
  for (const interface_ of interfaces) {
    ops = {...ops, ...interface_._iceOps.raw};
  }
  return ops;
}

export const servantWithLatencyMetrics = (
  config: LatencyConfig,
) => {
  return function decorator<T>(target: T): T {
    let type: {new (): T};
    let prototype: Object;
    if (typeof target === 'function') {
      type = target;
      prototype = (target as any).prototype;
    } else {
      type = target.constructor as {new (): T};
      prototype = Object.getPrototypeOf(target);
    }
    
    const logger = (config.logger
      ? config.logger
      : defaultLogger
    ).child({servant: type.name}, true);
      
    const opDecorator = operationWithLatencyMetrics({
      ...config,
      logger,
    });
    
    logger.trace('Decorate servant');

    for (const methodName of getOpTable(type)) {
      logger.trace({methodName}, 'Found in operation table');
      const descriptor = Object.getOwnPropertyDescriptor(
        prototype,
        methodName,
      );
      if (descriptor === undefined) {
        logger.trace(
          {methodName},
          'Not found in prototype');
        continue;
      }
      opDecorator(prototype, methodName, descriptor);
    }
    return target;
  };
};
