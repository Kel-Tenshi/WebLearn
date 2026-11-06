const express = require('express');
const { getDb } = require('../db/db');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { REQUEST_TYPES, REQUEST_PRIORITIES, REQUEST_STATUSES } = require('../constants');

const requestsRouter = express.Router();
requestsRouter.use(authMiddleware);

// Получить список заявок (с присоединением инв. номера и наименования оборудования)
requestsRouter.get('/', async (req, res) => {
  try {
    let query = `
      SELECT r.*, e.name AS equipmentName, e.invNumber
      FROM requests r
      LEFT JOIN equipment e ON r.equipmentId = e.id
    `;
    const params = [];

    if (req.userRole === 'employee') {
      query += ` WHERE r.applicant = ?`;
      params.push(req.userLogin);
    }

    query += ` ORDER BY r.id DESC`;
    const items = await getDb().all(query, ...params);
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

    const result = await getDb().run(`
      INSERT INTO requests (type, title, applicant, equipmentId, priority, status, createdAt)
      VALUES (?, ?, ?, ?, ?, 'На согласовании', datetime('now', 'localtime'))
    `,
      type,
      String(title).trim(),
      cleanApplicant,
      equipmentId ? Number(equipmentId) : null,
      cleanPriority
    );

    const created = await getDb().get('SELECT * FROM requests WHERE id = ?', result.lastID);
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

    const result = await getDb().run('UPDATE requests SET status = ? WHERE id = ?', status, id);
    if (!result.changes) return res.status(404).json({ message: 'Заявка не найдена' });

    res.json({ id, status });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении заявки' });
  }
});

module.exports = requestsRouter;