from setuptools import find_packages, setup

setup(
    name='ice_latency_metrics_collector',
    version='0.1.0',
    description='ZerocIce latency metrics collector',
    author='3g0r',
    author_email='eg0r.n1k0l43v@gmail.com',
    url='https://github.com/3g0r/ice-latency-metrics-collector',
    keywords=['ice', 'latency', 'statsd', 'zeroc'],
    classifiers=[],
    long_description=open('README.md').read(),
    license='MIT',
    packages=find_packages(),
    include_package_data=True,
    package_data={'': ['README.md']},
)
