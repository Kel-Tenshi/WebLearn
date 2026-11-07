const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db;

async function openDb() {
  if (!db) {
    db = await open({
      filename: path.join(__dirname, 'db.sqlite'),
      driver: sqlite3.Database
    });

    // Включаем поддержку внешних ключей в SQLite
    await db.exec('PRAGMA foreign_keys = ON;');
  }

  return db;
}

const getDb = () => db;

module.exports = {
  openDb,
  getDb
};
