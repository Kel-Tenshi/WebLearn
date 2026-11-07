import React, { useState } from 'react';
import { InventoryAudit, LocationItem } from '../../types';
import { FormField } from '../ui/FormField';

interface Props {
  items: InventoryAudit[];
  locations: LocationItem[];
  canManage: boolean;
  onCreate: (data: { locationId: number }) => Promise<void>;
  onFinish: (id: number) => void;
}

export const AuditsCard: React.FC<Props> = ({
  items,
  locations,
  canManage,
  onCreate,
  onFinish,
}) => {
  const [locationId, setLocationId] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!locationId) {
      setErrors({ locationId: 'Выберите локацию для инвентаризации' });
      return;
    }

    try {
      await onCreate({ locationId });
      setLocationId(0);
      setErrors({});
    } catch {
      // Ошибку уже показал родительский компонент
    }
  };

  return (
    <div className="card">
      <h3>Акты инвентаризации</h3>
      {canManage && (
        <form onSubmit={handleSubmit} className="form-row" noValidate>
          <FormField error={errors.locationId}>
            <select
              value={locationId}
              onChange={(e) => {
                setLocationId(Number(e.target.value));
                if (errors.locationId) setErrors({});
              }}
            >
              <option value={0} disabled>Выберите локацию</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </FormField>
          <button type="submit" className="primary">Начать ревизию</button>
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
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.auditDate}</td>
              <td>{item.locationName}</td>
              <td>{item.auditor}</td>
              <td><span className="badge">{item.status}</span></td>
              <td>
                {canManage && item.status === 'В процессе' && (
                  <button onClick={() => onFinish(item.id)}>Завершить</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
