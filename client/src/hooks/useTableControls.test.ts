import { act, renderHook } from '@testing-library/react';
import { useTableControls } from './useTableControls';

interface Row {
  id: number;
  name: string;
  status: string;
}

const rows: Row[] = [
  { id: 1, name: 'Бета', status: 'Работает' },
  { id: 2, name: 'Альфа', status: 'Простой' },
  { id: 3, name: 'Гамма', status: 'Работает' },
  { id: 4, name: 'Дельта', status: 'Простой' },
  { id: 5, name: 'Эпсилон', status: 'Работает' },
];

const setup = (pageSize = 2) =>
  renderHook(() =>
    useTableControls(rows, {
      search: (row) => [row.name, row.status],
      filters: [
        {
          key: 'status',
          label: 'Статус',
          options: [
            { value: 'Работает', label: 'Работает' },
            { value: 'Простой', label: 'Простой' },
          ],
          getValue: (row) => row.status,
        },
      ],
      sorters: { name: (row) => row.name },
      initialPageSize: pageSize,
    })
  );

describe('useTableControls', () => {
  test('делит записи на страницы', () => {
    const { result } = setup();

    expect(result.current.items.map((row) => row.id)).toEqual([1, 2]);
    expect(result.current.pageCount).toBe(3);
    expect(result.current.from).toBe(1);
    expect(result.current.to).toBe(2);

    act(() => result.current.setPage(2));

    expect(result.current.items.map((row) => row.id)).toEqual([3, 4]);
    expect(result.current.page).toBe(2);
  });

  test('ищет по указанным полям без учёта регистра', () => {
    const { result } = setup();

    act(() => result.current.setSearch('альФА'));

    expect(result.current.items.map((row) => row.id)).toEqual([2]);
    expect(result.current.filteredTotal).toBe(1);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  test('фильтрует по значению и сбрасывает фильтры', () => {
    const { result } = setup();

    act(() => result.current.setFilter('status', 'Простой'));

    expect(result.current.items.map((row) => row.id)).toEqual([2, 4]);
    expect(result.current.page).toBe(1);

    act(() => result.current.resetFilters());

    expect(result.current.filterValues).toEqual({});
    expect(result.current.filteredTotal).toBe(rows.length);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  test('сортирует по возрастанию и убыванию', () => {
    const { result } = setup(10);

    act(() => result.current.toggleSort('name'));

    expect(result.current.items.map((row) => row.name)).toEqual([
      'Альфа',
      'Бета',
      'Гамма',
      'Дельта',
      'Эпсилон',
    ]);

    act(() => result.current.toggleSort('name'));

    expect(result.current.sortDir).toBe('desc');
    expect(result.current.items[0].name).toBe('Эпсилон');
  });

  test('фильтрация возвращает на первую страницу', () => {
    const { result } = setup();

    act(() => result.current.setPage(3));
    act(() => result.current.setFilter('status', 'Простой'));

    expect(result.current.page).toBe(1);
    expect(result.current.items.map((row) => row.id)).toEqual([2, 4]);
  });
});
