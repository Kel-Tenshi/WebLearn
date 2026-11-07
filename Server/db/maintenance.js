const { getDb } = require('./db');

module.exports = {
  getAllMaintenanceLogs: async () => {
    try {
      return await getDb().all(`
        SELECT m.*, e.name AS equipmentName, e.invNumber
        FROM maintenance_logs m
        JOIN equipment e ON m.equipmentId = e.id
        ORDER BY m.startDate DESC, m.id DESC
      `);
    } catch (error) {
      console.error('db/maintenance getAllMaintenanceLogs:', error);
      throw error;
    }
  },

  getMaintenanceByEquipment: async (equipmentId) => {
    try {
      return await getDb().all(`
        SELECT * FROM maintenance_logs
        WHERE equipmentId = ?
        ORDER BY startDate DESC
      `, equipmentId);
    } catch (error) {
      console.error('db/maintenance getMaintenanceByEquipment:', error);
      throw error;
    }
  },

  addMaintenanceLog: async ({
    equipmentId,
    maintenanceType,
    performer,
    cost,
    startDate,
    endDate,
    status,
    description
  }) => {
    try {
      const res = await getDb().run(`
        INSERT INTO maintenance_logs (equipmentId, maintenanceType, performer, cost, startDate, endDate, status, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        equipmentId,
        maintenanceType,
        performer,
        cost || 0,
        startDate || new Date().toISOString().slice(0, 10),
        endDate || null,
        status || 'Запланировано',
        description || null
      );

      // Если начат ремонт — автоматически меняем статус оборудования на "В ремонте"
      if (status === 'В процессе') {
        await getDb().run('UPDATE equipment SET status = "В ремонте" WHERE id = ?', equipmentId);
      }

      return {
        id: res.lastID,
        equipmentId,
        maintenanceType,
        performer,
        cost,
        startDate,
        endDate,
        status,
        description
      };
    } catch (error) {
      console.error('db/maintenance addMaintenanceLog:', error);
      throw error;
    }
  },

  updateMaintenanceStatus: async (id, status, endDate) => {
    try {
      const log = await getDb().get('SELECT * FROM maintenance_logs WHERE id = ?', id);
      if (!log) return 0;

      const dateToSet = endDate || (status === 'Завершено' ? new Date().toISOString().slice(0, 10) : null);
      const res = await getDb().run(
        'UPDATE maintenance_logs SET status = ?, endDate = COALESCE(?, endDate) WHERE id = ?',
        status,
        dateToSet,
        id
      );

      // Если ТО успешно завершено — возвращаем оборудование в статус "Работает"
      if (status === 'Завершено') {
        await getDb().run('UPDATE equipment SET status = "Работает" WHERE id = ?', log.equipmentId);
      }

      return res.changes;
    } catch (error) {
      console.error('db/maintenance updateMaintenanceStatus:', error);
      throw error;
    }
  }
};
