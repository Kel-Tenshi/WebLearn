const { openDb, getDb } = require('./connection');
const { createSchema } = require('./schema');
const { runMigrations } = require('./migrations');
const { seedDemoData } = require('./seed');
const {
  hashPassword,
  verifyPassword,
  isLegacyPasswordHash
} = require('../utils/passwords');

const initDb = async () => {
  try {
    const db = await openDb();

    await createSchema(db);
    await runMigrations(db);
    await seedDemoData(db);

    return db;
  } catch (error) {
    console.error('db/db initDb error:', error);
    throw error;
  }
};

// Порядок важен: сначала зависимые таблицы, затем справочники
const RESET_TABLES = [
  'tokens',
  'inventory_audits',
  'orders',
  'transfers',
  'maintenance_logs',
  'requests',
  'equipment',
  'suppliers',
  'users',
  'categories',
  'locations',
  'departments'
];

// Полный сброс БД: чистим все таблицы и заново запускаем initDb,
// который создаёт структуру и заполняет её демонстрационными данными.
async function resetDb() {
  const db = getDb();
  if (!db) {
    throw new Error('База данных не инициализирована');
  }

  await db.exec('PRAGMA foreign_keys = OFF;');
  try {
    for (const table of RESET_TABLES) {
      await db.run(`DELETE FROM ${table}`);
    }
    // Сбрасываем счётчики AUTOINCREMENT, чтобы id снова начинались с 1
    await db.run('DELETE FROM sqlite_sequence').catch(() => {});
  } finally {
    await db.exec('PRAGMA foreign_keys = ON;');
  }

  await initDb();
  return true;
}

module.exports = {
  initDb,
  resetDb,
  getDb,
  hashPassword,
  verifyPassword,
  isLegacyPasswordHash
};
