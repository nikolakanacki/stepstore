/* global jest, test, expect */

const StepStore = require('./index');

const PORT = 8008;
const HOST = 'localhost';

const server = new StepStore.Server();
const client = new StepStore.Client();

test('Starting the server', (done) => {
  server.once('started', done);
  server.start(PORT, HOST);
});

test('Starting the client', (done) => {
  server.once('connect', done);
  client.start(PORT, HOST);
});
