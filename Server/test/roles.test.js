const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, loginAs, createClient } = require('../testUtils/helpers');

let server;
let baseUrl;
let root;
let admin;
let manager;
let employee;
let users;

before(async () => {
  server = await startTestServer();
  baseUrl = server.baseUrl;

  root = await loginAs(baseUrl, 'root');
  admin = await loginAs(baseUrl, 'admin');
  manager = await loginAs(baseUrl, 'manager');
  employee = await loginAs(baseUrl, 'employee');

  const list = await root.client.get('/user');
  users = list.data;
});

after(async () => {
  await server.close();
});

function userId(login) {
  return users.find((user) => user.login === login).id;
}

test('сотрудник не может выполнять управленческие действия', async () => {
  const createEquipment = await employee.client.post('/api/equipment', {
    invNumber: 'ИНВ-DENIED',
    name: 'Запрещённая единица',
  });
  assert.equal(createEquipment.status, 403);

  const createDepartment = await employee.client.post('/api/directory/departments', {
    name: 'Запрещённое подразделение',
    code: 'DENIED',
  });
  assert.equal(createDepartment.status, 403);
});

test('менеджер может создавать справочники и оборудование', async () => {
  const department = await manager.client.post('/api/directory/departments', {
    name: 'Тестовое подразделение',
    code: 'TEST-DEP',
  });
  assert.equal(department.status, 201);

  const equipment = await manager.client.post('/api/equipment', {
    invNumber: 'ИНВ-TEST-001',
    name: 'Тестовый стенд',
  });
  assert.equal(equipment.status, 201);
});

test('раздел пользователей доступен только admin и root', async () => {
  assert.equal((await employee.client.get('/user')).status, 403);
  assert.equal((await manager.client.get('/user')).status, 403);

  const adminList = await admin.client.get('/user');
  assert.equal(adminList.status, 200);
  assert.ok(adminList.data.some((user) => user.login === 'root'));

  const rootList = await root.client.get('/user');
  assert.equal(rootList.status, 200);
});

test('аккаунт root защищён от изменения и удаления', async () => {
  const rootId = userId('root');

  const byAdmin = await admin.client.patch(`/user/${rootId}/role`, { role: 'employee' });
  assert.equal(byAdmin.status, 403);

  const selfChange = await root.client.patch(`/user/${rootId}/role`, { role: 'admin' });
  assert.equal(selfChange.status, 400);

  const selfDelete = await root.client.delete(`/user/${rootId}`);
  assert.equal(selfDelete.status, 400);

  const assignRoot = await root.client.patch(`/user/${userId('admin')}/role`, { role: 'root' });
  assert.equal(assignRoot.status, 400);
});

test('admin не может выдавать admin и трогать администраторов', async () => {
  const employeeId = userId('user');

  const promoteToAdmin = await admin.client.patch(`/user/${employeeId}/role`, { role: 'admin' });
  assert.equal(promoteToAdmin.status, 403);

  const promoteToManager = await admin.client.patch(`/user/${employeeId}/role`, {
    role: 'manager',
  });
  assert.equal(promoteToManager.status, 200);
  assert.equal(promoteToManager.data.role, 'manager');
});

test('root управляет администраторами, admin — нет', async () => {
  const client = createClient(baseUrl);
  const registered = await client.post('/user/register', {
    login: 'promoted_admin',
    password: 'secret123',
    fullName: 'Назначенный Администратор',
  });
  assert.equal(registered.status, 201);

  const targetId = registered.data.id;

  const promote = await root.client.patch(`/user/${targetId}/role`, { role: 'admin' });
  assert.equal(promote.status, 200);
  assert.equal(promote.data.role, 'admin');

  const adminPatch = await admin.client.patch(`/user/${targetId}/role`, { role: 'employee' });
  assert.equal(adminPatch.status, 403);

  const adminDelete = await admin.client.delete(`/user/${targetId}`);
  assert.equal(adminDelete.status, 403);

  const rootDelete = await root.client.delete(`/user/${targetId}`);
  assert.equal(rootDelete.status, 200);
});

test('сброс БД доступен только root', async () => {
  const denied = await admin.client.post('/user/reset-db');
  assert.equal(denied.status, 403);

  const allowed = await root.client.post('/user/reset-db');
  assert.equal(allowed.status, 200);
  assert.equal(allowed.data.ok, true);
});
