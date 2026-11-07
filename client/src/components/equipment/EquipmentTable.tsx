import React from 'react';
import { Equipment } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface Props {
  items: Equipment[];
  canManage: boolean;
  onEdit: (item: Equipment) => void;
  onDelete: (id: number) => void;
}

export const EquipmentTable: React.FC<Props> = ({ items, canManage, onEdit, onDelete }) => {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Инв. №</th>
          <th>Серийный №</th>
          <th>Наименование</th>
          <th>Категория</th>
          <th>Локация</th>
          <th>Стоимость</th>
          <th>Статус</th>
          {canManage && <th>Действия</th>}
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr>
            <td colSpan={canManage ? 8 : 7} align="center">Оборудование не найдено</td>
          </tr>
        ) : (
          items.map((item) => (
            <tr key={item.id}>
              <td><code>{item.invNumber}</code></td>
              <td>{item.serialNumber || '—'}</td>
              <td><b>{item.name}</b></td>
              <td>{item.categoryName || '—'}</td>
              <td>{item.locationName || '—'}</td>
              <td>{item.purchaseCost ? `${item.purchaseCost.toLocaleString()} ₽` : '—'}</td>
              <td><StatusBadge status={item.status} /></td>
              {canManage && (
                <td>
                  <button onClick={() => onEdit(item)}>Изм.</button>
                  <button onClick={() => onDelete(item.id)} className="danger">Уд.</button>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};
