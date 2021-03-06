global.window = global.window || {};
if (!window.localStorage) {
  window.localStorage = require('localStorage');
}


require('../app');
require('../lib/jquery.class');
require('../app/connection');

global.assert = require('assert');

assert.true = (value) => {
  return assert(value);
}

assert.false = (value) => {
  return assert.equal(value, false);
}

assert.match = (value, regex) => {
  return assert(regex.test(value), `Value ${value} should match ${regex}`);
}

assert.contain = (string, value) => {
  return assert(string.includes(value), `Value ${string} should include ${value}`);
}

global.Model = require('../app/models/all');

global.cleanupSchema = async (connection) => {
  if (!connection) {
    connection = Connection.instances[0];
  }
  return connection.query("drop schema public cascade; create schema public;");
}

global.testConnection = async () => {
  if (getConnection()) {
    return cleanupSchema();
  }

  var connection = new Connection();
  await connection.connectToServer({
    user: process.env.PG_USER || process.env.USER || process.env.USERNAME,
    password: process.env.PG_PASSWORD || '',
    port: process.env.PG_PORT,
    database: ''
  });

  connection.logging = false;

  try {
    await connection.server.createDatabase('postbird_test');
  } catch (err) {
    if (err.message != 'database "postbird_test" already exists') {
      throw err;
    }
  }

  await connection.switchDb('postbird_test');
  await cleanupSchema();

  App.tabs = [{ instance: { connection: connection} }];
  App.activeTab = 0;

  return connection;
}

global.getConnection = () => {
  return Connection.instances[0];
}
