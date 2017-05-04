ZerocIce latency metrics collector
==================================

Simple Example
^^^^^^^^^^^^^^

.. code:: python

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

Statsd configuration
^^^^^^^^^^^^^^^^^^^^

``config`` param in factory will be passed to `StatsClient
constructor <http://statsd.readthedocs.io/en/v3.2.1/configure.html>`__

.. code:: python

    latency_metrics_factory(enabled=True, config=dict(host='statsd'))

Logging configuration
^^^^^^^^^^^^^^^^^^^^^

You need to apply standard python logging configuration before decorator usage.

Disable or enable
^^^^^^^^^^^^^^^^^

Example with env

.. code:: python

    import os

    METRICS_ENABLED = os.environ.get('METRICS_ENABLED', 'false').lower() == 'true'

    latency_metrics_factory(enabled=METRICS_ENABLED)

