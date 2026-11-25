import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Equipment } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { SortHeader } from '../ui/SortHeader';
import type { SortDir } from '../../hooks/useTableControls';

interface Props {
  items: Equipment[];
  canManage: boolean;
  onEdit: (item: Equipment) => void;
  onDelete: (id: number) => void;
  sortKey?: string | null;
  sortDir?: SortDir;
  onSort?: (key: string) => void;
}

export const EquipmentTable: React.FC<Props> = ({
  items,
  canManage,
  onEdit,
  onDelete,
  sortKey,
  sortDir,
  onSort,
}) => {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <SortHeader label="Инв. №" sortKey="invNumber" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortHeader label="Серийный №" sortKey="serialNumber" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortHeader label="Наименование" sortKey="name" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortHeader label="Категория" sortKey="categoryName" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortHeader label="Локация" sortKey="locationName" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortHeader label="Стоимость" sortKey="purchaseCost" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortHeader label="Статус" sortKey="status" activeKey={sortKey} dir={sortDir} onSort={onSort} />
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
                <td className="cell-nowrap">{item.purchaseCost ? `${item.purchaseCost.toLocaleString()} ₽` : '—'}</td>
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
    </div>
  );
};
