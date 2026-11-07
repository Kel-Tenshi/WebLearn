import React, { useState } from 'react';
import { Equipment, MaintenanceLog, MaintenanceType } from '../../types';
import { FormField } from '../ui/FormField';

interface Props {
  items: MaintenanceLog[];
  equipment: Equipment[];
  canManage: boolean;
  onCreate: (data: Partial<MaintenanceLog>) => Promise<void>;
  onFinish: (id: number) => void;
}

interface FormState {
  equipmentId: number;
  maintenanceType: MaintenanceType;
  cost: number;
  description: string;
}

const EMPTY_FORM: FormState = {
  equipmentId: 0,
  maintenanceType: 'Плановое ТО',
  cost: 0,
  description: '',
};

export const MaintenanceSection: React.FC<Props> = ({
  items,
  equipment,
  canManage,
  onCreate,
  onFinish,
}) => {
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.equipmentId) {
      errs.equipmentId = 'Выберите оборудование';
    }

    if (form.cost < 0) {
      errs.cost = 'Стоимость не может быть отрицательной';
    }

    if (form.description.length > 300) {
      errs.description = 'Описание не должно превышать 300 символов';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onCreate({ ...form, status: 'В процессе' });
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
          <h3>Назначить ТО / Ремонт</h3>
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

            <select
              value={form.maintenanceType}
              onChange={(e) => setForm({ ...form, maintenanceType: e.target.value as MaintenanceType })}
            >
              {['Плановое ТО', 'Аварийный ремонт', 'Калибровка/Поверка', 'Модернизация'].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>

            <FormField error={errors.cost}>
              <input
                type="number"
                placeholder="Стоимость, ₽"
                value={form.cost}
                onChange={(e) => {
                  setForm({ ...form, cost: Number(e.target.value) });
                  if (errors.cost) setErrors({ ...errors, cost: '' });
                }}
              />
            </FormField>

            <FormField error={errors.description}>
              <input
                placeholder="Описание работ"
                value={form.description}
                onChange={(e) => {
                  setForm({ ...form, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
              />
            </FormField>

            <button type="submit" className="primary">Назначить</button>
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Оборудование</th>
            <th>Вид работ</th>
            <th>Исполнитель</th>
            <th>Стоимость</th>
            <th>Дата</th>
            <th>Статус</th>
            {canManage && <th>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.invNumber} ({item.equipmentName})</td>
              <td>{item.maintenanceType}</td>
              <td>{item.performer}</td>
              <td>{item.cost.toLocaleString()} ₽</td>
              <td>{item.startDate}</td>
              <td><span className="badge">{item.status}</span></td>
              {canManage && (
                <td>
                  {item.status !== 'Завершено' ? (
                    <button onClick={() => onFinish(item.id)}>Завершить</button>
                  ) : '—'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
