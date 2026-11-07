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
  }
};
