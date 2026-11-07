const { getDb } = require('./db');

const TABLE_NAME = 'requests';

module.exports = {
  TABLE_NAME,

  // Список заявок с данными оборудования.
  // Если передан applicant — возвращаются только заявки этого сотрудника.
  getRequestsWithEquipment: async (applicant = null) => {
    try {
      let query = `
        SELECT r.*, e.name AS equipmentName, e.invNumber
        FROM ${TABLE_NAME} r
        LEFT JOIN equipment e ON r.equipmentId = e.id
      `;
      const params = [];

      if (applicant) {
        query += ' WHERE r.applicant = ?';
        params.push(applicant);
      }

      query += ' ORDER BY r.id DESC';

      return await getDb().all(query, ...params);
    } catch (error) {
      console.error('db/requests getRequestsWithEquipment:', error);
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
  addRequest: async ({ type, title, applicant, equipmentId, priority }) => {
    try {
      const result = await getDb().run(
        `INSERT INTO ${TABLE_NAME} (type, title, applicant, equipmentId, priority, status, createdAt)
         VALUES (?, ?, ?, ?, ?, 'На согласовании', datetime('now', 'localtime'))`,
        type,
        title,
        applicant,
        equipmentId || null,
        priority
      );

      return await getDb().get(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, result.lastID);
    } catch (error) {
      console.error('db/requests addRequest:', error);
      throw error;
    }
  },

  // Обновить статус заявки. Возвращает количество изменённых строк (0 — заявки нет)
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
