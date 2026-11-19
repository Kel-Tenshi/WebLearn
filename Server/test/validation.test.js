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

test('несуществующие связи возвращают 400/404, а не 500', async () => {
  const transfer = await manager.client.post('/api/operations/transfers', {
    equipmentId: 1,
    toLocationId: 9999,
  });
  assert.equal(transfer.status, 404);
  assert.match(transfer.data.message, /локация не найдена/i);

  const audit = await manager.client.post('/api/directory/audits', { locationId: 9999 });
  assert.equal(audit.status, 404);

  const equipment = await manager.client.post('/api/equipment', {
    invNumber: 'ИНВ-FK-TEST',
    name: 'Проверка связей',
    categoryId: 9999,
  });
  assert.equal(equipment.status, 400);

  const equipmentLocation = await manager.client.post('/api/equipment', {
    invNumber: 'ИНВ-FK-TEST-2',
    name: 'Проверка локации',
    locationId: 9999,
  });
  assert.equal(equipmentLocation.status, 400);

  const request = await manager.client.post('/api/requests', {
    type: 'Ремонт',
    title: 'Проверка связи',
    equipmentId: 9999,
  });
  assert.equal(request.status, 400);

  const maintenance = await manager.client.post('/api/operations/maintenance', {
    equipmentId: 9999,
    maintenanceType: 'Плановое ТО',
  });
  assert.equal(maintenance.status, 404);

  const order = await manager.client.post('/api/operations/orders', {
    orderNumber: 'ORD-FK-TEST',
    title: 'Проверка связи',
    supplierId: 9999,
  });
  assert.equal(order.status, 400);
});

test('нельзя переместить оборудование в текущую локацию', async () => {
  const equipment = await manager.client.get('/api/equipment/1');
  assert.equal(equipment.status, 200);

  const transfer = await manager.client.post('/api/operations/transfers', {
    equipmentId: 1,
    toLocationId: equipment.data.locationId,
  });

  assert.equal(transfer.status, 400);
  assert.match(transfer.data.message, /уже находится/);
});

test('подразделения: создание, обновление, дубликат и удаление', async () => {
  const created = await manager.client.post('/api/directory/departments', {
    name: 'QA-подразделение',
    code: 'QA-DEP',
  });
  assert.equal(created.status, 201);

  const updated = await manager.client.put(`/api/directory/departments/${created.data.id}`, {
    name: 'QA-подразделение (новое)',
    code: 'QA-DEP',
    headName: 'Проверяющий П.П.',
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.name, 'QA-подразделение (новое)');
  assert.equal(updated.data.headName, 'Проверяющий П.П.');

  const second = await manager.client.post('/api/directory/departments', {
    name: 'Второе QA-подразделение',
    code: 'QA-DEP-2',
  });

  const duplicate = await manager.client.put(`/api/directory/departments/${created.data.id}`, {
    name: 'QA-подразделение (новое)',
    code: 'QA-DEP-2',
  });
  assert.equal(duplicate.status, 409);

  const removed = await manager.client.delete(`/api/directory/departments/${created.data.id}`);
  assert.equal(removed.status, 200);

  const missing = await manager.client.put(`/api/directory/departments/${created.data.id}`, {
    name: 'Нет такого',
    code: 'QA-NO',
  });
  assert.equal(missing.status, 404);

  await manager.client.delete(`/api/directory/departments/${second.data.id}`);
});

test('локации: обновление и запрет удаления используемой', async () => {
  const created = await manager.client.post('/api/directory/locations', {
    name: 'QA-локация',
    building: 'Корпус QA',
    room: '1',
    departmentId: 1,
  });
  assert.equal(created.status, 201);

  const updated = await manager.client.put(`/api/directory/locations/${created.data.id}`, {
    name: 'QA-локация (новое)',
    building: 'Корпус QA',
    room: '2',
    departmentId: 2,
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.name, 'QA-локация (новое)');

  const removed = await manager.client.delete(`/api/directory/locations/${created.data.id}`);
  assert.equal(removed.status, 200);

  // Локация 2 используется в перемещениях
  const used = await manager.client.delete('/api/directory/locations/2');
  assert.equal(used.status, 409);
  assert.match(used.data.message, /используется/);
});

test('категории и поставщики: обновление и удаление', async () => {
  const category = await manager.client.post('/api/directory/categories', {
    name: 'QA-категория',
    code: 'QA-CAT',
  });
  assert.equal(category.status, 201);

  const updatedCategory = await manager.client.put(
    `/api/directory/categories/${category.data.id}`,
    { name: 'QA-категория (новое)', code: 'QA-CAT', description: 'Описание' }
  );
  assert.equal(updatedCategory.status, 200);
  assert.equal(updatedCategory.data.description, 'Описание');

  const removedCategory = await manager.client.delete(
    `/api/directory/categories/${category.data.id}`
  );
  assert.equal(removedCategory.status, 200);

  const supplier = await manager.client.post('/api/directory/suppliers', {
    name: 'QA-поставщик',
    inn: '1111111111',
  });
  assert.equal(supplier.status, 201);

  const updatedSupplier = await manager.client.put(
    `/api/directory/suppliers/${supplier.data.id}`,
    {
      name: 'QA-поставщик (новое)',
      inn: '1111111111',
      contactPerson: 'Тестов Т.Т.',
      phone: '+7 900 000-00-00',
      email: 'qa@example.com',
    }
  );
  assert.equal(updatedSupplier.status, 200);
  assert.equal(updatedSupplier.data.contactPerson, 'Тестов Т.Т.');

  const removedSupplier = await manager.client.delete(
    `/api/directory/suppliers/${supplier.data.id}`
  );
  assert.equal(removedSupplier.status, 200);
});

test('валидация обновления: пустые поля и неверный id', async () => {
  const empty = await manager.client.put('/api/directory/departments/1', {
    name: '',
    code: '',
  });
  assert.equal(empty.status, 400);

  const badId = await manager.client.put('/api/directory/locations/abc', {
    name: 'X',
    building: 'Y',
  });
  assert.equal(badId.status, 400);
});
