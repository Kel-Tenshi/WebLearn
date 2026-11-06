const { getDb } = require('./db');

const TABLE_NAME = 'equipment';

module.exports = {
  TABLE_NAME,

  // Получить всё оборудование со связанными названиями категорий и помещений
  getAllEquipment: async () => {
    try {
      return await getDb().all(`
        SELECT e.*,
               c.name AS categoryName, c.code AS categoryCode,
               l.name AS locationName, l.building AS locationBuilding, l.room AS locationRoom,
               d.name AS departmentName
        FROM ${TABLE_NAME} e
        LEFT JOIN categories c ON e.categoryId = c.id
        LEFT JOIN locations l ON e.locationId = l.id
        LEFT JOIN departments d ON l.departmentId = d.id
        ORDER BY e.id DESC
      `);
    } catch (error) {
      console.error('db/equipment getAllEquipment:', error);
      throw error;
    }
  },

  // Найти оборудование по ID со всеми связями
  getEquipmentById: async (id) => {
    try {
      return await getDb().get(`
        SELECT e.*,
               c.name AS categoryName,
               l.name AS locationName,
               d.name AS departmentName
        FROM ${TABLE_NAME} e
        LEFT JOIN categories c ON e.categoryId = c.id
        LEFT JOIN locations l ON e.locationId = l.id
        LEFT JOIN departments d ON l.departmentId = d.id
        WHERE e.id = ?
      `, id);
    } catch (error) {
      console.error('db/equipment getEquipmentById:', error);
      throw error;
    }
  },

  // Найти оборудование по инвентарному номеру
  getEquipmentByInvNumber: async (invNumber) => {
    try {
      return await getDb().get(`SELECT * FROM ${TABLE_NAME} WHERE invNumber = ?`, invNumber);
    } catch (error) {
      console.error('db/equipment getEquipmentByInvNumber:', error);
      throw error;
    }
  },

  // Добавить новое оборудование с поддержкой внешних ключей
  addEquipment: async ({ invNumber, serialNumber, name, categoryId, locationId, status, purchaseCost, commissioningDate }) => {
    try {
      const res = await getDb().run(`
        INSERT INTO ${TABLE_NAME}
          (invNumber, serialNumber, name, categoryId, locationId, status, purchaseCost, commissioningDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        invNumber,
        serialNumber || null,
        name,
        categoryId || null,
        locationId || null,
        status || 'Работает',
        purchaseCost || 0,
        commissioningDate || new Date().toISOString().slice(0, 10)
      );

      return {
        id: res.lastID,
        invNumber,
        serialNumber,
        name,
        categoryId,
        locationId,
        status,
        purchaseCost,
        commissioningDate
      };
    } catch (error) {
      console.error('db/equipment addEquipment:', error);
      throw error;
    }
  },

  // Обновить данные оборудования
  updateEquipment: async (id, { invNumber, serialNumber, name, categoryId, locationId, status, purchaseCost, commissioningDate }) => {
    try {
      const res = await getDb().run(`
        UPDATE ${TABLE_NAME}
        SET invNumber = ?,
            serialNumber = ?,
            name = ?,
            categoryId = ?,
            locationId = ?,
            status = ?,
            purchaseCost = ?,
            commissioningDate = ?
        WHERE id = ?
      `,
        invNumber,
        serialNumber || null,
        name,
        categoryId || null,
        locationId || null,
        status,
        purchaseCost || 0,
        commissioningDate || null,
        id
      );
      return res.changes;
    } catch (error) {
      console.error('db/equipment updateEquipment:', error);
      throw error;
    }
  },

  // Удалить оборудование
  deleteEquipment: async (id) => {
    try {
      const res = await getDb().run(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, id);
      return res.changes;
    } catch (error) {
      console.error('db/equipment deleteEquipment:', error);
      throw error;
    }
  }
};