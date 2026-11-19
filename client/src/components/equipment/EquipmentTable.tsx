import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
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
              <td className="cell-nowrap"><code>{item.invNumber}</code></td>
              <td className="cell-nowrap">{item.serialNumber || '—'}</td>
              <td><b>{item.name}</b></td>
              <td>{item.categoryName || '—'}</td>
              <td>{item.locationName || '—'}</td>
              <td>{item.purchaseCost ? `${item.purchaseCost.toLocaleString()} ₽` : '—'}</td>
              <td><StatusBadge status={item.status} /></td>
              {canManage && (
                <td>
                  <div className="table-actions">
                    <button
                      type="button"
                      className="icon-action"
                      onClick={() => onEdit(item)}
                      aria-label={`Изменить: ${item.name}`}
                      title="Изменить"
                    >
                      <Pencil size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="icon-action danger"
                      onClick={() => onDelete(item.id)}
                      aria-label={`Удалить: ${item.name}`}
                      title="Удалить"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};
