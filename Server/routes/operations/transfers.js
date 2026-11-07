const express = require('express');
const requireRole = require('../../middleware/requireRole');
const transfersDb = require('../../db/transfers');
const { getEquipmentById } = require('../../db/equipment');
const { TRANSFER_STATUSES } = require('../../constants');
const { getNextStatuses, canTransition } = require('../../stateMachine');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await transfersDb.getAllTransfers();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении истории перемещений' });
  }
});

router.post('/', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { equipmentId, toLocationId, reason } = req.body || {};

    if (!equipmentId || !toLocationId) {
      return res.status(400).json({ message: 'Укажите оборудование и целевую локацию' });
    }

    const equipment = await getEquipmentById(Number(equipmentId));
    if (!equipment) {
      return res.status(404).json({ message: 'Оборудование не найдено' });
    }
    if (equipment.status === 'Списано') {
      return res.status(409).json({ message: 'Списанное оборудование нельзя перемещать' });
    }

    const item = await transfersDb.addTransfer({
      equipmentId: Number(equipmentId),
      toLocationId: Number(toLocationId),
      transferredBy: req.userLogin,
      reason,
      status: 'В пути'
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при оформлении перемещения' });
  }
});

// Принятие или отклонение перемещения
router.patch('/:id/status', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { status } = req.body || {};

    if (!TRANSFER_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Недопустимый статус перемещения' });
    }

    const transfer = await transfersDb.getTransferById(Number(req.params.id));
    if (!transfer) {
      return res.status(404).json({ message: 'Перемещение не найдено' });
    }

    if (!canTransition('transfer', transfer.status, status)) {
      return res.status(409).json({
        message: `Недопустимый переход статуса: «${transfer.status}» → «${status}». ` +
          `Доступно: ${getNextStatuses('transfer', transfer.status).join(', ') || 'нет'}`
      });
    }

    await transfersDb.updateTransferStatus(Number(req.params.id), status);
    res.json({ ok: true, status });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при изменении статуса перемещения' });
  }
});

module.exports = router;
