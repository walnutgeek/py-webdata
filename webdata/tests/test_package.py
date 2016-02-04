from __future__ import print_function
from nose.tools import eq_,with_setup
import webdata.app as app

def setup_func():
    "set up test fixtures"

def teardown_func():
    "tear down test fixtures"

@with_setup(setup_func, teardown_func)
def test():
    "   "

def test_args_parser():
    p = app._args_parser()
    def _test(expected, input):
        eq_("Namespace(" + expected + ")",
            str(p.parse_args(input.split())))

    _test("dir=u'.', port=7532, shutdown=True", '--shutdown')
    _test("dir=u'.', port=7654, shutdown=False", '--port 7654')
    _test("dir=u'.', port=7654, shutdown=True", '--port 7654 --shutdown')
    _test("dir='abc', port=7654, shutdown=False", '--dir abc --port 7654')



from webdata import Mount,File

def test_mount():
    mount = Mount()
    mount.file('web')
    eq_(mount.file('web').type(), 'dir')
    #print(mount.file('webdata').render())
    #eq_(True,False)