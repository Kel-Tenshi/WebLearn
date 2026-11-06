const { getDb } = require('./db');

module.exports = {
  // === 1. Журнал технического обслуживания (maintenance_logs) ===
  getAllMaintenanceLogs: async () => {
    try {
      return await getDb().all(`
        SELECT m.*, e.name AS equipmentName, e.invNumber
        FROM maintenance_logs m
        JOIN equipment e ON m.equipmentId = e.id
        ORDER BY m.startDate DESC, m.id DESC
      `);
    } catch (error) {
      console.error('db/operations getAllMaintenanceLogs:', error);
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
      console.error('db/operations getMaintenanceByEquipment:', error);
      throw error;
    }
  },

  addMaintenanceLog: async ({ equipmentId, maintenanceType, performer, cost, startDate, endDate, status, description }) => {
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

      return { id: res.lastID, equipmentId, maintenanceType, performer, cost, startDate, endDate, status, description };
    } catch (error) {
      console.error('db/operations addMaintenanceLog:', error);
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
      console.error('db/operations updateMaintenanceStatus:', error);
      throw error;
    }
  },

  // === 2. Перемещения оборудования (transfers) ===
  getAllTransfers: async () => {
    try {
      return await getDb().all(`
        SELECT t.*,
               e.name AS equipmentName, e.invNumber,
               fl.name AS fromLocationName,
               tl.name AS toLocationName
        FROM transfers t
        JOIN equipment e ON t.equipmentId = e.id
        LEFT JOIN locations fl ON t.fromLocationId = fl.id
        JOIN locations tl ON t.toLocationId = tl.id
        ORDER BY t.transferDate DESC, t.id DESC
      `);
    } catch (error) {
      console.error('db/operations getAllTransfers:', error);
      throw error;
    }
  },

  addTransfer: async ({ equipmentId, toLocationId, transferredBy, reason, status }) => {
    try {
      // Автоматически определяем текущее местонахождение оборудования
      const eq = await getDb().get('SELECT locationId FROM equipment WHERE id = ?', equipmentId);
      const fromLocationId = eq ? eq.locationId : null;
      const transferStatus = status || 'Принято';
      const today = new Date().toISOString().slice(0, 10);

      const res = await getDb().run(`
        INSERT INTO transfers (equipmentId, fromLocationId, toLocationId, transferredBy, transferDate, reason, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        equipmentId,
        fromLocationId,
        toLocationId,
        transferredBy,
        today,
        reason || null,
        transferStatus
      );

      // Если перемещение принято — обновляем текущее местонахождение оборудования
      if (transferStatus === 'Принято') {
        await getDb().run('UPDATE equipment SET locationId = ? WHERE id = ?', toLocationId, equipmentId);
      }

      return { id: res.lastID, equipmentId, fromLocationId, toLocationId, transferredBy, transferDate: today, status: transferStatus };
    } catch (error) {
      console.error('db/operations addTransfer:', error);
      throw error;
    }
  },

  // === 3. Заказы на закупку (orders) ===
  getAllOrders: async () => {
    try {
      return await getDb().all(`
        SELECT o.*, s.name AS supplierName, s.phone AS supplierPhone
        FROM orders o
        LEFT JOIN suppliers s ON o.supplierId = s.id
        ORDER BY o.orderDate DESC, o.id DESC
      `);
    } catch (error) {
      console.error('db/operations getAllOrders:', error);
      throw error;
    }
  },

  addOrder: async ({ orderNumber, supplierId, title, totalAmount, status, createdBy }) => {
    try {
      const orderDate = new Date().toISOString().slice(0, 10);
      const res = await getDb().run(`
        INSERT INTO orders (orderNumber, supplierId, title, totalAmount, status, orderDate, createdBy)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        orderNumber,
        supplierId || null,
        title,
        totalAmount || 0,
        status || 'Черновик',
        orderDate,
        createdBy
      );
      return { id: res.lastID, orderNumber, supplierId, title, totalAmount, status, orderDate, createdBy };
    } catch (error) {
      console.error('db/operations addOrder:', error);
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const res = await getDb().run('UPDATE orders SET status = ? WHERE id = ?', status, id);
      return res.changes;
    } catch (error) {
      console.error('db/operations updateOrderStatus:', error);
      throw error;
    }
  }
};