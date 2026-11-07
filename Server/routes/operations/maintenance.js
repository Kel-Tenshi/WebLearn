const express = require('express');
const requireRole = require('../../middleware/requireRole');
const maintenanceDb = require('../../db/maintenance');
const { MAINTENANCE_TYPES, MAINTENANCE_STATUSES } = require('../../constants');
const { getNextStatuses, canTransition } = require('../../stateMachine');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await maintenanceDb.getAllMaintenanceLogs();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении журнала ТО' });
  }
});

router.post('/', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { equipmentId, maintenanceType, performer, cost, description } = req.body || {};

    if (!equipmentId) {
      return res.status(400).json({ message: 'Выберите оборудование' });
    }

    if (!MAINTENANCE_TYPES.includes(maintenanceType)) {
      return res.status(400).json({ message: 'Недопустимый вид обслуживания' });
    }

    const item = await maintenanceDb.addMaintenanceLog({
      equipmentId: Number(equipmentId),
      maintenanceType,
      performer: performer ? String(performer).trim() : req.userLogin,
      cost: Number(cost) || 0,
      description,
      status: 'Запланировано'
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении записи ТО' });
  }
});

router.patch('/:id/status', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { status, endDate } = req.body || {};

    if (!MAINTENANCE_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Недопустимый статус ТО' });
    }

    const log = await maintenanceDb.getMaintenanceById(Number(req.params.id));
    if (!log) {
      return res.status(404).json({ message: 'Запись ТО не найдена' });
    }

    if (!canTransition('maintenance', log.status, status)) {
      return res.status(409).json({
        message: `Недопустимый переход статуса: «${log.status}» → «${status}». ` +
          `Доступно: ${getNextStatuses('maintenance', log.status).join(', ') || 'нет'}`
      });
    }

    await maintenanceDb.updateMaintenanceStatus(Number(req.params.id), status, endDate);

    res.json({ ok: true, status });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при изменении статуса ТО' });
  }
});

module.exports = router;
