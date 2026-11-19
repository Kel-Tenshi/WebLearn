const { getDb } = require('./db');

module.exports = {
  getAllSuppliers: async () => {
    try {
      return await getDb().all('SELECT * FROM suppliers ORDER BY name');
    } catch (error) {
      console.error('db/suppliers getAllSuppliers:', error);
      throw error;
    }
  },

  getSupplierById: async (id) => {
    try {
      return await getDb().get('SELECT * FROM suppliers WHERE id = ?', id);
    } catch (error) {
      console.error('db/suppliers getSupplierById:', error);
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
      console.error('db/suppliers addSupplier:', error);
      throw error;
    }
  },

  updateSupplier: async (id, { name, inn, contactPerson, phone, email }) => {
    try {
      const res = await getDb().run(
        `UPDATE suppliers
         SET name = ?, inn = ?, contactPerson = ?, phone = ?, email = ?
         WHERE id = ?`,
        name,
        inn || null,
        contactPerson || null,
        phone || null,
        email || null,
        id
      );

      if (!res.changes) return null;
      return { id, name, inn, contactPerson, phone, email };
    } catch (error) {
      console.error('db/suppliers updateSupplier:', error);
      throw error;
    }
  },

  deleteSupplier: async (id) => {
    try {
      const res = await getDb().run('DELETE FROM suppliers WHERE id = ?', id);
      return res.changes;
    } catch (error) {
      console.error('db/suppliers deleteSupplier:', error);
      throw error;
    }
  }
};
