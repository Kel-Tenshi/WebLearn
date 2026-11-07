const { getDb } = require('./db');

module.exports = {
  getAllAudits: async () => {
    try {
      return await getDb().all(`
        SELECT a.*, l.name AS locationName, l.building, l.room
        FROM inventory_audits a
        JOIN locations l ON a.locationId = l.id
        ORDER BY a.auditDate DESC, a.id DESC
      `);
    } catch (error) {
      console.error('db/audits getAllAudits:', error);
      throw error;
    }
  },

  getAuditById: async (id) => {
    try {
      return await getDb().get('SELECT * FROM inventory_audits WHERE id = ?', id);
    } catch (error) {
      console.error('db/audits getAuditById:', error);
      throw error;
    }
  },

  addAudit: async ({ auditDate, locationId, auditor, status, notes }) => {
    try {
      const res = await getDb().run(
        `INSERT INTO inventory_audits (auditDate, locationId, auditor, status, notes)
         VALUES (?, ?, ?, ?, ?)`,
        auditDate || new Date().toISOString().slice(0, 10),
        locationId,
        auditor,
        status || 'В процессе',
        notes || null
      );

      return { id: res.lastID, auditDate, locationId, auditor, status, notes };
    } catch (error) {
      console.error('db/audits addAudit:', error);
      throw error;
    }
  },

  updateAuditStatus: async (id, status, notes) => {
    try {
      const res = await getDb().run(
        'UPDATE inventory_audits SET status = ?, notes = COALESCE(?, notes) WHERE id = ?',
        status,
        notes,
        id
      );
      return res.changes;
    } catch (error) {
      console.error('db/audits updateAuditStatus:', error);
      throw error;
    }
  }
};
