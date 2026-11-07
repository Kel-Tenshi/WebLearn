const { getDb } = require('./db');

module.exports = {
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
      console.error('db/transfers getAllTransfers:', error);
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

      return {
        id: res.lastID,
        equipmentId,
        fromLocationId,
        toLocationId,
        transferredBy,
        transferDate: today,
        status: transferStatus
      };
    } catch (error) {
      console.error('db/transfers addTransfer:', error);
      throw error;
    }
  }
};
