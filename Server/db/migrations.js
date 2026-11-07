// Добавляет колонку в таблицу при необходимости (мягкая миграция)
async function addColumnIfMissing(db, table, column, definition) {
  const columns = await db.all(`PRAGMA table_info(${table})`);
  const exists = columns.some((c) => c.name === column);

  if (!exists) {
    await db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

async function runMigrations(db) {
  await addColumnIfMissing(db, 'users', 'fullName', 'TEXT');
  await addColumnIfMissing(
    db,
    'users',
    'departmentId',
    'INTEGER REFERENCES departments(id) ON DELETE SET NULL'
  );
  await addColumnIfMissing(db, 'equipment', 'serialNumber', 'TEXT');
  await addColumnIfMissing(
    db,
    'equipment',
    'categoryId',
    'INTEGER REFERENCES categories(id) ON DELETE SET NULL'
  );
  await addColumnIfMissing(
    db,
    'equipment',
    'locationId',
    'INTEGER REFERENCES locations(id) ON DELETE SET NULL'
  );
  await addColumnIfMissing(db, 'equipment', 'purchaseCost', 'REAL DEFAULT 0');
  await addColumnIfMissing(db, 'equipment', 'commissioningDate', 'TEXT');
  await addColumnIfMissing(
    db,
    'requests',
    'equipmentId',
    'INTEGER REFERENCES equipment(id) ON DELETE SET NULL'
  );
}

module.exports = {
  runMigrations
};
