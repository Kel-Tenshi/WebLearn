const express = require('express');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const opsDb = require('../db/operations');
const { MAINTENANCE_TYPES, MAINTENANCE_STATUSES, ORDER_STATUSES, TRANSFER_STATUSES } = require('../constants');

const opsRouter = express.Router();
opsRouter.use(authMiddleware);

// --- Журнал ТО и ремонтов ---
opsRouter.get('/maintenance', async (req, res) => {
  try {
    const list = await opsDb.getAllMaintenanceLogs();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении журнала ТО' });
  }
});

opsRouter.post('/maintenance', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { equipmentId, maintenanceType, performer, cost, description, status } = req.body || {};
    if (!equipmentId) return res.status(400).json({ message: 'Выберите оборудование' });
    if (!MAINTENANCE_TYPES.includes(maintenanceType)) {
      return res.status(400).json({ message: 'Недопустимый вид обслуживания' });
    }
    const item = await opsDb.addMaintenanceLog({
      equipmentId: Number(equipmentId),
      maintenanceType,
      performer: performer ? String(performer).trim() : req.userLogin,
      cost: Number(cost) || 0,
      description,
      status: status || 'Запланировано'
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении записи ТО' });
  }
});

opsRouter.patch('/maintenance/:id/status', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { status, endDate } = req.body || {};
    if (!MAINTENANCE_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Недопустимый статус ТО' });
    }
    const changes = await opsDb.updateMaintenanceStatus(Number(req.params.id), status, endDate);
    if (!changes) return res.status(404).json({ message: 'Запись ТО не найдена' });
    res.json({ ok: true, status });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при изменении статуса ТО' });
  }
});

// --- Перемещения оборудования ---
opsRouter.get('/transfers', async (req, res) => {
  try {
    const list = await opsDb.getAllTransfers();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении истории перемещений' });
  }
});

opsRouter.post('/transfers', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { equipmentId, toLocationId, reason, status } = req.body || {};
    if (!equipmentId || !toLocationId) {
      return res.status(400).json({ message: 'Укажите оборудование и целевую локацию' });
    }
    const item = await opsDb.addTransfer({
      equipmentId: Number(equipmentId),
      toLocationId: Number(toLocationId),
      transferredBy: req.userLogin,
      reason,
      status: status || 'Принято'
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при оформлении перемещения' });
  }
});

// --- Заказы и снабжение ---
opsRouter.get('/orders', async (req, res) => {
  try {
    const list = await opsDb.getAllOrders();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
});

opsRouter.post('/orders', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { orderNumber, supplierId, title, totalAmount, status } = req.body || {};
    if (!orderNumber || !title) {
      return res.status(400).json({ message: 'Укажите номер заказа и назначение' });
    }
    const item = await opsDb.addOrder({
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

opsRouter.patch('/orders/:id/status', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Недопустимый статус заказа' });
    }
    const changes = await opsDb.updateOrderStatus(Number(req.params.id), status);
    if (!changes) return res.status(404).json({ message: 'Заказ не найден' });
    res.json({ ok: true, status });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении статуса заказа' });
  }
});

module.exports = opsRouter;