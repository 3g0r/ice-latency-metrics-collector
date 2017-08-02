## Simple Example

### statsdConfiguration.ts
```typescript
import {
  StatsdClientOptions,
  StatsdConfigurator
} from "ice-latency-metrics-collector";

import rootLogger from "./rootLogger"; // ice-node-bunyan logger for example

const moduleLogger = rootLogger.child({module: 'statsd'});

const isStatsdEnabled = (): boolean =>
  process.env.STATSD_ENABLED === 'true';

const getStatsdConfiguration = (): StatsdClientOptions =>
  isStatsdEnabled()
    ? {
        prefix: 'MyServant',
        host: process.env.STATSD_HOST,
        // 8125 is default statsd port
        port: process.env.STATSD_PORT || 8125,
        // 512 is default statsd max udp size
        maxudpsize: process.env.STATSD_MAX_UDP_SIZE || 512,
        // by default statsd will not be use ipv6
        ipv6: process.env.STATSD_IPV6 == 'true',
      }
    : {};

export const statsdConfigurator: StatsdConfigurator = {
  isStatsdEnabled,
  getStatsdConfiguration,
  getLogger: () => moduleLogger,
};
```

### servant.ts
```typescript
import {Ice} from "ice";
import {getClient, StatsdClient} from "ice-latency-metrics-collector";

import {SliceNamespace} from "./slices";
import rootLogger from "./rootLogger";
import {statsdConfigurator} from "./statsdConfiguration";


const logger = rootLogger.child({module: 'Service'}, true);


export default class Service extends SliceNamespace.Service {
  @operation()
  async getFun(current: Ice.Current): Promise<void> {
      /**
      * some logic
      */
      if (statsdConfigurator.isStatsdEnabled()) {
        const statsd: StatsdClient = getClient();
        statsd.set('other-metric', 42);
      } 
  }
}

```

## API

```typescript
interface StatsdClientOptions {
  /**
   * Prefix all stats with this value (default "").
   */
  prefix?: string;
  
  /**
   * Print what is being sent to stderr (default false).
   */
  debug?: boolean;
  
  /**
   * User specifically wants to use tcp (default false)
   */
  tcp?: boolean;
  
  /**
   * Dual-use timer. Will flush metrics every interval. For UDP,
   * it auto-closes the socket after this long without activity
   * (default 1000 ms; 0 disables this). For TCP, it auto-closes
   * the socket after socketTimeoutsToClose number of timeouts
   * have elapsed without activity.
   */
  socketTimeout?: number;
  
  
  
  /*************
   * TCP Options
   ************/
  /**
   * Where to send the stats (default localhost).
   */
  host?: string;

  /**
   * Port to contact the statsd-daemon on (default 8125).
   */
  port?: number;

  /**
   * Number of timeouts in which the socket auto-closes if it
   * has been inactive. (default 10; 1 to auto-close after a
   * single timeout).
   */
  socketTimeoutsToClose: number;
  
  
  
  /*************
   * UDP Options
   ************/
   /**
    * Where to send the stats (default localhost).
    */
   host?: string;

   /**
    * Port to contact the statsd-daemon on (default 8125).
    */
   port?: number;
   
   
   /**************
    * HTTP Options
    *************/
   /**
    * Where to send the stats (default localhost).
    */
   host?: string;

   /**
    * Additional headers to send (default {}).
    */
   headers?: { [index: string]: string };

   /**
    * What HTTP method to use (default "PUT").
    */
   method?: string;
}
```
```typescript
class StatsdClient {
  constructor(options: StatsdClientOptions);

  counter(metric: string, delta: number): void;

  increment(metric: string, delta?: number): void;

  decrement(metric: string, delta?: number): void;

  gauge(name: string, value: number): void;

  gaugeDelta(name: string, delta: number): void;

  set(name: string, value: number): void;

  timing(name: string, start: Date): void;
  timing(name: string, duration: number): void;

  close(): void;

  getChildClient(name: string): StatsdClient;
}
```
```typescript
interface StatsdConfigurator {
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
```
```typescript
/**
 * Helper for create or get cached by configuration StatsdClient instance.
 */
function getClient(options: StatsdClientOptions): StatsdClient;
```
```typescript
interface Prototype {
    constructor: {
        name: string;
    };
}
type F0<R> = () => R;
type F1<P, R> = (p: P) => R;
type F2<P, P1, R> = (p: P, p1: P1) => R;
type F3<P, P1, P2, R> = (p: P, p1: P1, p2: P2) => R;
type F4<P, P1, P2, P3, R> = (p: P, p1: P1, p2: P2, p3: P3) => R;
type F5<P, P1, P2, P3, P4, R> = (p: P, p1: P1, p2: P2, p3: P3, p4: P4) => R;
type F6<P, P1, P2, P3, P4, P5, R> = (p: P, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5) => R;
type F7<P, P1, P2, P3, P4, P5, P6, R> = (p: P, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => R;
interface ParametrizePropertyDescriptor<T> extends PropertyDescriptor {
    value?: T;
}
/**
 * Decorator for servant method
 * make a StatsdClient.timing(`ServantName.method`, timer) call after
 * original call of servant method be completed
 */
function operationWithLatencyMetrics(configurator: StatsdConfigurator):
  (prototype: any, key: string, descriptor: PropertyDescriptor) => {
     <R>(prototype: Prototype, key: string, descriptor: ParametrizePropertyDescriptor<F0<R>>): ParametrizePropertyDescriptor<F0<R>>;
     <P, R>(prototype: Prototype, key: string, descriptor: ParametrizePropertyDescriptor<F1<P, R>>): ParametrizePropertyDescriptor<F1<P, R>>;
     <P, P1, R>(prototype: Prototype, key: string, descriptor: ParametrizePropertyDescriptor<F2<P, P1, R>>): ParametrizePropertyDescriptor<F2<P, P1, R>>;
     <P, P1, P2, R>(prototype: Prototype, key: string, descriptor: ParametrizePropertyDescriptor<F3<P, P1, P2, R>>): ParametrizePropertyDescriptor<F3<P, P1, P2, R>>;
     <P, P1, P2, P3, R>(prototype: Prototype, key: string, descriptor: ParametrizePropertyDescriptor<F4<P, P1, P2, P3, R>>): ParametrizePropertyDescriptor<F4<P, P1, P2, P3, R>>;
     <P, P1, P2, P3, P4, R>(prototype: Prototype, key: string, descriptor: ParametrizePropertyDescriptor<F5<P, P1, P2, P3, P4, R>>): ParametrizePropertyDescriptor<F5<P, P1, P2, P3, P4, R>>;
     <P, P1, P2, P3, P4, P5, R>(prototype: Prototype, key: string, descriptor: ParametrizePropertyDescriptor<F6<P, P1, P2, P3, P4, P5, R>>): ParametrizePropertyDescriptor<F6<P, P1, P2, P3, P4, P5, R>>;
     <P, P1, P2, P3, P4, P5, P6, R>(prototype: Prototype, key: string, descriptor: ParametrizePropertyDescriptor<F7<P, P1, P2, P3, P4, P5, P6, R>>): ParametrizePropertyDescriptor<F7<P, P1, P2, P3, P4, P5, P6, R>>;
  };
```
```typescript
/**
 * Decorator for servant class
 * apply operationWithLatencyMetrics to all own operations of servant 
 */
function servantWithLatencyMetrics(configurator: StatsdConfigurator): <T>(target: T) => T;
```
