const express = require('express');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const directoryDb = require('../db/directory');
const { AUDIT_STATUSES } = require('../constants');

const directoryRouter = express.Router();
directoryRouter.use(authMiddleware);

// --- Подразделения ---
directoryRouter.get('/departments', async (req, res) => {
  try {
    const list = await directoryDb.getAllDepartments();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении подразделений' });
  }
});

directoryRouter.post('/departments', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { name, code, headName } = req.body || {};
    if (!name || !code) return res.status(400).json({ message: 'Укажите название и код' });
    const item = await directoryDb.addDepartment({ name: name.trim(), code: code.trim(), headName });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении подразделения' });
  }
});

// --- Локации и склады ---
directoryRouter.get('/locations', async (req, res) => {
  try {
    const list = await directoryDb.getAllLocations();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении локаций' });
  }
});

directoryRouter.post('/locations', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { name, building, room, departmentId } = req.body || {};
    if (!name || !building) return res.status(400).json({ message: 'Укажите название и здание' });
    const item = await directoryDb.addLocation({
      name: name.trim(),
      building: building.trim(),
      room,
      departmentId: departmentId ? Number(departmentId) : null
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении локации' });
  }
});

// --- Категории оборудования ---
directoryRouter.get('/categories', async (req, res) => {
  try {
    const list = await directoryDb.getAllCategories();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении категорий' });
  }
});

directoryRouter.post('/categories', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { name, code, description } = req.body || {};
    if (!name || !code) return res.status(400).json({ message: 'Укажите название и шифр категории' });
    const item = await directoryDb.addCategory({ name: name.trim(), code: code.trim(), description });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении категории' });
  }
});

// --- Поставщики и подрядчики ---
directoryRouter.get('/suppliers', async (req, res) => {
  try {
    const list = await directoryDb.getAllSuppliers();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении поставщиков' });
  }
});

directoryRouter.post('/suppliers', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { name, inn, contactPerson, phone, email } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Укажите название организации' });
    const item = await directoryDb.addSupplier({ name: name.trim(), inn, contactPerson, phone, email });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении поставщика' });
  }
});

// --- Инвентаризация ---
directoryRouter.get('/audits', async (req, res) => {
  try {
    const list = await directoryDb.getAllAudits();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении инвентаризаций' });
  }
});

directoryRouter.post('/audits', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { locationId, auditor, notes } = req.body || {};
    if (!locationId) return res.status(400).json({ message: 'Выберите локацию для инвентаризации' });
    const item = await directoryDb.addAudit({
      locationId: Number(locationId),
      auditor: auditor && String(auditor).trim() ? String(auditor).trim() : req.userLogin,
      notes
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при создании акта инвентаризации' });
  }
});

directoryRouter.patch('/audits/:id', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { status, notes } = req.body || {};
    if (!AUDIT_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Недопустимый статус инвентаризации' });
    }
    const changes = await directoryDb.updateAuditStatus(Number(req.params.id), status, notes);
    if (!changes) return res.status(404).json({ message: 'Акт не найден' });
    res.json({ ok: true, status });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении статуса аудита' });
  }
});

module.exports = directoryRouter;