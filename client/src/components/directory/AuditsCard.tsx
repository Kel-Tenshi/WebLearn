import React from 'react';
import { InventoryAudit, LocationItem } from '../../types';
import { FormField } from '../ui/FormField';
import { StatusBadge } from '../ui/StatusBadge';
import { StatusActions } from '../ui/StatusActions';
import { SortHeader } from '../ui/SortHeader';
import { ListToolbar } from '../ui/ListToolbar';
import { Pagination } from '../ui/Pagination';
import { useForm } from '../../hooks/useForm';
import { useTableControls } from '../../hooks/useTableControls';
import { collect, maxTextLength } from '../../utils/validation';
import { getStatusActions } from '../../config/statusMachine';
import { displayPerson } from '../../utils/people';
import { AUDIT_STATUSES, toOptions } from '../../config/lists';

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

  const statusOptions = toOptions(AUDIT_STATUSES);

  const controls = useTableControls(items, {
    search: (item) => [
      item.id,
      item.auditDate,
      item.locationName,
      item.auditor,
      item.auditorName,
      item.status,
      item.notes,
    ],
    filters: [
      {
        key: 'status',
        label: 'Статус',
        options: statusOptions,
        getValue: (item) => item.status,
      },
    ],
    sorters: {
      id: (item) => item.id,
      auditDate: (item) => item.auditDate,
      location: (item) => item.locationName || '',
      auditor: (item) => displayPerson(item.auditorName, item.auditor),
      status: (item) => item.status,
    },
  });

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
      <ListToolbar
        search={controls.search}
        onSearchChange={controls.setSearch}
        placeholder="Найти акт по локации, аудитору, примечанию…"
        hasActiveFilters={controls.hasActiveFilters}
        onReset={controls.resetFilters}
        filters={[
          {
            key: 'status',
            label: 'Статус',
            value: controls.filterValues.status || '',
            options: statusOptions,
            onChange: (value) => controls.setFilter('status', value),
          },
        ]}
      />

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <SortHeader label="ID" sortKey="id" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <SortHeader label="Дата" sortKey="auditDate" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <SortHeader label="Локация" sortKey="location" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <SortHeader label="Аудитор" sortKey="auditor" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <SortHeader label="Статус" sortKey="status" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              {canManage && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {controls.items.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 6 : 5} align="center">Актов инвентаризации не найдено</td>
              </tr>
            ) : (
              controls.items.map((item) => (
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

      <Pagination
        page={controls.page}
        pageCount={controls.pageCount}
        pageSize={controls.pageSize}
        total={controls.total}
        filteredTotal={controls.filteredTotal}
        from={controls.from}
        to={controls.to}
        onPageChange={controls.setPage}
        onPageSizeChange={controls.setPageSize}
      />
    </div>
  );
};
