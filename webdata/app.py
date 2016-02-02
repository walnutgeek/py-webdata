#!/usr/bin/env python
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os
import sys
import logging
import signal

import tornado.web
import tornado.template
import tornado.ioloop
import tornado.httpserver
from webdata import Mount,FileNotFound

logging.basicConfig(level=logging.INFO)

app_dir = os.path.join(os.path.dirname(__file__),'app')

class IndexHandler(tornado.web.RequestHandler):
    SUPPORTED_METHODS = ['GET']

    def get(self, path):
        index = os.path.join(app_dir, 'index.html')
        with open(index, 'rb') as f:
            self.write(f.read())
        self.finish()


class MountHandler(tornado.web.RequestHandler):
    SUPPORTED_METHODS = ['GET']

    def initialize(self,mount):
        self.mount = mount

    def get(self, path):
        try:
            file = self.mount.file(path)
            mime,enc = file.mime_enc()
            if mime and enc:
                self.set_header('Content-Type', '{mime}; charset="{enc}"'.format(**locals()))
            elif mime:
                self.set_header('Content-Type', mime)
            content = file.render()
            if isinstance(content, str) or isinstance(content, unicode):
                self.write(content)
            else:
                while 1:
                    chunk = content.read(64*1024)
                    if not chunk:
                        break
                    self.write(chunk)
        except FileNotFound:
            raise tornado.web.HTTPError(404)
        self.finish()


def stop_server(signum, frame):
    tornado.ioloop.IOLoop.instance().stop()
    logging.info('Stopped!')


def run_server(raw_mount, port):
    app_mount = Mount(app_dir)
    logging.debug('mount: %s' % raw_mount)
    application = tornado.web.Application([
        (r'/\.app/(.*)$', MountHandler, {'mount': app_mount}),
        (r'/\.raw/(.*)$', MountHandler, {'mount': raw_mount}),
        (r'(.*)$', IndexHandler,),
    ])
    signal.signal(signal.SIGINT, stop_server)
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(port)
    logging.info('Serving HTTP on 0.0.0.0 port %d ...' % port)
    tornado.ioloop.IOLoop.instance().start()


def main():
    if sys.argv[2:] :
        port = int(sys.argv[2])
    else:
        port = 7532
    current_path = '.'
    if sys.argv[1:] :
        current_path = sys.argv[1]
    raw_mount = Mount(current_path)
    run_server(raw_mount, port)

if __name__ == '__main__':
    main()