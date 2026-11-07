const express = require('express');
const requireRole = require('../../middleware/requireRole');
const auditsDb = require('../../db/audits');
const { AUDIT_STATUSES } = require('../../constants');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await auditsDb.getAllAudits();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении инвентаризаций' });
  }
});

router.post('/', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { locationId, auditor, notes } = req.body || {};

    if (!locationId) {
      return res.status(400).json({ message: 'Выберите локацию для инвентаризации' });
    }

    const item = await auditsDb.addAudit({
      locationId: Number(locationId),
      auditor: auditor && String(auditor).trim() ? String(auditor).trim() : req.userLogin,
      notes
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при создании акта инвентаризации' });
  }
});

router.patch('/:id', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { status, notes } = req.body || {};

    if (!AUDIT_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Недопустимый статус инвентаризации' });
    }

    const changes = await auditsDb.updateAuditStatus(Number(req.params.id), status, notes);
    if (!changes) {
      return res.status(404).json({ message: 'Акт не найден' });
    }

    res.json({ ok: true, status });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении статуса аудита' });
  }
});

module.exports = router;
