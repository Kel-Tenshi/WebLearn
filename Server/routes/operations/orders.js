const express = require('express');
const requireRole = require('../../middleware/requireRole');
const ordersDb = require('../../db/orders');
const { ORDER_STATUSES } = require('../../constants');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await ordersDb.getAllOrders();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
});

router.post('/', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { orderNumber, supplierId, title, totalAmount, status } = req.body || {};

    if (!orderNumber || !title) {
      return res.status(400).json({ message: 'Укажите номер заказа и назначение' });
    }

    const item = await ordersDb.addOrder({
      orderNumber: String(orderNumber).trim(),
      supplierId: supplierId ? Number(supplierId) : null,
      title: String(title).trim(),
      totalAmount: Number(totalAmount) || 0,
      status: status || 'Черновик',
      createdBy: req.userLogin
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при создании заказа' });
  }
});

router.patch('/:id/status', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { status } = req.body || {};

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Недопустимый статус заказа' });
    }

    const changes = await ordersDb.updateOrderStatus(Number(req.params.id), status);
    if (!changes) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    res.json({ ok: true, status });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении статуса заказа' });
  }
});

module.exports = router;
