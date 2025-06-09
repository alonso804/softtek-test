import { createServer } from 'node:http';
import { join } from 'node:path';
import { cwd, env, loadEnvFile } from 'node:process';

import { execute } from 'lambda-local';

loadEnvFile('.env');

/**
 * @typedef {import('node:http').IncomingMessage} IncomingMessage
 * @typedef {import('aws-lambda').APIGatewayEvent} APIGatewayEvent
 */

/**
 * @param {IncomingMessage} req
 * @returns {APIGatewayEvent}
 */
const reqToAPIEvent = (req) => {
  const splitUrl = req.url.split('?');

  const baseUrl = splitUrl[0];
  const queryString = splitUrl[1] ? new URLSearchParams(splitUrl[1]) : undefined;

  const httpEvent = {
    httpMethod: req.method,
    queryStringParameters: queryString,
    path: baseUrl,
    isBase64Encoded: false,
    headers: req.headers,
  };

  return httpEvent;
};

const server = createServer((req, res) => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  const event = reqToAPIEvent(req);

  req.on('end', () => {
    const lambdaOptions = {
      event: {
        ...event,
        body: body ? JSON.parse(body) : undefined,
      },
      lambdaPath: join(cwd(), '/dist/index.mjs'),
      timeoutMs: 15 * 1000,
      esm: true,
    };

    execute(lambdaOptions)
      .then((done) => {
        res.statusCode = done.statusCode || 200;
        res.end(done.body);
      })
      .catch((err) => {
        console.log(err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      });
  });
});

const LAMBDA_LISTENING_PORT = env.PORT ?? 3001;

server.listen(LAMBDA_LISTENING_PORT, () => {
  console.log('-----------------------------');
  console.log(`Server is running on port http://localhost:${LAMBDA_LISTENING_PORT}

Example:\n\tcurl -X POST http://localhost:${LAMBDA_LISTENING_PORT}/hello -d '{"hello": "world"}'`);
  console.log('-----------------------------');
});
