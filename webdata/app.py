#!/usr/bin/env python
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os
import sys
import logging
import signal
from six import string_types

import tornado.web
import tornado.template
import tornado.ioloop
import tornado.httpserver
from webdata import Mount,FileNotFound

logging.basicConfig(level=logging.INFO)

app_dir = os.path.join(os.path.dirname(__file__),'app')


def create_handler(get_content):

    class Handler(tornado.web.RequestHandler):
        SUPPORTED_METHODS = ['GET']

        def get(self, path):
            self.write(get_content())
            self.finish()
    return Handler


def get_index():
    index = os.path.join(app_dir, 'index.html')
    with open(index, 'rb') as f:
        return f.read()

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
            if isinstance(content, string_types):
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


def shutdown(port,do_shutdown):
    try:
        import urllib2
        response = urllib2.urlopen('http://localhost:%d/.pid' % (port,))
        pid = int(response.read())
        logging.info('Stopping %d' % pid)
        os.kill(pid,signal.SIGINT)
        if not do_shutdown:
            import time
            time.sleep(2)
    except:
        pass


def run_server(raw_mount, port):
    app_mount = Mount(app_dir)
    logging.debug('mount: %s' % raw_mount)
    application = tornado.web.Application([
        (r'/\.app/(.*)$', MountHandler, {'mount': app_mount}),
        (r'/\.raw/(.*)$', MountHandler, {'mount': raw_mount}),
        (r'/(\.pid)$', create_handler(lambda: '%d' % os.getpid()),),
        (r'(.*)$', create_handler(get_index),),
    ])
    signal.signal(signal.SIGINT, stop_server)
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(port)
    logging.info('Serving HTTP on 0.0.0.0 port %d ...' % port)
    tornado.ioloop.IOLoop.instance().start()


def _args_parser():
    import argparse

    parser = argparse.ArgumentParser(description='Run webdata server')
    parser.add_argument('--port', metavar='N', type=int, nargs='?',
                        default=7532, help='a port to listen')
    parser.add_argument('--dir', metavar='dir', nargs='?',
                        default='.', help='a directory to publish')
    parser.add_argument('--shutdown', action='store_true',
                        help='shutdown server')

    return parser

def main():
    parser = _args_parser()
    args = parser.parse_args()
    raw_mount = Mount(args.dir)
    shutdown(args.port,args.shutdown)
    if not args.shutdown:
        run_server(raw_mount, args.port)

if __name__ == '__main__':
    main()