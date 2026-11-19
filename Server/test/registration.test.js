const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, createClient } = require('../testUtils/helpers');

let server;
let baseUrl;

before(async () => {
  server = await startTestServer();
  baseUrl = server.baseUrl;
});

after(async () => {
  await server.close();
});

test('регистрация: успешное создание сотрудника и вход', async () => {
  const client = createClient(baseUrl);

  const registered = await client.post('/user/register', {
    login: 'new_employee',
    password: 'secret123',
    fullName: 'Новый Сотрудник',
  });

  assert.equal(registered.status, 201);
  assert.equal(registered.data.login, 'new_employee');
  assert.equal(registered.data.role, 'employee');
  assert.equal(registered.data.fullName, 'Новый Сотрудник');

  const login = await client.login('new_employee', 'secret123');
  assert.equal(login.status, 200);
  assert.equal(login.data.user.role, 'employee');
});

test('регистрация: роль из тела запроса игнорируется', async () => {
  const client = createClient(baseUrl);

  const registered = await client.post('/user/register', {
    login: 'sneaky_user',
    password: 'secret123',
    role: 'admin',
  });

  assert.equal(registered.status, 201);
  assert.equal(registered.data.role, 'employee');
});

test('регистрация: валидация полей', async () => {
  const client = createClient(baseUrl);

  const noFields = await client.post('/user/register', {});
  assert.equal(noFields.status, 400);

  const shortLogin = await client.post('/user/register', {
    login: 'ab',
    password: 'secret123',
  });
  assert.equal(shortLogin.status, 400);
  assert.match(shortLogin.data.message, /не менее 3/);

  const shortPassword = await client.post('/user/register', {
    login: 'normal_login',
    password: '123',
  });
  assert.equal(shortPassword.status, 400);
  assert.match(shortPassword.data.message, /не менее 6/);

  const longName = await client.post('/user/register', {
    login: 'normal_login2',
    password: 'secret123',
    fullName: 'Ф'.repeat(121),
  });
  assert.equal(longName.status, 400);
  assert.match(longName.data.message, /120/);
});

test('регистрация: дубликат логина', async () => {
  const client = createClient(baseUrl);

  const duplicate = await client.post('/user/register', {
    login: 'admin',
    password: 'secret123',
  });

  assert.equal(duplicate.status, 400);
  assert.match(duplicate.data.message, /уже есть/);
});

test('регистрация: логин обрезается от пробелов', async () => {
  const client = createClient(baseUrl);

  const registered = await client.post('/user/register', {
    login: '  spaced_login  ',
    password: 'secret123',
  });

  assert.equal(registered.status, 201);
  assert.equal(registered.data.login, 'spaced_login');
});
