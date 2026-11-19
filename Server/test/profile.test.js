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

test('профиль: обновление ФИО и подразделения', async () => {
  const client = createClient(baseUrl);
  await client.post('/user/register', {
    login: 'profile_user',
    password: 'secret123',
    fullName: 'Старое Имя',
  });
  await client.login('profile_user', 'secret123');

  const updated = await client.patch('/user/me', {
    fullName: 'Новое Имя Пользователя',
    departmentId: 2,
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.fullName, 'Новое Имя Пользователя');
  assert.equal(updated.data.departmentId, 2);

  const me = await client.get('/user/me');
  assert.equal(me.status, 200);
  assert.equal(me.data.fullName, 'Новое Имя Пользователя');
  assert.equal(me.data.departmentId, 2);
});

test('профиль: валидация ФИО и подразделения', async () => {
  const client = createClient(baseUrl);
  await client.login('manager', 'manager123');

  const longName = await client.patch('/user/me', { fullName: 'Ф'.repeat(121) });
  assert.equal(longName.status, 400);

  const badDepartment = await client.patch('/user/me', { departmentId: 9999 });
  assert.equal(badDepartment.status, 400);
});

test('смена пароля: проверки и вход с новым паролем', async () => {
  const client = createClient(baseUrl);
  await client.post('/user/register', {
    login: 'password_user',
    password: 'secret123',
    fullName: 'Смена Пароля',
  });
  await client.login('password_user', 'secret123');

  const wrongCurrent = await client.patch('/user/me/password', {
    currentPassword: 'wrong-pass',
    newPassword: 'newsecret123',
  });
  assert.equal(wrongCurrent.status, 400);
  assert.match(wrongCurrent.data.message, /Текущий пароль/);

  const shortNew = await client.patch('/user/me/password', {
    currentPassword: 'secret123',
    newPassword: '123',
  });
  assert.equal(shortNew.status, 400);

  const changed = await client.patch('/user/me/password', {
    currentPassword: 'secret123',
    newPassword: 'newsecret123',
  });
  assert.equal(changed.status, 200);
  assert.equal(changed.data.ok, true);

  const oldLogin = createClient(baseUrl);
  const rejected = await oldLogin.login('password_user', 'secret123');
  assert.equal(rejected.status, 401);

  const newLogin = createClient(baseUrl);
  const accepted = await newLogin.login('password_user', 'newsecret123');
  assert.equal(accepted.status, 200);
});

test('без авторизации профиль и пароль недоступны', async () => {
  const anonymous = createClient(baseUrl);

  assert.equal((await anonymous.patch('/user/me', { fullName: 'X' })).status, 401);
  assert.equal(
    (await anonymous.patch('/user/me/password', {
      currentPassword: 'a',
      newPassword: 'bbbbbb',
    })).status,
    401
  );
});
