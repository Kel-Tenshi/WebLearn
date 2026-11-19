import React from 'react';
import { InventoryAudit, LocationItem } from '../../types';
import { FormField } from '../ui/FormField';
import { StatusBadge } from '../ui/StatusBadge';
import { StatusActions } from '../ui/StatusActions';
import { useForm } from '../../hooks/useForm';
import { collect, maxTextLength } from '../../utils/validation';
import { getStatusActions } from '../../config/statusMachine';
import { displayPerson } from '../../utils/people';

interface AuditData {
  locationId: number;
  auditor?: string;
  notes?: string;
}

interface Props {
  items: InventoryAudit[];
  locations: LocationItem[];
  canManage: boolean;
  onCreate: (data: AuditData) => Promise<void>;
  onStatusChange: (id: number, status: string) => void;
}

interface FormState {
  locationId: number;
  auditor: string;
  notes: string;
}

const EMPTY_FORM: FormState = { locationId: 0, auditor: '', notes: '' };

const validateAudit = (values: FormState) =>
  collect({
    locationId: values.locationId ? undefined : 'Выберите локацию для инвентаризации',
    auditor: maxTextLength(values.auditor, 120, 'Аудитор не должен превышать 120 символов'),
    notes: maxTextLength(values.notes, 300, 'Примечание не должно превышать 300 символов'),
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
      await onCreate({
        locationId: current.locationId,
        auditor: current.auditor.trim() || undefined,
        notes: current.notes.trim() || undefined,
      });
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
          <FormField label="Локация" error={errors.locationId}>
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
          <FormField label="Аудитор" error={errors.auditor}>
            <input
              placeholder="Комиссия или ФИО"
              value={values.auditor}
              onChange={(e) => setValue('auditor', e.target.value)}
            />
          </FormField>
          <FormField label="Примечание" error={errors.notes} className="field-grow">
            <input
              placeholder="Что проверяем"
              value={values.notes}
              onChange={(e) => setValue('notes', e.target.value)}
            />
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
            {canManage && <th>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={canManage ? 6 : 5} align="center">Актов инвентаризации пока нет</td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td className="cell-nowrap">{item.id}</td>
                <td className="cell-nowrap">{item.auditDate}</td>
                <td>{item.locationName}</td>
                <td>{displayPerson(item.auditorName, item.auditor)}</td>
                <td><StatusBadge status={item.status} /></td>
                {canManage && (
                  <td>
                    <StatusActions
                      actions={getStatusActions('audit', item.status)}
                      onChange={(status) => onStatusChange(item.id, status)}
                    />
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
