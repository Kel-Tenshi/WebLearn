import React, { useState, useEffect } from 'react';
import { equipmentApi, directoryApi } from '../utils/api';
import { Equipment, EquipmentStatus, Category, LocationItem, User } from '../utils/types';

export const EquipmentTab: React.FC<{ user: User }> = ({ user }) => {
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

  const canManage = user.role === 'manager' || user.role === 'admin';

  const loadData = async () => {
    try {
      const [eq, cat, loc] = await Promise.all([
        equipmentApi.getAll(),
        directoryApi.getCategories(),
        directoryApi.getLocations()
      ]);
      setList(eq);
      setCategories(cat);
      setLocations(loc);
    } catch (e: any) {
      alert(e.message);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        locationId: form.locationId ? Number(form.locationId) : null,
        purchaseCost: Number(form.purchaseCost),
      };
      if (editingId) {
        await equipmentApi.update(editingId, payload);
      } else {
        await equipmentApi.create(payload);
      }
      resetForm();
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (item: Equipment) => {
    setEditingId(item.id);
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
    if (!window.confirm('Удалить оборудование?')) return;
    try {
      await equipmentApi.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      invNumber: '', serialNumber: '', name: '',
      categoryId: 0, locationId: 0, purchaseCost: 0, status: 'Работает'
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
        <form onSubmit={handleSubmit} className="form-card">
          <h3>{editingId ? 'Редактировать оборудование' : 'Добавить оборудование'}</h3>
          <div className="form-row">
            <input placeholder="Инв. номер *" value={form.invNumber} onChange={(e) => setForm({ ...form, invNumber: e.target.value })} required />
            <input placeholder="Серийный номер" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
            <input placeholder="Наименование *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}>
              <option value={0}>-- Категория --</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={form.locationId} onChange={(e) => setForm({ ...form, locationId: Number(e.target.value) })}>
              <option value={0}>-- Локация --</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EquipmentStatus })}>
              {['Работает', 'В ремонте', 'Простой', 'Списано', 'На консервации'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input type="number" placeholder="Стоимость" value={form.purchaseCost} onChange={(e) => setForm({ ...form, purchaseCost: Number(e.target.value) })} />
          </div>
          <button type="submit" className="primary">{editingId ? 'Сохранить' : 'Добавить'}</button>
          {editingId && <button type="button" onClick={resetForm} style={{ marginLeft: 8 }}>Отмена</button>}
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
            <tr><td colSpan={8} align="center">Оборудование не найдено</td></tr>
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