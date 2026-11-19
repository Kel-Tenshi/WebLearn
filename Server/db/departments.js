const { getDb } = require('./db');

module.exports = {
  getAllDepartments: async () => {
    try {
      return await getDb().all('SELECT * FROM departments ORDER BY name');
    } catch (error) {
      console.error('db/departments getAllDepartments:', error);
      throw error;
    }
  },

  getDepartmentById: async (id) => {
    try {
      return await getDb().get('SELECT * FROM departments WHERE id = ?', id);
    } catch (error) {
      console.error('db/departments getDepartmentById:', error);
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
      console.error('db/departments addDepartment:', error);
      throw error;
    }
  },

  updateDepartment: async (id, { name, code, headName }) => {
    try {
      const res = await getDb().run(
        'UPDATE departments SET name = ?, code = ?, headName = ? WHERE id = ?',
        name,
        code,
        headName || null,
        id
      );

      if (!res.changes) return null;
      return { id, name, code, headName };
    } catch (error) {
      console.error('db/departments updateDepartment:', error);
      throw error;
    }
  },

  deleteDepartment: async (id) => {
    try {
      const res = await getDb().run('DELETE FROM departments WHERE id = ?', id);
      return res.changes;
    } catch (error) {
      console.error('db/departments deleteDepartment:', error);
      throw error;
    }
  }
};
