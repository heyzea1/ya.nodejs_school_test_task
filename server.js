'use strict';

const http = require('http');
const port = 3000;

function generateRandomNumber(from, to) {
    return Math.floor(Math.random() * to) + from;
}

function generateResponseBody() {
    const responses = [
        {status: 'error', reason: 'Some error reason'},
        {status: 'progress', timeout: generateRandomNumber(500, 1500)},
        {status: 'success'}
    ];
    return responses[generateRandomNumber(0, responses.length)];
}

function requestHandler(request, response) {
    const result = generateResponseBody();

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Request-Method', '*');
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    response.setHeader('Access-Control-Allow-Headers', '*');

    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(JSON.stringify(result));
}

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
    if (err) {
        throw err;
    }

    console.log(`server is listening on ${port}`)
});
