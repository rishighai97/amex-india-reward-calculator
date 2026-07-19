#!/usr/bin/env python3

import os
import ssl
from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Directory where your HTML files are located
DIR = "/app/app"

# HTTPS port
PORT = 8080

# SSL certificate and key
CERT_FILE = "/app/certs/cert.pem"
KEY_FILE = "/app/certs/key.pem"

os.chdir(DIR)

handler = partial(SimpleHTTPRequestHandler, directory=DIR)
httpd = HTTPServer(("0.0.0.0", PORT), handler)

#context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
#context.load_cert_chain(certfile=CERT_FILE, keyfile=KEY_FILE)

#httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print(f"Serving HTTP on https://0.0.0.0:{PORT}")
httpd.serve_forever()
