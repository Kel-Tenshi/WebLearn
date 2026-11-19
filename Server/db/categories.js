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

  getCategoryById: async (id) => {
    try {
      return await getDb().get('SELECT * FROM categories WHERE id = ?', id);
    } catch (error) {
      console.error('db/categories getCategoryById:', error);
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
  },

  updateCategory: async (id, { name, code, description }) => {
    try {
      const res = await getDb().run(
        'UPDATE categories SET name = ?, code = ?, description = ? WHERE id = ?',
        name,
        code,
        description || null,
        id
      );

      if (!res.changes) return null;
      return { id, name, code, description };
    } catch (error) {
      console.error('db/categories updateCategory:', error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const res = await getDb().run('DELETE FROM categories WHERE id = ?', id);
      return res.changes;
    } catch (error) {
      console.error('db/categories deleteCategory:', error);
      throw error;
    }
  }
};
