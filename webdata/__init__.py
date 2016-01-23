from __future__ import print_function
import os,mimetypes,functools,json

FILE_COLUMNS = [
    { 'name': 'filename', 'type': 'link' },
    { 'name': 'size' , 'type': 'number' },
    { 'name': 'type', 'type': 'string' },
    { 'name': 'mime', 'type': 'string' },
    { 'name': 'details', 'type': 'string'},
]

class FileNotFound(Exception):
    def __init__(self, path):
        super(FileNotFound, self).__init__(path)


def _cacheable(fn):
    @functools.wraps(fn)
    def cache_it(self):
        if fn.__name__ not in self.cache:
            self.cache[fn.__name__] = fn(self)
        return self.cache[fn.__name__]
    return cache_it


class File:
    def __init__(self,mount,path):
        if '..' in path:
            raise FileNotFound(path)
        path = path.strip('/')
        abs_path = os.path.join(mount.root, path)
        if not os.path.exists(abs_path):
            raise FileNotFound(path)
        self.mount = mount
        self.path = path
        self.abs_path = abs_path
        self.cache = {}

    def child(self, name):
        return File(self.mount, self.path+'/'+name)

    @_cacheable
    def isdir(self):
        return os.path.isdir(self.abs_path)

    @_cacheable
    def filename(self):
        return os.path.basename(self.path)

    @_cacheable
    def size(self):
        return 0 if self.isdir() else os.path.getsize(self.abs_path)

    @_cacheable
    def type(self):
        return 'dir' if self.isdir() else 'file'

    @_cacheable
    def link(self):
        l = self.path + '/' if self.isdir() else self.path
        return l if l[0:1] == '/' else '/'+l

    @_cacheable
    def details(self):
        return None

    @_cacheable
    def mime_enc(self):
        return ('text/wdf', 'utf-8') if self.isdir() else mimetypes.guess_type(self.path)

    @_cacheable
    def mime(self):
        return self.mime_enc()[0]

    @_cacheable
    def list_dir(self):
        if self.isdir():
            return [self.child(name) for name in os.listdir(self.abs_path)]
        return None

    @_cacheable
    def record(self):
        return [ '['+self.filename()+']('+self.link()+')', self.size(), self.type(),
                 self.mime(), self.details() ]

    def render(self):
        if self.isdir():
            s = json.dumps({'columns': FILE_COLUMNS}) + '\n'
            for f in self.list_dir():
                s += json.dumps(f.record()) + '\n'
            return s
        return open(self.abs_path, "rb")


class Mount:
    def __init__(self,root='.'):
        self.root = os.path.abspath(root)

    def file(self, path):
        return File(self,path)

    def __str__(self):
        return self.root
