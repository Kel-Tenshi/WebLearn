const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, loginAs, createClient } = require('../testUtils/helpers');

let server;
let baseUrl;
let root;

before(async () => {
  server = await startTestServer();
  baseUrl = server.baseUrl;
  root = await loginAs(baseUrl, 'root');
});

after(async () => {
  await server.close();
});

test('смена роли действует сразу, без ожидания истечения access-token', async () => {
  const registration = createClient(baseUrl);
  const registered = await registration.post('/user/register', {
    login: 'token_admin',
    password: 'secret123',
    fullName: 'Временный Админ',
  });
  assert.equal(registered.status, 201);

  const targetId = registered.data.id;

  const promoted = await root.client.patch(`/user/${targetId}/role`, { role: 'admin' });
  assert.equal(promoted.status, 200);

  // Входим уже с ролью admin — в access-token записана роль admin
  const target = createClient(baseUrl);
  const login = await target.login('token_admin', 'secret123');
  assert.equal(login.status, 200);
  assert.equal(login.data.user.role, 'admin');

  assert.equal((await target.get('/user')).status, 200);

  const demoted = await root.client.patch(`/user/${targetId}/role`, { role: 'manager' });
  assert.equal(demoted.status, 200);

  // Токен тот же, но роль уже manager — доступа к пользователям быть не должно
  assert.equal((await target.get('/user')).status, 403);

  const me = await target.get('/user/me');
  assert.equal(me.status, 200);
  assert.equal(me.data.role, 'manager');
});

test('удаление пользователя сразу отзывает его access-token', async () => {
  const registration = createClient(baseUrl);
  const registered = await registration.post('/user/register', {
    login: 'token_deleted',
    password: 'secret123',
  });
  assert.equal(registered.status, 201);

  const target = createClient(baseUrl);
  await target.login('token_deleted', 'secret123');
  assert.equal((await target.get('/user/me')).status, 200);

  const removed = await root.client.delete(`/user/${registered.data.id}`);
  assert.equal(removed.status, 200);

  assert.equal((await target.get('/user/me')).status, 401);
});
