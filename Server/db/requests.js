const { getDb } = require('./db');

const TABLE_NAME = 'requests';

module.exports = {
  TABLE_NAME,

  // Получить все заявки (новые сверху)
  getAllRequests: async () => {
    try {
      return await getDb().all(`SELECT * FROM ${TABLE_NAME} ORDER BY id DESC`);
    } catch (error) {
      console.error('db/requests getAllRequests:', error);
      throw error;
    }
  },

  // Получить заявки одного заявителя (для сотрудников — они видят только свои)
  getRequestsByApplicant: async (applicant) => {
    try {
      return await getDb().all(
        `SELECT * FROM ${TABLE_NAME} WHERE applicant = ? ORDER BY id DESC`,
        applicant
      );
    } catch (error) {
      console.error('db/requests getRequestsByApplicant:', error);
      throw error;
    }
  },

  // Найти заявку по ID
  getRequestById: async (id) => {
    try {
      return await getDb().get(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, id);
    } catch (error) {
      console.error('db/requests getRequestById:', error);
      throw error;
    }
  },

  // Создать заявку. Статус по умолчанию — «На согласовании», дата ставится самой базой
  addRequest: async ({ type, title, applicant, priority }) => {
    try {
      const result = await getDb().run(
        `INSERT INTO ${TABLE_NAME} (type, title, applicant, priority, status, createdAt)
         VALUES (?, ?, ?, ?, 'На согласовании', datetime('now', 'localtime'))`,
        type,
        title,
        applicant,
        priority
      );
      return await getDb().get(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, result.lastID);
    } catch (error) {
      console.error('db/requests addRequest:', error);
      throw error;
    }
  },

  // Обновить статус заявки (Одобрено / Отклонено / На согласовании).
  // Возвращает количество изменённых строк (0 — заявки нет)
  updateRequestStatus: async (id, status) => {
    try {
      const result = await getDb().run(
        `UPDATE ${TABLE_NAME} SET status = ? WHERE id = ?`,
        status,
        id
      );
      return result.changes;
    } catch (error) {
      console.error('db/requests updateRequestStatus:', error);
      throw error;
    }
  }
};
