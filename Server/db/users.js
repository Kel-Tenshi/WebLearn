const { getDb, hashPassword } = require('./db');

const TABLE_NAME = 'users';

module.exports = {
  TABLE_NAME,

  // Создать пользователя (пароль сохраняется в виде sha256-хэша).
  // Роль по умолчанию — сотрудник.
  addUser: async (login, password, role = 'employee') => {
    try {
      const hashedPassword = hashPassword(password);
      const result = await getDb().run(
        `INSERT INTO ${TABLE_NAME} (login, password, role) VALUES (?, ?, ?)`,
        login,
        hashedPassword,
        role
      );
      return { id: result.lastID, login, role };
    } catch (error) {
      console.error('db/users addUser:', error);
      throw error;
    }
  },

  // Удалить пользователя по ID (возвращает количество удалённых строк)
  deleteUser: async (id) => {
    try {
      // Удаляем активные токены пользователя
      await getDb().run(`DELETE FROM tokens WHERE userId = ?`, id);
      // Удаляем самого пользователя
      const result = await getDb().run(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, id);
      return result.changes;
    } catch (error) {
      console.error('db/users deleteUser:', error);
      throw error;
    }
  },

  // Список пользователей (без паролей)
  getUsers: async () => {
    try {
      return await getDb().all(`SELECT id, login, role FROM ${TABLE_NAME} ORDER BY id`);
    } catch (error) {
      console.error('db/users getUsers:', error);
      throw error;
    }
  },

  // Найти пользователя по логину (вместе с хэшем пароля — нужен для входа)
  getUserByLogin: async (login) => {
    try {
      return await getDb().get(`SELECT * FROM ${TABLE_NAME} WHERE login = ?`, login);
    } catch (error) {
      console.error('db/users getUserByLogin:', error);
      throw error;
    }
  },

  // Найти пользователя по id (без пароля)
  getUserById: async (id) => {
    try {
      return await getDb().get(`SELECT id, login, role FROM ${TABLE_NAME} WHERE id = ?`, id);
    } catch (error) {
      console.error('db/users getUserById:', error);
      throw error;
    }
  },

  // Сменить роль пользователя. Возвращает количество изменённых строк (0 — пользователя нет)
  updateUserRole: async (id, role) => {
    try {
      const result = await getDb().run(
        `UPDATE ${TABLE_NAME} SET role = ? WHERE id = ?`,
        role,
        id
      );
      return result.changes;
    } catch (error) {
      console.error('db/users updateUserRole:', error);
      throw error;
    }
  }
};
