from setuptools import find_packages, setup

setup(
    name='ice-latency-metrics-collector',
    packages=['ice_latency_metrics_collector'],
    version='0.1.0-alpha.9',
    description='ZerocIce latency metrics collector',
    author='3g0r',
    author_email='eg0r.n1k0l43v@gmail.com',
    url='https://github.com/3g0r/ice-latency-metrics-collector',
    keywords=['ice', 'latency', 'statsd', 'zeroc'],
    classifiers=[],
    long_description=open('README.rst').read(),
    license='MIT',
    install_requires=[
        'statsd==3.2.1',
    ],
    include_package_data=True,
    package_data={'': ['README.rst']},
)
