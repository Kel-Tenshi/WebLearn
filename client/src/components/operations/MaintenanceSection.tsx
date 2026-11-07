import React from 'react';
import { Equipment, MaintenanceLog, MaintenanceType } from '../../types';
import { FormField } from '../ui/FormField';
import { StatusBadge } from '../ui/StatusBadge';
import { StatusActions } from '../ui/StatusActions';
import { useForm } from '../../hooks/useForm';
import { collect, maxTextLength, nonNegativeNumber } from '../../utils/validation';
import { getStatusActions } from '../../config/statusMachine';

interface Props {
  items: MaintenanceLog[];
  equipment: Equipment[];
  canManage: boolean;
  onCreate: (data: Partial<MaintenanceLog>) => Promise<void>;
  onStatusChange: (id: number, status: string) => void;
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

const validateMaintenance = (values: FormState) =>
  collect({
    equipmentId: values.equipmentId ? undefined : 'Выберите оборудование',
    cost: nonNegativeNumber(values.cost, 'Стоимость не может быть отрицательной'),
    description: maxTextLength(values.description, 300, 'Описание не должно превышать 300 символов'),
  });

export const MaintenanceSection: React.FC<Props> = ({
  items,
  equipment,
  canManage,
  onCreate,
  onStatusChange,
}) => {
  const { values, errors, submitting, setValue, reset, submit } =
    useForm<FormState>(EMPTY_FORM, validateMaintenance);

  const handleSubmit = submit(async (current) => {
    try {
      await onCreate({ ...current });
      reset();
    } catch {
      // Ошибку уже показал родительский компонент
    }
  });

  return (
    <>
      {canManage && (
        <form onSubmit={handleSubmit} className="form-card" noValidate>
          <h3>Назначить ТО / Ремонт</h3>
          <div className="form-row">
            <FormField error={errors.equipmentId}>
              <select
                value={values.equipmentId}
                onChange={(e) => setValue('equipmentId', Number(e.target.value))}
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
              value={values.maintenanceType}
              onChange={(e) => setValue('maintenanceType', e.target.value as MaintenanceType)}
            >
              {['Плановое ТО', 'Аварийный ремонт', 'Калибровка/Поверка', 'Модернизация'].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>

            <FormField error={errors.cost}>
              <input
                type="number"
                placeholder="Стоимость, ₽"
                value={values.cost}
                onChange={(e) => setValue('cost', Number(e.target.value))}
              />
            </FormField>

            <FormField error={errors.description}>
              <input
                placeholder="Описание работ"
                value={values.description}
                onChange={(e) => setValue('description', e.target.value)}
              />
            </FormField>

            <button type="submit" className="primary" disabled={submitting}>Назначить</button>
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
          {items.length === 0 ? (
            <tr>
              <td colSpan={canManage ? 8 : 7} align="center">Записей ТО пока нет</td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.invNumber} ({item.equipmentName})</td>
                <td>{item.maintenanceType}</td>
                <td>{item.performer}</td>
                <td>{item.cost.toLocaleString()} ₽</td>
                <td>{item.startDate}</td>
                <td><StatusBadge status={item.status} /></td>
                {canManage && (
                  <td>
                    <StatusActions
                      actions={getStatusActions('maintenance', item.status)}
                      onChange={(status) => onStatusChange(item.id, status)}
                    />
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
};
