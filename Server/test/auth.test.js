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

test('вход: неверный пароль и пустые поля', async () => {
  const client = createClient(baseUrl);

  const empty = await client.login('', '');
  assert.equal(empty.status, 400);
  assert.match(empty.data.message, /Введите логин и пароль/);

  const wrong = await client.login('admin', 'wrong-password');
  assert.equal(wrong.status, 401);
  assert.match(wrong.data.message, /Неверный логин или пароль/);
});

test('вход: успешный ответ содержит ФИО и роль', async () => {
  const client = createClient(baseUrl);
  const response = await client.login('root', 'root123');

  assert.equal(response.status, 200);
  assert.equal(response.data.user.login, 'root');
  assert.equal(response.data.user.role, 'root');
  assert.equal(response.data.user.fullName, 'Владелец системы');
  assert.ok(client.cookies.includes('accessToken='));
  assert.ok(client.cookies.includes('refreshToken='));
});

test('профиль: без авторизации 401, с куками — данные пользователя', async () => {
  const anonymous = createClient(baseUrl);
  const unauthorized = await anonymous.get('/user/me');
  assert.equal(unauthorized.status, 401);

  const { client } = { client: createClient(baseUrl) };
  await client.login('manager', 'manager123');

  const me = await client.get('/user/me');
  assert.equal(me.status, 200);
  assert.equal(me.data.login, 'manager');
  assert.equal(me.data.fullName, 'Иванов Иван Иванович');
});

test('logout сразу отзывает access-token, даже если куку сохранили', async () => {
  const client = createClient(baseUrl);
  await client.login('manager', 'manager123');

  const accessCookie = client.cookies
    .split('; ')
    .find((pair) => pair.startsWith('accessToken='));
  assert.ok(accessCookie);

  const before = await client.request('GET', '/user/me', {
    headers: { cookie: accessCookie },
  });
  assert.equal(before.status, 200);

  const loggedOut = await client.delete('/auth/logout');
  assert.equal(loggedOut.status, 200);

  // Тот же access-token, что был до выхода, больше не принимается
  const after = await client.request('GET', '/user/me', {
    headers: { cookie: accessCookie },
  });
  assert.equal(after.status, 401);
  assert.match(after.data.message, /Сессия завершена/);
});

test('refresh: продлевает сессию, logout — отзывает', async () => {
  const client = createClient(baseUrl);
  await client.login('admin', 'admin123');

  const refreshed = await client.post('/auth/refresh');
  assert.equal(refreshed.status, 200);
  assert.equal(refreshed.data.user.login, 'admin');

  const stillAuthorized = await client.get('/user/me');
  assert.equal(stillAuthorized.status, 200);

  const loggedOut = await client.delete('/auth/logout');
  assert.equal(loggedOut.status, 200);

  const afterLogout = await client.get('/user/me');
  assert.equal(afterLogout.status, 401);

  const refreshAfterLogout = await client.post('/auth/refresh');
  assert.equal(refreshAfterLogout.status, 401);
});
