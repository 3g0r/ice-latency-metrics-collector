import {Ice} from 'ice';
import * as Statsd from 'statsd-client';
import {LatencyCollectorConfig} from './functionWrapper';
import {servantWithLatencyMetrics} from './servantWrapper';
import {defaultLogger} from './logger';

export const adapterWithLatencyMetrics = (
  config: LatencyCollectorConfig,
  adapter: Ice.ObjectAdapter,
): Ice.ObjectAdapter => {
  if (config instanceof Statsd) {
    config = {client: config};
  }
  
  const logger = config.logger
      ? config.logger
      : defaultLogger;
  const servantDecorator = servantWithLatencyMetrics(config);
  const originAdd = adapter.addFacet;
  logger.trace('Wrap adapter.addFacet');
  adapter.addFacet = function addFacet (
    servant: Ice.Object,
    id: Ice.Identity,
    facet: string,
  ): Ice.ObjectPrx {
    return originAdd.call(this, servantDecorator(servant), id, facet);
  };
  
  const originAddDefaultServant = adapter.addDefaultServant;
  logger.trace('Wrap adapter.addDefaultServant');
  adapter.addDefaultServant = function addDefaultServant (
    servant: Ice.Object,
    category: string,
  ): void {
    originAddDefaultServant.call(this, servantDecorator(servant), category);
  };
  return adapter;
};