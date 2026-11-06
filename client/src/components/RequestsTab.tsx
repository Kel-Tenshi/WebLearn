import React, { useState, useEffect } from 'react';
import { requestsApi, equipmentApi } from '../utils/api';
import { RequestItem, RequestType, RequestPriority, RequestStatus, Equipment, User } from '../utils/types';

export const RequestsTab: React.FC<{ user: User }> = ({ user }) => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  const [form, setForm] = useState({
    type: 'Ремонт' as RequestType,
    equipmentId: 0,
    priority: 'Средний' as RequestPriority,
    title: '',
  });

  const canManage = user.role === 'manager' || user.role === 'admin';

  const loadData = async () => {
    try {
      const [reqList, eqList] = await Promise.all([
        requestsApi.getAll(),
        equipmentApi.getAll()
      ]);
      setRequests(reqList);
      setEquipment(eqList);
    } catch (e: any) {
      alert(e.message);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestsApi.create({
        ...form,
        equipmentId: form.equipmentId ? Number(form.equipmentId) : null,
      });
      setForm({ type: 'Ремонт', equipmentId: 0, priority: 'Средний', title: '' });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (id: number, status: RequestStatus) => {
    try {
      await requestsApi.updateStatus(id, status);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="tab-container">
      <h2>Заявки</h2>

      <form onSubmit={handleCreate} className="form-card">
        <h3>Новая заявка</h3>
        <div className="form-row">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as RequestType })}>
            {['Перемещение', 'Списание', 'Закупка', 'Ремонт'].map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={form.equipmentId} onChange={(e) => setForm({ ...form, equipmentId: Number(e.target.value) })}>
            <option value={0}>-- Оборудование --</option>
            {equipment.map((eq) => <option key={eq.id} value={eq.id}>{eq.invNumber} ({eq.name})</option>)}
          </select>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as RequestPriority })}>
            {['Низкий', 'Средний', 'Высокий', 'Критический'].map((p) => <option key={p}>{p}</option>)}
          </select>
          <input
            placeholder="Тема / основание *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            style={{ flex: 1 }}
          />
          <button type="submit" className="primary">Подать заявку</button>
        </div>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>№</th>
            <th>Дата</th>
            <th>Тип</th>
            <th>Тема</th>
            <th>Оборудование</th>
            <th>Заявитель</th>
            <th>Приоритет</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{(r.createdAt || '').slice(0, 16)}</td>
              <td>{r.type}</td>
              <td><b>{r.title}</b></td>
              <td>{r.invNumber ? `${r.invNumber} (${r.equipmentName})` : '—'}</td>
              <td>{r.applicant}</td>
              <td><span className="badge">{r.priority}</span></td>
              <td>
                {canManage ? (
                  <select
                    value={r.status}
                    onChange={(e) => handleStatusChange(r.id, e.target.value as RequestStatus)}
                  >
                    {['На согласовании', 'Одобрено', 'Отклонено', 'Выполнено'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <span className="badge">{r.status}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};