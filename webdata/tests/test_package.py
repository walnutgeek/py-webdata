from __future__ import print_function
from nose.tools import eq_,with_setup

def setup_func():
    "set up test fixtures"

def teardown_func():
    "tear down test fixtures"

@with_setup(setup_func, teardown_func)
def test():
    "test ..."

from webdata import Mount,File

def test_mount():
    mount = Mount()
    mount.file('web')
    eq_(mount.file('web').type(), 'dir')
    #print(mount.file('webdata').render())
    #eq_(True,False)