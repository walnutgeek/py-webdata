from __future__ import print_function
from nose.tools import eq_,with_setup
import webdata.app as app


def test_args_parser():
    p = app._args_parser()
    def _test(dir_,port,shut, input):
        a= p.parse_args(input.split())
        eq_(dir_,a.dir)
        eq_(port,a.port)
        eq_(shut,a.shutdown)

    _test('.', 7532, True,    '--shutdown')
    _test('.', 7654, False,   '--port 7654')
    _test('.', 7654, True,    '--port 7654 --shutdown')
    _test('abc', 7654, False, '--dir abc --port 7654')

def test_mount():
    from webdata import Mount,File
    mount = Mount()
    mount.file('web')
    eq_(mount.file('web').type(), 'dir')
    #print(mount.file('webdata').render())
    #eq_(True,False)