const { getDb } = require('./db');

module.exports = {
  getAllOrders: async () => {
    try {
      return await getDb().all(`
        SELECT o.*, s.name AS supplierName, s.phone AS supplierPhone
        FROM orders o
        LEFT JOIN suppliers s ON o.supplierId = s.id
        ORDER BY o.orderDate DESC, o.id DESC
      `);
    } catch (error) {
      console.error('db/orders getAllOrders:', error);
      throw error;
    }
  },

  getOrderById: async (id) => {
    try {
      return await getDb().get('SELECT * FROM orders WHERE id = ?', id);
    } catch (error) {
      console.error('db/orders getOrderById:', error);
      throw error;
    }
  },

  addOrder: async ({ orderNumber, supplierId, title, totalAmount, status, createdBy }) => {
    try {
      const orderDate = new Date().toISOString().slice(0, 10);
      const res = await getDb().run(`
        INSERT INTO orders (orderNumber, supplierId, title, totalAmount, status, orderDate, createdBy)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        orderNumber,
        supplierId || null,
        title,
        totalAmount || 0,
        status || 'Черновик',
        orderDate,
        createdBy
      );

      return {
        id: res.lastID,
        orderNumber,
        supplierId,
        title,
        totalAmount,
        status,
        orderDate,
        createdBy
      };
    } catch (error) {
      console.error('db/orders addOrder:', error);
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const res = await getDb().run('UPDATE orders SET status = ? WHERE id = ?', status, id);
      return res.changes;
    } catch (error) {
      console.error('db/orders updateOrderStatus:', error);
      throw error;
    }
  }
};
