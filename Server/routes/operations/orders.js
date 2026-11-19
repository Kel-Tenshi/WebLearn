const express = require('express');
const requireRole = require('../../middleware/requireRole');
const ordersDb = require('../../db/orders');
const { getSupplierById } = require('../../db/suppliers');
const { ORDER_STATUSES, MANAGER_ROLES } = require('../../constants');
const { getNextStatuses, canTransition } = require('../../stateMachine');
const { isUniqueError, isForeignKeyError } = require('../../utils/dbErrors');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await ordersDb.getAllOrders();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
});

router.post('/', requireRole(...MANAGER_ROLES), async (req, res) => {
  try {
    const { orderNumber, supplierId, title, totalAmount } = req.body || {};

    if (!orderNumber || !title) {
      return res.status(400).json({ message: 'Укажите номер заказа и назначение' });
    }

    if (supplierId) {
      const supplier = await getSupplierById(Number(supplierId));
      if (!supplier) {
        return res.status(400).json({ message: 'Поставщик не найден' });
      }
    }

    const item = await ordersDb.addOrder({
      orderNumber: String(orderNumber).trim(),
      supplierId: supplierId ? Number(supplierId) : null,
      title: String(title).trim(),
      totalAmount: Number(totalAmount) || 0,
      status: 'Черновик',
      createdBy: req.userLogin
    });

    res.status(201).json(item);
  } catch (err) {
    if (isUniqueError(err)) {
      return res.status(409).json({ message: 'Заказ с таким номером уже существует' });
    }
    if (isForeignKeyError(err)) {
      return res.status(400).json({ message: 'Поставщик не найден' });
    }
    res.status(500).json({ message: 'Ошибка при создании заказа' });
  }
});

router.patch('/:id/status', requireRole(...MANAGER_ROLES), async (req, res) => {
  try {
    const { status } = req.body || {};

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Недопустимый статус заказа' });
    }

    const order = await ordersDb.getOrderById(Number(req.params.id));
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    if (!canTransition('order', order.status, status)) {
      return res.status(409).json({
        message: `Недопустимый переход статуса: «${order.status}» → «${status}». ` +
          `Доступно: ${getNextStatuses('order', order.status).join(', ') || 'нет'}`
      });
    }

    await ordersDb.updateOrderStatus(Number(req.params.id), status);

    res.json({ ok: true, status });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении статуса заказа' });
  }
});

module.exports = router;
