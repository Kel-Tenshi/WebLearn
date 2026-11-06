import React, { useState, useEffect } from 'react';
import { equipmentApi, directoryApi } from '../utils/api';
import { Equipment, EquipmentStatus, Category, LocationItem, User } from '../utils/types';
import { useAlert } from '../context/AlertContext';
import { FormField } from './FormField';

export const EquipmentTab: React.FC<{ user: User }> = ({ user }) => {
  const { showAlert, showApiError } = useAlert();

  const [list, setList] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    invNumber: '',
    serialNumber: '',
    name: '',
    categoryId: 0,
    locationId: 0,
    purchaseCost: 0,
    status: 'Работает' as EquipmentStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const canManage = user.role === 'manager' || user.role === 'admin';

  const loadData = async () => {
    try {
      const [eq, cat, loc] = await Promise.all([
        equipmentApi.getAll(),
        directoryApi.getCategories(),
        directoryApi.getLocations(),
      ]);
      setList(eq);
      setCategories(cat);
      setLocations(loc);
    } catch (e: any) {
      showApiError(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.invNumber.trim()) {
      errs.invNumber = 'Укажите инвентарный номер';
    } else if (form.invNumber.trim().length < 3) {
      errs.invNumber = 'Минимум 3 символа';
    }

    if (!form.name.trim()) {
      errs.name = 'Укажите наименование техники';
    }

    if (form.purchaseCost < 0) {
      errs.purchaseCost = 'Стоимость не может быть меньше 0';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        ...form,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        locationId: form.locationId ? Number(form.locationId) : null,
        purchaseCost: Number(form.purchaseCost),
      };

      if (editingId) {
        await equipmentApi.update(editingId, payload);
        showAlert('Оборудование успешно обновлено', 'success');
      } else {
        await equipmentApi.create(payload);
        showAlert('Оборудование успешно добавлено в реестр', 'success');
      }

      resetForm();
      loadData();
    } catch (err: any) {
      showApiError(err);
    }
  };

  const handleEdit = (item: Equipment) => {
    setEditingId(item.id);
    setErrors({});
    setForm({
      invNumber: item.invNumber,
      serialNumber: item.serialNumber || '',
      name: item.name,
      categoryId: item.categoryId || 0,
      locationId: item.locationId || 0,
      purchaseCost: item.purchaseCost || 0,
      status: item.status,
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить оборудование из базы?')) return;
    try {
      await equipmentApi.delete(id);
      showAlert('Оборудование удалено', 'success');
      loadData();
    } catch (err: any) {
      showApiError(err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setErrors({});
    setForm({
      invNumber: '',
      serialNumber: '',
      name: '',
      categoryId: 0,
      locationId: 0,
      purchaseCost: 0,
      status: 'Работает',
    });
  };

  const filtered = list.filter((e) =>
    `${e.invNumber} ${e.name} ${e.categoryName || ''} ${e.locationName || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="tab-container">
      <h2>Оборудование</h2>

      {canManage && (
        <form onSubmit={handleSubmit} className="form-card" noValidate>
          <h3>{editingId ? 'Редактировать оборудование' : 'Добавить оборудование'}</h3>
          <div className="form-row">
            <FormField error={errors.invNumber}>
              <input
                placeholder="Инв. номер *"
                value={form.invNumber}
                onChange={(e) => {
                  setForm({ ...form, invNumber: e.target.value });
                  if (errors.invNumber) setErrors({ ...errors, invNumber: '' });
                }}
              />
            </FormField>

            <FormField error={errors.serialNumber}>
              <input
                placeholder="Серийный номер"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              />
            </FormField>

            <FormField error={errors.name}>
              <input
                placeholder="Наименование *"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
              />
            </FormField>

            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
            >
              <option value={0}>-- Категория --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={form.locationId}
              onChange={(e) => setForm({ ...form, locationId: Number(e.target.value) })}
            >
              <option value={0}>-- Локация --</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as EquipmentStatus })}
            >
              {['Работает', 'В ремонте', 'Простой', 'Списано', 'На консервации'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <FormField error={errors.purchaseCost}>
              <input
                type="number"
                placeholder="Стоимость"
                value={form.purchaseCost}
                onChange={(e) => {
                  setForm({ ...form, purchaseCost: Number(e.target.value) });
                  if (errors.purchaseCost) setErrors({ ...errors, purchaseCost: '' });
                }}
              />
            </FormField>

            <button type="submit" className="primary">
              {editingId ? 'Сохранить' : 'Добавить'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm}>
                Отмена
              </button>
            )}
          </div>
        </form>
      )}

      <input
        type="search"
        placeholder="Поиск по инв. номеру, названию, категории..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <table className="data-table">
        <thead>
          <tr>
            <th>Инв. №</th>
            <th>Серийный №</th>
            <th>Наименование</th>
            <th>Категория</th>
            <th>Локация</th>
            <th>Стоимость</th>
            <th>Статус</th>
            {canManage && <th>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={8} align="center">Оборудование не найдено</td>
            </tr>
          ) : (
            filtered.map((item) => (
              <tr key={item.id}>
                <td><code>{item.invNumber}</code></td>
                <td>{item.serialNumber || '—'}</td>
                <td><b>{item.name}</b></td>
                <td>{item.categoryName || '—'}</td>
                <td>{item.locationName || '—'}</td>
                <td>{item.purchaseCost ? `${item.purchaseCost.toLocaleString()} ₽` : '—'}</td>
                <td><span className={`badge status-${item.status}`}>{item.status}</span></td>
                {canManage && (
                  <td>
                    <button onClick={() => handleEdit(item)}>Изм.</button>
                    <button onClick={() => handleDelete(item.id)} className="danger">Уд.</button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};