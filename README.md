# ZerocIce latency metrics collector

#### Simple Example
```python
from ice_latency_metrics_collector import latency_metrics_factory

import MyIceModule


with_latency_metrics = latency_metrics_factory(enabled=True)


@with_latency_metrics
class MyServant(MyIceModule.MyServant):

  # This method send timings to statsd 
  def my_proxyed_method(self):
    # your implementation
    pass
    
  # This method don't send timings to statsd
  def my_custom_internal_method(self):
    # your implementation
    pass
```

#### Statsd Configuration

`config` param in factory will be passed to [StatsClient constructor](http://statsd.readthedocs.io/en/v3.2.1/configure.html)
```python
latency_metrics_factory(enabled=True, config=dict(host='statsd'))
```

#### Logging configuration
You need to use standard python logging configuration file.
```python
latency_metrics_factory(enabled=True, logging_conf_path=your_logging_conf_path)
```

#### Disable or enable
Example with env
```python
import os

METRICS_ENABLED = os.environ.get('METRICS_ENABLED', 'false').lower() == 'true'

latency_metrics_factory(enabled=METRICS_ENABLED)
```
