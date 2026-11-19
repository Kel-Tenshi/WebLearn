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

  getLocationById: async (id) => {
    try {
      return await getDb().get('SELECT * FROM locations WHERE id = ?', id);
    } catch (error) {
      console.error('db/locations getLocationById:', error);
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
  },

  updateLocation: async (id, { name, building, room, departmentId }) => {
    try {
      const res = await getDb().run(
        'UPDATE locations SET name = ?, building = ?, room = ?, departmentId = ? WHERE id = ?',
        name,
        building,
        room || null,
        departmentId || null,
        id
      );

      if (!res.changes) return null;
      return { id, name, building, room, departmentId };
    } catch (error) {
      console.error('db/locations updateLocation:', error);
      throw error;
    }
  },

  deleteLocation: async (id) => {
    try {
      const res = await getDb().run('DELETE FROM locations WHERE id = ?', id);
      return res.changes;
    } catch (error) {
      console.error('db/locations deleteLocation:', error);
      throw error;
    }
  }
};
