from distutils.core import setup
setup(
  name = 'webdata',
  packages = ['webdata'],
  version = '0.1',
  description = 'Publish data on web',
  author = 'Walnut Geek',
  author_email = 'wg@walnutgeek.com',
  url = 'https://github.com/walnutgeek/py-webdata',
  keywords = ['dataframe', 'dataset', 'pandas', 'SAS', 'R' ],
  license='MIT',
  package_data = {
      '': ['app/*', 'app/*/*']
  },
  classifiers=[
    # How mature is this project? Common values are
    #   3 - Alpha
    #   4 - Beta
    #   5 - Production/Stable
    'Development Status :: 3 - Alpha',

    # Indicate who your project is intended for
    'Intended Audience :: Developers',

    # Pick your license as you wish (should match "license" above)
     'License :: OSI Approved :: MIT License',

    # Specify the Python versions you support here. In particular, ensure
    # that you indicate whether you support Python 2, Python 3 or both.
    'Programming Language :: Python :: 2',
    'Programming Language :: Python :: 2.7',
    'Programming Language :: Python :: 3',
    'Programming Language :: Python :: 3.4',
    'Programming Language :: Python :: 3.5',
],)