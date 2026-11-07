const { getDb } = require('./db');

module.exports = {
  getAllLocations: async () => {
    try {
      return await getDb().all(`
        SELECT l.*, d.name AS departmentName, d.code AS departmentCode
        FROM locations l
        LEFT JOIN departments d ON l.departmentId = d.id
        ORDER BY l.building, l.name
      `);
    } catch (error) {
      console.error('db/locations getAllLocations:', error);
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
      console.error('db/locations addLocation:', error);
      throw error;
    }
  }
};
