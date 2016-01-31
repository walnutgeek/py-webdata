from setuptools import setup, find_packages
import json
import os


def file(n):
  return os.path.join(os.path.dirname(__file__), n)


pkg = json.load(open(file('package.json')))

rc=''
try:
  num = open(file('rc.txt')).read()
  num = int(num)+1 if num else 1
  open(file('rc.txt'),'w').write('%d'%num)
  rc = 'rc%d' % num
except:
  pass

setup(
  name = 'webdata',
  packages = ['webdata'],
  version = pkg['version']+rc,
  description = pkg['description'],
  author = 'Walnut Geek',
  author_email = 'wg@walnutgeek.com',
  url = 'https://github.com/walnutgeek/py-webdata',
  keywords = pkg['keywords'],
  install_requires=['tornado'],
  tests_require=['nose'],
  entry_points={
    'console_scripts': [
        'webdata = webdata.app:main',
    ],
  },
  license='MIT',
  package_data = { '': ['app/*'] },
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