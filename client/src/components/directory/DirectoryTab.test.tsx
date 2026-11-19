import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DirectoryTab } from './DirectoryTab';

jest.mock('../../hooks/useDirectory', () => ({
  useDirectory: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useDirectory } = require('../../hooks/useDirectory');

const manager = { id: 3, login: 'manager', role: 'manager' as const, fullName: 'Менеджер' };

function mockDirectory(overrides = {}) {
  const reload = jest.fn().mockResolvedValue(undefined);
  const createDepartment = jest.fn().mockResolvedValue(undefined);
  const createLocation = jest.fn().mockResolvedValue(undefined);
  const createCategory = jest.fn().mockResolvedValue(undefined);
  const createSupplier = jest.fn().mockResolvedValue(undefined);
  const updateDepartment = jest.fn().mockResolvedValue(undefined);
  const deleteDepartment = jest.fn().mockResolvedValue(undefined);

  useDirectory.mockReturnValue({
    departments: [],
    locations: [],
    categories: [],
    suppliers: [],
    loading: false,
    error: null,
    reload,
    createDepartment,
    createLocation,
    createCategory,
    createSupplier,
    updateDepartment,
    updateLocation: jest.fn().mockResolvedValue(undefined),
    updateCategory: jest.fn().mockResolvedValue(undefined),
    updateSupplier: jest.fn().mockResolvedValue(undefined),
    deleteDepartment,
    deleteLocation: jest.fn().mockResolvedValue(undefined),
    deleteCategory: jest.fn().mockResolvedValue(undefined),
    deleteSupplier: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  return {
    reload,
    createDepartment,
    createLocation,
    createCategory,
    createSupplier,
    updateDepartment,
    deleteDepartment,
  };
}

describe('DirectoryTab', () => {
  beforeEach(() => {
    useDirectory.mockReset();
  });

  test('показывает все четыре справочника', () => {
    mockDirectory();
    render(<DirectoryTab user={manager} />);

    expect(screen.getByRole('heading', { name: 'Подразделения' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Локации' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Категории оборудования' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Поставщики' })).toBeInTheDocument();
  });

  test('создание подразделения вызывает API и перезагрузку', async () => {
    const { createDepartment, reload } = mockDirectory();
    render(<DirectoryTab user={manager} />);

    const card = screen.getByRole('heading', { name: 'Подразделения' }).closest('.card') as HTMLElement;

    await userEvent.type(within(card).getByPlaceholderText('Код'), 'DEP-QA');
    await userEvent.type(within(card).getByPlaceholderText('Название'), 'Отдел тестирования');
    await userEvent.click(
      within(card).getByRole('button', { name: 'Добавить подразделение' })
    );

    await waitFor(() => {
      expect(createDepartment).toHaveBeenCalledWith({
        code: 'DEP-QA',
        name: 'Отдел тестирования',
      });
      expect(reload).toHaveBeenCalled();
    });
  });

  test('сотрудник не видит форм добавления', () => {
    mockDirectory();
    render(<DirectoryTab user={{ ...manager, role: 'employee' }} />);

    expect(
      screen.queryByRole('button', { name: 'Добавить подразделение' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Добавить локацию' })).not.toBeInTheDocument();
  });
});
