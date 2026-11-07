const express = require('express');
const requireRole = require('../../middleware/requireRole');
const auditsDb = require('../../db/audits');
const { AUDIT_STATUSES } = require('../../constants');
const { getNextStatuses, canTransition } = require('../../stateMachine');

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

    const audit = await auditsDb.getAuditById(Number(req.params.id));
    if (!audit) {
      return res.status(404).json({ message: 'Акт не найден' });
    }

    if (!canTransition('audit', audit.status, status)) {
      return res.status(409).json({
        message: `Недопустимый переход статуса: «${audit.status}» → «${status}». ` +
          `Доступно: ${getNextStatuses('audit', audit.status).join(', ') || 'нет'}`
      });
    }

    await auditsDb.updateAuditStatus(Number(req.params.id), status, notes);

    res.json({ ok: true, status });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении статуса аудита' });
  }
});

module.exports = router;
