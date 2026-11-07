import React from 'react';
import { Supplier, User } from '../../types';
import { useDirectory } from '../../hooks/useDirectory';
import { useAlert } from '../../context/AlertContext';
import { DepartmentsCard } from './DepartmentsCard';
import { LocationsCard } from './LocationsCard';
import { CategoriesCard } from './CategoriesCard';
import { SuppliersCard } from './SuppliersCard';
import { Loading } from '../ui/Loading';

export const DirectoryTab: React.FC<{ user: User }> = ({ user }) => {
  const { showAlert, showApiError } = useAlert();
  const {
    departments,
    locations,
    categories,
    suppliers,
    loading,
    reload,
    createDepartment,
    createLocation,
    createCategory,
    createSupplier,
  } = useDirectory();

  const canManage = user.role === 'manager' || user.role === 'admin';

  const runCreate = async (action: () => Promise<unknown>, successMessage: string) => {
    try {
      await action();
      showAlert(successMessage, 'success');
      await reload();
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="tab-container">
        <h2>Справочники</h2>
        <Loading label="Загрузка справочников…" />
      </div>
    );
  }

  return (
    <div className="tab-container">
      <h2>Справочники</h2>

      <div className="grid-3">
        <DepartmentsCard
          items={departments}
          canManage={canManage}
          onCreate={(data) => runCreate(() => createDepartment(data), 'Подразделение добавлено')}
        />
        <LocationsCard
          items={locations}
          departments={departments}
          canManage={canManage}
          onCreate={(data) => runCreate(() => createLocation(data), 'Локация добавлена')}
        />
        <CategoriesCard
          items={categories}
          canManage={canManage}
          onCreate={(data) => runCreate(() => createCategory(data), 'Категория добавлена')}
        />
        <SuppliersCard
          items={suppliers}
          canManage={canManage}
          onCreate={(data: Partial<Supplier>) =>
            runCreate(() => createSupplier(data), 'Поставщик добавлен')
          }
        />
      </div>
    </div>
  );
};
