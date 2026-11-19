const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, loginAs, createClient } = require('../testUtils/helpers');

let server;
let baseUrl;
let manager;
let employee;

before(async () => {
  server = await startTestServer();
  baseUrl = server.baseUrl;
  manager = await loginAs(baseUrl, 'manager');
  employee = await loginAs(baseUrl, 'employee');
});

after(async () => {
  await server.close();
});

test('оборудование: без авторизации 401', async () => {
  const anonymous = createClient(baseUrl);
  const response = await anonymous.get('/api/equipment');
  assert.equal(response.status, 401);
});

test('оборудование: список и карточка', async () => {
  const list = await manager.client.get('/api/equipment');
  assert.equal(list.status, 200);
  assert.equal(list.data.length, 4);

  const item = await manager.client.get('/api/equipment/1');
  assert.equal(item.status, 200);
  assert.equal(item.data.invNumber, 'ИНВ-000001');

  const missing = await manager.client.get('/api/equipment/9999');
  assert.equal(missing.status, 404);
});

test('оборудование: валидация создания', async () => {
  const noInv = await manager.client.post('/api/equipment', { name: 'Без номера' });
  assert.equal(noInv.status, 400);
  assert.match(noInv.data.message, /инвентарный номер/);

  const noName = await manager.client.post('/api/equipment', { invNumber: 'ИНВ-X' });
  assert.equal(noName.status, 400);
  assert.match(noName.data.message, /наименование/);

  const badStatus = await manager.client.post('/api/equipment', {
    invNumber: 'ИНВ-X',
    name: 'Плохой статус',
    status: 'Неизвестно',
  });
  assert.equal(badStatus.status, 400);

  const repairOnCreate = await manager.client.post('/api/equipment', {
    invNumber: 'ИНВ-X',
    name: 'Сразу в ремонт',
    status: 'В ремонте',
  });
  assert.equal(repairOnCreate.status, 400);
  assert.match(repairOnCreate.data.message, /только со статусом/);
});

test('оборудование: создание, дубликат и удаление', async () => {
  const created = await manager.client.post('/api/equipment', {
    invNumber: 'ИНВ-NEW-001',
    serialNumber: 'SN-NEW',
    name: 'Новый тестовый прибор',
    status: 'Работает',
    purchaseCost: 1000,
  });
  assert.equal(created.status, 201);
  assert.equal(created.data.invNumber, 'ИНВ-NEW-001');

  const duplicate = await manager.client.post('/api/equipment', {
    invNumber: 'ИНВ-NEW-001',
    name: 'Дубликат',
  });
  assert.equal(duplicate.status, 409);

  const removed = await manager.client.delete(`/api/equipment/${created.data.id}`);
  assert.equal(removed.status, 200);

  const removedAgain = await manager.client.delete(`/api/equipment/${created.data.id}`);
  assert.equal(removedAgain.status, 404);
});

test('оборудование: редактирование не стирает дату ввода в эксплуатацию', async () => {
  const created = await manager.client.post('/api/equipment', {
    invNumber: 'ИНВ-DATE-001',
    name: 'Прибор с датой',
    commissioningDate: '2022-05-06',
  });
  assert.equal(created.status, 201);
  assert.equal(created.data.commissioningDate, '2022-05-06');

  // Форма редактирования не отправляет commissioningDate — поле должно сохраниться
  const updated = await manager.client.put(`/api/equipment/${created.data.id}`, {
    invNumber: 'ИНВ-DATE-001',
    name: 'Прибор с датой',
    status: 'Работает',
  });
  assert.equal(updated.status, 200);

  const saved = await manager.client.get(`/api/equipment/${created.data.id}`);
  assert.equal(saved.status, 200);
  assert.equal(saved.data.commissioningDate, '2022-05-06');
});

test('оборудование: запрет недопустимого перехода статуса', async () => {
  const requestBody = {
    invNumber: 'ИНВ-000001',
    name: 'Токарный станок 16К20',
    status: 'Списано',
  };

  const writtenOff = await manager.client.put('/api/equipment/1', requestBody);
  assert.equal(writtenOff.status, 200);
  assert.equal(writtenOff.data.status, 'Списано');

  const backToWork = await manager.client.put('/api/equipment/1', {
    ...requestBody,
    status: 'Работает',
  });
  assert.equal(backToWork.status, 409);
  assert.match(backToWork.data.message, /Недопустимый переход статуса/);
});

test('оборудование: сотрудник не может менять реестр', async () => {
  const response = await employee.client.post('/api/equipment', {
    invNumber: 'ИНВ-EMPLOYEE',
    name: 'Не должно создаться',
  });
  assert.equal(response.status, 403);
});
