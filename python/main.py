#!/usr/bin/python3
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT_NUMBER = 8080
CUR_DIR = os.path.dirname(os.path.abspath(__file__))

class onRequest(BaseHTTPRequestHandler):
	def do_GET(self):
		print(self.path)
		if self.path == '/':
			self.path = '/index.html'
		self.path = '/memoji' + self.path;

		try:			
			def getMimeType(path) :
				if path == '/memoji/index.html':
					return 'text/html'
				if path == '/memoji/style.css':
					return 'text/css'
				if path == '/memoji/script.js':
					return 'application/javascript'
				if path == '/memoji/css_sprites.png':
					return 'image/png'
				return None

			mimetype = getMimeType(self.path)
			sendReply = (mimetype != None)

			if sendReply == True:				
				self.send_response(200)
				self.send_header('Content-type', mimetype)
				self.end_headers()
				if ('image' in mimetype):
					f = open(CUR_DIR + self.path, 'rb')
					content = f.read()
				else:
					f = open(CUR_DIR + self.path)
					content = f.read().encode('utf-8')
				self.wfile.write(content)
				f.close()

		except IOError as e:
			self.send_error(404, 'File not found: %s' % self.path)
			raise
		else:
			pass
		finally:
			pass

try:
	#Create a web server and define the handler to manage the
	#incoming request
	server = HTTPServer(('', PORT_NUMBER), onRequest)
	print('Started httpserver on port %d' % PORT_NUMBER)
	
	#Wait forever for incoming http requests
	server.serve_forever()

except KeyboardInterrupt:
	print('^C received, shutting down the web server')
	server.socket.close()