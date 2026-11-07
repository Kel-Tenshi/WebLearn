import React from 'react';
import { Equipment, LocationItem, Transfer } from '../../types';
import { FormField } from '../ui/FormField';
import { StatusBadge } from '../ui/StatusBadge';
import { StatusActions } from '../ui/StatusActions';
import { useForm } from '../../hooks/useForm';
import { collect, maxTextLength } from '../../utils/validation';
import { getStatusActions } from '../../config/statusMachine';

interface Props {
  items: Transfer[];
  equipment: Equipment[];
  locations: LocationItem[];
  canManage: boolean;
  onCreate: (data: { equipmentId: number; toLocationId: number; reason?: string }) => Promise<void>;
  onStatusChange: (id: number, status: string) => void;
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

const validateTransfer = (values: FormState) =>
  collect({
    equipmentId: values.equipmentId ? undefined : 'Выберите оборудование',
    toLocationId: values.toLocationId ? undefined : 'Выберите, куда переместить оборудование',
    reason: maxTextLength(values.reason, 200, 'Причина не должна превышать 200 символов'),
  });

export const TransfersSection: React.FC<Props> = ({
  items,
  equipment,
  locations,
  canManage,
  onCreate,
  onStatusChange,
}) => {
  const { values, errors, submitting, setValue, reset, submit } =
    useForm<FormState>(EMPTY_FORM, validateTransfer);

  const handleSubmit = submit(async (current) => {
    try {
      await onCreate({ ...current, reason: current.reason.trim() });
      reset();
    } catch {
      // Ошибку уже показал родительский компонент
    }
  });

  return (
    <>
      {canManage && (
        <form onSubmit={handleSubmit} className="form-card" noValidate>
          <h3>Оформить перемещение</h3>
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

            <FormField error={errors.toLocationId}>
              <select
                value={values.toLocationId}
                onChange={(e) => setValue('toLocationId', Number(e.target.value))}
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
                value={values.reason}
                onChange={(e) => setValue('reason', e.target.value)}
              />
            </FormField>

            <button type="submit" className="primary" disabled={submitting}>Переместить</button>
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
            {canManage && <th>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={canManage ? 8 : 7} align="center">Перемещений пока нет</td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>TR-{item.id}</td>
                <td>{item.transferDate}</td>
                <td>{item.invNumber} ({item.equipmentName})</td>
                <td>{item.fromLocationName || 'Склад'}</td>
                <td><b>{item.toLocationName}</b></td>
                <td>{item.transferredBy}</td>
                <td><StatusBadge status={item.status} /></td>
                {canManage && (
                  <td>
                    <StatusActions
                      actions={getStatusActions('transfer', item.status)}
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
