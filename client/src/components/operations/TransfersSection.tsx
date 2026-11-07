import React, { useState } from 'react';
import { Equipment, LocationItem, Transfer } from '../../types';
import { FormField } from '../ui/FormField';

interface Props {
  items: Transfer[];
  equipment: Equipment[];
  locations: LocationItem[];
  canManage: boolean;
  onCreate: (data: { equipmentId: number; toLocationId: number; reason?: string }) => Promise<void>;
}

interface FormState {
  equipmentId: number;
  toLocationId: number;
  reason: string;
}

const EMPTY_FORM: FormState = {
  equipmentId: 0,
  toLocationId: 0,
  reason: '',
};

export const TransfersSection: React.FC<Props> = ({
  items,
  equipment,
  locations,
  canManage,
  onCreate,
}) => {
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.equipmentId) {
      errs.equipmentId = 'Выберите оборудование';
    }

    if (!form.toLocationId) {
      errs.toLocationId = 'Выберите, куда переместить оборудование';
    }

    if (form.reason.length > 200) {
      errs.reason = 'Причина не должна превышать 200 символов';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onCreate({ ...form, reason: form.reason.trim() });
      setForm({ ...EMPTY_FORM });
      setErrors({});
    } catch {
      // Ошибку уже показал родительский компонент
    }
  };

  return (
    <>
      {canManage && (
        <form onSubmit={handleSubmit} className="form-card" noValidate>
          <h3>Оформить перемещение</h3>
          <div className="form-row">
            <FormField error={errors.equipmentId}>
              <select
                value={form.equipmentId}
                onChange={(e) => {
                  setForm({ ...form, equipmentId: Number(e.target.value) });
                  if (errors.equipmentId) setErrors({ ...errors, equipmentId: '' });
                }}
              >
                <option value={0} disabled>Выберите оборудование</option>
                {equipment.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.invNumber} ({item.name})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField error={errors.toLocationId}>
              <select
                value={form.toLocationId}
                onChange={(e) => {
                  setForm({ ...form, toLocationId: Number(e.target.value) });
                  if (errors.toLocationId) setErrors({ ...errors, toLocationId: '' });
                }}
              >
                <option value={0} disabled>Выберите локацию</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
            </FormField>

            <FormField error={errors.reason}>
              <input
                placeholder="Причина / Приказ"
                value={form.reason}
                onChange={(e) => {
                  setForm({ ...form, reason: e.target.value });
                  if (errors.reason) setErrors({ ...errors, reason: '' });
                }}
              />
            </FormField>

            <button type="submit" className="primary">Переместить</button>
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Дата</th>
            <th>Оборудование</th>
            <th>Откуда</th>
            <th>Куда</th>
            <th>Оформил</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>TR-{item.id}</td>
              <td>{item.transferDate}</td>
              <td>{item.invNumber} ({item.equipmentName})</td>
              <td>{item.fromLocationName || 'Склад'}</td>
              <td><b>{item.toLocationName}</b></td>
              <td>{item.transferredBy}</td>
              <td><span className="badge">{item.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
