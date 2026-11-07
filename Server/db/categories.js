const { getDb } = require('./db');

module.exports = {
  getAllCategories: async () => {
    try {
      return await getDb().all('SELECT * FROM categories ORDER BY name');
    } catch (error) {
      console.error('db/categories getAllCategories:', error);
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
      console.error('db/categories addCategory:', error);
      throw error;
    }
  }
};
