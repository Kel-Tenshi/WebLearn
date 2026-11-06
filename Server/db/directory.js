const { getDb } = require('./db');

module.exports = {
  // === 1. Подразделения (departments) ===
  getAllDepartments: async () => {
    try {
      return await getDb().all('SELECT * FROM departments ORDER BY name');
    } catch (error) {
      console.error('db/directory getAllDepartments:', error);
      throw error;
    }
  },

  addDepartment: async ({ name, code, headName }) => {
    try {
      const res = await getDb().run(
        'INSERT INTO departments (name, code, headName) VALUES (?, ?, ?)',
        name,
        code,
        headName || null
      );
      return { id: res.lastID, name, code, headName };
    } catch (error) {
      console.error('db/directory addDepartment:', error);
      throw error;
    }
  },

  deleteDepartment: async (id) => {
    try {
      const res = await getDb().run('DELETE FROM departments WHERE id = ?', id);
      return res.changes;
    } catch (error) {
      console.error('db/directory deleteDepartment:', error);
      throw error;
    }
  },

  // === 2. Помещения и локации (locations) ===
  getAllLocations: async () => {
    try {
      return await getDb().all(`
        SELECT l.*, d.name AS departmentName, d.code AS departmentCode
        FROM locations l
        LEFT JOIN departments d ON l.departmentId = d.id
        ORDER BY l.building, l.name
      `);
    } catch (error) {
      console.error('db/directory getAllLocations:', error);
      throw error;
    }
  },

  addLocation: async ({ name, building, room, departmentId }) => {
    try {
      const res = await getDb().run(
        'INSERT INTO locations (name, building, room, departmentId) VALUES (?, ?, ?, ?)',
        name,
        building,
        room || null,
        departmentId || null
      );
      return { id: res.lastID, name, building, room, departmentId };
    } catch (error) {
      console.error('db/directory addLocation:', error);
      throw error;
    }
  },

  deleteLocation: async (id) => {
    try {
      const res = await getDb().run('DELETE FROM locations WHERE id = ?', id);
      return res.changes;
    } catch (error) {
      console.error('db/directory deleteLocation:', error);
      throw error;
    }
  },

  // === 3. Категории оборудования (categories) ===
  getAllCategories: async () => {
    try {
      return await getDb().all('SELECT * FROM categories ORDER BY name');
    } catch (error) {
      console.error('db/directory getAllCategories:', error);
      throw error;
    }
  },

  addCategory: async ({ name, code, description }) => {
    try {
      const res = await getDb().run(
        'INSERT INTO categories (name, code, description) VALUES (?, ?, ?)',
        name,
        code,
        description || null
      );
      return { id: res.lastID, name, code, description };
    } catch (error) {
      console.error('db/directory addCategory:', error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const res = await getDb().run('DELETE FROM categories WHERE id = ?', id);
      return res.changes;
    } catch (error) {
      console.error('db/directory deleteCategory:', error);
      throw error;
    }
  },

  // === 4. Поставщики и сервисные центры (suppliers) ===
  getAllSuppliers: async () => {
    try {
      return await getDb().all('SELECT * FROM suppliers ORDER BY name');
    } catch (error) {
      console.error('db/directory getAllSuppliers:', error);
      throw error;
    }
  },

  addSupplier: async ({ name, inn, contactPerson, phone, email }) => {
    try {
      const res = await getDb().run(
        'INSERT INTO suppliers (name, inn, contactPerson, phone, email) VALUES (?, ?, ?, ?, ?)',
        name,
        inn || null,
        contactPerson || null,
        phone || null,
        email || null
      );
      return { id: res.lastID, name, inn, contactPerson, phone, email };
    } catch (error) {
      console.error('db/directory addSupplier:', error);
      throw error;
    }
  },

  deleteSupplier: async (id) => {
    try {
      const res = await getDb().run('DELETE FROM suppliers WHERE id = ?', id);
      return res.changes;
    } catch (error) {
      console.error('db/directory deleteSupplier:', error);
      throw error;
    }
  },

  // === 5. Инвентаризации (inventory_audits) ===
  getAllAudits: async () => {
    try {
      return await getDb().all(`
        SELECT a.*, l.name AS locationName, l.building, l.room
        FROM inventory_audits a
        JOIN locations l ON a.locationId = l.id
        ORDER BY a.auditDate DESC, a.id DESC
      `);
    } catch (error) {
      console.error('db/directory getAllAudits:', error);
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
      console.error('db/directory addAudit:', error);
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
      console.error('db/directory updateAuditStatus:', error);
      throw error;
    }
  }
};