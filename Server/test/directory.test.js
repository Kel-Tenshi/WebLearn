const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, loginAs } = require('../testUtils/helpers');

let server;
let baseUrl;
let manager;

before(async () => {
  server = await startTestServer();
  baseUrl = server.baseUrl;
  manager = await loginAs(baseUrl, 'manager');
});

after(async () => {
  await server.close();
});

test('справочники: демо-данные на месте', async () => {
  const departments = await manager.client.get('/api/directory/departments');
  assert.equal(departments.status, 200);
  assert.equal(departments.data.length, 3);

  const locations = await manager.client.get('/api/directory/locations');
  assert.equal(locations.data.length, 4);
  assert.equal(locations.data[0].departmentName !== undefined, true);

  const categories = await manager.client.get('/api/directory/categories');
  assert.equal(categories.data.length, 4);

  const suppliers = await manager.client.get('/api/directory/suppliers');
  assert.equal(suppliers.data.length, 2);
});

test('подразделения: создание и дубликаты', async () => {
  const created = await manager.client.post('/api/directory/departments', {
    name: 'Отдел тестирования',
    code: 'DEP-QA',
  });
  assert.equal(created.status, 201);
  assert.equal(created.data.code, 'DEP-QA');

  const sameCode = await manager.client.post('/api/directory/departments', {
    name: 'Другое имя',
    code: 'DEP-QA',
  });
  assert.equal(sameCode.status, 409);
  assert.match(sameCode.data.message, /кодом/);

  const sameName = await manager.client.post('/api/directory/departments', {
    name: 'Отдел тестирования',
    code: 'DEP-QA-2',
  });
  assert.equal(sameName.status, 409);
  assert.match(sameName.data.message, /названием/);
});

test('локации: валидация и создание', async () => {
  const noBuilding = await manager.client.post('/api/directory/locations', {
    name: 'Без здания',
  });
  assert.equal(noBuilding.status, 400);

  const created = await manager.client.post('/api/directory/locations', {
    name: 'Новая лаборатория',
    building: 'Корпус В',
    room: 'Каб. 5',
    departmentId: 1,
  });
  assert.equal(created.status, 201);

  const list = await manager.client.get('/api/directory/locations');
  const saved = list.data.find((location) => location.id === created.data.id);
  assert.equal(saved.departmentName, 'Производственный цех №1');
});

test('категории: дубликат кода', async () => {
  const created = await manager.client.post('/api/directory/categories', {
    name: 'Тестовая категория',
    code: 'CAT-QA',
    description: 'Для тестов',
  });
  assert.equal(created.status, 201);

  const duplicate = await manager.client.post('/api/directory/categories', {
    name: 'Другая категория',
    code: 'CAT-QA',
  });
  assert.equal(duplicate.status, 409);
});

test('поставщики: создание и дубликат ИНН', async () => {
  const created = await manager.client.post('/api/directory/suppliers', {
    name: 'ООО Тестовый Поставщик',
    inn: '1234567890',
    contactPerson: 'Тестов Тест',
    phone: '+7 000 000-00-00',
    email: 'test@example.com',
  });
  assert.equal(created.status, 201);
  assert.equal(created.data.contactPerson, 'Тестов Тест');

  const duplicate = await manager.client.post('/api/directory/suppliers', {
    name: 'Ещё один поставщик',
    inn: '1234567890',
  });
  assert.equal(duplicate.status, 409);
  assert.match(duplicate.data.message, /ИНН/);
});

test('инвентаризация: создание, ФИО аудитора и статусы', async () => {
  const noLocation = await manager.client.post('/api/directory/audits', {});
  assert.equal(noLocation.status, 400);

  const created = await manager.client.post('/api/directory/audits', {
    locationId: 1,
    notes: 'Плановая проверка',
  });
  assert.equal(created.status, 201);

  const list = await manager.client.get('/api/directory/audits');
  const saved = list.data.find((audit) => audit.id === created.data.id);
  assert.equal(saved.auditor, 'manager');
  assert.equal(saved.auditorName, 'Иванов Иван Иванович');

  const invalid = await manager.client.patch(`/api/directory/audits/${created.data.id}`, {
    status: 'Неизвестно',
  });
  assert.equal(invalid.status, 400);

  const completed = await manager.client.patch(`/api/directory/audits/${created.data.id}`, {
    status: 'Завершена',
  });
  assert.equal(completed.status, 200);

  const again = await manager.client.patch(`/api/directory/audits/${created.data.id}`, {
    status: 'Выявлены расхождения',
  });
  assert.equal(again.status, 409);

  const missing = await manager.client.patch('/api/directory/audits/9999', {
    status: 'Завершена',
  });
  assert.equal(missing.status, 404);
});
