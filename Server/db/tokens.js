const { getDb } = require('./db');

const TABLE_NAME = 'tokens';

module.exports = {
  TABLE_NAME,

  // Найти id пользователя по refresh-токену
  getUserIdByToken: async (token) => {
    try {
      if (!token) return null;
      const result = await getDb().get(`SELECT * FROM ${TABLE_NAME} WHERE token = ?`, token);
      return result?.userId || null;
    } catch (error) {
      console.error('db/tokens getUserIdByToken:', error);
      throw error;
    }
  },

  // Удалить refresh-токен при логауте
  deleteByToken: async (token) => {
    try {
      await getDb().run(`DELETE FROM ${TABLE_NAME} WHERE token = ?`, token);
    } catch (error) {
      console.error('db/tokens deleteByToken:', error);
      throw error;
    }
  },

  // Удалить все токены пользователя (например, при смене пароля или удалении пользователя)
  deleteByUserId: async (userId) => {
    try {
      await getDb().run(`DELETE FROM ${TABLE_NAME} WHERE userId = ?`, userId);
    } catch (error) {
      console.error('db/tokens deleteByUserId:', error);
      throw error;
    }
  },

  // Сохранить или обновить refresh-токен для пользователя
  saveRefreshToken: async (userId, token) => {
    try {
      const tokenRow = await getDb().get(`SELECT * FROM ${TABLE_NAME} WHERE userId = ?`, userId);
      if (tokenRow) {
        await getDb().run(
          `UPDATE ${TABLE_NAME} SET token = ? WHERE userId = ?`,
          token,
          userId
        );
      } else {
        await getDb().run(
          `INSERT INTO ${TABLE_NAME} (token, userId) VALUES (?, ?)`,
          token,
          userId
        );
      }
      return token;
    } catch (error) {
      console.error('db/tokens saveRefreshToken:', error);
      throw error;
    }
  }
};