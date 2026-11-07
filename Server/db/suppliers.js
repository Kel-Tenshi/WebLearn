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
  }
};
