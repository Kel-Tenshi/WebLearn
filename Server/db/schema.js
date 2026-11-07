async function createSchema(db) {
  // 1. Подразделения (departments)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      headName TEXT
    )
  `);

  // 2. Локации / склады / цеха (locations)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      building TEXT NOT NULL,
      room TEXT,
      departmentId INTEGER REFERENCES departments(id) ON DELETE SET NULL
    )
  `);

  // 3. Категории оборудования (categories)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      description TEXT
    )
  `);

  // 4. Пользователи (users)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'employee',
      fullName TEXT,
      departmentId INTEGER REFERENCES departments(id) ON DELETE SET NULL
    )
  `);

  // 5. Токены сессий (tokens)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL
    )
  `);

  // 6. Поставщики и подрядчики (suppliers)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      inn TEXT UNIQUE,
      contactPerson TEXT,
      phone TEXT,
      email TEXT
    )
  `);

  // 7. Оборудование (equipment)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invNumber TEXT UNIQUE NOT NULL,
      serialNumber TEXT,
      name TEXT NOT NULL,
      categoryId INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      locationId INTEGER REFERENCES locations(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'Работает',
      purchaseCost REAL DEFAULT 0,
      commissioningDate TEXT
    )
  `);

  // 8. Заявки (requests)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      applicant TEXT NOT NULL,
      equipmentId INTEGER REFERENCES equipment(id) ON DELETE SET NULL,
      priority TEXT DEFAULT 'Средний',
      status TEXT DEFAULT 'На согласовании',
      createdAt TEXT
    )
  `);

  // 9. Журнал технического обслуживания и ремонта (maintenance_logs)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS maintenance_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipmentId INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
      maintenanceType TEXT NOT NULL,
      performer TEXT NOT NULL,
      cost REAL DEFAULT 0,
      startDate TEXT NOT NULL,
      endDate TEXT,
      status TEXT DEFAULT 'Запланировано',
      description TEXT
    )
  `);

  // 10. Перемещения оборудования (transfers)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipmentId INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
      fromLocationId INTEGER REFERENCES locations(id),
      toLocationId INTEGER NOT NULL REFERENCES locations(id),
      transferredBy TEXT NOT NULL,
      transferDate TEXT NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'Принято'
    )
  `);

  // 11. Заказы на закупку (orders)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderNumber TEXT UNIQUE NOT NULL,
      supplierId INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      totalAmount REAL DEFAULT 0,
      status TEXT DEFAULT 'Черновик',
      orderDate TEXT NOT NULL,
      createdBy TEXT NOT NULL
    )
  `);

  // 12. Инвентаризации (inventory_audits)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS inventory_audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      auditDate TEXT NOT NULL,
      locationId INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      auditor TEXT NOT NULL,
      status TEXT DEFAULT 'В процессе',
      notes TEXT
    )
  `);
}

module.exports = {
  createSchema
};
