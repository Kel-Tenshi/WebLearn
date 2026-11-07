const { hashPassword } = require('../utils/passwords');

async function seedDemoData(db) {
  // 1. Демо-подразделения
  const depCount = await db.get('SELECT COUNT(*) as count FROM departments');
  if (depCount.count === 0) {
    await db.run(`
      INSERT INTO departments (name, code, headName) VALUES
      ('Производственный цех №1', 'DEP-PROD1', 'Кузнецов В.А.'),
      ('Лаборатория неразрушающего контроля', 'DEP-LAB1', 'Смирнова О.Н.'),
      ('Складской комплекс', 'DEP-WH', 'Морозов И.П.')
    `);
  }

  // 2. Демо-локации
  const locCount = await db.get('SELECT COUNT(*) as count FROM locations');
  if (locCount.count === 0) {
    await db.run(`
      INSERT INTO locations (name, building, room, departmentId) VALUES
      ('Центральный склад', 'Корпус А', 'Помещение 101', 3),
      ('Цех механической обработки', 'Корпус Б', 'Цех 1', 1),
      ('Лаборатория микроскопии', 'Главный корпус', 'Каб. 312', 2),
      ('Участок консервации', 'Корпус А', 'Склад 2', 3)
    `);
  }

  // 3. Демо-категории
  const catCount = await db.get('SELECT COUNT(*) as count FROM categories');
  if (catCount.count === 0) {
    await db.run(`
      INSERT INTO categories (name, code, description) VALUES
      ('Станки и силовые агрегаты', 'CAT-MACH', 'Токарные, фрезерные, шлифовальные станки'),
      ('Измерительные приборы', 'CAT-MEAS', 'Осциллографы, мультиметры, датчики'),
      ('Оптические системы', 'CAT-OPT', 'Микроскопы, спектрометры, линзы'),
      ('Компьютерная техника', 'CAT-IT', 'Серверы, рабочие станции операторов')
    `);
  }

  // 4. Демо-пользователи
  const demoUsers = [
    { login: 'admin', password: 'admin123', role: 'admin', fullName: 'Администратор Системы', departmentId: 3 },
    { login: 'manager', password: 'manager123', role: 'manager', fullName: 'Иванов Иван Иванович', departmentId: 1 },
    { login: 'user', password: 'user123', role: 'employee', fullName: 'Петров Алексей Сергеевич', departmentId: 2 }
  ];

  for (const demo of demoUsers) {
    const exists = await db.get('SELECT id FROM users WHERE login = ?', demo.login);
    if (!exists) {
      await db.run(
        'INSERT INTO users (login, password, role, fullName, departmentId) VALUES (?, ?, ?, ?, ?)',
        [demo.login, hashPassword(demo.password), demo.role, demo.fullName, demo.departmentId]
      );
    }
  }

  // 5. Демо-поставщики
  const supCount = await db.get('SELECT COUNT(*) as count FROM suppliers');
  if (supCount.count === 0) {
    await db.run(`
      INSERT INTO suppliers (name, inn, contactPerson, phone, email) VALUES
      ('ООО ПромСнаб-Тех', '7701123456', 'Васильев Олег', '+7 (495) 123-45-67', 'sales@promsnab.ru'),
      ('АО ЛабСервис', '7812987654', 'Егорова Анна', '+7 (812) 987-65-43', 'info@labservice.spb.ru')
    `);
  }

  // 6. Демо-оборудование
  const eqCount = await db.get('SELECT COUNT(*) as count FROM equipment');
  if (eqCount.count === 0) {
    await db.run(`
      INSERT INTO equipment (invNumber, serialNumber, name, categoryId, locationId, status, purchaseCost, commissioningDate) VALUES
      ('ИНВ-000001', 'SN-16K20-891', 'Токарный станок 16К20', 1, 2, 'Работает', 450000, '2023-01-15'),
      ('ИНВ-000002', 'SN-FLUKE-543', 'Осциллограф Fluke 190-204', 2, 3, 'В ремонте', 185000, '2023-04-10'),
      ('ИНВ-000003', 'SN-CNC-8821', 'Фрезерный станок с ЧПУ', 1, 2, 'Работает', 1200000, '2023-08-20'),
      ('ИНВ-000004', 'SN-OLYMP-091', 'Микроскоп Olympus BX53', 3, 3, 'Простой', 320000, '2024-02-01')
    `);
  }

  // 7. Демо-заявки
  const reqCount = await db.get('SELECT COUNT(*) as count FROM requests');
  if (reqCount.count === 0) {
    await db.run(`
      INSERT INTO requests (type, title, applicant, equipmentId, priority, status, createdAt) VALUES
      ('Перемещение', 'Перенести осциллограф в Цех механической обработки', 'Петров А.С.', 2, 'Средний', 'На согласовании', datetime('now', 'localtime')),
      ('Ремонт', 'Диагностика блока питания микроскопа', 'user', 4, 'Высокий', 'Одобрено', datetime('now', 'localtime')),
      ('Закупка', 'Заказ набора фрез для ЧПУ', 'manager', 3, 'Низкий', 'На согласовании', datetime('now', 'localtime'))
    `);
  }

  // 8. Демо-журнал ТО
  const maintCount = await db.get('SELECT COUNT(*) as count FROM maintenance_logs');
  if (maintCount.count === 0) {
    await db.run(`
      INSERT INTO maintenance_logs (equipmentId, maintenanceType, performer, cost, startDate, endDate, status, description) VALUES
      (1, 'Плановое ТО', 'Инженер Соколов Д.В.', 15000, '2024-03-01', '2024-03-02', 'Завершено', 'Замена смазки, проверка биения шпинделя'),
      (2, 'Аварийный ремонт', 'АО ЛабСервис', 28000, '2024-04-05', NULL, 'В процессе', 'Ремонт входного тракта усилителя')
    `);
  }

  // 9. Демо-перемещения
  const trCount = await db.get('SELECT COUNT(*) as count FROM transfers');
  if (trCount.count === 0) {
    await db.run(`
      INSERT INTO transfers (equipmentId, fromLocationId, toLocationId, transferredBy, transferDate, reason, status) VALUES
      (1, 1, 2, 'admin', '2023-01-20', 'Ввод в эксплуатацию', 'Принято'),
      (4, 1, 3, 'manager', '2024-02-05', 'Передача в лабораторию', 'Принято')
    `);
  }

  // 10. Демо-заказы
  const ordCount = await db.get('SELECT COUNT(*) as count FROM orders');
  if (ordCount.count === 0) {
    await db.run(`
      INSERT INTO orders (orderNumber, supplierId, title, totalAmount, status, orderDate, createdBy) VALUES
      ('ORD-2024-001', 1, 'Поставка оснастки для токарного станка', 94000, 'В доставке', '2024-04-01', 'manager'),
      ('ORD-2024-002', 2, 'Калибровочные эталоны для лаборатории', 45000, 'Согласован', '2024-04-10', 'admin')
    `);
  }

  // 11. Демо-инвентаризации
  const audCount = await db.get('SELECT COUNT(*) as count FROM inventory_audits');
  if (audCount.count === 0) {
    await db.run(`
      INSERT INTO inventory_audits (auditDate, locationId, auditor, status, notes) VALUES
      ('2024-03-15', 2, 'Комиссия цеха №1', 'Завершена', 'Все единицы на месте, повреждений нет'),
      ('2024-04-01', 3, 'Иванов И.И.', 'В процессе', 'Идет сверка шильдиков приборов')
    `);
  }
}

module.exports = {
  seedDemoData
};
