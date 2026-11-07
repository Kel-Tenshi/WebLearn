const express = require('express');
const {
  getRequestsWithEquipment,
  addRequest,
  updateRequestStatus
} = require('../db/requests');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { REQUEST_TYPES, REQUEST_PRIORITIES, REQUEST_STATUSES } = require('../constants');

const requestsRouter = express.Router();
requestsRouter.use(authMiddleware);

// Получить список заявок (с присоединением инв. номера и наименования оборудования)
requestsRouter.get('/', async (req, res) => {
  try {
    const applicant = req.userRole === 'employee' ? req.userLogin : null;
    const items = await getRequestsWithEquipment(applicant);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении списка заявок' });
  }
});

// Создать заявку с возможностью указания оборудования
requestsRouter.post('/', async (req, res) => {
  try {
    const { type, title, applicant, priority, equipmentId } = req.body || {};

    if (!REQUEST_TYPES.includes(type)) {
      return res.status(400).json({ message: `Недопустимый тип заявки: ${REQUEST_TYPES.join(', ')}` });
    }
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Укажите тему заявки' });
    }

    const cleanPriority = priority || 'Средний';
    if (!REQUEST_PRIORITIES.includes(cleanPriority)) {
      return res.status(400).json({ message: 'Недопустимый приоритет заявки' });
    }

    let cleanApplicant = req.userLogin;
    if (req.userRole !== 'employee' && applicant && String(applicant).trim()) {
      cleanApplicant = String(applicant).trim();
    }

    const created = await addRequest({
      type,
      title: String(title).trim(),
      applicant: cleanApplicant,
      equipmentId: equipmentId ? Number(equipmentId) : null,
      priority: cleanPriority
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании заявки' });
  }
});

// Смена статуса заявки
requestsRouter.patch('/:id', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body || {};

    if (!REQUEST_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Недопустимый статус заявки' });
    }

    const changes = await updateRequestStatus(id, status);
    if (!changes) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    res.json({ id, status });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении заявки' });
  }
});

module.exports = requestsRouter;
