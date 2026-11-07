import React, { useState, useEffect } from 'react';
import { requestsApi, equipmentApi } from '../utils/api';
import { RequestItem, RequestType, RequestPriority, RequestStatus, Equipment, User } from '../utils/types';
import { useAlert } from '../context/AlertContext';
import { FormField } from './FormField';

export const RequestsTab: React.FC<{ user: User }> = ({ user }) => {
  const { showAlert, showApiError } = useAlert();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      showApiError(e);
    }
  };

  useEffect(() => { loadData(); }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.title.trim()) {
      errs.title = 'Укажите тему заявки';
    } else if (form.title.trim().length < 5) {
      errs.title = 'Тема должна содержать минимум 5 символов';
    } else if (form.title.trim().length > 200) {
      errs.title = 'Тема не должна превышать 200 символов';
    }

    if ((form.type === 'Ремонт' || form.type === 'Перемещение') && !form.equipmentId) {
      errs.equipmentId = 'Выберите оборудование для этого типа заявки';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await requestsApi.create({
        ...form,
        title: form.title.trim(),
        equipmentId: form.equipmentId ? Number(form.equipmentId) : null,
      });
      setForm({ type: 'Ремонт', equipmentId: 0, priority: 'Средний', title: '' });
      setErrors({});
      showAlert('Заявка создана', 'success');
      loadData();
    } catch (err: any) {
      showApiError(err);
    }
  };

  const handleStatusChange = async (id: number, status: RequestStatus) => {
    try {
      await requestsApi.updateStatus(id, status);
      showAlert('Статус заявки обновлён', 'success');
      loadData();
    } catch (err: any) {
      showApiError(err);
    }
  };

  return (
    <div className="tab-container">
      <h2>Заявки</h2>

      <form onSubmit={handleCreate} className="form-card" noValidate>
        <h3>Новая заявка</h3>
        <div className="form-row">
          <select
            value={form.type}
            onChange={(e) => {
              setForm({ ...form, type: e.target.value as RequestType });
              if (errors.equipmentId) setErrors({ ...errors, equipmentId: '' });
            }}
          >
            {['Перемещение', 'Списание', 'Закупка', 'Ремонт'].map((t) => <option key={t}>{t}</option>)}
          </select>

          <FormField error={errors.equipmentId}>
            <select
              value={form.equipmentId}
              onChange={(e) => {
                setForm({ ...form, equipmentId: Number(e.target.value) });
                if (errors.equipmentId) setErrors({ ...errors, equipmentId: '' });
              }}
            >
              <option value={0}>Оборудование не выбрано</option>
              {equipment.map((eq) => <option key={eq.id} value={eq.id}>{eq.invNumber} ({eq.name})</option>)}
            </select>
          </FormField>

          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as RequestPriority })}>
            {['Низкий', 'Средний', 'Высокий', 'Критический'].map((p) => <option key={p}>{p}</option>)}
          </select>

          <FormField error={errors.title} style={{ flex: 1 }}>
            <input
              placeholder="Тема / основание *"
              value={form.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              style={{ width: '100%' }}
            />
          </FormField>

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
