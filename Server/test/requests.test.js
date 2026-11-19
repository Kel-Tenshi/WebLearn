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

test('заявки: сотрудник видит только свои, менеджер — все', async () => {
  const own = await employee.client.get('/api/requests');
  assert.equal(own.status, 200);
  assert.equal(own.data.length, 2);
  assert.ok(own.data.every((request) => request.applicant === 'user'));
  assert.ok(
    own.data.every((request) => request.applicantName === 'Петров Алексей Сергеевич')
  );
  assert.ok(own.data.every((request) => Boolean(request.invNumber)));

  const all = await manager.client.get('/api/requests');
  assert.equal(all.status, 200);
  assert.equal(all.data.length, 3);
});

test('заявки: валидация создания', async () => {
  const badType = await employee.client.post('/api/requests', {
    type: 'Неизвестно',
    title: 'Тест',
  });
  assert.equal(badType.status, 400);

  const emptyTitle = await employee.client.post('/api/requests', {
    type: 'Ремонт',
    title: '   ',
  });
  assert.equal(emptyTitle.status, 400);

  const badPriority = await employee.client.post('/api/requests', {
    type: 'Ремонт',
    title: 'Тест',
    priority: 'Очень высокий',
  });
  assert.equal(badPriority.status, 400);
});

test('заявки: автор всегда текущий сотрудник', async () => {
  const created = await employee.client.post('/api/requests', {
    type: 'Ремонт',
    title: 'Проверить подшипник',
    equipmentId: 1,
    priority: 'Высокий',
    applicant: 'admin',
  });

  assert.equal(created.status, 201);
  assert.equal(created.data.applicant, 'user');
  assert.equal(created.data.status, 'На согласовании');
});

test('заявки: менеджер может указать заявителя и получает ФИО', async () => {
  const created = await manager.client.post('/api/requests', {
    type: 'Закупка',
    title: 'Купить расходники',
    applicant: 'user',
    priority: 'Средний',
  });
  assert.equal(created.status, 201);
  assert.equal(created.data.applicant, 'user');

  const list = await manager.client.get('/api/requests');
  const saved = list.data.find((request) => request.id === created.data.id);
  assert.equal(saved.applicantName, 'Петров Алексей Сергеевич');
});

test('заявки: сотрудник может отменить только свою', async () => {
  const created = await employee.client.post('/api/requests', {
    type: 'Перемещение',
    title: 'Перенести прибор',
    equipmentId: 2,
  });

  const cancelled = await employee.client.patch(`/api/requests/${created.data.id}`, {
    status: 'Отменено',
  });
  assert.equal(cancelled.status, 200);
  assert.equal(cancelled.data.status, 'Отменено');

  const foreign = await employee.client.patch('/api/requests/3', { status: 'Отменено' });
  assert.equal(foreign.status, 403);
});

test('заявки: сотрудник не может одобрять', async () => {
  const created = await employee.client.post('/api/requests', {
    type: 'Ремонт',
    title: 'Согласование не для сотрудника',
    equipmentId: 1,
  });

  const approved = await employee.client.patch(`/api/requests/${created.data.id}`, {
    status: 'Одобрено',
  });
  assert.equal(approved.status, 403);
  assert.match(approved.data.message, /только отменить/);
});

test('заявки: менеджер проходит по графу статусов', async () => {
  const created = await employee.client.post('/api/requests', {
    type: 'Ремонт',
    title: 'Полный цикл согласования',
    equipmentId: 1,
  });
  const id = created.data.id;

  const approved = await manager.client.patch(`/api/requests/${id}`, { status: 'Одобрено' });
  assert.equal(approved.status, 200);

  const inWork = await manager.client.patch(`/api/requests/${id}`, { status: 'В работе' });
  assert.equal(inWork.status, 200);

  const done = await manager.client.patch(`/api/requests/${id}`, { status: 'Выполнено' });
  assert.equal(done.status, 200);

  const reopen = await manager.client.patch(`/api/requests/${id}`, { status: 'Отменено' });
  assert.equal(reopen.status, 409);
  assert.match(reopen.data.message, /Недопустимый переход статуса/);

  const unknown = await manager.client.patch(`/api/requests/${id}`, { status: 'Неизвестно' });
  assert.equal(unknown.status, 400);
});
