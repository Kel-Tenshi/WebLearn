const express = require('express');
const requireRole = require('../../middleware/requireRole');
const transfersDb = require('../../db/transfers');

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
    const { equipmentId, toLocationId, reason, status } = req.body || {};

    if (!equipmentId || !toLocationId) {
      return res.status(400).json({ message: 'Укажите оборудование и целевую локацию' });
    }

    const item = await transfersDb.addTransfer({
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

module.exports = router;
