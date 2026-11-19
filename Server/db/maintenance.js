const { getDb } = require('./db');

module.exports = {
  getAllMaintenanceLogs: async () => {
    try {
      return await getDb().all(`
        SELECT m.*, e.name AS equipmentName, e.invNumber, u.fullName AS performerName
        FROM maintenance_logs m
        JOIN equipment e ON m.equipmentId = e.id
        LEFT JOIN users u ON u.login = m.performer
        ORDER BY m.startDate DESC, m.id DESC
      `);
    } catch (error) {
      console.error('db/maintenance getAllMaintenanceLogs:', error);
      throw error;
    }
  },

  getMaintenanceById: async (id) => {
    try {
      return await getDb().get('SELECT * FROM maintenance_logs WHERE id = ?', id);
    } catch (error) {
      console.error('db/maintenance getMaintenanceById:', error);
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
      const startDateValue = startDate || new Date().toISOString().slice(0, 10);
      const statusValue = status || 'Запланировано';
      const costValue = cost || 0;

      const res = await getDb().run(`
        INSERT INTO maintenance_logs (equipmentId, maintenanceType, performer, cost, startDate, endDate, status, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        equipmentId,
        maintenanceType,
        performer,
        costValue,
        startDateValue,
        endDate || null,
        statusValue,
        description || null
      );

      // Запись создаётся в статусе «Запланировано», статус оборудования не меняется.
      // Перевод в «В процессе» выполняется отдельным действием.

      return {
        id: res.lastID,
        equipmentId,
        maintenanceType,
        performer,
        cost: costValue,
        startDate: startDateValue,
        endDate: endDate || null,
        status: statusValue,
        description: description || null
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

      const equipment = await getDb().get(
        'SELECT status FROM equipment WHERE id = ?',
        log.equipmentId
      );

      if (equipment) {
        // Ремонт начался — оборудование уходит в ремонт.
        if (status === 'В процессе' && equipment.status !== 'Списано') {
          await getDb().run('UPDATE equipment SET status = "В ремонте" WHERE id = ?', log.equipmentId);
        }

        // ТО завершено или отменено — возвращаем оборудование в работу.
        if (['Завершено', 'Отменено'].includes(status) && equipment.status === 'В ремонте') {
          await getDb().run('UPDATE equipment SET status = "Работает" WHERE id = ?', log.equipmentId);
        }
      }

      return res.changes;
    } catch (error) {
      console.error('db/maintenance updateMaintenanceStatus:', error);
      throw error;
    }
  }
};
