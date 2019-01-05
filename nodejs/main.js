const http = require('http');
const url = require('url');
const fs = require('fs');

let indexFileName = 'index.html';
let cssFileName = 'style.css';
let jsFileName = 'script.js';
let imgFileName = 'css_sprites.png';

function makePath(fileName) { return __dirname + '/memoji/' + fileName; };

let htmlFileContent = fs.readFileSync(makePath(indexFileName));
let cssFileContent = fs.readFileSync(makePath(cssFileName));
let jsFileContent = fs.readFileSync(makePath(jsFileName));
let imgFileContent = fs.readFileSync(makePath(imgFileName));

function onRequest(request, response) {
	console.log('url: ' + request.url);

	switch (request.url) {
		case '/':
			response.writeHeader(200, {'Content-Type': 'text/html'});
			response.write(htmlFileContent);
			break;
		case '/style.css':
			response.writeHeader(200, {'Content-Type': 'text/css'});
			response.write(cssFileContent);
			break;
		case '/script.js':
			response.writeHeader(200, {'Content-Type': 'text/javascript'});
			response.write(jsFileContent);
			break;
		case '/css_sprites.png':
			response.writeHeader(200, {'Content-Type': 'image/png'});
			response.write(imgFileContent);
			break;
		case '/favicon.ico':
			break;
		default:
			response.writeHeader(404, {'Content-Type' : 'text/html'});
			response.write('Page not found');
	}
	response.end();
};

http.createServer(onRequest).listen(8080);