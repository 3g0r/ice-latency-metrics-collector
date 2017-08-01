from ice_latency_metrics_collector.src import latency_metrics_factory

VERSION = (0, 1, 0)
__version__ = '.'.join(map(str, VERSION))
__all__ = ['latency_metrics_factory']
