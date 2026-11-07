import React from 'react';
import { InventoryAudit, LocationItem } from '../../types';
import { FormField } from '../ui/FormField';
import { StatusBadge } from '../ui/StatusBadge';
import { StatusActions } from '../ui/StatusActions';
import { useForm } from '../../hooks/useForm';
import { collect } from '../../utils/validation';
import { getStatusActions } from '../../config/statusMachine';

interface Props {
  items: InventoryAudit[];
  locations: LocationItem[];
  canManage: boolean;
  onCreate: (data: { locationId: number }) => Promise<void>;
  onStatusChange: (id: number, status: string) => void;
}

interface FormState {
  locationId: number;
}

const EMPTY_FORM: FormState = { locationId: 0 };

const validateAudit = (values: FormState) =>
  collect({
    locationId: values.locationId ? undefined : 'Выберите локацию для инвентаризации',
  });

export const AuditsCard: React.FC<Props> = ({
  items,
  locations,
  canManage,
  onCreate,
  onStatusChange,
}) => {
  const { values, errors, submitting, setValue, reset, submit } =
    useForm<FormState>(EMPTY_FORM, validateAudit);

  const handleSubmit = submit(async (current) => {
    try {
      await onCreate({ locationId: current.locationId });
      reset();
    } catch {
      // Ошибку уже показал родительский компонент
    }
  });

  return (
    <div className="card">
      <h3>Акты инвентаризации</h3>
      {canManage && (
        <form onSubmit={handleSubmit} className="form-row" noValidate>
          <FormField error={errors.locationId}>
            <select
              value={values.locationId}
              onChange={(e) => setValue('locationId', Number(e.target.value))}
            >
              <option value={0} disabled>Выберите локацию</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </FormField>
          <button type="submit" className="primary" disabled={submitting}>Начать ревизию</button>
        </form>
      )}
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Дата</th>
            <th>Локация</th>
            <th>Аудитор</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} align="center">Актов инвентаризации пока нет</td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.auditDate}</td>
                <td>{item.locationName}</td>
                <td>{item.auditor}</td>
                <td><StatusBadge status={item.status} /></td>
                <td>
                  {canManage ? (
                    <StatusActions
                      actions={getStatusActions('audit', item.status)}
                      onChange={(status) => onStatusChange(item.id, status)}
                    />
                  ) : '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
