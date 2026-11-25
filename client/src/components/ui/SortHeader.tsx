import React from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import type { SortDir } from '../../hooks/useTableControls';

interface Props {
  label: string;
  sortKey?: string | null;
  activeKey?: string | null;
  dir?: SortDir;
  onSort?: (key: string) => void;
  className?: string;
  colSpan?: number;
  title?: string;
}

export const SortHeader: React.FC<Props> = ({
  label,
  sortKey,
  activeKey,
  dir = 'asc',
  onSort,
  className,
  colSpan,
  title,
}) => {
  const canSort = Boolean(onSort && sortKey);
  const active = canSort && activeKey === sortKey;
  const sortState = active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none';

  const handleSort = () => {
    if (!canSort || !sortKey || !onSort) return;
    onSort(sortKey);
  };

  return (
    <th
      colSpan={colSpan}
      className={[className, canSort ? 'sortable' : '', active ? 'sorted' : '']
        .filter(Boolean)
        .join(' ')}
      aria-sort={canSort ? sortState : undefined}
      tabIndex={canSort ? 0 : undefined}
      title={title || (canSort ? 'Нажмите для сортировки' : undefined)}
      onClick={canSort ? handleSort : undefined}
      onKeyDown={
        canSort
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleSort();
              }
            }
          : undefined
      }
    >
      <span className="sort-label">
        {label}
        {canSort &&
          (active ? (
            dir === 'asc' ? (
              <ChevronUp size={13} aria-hidden="true" />
            ) : (
              <ChevronDown size={13} aria-hidden="true" />
            )
          ) : (
            <ChevronsUpDown size={13} aria-hidden="true" className="sort-icon-muted" />
          ))}
      </span>
    </th>
  );
};
