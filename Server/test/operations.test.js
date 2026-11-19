const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, loginAs } = require('../testUtils/helpers');

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

test('ТО: журнал и подстановка ФИО исполнителя', async () => {
  const list = await manager.client.get('/api/operations/maintenance');
  assert.equal(list.status, 200);
  assert.equal(list.data.length, 3);

  const external = list.data.find((item) => item.performer === 'Инженер Соколов Д.В.');
  assert.equal(external.performerName, null);
});

test('ТО: создание, валидация и влияние на статус оборудования', async () => {
  const noEquipment = await manager.client.post('/api/operations/maintenance', {
    maintenanceType: 'Плановое ТО',
  });
  assert.equal(noEquipment.status, 400);

  const badType = await manager.client.post('/api/operations/maintenance', {
    equipmentId: 1,
    maintenanceType: 'Неизвестный вид',
  });
  assert.equal(badType.status, 400);

  const created = await manager.client.post('/api/operations/maintenance', {
    equipmentId: 1,
    maintenanceType: 'Плановое ТО',
    cost: 5000,
    description: 'Проверка узлов',
  });
  assert.equal(created.status, 201);
  assert.equal(created.data.performer, 'manager');
  assert.equal(created.data.status, 'Запланировано');
  assert.match(created.data.startDate, /^\d{4}-\d{2}-\d{2}$/);

  const saved = await manager.client.get('/api/operations/maintenance');
  const savedItem = saved.data.find((item) => item.id === created.data.id);
  assert.equal(savedItem.performerName, 'Иванов Иван Иванович');

  const started = await manager.client.patch(
    `/api/operations/maintenance/${created.data.id}/status`,
    { status: 'В процессе' }
  );
  assert.equal(started.status, 200);

  const equipmentInRepair = await manager.client.get('/api/equipment/1');
  assert.equal(equipmentInRepair.data.status, 'В ремонте');

  const finished = await manager.client.patch(
    `/api/operations/maintenance/${created.data.id}/status`,
    { status: 'Завершено' }
  );
  assert.equal(finished.status, 200);

  const equipmentBackToWork = await manager.client.get('/api/equipment/1');
  assert.equal(equipmentBackToWork.data.status, 'Работает');

  const invalid = await manager.client.patch(
    `/api/operations/maintenance/${created.data.id}/status`,
    { status: 'В процессе' }
  );
  assert.equal(invalid.status, 409);
});

test('ТО: сотрудник не может создавать записи', async () => {
  const response = await employee.client.post('/api/operations/maintenance', {
    equipmentId: 1,
    maintenanceType: 'Плановое ТО',
  });
  assert.equal(response.status, 403);
});

test('перемещения: журнал и подстановка ФИО оформившего', async () => {
  const list = await manager.client.get('/api/operations/transfers');
  assert.equal(list.status, 200);
  assert.equal(list.data.length, 3);

  const byAdmin = list.data.find((item) => item.transferredBy === 'admin');
  assert.equal(byAdmin.transferredByName, 'Администратор Системы');

  const byManager = list.data.find((item) => item.transferredBy === 'manager');
  assert.equal(byManager.transferredByName, 'Иванов Иван Иванович');
});

test('перемещения: создание и принятие меняет локацию оборудования', async () => {
  const noFields = await manager.client.post('/api/operations/transfers', {});
  assert.equal(noFields.status, 400);

  const unknown = await manager.client.post('/api/operations/transfers', {
    equipmentId: 9999,
    toLocationId: 1,
  });
  assert.equal(unknown.status, 404);

  const created = await manager.client.post('/api/operations/transfers', {
    equipmentId: 2,
    toLocationId: 1,
    reason: 'Тестовое перемещение',
  });
  assert.equal(created.status, 201);
  assert.equal(created.data.fromLocationId, 3);
  assert.equal(created.data.status, 'В пути');

  const list = await manager.client.get('/api/operations/transfers');
  const saved = list.data.find((item) => item.id === created.data.id);
  assert.equal(saved.transferredByName, 'Иванов Иван Иванович');

  const accepted = await manager.client.patch(
    `/api/operations/transfers/${created.data.id}/status`,
    { status: 'Принято' }
  );
  assert.equal(accepted.status, 200);

  const equipment = await manager.client.get('/api/equipment/2');
  assert.equal(equipment.data.locationId, 1);

  const again = await manager.client.patch(
    `/api/operations/transfers/${created.data.id}/status`,
    { status: 'Отклонено' }
  );
  assert.equal(again.status, 409);
});

test('заказы: журнал и подстановка ФИО создателя', async () => {
  const list = await manager.client.get('/api/operations/orders');
  assert.equal(list.status, 200);
  assert.equal(list.data.length, 3);

  const createdByManager = list.data.find((item) => item.createdBy === 'manager');
  assert.equal(createdByManager.createdByName, 'Иванов Иван Иванович');

  const createdByAdmin = list.data.find((item) => item.createdBy === 'admin');
  assert.equal(createdByAdmin.createdByName, 'Администратор Системы');
});

test('заказы: создание, дубликат номера и переходы', async () => {
  const noFields = await manager.client.post('/api/operations/orders', {});
  assert.equal(noFields.status, 400);

  const created = await manager.client.post('/api/operations/orders', {
    orderNumber: 'ORD-TEST-001',
    supplierId: 1,
    title: 'Тестовая закупка',
    totalAmount: 1000,
  });
  assert.equal(created.status, 201);
  assert.equal(created.data.status, 'Черновик');
  assert.equal(created.data.createdBy, 'manager');

  const duplicate = await manager.client.post('/api/operations/orders', {
    orderNumber: 'ORD-TEST-001',
    title: 'Дубликат',
  });
  assert.equal(duplicate.status, 409);

  const approved = await manager.client.patch(
    `/api/operations/orders/${created.data.id}/status`,
    { status: 'Согласован' }
  );
  assert.equal(approved.status, 200);

  const delivering = await manager.client.patch(
    `/api/operations/orders/${created.data.id}/status`,
    { status: 'В доставке' }
  );
  assert.equal(delivering.status, 200);

  const received = await manager.client.patch(
    `/api/operations/orders/${created.data.id}/status`,
    { status: 'Получен' }
  );
  assert.equal(received.status, 200);

  const reopen = await manager.client.patch(
    `/api/operations/orders/${created.data.id}/status`,
    { status: 'Отменён' }
  );
  assert.equal(reopen.status, 409);
});

test('операции: сотрудник не может создавать заказы', async () => {
  const response = await employee.client.post('/api/operations/orders', {
    orderNumber: 'ORD-DENIED',
    title: 'Нельзя',
  });
  assert.equal(response.status, 403);
});
