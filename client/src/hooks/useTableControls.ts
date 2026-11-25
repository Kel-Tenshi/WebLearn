import { useCallback, useMemo, useState } from 'react';

export type SortDir = 'asc' | 'desc';
export type SortValue = string | number | null | undefined;

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDef<T> {
  key: string;
  label: string;
  options: FilterOption[];
  getValue: (item: T) => string | null | undefined;
}

export interface UseTableControlsOptions<T> {
  /** Текст, по которому идёт поиск: строка или набор полей записи. */
  search?: (item: T) => Array<string | number | null | undefined> | string;
  filters?: FilterDef<T>[];
  /** Как получить значение для сортировки по ключу колонки. */
  sorters?: Record<string, (item: T) => SortValue>;
  initialSort?: { key: string; dir: SortDir };
  initialPageSize?: number;
}

export interface TableControls<T> {
  /** Записи текущей страницы после поиска, фильтров и сортировки. */
  items: T[];
  total: number;
  filteredTotal: number;
  page: number;
  pageCount: number;
  pageSize: number;
  from: number;
  to: number;
  search: string;
  setSearch: (value: string) => void;
  filterValues: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  sortKey: string | null;
  sortDir: SortDir;
  toggleSort: (key: string) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

function normalize(values: Array<string | number | null | undefined> | string): string {
  if (typeof values === 'string') return values;
  return values.filter((value) => value !== null && value !== undefined).join(' ');
}

function compareValues(a: SortValue, b: SortValue): number {
  if (a === null || a === undefined) return b === null || b === undefined ? 0 : 1;
  if (b === null || b === undefined) return -1;

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  return String(a).localeCompare(String(b), 'ru', { numeric: true, sensitivity: 'base' });
}

export function useTableControls<T>(
  source: T[],
  options: UseTableControlsOptions<T> = {}
): TableControls<T> {
  const { search: searchFields, filters = [], sorters, initialSort, initialPageSize = 10 } = options;

  const [search, setSearchState] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(initialSort?.key ?? null);
  const [sortDir, setSortDir] = useState<SortDir>(initialSort?.dir ?? 'asc');
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPageState(1);
  }, []);

  const setFilter = useCallback((key: string, value: string) => {
    setFilterValues((current) => ({ ...current, [key]: value }));
    setPageState(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchState('');
    setFilterValues({});
    setPageState(1);
  }, []);

  const toggleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
      setPageState(1);
    },
    [sortKey]
  );

  const setPage = useCallback((next: number) => setPageState(next), []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPageState(1);
  }, []);

  const hasActiveFilters =
    search.trim() !== '' || filters.some((filter) => Boolean(filterValues[filter.key]));

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return source.filter((item) => {
      if (query) {
        if (!searchFields) return false;
        const haystack = normalize(searchFields(item)).toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      for (const filter of filters) {
        const expected = filterValues[filter.key];
        if (!expected) continue;
        if (String(filter.getValue(item) ?? '') !== expected) return false;
      }

      return true;
    });
  }, [source, search, filterValues, filters, searchFields]);

  const sorted = useMemo(() => {
    const getValue = sortKey && sorters ? sorters[sortKey] : undefined;
    if (!getValue) return filtered;

    const direction = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort(
      (a, b) => compareValues(getValue(a), getValue(b)) * direction
    );
  }, [filtered, sortKey, sortDir, sorters]);

  const total = source.length;
  const filteredTotal = sorted.length;
  const pageCount = Math.max(1, Math.ceil(filteredTotal / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);

  return {
    items,
    total,
    filteredTotal,
    page: currentPage,
    pageCount,
    pageSize,
    from: filteredTotal === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, filteredTotal),
    search,
    setSearch,
    filterValues,
    setFilter,
    resetFilters,
    hasActiveFilters,
    sortKey,
    sortDir,
    toggleSort,
    setPage,
    setPageSize,
  };
}
