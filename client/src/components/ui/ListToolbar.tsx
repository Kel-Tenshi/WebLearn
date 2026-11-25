import React from 'react';
import { Search, X } from 'lucide-react';
import type { FilterOption } from '../../hooks/useTableControls';

export interface ToolbarFilter {
  key: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: ToolbarFilter[];
  hasActiveFilters?: boolean;
  onReset?: () => void;
}

export const ListToolbar: React.FC<Props> = ({
  search,
  onSearchChange,
  placeholder = 'Поиск по записям…',
  filters = [],
  hasActiveFilters = false,
  onReset,
}) => (
  <div className="list-toolbar">
    <div className="list-search">
      <Search size={15} aria-hidden="true" />
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>

    {filters.map((filter) => (
      <select
        key={filter.key}
        className="list-filter"
        value={filter.value}
        onChange={(e) => filter.onChange(e.target.value)}
        aria-label={`Фильтр: ${filter.label}`}
      >
        <option value="">{filter.label}: все</option>
        {filter.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ))}

    {hasActiveFilters && onReset && (
      <button type="button" className="list-reset" onClick={onReset}>
        <X size={14} aria-hidden="true" />
        Сбросить
      </button>
    )}
  </div>
);
