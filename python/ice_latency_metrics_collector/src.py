from typing import Optional, Callable, Union, Dict, Any
import inspect
import logging
from functools import wraps
import time

from statsd import StatsClient


MAX_RETRY_ATTEMPTS_COUNT = 3
RETRY_INTERVAL_IN_SECONDS = 2
MILLISECONDS_IN_SECOND = 1000.0

logger = logging.getLogger('ice_latency_metrics_collector')


def predicate(obj):
    return inspect.isfunction(obj) and not (obj.__name__.startswith('ice_') or
                                            obj.__name__.startswith('_'))


def get_statsd_client(**config: Union[str, int]) -> Optional[StatsClient]:
    for i in range(MAX_RETRY_ATTEMPTS_COUNT):
        try:
            return StatsClient(**config)
        # FIXME: here should be bases for all exceptions
        # FIXME: potentially raised by `StatsClient` class's initializer
        except:
            logger.warning(f'Statsd client error', exc_info=True)
            time.sleep(RETRY_INTERVAL_IN_SECONDS)


def with_latency_metrics(cls, statsd_config: Dict[str, Any]):
    def timer(method: Callable) -> Callable:
        @wraps(method)
        def wrapped(*args, **kwargs):
            start_time = time.time()
            try:
                result = method(*args, **kwargs)
            finally:
                elapsed_time_ms = (MILLISECONDS_IN_SECOND *
                                   (time.time() - start_time))
                statsd.timing(method.__name__, elapsed_time_ms)
            return result

        return wrapped

    prefix = cls.__name__
    logger.info(f'Enable latency collection for service "{prefix}"')

    base_servant_class = cls.__bases__[0]
    ice_servant_methods = inspect.getmembers(base_servant_class,
                                             predicate=predicate)

    statsd = get_statsd_client(**statsd_config, prefix=prefix)

    if statsd is None:
        return cls

    for method_name, method in ice_servant_methods:
        setattr(cls, method_name, timer(getattr(cls, method_name)))
    return cls


def latency_metrics_factory(*,
                            enabled: bool,
                            config: Dict[str, Any] = None) -> Callable:
    def decorator(cls):
        if enabled:
            return with_latency_metrics(cls, config)
        else:
            return cls

    return decorator
